import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, SectionList, RefreshControl, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { AlertCard } from "@/components/AlertCard";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getAlerts, markAlertRead, markAllAlertsRead, dismissAlert } from "@/lib/storage";
import type { Alert, AlertSeverity } from "@/lib/types";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface AlertSection {
  title: string;
  data: Alert[];
  severity: AlertSeverity;
}

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadData = useCallback(async () => {
    const alertsData = await getAlerts();
    setAlerts(alertsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleMarkAllRead = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updatedAlerts = await markAllAlertsRead();
    setAlerts(updatedAlerts);
  };

  const handleDismiss = async (alertId: string) => {
    const updatedAlerts = await dismissAlert(alertId);
    setAlerts(updatedAlerts);
  };

  const handleAlertPress = async (alertId: string) => {
    const updatedAlerts = await markAlertRead(alertId);
    setAlerts(updatedAlerts);
  };

  const sections: AlertSection[] = [
    {
      title: "Critical",
      data: alerts.filter((a) => a.severity === "critical"),
      severity: "critical",
    },
    {
      title: "Warnings",
      data: alerts.filter((a) => a.severity === "warning"),
      severity: "warning",
    },
    {
      title: "Information",
      data: alerts.filter((a) => a.severity === "info"),
      severity: "info",
    },
  ].filter((section) => section.data.length > 0);

  const unreadCount = alerts.filter((a) => !a.read).length;

  const renderSectionHeader = ({ section }: { section: AlertSection }) => {
    const color =
      section.severity === "critical"
        ? Colors.dark.error
        : section.severity === "warning"
          ? Colors.dark.warning
          : Colors.dark.accent;

    return (
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionDot, { backgroundColor: color }]} />
        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
        <ThemedText style={styles.sectionCount}>{section.data.length}</ThemedText>
      </View>
    );
  };

  const renderItem = ({ item }: { item: Alert }) => (
    <AlertCard
      alert={item}
      onPress={() => handleAlertPress(item.id)}
      onDismiss={() => handleDismiss(item.id)}
    />
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Image
        source={require("../../attached_assets/generated_images/no_alerts_empty_state.png")}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText style={styles.emptyTitle}>All Clear</ThemedText>
      <ThemedText style={styles.emptyText}>
        No alerts at the moment. Your system is running smoothly.
      </ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <View style={styles.headerRow}>
          <ThemedText style={styles.title}>Alerts</ThemedText>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate("LogViewer", {})}
              style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
            >
              <Feather name="file-text" size={20} color={Colors.dark.text} />
            </Pressable>
            {unreadCount > 0 ? (
              <Pressable
                onPress={handleMarkAllRead}
                style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
              >
                <Feather name="check-circle" size={20} color={Colors.dark.accent} />
              </Pressable>
            ) : null}
          </View>
        </View>
        {unreadCount > 0 ? (
          <ThemedText style={styles.unreadText}>
            {unreadCount} unread alert{unreadCount > 1 ? "s" : ""}
          </ThemedText>
        ) : null}
      </View>

      <SectionList
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: tabBarHeight + Spacing.xl },
          alerts.length === 0 && styles.emptyList,
        ]}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.accent}
          />
        }
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.backgroundDefault,
    alignItems: "center",
    justifyContent: "center",
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  unreadText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  emptyList: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    flex: 1,
  },
  sectionCount: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    backgroundColor: Colors.dark.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyImage: {
    width: 120,
    height: 120,
    opacity: 0.8,
    marginBottom: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: "center",
    maxWidth: 250,
  },
});

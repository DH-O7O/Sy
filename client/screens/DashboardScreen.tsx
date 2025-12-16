import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { HeaderTitle } from "@/components/HeaderTitle";
import { MetricCard } from "@/components/MetricCard";
import { StatusIndicator } from "@/components/StatusIndicator";
import { DeploymentCard } from "@/components/DeploymentCard";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { QuickActionButton } from "@/components/QuickActionButton";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getMetrics, getDeployments, getConnections, getAgents, getAlerts } from "@/lib/storage";
import type { SystemMetrics, Deployment, ApiConnection, Agent, Alert } from "@/lib/types";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [connections, setConnections] = useState<ApiConnection[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const loadData = useCallback(async () => {
    const [metricsData, deploymentsData, connectionsData, agentsData, alertsData] = await Promise.all([
      getMetrics(),
      getDeployments(),
      getConnections(),
      getAgents(),
      getAlerts(),
    ]);
    setMetrics(metricsData);
    setDeployments(deploymentsData.slice(0, 5));
    setConnections(connectionsData);
    setAgents(agentsData);
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

  const runningAgents = agents.filter(a => a.status === "running").length;
  const unreadAlerts = alerts.filter(a => !a.read).length;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.accent}
          />
        }
      >
        <View style={styles.header}>
          <HeaderTitle />
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.navigate("Settings")}
              style={({ pressed }) => [styles.headerButton, pressed && styles.headerButtonPressed]}
            >
              <Feather name="settings" size={22} color={Colors.dark.text} />
            </Pressable>
          </View>
        </View>

        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <StatusIndicator status={metrics?.systemStatus || "online"} size="large" />
            <ThemedText style={styles.statusTitle}>System Status</ThemedText>
          </View>
          <ThemedText style={styles.statusDescription}>
            All systems operational. {runningAgents} of {agents.length} agents running.
          </ThemedText>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard
            title="CPU Usage"
            value={metrics?.cpu || 0}
            suffix="%"
            icon="cpu"
            color={Colors.dark.accent}
          />
          <MetricCard
            title="Memory"
            value={metrics?.memory || 0}
            suffix="%"
            icon="hard-drive"
            color={Colors.dark.success}
          />
        </View>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Active Agents"
            value={runningAgents}
            icon="activity"
            color={Colors.dark.warning}
          />
          <MetricCard
            title="Deployments"
            value={metrics?.deploymentsToday || 0}
            icon="upload-cloud"
            color="#A78BFA"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Recent Deployments</ThemedText>
            <Pressable
              onPress={() => navigation.navigate("DeploymentHistory")}
              style={({ pressed }) => pressed && styles.linkPressed}
            >
              <ThemedText style={styles.seeAll}>See All</ThemedText>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {deployments.map((deployment) => (
              <DeploymentCard key={deployment.id} deployment={deployment} compact />
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quick Actions</ThemedText>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="upload-cloud"
              label="Deploy"
              color={Colors.dark.accent}
              onPress={() => navigation.navigate("DeployModal")}
            />
            <QuickActionButton
              icon="save"
              label="Backup"
              color={Colors.dark.success}
              onPress={() => {}}
            />
            <QuickActionButton
              icon="activity"
              label="Health"
              color={Colors.dark.warning}
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>API Connections</ThemedText>
          <View style={styles.connectionsGrid}>
            {connections.map((connection) => (
              <ConnectionStatus key={connection.id} connection={connection} />
            ))}
          </View>
        </View>

        {unreadAlerts > 0 ? (
          <Pressable
            style={({ pressed }) => [styles.alertBanner, pressed && styles.alertBannerPressed]}
            onPress={() => navigation.getParent()?.navigate("AlertsTab")}
          >
            <View style={styles.alertBannerContent}>
              <Feather name="bell" size={18} color={Colors.dark.warning} />
              <ThemedText style={styles.alertBannerText}>
                {unreadAlerts} unread alert{unreadAlerts > 1 ? "s" : ""} require attention
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.dark.textSecondary} />
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.md,
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
  statusCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  statusDescription: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.dark.accent,
  },
  linkPressed: {
    opacity: 0.7,
  },
  horizontalList: {
    paddingRight: Spacing.lg,
  },
  quickActions: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  connectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.warning + "15",
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.dark.warning + "30",
  },
  alertBannerPressed: {
    opacity: 0.8,
  },
  alertBannerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  alertBannerText: {
    fontSize: 14,
    color: Colors.dark.warning,
    fontWeight: "500",
  },
});

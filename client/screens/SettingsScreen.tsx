import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, Switch, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { clearAllData } from "@/lib/storage";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface SettingItemProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  destructive?: boolean;
}

function SettingItem({ icon, title, subtitle, onPress, rightElement, destructive }: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.settingItem, pressed && styles.settingItemPressed]}
    >
      <View style={[styles.settingIcon, destructive && styles.settingIconDestructive]}>
        <Feather
          name={icon}
          size={20}
          color={destructive ? Colors.dark.error : Colors.dark.accent}
        />
      </View>
      <View style={styles.settingContent}>
        <ThemedText style={[styles.settingTitle, destructive && styles.settingTitleDestructive]}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText style={styles.settingSubtitle}>{subtitle}</ThemedText>
        ) : null}
      </View>
      {rightElement ? (
        rightElement
      ) : onPress ? (
        <Feather name="chevron-right" size={20} color={Colors.dark.textTertiary} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [haptics, setHaptics] = useState(true);

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await clearAllData();
          Alert.alert("Logged Out", "You have been logged out successfully.");
        },
      },
    ]);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear All Data",
      "This will reset all local data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Data",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert("Data Cleared", "All local data has been reset.");
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Feather name="user" size={32} color={Colors.dark.text} />
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>Admin User</ThemedText>
            <View style={styles.roleBadge}>
              <ThemedText style={styles.roleText}>Administrator</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Preferences</ThemedText>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="bell"
              title="Push Notifications"
              subtitle="Receive alerts for critical events"
              rightElement={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: Colors.dark.backgroundSecondary, true: Colors.dark.accent }}
                  thumbColor={Colors.dark.text}
                />
              }
            />
            <SettingItem
              icon="moon"
              title="Dark Mode"
              subtitle="Always enabled for enterprise theme"
              rightElement={
                <Switch
                  value={darkMode}
                  onValueChange={setDarkMode}
                  trackColor={{ false: Colors.dark.backgroundSecondary, true: Colors.dark.accent }}
                  thumbColor={Colors.dark.text}
                  disabled
                />
              }
            />
            <SettingItem
              icon="smartphone"
              title="Haptic Feedback"
              subtitle="Vibration on interactions"
              rightElement={
                <Switch
                  value={haptics}
                  onValueChange={setHaptics}
                  trackColor={{ false: Colors.dark.backgroundSecondary, true: Colors.dark.accent }}
                  thumbColor={Colors.dark.text}
                />
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>System</ThemedText>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="key"
              title="API Keys"
              subtitle="Manage connected services"
              onPress={() => {}}
            />
            <SettingItem
              icon="file-text"
              title="Logs"
              subtitle="View system logs"
              onPress={() => navigation.navigate("LogViewer", {})}
            />
            <SettingItem
              icon="info"
              title="About"
              subtitle="Version 2.0.0-Enterprise"
              onPress={() => {}}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
          <View style={styles.sectionContent}>
            <SettingItem
              icon="trash-2"
              title="Clear Local Data"
              subtitle="Reset all cached data"
              onPress={handleClearData}
              destructive
            />
            <SettingItem
              icon="log-out"
              title="Log Out"
              onPress={handleLogout}
              destructive
            />
          </View>
        </View>
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
    paddingTop: Spacing.xl,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.backgroundSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  roleBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.dark.accent + "20",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
  },
  roleText: {
    fontSize: 12,
    color: Colors.dark.accent,
    fontWeight: "500",
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSecondary,
  },
  settingItemPressed: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.accent + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingIconDestructive: {
    backgroundColor: Colors.dark.error + "20",
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    color: Colors.dark.text,
    fontWeight: "500",
  },
  settingTitleDestructive: {
    color: Colors.dark.error,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});

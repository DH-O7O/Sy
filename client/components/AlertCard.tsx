import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { Alert, AlertSeverity } from "@/lib/types";

interface AlertCardProps {
  alert: Alert;
  onPress?: () => void;
  onDismiss?: () => void;
}

const getSeverityConfig = (severity: AlertSeverity): { color: string; icon: keyof typeof Feather.glyphMap } => {
  switch (severity) {
    case "critical":
      return { color: Colors.dark.error, icon: "alert-circle" };
    case "warning":
      return { color: Colors.dark.warning, icon: "alert-triangle" };
    case "info":
      return { color: Colors.dark.accent, icon: "info" };
    default:
      return { color: Colors.dark.textSecondary, icon: "info" };
  }
};

const formatTimeAgo = (timestamp: string): string => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export function AlertCard({ alert, onPress, onDismiss }: AlertCardProps) {
  const { color, icon } = getSeverityConfig(alert.severity);

  const handleDismiss = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss?.();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        !alert.read && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={[styles.severity, { color }]}>
            {alert.severity.toUpperCase()}
          </ThemedText>
          <ThemedText style={styles.time}>{formatTimeAgo(alert.timestamp)}</ThemedText>
        </View>
        <ThemedText style={styles.message} numberOfLines={2}>
          {alert.message}
        </ThemedText>
        <ThemedText style={styles.source}>Source: {alert.source}</ThemedText>
      </View>
      <Pressable
        onPress={handleDismiss}
        hitSlop={8}
        style={({ pressed }) => [styles.dismissButton, pressed && styles.dismissPressed]}
      >
        <Feather name="x" size={18} color={Colors.dark.textTertiary} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  unread: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.dark.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  severity: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 11,
    color: Colors.dark.textTertiary,
  },
  message: {
    fontSize: 14,
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  source: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
  },
  dismissButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  dismissPressed: {
    opacity: 0.5,
  },
});

import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { Deployment, DeploymentStatus } from "@/lib/types";

interface DeploymentCardProps {
  deployment: Deployment;
  onPress?: () => void;
  compact?: boolean;
}

const getStatusConfig = (status: DeploymentStatus): { color: string; icon: keyof typeof Feather.glyphMap } => {
  switch (status) {
    case "success":
      return { color: Colors.dark.success, icon: "check-circle" };
    case "failed":
      return { color: Colors.dark.error, icon: "x-circle" };
    case "in_progress":
      return { color: Colors.dark.warning, icon: "loader" };
    case "pending":
      return { color: Colors.dark.textSecondary, icon: "clock" };
    default:
      return { color: Colors.dark.textSecondary, icon: "circle" };
  }
};

const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export function DeploymentCard({ deployment, onPress, compact = false }: DeploymentCardProps) {
  const { color, icon } = getStatusConfig(deployment.status);

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.compactContainer, pressed && styles.pressed]}
      >
        <View style={[styles.statusDot, { backgroundColor: color }]} />
        <View style={styles.compactContent}>
          <ThemedText style={styles.compactName} numberOfLines={1}>
            {deployment.name}
          </ThemedText>
          <ThemedText style={styles.compactTime}>{formatTime(deployment.timestamp)}</ThemedText>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + "20" }]}>
        <Feather name={icon} size={20} color={color} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.name}>{deployment.name}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: color + "20" }]}>
            <ThemedText style={[styles.statusText, { color }]}>
              {deployment.status.replace("_", " ").toUpperCase()}
            </ThemedText>
          </View>
        </View>
        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Feather name="clock" size={12} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.detailText}>{deployment.duration}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Feather name="user" size={12} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.detailText}>{deployment.deployedBy}</ThemedText>
          </View>
          <View style={styles.detailItem}>
            <Feather name="server" size={12} color={Colors.dark.textSecondary} />
            <ThemedText style={styles.detailText}>{deployment.environment}</ThemedText>
          </View>
        </View>
      </View>
      <Feather name="chevron-right" size={20} color={Colors.dark.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    marginRight: Spacing.md,
    minWidth: 140,
  },
  pressed: {
    opacity: 0.8,
  },
  iconContainer: {
    width: 44,
    height: 44,
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
    marginBottom: Spacing.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginLeft: Spacing.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  details: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  compactContent: {
    flex: 1,
  },
  compactName: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.dark.text,
  },
  compactTime: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginTop: 2,
  },
});

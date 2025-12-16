import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { ApiConnection } from "@/lib/types";

interface ConnectionStatusProps {
  connection: ApiConnection;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "connected":
      return Colors.dark.success;
    case "disconnected":
      return Colors.dark.textTertiary;
    case "error":
      return Colors.dark.error;
    default:
      return Colors.dark.textSecondary;
  }
};

export function ConnectionStatus({ connection }: ConnectionStatusProps) {
  const color = getStatusColor(connection.status);

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <ThemedText style={styles.name}>{connection.name}</ThemedText>
      <Feather
        name={connection.status === "connected" ? "check" : "x"}
        size={14}
        color={color}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  name: {
    fontSize: 12,
    color: Colors.dark.text,
    marginRight: Spacing.sm,
  },
});

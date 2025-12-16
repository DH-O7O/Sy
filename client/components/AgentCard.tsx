import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import type { Agent, AgentType } from "@/lib/types";

interface AgentCardProps {
  agent: Agent;
  onPress?: () => void;
  onStart?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
}

const getAgentTypeIcon = (type: AgentType): keyof typeof Feather.glyphMap => {
  switch (type) {
    case "orchestrator":
      return "cpu";
    case "worker":
      return "settings";
    case "monitor":
      return "activity";
    case "analytics":
      return "bar-chart-2";
    default:
      return "box";
  }
};

const getAgentTypeBadgeColor = (type: AgentType): string => {
  switch (type) {
    case "orchestrator":
      return Colors.dark.accent;
    case "worker":
      return Colors.dark.success;
    case "monitor":
      return Colors.dark.warning;
    case "analytics":
      return "#A78BFA";
    default:
      return Colors.dark.textSecondary;
  }
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AgentCard({ agent, onPress, onStart, onStop, onRestart }: AgentCardProps) {
  const scale = useSharedValue(1);
  const typeColor = getAgentTypeBadgeColor(agent.type);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handleAction = async (action: () => void | undefined) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action?.();
  };

  const isRunning = agent.status === "running";
  const isStopped = agent.status === "stopped" || agent.status === "error";

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, animatedStyle]}
    >
      <View style={styles.header}>
        <View style={[styles.typeIconContainer, { backgroundColor: typeColor + "20" }]}>
          <Feather name={getAgentTypeIcon(agent.type)} size={20} color={typeColor} />
        </View>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.name}>{agent.name}</ThemedText>
          <View style={[styles.typeBadge, { backgroundColor: typeColor + "30" }]}>
            <ThemedText style={[styles.typeText, { color: typeColor }]}>
              {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
            </ThemedText>
          </View>
        </View>
        <StatusIndicator status={agent.status} size="small" showLabel={false} />
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <ThemedText style={styles.metricLabel}>CPU</ThemedText>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${agent.cpu}%`, backgroundColor: Colors.dark.accent }]} />
          </View>
          <ThemedText style={styles.metricValue}>{agent.cpu}%</ThemedText>
        </View>
        <View style={styles.metric}>
          <ThemedText style={styles.metricLabel}>Memory</ThemedText>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${agent.memory}%`,
                  backgroundColor: agent.memory > 80 ? Colors.dark.error : Colors.dark.success,
                },
              ]}
            />
          </View>
          <ThemedText style={styles.metricValue}>{agent.memory}%</ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <ThemedText style={styles.uptime}>Uptime: {agent.uptime}</ThemedText>
        <View style={styles.actions}>
          {isStopped ? (
            <Pressable
              onPress={() => handleAction(() => onStart?.())}
              style={({ pressed }) => [styles.actionButton, styles.startButton, pressed && styles.actionPressed]}
            >
              <Feather name="play" size={16} color={Colors.dark.success} />
            </Pressable>
          ) : null}
          {isRunning ? (
            <Pressable
              onPress={() => handleAction(() => onStop?.())}
              style={({ pressed }) => [styles.actionButton, styles.stopButton, pressed && styles.actionPressed]}
            >
              <Feather name="square" size={16} color={Colors.dark.error} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => handleAction(() => onRestart?.())}
            style={({ pressed }) => [styles.actionButton, styles.restartButton, pressed && styles.actionPressed]}
          >
            <Feather name="refresh-cw" size={16} color={Colors.dark.warning} />
          </Pressable>
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  typeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  typeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  metricsRow: {
    flexDirection: "row",
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  metric: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 2,
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  metricValue: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  uptime: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  startButton: {
    backgroundColor: Colors.dark.success + "20",
  },
  stopButton: {
    backgroundColor: Colors.dark.error + "20",
  },
  restartButton: {
    backgroundColor: Colors.dark.warning + "20",
  },
  actionPressed: {
    opacity: 0.7,
  },
});

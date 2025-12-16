import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { StatusIndicator } from "@/components/StatusIndicator";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";
import { getAgents, updateAgent } from "@/lib/storage";
import type { Agent } from "@/lib/types";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type AgentDetailRouteProp = RouteProp<RootStackParamList, "AgentDetail">;

const TABS = ["Overview", "Metrics", "Logs"];

const SAMPLE_LOGS = [
  { time: "12:45:32", level: "INFO", message: "Agent initialized successfully" },
  { time: "12:45:35", level: "INFO", message: "Connected to orchestrator" },
  { time: "12:46:01", level: "DEBUG", message: "Processing batch #4521" },
  { time: "12:46:15", level: "INFO", message: "Batch completed in 14.2s" },
  { time: "12:47:00", level: "WARN", message: "Memory usage above 50%" },
  { time: "12:48:22", level: "INFO", message: "Health check passed" },
];

function MetricGauge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={gaugeStyles.container}>
      <View style={gaugeStyles.circle}>
        <View
          style={[
            gaugeStyles.fill,
            {
              backgroundColor: color,
              height: `${value}%`,
            },
          ]}
        />
        <ThemedText style={gaugeStyles.value}>{value}%</ThemedText>
      </View>
      <ThemedText style={gaugeStyles.label}>{label}</ThemedText>
    </View>
  );
}

const gaugeStyles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.dark.backgroundSecondary,
    overflow: "hidden",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  fill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.4,
  },
  value: {
    position: "absolute",
    fontSize: 18,
    fontWeight: "700",
    color: Colors.dark.text,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  label: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.sm,
  },
});

export default function AgentDetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<AgentDetailRouteProp>();
  const navigation = useNavigation();
  const { agentId } = route.params;

  const [agent, setAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  const loadAgent = useCallback(async () => {
    const agents = await getAgents();
    const found = agents.find((a) => a.id === agentId);
    if (found) setAgent(found);
  }, [agentId]);

  useEffect(() => {
    loadAgent();
  }, [loadAgent]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateAgent(agentId, { status: "running", cpu: 15, memory: 25, uptime: "0m" });
    loadAgent();
  };

  const handleStop = () => {
    Alert.alert("Stop Agent", `Are you sure you want to stop ${agent?.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Stop",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await updateAgent(agentId, { status: "stopped", cpu: 0, memory: 0, uptime: "0m" });
          loadAgent();
        },
      },
    ]);
  };

  const handleRestart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await updateAgent(agentId, { status: "starting" });
    loadAgent();
    setTimeout(async () => {
      await updateAgent(agentId, { status: "running", cpu: 10, memory: 20, uptime: "0m" });
      loadAgent();
    }, 2000);
  };

  if (!agent) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  const isRunning = agent.status === "running";
  const isStopped = agent.status === "stopped" || agent.status === "error";

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl + 80 },
        ]}
      >
        <View style={styles.statusBanner}>
          <StatusIndicator status={agent.status} size="large" />
          <ThemedText style={styles.uptime}>Uptime: {agent.uptime}</ThemedText>
        </View>

        <View style={styles.tabs}>
          {TABS.map((tab, index) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(index)}
              style={[styles.tab, activeTab === index && styles.tabActive]}
            >
              <ThemedText
                style={[styles.tabText, activeTab === index && styles.tabTextActive]}
              >
                {tab}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {activeTab === 0 ? (
          <View style={styles.overviewContent}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Agent ID</ThemedText>
                <ThemedText style={styles.infoValue}>{agent.id}</ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Type</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {agent.type.charAt(0).toUpperCase() + agent.type.slice(1)}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <ThemedText style={styles.infoLabel}>Last Updated</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {new Date(agent.lastUpdated).toLocaleString()}
                </ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        {activeTab === 1 ? (
          <View style={styles.metricsContent}>
            <View style={styles.gaugesRow}>
              <MetricGauge label="CPU" value={agent.cpu} color={Colors.dark.accent} />
              <MetricGauge label="Memory" value={agent.memory} color={Colors.dark.success} />
              <MetricGauge label="Disk" value={38} color={Colors.dark.warning} />
            </View>
          </View>
        ) : null}

        {activeTab === 2 ? (
          <View style={styles.logsContent}>
            {SAMPLE_LOGS.map((log, index) => (
              <View key={index} style={styles.logEntry}>
                <ThemedText style={styles.logTime}>{log.time}</ThemedText>
                <ThemedText
                  style={[
                    styles.logLevel,
                    {
                      color:
                        log.level === "WARN"
                          ? Colors.dark.warning
                          : log.level === "ERROR"
                            ? Colors.dark.error
                            : Colors.dark.textSecondary,
                    },
                  ]}
                >
                  [{log.level}]
                </ThemedText>
                <ThemedText style={styles.logMessage} numberOfLines={1}>
                  {log.message}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.lg }]}>
        {isStopped ? (
          <Button onPress={handleStart} style={styles.actionButton}>
            Start Agent
          </Button>
        ) : isRunning ? (
          <View style={styles.footerButtons}>
            <Pressable
              onPress={handleStop}
              style={({ pressed }) => [styles.stopButton, pressed && styles.buttonPressed]}
            >
              <Feather name="square" size={20} color={Colors.dark.error} />
              <ThemedText style={styles.stopButtonText}>Stop</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleRestart}
              style={({ pressed }) => [styles.restartButton, pressed && styles.buttonPressed]}
            >
              <Feather name="refresh-cw" size={20} color={Colors.dark.warning} />
              <ThemedText style={styles.restartButtonText}>Restart</ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  uptime: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  tabActive: {
    backgroundColor: Colors.dark.backgroundSecondary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  tabTextActive: {
    color: Colors.dark.text,
    fontWeight: "600",
  },
  overviewContent: {},
  infoCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xl,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: "500",
  },
  metricsContent: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xl,
  },
  gaugesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  logsContent: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
  },
  logEntry: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundSecondary,
  },
  logTime: {
    fontSize: 11,
    fontFamily: Fonts?.mono,
    color: Colors.dark.textTertiary,
    marginRight: Spacing.sm,
  },
  logLevel: {
    fontSize: 11,
    fontFamily: Fonts?.mono,
    fontWeight: "600",
    marginRight: Spacing.sm,
    minWidth: 50,
  },
  logMessage: {
    flex: 1,
    fontSize: 12,
    fontFamily: Fonts?.mono,
    color: Colors.dark.text,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.dark.backgroundRoot,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.backgroundDefault,
  },
  footerButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  stopButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.error + "20",
    borderRadius: BorderRadius.full,
    height: Spacing.buttonHeight,
  },
  stopButtonText: {
    color: Colors.dark.error,
    fontWeight: "600",
  },
  restartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.dark.warning + "20",
    borderRadius: BorderRadius.full,
    height: Spacing.buttonHeight,
  },
  restartButtonText: {
    color: Colors.dark.warning,
    fontWeight: "600",
  },
  buttonPressed: {
    opacity: 0.7,
  },
});

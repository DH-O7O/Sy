import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getMetrics, getDeployments, getAgents } from "@/lib/storage";
import type { SystemMetrics, Deployment } from "@/lib/types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - Spacing.lg * 2;

interface ChartData {
  label: string;
  value: number;
  color: string;
}

function SimpleBarChart({ data, maxValue }: { data: ChartData[]; maxValue: number }) {
  return (
    <View style={chartStyles.container}>
      {data.map((item, index) => (
        <View key={index} style={chartStyles.barContainer}>
          <View style={chartStyles.barWrapper}>
            <View
              style={[
                chartStyles.bar,
                {
                  height: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color,
                },
              ]}
            />
          </View>
          <ThemedText style={chartStyles.barLabel}>{item.label}</ThemedText>
          <ThemedText style={chartStyles.barValue}>{item.value}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 160,
    paddingTop: Spacing.lg,
  },
  barContainer: {
    flex: 1,
    alignItems: "center",
  },
  barWrapper: {
    width: 32,
    height: 120,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 4,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
  },
  barValue: {
    fontSize: 12,
    color: Colors.dark.text,
    fontWeight: "600",
  },
});

function MetricProgress({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={progressStyles.container}>
      <View style={progressStyles.header}>
        <ThemedText style={progressStyles.label}>{label}</ThemedText>
        <ThemedText style={[progressStyles.value, { color }]}>{value}%</ThemedText>
      </View>
      <View style={progressStyles.track}>
        <View style={[progressStyles.fill, { width: `${value}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const progressStyles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
  },
  track: {
    height: 8,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [refreshing, setRefreshing] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [agentStats, setAgentStats] = useState({ running: 0, stopped: 0, error: 0 });

  const loadData = useCallback(async () => {
    const [metricsData, deploymentsData, agentsData] = await Promise.all([
      getMetrics(),
      getDeployments(),
      getAgents(),
    ]);
    setMetrics(metricsData);
    setDeployments(deploymentsData);
    setAgentStats({
      running: agentsData.filter(a => a.status === "running").length,
      stopped: agentsData.filter(a => a.status === "stopped").length,
      error: agentsData.filter(a => a.status === "error").length,
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const deploymentsByStatus = [
    { label: "Success", value: deployments.filter(d => d.status === "success").length, color: Colors.dark.success },
    { label: "Failed", value: deployments.filter(d => d.status === "failed").length, color: Colors.dark.error },
    { label: "Pending", value: deployments.filter(d => d.status === "pending").length, color: Colors.dark.textSecondary },
  ];

  const agentStatusData = [
    { label: "Running", value: agentStats.running, color: Colors.dark.success },
    { label: "Stopped", value: agentStats.stopped, color: Colors.dark.textTertiary },
    { label: "Error", value: agentStats.error, color: Colors.dark.error },
  ];

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
        <ThemedText style={styles.title}>Analytics</ThemedText>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="activity" size={20} color={Colors.dark.accent} />
            <ThemedText style={styles.cardTitle}>System Resources</ThemedText>
          </View>
          <MetricProgress label="CPU Usage" value={metrics?.cpu || 0} color={Colors.dark.accent} />
          <MetricProgress label="Memory" value={metrics?.memory || 0} color={Colors.dark.success} />
          <MetricProgress label="Disk" value={metrics?.disk || 0} color={Colors.dark.warning} />
          <MetricProgress label="Network" value={metrics?.network || 0} color="#A78BFA" />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="upload-cloud" size={20} color={Colors.dark.accent} />
            <ThemedText style={styles.cardTitle}>Deployment Statistics</ThemedText>
          </View>
          <SimpleBarChart data={deploymentsByStatus} maxValue={Math.max(...deploymentsByStatus.map(d => d.value), 1)} />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Feather name="grid" size={20} color={Colors.dark.accent} />
            <ThemedText style={styles.cardTitle}>Agent Status Overview</ThemedText>
          </View>
          <SimpleBarChart data={agentStatusData} maxValue={Math.max(...agentStatusData.map(d => d.value), 1)} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Feather name="trending-up" size={24} color={Colors.dark.success} />
            <ThemedText style={styles.statValue}>{metrics?.deploymentsToday || 0}</ThemedText>
            <ThemedText style={styles.statLabel}>Deployments Today</ThemedText>
          </View>
          <View style={styles.statCard}>
            <Feather name="check-circle" size={24} color={Colors.dark.accent} />
            <ThemedText style={styles.statValue}>
              {Math.round((deployments.filter(d => d.status === "success").length / Math.max(deployments.length, 1)) * 100)}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Success Rate</ThemedText>
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
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xl,
    alignItems: "center",
  },
  statValue: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.dark.text,
    marginTop: Spacing.md,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
});

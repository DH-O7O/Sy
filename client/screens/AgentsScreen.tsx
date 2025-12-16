import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, FlatList, RefreshControl, TextInput, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { AgentCard } from "@/components/AgentCard";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { getAgents, updateAgent } from "@/lib/storage";
import type { Agent, AgentType, AgentStatus } from "@/lib/types";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type FilterType = "all" | AgentType | AgentStatus;

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Running", value: "running" },
  { label: "Stopped", value: "stopped" },
  { label: "Error", value: "error" },
];

export default function AgentsScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const [refreshing, setRefreshing] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const loadData = useCallback(async () => {
    const agentsData = await getAgents();
    setAgents(agentsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const handleStartAgent = async (agentId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updatedAgents = await updateAgent(agentId, { status: "running", cpu: 15, memory: 25, uptime: "0m" });
    setAgents(updatedAgents);
  };

  const handleStopAgent = async (agentId: string, agentName: string) => {
    Alert.alert(
      "Stop Agent",
      `Are you sure you want to stop ${agentName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Stop",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            const updatedAgents = await updateAgent(agentId, { status: "stopped", cpu: 0, memory: 0, uptime: "0m" });
            setAgents(updatedAgents);
          },
        },
      ]
    );
  };

  const handleRestartAgent = async (agentId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await updateAgent(agentId, { status: "starting" });
    setAgents(await getAgents());
    setTimeout(async () => {
      const updatedAgents = await updateAgent(agentId, { status: "running", cpu: 10, memory: 20, uptime: "0m" });
      setAgents(updatedAgents);
    }, 2000);
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === "all" ||
      agent.status === activeFilter ||
      agent.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const renderAgent = ({ item }: { item: Agent }) => (
    <AgentCard
      agent={item}
      onPress={() => navigation.navigate("AgentDetail", { agentId: item.id, agentName: item.name })}
      onStart={() => handleStartAgent(item.id)}
      onStop={() => handleStopAgent(item.id, item.name)}
      onRestart={() => handleRestartAgent(item.id)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <ThemedText style={styles.title}>Agents</ThemedText>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={Colors.dark.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search agents..."
            placeholderTextColor={Colors.dark.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterRow}>
          {FILTERS.map((filter) => (
            <Pressable
              key={filter.value}
              onPress={() => setActiveFilter(filter.value)}
              style={[
                styles.filterChip,
                activeFilter === filter.value && styles.filterChipActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  activeFilter === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredAgents}
        renderItem={renderAgent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: tabBarHeight }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.dark.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="inbox" size={48} color={Colors.dark.textTertiary} />
            <ThemedText style={styles.emptyText}>No agents found</ThemedText>
          </View>
        }
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
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.dark.text,
    fontSize: 15,
    marginLeft: Spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.dark.backgroundDefault,
  },
  filterChipActive: {
    backgroundColor: Colors.dark.accent,
  },
  filterText: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
    fontWeight: "500",
  },
  filterTextActive: {
    color: Colors.dark.buttonText,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    fontSize: 16,
    color: Colors.dark.textTertiary,
    marginTop: Spacing.md,
  },
});

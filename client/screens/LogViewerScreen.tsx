import React, { useState, useRef } from "react";
import { View, StyleSheet, FlatList, Pressable, TextInput } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius, Fonts } from "@/constants/theme";

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "DEBUG" | "WARN" | "ERROR";
  source: string;
  message: string;
}

const SAMPLE_LOGS: LogEntry[] = [
  { id: "1", timestamp: "2024-01-15 12:45:32.145", level: "INFO", source: "Orchestrator", message: "System initialization complete" },
  { id: "2", timestamp: "2024-01-15 12:45:33.892", level: "INFO", source: "Orchestrator", message: "Connected to all worker agents" },
  { id: "3", timestamp: "2024-01-15 12:45:35.234", level: "DEBUG", source: "Worker Alpha", message: "Processing batch #4521 with 150 items" },
  { id: "4", timestamp: "2024-01-15 12:46:01.567", level: "INFO", source: "Worker Alpha", message: "Batch #4521 completed successfully in 14.2s" },
  { id: "5", timestamp: "2024-01-15 12:47:00.123", level: "WARN", source: "System Monitor", message: "Memory usage above threshold (58%)" },
  { id: "6", timestamp: "2024-01-15 12:48:22.456", level: "INFO", source: "System Monitor", message: "Health check passed for all agents" },
  { id: "7", timestamp: "2024-01-15 12:49:15.789", level: "DEBUG", source: "Analytics", message: "Generating performance report" },
  { id: "8", timestamp: "2024-01-15 12:50:00.012", level: "INFO", source: "Orchestrator", message: "Scheduled maintenance window in 2 hours" },
  { id: "9", timestamp: "2024-01-15 12:51:30.345", level: "WARN", source: "Worker Beta", message: "Connection timeout, retrying..." },
  { id: "10", timestamp: "2024-01-15 12:52:00.678", level: "ERROR", source: "Worker Beta", message: "Failed to connect after 3 retries" },
  { id: "11", timestamp: "2024-01-15 12:52:05.901", level: "INFO", source: "Orchestrator", message: "Attempting to restart Worker Beta" },
  { id: "12", timestamp: "2024-01-15 12:52:30.234", level: "INFO", source: "Worker Beta", message: "Agent restarted successfully" },
];

type LevelFilter = "all" | "INFO" | "DEBUG" | "WARN" | "ERROR";

const LEVEL_FILTERS: LevelFilter[] = ["all", "INFO", "DEBUG", "WARN", "ERROR"];

const getLevelColor = (level: string): string => {
  switch (level) {
    case "ERROR":
      return Colors.dark.error;
    case "WARN":
      return Colors.dark.warning;
    case "DEBUG":
      return Colors.dark.textTertiary;
    case "INFO":
    default:
      return Colors.dark.accent;
  }
};

export default function LogViewerScreen() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [autoScroll, setAutoScroll] = useState(true);

  const filteredLogs = SAMPLE_LOGS.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === "all" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const renderLogEntry = ({ item }: { item: LogEntry }) => {
    const levelColor = getLevelColor(item.level);
    
    return (
      <View style={styles.logEntry}>
        <View style={styles.logHeader}>
          <ThemedText style={styles.logTimestamp}>{item.timestamp}</ThemedText>
          <View style={[styles.levelBadge, { backgroundColor: levelColor + "30" }]}>
            <ThemedText style={[styles.levelText, { color: levelColor }]}>
              {item.level}
            </ThemedText>
          </View>
          <ThemedText style={styles.logSource}>{item.source}</ThemedText>
        </View>
        <ThemedText style={styles.logMessage}>{item.message}</ThemedText>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color={Colors.dark.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search logs..."
            placeholderTextColor={Colors.dark.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.filterRow}>
          {LEVEL_FILTERS.map((level) => (
            <Pressable
              key={level}
              onPress={() => setLevelFilter(level)}
              style={[
                styles.filterChip,
                levelFilter === level && styles.filterChipActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  levelFilter === level && styles.filterTextActive,
                ]}
              >
                {level === "all" ? "All" : level}
              </ThemedText>
            </Pressable>
          ))}
        </View>
        <View style={styles.controlsRow}>
          <ThemedText style={styles.logCount}>{filteredLogs.length} entries</ThemedText>
          <Pressable
            onPress={() => setAutoScroll(!autoScroll)}
            style={[styles.autoScrollButton, autoScroll && styles.autoScrollActive]}
          >
            <Feather
              name="arrow-down-circle"
              size={18}
              color={autoScroll ? Colors.dark.accent : Colors.dark.textSecondary}
            />
            <ThemedText
              style={[
                styles.autoScrollText,
                autoScroll && styles.autoScrollTextActive,
              ]}
            >
              Auto-scroll
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={filteredLogs}
        renderItem={renderLogEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
        onContentSizeChange={() => {
          if (autoScroll) {
            flatListRef.current?.scrollToEnd({ animated: true });
          }
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Feather name="file-text" size={48} color={Colors.dark.textTertiary} />
            <ThemedText style={styles.emptyText}>No logs found</ThemedText>
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.backgroundDefault,
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
    height: 40,
    color: Colors.dark.text,
    fontSize: 14,
    marginLeft: Spacing.sm,
    fontFamily: Fonts?.mono,
  },
  filterRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  filterChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.backgroundDefault,
  },
  filterChipActive: {
    backgroundColor: Colors.dark.accent,
  },
  filterText: {
    fontSize: 11,
    color: Colors.dark.textSecondary,
    fontWeight: "600",
  },
  filterTextActive: {
    color: Colors.dark.buttonText,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logCount: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  autoScrollButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.backgroundDefault,
  },
  autoScrollActive: {
    backgroundColor: Colors.dark.accent + "20",
  },
  autoScrollText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  autoScrollTextActive: {
    color: Colors.dark.accent,
  },
  list: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  logEntry: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.xs,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  logHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  logTimestamp: {
    fontSize: 10,
    fontFamily: Fonts?.mono,
    color: Colors.dark.textTertiary,
    marginRight: Spacing.sm,
  },
  levelBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 1,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  levelText: {
    fontSize: 9,
    fontWeight: "700",
    fontFamily: Fonts?.mono,
  },
  logSource: {
    fontSize: 10,
    color: Colors.dark.textSecondary,
    fontFamily: Fonts?.mono,
  },
  logMessage: {
    fontSize: 12,
    fontFamily: Fonts?.mono,
    color: Colors.dark.text,
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

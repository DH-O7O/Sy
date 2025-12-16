import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { addDeployment } from "@/lib/storage";

type DeploymentType = "full" | "hotfix" | "rollback" | "scale";

const DEPLOYMENT_TYPES: { type: DeploymentType; icon: keyof typeof Feather.glyphMap; title: string; description: string }[] = [
  { type: "full", icon: "upload-cloud", title: "Full Deploy", description: "Deploy all services and configurations" },
  { type: "hotfix", icon: "zap", title: "Hotfix", description: "Quick patch deployment" },
  { type: "rollback", icon: "rotate-ccw", title: "Rollback", description: "Revert to previous version" },
  { type: "scale", icon: "maximize-2", title: "Scale", description: "Adjust resource allocation" },
];

const ENVIRONMENTS = ["production", "staging", "development"];

export default function DeployModal() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  
  const [selectedType, setSelectedType] = useState<DeploymentType>("full");
  const [selectedEnv, setSelectedEnv] = useState("staging");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);

  const handleDeploy = async () => {
    Alert.alert(
      "Confirm Deployment",
      `Are you sure you want to deploy to ${selectedEnv}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deploy",
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setIsDeploying(true);
            setDeployProgress(0);

            const interval = setInterval(() => {
              setDeployProgress((prev) => {
                if (prev >= 100) {
                  clearInterval(interval);
                  return 100;
                }
                return prev + Math.random() * 15;
              });
            }, 500);

            setTimeout(async () => {
              clearInterval(interval);
              setDeployProgress(100);
              
              await addDeployment({
                name: `${DEPLOYMENT_TYPES.find(t => t.type === selectedType)?.title || "Deployment"}`,
                status: "success",
                duration: `${Math.floor(Math.random() * 5) + 2}m ${Math.floor(Math.random() * 60)}s`,
                deployedBy: "Admin",
                timestamp: new Date().toISOString(),
                environment: selectedEnv,
              });

              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              
              setTimeout(() => {
                navigation.goBack();
              }, 1000);
            }, 4000);
          },
        },
      ]
    );
  };

  if (isDeploying) {
    return (
      <View style={[styles.container, styles.deployingContainer]}>
        <View style={styles.deployingContent}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
          <ThemedText style={styles.deployingTitle}>
            {deployProgress >= 100 ? "Deployment Complete" : "Deploying..."}
          </ThemedText>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${Math.min(deployProgress, 100)}%` }]} />
          </View>
          <ThemedText style={styles.progressText}>
            {Math.round(Math.min(deployProgress, 100))}%
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText style={styles.sectionTitle}>Deployment Type</ThemedText>
        <View style={styles.typesGrid}>
          {DEPLOYMENT_TYPES.map((item) => (
            <Pressable
              key={item.type}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedType(item.type);
              }}
              style={[
                styles.typeCard,
                selectedType === item.type && styles.typeCardActive,
              ]}
            >
              <View
                style={[
                  styles.typeIcon,
                  { backgroundColor: selectedType === item.type ? Colors.dark.accent + "30" : Colors.dark.backgroundSecondary },
                ]}
              >
                <Feather
                  name={item.icon}
                  size={24}
                  color={selectedType === item.type ? Colors.dark.accent : Colors.dark.textSecondary}
                />
              </View>
              <ThemedText style={styles.typeTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.typeDescription}>{item.description}</ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText style={styles.sectionTitle}>Environment</ThemedText>
        <View style={styles.envRow}>
          {ENVIRONMENTS.map((env) => (
            <Pressable
              key={env}
              onPress={() => {
                Haptics.selectionAsync();
                setSelectedEnv(env);
              }}
              style={[
                styles.envChip,
                selectedEnv === env && styles.envChipActive,
              ]}
            >
              <ThemedText
                style={[
                  styles.envText,
                  selectedEnv === env && styles.envTextActive,
                ]}
              >
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.summaryCard}>
          <ThemedText style={styles.summaryTitle}>Deployment Summary</ThemedText>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Type:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {DEPLOYMENT_TYPES.find(t => t.type === selectedType)?.title}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Environment:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {selectedEnv.charAt(0).toUpperCase() + selectedEnv.slice(1)}
            </ThemedText>
          </View>
          <View style={styles.summaryRow}>
            <ThemedText style={styles.summaryLabel}>Estimated Time:</ThemedText>
            <ThemedText style={styles.summaryValue}>3-5 minutes</ThemedText>
          </View>
        </View>

        <Button onPress={handleDeploy} style={styles.deployButton}>
          Deploy Now
        </Button>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.md,
  },
  typesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  typeCard: {
    width: "47%",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeCardActive: {
    borderColor: Colors.dark.accent,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  typeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.xs,
  },
  typeDescription: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  envRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  envChip: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.dark.backgroundDefault,
    alignItems: "center",
  },
  envChipActive: {
    backgroundColor: Colors.dark.accent,
  },
  envText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark.textSecondary,
  },
  envTextActive: {
    color: Colors.dark.buttonText,
  },
  summaryCard: {
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.dark.text,
    fontWeight: "500",
  },
  deployButton: {
    marginTop: Spacing.md,
  },
  deployingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  deployingContent: {
    alignItems: "center",
    paddingHorizontal: Spacing["3xl"],
  },
  deployingTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark.text,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: Colors.dark.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.dark.accent,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: Spacing.md,
  },
});

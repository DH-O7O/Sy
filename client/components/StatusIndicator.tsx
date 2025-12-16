import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";

interface StatusIndicatorProps {
  status: "online" | "degraded" | "offline" | "running" | "stopped" | "error" | "starting";
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case "online":
    case "running":
      return Colors.dark.success;
    case "degraded":
    case "starting":
      return Colors.dark.warning;
    case "offline":
    case "stopped":
    case "error":
      return Colors.dark.error;
    default:
      return Colors.dark.textTertiary;
  }
};

const getStatusLabel = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export function StatusIndicator({ status, size = "medium", showLabel = true }: StatusIndicatorProps) {
  const color = getStatusColor(status);
  const pulse = useSharedValue(1);
  const isActive = status === "online" || status === "running";

  useEffect(() => {
    if (isActive) {
      pulse.value = withRepeat(
        withTiming(1.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    } else {
      pulse.value = 1;
    }
  }, [isActive, pulse]);

  const dotSize = size === "small" ? 8 : size === "medium" ? 10 : 12;

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: 2 - pulse.value,
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.dotContainer, { width: dotSize * 2, height: dotSize * 2 }]}>
        {isActive ? (
          <Animated.View
            style={[
              styles.pulse,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: color,
              },
              animatedPulseStyle,
            ]}
          />
        ) : null}
        <View
          style={[
            styles.dot,
            {
              width: dotSize,
              height: dotSize,
              borderRadius: dotSize / 2,
              backgroundColor: color,
            },
          ]}
        />
      </View>
      {showLabel ? (
        <ThemedText style={[styles.label, { color }]}>{getStatusLabel(status)}</ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dotContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
  },
  pulse: {
    position: "absolute",
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
});

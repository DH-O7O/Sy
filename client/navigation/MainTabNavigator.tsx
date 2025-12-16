import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, Pressable } from "react-native";
import DashboardScreen from "@/screens/DashboardScreen";
import AgentsScreen from "@/screens/AgentsScreen";
import AnalyticsScreen from "@/screens/AnalyticsScreen";
import AlertsScreen from "@/screens/AlertsScreen";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius } from "@/constants/theme";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export type MainTabParamList = {
  DashboardTab: undefined;
  AgentsTab: undefined;
  DeployTab: undefined;
  AnalyticsTab: undefined;
  AlertsTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

function DeployPlaceholder() {
  return <View />;
}

function FloatingDeployButton() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  return (
    <Pressable
      style={({ pressed }) => [
        styles.floatingButton,
        pressed && styles.floatingButtonPressed,
      ]}
      onPress={() => navigation.navigate("DeployModal")}
    >
      <Feather name="upload-cloud" size={28} color={Colors.dark.buttonText} />
    </Pressable>
  );
}

export default function MainTabNavigator() {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Tab.Navigator
        initialRouteName="DashboardTab"
        screenOptions={{
          tabBarActiveTintColor: Colors.dark.accent,
          tabBarInactiveTintColor: theme.tabIconDefault,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: Platform.select({
              ios: "transparent",
              android: Colors.dark.backgroundDefault,
            }),
            borderTopWidth: 0,
            elevation: 0,
            height: 85,
            paddingBottom: Platform.OS === "ios" ? 20 : 10,
          },
          tabBarBackground: () =>
            Platform.OS === "ios" ? (
              <BlurView
                intensity={80}
                tint="dark"
                style={StyleSheet.absoluteFill}
              />
            ) : null,
          headerShown: false,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "500",
          },
        }}
      >
        <Tab.Screen
          name="DashboardTab"
          component={DashboardScreen}
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Feather name="home" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="AgentsTab"
          component={AgentsScreen}
          options={{
            title: "Agents",
            tabBarIcon: ({ color, size }) => (
              <Feather name="grid" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="DeployTab"
          component={DeployPlaceholder}
          options={{
            title: "",
            tabBarIcon: () => null,
            tabBarButton: () => <FloatingDeployButton />,
          }}
        />
        <Tab.Screen
          name="AnalyticsTab"
          component={AnalyticsScreen}
          options={{
            title: "Analytics",
            tabBarIcon: ({ color, size }) => (
              <Feather name="bar-chart-2" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="AlertsTab"
          component={AlertsScreen}
          options={{
            title: "Alerts",
            tabBarIcon: ({ color, size }) => (
              <Feather name="bell" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.backgroundRoot,
  },
  floatingButton: {
    position: "absolute",
    top: -20,
    alignSelf: "center",
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.dark.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

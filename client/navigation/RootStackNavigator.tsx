import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import DeployModal from "@/screens/DeployModal";
import AgentDetailScreen from "@/screens/AgentDetailScreen";
import DeploymentHistoryScreen from "@/screens/DeploymentHistoryScreen";
import SettingsScreen from "@/screens/SettingsScreen";
import LogViewerScreen from "@/screens/LogViewerScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";

export type RootStackParamList = {
  Main: undefined;
  DeployModal: undefined;
  AgentDetail: { agentId: string; agentName: string };
  DeploymentHistory: undefined;
  Settings: undefined;
  LogViewer: { source?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="Main"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DeployModal"
        component={DeployModal}
        options={{
          presentation: "modal",
          headerTitle: "Deploy",
        }}
      />
      <Stack.Screen
        name="AgentDetail"
        component={AgentDetailScreen}
        options={({ route }) => ({
          headerTitle: route.params.agentName,
        })}
      />
      <Stack.Screen
        name="DeploymentHistory"
        component={DeploymentHistoryScreen}
        options={{
          headerTitle: "Deployment History",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: "Settings",
        }}
      />
      <Stack.Screen
        name="LogViewer"
        component={LogViewerScreen}
        options={{
          headerTitle: "Logs",
        }}
      />
    </Stack.Navigator>
  );
}

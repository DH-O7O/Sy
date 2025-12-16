import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Agent, Alert, Deployment, SystemMetrics, ApiConnection } from "./types";

const STORAGE_KEYS = {
  AGENTS: "@synapse/agents",
  ALERTS: "@synapse/alerts",
  DEPLOYMENTS: "@synapse/deployments",
  METRICS: "@synapse/metrics",
  CONNECTIONS: "@synapse/connections",
  USER_ROLE: "@synapse/user_role",
};

const defaultAgents: Agent[] = [
  {
    id: "1",
    name: "Core Orchestrator",
    type: "orchestrator",
    status: "running",
    cpu: 24,
    memory: 42,
    uptime: "7d 12h 34m",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Worker Alpha",
    type: "worker",
    status: "running",
    cpu: 67,
    memory: 58,
    uptime: "3d 8h 15m",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "System Monitor",
    type: "monitor",
    status: "running",
    cpu: 12,
    memory: 28,
    uptime: "14d 2h 45m",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Analytics Engine",
    type: "analytics",
    status: "stopped",
    cpu: 0,
    memory: 15,
    uptime: "0m",
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Worker Beta",
    type: "worker",
    status: "error",
    cpu: 0,
    memory: 0,
    uptime: "0m",
    lastUpdated: new Date().toISOString(),
  },
];

const defaultAlerts: Alert[] = [
  {
    id: "1",
    severity: "critical",
    message: "Worker Beta agent has crashed and requires immediate attention",
    source: "Worker Beta",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: "2",
    severity: "warning",
    message: "High memory usage detected on Worker Alpha (58%)",
    source: "System Monitor",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: "3",
    severity: "info",
    message: "Scheduled maintenance window starting in 2 hours",
    source: "System",
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    read: true,
  },
  {
    id: "4",
    severity: "warning",
    message: "API rate limit approaching threshold (85%)",
    source: "Core Orchestrator",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: true,
  },
];

const defaultDeployments: Deployment[] = [
  {
    id: "1",
    name: "v2.4.1 Hotfix",
    status: "success",
    duration: "4m 32s",
    deployedBy: "Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    environment: "production",
  },
  {
    id: "2",
    name: "Feature Update",
    status: "success",
    duration: "8m 15s",
    deployedBy: "Operator",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    environment: "staging",
  },
  {
    id: "3",
    name: "Security Patch",
    status: "failed",
    duration: "2m 08s",
    deployedBy: "Admin",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    environment: "production",
  },
];

const defaultMetrics: SystemMetrics = {
  cpu: 45,
  memory: 62,
  disk: 38,
  network: 72,
  activeAgents: 3,
  deploymentsToday: 12,
  systemStatus: "online",
};

const defaultConnections: ApiConnection[] = [
  { id: "1", name: "Gemini AI", status: "connected", lastChecked: new Date().toISOString() },
  { id: "2", name: "Anthropic", status: "connected", lastChecked: new Date().toISOString() },
  { id: "3", name: "Binance", status: "disconnected", lastChecked: new Date().toISOString() },
  { id: "4", name: "Telegram", status: "connected", lastChecked: new Date().toISOString() },
];

export async function getAgents(): Promise<Agent[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.AGENTS);
    if (data) {
      return JSON.parse(data);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(defaultAgents));
    return defaultAgents;
  } catch {
    return defaultAgents;
  }
}

export async function updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent[]> {
  const agents = await getAgents();
  const updatedAgents = agents.map((agent) =>
    agent.id === agentId ? { ...agent, ...updates, lastUpdated: new Date().toISOString() } : agent
  );
  await AsyncStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(updatedAgents));
  return updatedAgents;
}

export async function getAlerts(): Promise<Alert[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ALERTS);
    if (data) {
      return JSON.parse(data);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(defaultAlerts));
    return defaultAlerts;
  } catch {
    return defaultAlerts;
  }
}

export async function markAlertRead(alertId: string): Promise<Alert[]> {
  const alerts = await getAlerts();
  const updatedAlerts = alerts.map((alert) =>
    alert.id === alertId ? { ...alert, read: true } : alert
  );
  await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updatedAlerts));
  return updatedAlerts;
}

export async function markAllAlertsRead(): Promise<Alert[]> {
  const alerts = await getAlerts();
  const updatedAlerts = alerts.map((alert) => ({ ...alert, read: true }));
  await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updatedAlerts));
  return updatedAlerts;
}

export async function dismissAlert(alertId: string): Promise<Alert[]> {
  const alerts = await getAlerts();
  const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);
  await AsyncStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(updatedAlerts));
  return updatedAlerts;
}

export async function getDeployments(): Promise<Deployment[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.DEPLOYMENTS);
    if (data) {
      return JSON.parse(data);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(defaultDeployments));
    return defaultDeployments;
  } catch {
    return defaultDeployments;
  }
}

export async function addDeployment(deployment: Omit<Deployment, "id">): Promise<Deployment[]> {
  const deployments = await getDeployments();
  const newDeployment: Deployment = {
    ...deployment,
    id: Date.now().toString(),
  };
  const updatedDeployments = [newDeployment, ...deployments];
  await AsyncStorage.setItem(STORAGE_KEYS.DEPLOYMENTS, JSON.stringify(updatedDeployments));
  return updatedDeployments;
}

export async function getMetrics(): Promise<SystemMetrics> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.METRICS);
    if (data) {
      return JSON.parse(data);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.METRICS, JSON.stringify(defaultMetrics));
    return defaultMetrics;
  } catch {
    return defaultMetrics;
  }
}

export async function getConnections(): Promise<ApiConnection[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.CONNECTIONS);
    if (data) {
      return JSON.parse(data);
    }
    await AsyncStorage.setItem(STORAGE_KEYS.CONNECTIONS, JSON.stringify(defaultConnections));
    return defaultConnections;
  } catch {
    return defaultConnections;
  }
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
}

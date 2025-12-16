export type AgentStatus = "running" | "stopped" | "error" | "starting";
export type AgentType = "orchestrator" | "worker" | "monitor" | "analytics";
export type AlertSeverity = "critical" | "warning" | "info";
export type DeploymentStatus = "success" | "failed" | "in_progress" | "pending";

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  cpu: number;
  memory: number;
  uptime: string;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  message: string;
  source: string;
  timestamp: string;
  read: boolean;
}

export interface Deployment {
  id: string;
  name: string;
  status: DeploymentStatus;
  duration: string;
  deployedBy: string;
  timestamp: string;
  environment: string;
}

export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeAgents: number;
  deploymentsToday: number;
  systemStatus: "online" | "degraded" | "offline";
}

export interface ApiConnection {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error";
  lastChecked: string;
}

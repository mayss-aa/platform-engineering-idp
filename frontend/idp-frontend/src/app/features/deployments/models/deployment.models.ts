/**
 * Deployment data models.
 */

export type DeploymentStatus =
  | 'RUNNING' | 'PROGRESSING' | 'PENDING' | 'FAILED'
  | 'COMPLETED' | 'CANCELLED' | 'ROLLING_BACK';

export type DeploymentStrategy = 'ROLLING' | 'BLUE_GREEN' | 'CANARY' | 'RECREATE';
export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';

export interface Deployment {
  id: string;
  applicationName: string;
  version: string;
  environment: string;
  deploymentStrategy: DeploymentStrategy;
  deploymentStatus: DeploymentStatus;
  healthStatus: HealthStatus;
  namespace: string;
  cluster: string;
  cloudProvider: string;
  triggeredBy: string;
  approvedBy: string | null;
  createdAt: string;
  completedAt: string | null;
  duration: string | null;
  commitHash: string;
  branch: string;
  repository: string;
  image: string;
  replicas: number;
  availableReplicas: number;
  desiredReplicas: number;
  cpu: string;
  memory: string;
  restartCount: number;
  rollbackAvailable: boolean;
  pipelineId: string | null;
  releaseId: string | null;
  tags: string[];
}

export interface DeploymentData {
  deployments: Deployment[];
  totalCount: number;
}

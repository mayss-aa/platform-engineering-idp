/**
 * Terraform data models.
 */

export type TerraformExecutionType = 'PLAN' | 'APPLY' | 'DESTROY';
export type TerraformExecutionStatus =
  | 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  | 'CANCELLED' | 'AWAITING_APPROVAL';

export interface TerraformExecution {
  id: string;
  workspace: string;
  organization: string;
  environment: string;
  cloudProvider: string;
  region: string;
  resourceGroup: string;
  executionType: TerraformExecutionType;
  executionStatus: TerraformExecutionStatus;
  createdBy: string;
  approvedBy: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: string | null;
  terraformVersion: string;
  moduleName: string;
  gitBranch: string;
  commitHash: string;
  planSummary: string;
  resourcesToAdd: number;
  resourcesToChange: number;
  resourcesToDestroy: number;
  costImpact: string | null;
  driftDetected: boolean;
  approvalRequired: boolean;
  executionLogsAvailable: boolean;
  tags: string[];
}

export interface TerraformData {
  executions: TerraformExecution[];
  totalCount: number;
}

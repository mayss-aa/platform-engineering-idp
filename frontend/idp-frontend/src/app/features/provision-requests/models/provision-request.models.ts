/**
 * Provision Request data models.
 */

export type ProvisionRequestStatus =
  | 'DRAFT' | 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED'
  | 'REJECTED' | 'PROVISIONING' | 'PROVISIONED' | 'FAILED' | 'CANCELLED';

export interface ProvisionRequest {
  id: string;
  requester: string;
  organization: string;
  team: string;
  requestedService: string;
  resourceType: string;
  environment: string;
  cloudProvider: string;
  configuration: Record<string, string>;
  createdAt: string;
  approvedAt: string | null;
  approver: string | null;
  estimatedMonthlyCost: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: ProvisionRequestStatus;
  workflowStage: string;
  comments: string[];
}

export interface ProvisionRequestData {
  requests: ProvisionRequest[];
  totalCount: number;
}

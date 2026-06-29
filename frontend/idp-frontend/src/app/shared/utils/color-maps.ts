/**
 * Status-to-CSS-class color maps for use with StatusBadgeComponent.
 * Each map matches status values to badge class names defined in
 * the StatusBadge component styles.
 */

export const DEPLOYMENT_COLOR_MAP: Record<string, string> = {
  IDLE: 'badge-idle',
  RUNNING: 'badge-running',
  SUCCESS: 'badge-success',
  FAILED: 'badge-failed',
};

export const TERRAFORM_COLOR_MAP: Record<string, string> = {
  PENDING: 'badge-pending',
  RUNNING: 'badge-running',
  SUCCESS: 'badge-success',
  FAILED: 'badge-failed',
};

export const PIPELINE_COLOR_MAP: Record<string, string> = {
  SUCCESS: 'badge-success',
  FAILURE: 'badge-failed',
  RUNNING: 'badge-running',
  CANCELLED: 'badge-cancelled',
  QUEUED: 'badge-queued',
};

export const K8S_HEALTH_COLOR_MAP: Record<string, string> = {
  HEALTHY: 'badge-healthy',
  DEGRADED: 'badge-degraded',
  CRITICAL: 'badge-unavailable',
};

export const SERVICE_HEALTH_COLOR_MAP: Record<string, string> = {
  HEALTHY: 'badge-healthy',
  DEGRADED: 'badge-degraded',
  UNAVAILABLE: 'badge-unavailable',
};

export const CONTAINER_COLOR_MAP: Record<string, string> = {
  RUNNING: 'badge-running',
  STOPPED: 'badge-idle',
  EXITED: 'badge-failed',
  RESTARTING: 'badge-pending',
};

export const INCIDENT_SEVERITY_COLOR_MAP: Record<string, string> = {
  P1: 'badge-p1',
  P2: 'badge-p2',
  P3: 'badge-p3',
  P4: 'badge-p4',
};

export const INCIDENT_STATUS_COLOR_MAP: Record<string, string> = {
  OPEN: 'badge-failed',
  ASSIGNED: 'badge-pending',
  INVESTIGATING: 'badge-running',
  RESOLVED: 'badge-success',
};

export const ALERT_SEVERITY_COLOR_MAP: Record<string, string> = {
  CRITICAL: 'badge-p1',
  WARNING: 'badge-p2',
  INFO: 'badge-p4',
};

export const RECOMMENDATION_COLOR_MAP: Record<string, string> = {
  NEW: 'badge-new',
  ACKNOWLEDGED: 'badge-acknowledged',
  APPLIED: 'badge-applied',
  DISMISSED: 'badge-dismissed',
};

export const PROVISION_REQUEST_COLOR_MAP: Record<string, string> = {
  PENDING: 'badge-pending',
  APPROVED: 'badge-approved',
  REJECTED: 'badge-rejected',
  PROVISIONED: 'badge-provisioned',
};

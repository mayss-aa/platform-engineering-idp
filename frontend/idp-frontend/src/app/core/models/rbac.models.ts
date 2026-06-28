import { UserRole } from './auth.models';

export type Permission =
  | 'deployments:read' | 'deployments:trigger'
  | 'terraform:read' | 'terraform:execute'
  | 'containers:read' | 'containers:start' | 'containers:stop' | 'containers:logs'
  | 'kubernetes:read' | 'kubernetes:exec' | 'kubernetes:admin'
  | 'cloud:read' | 'cloud:manage' | 'cloud:cost-view'
  | 'monitoring:read' | 'monitoring:alerts:manage'
  | 'incidents:read' | 'incidents:assign' | 'incidents:resolve'
  | 'recommendations:read' | 'recommendations:manage'
  | 'organizations:read' | 'organizations:manage'
  | 'teams:read' | 'teams:manage'
  | 'users:read' | 'users:manage'
  | 'audit:read'
  | 'ai-assistant:read' | 'ai-assistant:chat'
  | 'provision-requests:read' | 'provision-requests:create' | 'provision-requests:approve';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    'deployments:read', 'deployments:trigger',
    'terraform:read', 'terraform:execute',
    'containers:read', 'containers:start', 'containers:stop', 'containers:logs',
    'kubernetes:read', 'kubernetes:exec', 'kubernetes:admin',
    'cloud:read', 'cloud:manage', 'cloud:cost-view',
    'monitoring:read', 'monitoring:alerts:manage',
    'incidents:read', 'incidents:assign', 'incidents:resolve',
    'recommendations:read', 'recommendations:manage',
    'organizations:read', 'organizations:manage',
    'teams:read', 'teams:manage',
    'users:read', 'users:manage',
    'audit:read',
    'ai-assistant:read', 'ai-assistant:chat',
    'provision-requests:read', 'provision-requests:create', 'provision-requests:approve'
  ],
  DEVELOPER: [
    'deployments:read', 'deployments:trigger',
    'terraform:read',
    'containers:read', 'containers:logs',
    'kubernetes:read',
    'cloud:read',
    'monitoring:read',
    'incidents:read',
    'recommendations:read',
    'organizations:read',
    'teams:read',
    'users:read',
    'ai-assistant:read', 'ai-assistant:chat',
    'provision-requests:read', 'provision-requests:create'
  ],
  VIEWER: [
    'deployments:read',
    'terraform:read',
    'containers:read',
    'kubernetes:read',
    'cloud:read',
    'monitoring:read',
    'incidents:read',
    'recommendations:read',
    'organizations:read',
    'teams:read',
    'users:read',
    'provision-requests:read',
    'ai-assistant:read'
  ],
  APPROVER: [
    'deployments:read',
    'terraform:read',
    'containers:read',
    'kubernetes:read',
    'cloud:read',
    'monitoring:read',
    'incidents:read', 'incidents:assign',
    'recommendations:read',
    'organizations:read',
    'teams:read',
    'users:read',
    'provision-requests:read', 'provision-requests:create', 'provision-requests:approve',
    'audit:read',
    'ai-assistant:read'
  ],
  OPERATOR: [
    'deployments:read', 'deployments:trigger',
    'terraform:read', 'terraform:execute',
    'containers:read', 'containers:start', 'containers:stop', 'containers:logs',
    'kubernetes:read', 'kubernetes:exec',
    'cloud:read', 'cloud:manage',
    'monitoring:read', 'monitoring:alerts:manage',
    'incidents:read', 'incidents:assign', 'incidents:resolve',
    'recommendations:read',
    'organizations:read',
    'teams:read',
    'users:read',
    'provision-requests:read',
    'ai-assistant:read', 'ai-assistant:chat'
  ]
};

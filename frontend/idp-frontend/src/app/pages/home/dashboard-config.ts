import { UserRole } from '../../core/models/auth.models';

// ─── Shared interfaces ──────────────────────────────────────
export interface DashboardKpi {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  status: 'healthy' | 'warning' | 'error' | 'info' | 'neutral';
  svgPath: string;
  /** If true, this widget spans 2 columns on desktop. */
  wide?: boolean;
}

export interface DashboardAction {
  label: string;
  svgPath: string;
  primary?: boolean;
}

export interface DashboardActivity {
  actor: string;
  action: string;
  target: string;
  time: string;
  type: string;
}

export interface DashboardConfig {
  title: string;
  subtitle: string;
  kpiWidgets: DashboardKpi[];
  quickActions: DashboardAction[];
  recentActivity: DashboardActivity[];
  emptyStateMessage: string;
  showServiceHealth: boolean;
  showRoadmap: boolean;
}

// ─── SVG icon paths (shared) ────────────────────────────────
const ICONS = {
  shield: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  deploy: 'M5 10l7-7m0 0 7 7m-7-7v18',
  terraform: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37',
  k8s: 'M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
  cpu: 'M9 3v18m0-18h10a2 2 0 0 1 2 2v4M9 3H5a2 2 0 0 0-2 2v4m0 0h18M3 9v10a2 2 0 0 0 2 2h4',
  memory: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4',
  storage: 'M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8',
  cloud: 'M3 15a4 4 0 0 0 4 4h9a5 5 0 1 0-.1-9.999 5.002 5.002 0 0 0-9.78 2.096A4.001 4.001 0 0 0 3 15z',
  incident: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  approval: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4',
  pipeline: 'M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15',
  audit: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
  notification: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9',
  recommendation: 'M13 10V3L4 14h7v7l9-11h-7z',
  ai: 'M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707',
  users: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z',
  org: 'M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5',
  download: 'M12 10v6m0 0l-3-3m3 3l3-3M6 20h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2z',
  settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0',
  plus: 'M12 4v16m8-8H4',
  monitor: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2z',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM3.6 9h16.8M3.6 15h16.8',
  lock: 'M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z',
};

// ═══════════════════════════════════════════════════════════════
// ADMIN — Platform ownership cockpit
// ═══════════════════════════════════════════════════════════════
const ADMIN_CONFIG: DashboardConfig = {
  title: 'Platform Administration',
  subtitle: 'Executive Operations Cockpit',
  showServiceHealth: true,
  showRoadmap: true,
  emptyStateMessage: 'Platform fully operational.',
  kpiWidgets: [
    { label: 'Cluster Health', value: '99.9', unit: '%', status: 'healthy', trend: 'All nodes healthy', trendUp: true, svgPath: ICONS.shield },
    { label: 'Deployments', value: '12', unit: 'running', status: 'info', trend: '+2 today', trendUp: true, svgPath: ICONS.deploy },
    { label: 'Terraform', value: '4', unit: 'jobs', status: 'info', trend: '2 pending', svgPath: ICONS.terraform },
    { label: 'Cloud Cost', value: '\u20AC3,241', unit: '/mo', status: 'info', trend: '-7%', trendUp: true, svgPath: ICONS.cloud },
    { label: 'CPU', value: '64', unit: '%', status: 'warning', trend: '+8%', trendUp: false, svgPath: ICONS.cpu },
    { label: 'Memory', value: '71', unit: '%', status: 'warning', trend: '14.2/20GB', svgPath: ICONS.memory },
    { label: 'Storage', value: '2.4', unit: 'TB', status: 'neutral', trend: '58%', svgPath: ICONS.storage },
    { label: 'Incidents', value: '1', unit: 'P3', status: 'warning', trend: 'No P1/P2', svgPath: ICONS.incident },
    { label: 'Approvals', value: '5', unit: 'pending', status: 'warning', trend: '3 provision', svgPath: ICONS.approval },
    { label: 'Pipelines Failed', value: '2', unit: 'last 24h', status: 'error', trend: 'Down from 5', trendUp: true, svgPath: ICONS.pipeline },
    { label: 'Audit Events', value: '142', unit: 'today', status: 'neutral', trend: 'Normal', svgPath: ICONS.audit },
    { label: 'Users', value: '47', unit: 'active', status: 'healthy', trend: '+3 this week', trendUp: true, svgPath: ICONS.users },
  ],
  quickActions: [
    { label: 'Manage Users', svgPath: ICONS.users, primary: true },
    { label: 'Approve Requests', svgPath: ICONS.approval, primary: true },
    { label: 'Trigger Deployment', svgPath: ICONS.deploy },
    { label: 'Terraform Apply', svgPath: ICONS.terraform },
    { label: 'Export Audit Logs', svgPath: ICONS.download },
    { label: 'Platform Settings', svgPath: ICONS.settings },
    { label: 'AI Assistant', svgPath: ICONS.ai },
  ],
  recentActivity: [
    { actor: 'admin', action: 'created user', target: 'emma.schulz', time: '5 min ago', type: 'user' },
    { actor: 'System', action: 'permission changed', target: 'DEVELOPER role', time: '12 min ago', type: 'audit' },
    { actor: 'bob.chen', action: 'approved request', target: 'PR-1042', time: '18 min ago', type: 'provision' },
    { actor: 'admin', action: 'assigned role', target: 'carol.dubois \u2192 PE', time: '25 min ago', type: 'user' },
    { actor: 'System', action: 'organization created', target: 'Cloud Ops', time: '1 hr ago', type: 'audit' },
    { actor: 'admin', action: 'deployment approved', target: 'payments v2.4', time: '2 hr ago', type: 'deploy' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PLATFORM_ENGINEER — DevOps Operations Center
// ═══════════════════════════════════════════════════════════════
const PLATFORM_ENGINEER_CONFIG: DashboardConfig = {
  title: 'Platform Operations',
  subtitle: 'Infrastructure & Deployment Center',
  showServiceHealth: true,
  showRoadmap: false,
  emptyStateMessage: 'No infrastructure alerts.',
  kpiWidgets: [
    { label: 'AKS Cluster', value: 'Healthy', unit: '', status: 'healthy', trend: '3 nodes', svgPath: ICONS.shield, wide: true },
    { label: 'Kubernetes Pods', value: '247', unit: 'running', status: 'healthy', trend: '+11 in 1h', trendUp: true, svgPath: ICONS.k8s },
    { label: 'Deployments', value: '12', unit: 'active', status: 'info', trend: '+2 today', trendUp: true, svgPath: ICONS.deploy },
    { label: 'Terraform Jobs', value: '4', unit: 'running', status: 'info', trend: '2 pending', svgPath: ICONS.terraform },
    { label: 'CPU', value: '64', unit: '%', status: 'warning', trend: '+8%', trendUp: false, svgPath: ICONS.cpu },
    { label: 'Memory', value: '71', unit: '%', status: 'warning', trend: '14.2/20GB', svgPath: ICONS.memory },
    { label: 'Storage', value: '2.4', unit: 'TB', status: 'neutral', trend: '58%', svgPath: ICONS.storage },
    { label: 'Containers', value: '34', unit: 'running', status: 'healthy', trend: '2 restarting', svgPath: ICONS.k8s },
    { label: 'Failed Deploys', value: '1', unit: 'last 24h', status: 'error', trend: 'auth-svc', svgPath: ICONS.incident },
    { label: 'Infra Alerts', value: '3', unit: 'active', status: 'warning', trend: '1 critical', svgPath: ICONS.monitor },
  ],
  quickActions: [
    { label: 'Terraform Plan', svgPath: ICONS.terraform, primary: true },
    { label: 'Terraform Apply', svgPath: ICONS.terraform, primary: true },
    { label: 'Deploy', svgPath: ICONS.deploy },
    { label: 'Rollback', svgPath: ICONS.pipeline },
    { label: 'Restart Pod', svgPath: ICONS.k8s },
    { label: 'Open Incident', svgPath: ICONS.incident },
    { label: 'View Logs', svgPath: ICONS.monitor },
    { label: 'AI Assistant', svgPath: ICONS.ai },
  ],
  recentActivity: [
    { actor: 'carol.dubois', action: 'applied terraform', target: 'prod-aks-cluster-v3', time: '5 min ago', type: 'terraform' },
    { actor: 'System', action: 'pod restarted', target: 'auth-svc-7b4f (CrashLoop)', time: '12 min ago', type: 'incident' },
    { actor: 'alice.martin', action: 'deployment rolled back', target: 'api-gateway v2.3.1', time: '22 min ago', type: 'deploy' },
    { actor: 'System', action: 'container restarted', target: 'redis-cache-01', time: '35 min ago', type: 'incident' },
    { actor: 'carol.dubois', action: 'cluster upgraded', target: 'AKS 1.28 \u2192 1.29', time: '1 hr ago', type: 'terraform' },
    { actor: 'System', action: 'auto-scaled', target: 'api-gateway \u2192 6 replicas', time: '2 hr ago', type: 'deploy' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// DEVELOPER — Development & Deployment workspace
// ═══════════════════════════════════════════════════════════════
const DEVELOPER_CONFIG: DashboardConfig = {
  title: 'Developer Workspace',
  subtitle: 'Deployments, Pipelines & Services',
  showServiceHealth: false,
  showRoadmap: false,
  emptyStateMessage: 'No deployments yet. Trigger your first deployment.',
  kpiWidgets: [
    { label: 'My Deployments', value: '3', unit: 'active', status: 'info', trend: '1 deploying', trendUp: true, svgPath: ICONS.deploy, wide: true },
    { label: 'My Pipelines', value: '8', unit: 'total', status: 'healthy', trend: '7 passing', trendUp: true, svgPath: ICONS.pipeline },
    { label: 'Latest Build', value: 'Pass', unit: '', status: 'healthy', trend: '2 min ago', svgPath: ICONS.shield },
    { label: 'Failed Builds', value: '1', unit: 'last 7d', status: 'error', trend: 'auth-svc', svgPath: ICONS.incident },
    { label: 'Provision Requests', value: '2', unit: 'pending', status: 'warning', trend: '1 approved', svgPath: ICONS.approval },
    { label: 'Notifications', value: '4', unit: 'unread', status: 'info', trend: '2 warnings', svgPath: ICONS.notification },
    { label: 'Recommendations', value: '3', unit: 'active', status: 'healthy', trend: 'Cost savings', svgPath: ICONS.recommendation },
  ],
  quickActions: [
    { label: 'Trigger Deployment', svgPath: ICONS.deploy, primary: true },
    { label: 'New Provision Request', svgPath: ICONS.plus, primary: true },
    { label: 'View My Pipelines', svgPath: ICONS.pipeline },
    { label: 'Restart My Deployment', svgPath: ICONS.pipeline },
    { label: 'Open Build Logs', svgPath: ICONS.monitor },
    { label: 'Ask AI Assistant', svgPath: ICONS.ai },
  ],
  recentActivity: [
    { actor: 'you', action: 'triggered deployment', target: 'payments-service v2.4.1', time: '2 min ago', type: 'deploy' },
    { actor: 'CI', action: 'pipeline finished', target: 'auth-service #142 \u2714', time: '15 min ago', type: 'deploy' },
    { actor: 'CI', action: 'build failed', target: 'api-gateway #89 \u2718', time: '1 hr ago', type: 'incident' },
    { actor: 'System', action: 'request approved', target: 'PR-1042 Redis cluster', time: '2 hr ago', type: 'provision' },
    { actor: 'you', action: 'created request', target: 'PR-1043 PostgreSQL HA', time: '3 hr ago', type: 'provision' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// VIEWER — Lightweight monitoring
// ═══════════════════════════════════════════════════════════════
const VIEWER_CONFIG: DashboardConfig = {
  title: 'Platform Status',
  subtitle: 'Read-Only Monitoring View',
  showServiceHealth: false,
  showRoadmap: false,
  emptyStateMessage: 'No incidents. Platform is stable.',
  kpiWidgets: [
    { label: 'Platform Status', value: 'Operational', unit: '', status: 'healthy', trend: '99.9% uptime', svgPath: ICONS.globe, wide: true },
    { label: 'Running Services', value: '24', unit: 'healthy', status: 'healthy', trend: '1 degraded', svgPath: ICONS.shield },
    { label: 'Current Incidents', value: '1', unit: 'P3', status: 'warning', trend: 'Under investigation', svgPath: ICONS.incident },
    { label: 'Notifications', value: '4', unit: 'unread', status: 'info', trend: '2 warnings', svgPath: ICONS.notification },
    { label: 'Recommendations', value: '3', unit: 'available', status: 'healthy', trend: 'Review suggested', svgPath: ICONS.recommendation },
  ],
  quickActions: [
    { label: 'View Recommendations', svgPath: ICONS.recommendation },
  ],
  recentActivity: [
    { actor: 'System', action: 'incident opened', target: 'INC-0081 API latency spike', time: '14 min ago', type: 'incident' },
    { actor: 'System', action: 'incident resolved', target: 'INC-0080 DB timeout', time: '2 hr ago', type: 'incident' },
    { actor: 'System', action: 'maintenance scheduled', target: 'DB upgrade window Sat 02:00', time: '5 hr ago', type: 'deploy' },
    { actor: 'System', action: 'platform announcement', target: 'Sprint 2 planning next Monday', time: '1 day ago', type: 'deploy' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// AUDITOR — Security & Compliance
// ═══════════════════════════════════════════════════════════════
const AUDITOR_CONFIG: DashboardConfig = {
  title: 'Security & Compliance',
  subtitle: 'Audit, Governance & Access Control',
  showServiceHealth: false,
  showRoadmap: false,
  emptyStateMessage: 'No compliance violations detected.',
  kpiWidgets: [
    { label: 'Compliance Score', value: '94', unit: '%', status: 'healthy', trend: '+2% this week', trendUp: true, svgPath: ICONS.shield, wide: true },
    { label: 'Audit Events Today', value: '142', unit: 'events', status: 'neutral', trend: 'Normal volume', svgPath: ICONS.audit },
    { label: 'Failed Logins', value: '7', unit: 'last 24h', status: 'warning', trend: '3 from same IP', svgPath: ICONS.lock },
    { label: 'Role Changes', value: '2', unit: 'this week', status: 'info', trend: 'Within policy', svgPath: ICONS.users },
    { label: 'Permission Changes', value: '4', unit: 'this week', status: 'info', trend: 'DEVELOPER role', svgPath: ICONS.lock },
    { label: 'Security Alerts', value: '1', unit: 'active', status: 'warning', trend: 'Brute force attempt', svgPath: ICONS.incident },
    { label: 'Open Incidents', value: '1', unit: 'P3', status: 'warning', trend: 'Security related', svgPath: ICONS.incident },
  ],
  quickActions: [
    { label: 'Export Audit Logs', svgPath: ICONS.download, primary: true },
    { label: 'Search Audit Logs', svgPath: ICONS.audit, primary: true },
    { label: 'View User Activity', svgPath: ICONS.users },
    { label: 'Download Compliance Report', svgPath: ICONS.download },
  ],
  recentActivity: [
    { actor: 'System', action: 'failed login', target: 'unknown@external.com (blocked)', time: '5 min ago', type: 'audit' },
    { actor: 'admin', action: 'permission modified', target: 'DEVELOPER +VIEW_GITOPS', time: '35 min ago', type: 'audit' },
    { actor: 'admin', action: 'role modified', target: 'AUDITOR description updated', time: '1 hr ago', type: 'audit' },
    { actor: 'System', action: 'audit exported', target: 'compliance-report-Q1.csv', time: '3 hr ago', type: 'audit' },
    { actor: 'System', action: 'security policy updated', target: 'Password policy v2', time: '1 day ago', type: 'audit' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// Export the config selector
// ═══════════════════════════════════════════════════════════════
export function getDashboardConfig(role: UserRole | null): DashboardConfig {
  switch (role) {
    case 'ADMIN': return ADMIN_CONFIG;
    case 'PLATFORM_ENGINEER': return PLATFORM_ENGINEER_CONFIG;
    case 'DEVELOPER': return DEVELOPER_CONFIG;
    case 'VIEWER': return VIEWER_CONFIG;
    case 'AUDITOR': return AUDITOR_CONFIG;
    default: return VIEWER_CONFIG;
  }
}

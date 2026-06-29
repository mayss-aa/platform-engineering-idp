/**
 * Dashboard data models — defines the shape of all KPI widget data.
 * Each widget has its own interface so it can fail/load independently.
 */

export interface KpiWidgetData {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  status: 'healthy' | 'warning' | 'error' | 'info' | 'neutral';
  icon: string;
}

export interface ActivityFeedEntry {
  actor: string;
  action: string;
  target: string;
  time: string;
  type: string;
}

export interface ServiceHealthEntry {
  name: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  uptime: string;
  latency: string;
}

/** Aggregated dashboard data returned by the service. */
export interface DashboardData {
  kpiWidgets: KpiWidgetData[];
  recentActivity: ActivityFeedEntry[];
  serviceHealth: ServiceHealthEntry[];
}

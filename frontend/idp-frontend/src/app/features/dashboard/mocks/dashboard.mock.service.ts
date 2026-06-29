import { Injectable } from '@angular/core';
import { DashboardData } from '../models/dashboard.models';

/**
 * DashboardMockService — provides realistic mock data for the Dashboard.
 * Used by DashboardService when FeatureReadinessLevel is MOCK.
 */
@Injectable({ providedIn: 'root' })
export class DashboardMockService {
  getDashboardData(): DashboardData {
    return {
      kpiWidgets: [
        { label: 'Cluster Health', value: '99.9', unit: '%', status: 'healthy', trend: 'All nodes healthy', trendUp: true, icon: 'shield' },
        { label: 'Deployments', value: '12', unit: 'running', status: 'info', trend: '+2 today', trendUp: true, icon: 'deploy' },
        { label: 'Terraform', value: '4', unit: 'jobs', status: 'info', trend: '2 pending', icon: 'terraform' },
        { label: 'Cloud Cost', value: '\u20AC3,241', unit: '/mo', status: 'info', trend: '-7%', trendUp: true, icon: 'cloud' },
        { label: 'CPU', value: '64', unit: '%', status: 'warning', trend: '+8%', trendUp: false, icon: 'cpu' },
        { label: 'Memory', value: '71', unit: '%', status: 'warning', trend: '14.2/20GB', icon: 'memory' },
        { label: 'Storage', value: '2.4', unit: 'TB', status: 'neutral', trend: '58%', icon: 'storage' },
        { label: 'Incidents', value: '1', unit: 'P3', status: 'warning', trend: 'No P1/P2', icon: 'incident' },
        { label: 'Approvals', value: '5', unit: 'pending', status: 'warning', trend: '3 provision', icon: 'approval' },
        { label: 'Pipelines', value: '2', unit: 'failed', status: 'error', trend: 'Down from 5', trendUp: true, icon: 'pipeline' },
        { label: 'Audit Events', value: '142', unit: 'today', status: 'neutral', trend: 'Normal', icon: 'audit' },
        { label: 'Users', value: '47', unit: 'active', status: 'healthy', trend: '+3 this week', trendUp: true, icon: 'users' },
        { label: 'Notifications', value: '7', unit: 'unread', status: 'info', trend: '3 warnings', icon: 'notification' },
        { label: 'Recommendations', value: '4', unit: 'active', status: 'healthy', trend: 'Cost savings', icon: 'recommendation' },
      ],
      recentActivity: [
        { actor: 'alice.martin', action: 'triggered deployment', target: 'payments-service v2.4.1', time: '2 min ago', type: 'deploy' },
        { actor: 'bob.chen', action: 'approved request', target: 'PR-1042 Redis cluster', time: '8 min ago', type: 'provision' },
        { actor: 'System', action: 'escalated incident', target: 'INC-0081 API latency', time: '14 min ago', type: 'incident' },
        { actor: 'carol.dubois', action: 'applied terraform', target: 'prod-aks-cluster-v3', time: '22 min ago', type: 'terraform' },
        { actor: 'david.kwame', action: 'joined team', target: 'Platform Engineering', time: '35 min ago', type: 'user' },
        { actor: 'System', action: 'auto-scaled', target: 'api-gateway \u2192 6 replicas', time: '1 hr ago', type: 'deploy' },
        { actor: 'emma.schulz', action: 'created request', target: 'PR-1043 PostgreSQL HA', time: '1.5 hr ago', type: 'provision' },
        { actor: 'System', action: 'permission changed', target: 'DEVELOPER role updated', time: '2 hr ago', type: 'audit' },
      ],
      serviceHealth: [
        { name: 'API Gateway', status: 'HEALTHY', uptime: '99.97%', latency: '42 ms' },
        { name: 'Auth Service', status: 'HEALTHY', uptime: '99.99%', latency: '18 ms' },
        { name: 'Deployment Engine', status: 'HEALTHY', uptime: '99.82%', latency: '310 ms' },
        { name: 'Terraform Runner', status: 'DEGRADED', uptime: '98.10%', latency: '1.2 s' },
        { name: 'Metrics Collector', status: 'HEALTHY', uptime: '99.91%', latency: '70 ms' },
        { name: 'Log Aggregator', status: 'UNAVAILABLE', uptime: '95.40%', latency: 'N/A' },
      ],
    };
  }
}

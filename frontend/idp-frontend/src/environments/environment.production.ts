import { FeatureReadinessLevel } from '../app/core/models/resource-state.models';

export const environment = {
  production: true,
  apiBaseUrl: '/api',
  grafanaUrl: '/grafana',
  featureFlags: {
    dashboard: 'LIVE' as FeatureReadinessLevel,
    'service-catalog': 'LIVE' as FeatureReadinessLevel,
    'provision-requests': 'LIVE' as FeatureReadinessLevel,
    deployments: 'LIVE' as FeatureReadinessLevel,
    terraform: 'LIVE' as FeatureReadinessLevel,
    cicd: 'LIVE' as FeatureReadinessLevel,
    infrastructure: 'LIVE' as FeatureReadinessLevel,
    containers: 'LIVE' as FeatureReadinessLevel,
    kubernetes: 'LIVE' as FeatureReadinessLevel,
    'cloud-resources': 'LIVE' as FeatureReadinessLevel,
    monitoring: 'LIVE' as FeatureReadinessLevel,
    notifications: 'LIVE' as FeatureReadinessLevel,
    incidents: 'LIVE' as FeatureReadinessLevel,
    recommendations: 'LIVE' as FeatureReadinessLevel,
    organizations: 'LIVE' as FeatureReadinessLevel,
    teams: 'LIVE' as FeatureReadinessLevel,
    users: 'LIVE' as FeatureReadinessLevel,
    settings: 'LIVE' as FeatureReadinessLevel,
    'ai-assistant': 'LIVE' as FeatureReadinessLevel,
  } as Record<string, FeatureReadinessLevel>
};

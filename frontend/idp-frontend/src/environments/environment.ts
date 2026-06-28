import { FeatureReadinessLevel } from '../app/core/models/resource-state.models';

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  grafanaUrl: 'http://localhost:3000',
  featureFlags: {
    dashboard: 'MOCK' as FeatureReadinessLevel,
    'service-catalog': 'MOCK' as FeatureReadinessLevel,
    'provision-requests': 'MOCK' as FeatureReadinessLevel,
    deployments: 'MOCK' as FeatureReadinessLevel,
    terraform: 'MOCK' as FeatureReadinessLevel,
    cicd: 'MOCK' as FeatureReadinessLevel,
    infrastructure: 'MOCK' as FeatureReadinessLevel,
    containers: 'MOCK' as FeatureReadinessLevel,
    kubernetes: 'MOCK' as FeatureReadinessLevel,
    'cloud-resources': 'MOCK' as FeatureReadinessLevel,
    monitoring: 'MOCK' as FeatureReadinessLevel,
    notifications: 'MOCK' as FeatureReadinessLevel,
    incidents: 'MOCK' as FeatureReadinessLevel,
    recommendations: 'MOCK' as FeatureReadinessLevel,
    organizations: 'MOCK' as FeatureReadinessLevel,
    teams: 'MOCK' as FeatureReadinessLevel,
    users: 'MOCK' as FeatureReadinessLevel,
    settings: 'MOCK' as FeatureReadinessLevel,
    'ai-assistant': 'MOCK' as FeatureReadinessLevel,
  } as Record<string, FeatureReadinessLevel>
};

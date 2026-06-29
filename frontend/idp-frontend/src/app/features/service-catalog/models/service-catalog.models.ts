/**
 * Service Catalog data models.
 */

export type ServiceLifecycleStatus = 'ACTIVE' | 'DEPRECATED' | 'BETA' | 'EXPERIMENTAL';
export type ServiceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';

export interface CatalogService {
  id: string;
  name: string;
  description: string;
  owner: string;
  organization: string;
  team: string;
  category: string;
  technologyStack: string[];
  runtime: string;
  programmingLanguage: string;
  deploymentType: string;
  cloudProvider: string;
  kubernetesNamespace: string;
  version: string;
  lifecycleStatus: ServiceLifecycleStatus;
  healthStatus: ServiceHealthStatus;
  repositoryUrl: string;
  documentationUrl: string;
  lastDeployment: string; // ISO 8601
  tags: string[];
}

export interface ServiceCatalogData {
  services: CatalogService[];
  totalCount: number;
}

# Design Document — Enterprise Internal Developer Platform Frontend

## Overview

The Enterprise IDP Frontend is an Angular 20 single-page application that serves as the
unified control plane for a platform engineering team. It is architected as a **progressive
IDP** whose 19 Feature_Modules are fully scaffolded from Sprint 1 — every route is live,
every store is populated, and every UI renders real data (mock or live) on day one.

The platform draws inspiration from Azure Portal (dense information density, dark sidebar),
Backstage (service catalog metaphor), GitHub (pipeline and deployment UX), and GitLab
(RBAC and audit trail depth). The design is authored at Staff Engineer level and is
production-grade from the first commit.

### Core Architectural Principles

1. **Zero NgModules** — every component is `standalone: true`; only `AppModule` exists as
   a bootstrap shell.
2. **All-19 scaffolded from Sprint 1** — no "coming soon" pages; mock data fills every view
   until backend integration is activated.
3. **Data_Source_Strategy** — a single `environment.ts` flag per feature switches the store
   from `MockAdapter` to live `ApiService`; zero component changes required.
4. **Feature_Flag_Service via Signals** — exposes each module's `FeatureReadinessLevel` as
   `Signal<Record<string, FeatureReadinessLevel>>`.
5. **19 Signal-based stores** — one per feature, all initialized with Mock data.
6. **RBAC everywhere, readiness nowhere** — `RbacGuard` enforces roles; readiness level
   never blocks navigation.
7. **Design tokens** — all color, spacing, and typography values live in CSS custom
   properties; zero hardcoded hex values in component SCSS.
8. **Responsive at three breakpoints** — Desktop ≥1280px, Tablet 768–1279px, Mobile <768px.
9. **Docker multi-stage → K8s/AKS ready** — production image <150 MB, manifests included.


---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser (SPA)                              │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  AppModule (bootstrap only)                                 │   │
│  │  ┌──────────────┐  ┌───────────────────────────────────┐   │   │
│  │  │  AppComponent │  │  Angular Router                   │   │   │
│  │  │  (root host)  │  │  19 lazy routes + auth routes     │   │   │
│  │  └──────┬───────┘  └──────────────────┬────────────────┘   │   │
│  │         │                             │                     │   │
│  │  ┌──────▼──────────────────────────────▼────────────────┐  │   │
│  │  │  LayoutComponent (Shell)                              │  │   │
│  │  │  ┌────────────┐  ┌───────────┐  ┌─────────────────┐  │  │   │
│  │  │  │  TopNavBar │  │  Sidebar  │  │  <router-outlet> │  │  │   │
│  │  │  └────────────┘  └───────────┘  └────────┬────────┘  │  │   │
│  │  └─────────────────────────────────────────┼────────────┘  │   │
│  │                                             │               │   │
│  │  ┌──────────────────────────────────────────▼────────────┐ │   │
│  │  │  Feature Module (lazy bundle, e.g. DeploymentsModule)  │ │   │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │ │   │
│  │  │  │ FeaturePage  │  │ FeatureStore │  │ FeatureService│  │ │   │
│  │  │  │ (component)  │  │ (Signal)     │  │(DataSource)  │  │ │   │
│  │  │  └──────────────┘  └──────┬───────┘  └──────┬──────┘  │ │   │
│  │  └─────────────────────────┼──────────────────┼──────────┘ │   │
│  │                             │                  │            │   │
│  │  ┌──────────────────────────┼──────────────────┼──────────┐ │   │
│  │  │  Core Module             │                  │          │ │   │
│  │  │  ┌───────────────┐  ┌───▼────────────┐  ┌──▼───────┐  │ │   │
│  │  │  │ Auth_Service  │  │ FeatureFlag    │  │ Mock OR  │  │ │   │
│  │  │  │ Permission_Svc│  │ Service(Signal)│  │ ApiGateway│  │ │   │
│  │  │  │ Theme_Service │  └────────────────┘  └──────────┘  │ │   │
│  │  │  │ Notification  │  ┌───────────────────────────────┐  │ │   │
│  │  │  │ ErrorHandler  │  │  HTTP Interceptor (JWT attach) │  │ │   │
│  │  │  └───────────────┘  └───────────────────────────────┘  │ │   │
│  │  └────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │ HTTP / REST (JWT Bearer)
          ▼
┌─────────────────────────┐
│  Spring Boot 3 Backend  │
│  (Java 21, REST + JWT)  │
└─────────────────────────┘
```


### Layered Architecture

```
┌─────────────────────────────────────────────────┐
│  Presentation Layer                             │
│  Standalone Components + Shared Components     │
│  Consume Signals; never call HttpClient         │
├─────────────────────────────────────────────────┤
│  Feature State Layer                            │
│  19 Signal Stores (ResourceState_Pattern)       │
│  Own loading / error / data per feature         │
├─────────────────────────────────────────────────┤
│  Service / Data-Source Layer                    │
│  Feature Services → Data_Source_Strategy        │
│  Delegates to MockAdapter OR ApiGatewayService  │
├─────────────────────────────────────────────────┤
│  Core Layer                                     │
│  Auth, Permissions, FeatureFlags, Theme,        │
│  Notifications, ErrorHandler, AuditLog,         │
│  MockDataService, HTTP Interceptor              │
├─────────────────────────────────────────────────┤
│  Infrastructure Layer                           │
│  environment.ts, Docker, K8s manifests          │
└─────────────────────────────────────────────────┘
```

Dependency rules (strictly enforced, no circular imports):
- Presentation → Feature State, Core, Shared
- Feature State → Service/Data-Source, Core
- Service/Data-Source → Core
- Core → nothing internal (only Angular primitives and third-party libs)
- Shared → Core (pipes, tokens only); never → Feature


---

## Components and Interfaces

### Component Hierarchy

```
AppComponent (root)
└── RouterOutlet
    ├── AuthPageComponent          (/auth/login)  — standalone, no layout
    ├── ErrorPageComponent         (/403, /404)   — standalone, no layout
    └── LayoutComponent            (all authenticated routes)
        ├── TopNavComponent
        │   ├── BreadcrumbComponent
        │   ├── NotificationBellComponent
        │   ├── ThemeToggleComponent
        │   └── UserProfileMenuComponent
        ├── SidebarComponent
        │   └── NavItemComponent (×19)
        ├── FloatingAiWidgetComponent (global, always rendered)
        └── RouterOutlet (feature pages)
            ├── DashboardPageComponent
            │   ├── KpiWidgetComponent (×13)
            │   └── ActivityFeedComponent
            ├── ServiceCatalogPageComponent
            │   ├── DataTableComponent
            │   ├── SearchBarComponent
            │   └── FilterPanelComponent
            ├── [... 17 more feature pages ...]
            └── SettingsPageComponent
                ├── ProfileSectionComponent
                ├── SecuritySectionComponent
                ├── AppearanceSectionComponent
                ├── NotificationPrefSectionComponent
                ├── ApiTokensSectionComponent
                └── SystemConfigSectionComponent (admin only)
```

### Shared Components Specification

All 12 shared components live under `src/app/shared/components/`, each in its own directory
with `component.ts`, `component.html`, `component.scss`, and `component.spec.ts`.

#### 1. StatusBadge

| Input | Type | Description |
|-------|------|-------------|
| `status` | `string` | The status value to display |
| `colorMap` | `Record<string, string>` | Maps status strings to CSS class names |
| `size` | `'sm' \| 'md' \| 'lg'` | Badge size; default `'md'` |

Output: None. Pure display component.

```typescript
// Usage example
<idp-status-badge
  [status]="deployment.status"
  [colorMap]="deploymentColorMap"
/>
// colorMap = { RUNNING: 'badge-green', FAILED: 'badge-red', ... }
```

#### 2. DataTable

| Input | Type | Description |
|-------|------|-------------|
| `columns` | `ColumnDef<T>[]` | Column definitions (label, field, sortable, cellTemplate) |
| `data` | `T[]` | Row data array |
| `pageSize` | `number` | Rows per page; default 20 |
| `loading` | `boolean` | Renders skeleton rows when true |
| `totalCount` | `number` | Total items for server-side pagination |

| Output | Type | Description |
|--------|------|-------------|
| `pageChange` | `EventEmitter<PageEvent>` | Emitted on page navigation |
| `sortChange` | `EventEmitter<SortEvent>` | Emitted on column header click |

Client-side sort cycle: none → ASC → DESC → none.

#### 3. ConfirmDialog

| Input | Type | Description |
|-------|------|-------------|
| `title` | `string` | Dialog heading |
| `message` | `string` | Body text |
| `confirmLabel` | `string` | Confirm button label; default `'Confirm'` |
| `danger` | `boolean` | Renders confirm button in destructive red style |

| Output | Type | Description |
|--------|------|-------------|
| `confirmed` | `EventEmitter<void>` | Emitted when user confirms |
| `dismissed` | `EventEmitter<void>` | Emitted when user cancels or presses Escape |

Focus trapped inside dialog; restored to trigger element on close.


#### 4. LogViewer

| Input | Type | Description |
|-------|------|-------------|
| `lines` | `string[]` | Log line strings |
| `streaming` | `boolean` | Auto-scrolls to bottom when true |
| `syntaxHighlight` | `boolean` | Applies keyword coloring (ERROR/WARN/INFO) |

Behavior: when `streaming=true` and user scrolls up, auto-scroll pauses and a "↓ Scroll to
bottom" button appears. Clicking it re-enables auto-scroll.

#### 5. MetricCard

| Input | Type | Description |
|-------|------|-------------|
| `label` | `string` | Card title |
| `value` | `string \| number` | Primary metric value |
| `unit` | `string \| undefined` | Unit suffix (%, GB, etc.) |
| `trend` | `'up' \| 'down' \| 'stable' \| undefined` | Trend arrow |
| `loading` | `boolean` | Renders skeleton when true |
| `error` | `string \| null` | Error message with retry button |

| Output | Type | Description |
|--------|------|-------------|
| `retry` | `EventEmitter<void>` | Emitted when user clicks retry in error state |

#### 6. PageHeader

| Input | Type | Description |
|-------|------|-------------|
| `title` | `string` | Page heading |
| `breadcrumbs` | `BreadcrumbItem[]` | `{ label, route? }` array |

Content projection: `<ng-content select="[actions]">` for action buttons.

#### 7. EmptyState

| Input | Type | Description |
|-------|------|-------------|
| `icon` | `string` | Material icon name |
| `primaryMessage` | `string` | Main descriptive text |
| `secondaryMessage` | `string \| undefined` | Optional sub-text |

Icon renders at minimum 48×48px.

#### 8. LoadingSpinner

| Input | Type | Description |
|-------|------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | Spinner size |
| `label` | `string \| undefined` | Accessible ARIA label |

#### 9. ErrorAlert

| Input | Type | Description |
|-------|------|-------------|
| `message` | `string` | Error description |
| `showRetry` | `boolean` | Renders retry button |

| Output | Type | Description |
|--------|------|-------------|
| `retry` | `EventEmitter<void>` | Emitted on retry click |

#### 10. SearchBar

| Input | Type | Description |
|-------|------|-------------|
| `placeholder` | `string` | Input placeholder text |
| `debounceMs` | `number` | Keystroke debounce; default 300 |
| `initialValue` | `string` | Pre-filled search term |

| Output | Type | Description |
|--------|------|-------------|
| `search` | `EventEmitter<string>` | Emitted after debounce with current value |

#### 11. FilterPanel

| Input | Type | Description |
|-------|------|-------------|
| `config` | `FilterFieldDef[]` | Field definitions: `{ key, label, type, options }` |
| `initialValues` | `Record<string, unknown>` | Pre-applied filter values |

| Output | Type | Description |
|--------|------|-------------|
| `filterChange` | `EventEmitter<Record<string, unknown>>` | All active criteria |

Filter types supported: `dropdown`, `checkbox`, `date-range`, `multi-select`.

#### 12. TimelineComponent

| Input | Type | Description |
|-------|------|-------------|
| `events` | `TimelineEvent[]` | `{ timestamp, actor, action, description? }` array |
| `order` | `'asc' \| 'desc'` | Chronological order; default `'asc'` |

Renders vertical connecting line between entries. Timestamps formatted as relative time
(e.g., "3 hours ago") with absolute tooltip on hover.


---

## Data Models

### Core Models (`src/app/core/models/`)

```typescript
// auth.models.ts
export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  organizationId: string | null;
  lastLogin: string;        // ISO 8601
}

export type UserRole = 'ADMIN' | 'DEVELOPER' | 'VIEWER' | 'APPROVER' | 'OPERATOR';

export interface AuthTokens {
  accessToken: string;      // in-memory only
  refreshToken?: string;    // session or cookie-backed
  expiresAt: number;        // Unix timestamp
}

// rbac.models.ts
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

// resource-state.models.ts
export interface ResourceState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

export type FeatureReadinessLevel = 'MOCK' | 'PARTIAL' | 'LIVE';

// audit-log.models.ts
export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorDisplayName: string;
  action: string;
  targetEntityType: string;
  targetEntityId: string;
  ipAddress: string;
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
}

// notification.models.ts
export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}
```

### Feature Data Models

Each feature module defines its own models in `features/{name}/models/`. Key interfaces are
summarized in the Module Inventory section below.

### ResourceState Pattern

```typescript
// All 19 stores expose this shape per resource type:
export function createInitialState<T>(): ResourceState<T> {
  return { loading: false, error: null, data: null };
}

// Store usage (example: DeploymentStore)
export class DeploymentStore {
  deployments = signal<ResourceState<Deployment[]>>(createInitialState());
  selected   = signal<ResourceState<Deployment>>(createInitialState());

  load() {
    this.deployments.set({ loading: true, error: null, data: null });
    this.dataSource.getDeployments().subscribe({
      next: (data) => this.deployments.set({ loading: false, error: null, data }),
      error: (err) => this.deployments.set({
        loading: false,
        error: err.message,
        data: null
      })
    });
  }
}
```


---

## Module Inventory

All 19 feature modules are registered from Sprint 1. The table below is authoritative.

| # | Module Dir | Route Prefix | Store Name | Mock Service | Required Permissions |
|---|-----------|--------------|------------|--------------|----------------------|
| 1 | `dashboard` | `/dashboard` | `DashboardStore` | `DashboardMockService` | `authenticated` |
| 2 | `service-catalog` | `/service-catalog` | `ServiceCatalogStore` | `ServiceCatalogMockService` | `provision-requests:read` |
| 3 | `provision-requests` | `/provision-requests` | `ProvisionRequestStore` | `ProvisionRequestMockService` | `provision-requests:read` |
| 4 | `deployments` | `/deployments` | `DeploymentStore` | `DeploymentMockService` | `deployments:read` |
| 5 | `terraform` | `/terraform` | `TerraformStore` | `TerraformMockService` | `terraform:read` |
| 6 | `cicd` | `/cicd` | `CicdStore` | `CicdMockService` | `deployments:read` |
| 7 | `infrastructure` | `/infrastructure` | `InfrastructureStore` | `InfrastructureMockService` | `cloud:read` |
| 8 | `containers` | `/containers` | `ContainerStore` | `ContainerMockService` | `containers:read` |
| 9 | `kubernetes` | `/kubernetes` | `KubernetesStore` | `KubernetesMockService` | `kubernetes:read` |
| 10 | `cloud-resources` | `/cloud-resources` | `CloudResourceStore` | `CloudResourceMockService` | `cloud:read` |
| 11 | `monitoring` | `/monitoring` | `MonitoringStore` | `MonitoringMockService` | `monitoring:read` |
| 12 | `notifications` | `/notifications` | `NotificationStore` | `NotificationMockService` | `authenticated` |
| 13 | `incidents` | `/incidents` | `IncidentStore` | `IncidentMockService` | `incidents:read` |
| 14 | `recommendations` | `/recommendations` | `RecommendationStore` | `RecommendationMockService` | `recommendations:read` |
| 15 | `organizations` | `/organizations` | `OrganizationStore` | `OrganizationMockService` | `organizations:read` |
| 16 | `teams` | `/teams` | `TeamStore` | `TeamMockService` | `teams:read` |
| 17 | `users` | `/users` | `UserStore` | `UserMockService` | `users:read` |
| 18 | `settings` | `/settings` | `SettingsStore` | `SettingsMockService` | `authenticated` |
| 19 | `ai-assistant` | `/ai-assistant` | `AiAssistantStore` | `AiAssistantMockService` | `ai-assistant:read` |

### Sidebar Navigation Groups

```
▶ Platform Overview
    Dashboard
▶ Developer Tools
    Service Catalog
    Provision Requests
    Deployments
    Terraform
    CI/CD
▶ Infrastructure
    Infrastructure
    Containers
    Kubernetes
    Cloud Resources
▶ Observability
    Monitoring
    Notifications
    Incidents
    Recommendations
▶ Administration
    Organizations
    Teams
    Users
    Settings
▶ AI
    AI Assistant
```


---

## Routing Table

```typescript
// src/app/app.routes.ts  (abbreviated, all 19 routes registered from Sprint 1)
export const APP_ROUTES: Routes = [
  // Public
  { path: 'auth/login',   loadComponent: () => import('./pages/auth/login.page') },

  // Error pages
  { path: '403',          loadComponent: () => import('./pages/error/403.page') },
  { path: '404',          loadComponent: () => import('./pages/error/404.page') },

  // Authenticated shell
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '',             redirectTo: 'dashboard', pathMatch: 'full' },

      // 1 — Dashboard (preloaded)
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes'),
        title: 'Dashboard — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: [] }
      },
      // 2 — Service Catalog (preloaded)
      {
        path: 'service-catalog',
        loadChildren: () => import('./features/service-catalog/service-catalog.routes'),
        title: 'Service Catalog — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['provision-requests:read'] }
      },
      // 3 — Provision Requests
      {
        path: 'provision-requests',
        loadChildren: () => import('./features/provision-requests/provision-requests.routes'),
        title: 'Provision Requests — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['provision-requests:read'] },
        children: [{ path: ':id', loadComponent: () => import('./features/provision-requests/pages/detail.page') }]
      },
      // 4 — Deployments
      {
        path: 'deployments',
        loadChildren: () => import('./features/deployments/deployments.routes'),
        title: 'Deployments — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['deployments:read'] },
        children: [{ path: ':id', loadComponent: () => import('./features/deployments/pages/detail.page') }]
      },
      // 5 — Terraform
      {
        path: 'terraform',
        loadChildren: () => import('./features/terraform/terraform.routes'),
        title: 'Terraform — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['terraform:read'] },
        children: [{ path: 'workspaces/:id', loadComponent: () => import('./features/terraform/pages/workspace.page') }]
      },
      // 6 — CI/CD
      {
        path: 'cicd',
        loadChildren: () => import('./features/cicd/cicd.routes'),
        title: 'CI/CD — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['deployments:read'] }
      },
      // 7 — Infrastructure
      {
        path: 'infrastructure',
        loadChildren: () => import('./features/infrastructure/infrastructure.routes'),
        title: 'Infrastructure — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['cloud:read'] }
      },
      // 8 — Containers
      {
        path: 'containers',
        loadChildren: () => import('./features/containers/containers.routes'),
        title: 'Containers — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['containers:read'] },
        children: [{ path: ':id', loadComponent: () => import('./features/containers/pages/detail.page') }]
      },
      // 9 — Kubernetes
      {
        path: 'kubernetes',
        loadChildren: () => import('./features/kubernetes/kubernetes.routes'),
        title: 'Kubernetes — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['kubernetes:read'] },
        children: [
          { path: 'pods/:namespace',        loadComponent: () => import('./features/kubernetes/pages/pods.page') },
          { path: 'deployments/:namespace', loadComponent: () => import('./features/kubernetes/pages/k8s-deployments.page') },
          { path: 'nodes/:name',            loadComponent: () => import('./features/kubernetes/pages/node.page') }
        ]
      },
      // 10 — Cloud Resources
      {
        path: 'cloud-resources',
        loadChildren: () => import('./features/cloud-resources/cloud-resources.routes'),
        title: 'Cloud Resources — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['cloud:read'] }
      },
      // 11 — Monitoring
      {
        path: 'monitoring',
        loadChildren: () => import('./features/monitoring/monitoring.routes'),
        title: 'Monitoring — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['monitoring:read'] },
        children: [{ path: 'alerts/:id', loadComponent: () => import('./features/monitoring/pages/alert.page') }]
      },
      // 12 — Notifications
      {
        path: 'notifications',
        loadChildren: () => import('./features/notifications/notifications.routes'),
        title: 'Notifications — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: [] }
      },
      // 13 — Incidents
      {
        path: 'incidents',
        loadChildren: () => import('./features/incidents/incidents.routes'),
        title: 'Incidents — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['incidents:read'] },
        children: [{ path: ':id', loadComponent: () => import('./features/incidents/pages/detail.page') }]
      },
      // 14 — Recommendations
      {
        path: 'recommendations',
        loadChildren: () => import('./features/recommendations/recommendations.routes'),
        title: 'Recommendations — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['recommendations:read'] }
      },
      // 15 — Organizations
      {
        path: 'organizations',
        loadChildren: () => import('./features/organizations/organizations.routes'),
        title: 'Organizations — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['organizations:read'] }
      },
      // 16 — Teams
      {
        path: 'teams',
        loadChildren: () => import('./features/teams/teams.routes'),
        title: 'Teams — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['teams:read'] }
      },
      // 17 — Users
      {
        path: 'users',
        loadChildren: () => import('./features/users/users.routes'),
        title: 'Users — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['users:read'] }
      },
      // 18 — Settings
      {
        path: 'settings',
        loadChildren: () => import('./features/settings/settings.routes'),
        title: 'Settings — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: [] }
      },
      // 19 — AI Assistant
      {
        path: 'ai-assistant',
        loadChildren: () => import('./features/ai-assistant/ai-assistant.routes'),
        title: 'AI Assistant — IDP Platform',
        canActivate: [RbacGuard],
        data: { requiredPermissions: ['ai-assistant:read'] }
      }
    ]
  },

  // Catch-all
  { path: '**', redirectTo: '404' }
];
```

**Preloading strategy**: `SelectivePreloadingStrategy` preloads `dashboard` and
`service-catalog` bundles after initial boot. All other bundles are deferred.


---

## State Management Design

### ResourceState Pattern

Every HTTP-backed Signal store exposes a consistent `ResourceState<T>` shape. This is the
single source of truth for loading, error, and data states in all 19 feature stores.

```typescript
// src/app/core/models/resource-state.models.ts
export interface ResourceState<T> {
  loading: boolean;
  error: string | null;
  data: T | null;
}

// State machine for ResourceState transitions:
//
//  IDLE ──[load()]──► LOADING ──[success]──► SUCCESS
//                         │
//                         └──[error]───────► ERROR ──[retry()]──► LOADING
//
// Invariant: loading===true => error===null (clearing error is atomic with setting loading)
```

### Signal Store Shape

```typescript
// Example: DeploymentStore (all 19 stores follow this pattern)
// src/app/features/deployments/store/deployment.store.ts

@Injectable({ providedIn: 'root' })
export class DeploymentStore implements OnDestroy {
  // State signals
  readonly deployments = signal<ResourceState<Deployment[]>>(
    { loading: false, error: null, data: null }
  );
  readonly selected = signal<ResourceState<Deployment>>(
    { loading: false, error: null, data: null }
  );

  // Derived signals (computed)
  readonly runningCount = computed(
    () => this.deployments().data?.filter(d => d.status === 'RUNNING').length ?? 0
  );

  private destroy$ = new Subject<void>();

  constructor(
    private readonly deploymentService: DeploymentService,
    private readonly flagService: FeatureFlagService
  ) {}

  load(): void {
    this.deployments.set({ loading: true, error: null, data: null });
    this.deploymentService.getDeployments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.deployments.set({ loading: false, error: null, data }),
        error: err => this.deployments.set({ loading: false, error: err.message, data: null })
      });
  }

  loadOne(id: string): void {
    this.selected.set({ loading: true, error: null, data: null });
    this.deploymentService.getDeployment(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => this.selected.set({ loading: false, error: null, data }),
        error: err => this.selected.set({ loading: false, error: err.message, data: null })
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Data_Source_Strategy

```typescript
// src/app/features/deployments/services/deployment.service.ts
// The single switch point: no component ever touches this logic.

@Injectable({ providedIn: 'root' })
export class DeploymentService {
  private isLive = computed(
    () => this.flagService.getReadinessLevel('deployments') === 'LIVE'
  );

  constructor(
    private readonly api: ApiGatewayService,
    private readonly mock: DeploymentMockService,
    private readonly flagService: FeatureFlagService
  ) {}

  getDeployments(): Observable<Deployment[]> {
    return this.isLive()
      ? this.api.get<Deployment[]>('/deployments')
      : of(this.mock.getDeployments());
  }

  getDeployment(id: string): Observable<Deployment> {
    return this.isLive()
      ? this.api.get<Deployment>(`/deployments/${id}`)
      : of(this.mock.getDeployment(id));
  }

  // ... all other methods follow the same delegate pattern
}
```

### Global Signal Stores (Core_Module)

```typescript
// AuthStore — current user, authentication state
export class AuthStore {
  readonly user          = signal<User | null>(null);
  readonly isAuthenticated = computed(() => this.user() !== null);
  readonly tokens        = signal<AuthTokens | null>(null);  // in-memory only
}

// ThemeStore
export class ThemeStore {
  readonly current = signal<'light' | 'dark'>('light');
}

// NotificationStore (global unread count for TopNav badge)
export class NotificationCountStore {
  readonly unreadCount = signal<number>(0);
}
```


---

## Core Services Design

### Auth_Service

```typescript
@Injectable({ providedIn: 'root' })
export class AuthService {
  // Public Signal API
  isAuthenticated(): Signal<boolean>;
  currentUser(): Signal<User | null>;
  hasRole(role: UserRole): boolean;

  // Methods
  login(credentials: LoginRequest): Observable<void>;
  logout(): Observable<void>;
  refreshToken(): Observable<AuthTokens>;
}
```

**Token storage strategy**:
- Access token → in-memory `AuthStore.tokens` Signal (never written to `localStorage`).
- Refresh token with remember-me → secure HttpOnly cookie (set by backend).
- Refresh token without remember-me → sessionStorage only.
- No JWT value is ever present in URL params, console logs, or `localStorage`.

**Refresh flow**:
1. JWT interceptor checks `expiresAt - Date.now() < 60_000ms` before each request.
2. If within 60s, proactively calls `refreshToken()` first.
3. If a 401 is received, JWT interceptor invokes `refreshToken()` once and retries.
4. If refresh also returns 401/403, `AuthService.logout()` is called and user is redirected
   to `/auth/login`.

### HTTP Interceptor

```typescript
// src/app/core/interceptors/jwt.interceptor.ts
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // 1. Attach Bearer token to API requests
  // 2. Check token expiry; refresh proactively if within 60s
  // 3. On 401 response: attempt refresh once, retry request
  // 4. On second 401: redirect to login
  // 5. On 403: navigate to /403, do NOT clear session
};
```

### API_Gateway_Service

Wraps every backend REST endpoint. No component or feature store ever imports `HttpClient`.

```typescript
@Injectable({ providedIn: 'root' })
export class ApiGatewayService {
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(path: string, params?: HttpParams): Observable<T>;
  post<T>(path: string, body: unknown): Observable<T>;
  put<T>(path: string, body: unknown): Observable<T>;
  patch<T>(path: string, body: unknown): Observable<T>;
  delete<T>(path: string): Observable<T>;
  downloadBlob(path: string, params?: HttpParams): Observable<Blob>;
}
```

All methods map to typed endpoints documented in the Spring Boot OpenAPI spec.

### Feature_Flag_Service

```typescript
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  // Initialized once on app bootstrap from environment.featureFlags
  private readonly flags = signal<Record<string, FeatureReadinessLevel>>({});

  initialize(): void {
    this.flags.set(environment.featureFlags as Record<string, FeatureReadinessLevel>);
  }

  getReadinessLevel(feature: string): FeatureReadinessLevel {
    return this.flags()[feature] ?? 'MOCK';
  }

  getAllFlags(): Signal<Record<string, FeatureReadinessLevel>> {
    return this.flags.asReadonly();
  }
}
```

**environment.ts structure**:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
  grafanaUrl: '',   // empty = show "not configured" state
  featureFlags: {
    dashboard:           'MOCK',
    'service-catalog':   'MOCK',
    'provision-requests':'MOCK',
    deployments:         'MOCK',
    terraform:           'MOCK',
    cicd:                'MOCK',
    infrastructure:      'MOCK',
    containers:          'MOCK',
    kubernetes:          'MOCK',
    'cloud-resources':   'MOCK',
    monitoring:          'MOCK',
    notifications:       'MOCK',
    incidents:           'MOCK',
    recommendations:     'MOCK',
    organizations:       'MOCK',
    teams:               'MOCK',
    users:               'MOCK',
    settings:            'MOCK',
    'ai-assistant':      'MOCK'
  } as const
};
```

### Permission_Service

```typescript
@Injectable({ providedIn: 'root' })
export class PermissionService {
  // ROLE → PERMISSIONS mapping (derived from JWT claims or role configuration)
  private readonly rolePermissions: Record<UserRole, Permission[]> = { /* ... */ };

  // Synchronous — no HTTP calls, reads from AuthStore Signal
  hasPermission(permission: Permission): boolean;
  canActivate(required: Permission[]): boolean;
  hasRole(role: UserRole): boolean;
}
```

### RbacGuard

```typescript
export const rbacGuard: CanActivateFn = (route) => {
  const permissions = inject(PermissionService);
  const router = inject(Router);
  const required = route.data['requiredPermissions'] as Permission[];

  if (required.length === 0) return true;   // open to all authenticated users
  if (permissions.canActivate(required)) return true;

  return router.createUrlTree(['/403']);
  // Never blocks based on FeatureReadinessLevel
};
```

### Mock_Data_Service

```typescript
@Injectable({ providedIn: 'root' })
export class MockDataService {
  // Shared generators consumed by all 19 Mock Adapters
  uuid(): string;
  randomFrom<T>(arr: T[]): T;
  timestamp(daysAgo?: number): string;           // ISO 8601
  intBetween(min: number, max: number): number;
  floatBetween(min: number, max: number, decimals?: number): number;
  userName(): string;
  orgName(): string;
  serviceName(): string;
  ipAddress(): string;
  version(): string;                              // e.g., "1.4.2"
  k8sNamespace(): string;
  azureRegion(): string;
  randomStatus<T extends string>(statuses: T[]): T;
}
```

### Other Core Services

| Service | Key Methods |
|---------|-------------|
| `ThemeService` | `applyTheme()`, `toggleTheme()`, `currentTheme(): Signal<'light' \| 'dark'>`, `loadPersistedTheme()` |
| `NotificationService` | `showToast()`, `getNotifications()`, `getUnreadCount()`, `markAsRead()`, `markAllAsRead()` |
| `ErrorHandlerService` | Implements `ErrorHandler`; catches uncaught errors; logs with timestamp + stack |
| `AuditLogService` | `getAuditLogs(filters)`, `exportAuditLogsCsv(filters)` |


---

## Theme Architecture

### Design Token System

All brand and theme decisions are encoded as CSS custom properties in
`src/styles/_tokens.scss`. Zero hardcoded hex values in component SCSS files.

```scss
// src/styles/_tokens.scss

// ── Brand Colors ──────────────────────────────────────────
:root, [data-theme="light"] {
  --color-primary:       #0070AD;
  --color-primary-hover: #005c8f;
  --color-secondary:     #12ABDB;
  --color-accent:        #6F2C91;
  --color-background:    #F5F7FA;
  --color-sidebar:       #1F2937;
  --color-sidebar-text:  #F9FAFB;
  --color-sidebar-hover: #374151;
  --color-surface:       #FFFFFF;
  --color-border:        #E5E7EB;

  // ── Semantic Colors ─────────────────────────────────────
  --color-success:   #16A34A;
  --color-warning:   #D97706;
  --color-error:     #DC2626;
  --color-info:      #2563EB;

  // ── Neutral Scale ────────────────────────────────────────
  --color-neutral-50:  #F9FAFB;
  --color-neutral-100: #F3F4F6;
  --color-neutral-200: #E5E7EB;
  --color-neutral-400: #9CA3AF;
  --color-neutral-600: #4B5563;
  --color-neutral-800: #1F2937;
  --color-neutral-900: #111827;

  // ── Typography ───────────────────────────────────────────
  --font-family-base:    'Inter', 'Segoe UI', system-ui, sans-serif;
  --font-family-mono:    'JetBrains Mono', 'Cascadia Code', monospace;
  --font-size-xs:   0.75rem;   // 12px
  --font-size-sm:   0.875rem;  // 14px
  --font-size-base: 1rem;      // 16px
  --font-size-lg:   1.125rem;  // 18px
  --font-size-xl:   1.25rem;   // 20px
  --font-size-2xl:  1.5rem;    // 24px
  --font-size-3xl:  1.875rem;  // 30px
  --font-weight-normal:   400;
  --font-weight-medium:   500;
  --font-weight-semibold: 600;
  --font-weight-bold:     700;

  // ── Spacing (4px base) ───────────────────────────────────
  --space-1:  0.25rem;   // 4px
  --space-2:  0.5rem;    // 8px
  --space-3:  0.75rem;   // 12px
  --space-4:  1rem;      // 16px
  --space-6:  1.5rem;    // 24px
  --space-8:  2rem;      // 32px
  --space-12: 3rem;      // 48px
  --space-16: 4rem;      // 64px

  // ── Border Radius ────────────────────────────────────────
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;

  // ── Shadows ──────────────────────────────────────────────
  --shadow-sm: 0 1px 2px 0 rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);

  // ── Z-Index Scale ────────────────────────────────────────
  --z-base:    1;
  --z-raised:  10;
  --z-sidebar: 100;
  --z-topnav:  200;
  --z-overlay: 300;
  --z-modal:   400;
  --z-toast:   500;
}

// ── Dark Mode Overrides ───────────────────────────────────
[data-theme="dark"] {
  --color-background:  #111827;
  --color-surface:     #1F2937;
  --color-border:      #374151;
  --color-sidebar:     #0F172A;
  --color-sidebar-text:#F9FAFB;
  --color-sidebar-hover: #1E293B;

  --color-neutral-50:  #1F2937;
  --color-neutral-100: #374151;
  --color-neutral-200: #4B5563;
  --color-neutral-400: #9CA3AF;
  --color-neutral-600: #D1D5DB;
  --color-neutral-800: #F3F4F6;
  --color-neutral-900: #F9FAFB;

  // Brand colors remain consistent in dark mode
  // Semantic colors adjust for dark backgrounds:
  --color-success: #22C55E;
  --color-warning: #F59E0B;
  --color-error:   #EF4444;
  --color-info:    #60A5FA;
}
```

### Angular Material Integration

```typescript
// src/app/core/material-theme.ts  — custom Material 3 theme
import { createTheme } from '@angular/material/theming';

export const idpTheme = createTheme({
  primary:  { main: '#0070AD' },   // --color-primary
  secondary:{ main: '#12ABDB' },   // --color-secondary
  tertiary: { main: '#6F2C91' },   // --color-accent
});
```

All Material components inherit brand colors through the Angular Material palette mapping.
Material typography uses `--font-family-base`. No Material component uses hardcoded colors.

### Theme_Service Implementation

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'idp-theme-preference';
  private readonly _theme = signal<'light' | 'dark'>('light');
  readonly currentTheme = this._theme.asReadonly();

  loadPersistedTheme(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY) as 'light' | 'dark' | null;
    this.applyTheme(stored ?? this.getSystemPreference());
  }

  applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    this._theme.set(theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  toggleTheme(): void {
    this.applyTheme(this._theme() === 'light' ? 'dark' : 'light');
  }

  private getSystemPreference(): 'light' | 'dark' {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
```

`loadPersistedTheme()` is called in `APP_INITIALIZER` before the first render, preventing
flash of wrong-theme content.


---

## Authentication & Session Flow

```
User navigates to protected route
        │
        ▼
   AuthGuard checks AuthStore.isAuthenticated()
        │
   ┌────┴─────┐
   │ authed?  │
   └──┬────┬──┘
     NO    YES
      │     │
      │     ▼
      │  RbacGuard checks permissions
      │     │
      │  ┌──┴───────┐
      │  │ allowed? │
      │  └──┬───┬───┘
      │    NO   YES
      │     │    │
      │     │    ▼
      │     │  Route activates → Feature Page renders
      │     │  (always, regardless of FeatureReadinessLevel)
      │     │
      │     └─── navigate to /403
      │
      └─── preserve originalUrl → navigate to /auth/login
                                       │
                            user submits credentials
                                       │
                                  POST /auth/login
                                       │
                               ┌───────┴────────┐
                               │   success?      │
                               └──────┬─────┬───┘
                                     YES    NO
                                      │      └── show inline error
                                      │
                               store JWT in-memory
                               store refresh token
                               (cookie if remember-me)
                                      │
                               navigate to originalUrl
                                  (or /dashboard)
```

### Token Refresh Flow

```
Before each API request:
  expiresAt - now < 60_000ms?
        │
       YES → POST /auth/refresh → update AuthStore.tokens
        │
       NO  → proceed with request
        │
  API responds 401?
        │
       YES → POST /auth/refresh (once)
              │
         success → retry original request
         failure → AuthService.logout() → navigate /auth/login
        │
       NO  → handle response normally
```


---

## Mock_Adapter Architecture

### Design

The Mock_Adapter architecture enables all 19 modules to render realistic data from Sprint 1
with zero backend dependency. It is the cornerstone of the "fully scaffolded" principle.

```
environment.featureFlags.{module} = 'MOCK'
          │
          ▼
  FeatureService.getXxx()
          │
          └── this.isLive() === false
                    │
                    ▼
          MockService.getXxx()
                    │
                    ▼
          MockDataService (shared generators)
                    │
                    ▼
          returns Observable<T> with hardcoded + randomized data
```

### Mock_Data_Service (shared generators)

Centralized in `src/app/core/mock-adapters/mock-data.service.ts`. All 19 feature Mock
Adapters inject this service for consistent, realistic fake data.

```typescript
// src/app/core/mock-adapters/mock-data.service.ts
@Injectable({ providedIn: 'root' })
export class MockDataService {
  // Deterministic seed for reproducible demo scenarios
  private seed = 42;

  uuid = () => crypto.randomUUID();
  randomFrom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  timestamp = (daysAgo = 0) => new Date(Date.now() - daysAgo * 86400000).toISOString();
  intBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min)) + min;
  floatBetween = (min: number, max: number, decimals = 2) =>
    parseFloat((Math.random() * (max - min) + min).toFixed(decimals));

  userName = () => this.randomFrom([
    'Alice Chen', 'Bob Müller', 'Carlos Lima', 'Diana Park',
    'Erik Andersen', 'Fatima Al-Sayed', 'George Nakamura', 'Hannah Schmidt'
  ]);
  serviceName = () => this.randomFrom([
    'user-service', 'order-processor', 'payment-gateway', 'notification-hub',
    'data-pipeline', 'auth-provider', 'config-manager', 'log-aggregator'
  ]);
  k8sNamespace = () => this.randomFrom(['default','production','staging','monitoring','kube-system']);
  azureRegion  = () => this.randomFrom(['eastus','westeurope','southeastasia','uksouth']);
  version      = () => `${this.intBetween(1,5)}.${this.intBetween(0,20)}.${this.intBetween(0,99)}`;
  ipAddress    = () => `10.${this.intBetween(0,255)}.${this.intBetween(0,255)}.${this.intBetween(1,254)}`;
}
```

### Per-Feature Mock Service Pattern

```typescript
// src/app/features/deployments/mocks/deployment.mock.service.ts
@Injectable({ providedIn: 'root' })
export class DeploymentMockService {
  constructor(private readonly mock: MockDataService) {}

  private readonly STATUSES: DeploymentStatus[] = ['IDLE','RUNNING','SUCCESS','FAILED'];
  private readonly ENVIRONMENTS = ['dev','staging','production'];

  getDeployments(): Deployment[] {
    return Array.from({ length: 20 }, (_, i) => ({
      id:          this.mock.uuid(),
      serviceName: this.mock.serviceName(),
      environment: this.mock.randomFrom(this.ENVIRONMENTS),
      version:     this.mock.version(),
      status:      this.mock.randomFrom(this.STATUSES),
      triggeredBy: this.mock.userName(),
      startedAt:   this.mock.timestamp(this.mock.intBetween(0, 14)),
      completedAt: this.mock.timestamp(0)
    }));
  }

  getDeployment(id: string): Deployment {
    return { ...this.getDeployments()[0], id };
  }

  getLogs(id: string): string[] {
    return Array.from({ length: 30 }, (_, i) =>
      `[${new Date().toISOString()}] Step ${i + 1}: ${this.mock.randomFrom([
        'Pulling image...', 'Running health checks...', 'Deploying to cluster...',
        'Waiting for pods...', 'Updating service...', 'Verifying rollout...'
      ])}`
    );
  }
}
```

### Feature_Readiness_Level Switching

Switching any module from MOCK → PARTIAL → LIVE requires exactly **one line change** in
`environment.ts`. No component, template, route, or store ever needs to be modified.

```typescript
// Before (MOCK):
featureFlags: { deployments: 'MOCK' }

// After (LIVE):
featureFlags: { deployments: 'LIVE' }

// The DeploymentService.isLive computed signal reacts to this change immediately.
// All components reading DeploymentStore signals automatically see live data.
```


---

## Dashboard Design

### KPI Widget Grid

13 KPI widgets arranged in a responsive CSS Grid:

```
Desktop (≥1280px): 4-column grid
Tablet (768–1279px): 3-column grid
Mobile (<768px): 1-column stacked

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ Infrastructure  │ Running         │ Terraform Jobs  │ Pipeline Status │
│ Status          │ Deployments     │                 │                 │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Running         │ Kubernetes      │ CPU Usage       │ Memory Usage    │
│ Containers      │ Health          │ (%)             │ (GB)            │
├─────────────────┼─────────────────┼─────────────────┼─────────────────┤
│ Node Count      │ Pod Count       │ Active Users    │ Pending         │
│                 │                 │                 │ Approvals       │
├─────────────────┴─────────────────┴─────────────────┼─────────────────┤
│ Notification Count                                  │ (spans 3 cols)  │
└─────────────────────────────────────────────────────┴─────────────────┘
```

Each `KpiWidgetComponent`:
- Independent HTTP fetch via DashboardStore
- Renders LoadingSpinner during fetch
- Renders MetricCard with trend indicator on success
- Renders ErrorAlert with retry button on failure
- Failure of one widget does not affect others (independent Signals)

### Recent Activity Feed

- Last 20 platform events below the KPI grid
- Columns: actor (avatar + name), action, target entity, relative timestamp
- Fetched independently from KPI widgets
- Uses TimelineComponent-style display

### Dashboard Refresh

A single "Refresh All" button in the PageHeader calls `DashboardStore.refreshAll()`, which
dispatches all 13 KPI fetches and the activity feed fetch in parallel.


---

## SCSS Organization

```
src/styles/
├── _tokens.scss          # All CSS custom properties (brand, semantic, neutral, type, spacing)
├── _breakpoints.scss     # Breakpoint SCSS mixins only — no layout here
├── _typography.scss      # Base type styles using token vars
├── _reset.scss           # CSS reset / normalize
├── _material-theme.scss  # Angular Material custom palette binding
├── _animations.scss      # Keyframes and transition utilities
├── _utilities.scss       # Display, flex, spacing utility classes (Tailwind-lite)
└── styles.scss           # Root: imports all partials, sets html base styles
```

### Breakpoint Mixins

```scss
// src/styles/_breakpoints.scss
$breakpoint-tablet:  768px;
$breakpoint-desktop: 1280px;

@mixin mobile-only {
  @media (max-width: #{$breakpoint-tablet - 1px}) { @content; }
}

@mixin tablet-up {
  @media (min-width: #{$breakpoint-tablet}) { @content; }
}

@mixin tablet-only {
  @media (min-width: #{$breakpoint-tablet}) and (max-width: #{$breakpoint-desktop - 1px}) { @content; }
}

@mixin desktop-up {
  @media (min-width: #{$breakpoint-desktop}) { @content; }
}
```

### Component SCSS Convention

```scss
// Example: src/app/features/deployments/pages/list.page.scss
// ✅ CORRECT — all values from tokens
.deployment-list {
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);

  @include mobile-only {
    padding: var(--space-4);
  }
}

// ❌ WRONG — hardcoded values (enforced by lint rule)
// .deployment-list { padding: 24px; background: #ffffff; }
```

ESLint rule `no-hardcoded-colors` (custom rule or `stylelint-no-hardcoded-colors`) enforces
zero hex/RGB values in component SCSS files. CI fails on violations.


---

## Complete Folder Structure

```
enterprise-idp-frontend/
├── docker/
│   ├── Dockerfile
│   └── nginx.conf
├── k8s/
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── hpa.yaml
│   └── ingress.yaml
├── src/
│   ├── environments/
│   │   ├── environment.ts
│   │   └── environment.production.ts
│   ├── styles/
│   │   ├── _tokens.scss
│   │   ├── _breakpoints.scss
│   │   ├── _typography.scss
│   │   ├── _reset.scss
│   │   ├── _material-theme.scss
│   │   ├── _animations.scss
│   │   ├── _utilities.scss
│   │   └── styles.scss
│   └── app/
│       ├── app.component.ts
│       ├── app.routes.ts
│       ├── app.module.ts              ← bootstrap shell only
│       ├── core/
│       │   ├── guards/
│       │   │   ├── auth.guard.ts
│       │   │   └── rbac.guard.ts
│       │   ├── interceptors/
│       │   │   └── jwt.interceptor.ts
│       │   ├── models/
│       │   │   ├── auth.models.ts
│       │   │   ├── rbac.models.ts
│       │   │   ├── resource-state.models.ts
│       │   │   ├── audit-log.models.ts
│       │   │   └── notification.models.ts
│       │   ├── services/
│       │   │   ├── auth.service.ts
│       │   │   ├── api-gateway.service.ts
│       │   │   ├── feature-flag.service.ts
│       │   │   ├── permission.service.ts
│       │   │   ├── theme.service.ts
│       │   │   ├── notification.service.ts
│       │   │   ├── error-handler.service.ts
│       │   │   └── audit-log.service.ts
│       │   ├── stores/
│       │   │   ├── auth.store.ts
│       │   │   ├── theme.store.ts
│       │   │   └── notification-count.store.ts
│       │   └── mock-adapters/
│       │       └── mock-data.service.ts
│       ├── shared/
│       │   ├── components/
│       │   │   ├── status-badge/
│       │   │   ├── data-table/
│       │   │   ├── confirm-dialog/
│       │   │   ├── log-viewer/
│       │   │   ├── metric-card/
│       │   │   ├── page-header/
│       │   │   ├── empty-state/
│       │   │   ├── loading-spinner/
│       │   │   ├── error-alert/
│       │   │   ├── search-bar/
│       │   │   ├── filter-panel/
│       │   │   └── timeline/
│       │   ├── directives/
│       │   │   ├── permission.directive.ts     ← *hasPermission structural directive
│       │   │   └── click-outside.directive.ts
│       │   ├── pipes/
│       │   │   ├── relative-time.pipe.ts
│       │   │   ├── bytes.pipe.ts
│       │   │   └── truncate.pipe.ts
│       │   └── utils/
│       │       ├── color-maps.ts               ← status → CSS class maps for StatusBadge
│       │       └── validators.ts
│       ├── layout/
│       │   ├── layout.component.ts
│       │   ├── top-nav/
│       │   │   ├── top-nav.component.ts
│       │   │   ├── breadcrumb.component.ts
│       │   │   ├── notification-bell.component.ts
│       │   │   ├── theme-toggle.component.ts
│       │   │   └── user-profile-menu.component.ts
│       │   └── sidebar/
│       │       ├── sidebar.component.ts
│       │       └── nav-item.component.ts
│       ├── pages/
│       │   ├── auth/
│       │   │   └── login.page.ts
│       │   └── error/
│       │       ├── 403.page.ts
│       │       └── 404.page.ts
│       └── features/
│           ├── dashboard/
│           │   ├── components/
│           │   │   ├── kpi-widget.component.ts
│           │   │   └── activity-feed.component.ts
│           │   ├── pages/
│           │   │   └── dashboard.page.ts
│           │   ├── services/
│           │   │   └── dashboard.service.ts
│           │   ├── models/
│           │   │   └── dashboard.models.ts
│           │   ├── store/
│           │   │   └── dashboard.store.ts
│           │   ├── mocks/
│           │   │   └── dashboard.mock.service.ts
│           │   └── dashboard.routes.ts
│           ├── service-catalog/    ← same subdirectory pattern
│           ├── provision-requests/
│           ├── deployments/
│           ├── terraform/
│           ├── cicd/
│           ├── infrastructure/
│           ├── containers/
│           ├── kubernetes/
│           ├── cloud-resources/
│           ├── monitoring/
│           ├── notifications/
│           ├── incidents/
│           ├── recommendations/
│           ├── organizations/
│           ├── teams/
│           ├── users/
│           ├── settings/
│           └── ai-assistant/
│               ├── components/
│               │   ├── chat-panel.component.ts
│               │   ├── floating-widget.component.ts  ← global bottom-right widget
│               │   ├── chat-input.component.ts
│               │   └── ai-suggestion-panel.component.ts
│               ├── pages/
│               │   └── ai-assistant.page.ts
│               ├── services/
│               │   └── ai-assistant.service.ts
│               ├── models/
│               │   └── ai-assistant.models.ts
│               ├── store/
│               │   └── ai-assistant.store.ts
│               ├── mocks/
│               │   └── ai-assistant.mock.service.ts
│               └── ai-assistant.routes.ts
```


---

## Docker + Kubernetes Deployment Design

### Multi-Stage Dockerfile

```dockerfile
# docker/Dockerfile

# ── Stage 1: Build ────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Cache npm install layer separately from source code
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

COPY . .
RUN npm run build -- --configuration=production

# ── Stage 2: Serve ────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy compiled Angular app
COPY --from=builder /app/dist/enterprise-idp-frontend/browser /usr/share/nginx/html

# Copy custom nginx config (handles Angular HTML5 routing)
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Nginx Configuration

```nginx
# docker/nginx.conf
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript
               text/xml application/xml application/xml+rss text/javascript
               application/wasm;
    gzip_min_length 1024;

    # Cache static assets aggressively
    location ~* \.(js|css|wasm|ico|png|jpg|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Angular HTML5 routing — serve index.html for all non-file routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;";
}
```

### Kubernetes Manifests

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: idp-frontend
  namespace: idp-platform
  labels:
    app: idp-frontend
    version: "1.0.0"
spec:
  replicas: 2
  selector:
    matchLabels:
      app: idp-frontend
  template:
    metadata:
      labels:
        app: idp-frontend
    spec:
      containers:
        - name: idp-frontend
          image: idp-frontend:latest
          ports:
            - containerPort: 80
          envFrom:
            - configMapRef:
                name: idp-frontend-config
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "256Mi"
          readinessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet:
              path: /
              port: 80
            initialDelaySeconds: 15
            periodSeconds: 20
```

```yaml
# k8s/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: idp-frontend-svc
  namespace: idp-platform
spec:
  selector:
    app: idp-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP
```

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: idp-frontend-config
  namespace: idp-platform
data:
  NGINX_WORKER_PROCESSES: "auto"
  NGINX_WORKER_CONNECTIONS: "1024"
```

```yaml
# k8s/hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: idp-frontend-hpa
  namespace: idp-platform
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: idp-frontend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: idp-frontend-ingress
  namespace: idp-platform
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: idp.company.internal
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: idp-frontend-svc
                port:
                  number: 80
```


---

## Error Handling

### Error Boundary Strategy

```typescript
// src/app/core/services/error-handler.service.ts
@Injectable()
export class GlobalErrorHandlerService implements ErrorHandler {
  handleError(error: unknown): void {
    const timestamp = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    // Log with context (never to console in production)
    if (!environment.production) {
      console.error(`[${timestamp}] Uncaught error:`, message, stack);
    }

    // Display non-blocking ErrorAlert to user
    this.notificationService.showToast(
      'An unexpected error occurred. Please try again.',
      'ERROR',
      8000
    );
    // Optionally: POST to error tracking endpoint (future: Sentry/Grafana)
  }
}
```

### HTTP Error Handling Matrix

| HTTP Status | Handler | User Experience |
|------------|---------|-----------------|
| 400 | Feature store sets `error` field | Inline validation message via ErrorAlert |
| 401 | JWT Interceptor → refresh → retry | Transparent; falls back to login redirect |
| 403 | Router navigates to `/403` | 403 error page; session preserved |
| 404 | Feature store sets `error` | EmptyState or ErrorAlert in feature page |
| 500 | Feature store sets `error` | ErrorAlert with retry button |
| Network timeout | Feature store sets `error` | ErrorAlert with retry button |

### Feature-Level Error States

Every `ResourceState<T>` store exposes `error: string | null`. Components render:
- `loading: true` → `LoadingSpinner` or skeleton rows
- `error: string` → `ErrorAlert` with retry button
- `data: T` → actual content

This three-state pattern is consistent across all 19 modules — no feature handles errors
differently.


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions
of a system — essentially, a formal statement about what the system should do. Properties
serve as the bridge between human-readable specifications and machine-verifiable correctness
guarantees.*

---

### Property 1: ResourceState Loading Invariant

*For any* sequence of HTTP operations dispatched against a feature Signal store, the
`ResourceState` invariant must hold at every transition step: if `loading === true` then
`error` must be `null`; if `error` is a non-null string then `loading` must be `false`.
The three fields (`loading`, `error`, `data`) are never simultaneously in an inconsistent
state.

**Validates: Requirements 2.8, 25.6, 25.8, 25.11**

---

### Property 2: ResourceState Retry Resets Error

*For any* Signal store in an error state (`error !== null`, `loading === false`), invoking
the retry/load operation must produce an intermediate state of `{ loading: true, error: null,
data: <previous value or null> }` before the new HTTP response arrives — never leaving `error`
set while dispatching a new request.

**Validates: Requirements 25.12**

---

### Property 3: Data_Source_Strategy Delegation Invariant

*For any* feature module and *any* `FeatureReadinessLevel` value (`MOCK`, `PARTIAL`, `LIVE`),
the feature service must delegate data fetches to the correct data source: `MockAdapter` when
`MOCK`, live `ApiGatewayService` when `LIVE`. Changing the readiness level in `environment.ts`
must produce the correct delegation without any modification to components, templates, routing,
or store implementations.

**Validates: Requirements 2.13, 11.11, 12.13, 13.10, 14.13, 16.12, 17.11, 22.11, 30.11**

---

### Property 4: RBAC Guard Correctness — No False Positives or False Negatives

*For any* authenticated user with role R and *any* route requiring permissions P, the
`RbacGuard` decision must be exactly `PermissionService.canActivate(P)` evaluated for role R.
The guard must never grant access when permissions are insufficient (no false positives) and
never deny access when permissions are sufficient (no false negatives). The guard must never
consider `FeatureReadinessLevel` in its decision.

**Validates: Requirements 3.9, 28.2, 28.3**

---

### Property 5: Role-Driven Navigation Containment

*For any* role assignment, the set of navigation items rendered in the Sidebar must be a
subset of the navigation items permitted for that role. No navigation item that requires a
permission the user lacks may appear in the rendered sidebar. Adding more permissions can only
increase the set of visible items — it can never decrease it (monotone containment invariant).

**Validates: Requirements 3.12, 4.10**

---

### Property 6: StatusBadge Totality — All Statuses Produce Styled Output

*For any* status string value that belongs to the defined status enum for a given entity type
(deployments, Terraform jobs, incidents, Kubernetes resources, recommendations, alerts), the
`StatusBadge` component must render a non-empty output with a non-null CSS class assigned
from the feature's color map. No valid status value may produce unstyled or unformatted output
(completeness/totality property).

**Validates: Requirements 8.10, 9.10, 14.11**

---

### Property 7: LogViewer Preserves Line Ordering

*For any* ordered array of log line strings returned by a backend API or mock adapter, the
`LogViewer` component must render those lines in exactly the same order as the input array —
preserving chronological sequence with no insertions, deletions, or reordering of lines.

**Validates: Requirements 10.10**

---

### Property 8: Search Filter Idempotence on Empty Input

*For any* filterable list and *any* search term, applying the filter and then clearing the
search input (setting it to the empty string or null) must restore the full unfiltered list
exactly as it was before any filter was applied. The clear operation must be idempotent:
clearing an already-clear filter produces the same result as a single clear.

**Validates: Requirements 6.10**

---

### Property 9: Form Validation — Missing Required Fields Block Submission

*For any* form submission where one or more required fields are empty or contain invalid data,
the frontend must display inline validation error messages adjacent to each invalid field and
must not dispatch any API call to the backend. This property holds for all required fields
across all forms (Provision Request, Create User, Create Organization, Create Role).

**Validates: Requirements 7.4, 19.5**

---

### Property 10: Notification Unread Count Invariant

*For any* sequence of notification mark-as-read operations on a notification set of size N,
the unread-count badge value must equal N minus the count of notifications marked as read
after every operation in the sequence. The count must never go negative and must never exceed
the total notification count.

**Validates: Requirements 15.10**

---

### Property 11: KPI Widget Count Invariance

*For any* combination of API response outcomes (success or failure) across the 13 KPI
widgets, the total count of rendered widgets must always equal 13 — a combination of
successfully-loaded widgets and error-state widgets with retry buttons. No widget may silently
disappear from the grid regardless of its individual fetch outcome.

**Validates: Requirements 5.3, 5.10**

---

### Property 12: Permission_Service Idempotence

*For any* `(role, permission)` pair, calling `PermissionService.hasPermission(permission)`
multiple times without an intervening login, logout, or role change must return the same
boolean result on every call. The permission evaluation function is a pure, side-effect-free
computation over the current auth state.

**Validates: Requirements 27.12**

---

### Property 13: Shared Component Render Purity

*For any* shared component in the Shared_Module and *any* set of valid input values, rendering
the component with those inputs twice in succession must produce an identical output both times.
No shared component may maintain internal state that accumulates across renders and produces
different output for identical inputs (idempotence / purity property).

**Validates: Requirements 26.12**

---

### Property 14: Theme Token Completeness

*For any* CSS custom property defined in the light mode token set (`:root` or
`[data-theme="light"]`), an equivalent override must exist in the dark mode token set
(`[data-theme="dark"]`) with a non-null, non-empty value. The two theme definitions are
structurally isomorphic — the dark theme is a complete override of the light theme.

**Validates: Requirements 23.8**

---

### Property 15: Provision Request Lifecycle Ordering

*For any* `ProvisionRequest` with a given status, the set of action buttons rendered in the
UI must correspond exactly to the valid next states in the lifecycle
(`PENDING → APPROVED | REJECTED`, `APPROVED → PROVISIONED`). No action button must appear for
a transition that would violate the lifecycle order, regardless of the request's history.

**Validates: Requirements 7.8**

---

### Property 16: DISMISSED Recommendation Terminal State

*For any* `Recommendation` object with `status === 'DISMISSED'`, the rendered action buttons
must not include Apply or Acknowledge. The DISMISSED state is terminal — no UI action may
transition a dismissed recommendation to another state. This property must hold for all
recommendations in the list view and detail view.

**Validates: Requirements 17.10**

---

### Property 17: Audit Log Export Filter Consistency

*For any* filter configuration applied to the Audit Log DataTable, the set of entries in the
exported CSV file must be exactly equal to the set of entries that would be returned by
applying the same filter across all pages of the DataTable view. The export and the paginated
view must share a single, consistent filter evaluation function.

**Validates: Requirements 29.10**

---

### Property 18: Breadcrumb Route Fidelity

*For any* valid route navigated to within the application, the Breadcrumb trail rendered in
the TopNav must reflect the full hierarchical path of that route — every ancestor path segment
must appear in the breadcrumb, in the correct left-to-right order. This property must hold for
all 19 feature routes and all child routes.

**Validates: Requirements 4.7**

---

### Property 19: Permission_Matrix Round-Trip Fidelity

*For any* role and its associated permissions returned by the backend API, the Permission
Matrix rendered in the RBAC Admin view must display exactly those permissions — no omissions
and no additions. The set of checked permissions in the rendered matrix must equal the set
of permissions in the API response (round-trip data fidelity).

**Validates: Requirements 20.10**


---

## Testing Strategy

### Overview

The IDP Frontend uses a **dual testing approach**: unit/example-based tests for specific
behaviors and property-based tests for universal invariants. All tests run without a live
backend — Mock_Adapters make the full test suite independently executable.

**Property-Based Testing Library**: [fast-check](https://github.com/dubzzz/fast-check) (TypeScript-native, works with Jest and Karma).

**Unit Test Runner**: Jest (preferred for Angular 20 projects with esbuild builder).

### Property-Based Test Configuration

```typescript
// jest.config.ts
export default {
  preset: 'jest-preset-angular',
  setupFilesAfterFramework: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/*.spec.ts'],
  globals: {
    'ts-jest': { tsconfig: 'tsconfig.spec.json' }
  }
};
```

Each property-based test runs a **minimum of 100 iterations** via fast-check's `fc.assert`.
Tests are tagged with comments referencing the design property they validate.

### Property Test Examples

```typescript
// Feature: enterprise-idp-frontend, Property 1: ResourceState Loading Invariant
import fc from 'fast-check';
import { ResourceState } from '../core/models/resource-state.models';

describe('ResourceState invariant', () => {
  it('loading===true implies error===null at all times', () => {
    fc.assert(
      fc.property(
        fc.record({
          loading: fc.boolean(),
          error:   fc.option(fc.string(), { nil: null }),
          data:    fc.option(fc.anything(), { nil: null })
        }),
        (state: ResourceState<unknown>) => {
          // Invariant: loading and error cannot both be truthy simultaneously
          if (state.loading) {
            return state.error === null;
          }
          return true;  // no constraint when not loading
        }
      ),
      { numRuns: 500 }
    );
  });
});
```

```typescript
// Feature: enterprise-idp-frontend, Property 6: StatusBadge Totality
import fc from 'fast-check';
import { render } from '@testing-library/angular';
import { StatusBadgeComponent } from './status-badge.component';

const DEPLOYMENT_STATUSES = ['IDLE', 'RUNNING', 'SUCCESS', 'FAILED', 'PENDING'] as const;
const DEPLOYMENT_COLOR_MAP = {
  IDLE: 'badge-grey', RUNNING: 'badge-blue',
  SUCCESS: 'badge-green', FAILED: 'badge-red', PENDING: 'badge-amber'
};

describe('StatusBadge totality', () => {
  it('every valid status produces a styled output', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...DEPLOYMENT_STATUSES),
        async (status) => {
          const { container } = await render(StatusBadgeComponent, {
            componentInputs: { status, colorMap: DEPLOYMENT_COLOR_MAP }
          });
          const badge = container.querySelector('[data-testid="status-badge"]');
          expect(badge).not.toBeNull();
          expect(badge!.className).toContain('badge-');
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```typescript
// Feature: enterprise-idp-frontend, Property 8: Search Filter Idempotence
import fc from 'fast-check';
import { ServiceCatalogStore } from '../features/service-catalog/store/service-catalog.store';

describe('Search filter idempotence', () => {
  it('clearing search restores the full unfiltered list', () => {
    fc.assert(
      fc.property(
        fc.string(),            // any search term
        fc.array(fc.record({   // any service catalog dataset
          name: fc.string(),
          description: fc.string(),
          category: fc.string()
        }), { minLength: 1, maxLength: 50 }),
        (term, services) => {
          const store = new ServiceCatalogStore(/* ... */);
          store.setData(services);

          store.applyFilter(term);
          const afterFilter = store.filtered();

          store.applyFilter('');
          const afterClear = store.filtered();

          // Must equal original full list
          expect(afterClear).toEqual(services);
        }
      ),
      { numRuns: 200 }
    );
  });
});
```

```typescript
// Feature: enterprise-idp-frontend, Property 7: LogViewer Preserves Line Ordering
import fc from 'fast-check';

describe('LogViewer sequence invariant', () => {
  it('renders log lines in the same order as input array', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string(), { minLength: 1, maxLength: 200 }),
        (lines) => {
          const rendered = renderLogLines(lines); // pure rendering function
          expect(rendered).toEqual(lines);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Test Coverage Targets

| Layer | Min Branch Coverage | Test Runner |
|-------|--------------------|----|
| Core_Module services | 80% | Jest |
| Shared_Module components | 80% | Jest + Angular Testing Library |
| Feature stores | 80% | Jest |
| Feature services | 70% | Jest |
| Guards & Interceptors | 90% | Jest |

### Integration Tests

Integration tests verify end-to-end flows against a running backend. They are not run in CI
for every commit — reserved for nightly builds or pre-release gates.

Key scenarios:
- Auth flow: login → JWT in memory → protected route access
- Data_Source_Strategy: MOCK → LIVE switch verifies real API data appears in store
- RBAC: each role can access only its permitted routes

### Smoke Tests (build output checks)

- All 19 lazy route bundles absent from initial network payload
- Docker image size < 150 MB (`docker image inspect`)
- TypeScript strict-mode compilation produces zero errors and warnings
- No hardcoded hex values in compiled CSS (verified by `stylelint`)
- Light and dark theme have structurally identical CSS custom property sets


---

## Recommended Third-Party Libraries

| Library | Version | Purpose | Rationale |
|---------|---------|---------|-----------|
| `@angular/material` | ^20.0 | UI component baseline (dialogs, inputs, icons) | Official Angular team; integrates natively with Angular theming |
| `@angular/cdk` | ^20.0 | Overlay, focus trap, virtual scroll | Needed for ConfirmDialog focus management and LogViewer virtual scroll |
| `fast-check` | ^3.x | Property-based testing | TypeScript-native, excellent Angular compatibility, active maintenance |
| `@testing-library/angular` | ^17.x | Component rendering in unit tests | Accessibility-first test utilities; avoids implementation coupling |
| `jest` | ^29.x | Test runner | Faster than Karma; excellent TypeScript support; esbuild jest preset |
| `jest-preset-angular` | ^14.x | Angular + Jest bridge | Official Angular Jest integration |
| `date-fns` | ^3.x | Relative timestamps, date formatting | Tree-shakable; no side effects; deterministic |
| `ngx-translate` | ^16.x | i18n (future-proofing) | Lightweight; Signal-compatible; deferred bundle |
| `stylelint` | ^16.x | SCSS lint (enforce no hardcoded colors) | Custom rule `no-hardcoded-colors` to enforce Design Token system |
| `eslint-plugin-boundaries` | ^5.x | Enforce layer dependency rules | Prevents core → feature and feature → feature imports |
| `rxjs` | ^7.x | Async operators for HTTP streams (NOT state) | Angular peer dependency; used only in HTTP pipelines |
| `chart.js` + `ng2-charts` | ^4.x + ^6.x | Monitoring time-series charts | Lightweight canvas-based charts; Angular wrapper available |
| `highlight.js` | ^11.x | Log syntax highlighting in LogViewer | Lazy-loaded per feature; minimal bundle impact |

**Deliberately excluded**:
- ❌ NgRx — Signal stores are sufficient for all 19 modules (Req 25.7 explicitly discourages NgRx)
- ❌ Lodash — date-fns and native Array methods are sufficient; tree-shaking is cleaner
- ❌ Zone.js removal (zoneless Angular) — deferred to post-Sprint-1; requires careful Signal migration


---

## Evolution Roadmap

The IDP Frontend is designed so that each maturity stage requires **zero structural
refactoring** — only configuration changes, new feature implementations, and new integrations.

### Stage 1: Backend + Docker (Sprint 1 baseline)

**Status**: Fully scaffolded. Deliverable from day one.

- All 19 modules: MOCK Feature_Readiness_Level
- Docker multi-stage image builds and runs locally
- Spring Boot backend connects; `deployments`, `users`, `organizations` switched to LIVE
- Auth flow fully operational (JWT login / refresh / logout)
- `featureFlags` in `environment.ts` gradually flipped from MOCK → PARTIAL → LIVE
- No K8s cluster required

**Activation**: Change `environment.apiBaseUrl` to the backend URL; flip feature flags.

---

### Stage 2: Kubernetes (K8s on-prem or minikube)

**New work**:
- Apply `k8s/` manifests: Deployment, Service, ConfigMap, HPA, Ingress
- Switch `environment.production.ts` to ConfigMap-backed environment values (mounted as env
  vars via Kubernetes Secrets)
- Enable `HorizontalPodAutoscaler` based on CPU metrics
- `kubernetes` module flipped to LIVE; `KubernetesStore` begins consuming real K8s API
  (proxied through Spring Boot backend)

**Zero Angular changes**: No components, routes, or stores require modification.

---

### Stage 3: Azure AKS

**New work**:
- Deploy K8s manifests to AKS cluster
- Enable Azure Application Gateway Ingress Controller (AGIC) or nginx ingress
- Configure Azure Container Registry (ACR) in GitHub Actions pipeline
- `cloud-resources` module flipped to LIVE; Azure resource groups, VNets, AKS clusters
  appear from the Azure ARM API (proxied through backend)
- AKS-specific node labels, Azure-specific `azureRegion` in environment config

**Zero Angular changes**.

---

### Stage 4: GitHub Actions CI/CD

**New work**:
- `.github/workflows/ci.yml` builds, tests, and pushes Docker image to ACR
- `cicd` module flipped to LIVE; GitHub Actions API data flows into `CicdStore`
- Add environment-specific `environment.production.ts` with real API URLs
- Branch protection rules: PR requires green CI before merge

**Zero Angular changes**.

---

### Stage 5: ArgoCD (GitOps)

**New work**:
- ArgoCD `Application` manifest points to `k8s/` directory in this repo
- Git push to `main` triggers ArgoCD sync → automatic AKS deployment
- `deployments` module enhanced with ArgoCD sync status display (new API integration in
  `DeploymentService`, backed by ArgoCD API; `featureFlags.deployments = 'LIVE'`)
- Rollback action in Deployment_Console triggers `argocd app rollback` via backend API

**Zero Angular changes to existing components**.

---

### Stage 6: Prometheus / Grafana / Loki Observability

**New work**:
- `monitoring` module flipped to LIVE
- `MonitoringService` connects to Prometheus Query API (via backend proxy) for real metrics
- Grafana embed: set `environment.grafanaUrl` → iframe renders real dashboards
- Loki: `MonitoringService.getLogStream()` connects to Loki HTTP API via backend
- Alert rules: `MonitoringService` fetches active alerts from Alertmanager API
- Install Prometheus scrape annotations on K8s Deployment manifest for frontend metrics

**Zero Angular changes to MonitoringStore or any component**.

---

### Stage 7: AI-Powered Platform Engineering

**New work**:
- `ai-assistant` module flipped to LIVE
- Backend AI service (LangChain4j, Azure OpenAI, or OpenAI API) integrated
- `AiAssistantService.sendMessage()` calls real backend `/ai/chat` endpoint
- Streaming responses via Server-Sent Events (SSE) handled in `AiAssistantStore`
- `AiSuggestion` panels in Incidents and Deployments modules show real AI analysis
- Recommendation module can surface AI-generated cost optimization suggestions

**Mock → Live switch**: change `featureFlags['ai-assistant']` from `'MOCK'` to `'LIVE'`.

---

### Maturity Level Summary

| Stage | Modules Going LIVE | New Infrastructure |
|-------|-------------------|-------------------|
| 1 — Backend+Docker | auth, deployments, users, orgs, teams, service-catalog | Docker Compose |
| 2 — K8s | kubernetes, containers | Minikube/K8s |
| 3 — AKS | cloud-resources, terraform | Azure AKS, ACR |
| 4 — GitHub Actions | cicd | GitHub Actions |
| 5 — ArgoCD | deployments (enhanced) | ArgoCD, GitOps |
| 6 — Observability | monitoring, incidents | Prometheus, Grafana, Loki |
| 7 — AI | ai-assistant, recommendations | LLM backend, SSE streaming |

At every stage, the Angular codebase requires only `environment.ts` changes and new backend
API integrations inside feature services. No component, template, route, or store is ever
structurally refactored.



---

## Enterprise Architecture Principles

This section defines the architectural principles that govern every decision in the IDP
Frontend codebase. These are not aspirational guidelines — they are enforced through linting
rules, code review gates, and structural conventions baked into the folder architecture.

### SOLID Principles

**Single Responsibility Principle**
Each Angular service, component, and store has exactly one reason to change.
- `AuthService` owns authentication state only — it does not handle navigation.
- `PermissionService` evaluates permissions only — it does not render UI.
- `DeploymentStore` owns deployment state only — it does not call `HttpClient`.
- Components render and emit events only — they do not contain business logic.

**Open/Closed Principle**
The architecture is open for extension and closed for modification.
- Adding a new Feature_Module requires zero changes to any existing module.
- Adding a new cloud provider to the Cloud Resources module requires only a new
  configuration entry — the provider selector component is not modified.
- Adding a new RBAC permission requires only a new string literal in the `Permission` union
  type — no guard or service logic changes.

**Liskov Substitution Principle**
Mock_Adapters are substitutable for live services without any consumer knowing.
- `DeploymentMockService` and the live `ApiGatewayService` call path implement the same
  method signatures. `DeploymentService` delegates to either without the store or component
  being aware of the substitution.

**Interface Segregation Principle**
Services expose narrow, focused public APIs. No consumer is forced to depend on methods it
does not use.
- `PermissionService.hasPermission(p)` and `canActivate(ps[])` are separate methods.
- `ApiGatewayService` exposes `get`, `post`, `put`, `patch`, `delete`, `downloadBlob`
  individually — consumers import only what they call.

**Dependency Inversion Principle**
High-level modules (feature stores, components) depend on abstractions (service interfaces),
not on concrete implementations (HttpClient, localStorage). The `Data_Source_Strategy`
pattern makes this explicit: feature services depend on the `FeatureFlagService` abstraction
to select their data source, not on the concrete HTTP or mock implementation.

### Clean Architecture

The five-layer architecture (Presentation → Feature State → Service/Data-Source → Core →
Infrastructure) enforces a strict inward-only dependency direction.

```
Presentation Layer      ← can import Feature State, Core, Shared
Feature State Layer     ← can import Service Layer, Core
Service Layer           ← can import Core only
Core Layer              ← imports Angular + third-party only
Infrastructure Layer    ← environment config, Docker, K8s manifests
```

`eslint-plugin-boundaries` enforces these rules at lint time. A CI check fails if any import
violates the layer hierarchy.

### Separation of Concerns

| Concern | Owner | Location |
|---------|-------|----------|
| HTTP communication | `ApiGatewayService` | `core/services/` |
| Authentication state | `AuthService` + `AuthStore` | `core/services/` + `core/stores/` |
| Feature data state | Feature Signal Stores | `features/{name}/store/` |
| UI rendering | Standalone Components | `features/{name}/pages/` + `features/{name}/components/` |
| Route protection | `AuthGuard`, `RbacGuard` | `core/guards/` |
| Design tokens | CSS custom properties | `src/styles/_tokens.scss` |
| Mock data | `MockDataService` + feature mock services | `core/mock-adapters/` + `features/{name}/mocks/` |

### DRY (Don't Repeat Yourself)

- Any UI pattern used in more than one feature module is extracted to `shared/components/`.
- Any data generator used by more than one Mock Adapter is extracted to `MockDataService`.
- Any RBAC check logic is centralized in `PermissionService` — never duplicated in
  components.
- SCSS breakpoint logic is centralized in `_breakpoints.scss` mixins — never duplicated in
  component stylesheets.
- Zero tolerance for duplicated code enforced in code review and pull request templates.

### KISS (Keep It Simple, Straightforward)

- No NgRx unless a feature requires state shared across more than two independent modules.
- No complex reactive chains where a Signal computed value suffices.
- No custom routing logic where Angular's built-in guards suffice.
- The routing table is a flat, readable configuration file — not a dynamic factory.

### Feature-Based Architecture

The codebase is organized by feature domain, not by technical type. All files related to the
deployments domain live under `features/deployments/`. No feature's internals bleed into
another feature's directory. This makes features independently navigable, testable, and
deployable (Module Federation compatible).

### Composition over Inheritance

Angular components use composition via content projection (`<ng-content>`), input/output
bindings, and injected services rather than class inheritance. The `PageHeader` component
accepts projected action buttons rather than subclassing. The `DataTable` component accepts
column definitions as data rather than requiring subclasses for each table variant.

### Accessibility First

Accessibility is a first-class concern, not an afterthought:
- All interactive elements have ARIA labels and roles.
- Focus management is explicit in dialogs (`ConfirmDialog` traps focus).
- Color is never the sole means of conveying information (StatusBadge uses both color and
  text/icon).
- Keyboard navigation is tested for all Sidebar navigation paths.
- Minimum touch target size of 44×44px on mobile.
- WCAG 2.2 AA is the baseline — Lighthouse Accessibility score ≥ 90 on every page.

### Performance First

- All 19 feature bundles are lazy-loaded; the initial payload contains only the shell.
- `OnPush` change detection strategy on all feature components.
- Angular Signals replace Zone.js-triggered change detection for all synchronous state.
- Virtual scrolling (`CdkVirtualScrollViewport`) for log viewers and large lists.
- Images and icons use SVG sprites or Material Icons font — no raster images in the shell.
- Performance budget enforced in `angular.json`: initial bundle < 300 KB gzipped.

### Scalability

- The architecture supports 30+ feature modules with zero impact on initial bundle size.
- Signal stores are destroyed with their lazy routes — no memory accumulates across
  navigations.
- The `MockDataService` and feature mock services are tree-shaken in production builds when
  `FeatureReadinessLevel` is `LIVE` for all features.

### Maintainability

- Every file has a single, clear purpose reflected in its name.
- Naming conventions are enforced by ESLint (`naming-convention` rule).
- No magic strings — status values, permission names, and route paths are typed constants.
- The `environment.ts` file is the single configuration surface for all deployment-time
  decisions.

### Extensibility

- New Feature_Modules are added by creating a new directory under `features/`, registering
  one route, and adding one entry to `environment.featureFlags`. No other file changes.
- New RBAC permissions are added by extending the `Permission` union type. No guard or
  service logic changes.
- New cloud providers are added via configuration data — the provider selector component
  is not modified.

### Testability

- Every Core service and Shared component is unit-testable without a running Angular
  application (plain TypeScript + Angular Testing Library).
- Mock_Adapters make all 19 feature stores testable without a backend.
- `PermissionService` is purely synchronous and purely functional — trivially testable.
- Property-based tests with `fast-check` validate universal invariants across all valid
  input spaces.


---

## Real-Time Communication Layer

### Overview

The IDP Frontend requires real-time data for: deployment logs, Terraform execution output,
Kubernetes events, Monitoring metrics, and live Notifications. The architecture defines a
unified real-time layer from Sprint 1 that supports both **Server-Sent Events (SSE)** and
**WebSockets**, with automatic reconnection, connection health monitoring, and a typed event
dispatcher. Feature modules consume this layer without knowing the underlying transport.

### Transport Strategy

| Use Case | Transport | Rationale |
|----------|-----------|-----------|
| Deployment logs streaming | SSE | Unidirectional, HTTP/1.1 compatible, simpler than WS |
| Terraform execution logs | SSE | Unidirectional stream from backend |
| Kubernetes events | SSE | Unidirectional; K8s watch API maps naturally |
| Live Notifications | SSE | Server-push only; no client messages needed |
| Monitoring metrics | SSE | Periodic push from Prometheus scrape cycle |
| AI chat responses | SSE | Streaming LLM response tokens |
| Future: bi-directional ops | WebSocket | Reserved for interactive terminal or live editing |

SSE is the default transport for all current Sprint use cases. WebSocket support is
scaffolded from Sprint 1 but activated only when a bi-directional channel is required.

### Architecture

```
Feature Component
      │ subscribes to
      ▼
 Feature Store (Signal)
      │ calls
      ▼
 Feature Service
      │ calls
      ▼
 RealtimeService  ─────────────────────────────────────┐
      │                                                 │
 SseTransport                              WsTransport  │
 (EventSource wrapper)                 (WebSocket wrap) │
      │                                                 │
      └─────────────────────────────────────────────────┘
                    │
            ConnectionManager
            (reconnect, heartbeat, status)
                    │
                 Backend
         (Spring Boot SSE / WS endpoint)
```

### Core Real-Time Services

All real-time services live in `src/app/core/realtime/`.

```
core/realtime/
├── realtime.service.ts          ← public facade; feature services call this
├── sse-transport.service.ts     ← EventSource wrapper with reconnection
├── ws-transport.service.ts      ← WebSocket wrapper (scaffolded, Sprint N)
├── connection-manager.service.ts← reconnection, heartbeat, status signal
├── event-dispatcher.service.ts  ← typed event routing to subscribers
└── models/
    ├── realtime-event.models.ts  ← RealTimeEvent<T>, EventType union
    └── connection-status.models.ts
```

### RealtimeService (Public Facade)

```typescript
// src/app/core/realtime/realtime.service.ts
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  // Connection status signal — consumed by TopNav connection indicator
  readonly connectionStatus: Signal<ConnectionStatus>;

  // Subscribe to a typed SSE stream from a backend endpoint
  stream<T>(endpoint: string, eventType: string): Observable<T>;

  // Subscribe to a WebSocket channel (future)
  channel<T>(topic: string): Observable<T>;

  // Disconnect from a stream (called on component destroy)
  disconnect(endpoint: string): void;
}
```

### SseTransportService

```typescript
// src/app/core/realtime/sse-transport.service.ts
@Injectable({ providedIn: 'root' })
export class SseTransportService {
  // Creates or reuses an EventSource connection to the given endpoint.
  // Automatically injects JWT Bearer token as a query parameter (SSE does not
  // support custom headers in native EventSource).
  connect(endpoint: string): Observable<MessageEvent>;

  // Tears down the EventSource and removes from the active connection registry.
  disconnect(endpoint: string): void;
}
```

### ConnectionManager

```typescript
// src/app/core/realtime/connection-manager.service.ts
@Injectable({ providedIn: 'root' })
export class ConnectionManagerService {
  // Reactive connection status exposed to Shell (TopNav indicator)
  readonly status = signal<ConnectionStatus>('connected');

  // Reconnection configuration
  private readonly RECONNECT_INTERVALS_MS = [1000, 2000, 5000, 10000, 30000];
  private readonly HEARTBEAT_INTERVAL_MS  = 30_000;

  // Called by SseTransportService on connection error
  onError(endpoint: string): void;

  // Called by SseTransportService on successful reconnect
  onReconnect(endpoint: string): void;

  // Starts periodic heartbeat ping to /api/health/ping
  startHeartbeat(): void;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected';
```

### ConnectionStatus Indicator

The `TopNavComponent` renders a small status dot next to the notification bell:
- 🟢 `connected` — solid green dot
- 🟡 `reconnecting` — pulsing amber dot with tooltip "Reconnecting..."
- 🔴 `disconnected` — red dot with tooltip "Connection lost. Retrying..."

This is a global signal — any SSE/WS disconnection propagates to the indicator immediately.

### EventDispatcher

```typescript
// src/app/core/realtime/event-dispatcher.service.ts
@Injectable({ providedIn: 'root' })
export class EventDispatcherService {
  // Typed event routing: feature stores subscribe to specific event types
  on<T>(eventType: RealTimeEventType): Observable<T>;

  // Internal: called by RealtimeService when an event arrives
  dispatch<T>(event: RealTimeEvent<T>): void;
}

export type RealTimeEventType =
  | 'deployment.log'
  | 'deployment.status'
  | 'terraform.log'
  | 'terraform.status'
  | 'kubernetes.event'
  | 'monitoring.metric'
  | 'notification.new'
  | 'incident.update'
  | 'ai.response.token'   // streaming AI chat tokens
  | 'system.heartbeat';

export interface RealTimeEvent<T> {
  type: RealTimeEventType;
  payload: T;
  timestamp: string;
  correlationId?: string;
}
```

### Feature Integration Pattern

Feature stores subscribe to real-time events through `EventDispatcherService`, not directly
through `RealtimeService`. This preserves the layering principle.

```typescript
// Example: DeploymentStore subscribes to live log streaming
// When Feature_Readiness_Level is LIVE, the store opens an SSE stream.
// When MOCK, the store uses MockDataService to simulate streaming.

// In DeploymentStore.loadLogs(deploymentId):
if (this.isLive()) {
  this.realtimeService
    .stream<string>(`/deployments/${deploymentId}/logs`, 'deployment.log')
    .pipe(takeUntilDestroyed())
    .subscribe(line => this.appendLogLine(line));
} else {
  this.mock.streamLogs(deploymentId)   // Observable<string> with simulated delay
    .pipe(takeUntilDestroyed())
    .subscribe(line => this.appendLogLine(line));
}
```

### Mock SSE Simulation

The `MockDataService` provides an `simulateStream<T>()` utility that emits values with
configurable delays to simulate real-time streaming during MOCK mode:

```typescript
// core/mock-adapters/mock-data.service.ts
simulateStream<T>(items: T[], intervalMs = 200): Observable<T> {
  return from(items).pipe(
    concatMap(item => of(item).pipe(delay(intervalMs)))
  );
}
```

All 19 feature Mock Services use this utility to simulate streaming logs, events, and metrics
before the SSE backend endpoints are available.

### Future WebSocket Support

`WsTransportService` is scaffolded in Sprint 1 with stub implementations. It is activated
when `environment.enableWebSocket = true`. The `RealtimeService` facade routes to either
`SseTransportService` or `WsTransportService` based on configuration and event type, with
no impact on feature stores or components.


---

## Enterprise Design System

### Design Philosophy

The IDP Frontend design system is inspired by four enterprise platforms:
- **Azure Portal** — high information density, dark chrome, command palette navigation
- **Backstage** — clean card-based catalog metaphor, clear hierarchy
- **GitHub Enterprise** — monochromatic sidebar, clear status indicators, developer focus
- **GitLab Enterprise** — structured navigation groups, data-dense tables, audit-first UX

The system enforces: **professional minimalism** (no decorative elements), **data density**
(more information per viewport than a consumer app), **status clarity** (every entity
communicates its state without hover), and **enterprise trust** (no playful gradients,
animations are functional not decorative).

### Extended Color Token System

The existing `_tokens.scss` is extended with the following additional token categories:

```scss
// src/styles/_tokens.scss  — ADDITIONS to existing file

:root, [data-theme="light"] {

  // ── Surface Hierarchy (layered depth) ────────────────────
  --color-surface-0:    #FFFFFF;     // base page background
  --color-surface-1:    #F5F7FA;     // primary card surface
  --color-surface-2:    #EEF2F7;     // nested panel / table row hover
  --color-surface-3:    #E4EAF2;     // selected row / active state
  --color-surface-overlay: rgba(0,0,0,0.4);  // modal backdrop

  // ── Brand Extended ───────────────────────────────────────
  --color-primary-50:   #EFF8FF;
  --color-primary-100:  #DBEFFE;
  --color-primary-200:  #B3DAFD;
  --color-primary-500:  #0070AD;
  --color-primary-600:  #005c8f;
  --color-primary-700:  #004a73;
  --color-primary-900:  #002540;

  --color-accent-50:    #F5F0FA;
  --color-accent-100:   #E9D9F5;
  --color-accent-500:   #6F2C91;
  --color-accent-700:   #531F6D;

  // ── Status Colors (extended) ─────────────────────────────
  --color-success-50:   #F0FDF4;
  --color-success-500:  #16A34A;
  --color-success-700:  #15803D;

  --color-warning-50:   #FFFBEB;
  --color-warning-500:  #D97706;
  --color-warning-700:  #B45309;

  --color-error-50:     #FEF2F2;
  --color-error-500:    #DC2626;
  --color-error-700:    #B91C1C;

  --color-info-50:      #EFF6FF;
  --color-info-500:     #2563EB;
  --color-info-700:     #1D4ED8;

  // ── P1-P4 Severity Colors (Incidents) ────────────────────
  --color-p1:  #DC2626;    // critical red
  --color-p2:  #EA580C;    // high orange
  --color-p3:  #D97706;    // medium amber
  --color-p4:  #2563EB;    // low blue

  // ── Readiness Level Indicator Colors ─────────────────────
  --color-readiness-mock:    #9CA3AF;    // grey
  --color-readiness-partial: #F59E0B;    // amber
  --color-readiness-live:    #16A34A;    // green

  // ── Interactive States ───────────────────────────────────
  --color-focus-ring:    rgba(0, 112, 173, 0.5);   // primary at 50% opacity
  --color-focus-ring-offset: 2px;

  // ── Code & Logs ──────────────────────────────────────────
  --color-log-bg:        #0D1117;    // GitHub-inspired dark log background
  --color-log-text:      #E6EDF3;
  --color-log-error:     #FF7B72;
  --color-log-warning:   #D29922;
  --color-log-info:      #79C0FF;
  --color-log-success:   #56D364;
  --color-log-timestamp: #8B949E;
}

[data-theme="dark"] {
  --color-surface-0:    #0D1117;
  --color-surface-1:    #161B22;
  --color-surface-2:    #1C2128;
  --color-surface-3:    #22272E;
  --color-surface-overlay: rgba(0,0,0,0.6);

  --color-primary-50:   #002540;
  --color-primary-100:  #004a73;
  --color-primary-500:  #2E9DD4;    // lightened for dark bg contrast
  --color-primary-600:  #12ABDB;

  --color-log-bg:       #010409;
  --color-log-text:     #E6EDF3;
}
```

### Typography Scale

```scss
// Extended typography tokens
:root {
  // ── Line Heights ─────────────────────────────────────────
  --line-height-tight:   1.25;
  --line-height-snug:    1.375;
  --line-height-normal:  1.5;
  --line-height-relaxed: 1.625;

  // ── Letter Spacing ────────────────────────────────────────
  --tracking-tight:   -0.025em;
  --tracking-normal:   0em;
  --tracking-wide:     0.025em;
  --tracking-wider:    0.05em;
  --tracking-widest:   0.1em;

  // ── Display Sizes (page headings, hero numbers) ───────────
  --font-size-4xl:  2.25rem;   // 36px — dashboard section headings
  --font-size-5xl:  3rem;      // 48px — large KPI values
}
```

### Responsive Grid System

The layout grid uses CSS Grid throughout — no Bootstrap, no Flexbox-only layouts.

```scss
// src/styles/_grid.scss
:root {
  --grid-columns:       12;
  --grid-gutter:        var(--space-6);        // 24px default
  --grid-gutter-mobile: var(--space-4);        // 16px on mobile
  --grid-max-width:     1440px;                // maximum content width
  --sidebar-width:      260px;                 // expanded sidebar
  --sidebar-collapsed:  64px;                  // icon-only sidebar
  --topnav-height:      64px;
}

// Dashboard KPI grid — defined once, used everywhere
.idp-kpi-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(4, 1fr);      // desktop

  @include tablet-only  { grid-template-columns: repeat(3, 1fr); }
  @include mobile-only  { grid-template-columns: 1fr; }
}

// Standard content grid for detail pages
.idp-content-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: 2fr 1fr;             // main + sidebar panel

  @include tablet-only  { grid-template-columns: 1fr; }
  @include mobile-only  { grid-template-columns: 1fr; }
}
```

### Icon System

Material Symbols (variable font) is the primary icon set. It is loaded as a web font and
subset for production builds.

```scss
// src/styles/_icons.scss
// Material Symbols Rounded — variable weight/fill/grade axes

@font-face {
  font-family: 'Material Symbols Rounded';
  font-style: normal;
  font-weight: 100 700;
  src: url('/assets/fonts/material-symbols-rounded.woff2') format('woff2');
  font-display: block;   // never flash blank icons
}

.material-symbols-rounded {
  font-family: 'Material Symbols Rounded';
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  font-size: inherit;
  line-height: 1;
  display: inline-block;
  vertical-align: middle;
  user-select: none;
}

// Filled variant for active nav items and selected states
.icon-filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

**Icon naming conventions** — platform-specific icon assignments:

| Module | Icon name |
|--------|-----------|
| Dashboard | `dashboard` |
| AI Assistant | `auto_awesome` |
| Service Catalog | `category` |
| Provision Requests | `pending_actions` |
| Deployments | `rocket_launch` |
| Terraform | `construction` |
| CI/CD | `account_tree` |
| GitOps | `sync_alt` |
| Containers | `deployed_code` |
| Kubernetes | `hub` |
| Cloud Resources | `cloud` |
| Monitoring | `monitoring` |
| Incidents | `emergency` |
| Notifications | `notifications` |
| Recommendations | `lightbulb` |
| Organizations | `corporate_fare` |
| Teams | `groups` |
| Users | `manage_accounts` |
| Settings | `settings` |
| Audit Logs | `receipt_long` |
| Roles | `shield_person` |
| Permissions | `lock` |

### Motion & Animation Guidelines

Animations are functional — they communicate state changes, not decoration.

```scss
// src/styles/_animations.scss

// ── Timing Functions ──────────────────────────────────────
:root {
  --ease-standard:  cubic-bezier(0.4, 0, 0.2, 1);   // Material standard
  --ease-decelerate:cubic-bezier(0, 0, 0.2, 1);      // elements entering
  --ease-accelerate:cubic-bezier(0.4, 0, 1, 1);      // elements leaving

  // ── Duration Scale ────────────────────────────────────────
  --duration-instant:  50ms;
  --duration-fast:     100ms;
  --duration-normal:   200ms;
  --duration-slow:     300ms;
  --duration-enter:    250ms;
  --duration-leave:    200ms;
}

// ── Skeleton loading shimmer ──────────────────────────────
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position:  200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-surface-2) 25%,
    var(--color-surface-3) 50%,
    var(--color-surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: var(--radius-md);
}

// ── StatusBadge pulse (for RUNNING state) ─────────────────
@keyframes pulse-ring {
  0%   { transform: scale(0.8); opacity: 0.8; }
  100% { transform: scale(1.8); opacity: 0; }
}

.badge-pulse::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: var(--radius-full);
  border: 2px solid currentColor;
  animation: pulse-ring 1.5s ease-out infinite;
}
```

**Animation rules:**
- Transitions for hover/focus states: `var(--duration-fast)` (100ms)
- Route transition fades: `var(--duration-normal)` (200ms)
- Sidebar expand/collapse: `var(--duration-slow)` (300ms)
- No animation on data tables — only on loading states and status badges
- `prefers-reduced-motion: reduce` respected globally via `@media` query wrapper

### WCAG 2.2 AA Compliance

The following WCAG 2.2 success criteria are enforced by design:

| Criterion | SC | Implementation |
|-----------|----|----------------|
| Colour contrast (normal text) | 1.4.3 | All token pairs verified ≥ 4.5:1 |
| Colour contrast (large text) | 1.4.3 | All token pairs verified ≥ 3:1 |
| Non-text contrast (UI components) | 1.4.11 | Border + icon colours ≥ 3:1 against background |
| Reflow (320px viewport) | 1.4.10 | Single-column layout at 320px, no horizontal scroll |
| Resize text (200%) | 1.4.4 | No overflow or truncation at 2× zoom |
| Focus appearance | 2.4.11 | Focus ring: `--color-focus-ring` 2px offset |
| Focus not obscured | 2.4.12 | Sticky headers do not cover focused elements |
| Touch target size | 2.5.8 | All touch targets ≥ 24×24px; interactive ≥ 44×44px |
| Keyboard navigation | 2.1.1 | All interactive elements reachable by keyboard |
| Dragging movements | 2.5.7 | No functionality requires drag-only interaction |

**Automated accessibility testing:** `axe-core` is integrated into the Jest test suite.
Every shared component spec runs `axe` assertions. Lighthouse CI enforces score ≥ 90 on pull
requests.


---

## Security Architecture

### JWT Lifecycle

```
User logs in
     │
     ▼
POST /auth/login → { accessToken, refreshToken, expiresIn }
     │
     ├── accessToken  → stored in AuthStore.tokens (in-memory Signal, never persisted)
     ├── refreshToken
     │     ├── remember-me=true  → HttpOnly Secure cookie (set by backend Set-Cookie header)
     │     └── remember-me=false → sessionStorage (cleared on tab close)
     │
     ▼
JwtInterceptor runs before every API request:
  - Reads accessToken from AuthStore (in-memory)
  - Checks: expiresAt - Date.now() < 60_000ms
       YES → proactively call POST /auth/refresh
              ├── success → update AuthStore.tokens; proceed with original request
              └── failure → AuthService.logout(); navigate /auth/login
  - Attaches: Authorization: Bearer {accessToken}
     │
     ▼
API responds 401 (token expired mid-flight):
  - JwtInterceptor calls POST /auth/refresh ONCE
       ├── success → retry original request with new token
       └── failure → AuthService.logout(); navigate /auth/login

API responds 403 (insufficient permissions):
  - Navigate to /403; DO NOT clear session
```

### Session Timeout

```typescript
// src/app/core/services/session-timeout.service.ts
@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private readonly IDLE_TIMEOUT_MS = 30 * 60 * 1000;  // 30 minutes
  private readonly WARNING_BEFORE_MS = 2 * 60 * 1000;  // warn 2 min before
  private idleTimer: ReturnType<typeof setTimeout>;

  // Resets on any user interaction (mousemove, keydown, click, scroll)
  resetTimer(): void;

  // Emits when timeout is T-2min away
  readonly timeoutWarning$: Observable<number>;  // seconds remaining

  // Calls AuthService.logout() on expiry
  onTimeout(): void;
}
```

The `SessionTimeoutService` is initialized in `AppComponent.ngOnInit()` and attaches global
event listeners. A dismissible warning banner appears 2 minutes before timeout with an
"Extend Session" button that calls `resetTimer()`.

### Content Security Policy

Defined in both Nginx config (`docker/nginx.conf`) and as a meta tag in `index.html` for
environments where Nginx headers cannot be set:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  connect-src 'self' {environment.apiBaseUrl} {environment.grafanaUrl};
  frame-src {environment.grafanaUrl};
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
```

The `connect-src` and `frame-src` directives are templated from `environment.ts` at build
time via Angular's environment file substitution.

### Security Headers (Nginx)

```nginx
# All headers set in docker/nginx.conf
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "strict-origin-when-cross-origin";
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-XSS-Protection "1; mode=block";
```

### RBAC Permission Matrix

All platform permissions and their role assignments are defined in a single source of truth:

```typescript
// src/app/core/models/rbac.models.ts — complete permission matrix

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Administration
    'users:read', 'users:manage',
    'organizations:read', 'organizations:manage',
    'teams:read', 'teams:manage',
    'audit:read',
    'roles:read', 'roles:manage',
    'permissions:read', 'permissions:manage',
    // All feature permissions
    'deployments:read', 'deployments:trigger',
    'terraform:read', 'terraform:execute',
    'containers:read', 'containers:start', 'containers:stop', 'containers:logs',
    'kubernetes:read', 'kubernetes:exec', 'kubernetes:admin',
    'cloud:read', 'cloud:manage', 'cloud:cost-view',
    'monitoring:read', 'monitoring:alerts:manage',
    'incidents:read', 'incidents:assign', 'incidents:resolve',
    'recommendations:read', 'recommendations:manage',
    'provision-requests:read', 'provision-requests:create', 'provision-requests:approve',
    'cicd:read', 'gitops:read', 'gitops:sync', 'gitops:rollback',
    'ai-assistant:read', 'ai-assistant:chat',
  ],
  OPERATOR: [
    'deployments:read', 'deployments:trigger',
    'terraform:read', 'terraform:execute',
    'containers:read', 'containers:start', 'containers:stop', 'containers:logs',
    'kubernetes:read', 'kubernetes:exec',
    'cloud:read', 'cloud:cost-view',
    'monitoring:read', 'monitoring:alerts:manage',
    'incidents:read', 'incidents:assign', 'incidents:resolve',
    'recommendations:read',
    'cicd:read', 'gitops:read', 'gitops:sync',
    'audit:read',
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
    'provision-requests:read', 'provision-requests:create',
    'cicd:read',
    'ai-assistant:read', 'ai-assistant:chat',
  ],
  APPROVER: [
    'provision-requests:read', 'provision-requests:approve',
    'deployments:read',
    'incidents:read', 'incidents:assign',
  ],
  VIEWER: [
    'deployments:read',
    'containers:read',
    'kubernetes:read',
    'monitoring:read',
    'incidents:read',
    'recommendations:read',
    'provision-requests:read',
  ],
};
```

### API Rate Limiting Considerations

The frontend implements a client-side rate limiter to protect the backend from excessive
polling and retry storms:

```typescript
// src/app/core/interceptors/rate-limit.interceptor.ts
// Applies exponential backoff on consecutive 429 responses.
// Maximum retry attempts: 3
// Backoff: 1s → 2s → 4s → give up, show ErrorAlert
export const rateLimitInterceptor: HttpInterceptorFn = (req, next) => { ... };
```

Dashboard KPI widgets use a minimum polling interval of 15 seconds. The `DashboardStore`
debounces simultaneous refresh requests to prevent a burst of 13 parallel API calls on
rapid re-clicks of the refresh button.


---

## Advanced Navigation Structure

### Sidebar Navigation Groups (Definitive)

The sidebar is organized into seven named groups. Each group is collapsible. The active group
expands automatically on navigation. Group collapse state is persisted in `localStorage`.

```
▶ PLATFORM
    🔲 Dashboard            /dashboard          (icon: dashboard)
    🤖 AI Assistant         /ai-assistant       (icon: auto_awesome)

▶ DEVELOPER PORTAL
    📦 Service Catalog      /service-catalog    (icon: category)
    📋 Provision Requests   /provision-requests (icon: pending_actions)
    🚀 Deployments          /deployments        (icon: rocket_launch)

▶ INFRASTRUCTURE
    🔧 Terraform            /terraform          (icon: construction)
    🐳 Containers           /containers         (icon: deployed_code)
    ☸  Kubernetes           /kubernetes         (icon: hub)
    ☁  Cloud Resources      /cloud-resources    (icon: cloud)

▶ DEVOPS
    🔄 CI/CD                /cicd               (icon: account_tree)
    🔀 GitOps               /gitops             (icon: sync_alt)

▶ OBSERVABILITY
    📊 Monitoring           /monitoring         (icon: monitoring)
    🚨 Incidents            /incidents          (icon: emergency)
    🔔 Notifications        /notifications      (icon: notifications)
    💡 Recommendations      /recommendations    (icon: lightbulb)

▶ ADMINISTRATION
    🏢 Organizations        /organizations      (icon: corporate_fare)
    👥 Teams                /teams              (icon: groups)
    👤 Users                /users              (icon: manage_accounts)
    🛡  Roles               /roles              (icon: shield_person)
    🔒 Permissions          /permissions        (icon: lock)
    📜 Audit Logs           /audit-logs         (icon: receipt_long)
    ⚙  Settings             /settings           (icon: settings)
```

**Module count update:** The navigation now includes 23 routes (19 original + GitOps, Roles,
Permissions, Audit Logs as dedicated top-level routes). The router configuration, folder
structure, and module inventory are updated accordingly in the implementation phase.

### Sidebar Component Design

```typescript
// src/app/layout/sidebar/sidebar.component.ts

// Navigation group definition
export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
  collapsed: boolean;     // persisted in localStorage
}

export interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: string;           // Material Symbols name
  requiredPermissions: Permission[];
  readinessLevel?: FeatureReadinessLevel;  // shown as dot for ADMIN/OPERATOR only
  badge?: Signal<number>; // dynamic badge (e.g. unread notifications count)
}
```

The `SidebarComponent` uses a `*hasPermission` structural directive to hide/show `NavItem`
elements based on the current user's permissions. Items with no required permissions are
always shown.

```typescript
// src/app/shared/directives/permission.directive.ts
// Usage: *idpHasPermission="'deployments:trigger'"
// Removes the host element from the DOM if permission is not granted.
@Directive({ selector: '[idpHasPermission]', standalone: true })
export class HasPermissionDirective implements OnInit {
  @Input('idpHasPermission') permission!: Permission;
  // Uses PermissionService.hasPermission() synchronously
}
```


---

## Advanced Dashboard Design

### Platform Operations Dashboard

The Dashboard evolves from a simple KPI grid into a full **Platform Operations Dashboard**
modeled after Azure Monitor Overview + GitHub Operations dashboards.

### Widget Inventory (22 widgets)

| # | Widget Name | Data Source | Update Strategy |
|---|-------------|-------------|-----------------|
| 1 | Platform Availability | `/dashboard/availability` | Every 60s |
| 2 | Infrastructure Health | `/dashboard/infra-health` | Every 30s |
| 3 | Kubernetes Cluster Health | `/kubernetes/health` | Every 30s |
| 4 | Running Pods | `/kubernetes/stats` | Every 30s |
| 5 | Node Count | `/kubernetes/stats` | Every 60s |
| 6 | CPU Usage (%) | `/monitoring/metrics/cpu` | Every 15s |
| 7 | Memory Usage (GB) | `/monitoring/metrics/memory` | Every 15s |
| 8 | Storage Usage (GB) | `/monitoring/metrics/storage` | Every 60s |
| 9 | Network I/O | `/monitoring/metrics/network` | Every 15s |
| 10 | Running Containers | `/containers/stats` | Every 30s |
| 11 | Container Health | `/containers/health` | Every 30s |
| 12 | Terraform Jobs | `/terraform/stats` | Every 30s |
| 13 | Deployment Status | `/deployments/stats` | Every 30s |
| 14 | GitHub Actions Pipelines | `/cicd/stats` | Every 30s |
| 15 | Azure Resources | `/cloud-resources/stats` | Every 120s |
| 16 | Cost Overview (MTD) | `/cloud-resources/cost` | Every 300s |
| 17 | Active Users | `/users/stats` | Every 60s |
| 18 | Pending Requests | `/provision-requests/stats` | Every 30s |
| 19 | Pending Approvals | `/provision-requests/approvals` | Every 30s |
| 20 | Notification Count | `NotificationStore` (Signal) | Real-time |
| 21 | Incident Summary | `/incidents/summary` | Every 30s |
| 22 | AI Recommendations | `/recommendations/summary` | Every 120s |

Plus: **Recent Activity Feed** (last 20 events, below the widget grid).

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  PageHeader: "Platform Overview"              [Refresh All]  [Last updated: 2s ago] │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Platform     │  │ Infra        │  │ K8s Cluster  │  │ Running Pods │    │
│  │ Availability │  │ Health       │  │ Health       │  │   247        │    │
│  │   99.7%  ↑  │  │  ●Healthy   │  │  ●Healthy   │  │          ↑   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Node Count   │  │ CPU Usage    │  │ Memory Usage │  │ Storage      │    │
│  │    12        │  │  34.2%  ↓   │  │  8.4 GB  ↑  │  │  1.2 TB  →  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Containers   │  │ Terraform    │  │ Deployments  │  │ CI/CD        │    │
│  │   18 running │  │  2 running   │  │  5 running   │  │  3 running   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Azure Res.   │  │ Cost (MTD)   │  │ Active Users │  │ Pending Appr.│    │
│  │   43 total   │  │  $1,247      │  │    89        │  │    7         │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Incidents    │  │ AI Recommend.│  │ Notifications│  │ Network I/O  │    │
│  │  1 P1, 2 P3  │  │   5 new      │  │   12 unread  │  │  450 MB/s   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
├──────────────────────────────────────────────────────────────────────────────┤
│  Recent Activity Feed (last 20 events — TimelineComponent)                   │
│  ● Alice Chen triggered deployment payment-gateway:1.4.2 to production  2m  │
│  ● Terraform apply completed for aks-cluster-prod workspace              5m  │
│  ● P2 Incident #INC-0042 assigned to Erik Andersen                       8m  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### DashboardStore Updates

The existing `DashboardStore` is extended to manage 22 independent widget states:

```typescript
// Each widget is an independent ResourceState Signal in DashboardStore.
// This preserves the existing pattern — only widget count increases.

@Injectable({ providedIn: 'root' })
export class DashboardStore {
  // Existing 13 widgets remain unchanged
  // New widgets added:
  readonly platformAvailability = signal<ResourceState<PlatformAvailability>>(initial());
  readonly infrastructureHealth = signal<ResourceState<InfraHealth>>(initial());
  readonly storageUsage          = signal<ResourceState<StorageMetric>>(initial());
  readonly networkIo             = signal<ResourceState<NetworkMetric>>(initial());
  readonly containerHealth       = signal<ResourceState<ContainerHealth>>(initial());
  readonly azureResources        = signal<ResourceState<AzureResourceStats>>(initial());
  readonly costOverview           = signal<ResourceState<CostOverview>>(initial());
  readonly incidentSummary       = signal<ResourceState<IncidentSummary>>(initial());
  readonly aiRecommendations     = signal<ResourceState<RecommendationSummary>>(initial());

  // Refresh all 22 widgets in parallel
  refreshAll(): void {
    // Dispatches all widget fetches simultaneously
    // A debounce of 500ms prevents refresh storms on rapid re-clicks
  }
}
```


---

## Extended Module Specifications

### Terraform Module

**Route prefix:** `/terraform`  
**Child routes:**

| Path | Component | Description |
|------|-----------|-------------|
| `/terraform` | `TerraformListPage` | All workspaces |
| `/terraform/workspaces/:id` | `WorkspacePage` | Workspace overview |
| `/terraform/workspaces/:id/plan` | `PlanPage` | Plan output viewer |
| `/terraform/workspaces/:id/apply` | `ApplyPage` | Apply execution + logs |
| `/terraform/workspaces/:id/destroy` | `DestroyPage` | Destroy execution + logs |
| `/terraform/workspaces/:id/history` | `HistoryPage` | Execution history timeline |
| `/terraform/workspaces/:id/state` | `StatePage` | State file viewer |
| `/terraform/workspaces/:id/variables` | `VariablesPage` | Variable management |
| `/terraform/workspaces/:id/outputs` | `OutputsPage` | Output values |

**TerraformStore additions:**

```typescript
// features/terraform/store/terraform.store.ts
readonly workspaces   = signal<ResourceState<Workspace[]>>(initial());
readonly currentPlan  = signal<ResourceState<TerraformPlan>>(initial());
readonly executionLog = signal<string[]>([]);        // streaming log lines
readonly isStreaming  = signal<boolean>(false);
readonly stateFile    = signal<ResourceState<TerraformState>>(initial());
readonly variables    = signal<ResourceState<TerraformVariable[]>>(initial());
readonly outputs      = signal<ResourceState<TerraformOutput[]>>(initial());
readonly history      = signal<ResourceState<TerraformJob[]>>(initial());
```

Plan output renders in `LogViewer` with color-coded diff:
- Lines starting with `+` → `--color-success-500` (additions)
- Lines starting with `-` → `--color-error-500` (destructions)
- Lines starting with `~` → `--color-warning-500` (modifications)

**Real-time:** When `Feature_Readiness_Level = LIVE`, plan/apply/destroy execution logs
stream via SSE from `/terraform/workspaces/:id/stream`. The `TerraformStore` subscribes to
the `RealtimeService` stream and appends lines to `executionLog` Signal in real time.

---

### CI/CD Module

**Route prefix:** `/cicd`  
**Child routes:**

| Path | Component | Description |
|------|-----------|-------------|
| `/cicd` | `CicdListPage` | All pipelines |
| `/cicd/pipelines/:id` | `PipelineDetailPage` | Pipeline detail |
| `/cicd/pipelines/:id/runs/:runId` | `RunDetailPage` | Individual run detail |
| `/cicd/pipelines/:id/runs/:runId/logs` | `RunLogsPage` | Full log viewer |
| `/cicd/artifacts` | `ArtifactsPage` | Build artifacts list |

**CicdStore additions:**

```typescript
readonly pipelines       = signal<ResourceState<Pipeline[]>>(initial());
readonly running         = signal<ResourceState<PipelineRun[]>>(initial());
readonly failed          = signal<ResourceState<PipelineRun[]>>(initial());
readonly successful      = signal<ResourceState<PipelineRun[]>>(initial());
readonly selectedRun     = signal<ResourceState<PipelineRun>>(initial());
readonly runLog          = signal<string[]>([]);
readonly artifacts       = signal<ResourceState<BuildArtifact[]>>(initial());
```

**Models additions:**

```typescript
export interface PipelineRun {
  id: string;
  pipelineId: string;
  runNumber: number;
  status: 'SUCCESS' | 'FAILURE' | 'RUNNING' | 'CANCELLED' | 'QUEUED';
  triggeredBy: string;
  branch: string;
  commitSha: string;
  commitMessage: string;
  startedAt: string;
  completedAt: string | null;
  durationSeconds: number | null;
  artifactCount: number;
}

export interface BuildArtifact {
  id: string;
  runId: string;
  name: string;
  sizeBytes: number;
  downloadUrl: string;
  createdAt: string;
}
```

---

### GitOps Module (new — Sprint N)

**Route prefix:** `/gitops`  
**Feature_Readiness_Level:** MOCK from Sprint 1  
**Required permissions:** `gitops:read`, `gitops:sync`, `gitops:rollback`

**Child routes:**

| Path | Component | Description |
|------|-----------|-------------|
| `/gitops` | `GitOpsListPage` | All ArgoCD applications |
| `/gitops/apps/:name` | `AppDetailPage` | Application detail |
| `/gitops/apps/:name/history` | `RevisionHistoryPage` | Revision history |
| `/gitops/apps/:name/logs` | `SyncLogsPage` | Sync log viewer |

**GitOpsStore:**

```typescript
// features/gitops/store/gitops.store.ts
readonly applications    = signal<ResourceState<ArgoCdApp[]>>(initial());
readonly selectedApp     = signal<ResourceState<ArgoCdApp>>(initial());
readonly revisionHistory = signal<ResourceState<Revision[]>>(initial());
readonly syncLog         = signal<string[]>([]);
readonly isDrifted       = computed(() =>
  (this.applications().data ?? []).some(a => a.syncStatus === 'OutOfSync')
);
```

**Models:**

```typescript
export interface ArgoCdApp {
  name: string;
  namespace: string;
  project: string;
  repoUrl: string;
  targetRevision: string;
  path: string;
  syncStatus: 'Synced' | 'OutOfSync' | 'Unknown';
  healthStatus: 'Healthy' | 'Degraded' | 'Progressing' | 'Suspended' | 'Missing';
  lastSyncedAt: string;
  currentRevision: string;
  autoSync: boolean;
}

export interface Revision {
  id: string;
  appName: string;
  revision: string;
  deployedAt: string;
  deployedBy: string;
  message: string;
  status: 'Succeeded' | 'Failed';
}
```

**RBAC additions:**
```typescript
// Add to Permission union:
'gitops:read' | 'gitops:sync' | 'gitops:rollback'
```

---

### Kubernetes Module — Extended

**Additional child routes:**

```
/kubernetes/statefulsets/:namespace
/kubernetes/daemonsets/:namespace
/kubernetes/replicasets/:namespace
/kubernetes/hpa/:namespace
/kubernetes/events
/kubernetes/pvc/:namespace
```

**KubernetesStore additions:**

```typescript
readonly statefulSets  = signal<ResourceState<StatefulSet[]>>(initial());
readonly daemonSets    = signal<ResourceState<DaemonSet[]>>(initial());
readonly replicaSets   = signal<ResourceState<ReplicaSet[]>>(initial());
readonly hpas          = signal<ResourceState<HorizontalPodAutoscaler[]>>(initial());
readonly pvcs          = signal<ResourceState<PersistentVolumeClaim[]>>(initial());
readonly events        = signal<ResourceState<KubernetesEvent[]>>(initial());
```

**Real-time events:** When `Feature_Readiness_Level = LIVE`, `KubernetesStore` subscribes
to `EventDispatcherService.on('kubernetes.event')` to receive live cluster events from the
SSE stream, appending them to the `events` Signal without polling.

---

### Cloud Resources (Azure) — Extended

**Additional models:**

```typescript
export interface AzureContainerRegistry {
  name: string; resourceGroup: string; loginServer: string;
  sku: string; repositoryCount: number;
}
export interface AzureKeyVault {
  name: string; resourceGroup: string; vaultUri: string;
  secretCount: number; keyCount: number; certificateCount: number;
}
export interface AzurePostgresServer {
  name: string; resourceGroup: string; fqdn: string;
  version: string; skuName: string; state: string;
}
export interface AzureLoadBalancer {
  name: string; resourceGroup: string; sku: string;
  frontendIpCount: number; backendPoolCount: number;
}
export interface AzureManagedIdentity {
  name: string; resourceGroup: string; clientId: string; principalId: string;
}
```

**CloudResourceStore additions:**

```typescript
readonly containerRegistries = signal<ResourceState<AzureContainerRegistry[]>>(initial());
readonly keyVaults           = signal<ResourceState<AzureKeyVault[]>>(initial());
readonly postgresServers     = signal<ResourceState<AzurePostgresServer[]>>(initial());
readonly loadBalancers       = signal<ResourceState<AzureLoadBalancer[]>>(initial());
readonly managedIdentities   = signal<ResourceState<AzureManagedIdentity[]>>(initial());
```

---

### Monitoring Module — Extended

**Additional child routes:**

```
/monitoring/metrics          MetricsExplorerPage
/monitoring/logs             LogExplorerPage
/monitoring/alerts           AlertListPage
/monitoring/alerts/:id       AlertDetailPage
/monitoring/grafana          GrafanaEmbedPage
/monitoring/alert-history    AlertHistoryPage
```

**MonitoringStore additions:**

```typescript
readonly prometheusMetrics = signal<ResourceState<MetricSeries[]>>(initial());
readonly lokiLogs          = signal<string[]>([]);  // streaming
readonly alertRules        = signal<ResourceState<AlertRule[]>>(initial());
readonly activeAlerts      = signal<ResourceState<ActiveAlert[]>>(initial());
readonly alertHistory      = signal<ResourceState<AlertHistoryEntry[]>>(initial());
```

**MetricsExplorerPage** allows the user to select a metric name from a dropdown, set a time
range, and render the resulting time-series as a chart using `chart.js` + `ng2-charts`.

**LogExplorerPage** provides a Loki LogQL query input and a `LogViewer` showing results.
Real-time tail mode subscribes to `RealtimeService.stream()` for live log output.

---

### AI Assistant Module — Extended

**Full architecture:**

```typescript
// features/ai-assistant/models/ai-assistant.models.ts
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  timestamp: string;
  isStreaming?: boolean;     // true while receiving tokens via SSE
  suggestionType?: AiSuggestionType;
  linkedEntityId?: string;
}

export type AiSuggestionType =
  | 'INFRASTRUCTURE_RECOMMENDATION'
  | 'DEPLOYMENT_RECOMMENDATION'
  | 'TERRAFORM_SUGGESTION'
  | 'INCIDENT_ANALYSIS'
  | 'COST_OPTIMIZATION'
  | 'KNOWLEDGE_SEARCH_RESULT';

export interface AiContext {
  moduleContext: string;   // e.g., 'deployment:abc-123' — injected by calling module
  userRole: UserRole;
  orgId: string | null;
}
```

**Real-time streaming:** AI chat responses stream via SSE from `/ai/chat/stream`.
`AiAssistantStore` subscribes to `EventDispatcherService.on('ai.response.token')` and
appends tokens to the last `ChatMessage.content` in the conversation Signal, setting
`isStreaming = false` on the `[DONE]` event.

**Inline suggestion panels** on Incidents, Deployments, Terraform pages each accept an
`AiContext` input and call `AiAssistantService.getSuggestion(context)`. Mock responses
are returned by `AiAssistantMockService` with a simulated 800ms typing delay.

**Knowledge Search:** A dedicated search input in the AI Assistant console sends
`POST /ai/knowledge-search` with the query string. Results render as a list of
`AiSuggestion` cards below the chat panel, each with a confidence score bar.


---

## UX State Patterns

Every page in the IDP Frontend handles six distinct UI states consistently. No custom
per-page state logic is ever written — all state transitions are handled by the
`ResourceState` pattern, Shared components, and the `OnPush` change detection strategy.

### Universal State Machine

```
INITIAL (no fetch dispatched)
    │
    └──[load() called]──► LOADING
                              │
                    ┌─────────┴──────────┐
                    │                    │
                 SUCCESS              ERROR
                 (data ≠ null)        (error ≠ null)
                    │                    │
              ┌─────┴─────┐         [retry()]
              │           │              │
           HAS DATA   EMPTY DATA    LOADING again
           (render     (render
            DataTable)  EmptyState)
```

### State → Component Mapping

| State | ResourceState shape | Rendered Component |
|-------|--------------------|--------------------|
| Loading | `{ loading: true, data: null }` | `<idp-loading-spinner>` or skeleton rows |
| Success with data | `{ loading: false, data: T[] }` | `<idp-data-table>` or content |
| Success empty | `{ loading: false, data: [] }` | `<idp-empty-state>` |
| Error | `{ loading: false, error: 'msg' }` | `<idp-error-alert [showRetry]="true">` |
| Offline | Navigator.onLine === false | `<idp-offline-banner>` (global Shell) |
| Skeleton | `loading: true` passed to DataTable | Skeleton rows (no spinner) |

### Offline State

```typescript
// src/app/layout/offline-banner.component.ts
// Globally rendered in LayoutComponent above the router-outlet.
// Subscribes to window 'online'/'offline' events as an Observable.
// Shows an amber banner: "You are offline. Some features may be unavailable."
// Hides automatically when connection is restored.
```

The `ConnectionManagerService` also sets `status = 'disconnected'` when the backend SSE
stream is lost — this is surfaced in the TopNav status dot, separate from the offline banner.

### Skeleton Loading

All `DataTable` instances receive `[loading]="store.list().loading"`. When `loading=true`,
the DataTable renders 5 skeleton rows of the same height as real rows, using the `.skeleton`
class shimmer animation. This prevents layout shift when data loads.

`MetricCard` renders a skeleton placeholder of fixed dimensions when `[loading]="true"`,
preventing the 22-widget dashboard from reflowing on load.

### Confirmation Dialogs — Standard Usage

All destructive actions (delete, deactivate, destroy, rollback, revoke) MUST use
`ConfirmDialog` with `[danger]="true"`. The confirm button label mirrors the action:
"Delete Organization", "Destroy Infrastructure", "Revoke Token". Generic "Confirm" labels
are not permitted for destructive actions.

### Toast Notifications — Standard Usage

| Trigger | Type | Duration |
|---------|------|----------|
| Successful create/update | SUCCESS | 4 seconds |
| Successful delete/deactivate | SUCCESS | 4 seconds |
| Non-critical API error | WARNING | 6 seconds |
| Critical API error (500, network) | ERROR | 8 seconds + manual dismiss |
| Background operation started | INFO | 3 seconds |

Toasts stack vertically at the bottom-right corner. Maximum 3 visible simultaneously;
older toasts are dismissed before showing a fourth.

---

## Performance Architecture

### Lazy Loading Strategy

```typescript
// All 23 routes use loadChildren or loadComponent — zero eager feature imports.
// Initial bundle contains ONLY:
//   - AppModule bootstrap (~2 KB)
//   - LayoutComponent + TopNav + Sidebar (~15 KB)
//   - AuthGuard, RbacGuard (~3 KB)
//   - Core services (AuthService, FeatureFlagService, ThemeService) (~8 KB)
//   - Angular runtime + Material CDK (~120 KB gzipped)
// Total initial payload target: < 200 KB gzipped
```

### Route Preloading

`SelectivePreloadingStrategy` is used. The `data.preload = true` flag marks routes for
background preloading after the initial boot:

```typescript
// Preloaded routes (loaded immediately after app bootstrap):
//   /dashboard       — most-visited route; preloaded for zero-latency entry
//   /service-catalog — second most-visited; preloaded

// All other routes are deferred until first navigation.
```

### Code & Bundle Splitting

Angular's esbuild-based builder (default in Angular 17+) produces:
- `main.js` — application shell (< 200 KB gzipped)
- `chunk-{hash}.js` — one chunk per lazy route (dashboard, deployments, kubernetes, etc.)
- `common.js` — shared vendor code used by multiple lazy chunks
- `styles.css` — global design tokens + Material theme (< 30 KB gzipped)

**Bundle splitting rules:**
- `chart.js` is loaded only in the `monitoring` and `dashboard` feature bundles (not in
  the initial chunk).
- `highlight.js` is loaded only in the `log-viewer` shared component (dynamically imported
  on first LogViewer render).
- `fast-check` is excluded from production builds (devDependency only).

### Change Detection Strategy

```typescript
// All feature page components and shared components use OnPush:
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
```

Angular Signals bypass Zone.js entirely for synchronous state updates. All store-driven
updates are Signal-based — no `markForCheck()` or `detectChanges()` calls in feature code.

### Caching Strategy

| Cache Layer | Mechanism | TTL |
|------------|-----------|-----|
| Static assets (JS, CSS, fonts) | Nginx `expires 1y` + `Cache-Control: immutable` | 1 year |
| API responses (list endpoints) | In-memory store Signal; reloaded on navigation | Until route destroy |
| Dashboard widget data | Store Signal; auto-refreshed per widget interval | Per widget schedule |
| User preferences (theme, sidebar) | `localStorage` | Until explicit change |
| Auth tokens (access) | In-memory Signal | Session |
| Auth tokens (refresh) | `sessionStorage` or HttpOnly cookie | Session or cookie expiry |

No `HttpClient` response caching (`TransferState`, `withCaching`) is used — all caching
is explicit through Signal stores.

### Performance Budget

Enforced in `angular.json` build configuration:

```json
{
  "budgets": [
    {
      "type": "initial",
      "maximumWarning": "250kb",
      "maximumError": "350kb"
    },
    {
      "type": "anyComponentStyle",
      "maximumWarning": "4kb",
      "maximumError": "8kb"
    },
    {
      "type": "anyScript",
      "maximumWarning": "100kb",
      "maximumError": "150kb"
    }
  ]
}
```

**Lighthouse CI thresholds** enforced on every PR (measured on Dashboard page, production
build, simulated Fast 4G):

| Metric | Target |
|--------|--------|
| Performance | ≥ 80 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| FCP (First Contentful Paint) | < 1.5s |
| LCP (Largest Contentful Paint) | < 2.5s |
| TTI (Time to Interactive) | < 3.0s |
| CLS (Cumulative Layout Shift) | < 0.1 |


---

## Backend for Frontend (BFF) Extension Points

### Overview

The current architecture communicates directly with the Spring Boot 3 backend. The design
preserves clean extension points so that a future BFF layer can be introduced between the
Angular frontend and the backend services without requiring any changes to feature modules,
components, or stores.

### Extension Point Design

```
Current (Direct):
  Angular Frontend → ApiGatewayService → Spring Boot 3

Future (BFF):
  Angular Frontend → ApiGatewayService → BFF (Node.js/Go) → Spring Boot 3
                                                           → GitHub API
                                                           → Azure ARM API
                                                           → Kubernetes API
                                                           → Prometheus API
```

The only change required to adopt a BFF is updating `environment.apiBaseUrl` to point to
the BFF endpoint. The `ApiGatewayService` is already the single abstraction — no feature
module, store, or component references a backend URL directly.

### BFF Contract Requirements

When a BFF is introduced, it must maintain the following contracts already consumed by the
frontend:

1. **Authentication**: preserve `/auth/login`, `/auth/refresh`, `/auth/logout` endpoint
   signatures. JWT token format and claims must remain identical.

2. **Pagination envelope**: all list endpoints return `{ content: T[], totalElements: number,
   page: number, size: number }` — the `DataTable` component depends on this shape.

3. **Error envelope**: all error responses return `{ status: number, message: string,
   timestamp: string }` — the `ErrorHandlerService` parses this shape.

4. **SSE protocol**: all streaming endpoints use `Content-Type: text/event-stream` with
   `data:` prefixed JSON payloads.

### BFF-Ready Service Boundaries

Each feature service already isolates its API calls behind a typed method signature.
When the BFF introduces aggregated endpoints (e.g., a single `/dashboard/overview` that
combines data from 5 backend services), only the feature service method implementation
changes — the store, component, and mock service are unaffected.

```typescript
// Example: DashboardService evolves from multiple calls to one BFF call
// Before (direct): 22 separate API calls to 5 different backend services
// After (BFF): 1 aggregated call to /bff/dashboard that the BFF assembles

// The store and component see no difference — they consume ResourceState Signals.
```

---

## Micro-Frontend Readiness

### Current Architecture Compatibility

The IDP Frontend is a single Angular application and will remain so for the foreseeable
future. However, the architecture is **Module Federation compatible** from day one, requiring
zero refactoring to adopt Webpack Module Federation (or the newer `@angular/build:application`
Native Federation) if needed.

### Compatibility Principles Already Applied

1. **Feature-based folder isolation** — each feature module is a self-contained directory
   with no cross-imports to other feature directories. This maps directly to a Module
   Federation `remote` with zero reorganization.

2. **Zero shared mutable state between features** — features communicate only through
   `Core_Module` services (Auth, Notifications, Theme). There are no direct Signal
   dependencies between feature stores.

3. **Lazy routes via `loadChildren`** — the routing pattern is already the Module
   Federation pattern. Converting a lazy route to a remote entry point changes only the
   `loadChildren` URL, not the route structure.

4. **No NgModule dependencies** — all components are `standalone: true`. Module Federation
   requires no `NgModule` sharing negotiation between shell and remotes.

5. **Shared library isolation** — `shared/` and `core/` directories map cleanly to the
   Module Federation `shared` configuration. Angular, Angular Material, and RxJS are the
   only shared singletons required.

### Migration Path (if ever needed)

```
Current (Monolith):
  LayoutComponent → loadChildren('./features/kubernetes/...')

Future (Module Federation):
  LayoutComponent → loadRemoteModule({ remoteEntry: 'http://k8s-mfe.internal', ... })

Required changes:
  1. Add webpack.config.js with ModuleFederationPlugin configuration
  2. Update loadChildren URL for the target remote
  3. No changes to components, stores, services, or routing data
```

The `eslint-plugin-boundaries` rules that enforce no cross-feature imports are the primary
guard ensuring Module Federation compatibility is maintained as the codebase grows.


---

## Updated Module Inventory

The following table supersedes the earlier Module Inventory. Four new modules are added:
GitOps, Roles, Permissions, and Audit Logs as dedicated route-level modules. The Roles and
Permissions routes are promoted from sub-sections of the RBAC admin page to dedicated
feature routes, matching the navigation structure.

| # | Module Dir | Route Prefix | Store Name | Mock Service | Required Permissions |
|---|-----------|--------------|------------|--------------|----------------------|
| 1 | `dashboard` | `/dashboard` | `DashboardStore` | `DashboardMockService` | authenticated |
| 2 | `service-catalog` | `/service-catalog` | `ServiceCatalogStore` | `ServiceCatalogMockService` | provision-requests:read |
| 3 | `provision-requests` | `/provision-requests` | `ProvisionRequestStore` | `ProvisionRequestMockService` | provision-requests:read |
| 4 | `deployments` | `/deployments` | `DeploymentStore` | `DeploymentMockService` | deployments:read |
| 5 | `terraform` | `/terraform` | `TerraformStore` | `TerraformMockService` | terraform:read |
| 6 | `cicd` | `/cicd` | `CicdStore` | `CicdMockService` | cicd:read |
| 7 | `gitops` | `/gitops` | `GitOpsStore` | `GitOpsMockService` | gitops:read |
| 8 | `infrastructure` | `/infrastructure` | `InfrastructureStore` | `InfrastructureMockService` | cloud:read |
| 9 | `containers` | `/containers` | `ContainerStore` | `ContainerMockService` | containers:read |
| 10 | `kubernetes` | `/kubernetes` | `KubernetesStore` | `KubernetesMockService` | kubernetes:read |
| 11 | `cloud-resources` | `/cloud-resources` | `CloudResourceStore` | `CloudResourceMockService` | cloud:read |
| 12 | `monitoring` | `/monitoring` | `MonitoringStore` | `MonitoringMockService` | monitoring:read |
| 13 | `incidents` | `/incidents` | `IncidentStore` | `IncidentMockService` | incidents:read |
| 14 | `notifications` | `/notifications` | `NotificationStore` | `NotificationMockService` | authenticated |
| 15 | `recommendations` | `/recommendations` | `RecommendationStore` | `RecommendationMockService` | recommendations:read |
| 16 | `organizations` | `/organizations` | `OrganizationStore` | `OrganizationMockService` | organizations:read |
| 17 | `teams` | `/teams` | `TeamStore` | `TeamMockService` | teams:read |
| 18 | `users` | `/users` | `UserStore` | `UserMockService` | users:read |
| 19 | `roles` | `/roles` | `RoleStore` | `RoleMockService` | roles:read |
| 20 | `permissions` | `/permissions` | `PermissionStore` | `PermissionMockService` | permissions:read |
| 21 | `audit-logs` | `/audit-logs` | `AuditLogStore` | `AuditLogMockService` | audit:read |
| 22 | `settings` | `/settings` | `SettingsStore` | `SettingsMockService` | authenticated |
| 23 | `ai-assistant` | `/ai-assistant` | `AiAssistantStore` | `AiAssistantMockService` | ai-assistant:read |

**Total: 23 feature modules, 23 lazy routes, 23 Signal stores, 23 Mock services.**

The `environment.featureFlags` object is extended with the four new keys:
`gitops`, `roles`, `permissions`, `audit-logs` — all initialized to `'MOCK'`.

---

## Definitive Platform Engineering Roadmap

This section supersedes the earlier "Evolution Roadmap" section and provides the definitive
reference for the complete platform engineering progression.

### Maturity Stages

```
Stage 1 — Spring Boot + Docker (Sprint 1 baseline)
  ✓ All 23 modules scaffolded with mock data
  ✓ Auth flow live (JWT + RBAC)
  ✓ Core modules LIVE: auth, users, organizations, teams, service-catalog,
    provision-requests, deployments (from Spring Boot REST APIs)
  ✓ Docker multi-stage image builds and runs
  ✓ docker-compose.yml orchestrates frontend + backend + PostgreSQL
  Infrastructure: Docker Compose on dev machine

Stage 2 — Docker Compose Production
  ✓ docker-compose.prod.yml with health checks, restart policies, resource limits
  ✓ environment.production.ts wired to backend container URL
  ✓ Nginx serves Angular + reverse proxies /api to backend container
  ✓ Additional modules LIVE: notifications, settings, audit-logs, roles, permissions
  Infrastructure: Single Linux VM with Docker Compose

Stage 3 — Kubernetes (on-prem or minikube)
  ✓ k8s/ manifests applied: Deployment, Service, ConfigMap, HPA, Ingress
  ✓ kubernetes module → LIVE (KubernetesStore consumes K8s API via backend proxy)
  ✓ containers module → LIVE
  ✓ HPA active based on CPU metrics
  Infrastructure: Kubernetes cluster (minikube, k3s, or on-prem)

Stage 4 — Azure AKS
  ✓ AKS cluster provisioned via Terraform (from the terraform module)
  ✓ terraform module → LIVE
  ✓ cloud-resources module → LIVE (Azure ARM API via backend)
  ✓ Azure Container Registry (ACR) integrated in CI/CD pipeline
  ✓ Azure Key Vault for secrets management
  Infrastructure: Azure AKS + ACR + Azure PostgreSQL

Stage 5 — GitHub Actions CI/CD
  ✓ .github/workflows/ci.yml: build, test, lint, push to ACR, deploy to AKS
  ✓ cicd module → LIVE (GitHub Actions API via backend)
  ✓ Lighthouse CI gate on PRs
  ✓ Bundle size budget checks in CI
  Infrastructure: GitHub Actions + ACR

Stage 6 — ArgoCD (GitOps)
  ✓ ArgoCD installed in AKS; Application CRD points to k8s/ directory
  ✓ gitops module → LIVE (ArgoCD API via backend)
  ✓ Drift detection, rollback, sync status visible in GitOps module
  ✓ Deployment module enhanced with ArgoCD sync status
  Infrastructure: ArgoCD in AKS

Stage 7 — Prometheus + Grafana + Loki (Observability)
  ✓ kube-prometheus-stack installed via Helm
  ✓ monitoring module → LIVE
  ✓ incidents module → LIVE
  ✓ recommendations module → LIVE
  ✓ RealtimeService SSE streams live metrics from Prometheus
  ✓ Grafana embed activated (environment.grafanaUrl set)
  ✓ Loki log streaming in LogExplorerPage
  Infrastructure: Prometheus, Grafana, Loki, Alertmanager in AKS

Stage 8 — AI-Powered Platform Engineering
  ✓ AI backend service integrated (Azure OpenAI / LangChain4j)
  ✓ ai-assistant module → LIVE (SSE streaming chat responses)
  ✓ recommendations module enhanced with AI-generated suggestions
  ✓ Inline AI panels on Incidents, Deployments, Terraform pages show live analysis
  ✓ Knowledge search powered by vector embeddings from platform documentation
  Infrastructure: Azure OpenAI Service + vector store
```

### Zero-Refactor Guarantee

At every stage transition, the Angular codebase requires only:
1. Change one or more `featureFlags` entries in `environment.ts` from `'MOCK'` to `'LIVE'`
2. Implement the live API calls in the feature service (the single switch point)
3. Update `environment.apiBaseUrl` if a new backend endpoint or BFF is introduced

No component, template, routing configuration, Signal store shape, SCSS file, or shared
component is ever modified during a stage transition.

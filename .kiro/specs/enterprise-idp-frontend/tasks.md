# Implementation Plan: Enterprise IDP Frontend

## Overview

Implement the Angular 20 Enterprise IDP Frontend as a progressive single-page application with all 19 Feature_Modules fully scaffolded from Sprint 1. The implementation follows the Data_Source_Strategy pattern (MOCK → LIVE via feature flags), Signal-based state management, standalone components, lazy-loaded routes, RBAC enforcement, and a comprehensive design token system. All modules render meaningful content from Sprint 1 using Mock_Adapters, with zero structural refactoring required when switching to live APIs.

---

## Tasks

- [ ] 1. Project Bootstrap, Folder Architecture & Build Infrastructure
  - Initialize Angular 20 project with standalone components, strict TypeScript, esbuild builder, and Jest test runner
  - Create the complete folder structure: `core/`, `shared/`, `features/` (×19 modules), `layout/`, `pages/`, `src/styles/`, `src/environments/`, `docker/`, `k8s/`
  - Each of the 19 feature module directories must contain: `components/`, `pages/`, `services/`, `models/`, `store/`, `mocks/`
  - Create `src/app/core/mock-adapters/` subdirectory for shared mock utilities
  - Install all third-party dependencies: `@angular/material ^20`, `@angular/cdk ^20`, `fast-check ^3.x`, `@testing-library/angular ^17.x`, `jest ^29.x`, `jest-preset-angular ^14.x`, `date-fns ^3.x`, `chart.js + ng2-charts`, `highlight.js ^11.x`, `stylelint ^16.x`, `eslint-plugin-boundaries ^5.x`, `rxjs ^7.x`
  - Configure `jest.config.ts` with `jest-preset-angular`, `setup-jest.ts`, and `tsconfig.spec.json`
  - Configure `tsconfig.json` with `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
  - Configure `eslint-plugin-boundaries` to enforce `core → nothing`, `shared → core`, `features → core + shared` dependency rules
  - Configure `stylelint` with `no-hardcoded-colors` custom rule
  - Create `docker/Dockerfile` (multi-stage: `node:22-alpine` builder → `nginx:1.27-alpine` runtime, final image < 150 MB)
  - Create `docker/nginx.conf` with HTML5 routing, gzip, cache headers, and security headers
  - Create all Kubernetes manifests under `k8s/`: `deployment.yaml`, `service.yaml`, `configmap.yaml`, `hpa.yaml`, `ingress.yaml`
  - _Requirements: 1.1–1.11, 30.6, 30.7, 30.10_


- [ ] 2. Design Token System & Global Styles
  - Create `src/styles/_tokens.scss` with all CSS custom properties: brand colors (`--color-primary`, `--color-secondary`, `--color-accent`, `--color-background`, `--color-sidebar`), semantic colors, neutral scale, surface hierarchy (`--color-surface-0` through `--color-surface-overlay`), P1–P4 severity colors, readiness level indicator colors, log colors, typography scale (font family, size scale, weight, line-height, letter-spacing), spacing (4px base), border radius, shadows, z-index scale
  - Create `src/styles/_tokens.scss` dark mode overrides via `[data-theme="dark"]` with structurally isomorphic token set (every light token has a dark override)
  - Create `src/styles/_breakpoints.scss` with `$breakpoint-tablet: 768px`, `$breakpoint-desktop: 1280px` and mixins: `mobile-only`, `tablet-up`, `tablet-only`, `desktop-up`
  - Create `src/styles/_typography.scss`, `_reset.scss`, `_animations.scss` (shimmer skeleton, pulse-ring, timing variables), `_utilities.scss`, `_grid.scss` (KPI grid, content grid, sidebar widths)
  - Create `src/styles/_material-theme.scss` binding Angular Material M3 palette to brand tokens (`--color-primary`, `--color-secondary`, `--color-accent`)
  - Create `src/styles/_icons.scss` with Material Symbols Rounded variable font face declaration
  - Create root `src/styles/styles.scss` importing all partials
  - _Requirements: 23.1–23.9, 24.1–24.2, 30.10_
  - [ ]* 2.1 Write property test for theme token completeness (Property 14)
    - **Property 14: Theme Token Completeness** — for every CSS custom property defined in light mode, an override must exist in dark mode
    - **Validates: Requirements 23.8**


- [~] 3. Core Models & Interfaces
  - Create `src/app/core/models/auth.models.ts`: `User`, `UserRole`, `AuthTokens` interfaces
  - Create `src/app/core/models/rbac.models.ts`: `Permission` union type, `ROLE_PERMISSIONS` matrix for all 5 roles (ADMIN, DEVELOPER, VIEWER, APPROVER, OPERATOR) with full permission sets
  - Create `src/app/core/models/resource-state.models.ts`: `ResourceState<T>`, `FeatureReadinessLevel`, `createInitialState<T>()`
  - Create `src/app/core/models/audit-log.models.ts`: `AuditLog` interface
  - Create `src/app/core/models/notification.models.ts`: `NotificationType`, `Notification` interfaces
  - _Requirements: 2.8, 3.1–3.11, 25.6, 27.1_

- [~] 4. Core Signal Stores
  - Create `src/app/core/stores/auth.store.ts`: `AuthStore` with `user: Signal<User | null>`, `isAuthenticated: computed`, `tokens: Signal<AuthTokens | null>` (in-memory only)
  - Create `src/app/core/stores/theme.store.ts`: `ThemeStore` with `current: Signal<'light' | 'dark'>`
  - Create `src/app/core/stores/notification-count.store.ts`: `NotificationCountStore` with `unreadCount: Signal<number>`
  - _Requirements: 25.5, 27.1, 27.4, 27.5_


- [ ] 5. Core Services — Auth, Permissions, Feature Flags
  - Create `src/app/core/services/auth.service.ts`: implement `login()`, `logout()`, `refreshToken()`, `isAuthenticated(): Signal<boolean>`, `currentUser(): Signal<User | null>`, `hasRole()`. Access token → in-memory AuthStore only; refresh token → HttpOnly cookie (remember-me) or sessionStorage (no remember-me). No JWT in URL, query params, or console.
  - Create `src/app/core/services/permission.service.ts`: implement `hasPermission(permission)`, `canActivate(required[])`, `hasRole()` — synchronous, pure, reads AuthStore Signal
  - Create `src/app/core/services/feature-flag.service.ts`: reads `environment.featureFlags` on `initialize()`, exposes `getReadinessLevel(feature): FeatureReadinessLevel` and `getAllFlags(): Signal<Record<string, FeatureReadinessLevel>>`
  - Create `src/environments/environment.ts` with `apiBaseUrl`, `grafanaUrl`, all 19 feature flags set to `'MOCK'`
  - Create `src/environments/environment.production.ts` with production values
  - _Requirements: 2.11, 3.1–3.11, 27.1, 27.8–27.10, 27.12, 30.11_
  - [ ]* 5.1 Write property test for PermissionService idempotence (Property 12)
    - **Property 12: Permission_Service Idempotence** — calling `hasPermission(permission)` multiple times with same role and permission must return identical result
    - **Validates: Requirements 27.12**
  - [ ]* 5.2 Write property test for RBAC Guard correctness (Property 4)
    - **Property 4: RBAC Guard — No False Positives or False Negatives** — guard decision must equal `PermissionService.canActivate(P)` for role R; never considers FeatureReadinessLevel
    - **Validates: Requirements 3.9, 28.2, 28.3**
  - [ ]* 5.3 Write property test for role-driven navigation containment (Property 5)
    - **Property 5: Role-Driven Navigation Containment** — nav items rendered for a role must be a subset of permitted items; monotone containment invariant
    - **Validates: Requirements 3.12, 4.10**


- [~] 6. Core Services — HTTP, Theme, Notifications, Error Handling
  - Create `src/app/core/interceptors/jwt.interceptor.ts`: attach Bearer token, proactive refresh when `expiresAt - now < 60s`, retry on 401, redirect on second 401, navigate to `/403` on 403 (no session clear)
  - Create `src/app/core/interceptors/rate-limit.interceptor.ts`: exponential backoff on 429 (3 retries: 1s → 2s → 4s)
  - Create `src/app/core/services/api-gateway.service.ts`: typed `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`, `downloadBlob()` — all components and stores use this, never `HttpClient` directly
  - Create `src/app/core/services/theme.service.ts`: `applyTheme()`, `toggleTheme()`, `currentTheme(): Signal`, `loadPersistedTheme()` using `localStorage` key `idp-theme-preference`; called in `APP_INITIALIZER`
  - Create `src/app/core/services/notification.service.ts`: `showToast()`, `getNotifications(): Signal<Notification[]>`, `getUnreadCount(): Signal<number>`, `markAsRead()`, `markAllAsRead()`
  - Create `src/app/core/services/error-handler.service.ts`: implements Angular `ErrorHandler`; logs with timestamp + stack; calls `showToast()` with ERROR type for 8s
  - Create `src/app/core/services/audit-log.service.ts`: `getAuditLogs(filters)`, `exportAuditLogsCsv(filters)`
  - Create `src/app/core/services/session-timeout.service.ts`: 30-min idle timeout, 2-min warning banner, calls `AuthService.logout()` on expiry
  - _Requirements: 2.7, 3.3–3.7, 27.2–27.7_

- [~] 7. Core Guards & Mock Data Service
  - Create `src/app/core/guards/auth.guard.ts`: redirects unauthenticated users to `/auth/login`, preserves original URL as redirect param
  - Create `src/app/core/guards/rbac.guard.ts` (`rbacGuard: CanActivateFn`): evaluates `PermissionService.canActivate(route.data.requiredPermissions)`; redirects to `/403` on failure; never blocks based on `FeatureReadinessLevel`
  - Create `src/app/core/mock-adapters/mock-data.service.ts`: shared generators `uuid()`, `randomFrom()`, `timestamp()`, `intBetween()`, `floatBetween()`, `userName()`, `orgName()`, `serviceName()`, `ipAddress()`, `version()`, `k8sNamespace()`, `azureRegion()`, `randomStatus()`
  - _Requirements: 3.9, 28.1–28.4, 27.11_


- [~] 8. Checkpoint — Core layer complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Shared Module — Components (Part 1: Data Display)
  - Create `src/app/shared/components/status-badge/` with `StatusBadgeComponent`: accepts `status: string`, `colorMap: Record<string, string>`, `size: 'sm' | 'md' | 'lg'`; uses `[data-testid="status-badge"]`; supports pulse animation for RUNNING state; no hardcoded colors — uses `colorMap` CSS classes
  - Create `src/app/shared/components/data-table/` with `DataTableComponent`: accepts `columns: ColumnDef<T>[]`, `data: T[]`, `pageSize: number`, `loading: boolean`, `totalCount: number`; emits `pageChange`, `sortChange`; renders skeleton rows when `loading=true`; client-side sort cycle: none → ASC → DESC → none; horizontal scroll on mobile/tablet
  - Create `src/app/shared/components/metric-card/` with `MetricCardComponent`: accepts `label`, `value`, `unit?`, `trend?: 'up' | 'down' | 'stable'`, `loading: boolean`, `error: string | null`; emits `retry`; renders skeleton when `loading=true`; renders `ErrorAlert` with retry when `error` set
  - Create `src/app/shared/components/timeline/` with `TimelineComponent`: accepts `events: TimelineEvent[]`, `order: 'asc' | 'desc'`; renders vertical connecting line; relative timestamps with absolute tooltip on hover
  - Create `src/app/shared/components/log-viewer/` with `LogViewerComponent`: accepts `lines: string[]`, `streaming: boolean`, `syntaxHighlight: boolean`; auto-scroll when `streaming=true`; "↓ Scroll to bottom" button when user scrolls up; keyword color coding (ERROR/WARN/INFO); log background uses `--color-log-bg` token
  - _Requirements: 26.1–26.12, 30.9_
  - [ ]* 9.1 Write property test for StatusBadge totality (Property 6)
    - **Property 6: StatusBadge Totality** — every valid status string produces a non-empty output with non-null CSS class from colorMap
    - **Validates: Requirements 8.10, 9.10, 14.11**
  - [ ]* 9.2 Write property test for LogViewer line ordering (Property 7)
    - **Property 7: LogViewer Preserves Line Ordering** — rendered lines must match input array order exactly; no insertions, deletions, or reordering
    - **Validates: Requirements 10.10**
  - [ ]* 9.3 Write property test for shared component render purity (Property 13)
    - **Property 13: Shared Component Render Purity** — rendering any shared component with identical inputs twice produces identical output
    - **Validates: Requirements 26.12**


- [ ] 10. Shared Module — Components (Part 2: Forms, Dialogs & Layout)
  - Create `src/app/shared/components/confirm-dialog/` with `ConfirmDialogComponent`: accepts `title`, `message`, `confirmLabel`, `danger: boolean`; emits `confirmed`, `dismissed`; focus trapped inside dialog via CDK; focus restored to trigger element on close; accessible ARIA roles
  - Create `src/app/shared/components/search-bar/` with `SearchBarComponent`: accepts `placeholder`, `debounceMs: number (default 300)`, `initialValue`; emits `search` after debounce
  - Create `src/app/shared/components/filter-panel/` with `FilterPanelComponent`: accepts `config: FilterFieldDef[]`, `initialValues`; emits `filterChange`; supports `dropdown`, `checkbox`, `date-range`, `multi-select` types
  - Create `src/app/shared/components/page-header/` with `PageHeaderComponent`: accepts `title`, `breadcrumbs: BreadcrumbItem[]`; projects `<ng-content select="[actions]">`; uses router link for each breadcrumb
  - Create `src/app/shared/components/empty-state/` with `EmptyStateComponent`: accepts `icon`, `primaryMessage`, `secondaryMessage?`; renders icon at minimum 48×48px
  - Create `src/app/shared/components/loading-spinner/` with `LoadingSpinnerComponent`: accepts `size: 'sm' | 'md' | 'lg'`, `label?`; accessible ARIA label
  - Create `src/app/shared/components/error-alert/` with `ErrorAlertComponent`: accepts `message`, `showRetry: boolean`; emits `retry`
  - Create `src/app/shared/utils/color-maps.ts`: status-to-CSS-class maps for deployments, terraform jobs, K8s resources, incidents (P1-P4), containers, alerts, recommendations, provision requests
  - Create `src/app/shared/directives/permission.directive.ts` (`*idpHasPermission`): structural directive that removes host element from DOM if permission not granted
  - Create `src/app/shared/directives/click-outside.directive.ts`
  - Create `src/app/shared/pipes/relative-time.pipe.ts`, `bytes.pipe.ts`, `truncate.pipe.ts`
  - Create `src/app/shared/utils/validators.ts`
  - _Requirements: 26.1–26.12, 7.4, 19.5_
  - [ ]* 10.1 Write property test for search filter idempotence (Property 8)
    - **Property 8: Search Filter Idempotence on Empty Input** — applying filter then clearing restores full unfiltered list; clearing an already-clear filter is idempotent
    - **Validates: Requirements 6.10**
  - [ ]* 10.2 Write property test for form validation blocks submission (Property 9)
    - **Property 9: Form Validation — Missing Required Fields Block Submission** — any form with missing required fields must show inline errors and not dispatch any API call
    - **Validates: Requirements 7.4, 19.5**


- [ ] 11. Layout Shell — TopNav, Sidebar & Root App
  - Create `src/app/app.component.ts` (root host, standalone)
  - Create `src/app/app.module.ts` (bootstrap shell only, no feature module imports)
  - Create `src/app/layout/layout.component.ts`: renders `TopNavComponent`, `SidebarComponent`, `<router-outlet>`, `FloatingAiWidgetComponent`
  - Create `src/app/layout/top-nav/top-nav.component.ts` with: platform logo, `BreadcrumbComponent`, notification bell with unread-count badge (wires to `NotificationCountStore`), `ThemeToggleComponent`, `UserProfileMenuComponent`
  - Create `src/app/layout/top-nav/breadcrumb.component.ts`: updates on every `NavigationEnd` event; reflects full hierarchical path of active route
  - Create `src/app/layout/top-nav/notification-bell.component.ts`: opens `Notification_Center` overlay on click without navigating away
  - Create `src/app/layout/top-nav/theme-toggle.component.ts`: calls `ThemeService.toggleTheme()`
  - Create `src/app/layout/top-nav/user-profile-menu.component.ts`: dropdown with display name, role, profile link, logout action
  - Create `src/app/layout/sidebar/sidebar.component.ts`: 7 collapsible nav groups; group collapse state persisted in `localStorage`; active entry highlighted; `*idpHasPermission` directive hides items; readiness dot visible only to ADMIN/DEVELOPER; keyboard navigation with Tab/arrow keys; ARIA labels (WCAG 2.1 AA); sidebar state (expanded/collapsed) persisted in `localStorage`
  - Create `src/app/layout/sidebar/nav-item.component.ts`: accepts `NavItem` interface; renders icon + label; optional badge `Signal<number>`
  - Implement responsive sidebar behavior: ≥1280px → expanded; 768–1279px → icon-only (64px); <768px → hidden, hamburger in TopNav, overlay drawer on tap
  - _Requirements: 4.1–4.13, 24.3–24.5, 30.2_
  - [ ]* 11.1 Write property test for breadcrumb route fidelity (Property 18)
    - **Property 18: Breadcrumb Route Fidelity** — for any valid route, breadcrumb must show full hierarchical path with all ancestor segments in correct left-to-right order
    - **Validates: Requirements 4.7**


- [~] 12. Root Router Configuration & Auth/Error Pages
  - Create `src/app/app.routes.ts`: register ALL 19 lazy feature routes + GitOps, Roles, Permissions, Audit Logs as top-level lazy routes; all use `loadChildren` or `loadComponent`; all authenticated routes wrapped with `canActivate: [AuthGuard]` and `canActivate: [RbacGuard]`; apply `SelectivePreloadingStrategy` for `dashboard` and `service-catalog`; `data.requiredPermissions` annotation on each route; child routes for modules with detail pages
  - Include: `/auth/login` (public), `/403`, `/404`, wildcard `**` → `/404`; logged-in users hitting `/auth/login` → redirect to `/dashboard`
  - Configure route-level `title` for every route: `{Page Name} — IDP Platform`
  - Create `src/app/pages/auth/login.page.ts`: login form with email, password, remember-me checkbox; inline error on invalid credentials; calls `AuthService.login()`; navigates to Dashboard or `originalUrl` on success; no JWT in URL
  - Create `src/app/pages/error/403.page.ts`: 403 Forbidden page with link back to Dashboard
  - Create `src/app/pages/error/404.page.ts`: 404 Not Found page
  - _Requirements: 2.2, 3.1–3.4, 28.1–28.12_

- [~] 13. Checkpoint — Shell & routing complete
  - Ensure all tests pass, ask the user if questions arise.


- [ ] 14. ResourceState Pattern & Base Store Implementation
  - Implement `createInitialState<T>(): ResourceState<T>` utility and document the state machine: `IDLE → LOADING → SUCCESS / ERROR → LOADING (retry)`
  - Create a base store pattern document / abstract helper that all 19 stores follow: `load()` sets `{loading: true, error: null, data: null}` → `next: {loading: false, error: null, data}` → `error: {loading: false, error: msg, data: null}`
  - Verify invariant: `loading === true` implies `error === null` (atomic transition)
  - _Requirements: 2.8, 25.6, 25.8_
  - [ ]* 14.1 Write property test for ResourceState loading invariant (Property 1)
    - **Property 1: ResourceState Loading Invariant** — `loading === true` implies `error === null`; three fields never simultaneously inconsistent
    - **Validates: Requirements 2.8, 25.6, 25.8, 25.11**
  - [ ]* 14.2 Write property test for ResourceState retry resets error (Property 2)
    - **Property 2: ResourceState Retry Resets Error** — invoking retry from error state must produce `{loading: true, error: null}` before new response arrives
    - **Validates: Requirements 25.12**

- [ ] 15. Data_Source_Strategy Pattern Implementation
  - Implement the `isLive = computed(() => flagService.getReadinessLevel(feature) === 'LIVE')` pattern in a base feature service scaffold used by all 19 feature services
  - Implement `getXxx(): Observable<T>` delegate: `this.isLive() ? this.api.get<T>(path) : of(this.mock.getXxx())`
  - Verify that changing `environment.featureFlags.{module}` from `'MOCK'` to `'LIVE'` requires zero component/template/route/store changes
  - _Requirements: 2.13, 11.11, 12.13, 13.10, 14.13, 16.12, 17.11, 22.11, 30.11_
  - [ ]* 15.1 Write property test for Data_Source_Strategy delegation invariant (Property 3)
    - **Property 3: Data_Source_Strategy Delegation Invariant** — for any module and any FeatureReadinessLevel, service delegates to correct data source; changing flag requires no component changes
    - **Validates: Requirements 2.13, 11.11, 12.13, 13.10, 14.13, 16.12, 17.11, 22.11, 30.11**


- [ ] 16. Dashboard Feature Module
  - Create `features/dashboard/models/dashboard.models.ts`: `KpiWidget`, `ActivityFeedEntry`, and all 22 widget data interfaces (PlatformAvailability, InfraHealth, StorageMetric, NetworkMetric, ContainerHealth, AzureResourceStats, CostOverview, IncidentSummary, RecommendationSummary)
  - Create `features/dashboard/mocks/dashboard.mock.service.ts`: generates realistic data for all 22 KPI widgets and last 20 activity feed entries using `MockDataService`
  - Create `features/dashboard/services/dashboard.service.ts`: Data_Source_Strategy pattern with 22 individual widget API methods
  - Create `features/dashboard/store/dashboard.store.ts` (`DashboardStore`): 22 independent `ResourceState<T>` Signals; `refreshAll()` dispatches all fetches in parallel with 500ms debounce; each widget fails independently without affecting others
  - Create `features/dashboard/components/kpi-widget.component.ts`: independent fetch, `LoadingSpinner` during load, `MetricCard` with trend indicator on success, `ErrorAlert` with retry on failure
  - Create `features/dashboard/components/activity-feed.component.ts`: last 20 events as `TimelineComponent`-style display; actor + action + target + relative timestamp
  - Create `features/dashboard/pages/dashboard.page.ts`: responsive CSS Grid (4-col desktop, 3-col tablet, 1-col mobile); `PageHeader` with "Refresh All" action; all 22 widgets load in parallel; target: full widget set loads within 3s on standard broadband
  - Create `features/dashboard/dashboard.routes.ts`: route for `/dashboard`
  - _Requirements: 5.1–5.10, 28.1_
  - [ ]* 16.1 Write property test for KPI widget count invariance (Property 11)
    - **Property 11: KPI Widget Count Invariance** — total rendered widget count must always equal 22 regardless of individual fetch outcomes (success or failure)
    - **Validates: Requirements 5.3, 5.10**


- [ ] 17. Service Catalog & Provision Requests Feature Modules
  - [~] 17.1 Implement Service Catalog module
    - Create `features/service-catalog/models/`: `Service` interface (name, category, description, healthStatus, tags, ownerTeam, provisioningParams)
    - Create `features/service-catalog/mocks/service-catalog.mock.service.ts` with `ServiceCatalogMockService`
    - Create `features/service-catalog/services/service-catalog.service.ts` (Data_Source_Strategy)
    - Create `features/service-catalog/store/service-catalog.store.ts` (`ServiceCatalogStore`): filter state with `applyFilter(term)` and `filtered()` computed signal
    - Create `features/service-catalog/pages/`: list page with `DataTable`, `SearchBar` (300ms debounce), `FilterPanel` (Category + Health Status), `StatusBadge` per service; loading skeletons; `EmptyState` on zero results; provision action hidden when lacking `provision-requests:create` permission
    - Create service detail page with full metadata
    - Create `features/service-catalog/service-catalog.routes.ts`
    - _Requirements: 6.1–6.10, 2.2_
  - [~] 17.2 Implement Provision Requests module
    - Create `features/provision-requests/models/`: `ProvisionRequest`, `ProvisionRequestStatus` enum (`PENDING | APPROVED | REJECTED | PROVISIONED`)
    - Create `features/provision-requests/mocks/provision-request.mock.service.ts`
    - Create `features/provision-requests/services/provision-request.service.ts` (Data_Source_Strategy)
    - Create `features/provision-requests/store/provision-request.store.ts` (`ProvisionRequestStore`)
    - Create list page with `DataTable`, `FilterPanel` (Status + date range); enforce lifecycle order `PENDING → APPROVED|REJECTED → PROVISIONED`; Approve/Reject buttons only for `provision-requests:approve` role; each guarded by `ConfirmDialog`
    - Create detail page with all parameters, status history, `TimelineComponent` for audit trail
    - Create creation form with inline validation; success `Toast`; status PENDING in list on create
    - Create `features/provision-requests/provision-requests.routes.ts` with child route `/:id`
    - _Requirements: 7.1–7.10_
  - [ ]* 17.3 Write property test for Provision Request lifecycle ordering (Property 15)
    - **Property 15: Provision Request Lifecycle Ordering** — action buttons match valid next states only; no action button violates lifecycle order
    - **Validates: Requirements 7.8**


- [ ] 18. Deployments Feature Module
  - Create `features/deployments/models/`: `Deployment` interface (`id`, `serviceName`, `environment`, `version`, `status`, `triggeredBy`, `startedAt`, `completedAt`), `DeploymentStatus` enum (`IDLE | RUNNING | SUCCESS | FAILED`)
  - Create `features/deployments/mocks/deployment.mock.service.ts` with `DeploymentMockService` (20 entries, realistic log lines)
  - Create `features/deployments/services/deployment.service.ts` (Data_Source_Strategy)
  - Create `features/deployments/store/deployment.store.ts` (`DeploymentStore`): `deployments`, `selected`, `runningCount computed`
  - Create list page: `DataTable` (columns: ID, Service, Environment, Version, Status, Triggered By, Started At, Actions); `FilterPanel` (Status, Environment, date range); `StatusBadge` per deployment; Trigger action for `deployments:trigger` role guarded by `ConfirmDialog`; poll RUNNING deployments every ≤5s via RxJS `interval`; update `StatusBadge` without page reload
  - Create detail page: metadata, `LogViewer` (streaming logs while RUNNING, auto-scroll, pause on scroll up), deployment history `TimelineComponent` (most recent → oldest), failure reason in `StatusBadge` tooltip and top of `LogViewer`, `AiSuggestion` panel (type DEPLOYMENT, mock data from `AiAssistantMockService`)
  - Create `features/deployments/deployments.routes.ts` with child route `/:id`
  - _Requirements: 8.1–8.10, 22.9_
  - [ ]* 18.1 Write unit tests for DeploymentStore state transitions
    - Test IDLE → RUNNING → SUCCESS/FAILED transitions and RUNNING polling behavior
    - _Requirements: 8.6, 8.9_


- [~] 19. Terraform Feature Module
  - Create `features/terraform/models/`: `TerraformJob`, `TerraformWorkspace`, `TerraformPlan`, `TerraformState`, `TerraformVariable`, `TerraformOutput` interfaces; `TerraformStatus` enum (`PENDING | RUNNING | SUCCESS | FAILED`)
  - Create `features/terraform/mocks/terraform.mock.service.ts` with `TerraformMockService`
  - Create `features/terraform/services/terraform.service.ts` (Data_Source_Strategy)
  - Create `features/terraform/store/terraform.store.ts` (`TerraformStore`): `workspaces`, `currentPlan`, `executionLog: Signal<string[]>`, `isStreaming: Signal<boolean>`, `stateFile`, `variables`, `outputs`, `history`
  - Create list page: `DataTable` (columns: Job ID, Workspace, Operation Type, Status, Triggered By, Started At, Completed At, Actions); `FilterPanel` (Operation Type, Status)
  - Create workspace detail pages: Plan page with `LogViewer` color-coding `+` (green) / `-` (red) / `~` (amber); Apply/Destroy pages with prominent `ConfirmDialog` warning "will modify or destroy live infrastructure"; state summary page; variables page; outputs page; history `TimelineComponent`; logs stream every ≤3s while RUNNING
  - Apply/Destroy/Plan actions guarded by `terraform:execute` permission + `ConfirmDialog`
  - Create `features/terraform/terraform.routes.ts` with all child routes
  - _Requirements: 9.1–9.10_

- [~] 20. CI/CD Feature Module
  - Create `features/cicd/models/`: `Pipeline`, `PipelineRun`, `BuildArtifact` interfaces; `PipelineRunStatus` enum (`SUCCESS | FAILURE | RUNNING | CANCELLED | QUEUED`)
  - Create `features/cicd/mocks/cicd.mock.service.ts` with `CicdMockService`
  - Create `features/cicd/services/cicd.service.ts` (Data_Source_Strategy)
  - Create `features/cicd/store/cicd.store.ts` (`CicdStore`): `pipelines`, `running`, `failed`, `successful`, `selectedRun`, `runLog: Signal<string[]>`, `artifacts`
  - Create list page: `DataTable` (Pipeline Name, Repository, Status, Last Run, Duration, Actions); `FilterPanel` (Status, Repository); `StatusBadge` for each pipeline
  - Create pipeline detail page: last successful build highlighted; failed builds list (last 30 days) with timestamp, commit, log link; `LogViewer` (collapsed for completed, expanded for running); deployment history section linking to Deployment_Console records; poll RUNNING at ≤5s
  - Create run detail page and run logs page
  - Create artifacts page
  - Create `features/cicd/cicd.routes.ts` with all child routes
  - _Requirements: 10.1–10.10_


- [~] 21. Infrastructure Feature Module
  - Create `features/infrastructure/models/`: generic infrastructure resource interfaces
  - Create `features/infrastructure/mocks/infrastructure.mock.service.ts` with `InfrastructureMockService`
  - Create `features/infrastructure/services/infrastructure.service.ts` (Data_Source_Strategy)
  - Create `features/infrastructure/store/infrastructure.store.ts` (`InfrastructureStore`)
  - Create infrastructure overview page with `MetricCard` components for key metrics, `StatusBadge` for resource health
  - Create `features/infrastructure/infrastructure.routes.ts`
  - _Requirements: 2.4, 25.3_

- [~] 22. Containers Feature Module
  - Create `features/containers/models/`: `ContainerImage` (`name`, `tag`, `size`, `pushedAt`, `digest`), `Container` (`id`, `name`, `image`, `status`, `cpuUsage`, `memoryUsage`, `createdAt`), `ContainerLog` (`containerId`, `timestamp`, `line`)
  - Create `features/containers/mocks/container.mock.service.ts` with `ContainerMockService` (realistic container names, image refs, status values, CPU %, memory figures)
  - Create `features/containers/services/container.service.ts` (Data_Source_Strategy)
  - Create `features/containers/store/container.store.ts` (`ContainerStore`): Signal-based state for `images`, `containers`, `logs`; initialized MOCK
  - Create Docker images list page: `DataTable` (Image Name, Tag, Size, Pushed At, Digest)
  - Create running containers list page: `DataTable` (Container Name, Image, Status, CPU, Memory, Actions); `StatusBadge` for `RUNNING | STOPPED | EXITED | RESTARTING`; Start/Stop actions for `containers:start|stop` permission, each guarded by `ConfirmDialog`; CPU/memory `MetricCard` per container updated every ≤10s
  - Create container detail page with `LogViewer` (auto-scroll, pause on scroll up)
  - Create `features/containers/containers.routes.ts` with child route `/:id`
  - _Requirements: 11.1–11.11_


- [~] 23. Kubernetes Feature Module
  - Create `features/kubernetes/models/`: `ClusterOverview`, `Node`, `Pod`, `KubernetesDeployment`, `KubernetesService`, `Ingress`, `Namespace`, `ConfigMap`, `Secret` (values masked as `••••••••`), `PersistentVolume` interfaces
  - Create `features/kubernetes/mocks/kubernetes.mock.service.ts` with `KubernetesMockService`
  - Create `features/kubernetes/services/kubernetes.service.ts` (Data_Source_Strategy)
  - Create `features/kubernetes/store/kubernetes.store.ts` (`KubernetesStore`): separate `ResourceState<T>` Signal per resource type; cluster metrics refresh every ≤30s while page active
  - Create cluster overview panel: `MetricCard` for health status, node count, pod count, cluster version; `StatusBadge` for `HEALTHY | DEGRADED | CRITICAL`
  - Create Namespace selector that simultaneously filters all resource list tabs
  - Create tabbed list views: Nodes (Name, Status, Roles, CPU, Memory), Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, PersistentVolumes — each using `DataTable`
  - Secret values always masked in all views (never raw value in DOM)
  - Create `features/kubernetes/kubernetes.routes.ts` with child routes: `/pods/:namespace`, `/deployments/:namespace`, `/nodes/:name`
  - _Requirements: 12.1–12.13_

- [~] 24. Cloud Resources Feature Module
  - Create `features/cloud-resources/models/`: `ResourceGroup`, `VirtualNetwork`, `StorageAccount`, `AksCluster`, `KeyVaultEntry`, `PublicIp`, `CostOverview` interfaces
  - Create `features/cloud-resources/mocks/cloud-resource.mock.service.ts` with `CloudResourceMockService` (Azure resource groups, locations, AKS clusters, cost figures)
  - Create `features/cloud-resources/services/cloud-resource.service.ts` (Data_Source_Strategy)
  - Create `features/cloud-resources/store/cloud-resource.store.ts` (`CloudResourceStore`)
  - Create Resource Groups list page: `DataTable` (Name, Location, Subscription, Tag Count, Actions)
  - Create provider selector in `PageHeader` driven by `environment.ts` config (not hardcoded)
  - Create Cost Overview `MetricCard` with total billing cost + currency
  - Create separate list views for Virtual Networks, Storage Accounts, AKS Clusters (with `StatusBadge`), Key Vault entries, Public IPs
  - Create `features/cloud-resources/cloud-resources.routes.ts`
  - _Requirements: 13.1–13.10_


- [~] 25. Monitoring Feature Module
  - Create `features/monitoring/models/`: `MetricSeries`, `AlertRule`, `ActiveAlert`, `InfrastructureEvent` interfaces
  - Create `features/monitoring/mocks/monitoring.mock.service.ts` with `MonitoringMockService` (time-series data, alert rules, simulated log entries)
  - Create `features/monitoring/services/monitoring.service.ts` (Data_Source_Strategy)
  - Create `features/monitoring/store/monitoring.store.ts` (`MonitoringStore`): `metrics`, `alertRules`, `activeAlerts`, `infrastructureEvents`; CPU/memory/network metrics refresh every ≤30s
  - Create monitoring overview page with Prometheus metrics as time-series `MetricCard` charts (using `chart.js` + `ng2-charts`)
  - Implement Grafana iframe embed: loads `environment.grafanaUrl` when configured; renders "Grafana not configured" `EmptyState` when URL is empty
  - Implement Loki log stream in `LogViewer` (real-time tail mode, manual pause)
  - Create Alert Rules `DataTable` (Rule Name, Expression, Severity, State, Last Evaluated)
  - Create Active Alerts panel: `StatusBadge` per alert severity (`CRITICAL → red`, `WARNING → amber`, `INFO → blue`); ordered by severity highest to lowest
  - Create Infrastructure Monitoring `TimelineComponent`
  - Create `features/monitoring/monitoring.routes.ts` with child route `/alerts/:id`
  - _Requirements: 14.1–14.13_

- [ ] 26. Notifications Feature Module
  - Create `features/notifications/models/`: uses core `Notification` and `NotificationType` models
  - Create `features/notifications/mocks/notification.mock.service.ts`
  - Create `features/notifications/services/notification.service.ts` (Data_Source_Strategy; delegates to core `NotificationService` for global state)
  - Create `features/notifications/store/notification.store.ts` (`NotificationStore`)
  - Implement `NotificationBellComponent` overlay panel (opens without navigating; `ConfirmDialog`-less overlay using CDK)
  - Create paginated notification list: `INFO` (blue), `WARNING` (amber), `ERROR` (red), `SUCCESS` (green) indicators; unread items visually distinguished; relative timestamps
  - Implement mark-as-read on click; "Mark all as read" calls backend + sets count to 0
  - Implement polling every ≤30s while session active; new notifications prepend to open panel
  - Implement ERROR-type Toast (8s) alongside badge count update
  - Create `features/notifications/notifications.routes.ts`
  - _Requirements: 15.1–15.10_
  - [ ]* 26.1 Write property test for notification unread count invariant (Property 10)
    - **Property 10: Notification Unread Count Invariant** — unread count equals total count minus read count after every mark-as-read operation; never negative, never exceeds total
    - **Validates: Requirements 15.10**


- [~] 27. Incidents Feature Module
  - Create `features/incidents/models/`: `Incident` (`id`, `title`, `description`, `severity`, `status`, `assignee`, `createdAt`, `updatedAt`, `resolvedAt`), `IncidentEvent`, `IncidentAssignment` interfaces; `IncidentStatus` enum (`OPEN | ASSIGNED | INVESTIGATING | RESOLVED`); `IncidentSeverity` type (`P1 | P2 | P3 | P4`)
  - Create `features/incidents/mocks/incident.mock.service.ts` with `IncidentMockService` (P1–P4 examples, varied statuses, timeline events)
  - Create `features/incidents/services/incident.service.ts` (Data_Source_Strategy)
  - Create `features/incidents/store/incident.store.ts` (`IncidentStore`)
  - Create Active Incidents list: `DataTable` (ID, Title, Severity, Status, Assignee, Created At, Actions); `StatusBadge` with P1–P4 severity mapping (`P1 → red`, `P2 → orange`, `P3 → amber`, `P4 → blue`); elapsed time counter for non-RESOLVED incidents
  - Enforce status lifecycle `OPEN → ASSIGNED → INVESTIGATING → RESOLVED` (hide invalid transition actions)
  - Assign action (`incidents:assign`) + Resolve action (`incidents:resolve`), each guarded by `ConfirmDialog`
  - Create incident detail page: incident timeline `TimelineComponent`; inline `AiSuggestion` panel (type INCIDENT_ANALYSIS, mock data)
  - Create `features/incidents/incidents.routes.ts` with child route `/:id`
  - _Requirements: 16.1–16.12, 22.8_

- [ ] 28. Recommendations Feature Module
  - Create `features/recommendations/models/`: `Recommendation` (`id`, `title`, `description`, `category`, `status`, `priority`, `estimatedSavings?`, `createdAt`, `updatedAt`); `RecommendationCategory` enum; `RecommendationStatus` enum (`NEW | ACKNOWLEDGED | APPLIED | DISMISSED`)
  - Create `features/recommendations/mocks/recommendation.mock.service.ts` with `RecommendationMockService`
  - Create `features/recommendations/services/recommendation.service.ts` (Data_Source_Strategy)
  - Create `features/recommendations/store/recommendation.store.ts` (`RecommendationStore`)
  - Create list page: `DataTable` (Title, Category, Priority, Status, Created At, Actions); `StatusBadge` (`NEW → blue`, `ACKNOWLEDGED → amber`, `APPLIED → green`, `DISMISSED → grey`); `FilterPanel` (Category + Status); Acknowledge/Apply/Dismiss actions for `recommendations:manage` permission, each guarded by `ConfirmDialog`
  - Enforce terminal `DISMISSED` state: no Apply/Acknowledge buttons in DISMISSED status
  - Create detail page: cost saving `MetricCard` for estimatedSavings
  - Create `features/recommendations/recommendations.routes.ts`
  - _Requirements: 17.1–17.11_
  - [ ]* 28.1 Write property test for DISMISSED recommendation terminal state (Property 16)
    - **Property 16: DISMISSED Recommendation Terminal State** — no Apply or Acknowledge action rendered for DISMISSED status in list or detail view
    - **Validates: Requirements 17.10**


- [~] 29. Checkpoint — Feature modules (groups 1–4) complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 30. Organizations, Teams & Users Feature Modules
  - [~] 30.1 Implement Organizations module
    - Create `features/organizations/models/`: `Organization` interface (name, description, teamCount, memberCount, createdAt)
    - Create `features/organizations/mocks/organization.mock.service.ts` with `OrganizationMockService`
    - Create `features/organizations/services/organization.service.ts` (Data_Source_Strategy)
    - Create `features/organizations/store/organization.store.ts` (`OrganizationStore`)
    - Create list page: `DataTable` (Org Name, Description, Team Count, Member Count, Created At, Actions); Create/Edit/Delete actions for `organizations:manage` permission; Delete guarded by `ConfirmDialog` warning about cascading team removal
    - Create organization detail page with breadcrumb trail; Create Team / Delete Team actions
    - Create `features/organizations/organizations.routes.ts`
    - _Requirements: 18.1–18.10_
  - [~] 30.2 Implement Teams module
    - Create `features/teams/models/`: `Team` interface; `TeamMember` interface
    - Create `features/teams/mocks/team.mock.service.ts`, `features/teams/services/team.service.ts`, `features/teams/store/team.store.ts` (`TeamStore`)
    - Create team detail page: members `DataTable` (Display Name, Email, Role, Actions); Add Member (searchable multi-select) + Remove Member controls; breadcrumb showing org → team hierarchy
    - Create `features/teams/teams.routes.ts`
    - _Requirements: 18.6–18.10_
  - [~] 30.3 Implement Users module
    - Create `features/users/models/`: `UserProfile`, `UserStatus` interfaces
    - Create `features/users/mocks/user.mock.service.ts`, `features/users/services/user.service.ts`, `features/users/store/user.store.ts` (`UserStore`)
    - Create list page: `DataTable` (Display Name, Email, Role, Status, Organization, Last Login, Actions); `SearchBar` (300ms debounce, filters by name or email); `FilterPanel` (Role + Status); Create/Edit/Deactivate for ADMIN role; Deactivate guarded by `ConfirmDialog`
    - Create user profile page: display name, email, role, org, team memberships, account created, last login, recent activity `TimelineComponent` (last 10 audit log entries); role assignment dropdown for ADMIN
    - Create `features/users/users.routes.ts`
    - _Requirements: 19.1–19.10_


- [~] 31. RBAC — Roles, Permissions & Audit Log Feature Modules
  - [~] 31.1 Implement Roles & Permissions module
    - Create `features/roles/models/`, `features/permissions/models/` interfaces for Role and Permission entities
    - Create mock services, services, and stores for Roles and Permissions modules (Data_Source_Strategy)
    - Create Roles list page: `DataTable` (Role Name, Description, Permission Count, User Count, Actions); Create/Edit/Delete for ADMIN; Delete guarded by `ConfirmDialog` warning about permission loss; ADMIN role deletion/core permission revocation blocked
    - Create Role create/edit forms: multi-select permissions list
    - Create `Permission_Matrix` view: 2D grid (roles as columns, permissions as rows); checkbox at each intersection; update calls backend and reflects state without page reload
    - Create `features/roles/roles.routes.ts`, `features/permissions/permissions.routes.ts`
    - _Requirements: 20.1–20.10_
    - [ ]* 31.1a Write property test for Permission_Matrix round-trip fidelity (Property 19)
      - **Property 19: Permission_Matrix Round-Trip Fidelity** — permissions rendered in matrix must exactly equal permissions returned by backend API; no omissions, no additions
      - **Validates: Requirements 20.10**
  - [~] 31.2 Implement Audit Log module
    - Create `features/audit-logs/models/` (extends core `AuditLog` model)
    - Create mock service, service (Data_Source_Strategy wrapping `AuditLogService`), and store
    - Create Audit Log viewer page: `DataTable` (Timestamp, Actor, Action, Target Entity Type, Target ID, IP Address); reverse chronological by default; `SearchBar` (actor name or entity ID, 300ms debounce); `FilterPanel` (Action type, Target Entity Type, date range); inline detail panel expansion (before/after state); read-only (no edit/delete actions)
    - Implement "Export to CSV" in `PageHeader`: calls `AuditLogService.exportAuditLogsCsv()` with active filters; triggers browser file download; export contains same entries as filtered view across all pages
    - Create `features/audit-logs/audit-logs.routes.ts`
    - _Requirements: 29.1–29.10_
    - [ ]* 31.2a Write property test for Audit Log export filter consistency (Property 17)
      - **Property 17: Audit Log Export Filter Consistency** — exported CSV entries match filtered DataTable view across all pages
      - **Validates: Requirements 29.10**


- [~] 32. Settings Feature Module
  - Create `features/settings/models/`: `ApiToken` interface, `NotificationPreference` interface
  - Create `features/settings/mocks/settings.mock.service.ts` with `SettingsMockService`
  - Create `features/settings/services/settings.service.ts` (Data_Source_Strategy)
  - Create `features/settings/store/settings.store.ts` (`SettingsStore`)
  - Create Settings page with 6 sections (standalone component per section):
    - **Profile section**: editable display name + email; saves via backend; inline error on duplicate email
    - **Security section**: password change form (current, new, confirm); inline error if new ≠ confirm (no backend call)
    - **Appearance section**: Light/Dark mode toggle calling `ThemeService.applyTheme()`; immediate apply without page reload; persisted via `ThemeService`
    - **Notifications section**: opt-in/out toggles per `NotificationType`; saves to backend
    - **API Tokens section**: `DataTable` (Token Name, Created At, Last Used, Expiry, Revoke); Generate Token form (name + optional expiry); token value shown once in copy-to-clipboard dialog only; Revoke guarded by `ConfirmDialog`
    - **System Configuration section**: rendered only for ADMIN role; hidden for all other roles via `*idpHasPermission` directive (not just visually hidden — removed from DOM)
  - Create `features/settings/settings.routes.ts`
  - _Requirements: 21.1–21.10_

- [~] 33. AI Assistant Feature Module
  - Create `features/ai-assistant/models/`: `ChatMessage` (`id`, `sessionId`, `role: 'USER' | 'ASSISTANT'`, `content`, `timestamp`), `ChatSession`, `AiSuggestion` (`type: 'RECOMMENDATION' | 'INCIDENT_ANALYSIS' | 'DEPLOYMENT' | 'INFRASTRUCTURE'`, `title`, `description`, `confidenceScore`, `linkedEntityId`) interfaces
  - Create `features/ai-assistant/mocks/ai-assistant.mock.service.ts` with `AiAssistantMockService`: simulated AI responses with 500–1500ms typing delay; all `AiSuggestion` types covered; contextually appropriate text
  - Create `features/ai-assistant/services/ai-assistant.service.ts` (Data_Source_Strategy)
  - Create `features/ai-assistant/store/ai-assistant.store.ts` (`AiAssistantStore`): `conversations: Signal<ChatMessage[]>`, `isTyping: Signal<boolean>`; session history persisted in `sessionStorage`
  - Create full-page chat console at `/ai-assistant`: conversation history, message input, typing indicator, incremental response rendering
  - Create `FloatingAiWidgetComponent` anchored to bottom-right corner; rendered inside `LayoutComponent` on every authenticated page; populated by `AiAssistantMockService`
  - Create inline `AiSuggestion` panel component (used in Incidents and Deployments detail pages); labeled "AI-generated content"
  - Create `features/ai-assistant/ai-assistant.routes.ts`
  - _Requirements: 22.1–22.11_


- [~] 34. GitOps Feature Module (Scaffolded)
  - Create `features/gitops/models/`, `mocks/gitops.mock.service.ts`, `services/gitops.service.ts`, `store/gitops.store.ts` (`GitOpsStore`)
  - Create GitOps overview page showing ArgoCD application sync status using `StatusBadge` and `DataTable`; populated from `GitOpsMockService`
  - Create `features/gitops/gitops.routes.ts`
  - Register lazy route `/gitops` in `app.routes.ts` with `canActivate: [RbacGuard]`, `requiredPermissions: ['gitops:read']`
  - _Requirements: 2.4, 25.3, 28.1_

- [~] 35. Checkpoint — All 23 feature modules complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 36. Responsive Design, Accessibility & Animation Polish
  - Verify responsive behavior at all three breakpoints (Desktop ≥1280px, Tablet 768–1279px, Mobile <768px) for every page
  - Verify `DataTable` horizontal scroll on Mobile/Tablet breakpoints
  - Verify single-column form layout on Mobile breakpoints with field labels above inputs
  - Verify touch targets ≥44×44px on Mobile breakpoints (WCAG 2.5.5)
  - Integrate `axe-core` accessibility assertions into all shared component specs
  - Verify keyboard navigation (Tab + arrow keys) for Sidebar, dialogs, and all interactive elements; ARIA labels on all shared components
  - Verify `prefers-reduced-motion` media query wraps all keyframe animations
  - Apply route transition fades (`var(--duration-normal)`) and sidebar collapse animation (`var(--duration-slow)`)
  - Verify Material Symbols Rounded icon font loads with `font-display: block`
  - _Requirements: 24.1–24.10, 4.12, 30.2, 30.5_
  - [ ]* 36.1 Write unit tests for responsive sidebar breakpoint transitions
    - Test that viewport changes trigger correct sidebar state (expanded / icon-only / hidden) without page reload
    - _Requirements: 24.3–24.5, 24.10_


- [~] 37. Security Hardening & Session Management
  - Verify JWT access token is never written to `localStorage` (in-memory only in `AuthStore`)
  - Verify refresh token strategy: HttpOnly cookie (remember-me) or sessionStorage (no remember-me)
  - Verify JWT is never present in URL, query parameters, or `console.log` calls
  - Add `Content-Security-Policy` meta tag to `index.html` with `connect-src` and `frame-src` templated from `environment.ts`
  - Verify all Nginx security headers are in `docker/nginx.conf`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`, `X-XSS-Protection`
  - Verify `SessionTimeoutService` is initialized in `AppComponent.ngOnInit()` with 30-min idle timeout and 2-min warning banner
  - Verify rate limit interceptor applies exponential backoff on 429 responses
  - _Requirements: 3.5, 3.11, 30.3_

- [ ] 38. Wire All Modules Into Final Application
  - [~] 38.1 Register all 23 lazy routes in `app.routes.ts` and verify no feature bundle is in the initial payload
    - All routes use `loadComponent` or `loadChildren`; `SelectivePreloadingStrategy` applied; `dashboard` and `service-catalog` preloaded after boot
    - _Requirements: 28.1, 28.3, 28.12, 30.4_
  - [~] 38.2 Wire `FloatingAiWidgetComponent` into `LayoutComponent` (renders on all authenticated pages)
    - _Requirements: 22.6_
  - [~] 38.3 Wire `AiSuggestion` panels into Incidents detail page and Deployments detail page
    - _Requirements: 22.8, 22.9_
  - [~] 38.4 Wire `NotificationBellComponent` overlay into `TopNavComponent`; verify opens without navigation
    - _Requirements: 15.1, 4.13_
  - [~] 38.5 Wire `ThemeService.loadPersistedTheme()` into `APP_INITIALIZER` to prevent flash of wrong-theme content
    - _Requirements: 23.5, 21.10_
  - [~] 38.6 Wire `FeatureFlagService.initialize()` into `APP_INITIALIZER`
    - _Requirements: 2.11_
  - [~] 38.7 Wire `GlobalErrorHandlerService` as Angular `ErrorHandler` provider in `AppModule`
    - _Requirements: 27.6_
  - [ ]* 38.8 Run full build and verify: TypeScript zero errors (strict mode), zero stylelint violations (no hardcoded hex values), all 23 lazy bundles absent from initial network payload, Docker image < 150 MB
    - _Requirements: 30.6, 30.10, 28.12_


- [~] 39. Final Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- The design uses TypeScript/Angular 20 — no language selection was required
- All property-based tests use `fast-check ^3.x` with a minimum of 100 iterations via `fc.assert`; tests are tagged with comments referencing the design property they validate
- Each task references specific requirements for full traceability
- The Data_Source_Strategy means every feature module is fully functional from Sprint 1 — switching MOCK → LIVE requires a single line change in `environment.ts` per module
- Checkpoints ensure incremental validation at key milestones; each checkpoint verifies all preceding tasks before continuing
- The 19 correctness properties from the design document are distributed across relevant tasks as close to their implementation as possible
- No feature bundle should appear in the initial network payload — verify via `ng build --stats-json` and the build output manifest
- Use `eslint-plugin-boundaries` to enforce strict layer dependency rules at CI time; no circular imports between `core/`, `shared/`, and `features/`
- Integration tests (auth flow, Data_Source_Strategy MOCK→LIVE switch, RBAC per role) are reserved for nightly builds and are not part of the Sprint 1 CI gate


## Task Dependency Graph

```json
{
  "waves": [
    {
      "id": 0,
      "tasks": ["1"]
    },
    {
      "id": 1,
      "tasks": ["2", "3"]
    },
    {
      "id": 2,
      "tasks": ["4", "2.1"]
    },
    {
      "id": 3,
      "tasks": ["5", "6", "7"]
    },
    {
      "id": 4,
      "tasks": ["5.1", "5.2", "5.3", "9", "12"]
    },
    {
      "id": 5,
      "tasks": ["10", "11", "14"]
    },
    {
      "id": 6,
      "tasks": ["9.1", "9.2", "9.3", "10.1", "10.2", "11.1", "14.1", "14.2", "15"]
    },
    {
      "id": 7,
      "tasks": ["15.1", "16"]
    },
    {
      "id": 8,
      "tasks": ["16.1", "17.1", "17.2", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"]
    },
    {
      "id": 9,
      "tasks": ["17.3", "26.1", "28.1", "30.1", "30.2", "30.3", "31.1", "31.2", "32", "33", "34"]
    },
    {
      "id": 10,
      "tasks": ["31.1a", "31.2a", "36"]
    },
    {
      "id": 11,
      "tasks": ["36.1", "37", "38.1", "38.2", "38.3", "38.4", "38.5", "38.6", "38.7"]
    },
    {
      "id": 12,
      "tasks": ["18.1", "38.8"]
    }
  ]
}
```

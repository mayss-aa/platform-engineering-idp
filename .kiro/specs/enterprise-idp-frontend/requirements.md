# Requirements Document

## Introduction

This document defines the functional and non-functional requirements for the Enterprise Internal Developer Platform (IDP) frontend. The IDP_Frontend is a modern Angular 20 single-page application designed as a **progressive Enterprise IDP** that evolves naturally across multiple platform engineering maturity levels without ever requiring structural refactoring.

The platform is architected to advance through the following engineering maturity roadmap:

**Backend + Docker → Kubernetes → Azure AKS → GitHub Actions → ArgoCD (GitOps) → Prometheus / Grafana / Loki → AI-powered Platform Engineering**

A foundational architectural principle governs this roadmap: **all 19 Feature_Modules are fully scaffolded from Sprint 1** — each with complete routing, an Angular service layer, a Signal store, RBAC permission bindings, shared component usage, and Mock_Adapter data. No module uses a "coming soon" placeholder. Every module renders meaningful content: real data when backend integration is available, and mock data from a Mock_Adapter when backend integration is pending. Implementing business logic in future sprints requires zero architectural refactoring; only the Data_Source_Strategy switch from MOCK to LIVE needs to change.

The IDP_Frontend connects to a fully developed Spring Boot 3 / Java 21 backend via REST APIs secured with JWT authentication. The platform is inspired by Azure Portal, Backstage, GitHub, and GitLab, and is designed to be Docker-ready, Kubernetes-ready, and AKS-deployable.

---

## Glossary

- **IDP_Frontend**: The Angular 20 single-page application described in this document.
- **Shell**: The root application host that bootstraps all feature modules and provides the global layout.
- **Feature_Module**: A lazily loaded Angular module responsible for a single bounded domain (e.g., deployments, service catalog).
- **Core_Module**: A singleton module providing application-wide services (auth, HTTP interceptors, guards, error handling).
- **Shared_Module**: A module of reusable, stateless UI components and pipes consumed across feature modules.
- **Auth_Service**: The service responsible for login, logout, token storage, token refresh, and session state.
- **Token_Store**: The secure client-side storage mechanism for JWT access and refresh tokens.
- **RBAC_Guard**: The Angular route guard that enforces role-based access control on protected routes.
- **API_Gateway_Service**: The centralized HTTP service layer that wraps all backend REST API calls.
- **State_Store**: The reactive state container managing application-level and feature-level state using Angular Signals and lightweight stores.
- **Theme_Service**: The service controlling light mode, dark mode, and brand color theming.
- **Layout_Component**: The root shell component rendering the top navigation bar, collapsible sidebar, and main content area.
- **Dashboard**: The landing page presenting platform health, activity feeds, and KPI widgets.
- **Service_Catalog**: The module allowing developers to browse, search, filter, and request provisioning of platform services.
- **Provision_Request**: A formal request submitted by a developer to provision a service from the catalog.
- **Deployment_Console**: The module displaying deployment pipelines, status, logs, and Terraform execution results.
- **Admin_Console**: The module for managing users, organizations, teams, roles, and permissions.
- **Audit_Log**: An immutable record of all platform operations performed by users.
- **Notification_Center**: The in-app notification panel displaying real-time and historical platform events.
- **Router**: Angular's built-in router used for navigation between feature modules.
- **Interceptor**: An Angular HTTP interceptor that modifies outgoing requests or incoming responses globally.
- **Guard**: An Angular route guard that conditionally permits or denies route activation.
- **Signal**: An Angular reactive primitive for fine-grained, synchronous state reactivity (Angular 16+).
- **Standalone_Component**: An Angular component declared without an NgModule, self-sufficient with its own imports array.
- **Lazy_Route**: An Angular route configured with `loadComponent` or `loadChildren` to defer bundle loading until navigation.
- **AKS**: Azure Kubernetes Service — the target Kubernetes deployment environment.
- **WCAG**: Web Content Accessibility Guidelines — the accessibility standard the IDP_Frontend must conform to.
- **Design_Token**: A named CSS custom property representing a single design decision (color, spacing, radius, shadow).
- **Breakpoint**: A predefined viewport width threshold at which the layout adapts for responsive design.
- **Sidebar**: The collapsible vertical navigation panel rendered by the Layout_Component on the left side of the application.
- **TopNav**: The fixed horizontal navigation bar at the top of the application, housing the logo, breadcrumbs, user profile menu, notification bell, and theme toggle.
- **Breadcrumb**: A hierarchical navigation trail rendered in the TopNav that reflects the user's current location within the application.
- **KPI_Widget**: A modular, individually loadable card component displaying a single key performance indicator on the Dashboard.
- **ResourceState**: A typed container encapsulating the loading, error, and data states of an asynchronous HTTP operation.
- **Permission_Service**: The service that evaluates the current user's permissions to drive UI visibility and action availability decisions.
- **Terraform_Job**: A single execution unit representing a Terraform plan, apply, or destroy operation with its associated status and logs.
- **Pipeline**: A CI/CD workflow definition and its associated execution history, sourced from GitHub Actions.
- **Incident**: A platform event representing a service disruption, degradation, or anomaly requiring investigation and resolution.
- **Recommendation**: A platform-generated suggestion for infrastructure optimization, cost reduction, or operational improvement.
- **Design_Token_System**: The complete set of CSS custom properties that encode all brand and theme decisions consumed by component stylesheets.
- **HttpOnly_Cookie**: A browser cookie attribute that prevents JavaScript access, used as a secure alternative to localStorage for JWT storage.
- **ResourceState_Pattern**: An architectural pattern where each HTTP-backed Signal store exposes a consistent `{ loading: boolean; error: string | null; data: T | null }` shape.
- **Preloading_Strategy**: An Angular router strategy that eagerly fetches lazy route bundles in the background after the initial page load.
- **LogViewer**: The shared scrollable component that renders raw or structured log output with syntax highlighting and auto-scroll behavior.
- **StatusBadge**: The shared color-coded chip component that visually communicates the state of an entity (e.g., RUNNING, FAILED, PENDING).
- **DataTable**: The shared paginated, sortable, and filterable table component used uniformly across all list views in the IDP_Frontend.
- **MetricCard**: The shared KPI card component used in the Dashboard and monitoring views to display a labeled numeric or text metric.
- **PageHeader**: The shared component rendering a page title, breadcrumb trail, and contextual action buttons at the top of each page.
- **EmptyState**: The shared component rendered when a list or data set contains no items, displaying an icon and a descriptive message.
- **ConfirmDialog**: The shared modal dialog component that requests explicit user confirmation before executing a destructive or irreversible action.
- **TimelineComponent**: The shared component that renders a chronological sequence of events with timestamps, actors, and action descriptions.
- **SearchBar**: The shared input component with debounced keystroke handling used to filter data sets across list pages.
- **FilterPanel**: The shared component providing multi-criteria filter controls (dropdowns, checkboxes, date pickers) for list views.
- **Toast**: A transient, non-blocking notification overlay displayed at the edge of the viewport to acknowledge user actions.
- **Scaffolded_Module**: A Feature_Module that is fully scaffolded in Sprint 1 with complete routing, Angular service layer, Signal store, RBAC permission bindings, shared component usage, and Mock_Adapter data. Business logic is implemented progressively in later sprints as backend integrations become available, but no structural refactoring is ever required.
- **Mock_Adapter**: A service implementation that returns hardcoded or randomly generated data conforming to the module's defined model interfaces, used in place of live backend calls until the corresponding API is available.
- **Feature_Readiness_Level**: A classification of each Feature_Module's integration status: MOCK (data from Mock_Adapter), PARTIAL (some APIs integrated, some mocked), LIVE (all APIs integrated and no mock data in production build).
- **Feature_Flag_Service**: The Core_Module service that reads `environment.featureFlags` configuration and exposes each module's Feature_Readiness_Level as a Signal, enabling the Data_Source_Strategy to switch transparently between Mock_Adapter and live API calls.
- **Data_Source_Strategy**: An architectural pattern where each feature service delegates to either the real ApiService call or the corresponding Mock_Adapter based on the feature's Feature_Readiness_Level at runtime, requiring no component-level code changes when switching from MOCK to LIVE.
- **GitOps**: A deployment methodology where the Git repository is the single source of truth for infrastructure and application delivery, implemented using ArgoCD.
- **ArgoCD**: A declarative GitOps continuous delivery tool for Kubernetes, integrated with the IDP_Frontend's CI/CD and Kubernetes modules.
- **Permission_Matrix**: A tabular view mapping every Role to its set of granted Permissions, used in the RBAC administration interface.
- **API_Token**: A long-lived credential generated by the platform that allows programmatic access to the backend APIs on behalf of a user.
- **Namespace**: A Kubernetes logical partition used to isolate groups of resources within a cluster.
- **ConfigMap**: A Kubernetes resource for storing non-sensitive configuration data as key-value pairs.
- **PersistentVolume**: A Kubernetes storage resource representing a piece of networked storage provisioned for cluster workloads.
- **Prometheus**: An open-source time-series metrics collection and alerting system integrated with the monitoring module.
- **Grafana**: An open-source analytics and visualization platform whose dashboards are embedded via iframe in the monitoring module.
- **Loki**: An open-source log aggregation system whose log streams are displayed in the monitoring module.
- **P1_P4_Severity**: The four-level incident severity classification where P1 is the highest urgency and P4 is the lowest.

---

## Requirements

### Requirement 1: Folder Architecture

**User Story:** As a platform engineering lead, I want the project to follow a well-defined folder structure covering all 19 feature modules from Sprint 1, so that any engineer can navigate, maintain, and extend the codebase without guidance and implementing business logic in future sprints requires zero structural refactoring.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL organize source code under `src/app/` with the following top-level directories: `core/`, `shared/`, `features/`, `layout/`, and `pages/`.
2. THE IDP_Frontend SHALL place all singleton services, interceptors, guards, and application initializers under `src/app/core/`.
3. THE IDP_Frontend SHALL place all reusable standalone components, directives, pipes, and UI utilities under `src/app/shared/`.
4. THE IDP_Frontend SHALL create the following 19 feature module directories under `src/app/features/` from Sprint 1: `features/dashboard/`, `features/service-catalog/`, `features/provision-requests/`, `features/deployments/`, `features/terraform/`, `features/cicd/`, `features/infrastructure/`, `features/containers/`, `features/kubernetes/`, `features/cloud-resources/`, `features/monitoring/`, `features/notifications/`, `features/incidents/`, `features/recommendations/`, `features/organizations/`, `features/teams/`, `features/users/`, `features/settings/`, and `features/ai-assistant/`.
5. EACH of the 19 feature module directories SHALL contain the following subdirectories from Sprint 1: `components/`, `pages/`, `services/`, `models/`, `store/`, and `mocks/`.
6. THE IDP_Frontend SHALL place global SCSS design tokens, theme files, and base styles under `src/styles/`.
7. THE IDP_Frontend SHALL place environment-specific configuration under `src/environments/`.
8. THE IDP_Frontend SHALL place all TypeScript model interfaces and enumerations under `src/app/core/models/` or within each feature module's `models/` subdirectory.
9. THE IDP_Frontend SHALL not contain any circular dependencies between `core/`, `shared/`, and `features/` directories.
10. THE IDP_Frontend SHALL place Docker and Kubernetes manifests in `docker/` and `k8s/` directories at the project root.
11. THE `core/` directory SHALL contain a `mock-adapters/` subdirectory providing base mock utility classes and shared random data generators consumed across all feature module Mock_Adapters.

### Requirement 2: Application Architecture

**User Story:** As a platform architect, I want the IDP_Frontend to follow a clean Angular 20 architecture based on standalone components and lazy-loaded feature modules, with all 19 modules fully scaffolded from Sprint 1 using a Data_Source_Strategy pattern, so that the application is maintainable, testable, and capable of evolving from MOCK to LIVE without any structural refactoring.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL implement every component as a Standalone_Component using the `standalone: true` flag and a self-contained `imports` array.
2. THE IDP_Frontend SHALL register ALL 19 Lazy_Routes in the root router configuration from Sprint 1, regardless of the Feature_Readiness_Level of the target module, using `loadComponent` or `loadChildren` so that each feature bundle is deferred until the user navigates to it.
3. THE IDP_Frontend SHALL use Angular Signals as the primary reactive primitive for all component-level and feature-level state, replacing RxJS Subject and BehaviorSubject for synchronous state transitions.
4. THE IDP_Frontend SHALL enforce a strict unidirectional data-flow architecture: the Core_Module services own global state, Feature_Module stores own feature state, and Standalone_Components read state through Signal reads and write state through explicit service methods.
5. THE IDP_Frontend SHALL not declare any NgModule other than the root AppModule Shell, which SHALL be used exclusively to bootstrap the application.
6. THE IDP_Frontend SHALL apply tree-shaking by ensuring no eagerly loaded imports reference Feature_Module code directly.
7. THE IDP_Frontend SHALL isolate all HTTP communication behind the API_Gateway_Service, so that no component calls `HttpClient` directly.
8. THE IDP_Frontend SHALL expose all asynchronous HTTP operations through the ResourceState_Pattern, providing a consistent `{ loading, error, data }` shape to all consuming components.
9. WHEN a Feature_Module is added or removed, THE IDP_Frontend SHALL require no changes to any other Feature_Module's source code.
10. THE IDP_Frontend SHALL produce a separate JavaScript bundle per Feature_Module at build time, verifiable in the build output manifest.
11. THE IDP_Frontend SHALL implement a Feature_Flag_Service in the Core_Module that reads a feature flag configuration from `environment.ts` and exposes each feature module's Feature_Readiness_Level as a `Signal<Record<string, FeatureReadinessLevel>>`; the Layout_Component and RBAC_Guard SHALL consult this Signal but SHALL NOT block navigation to any module based on Feature_Readiness_Level.
12. EACH Feature_Module SHALL implement a `[feature-name].mock.service.ts` in its `mocks/` subdirectory that provides Mock_Adapter implementations for all service methods, activated when the module's Feature_Readiness_Level is MOCK.
13. THE IDP_Frontend SHALL implement the Data_Source_Strategy pattern: each feature service SHALL delegate to either the real API_Gateway_Service call or the corresponding Mock_Adapter based on the feature's Feature_Readiness_Level at runtime, requiring no component-level code changes when switching from MOCK to LIVE.

### Requirement 3: Authentication & Authorization

**User Story:** As an engineer, I want to securely authenticate with my credentials and have the IDP_Frontend enforce my role-based access rights throughout the session, so that I can access only the resources and actions permitted by my assigned role.

#### Acceptance Criteria

1. WHEN a user submits valid credentials on the login page, THE Auth_Service SHALL exchange them with the backend `/auth/login` endpoint, store the returned JWT access token and refresh token in the Token_Store, and navigate the user to the Dashboard.
2. WHEN a user submits invalid credentials, THE Auth_Service SHALL display a descriptive error message on the login page without navigating away.
3. WHEN the JWT access token is within 60 seconds of expiry, THE Auth_Service SHALL proactively request a new access token from the backend `/auth/refresh` endpoint using the stored refresh token before the next API call is dispatched.
4. WHEN the refresh token is expired or invalid and a protected resource is requested, THE Auth_Service SHALL clear the Token_Store, terminate the session, and redirect the user to `/auth/login`.
5. WHEN a user activates the remember-me option at login, THE Token_Store SHALL persist the refresh token across browser sessions using a secure storage mechanism; WHEN remember-me is not activated, THE Token_Store SHALL store tokens only for the duration of the browser session.
6. WHEN a user clicks logout, THE Auth_Service SHALL call the backend logout endpoint, clear all tokens from the Token_Store, and redirect the user to `/auth/login`.
7. WHEN the backend returns HTTP 401 on any API request, THE Interceptor SHALL invoke the Auth_Service token refresh flow; IF the refresh flow also fails, THEN THE Interceptor SHALL redirect the user to `/auth/login`.
8. WHEN the backend returns HTTP 403 on any API request, THE IDP_Frontend SHALL navigate the user to the `/403` error page without clearing the session.
9. THE RBAC_Guard SHALL evaluate the current user's role against the required role annotation on each protected route; IF the user's role does not satisfy the required role, THEN THE RBAC_Guard SHALL redirect the user to the `/403` error page.
10. THE IDP_Frontend SHALL render navigation items, action buttons, and form controls conditionally based on the current user's permissions as evaluated by the Permission_Service, hiding any UI element for which the user lacks the required permission.
11. THE IDP_Frontend SHALL not expose any JWT value in the browser URL, query parameters, or console logs at any time.
12. FOR ALL role assignments, the set of navigation items rendered by the Layout_Component SHALL be a subset of the navigation items permitted for that role, confirming that role-driven visibility is a monotone function of permissions (idempotence and containment property).

### Requirement 4: Layout & Navigation Shell

**User Story:** As an engineer, I want a consistent, responsive application shell with a collapsible sidebar and a top navigation bar providing full navigation to all 19 platform modules, so that I can reach any platform area quickly from any page and the layout remains usable on desktop, tablet, and mobile viewports.

#### Acceptance Criteria

1. THE Layout_Component SHALL render a fixed TopNav bar at the top of the viewport containing the platform logo, a Breadcrumb trail, a notification bell with an unread-count badge, a theme toggle control, and a user profile menu.
2. THE Layout_Component SHALL render a Sidebar on the left side of the viewport containing fully active, navigable navigation entries for all of the following platform areas in the specified order: Dashboard, Service Catalog, Provision Requests, Deployments, Terraform, CI/CD, Infrastructure, Containers, Kubernetes, Cloud Resources, Monitoring, Notifications, Incidents, Recommendations, Organizations, Teams, Users, Settings, and AI Assistant.
3. WHEN the user clicks the sidebar collapse toggle, THE Layout_Component SHALL transition the Sidebar between expanded (showing icons and labels) and icon-only (showing icons only) states, persisting the chosen state in localStorage.
4. WHEN the viewport width is less than 768px, THE Layout_Component SHALL hide the Sidebar by default and display a hamburger menu button in the TopNav; WHEN the user taps the hamburger button, THE Layout_Component SHALL render the Sidebar as an overlay drawer above the main content.
5. WHEN the viewport width is between 768px and 1279px inclusive, THE Layout_Component SHALL render the Sidebar in icon-only collapsed state without requiring user interaction.
6. WHEN the viewport width is 1280px or greater, THE Layout_Component SHALL render the Sidebar in fully expanded state by default.
7. THE Breadcrumb SHALL update to reflect the full hierarchical path of the currently active route on every navigation event.
8. WHEN the user clicks a Sidebar navigation entry, THE Router SHALL navigate to the corresponding Lazy_Route and the Sidebar SHALL highlight the active entry with a distinct visual indicator.
9. WHEN the user clicks the user profile menu in the TopNav, THE Layout_Component SHALL display a dropdown containing the current user's display name, role, a link to profile settings, and a logout action.
10. ALL 19 Sidebar navigation entries SHALL be fully active, navigable, and rendered identically regardless of the Feature_Readiness_Level of their target module; THE Sidebar SHALL NOT display any "coming soon" badge or disabled state on any navigation entry.
11. A subtle visual indicator (such as a small colored dot representing MOCK, PARTIAL, or LIVE status) MAY be rendered adjacent to a navigation entry exclusively for users with an ADMIN or DEVELOPER role; this indicator SHALL be hidden for all other roles and SHALL have no effect on navigability.
12. THE Sidebar SHALL support keyboard navigation using Tab and arrow keys, and all interactive elements SHALL have ARIA labels compliant with WCAG 2.1 AA.
13. WHEN the notification bell is clicked, THE Notification_Center panel SHALL open as an overlay without navigating away from the current page.

### Requirement 5: Cloud Platform Dashboard

**User Story:** As an engineering team lead, I want a unified dashboard presenting the real-time health and operational metrics of the entire platform, so that I can assess platform status at a glance without navigating to individual modules.

#### Acceptance Criteria

1. THE Dashboard SHALL render the following KPI_Widgets arranged in a responsive grid: Infrastructure Status, Running Deployments, Terraform Jobs, Pipeline Status, Running Containers, Kubernetes Health, CPU Usage, Memory Usage, Node Count, Pod Count, Active Users, Pending Approvals, and Notification Count.
2. THE Dashboard SHALL render a Recent Activity feed below the KPI_Widget grid, displaying the last 20 platform events with actor, action, target, and relative timestamp for each entry.
3. EACH KPI_Widget SHALL load its data independently through a dedicated API call so that a failure in one widget does not prevent other widgets from rendering.
4. WHEN a KPI_Widget's data fetch is in progress, THE KPI_Widget SHALL display a loading skeleton in place of the metric value.
5. WHEN a KPI_Widget's data fetch fails, THE KPI_Widget SHALL display an error indicator with a retry button without affecting the layout of adjacent widgets.
6. THE Dashboard SHALL support manual refresh of all KPI_Widgets simultaneously via a single refresh action in the PageHeader.
7. WHEN the Dashboard is loaded, THE IDP_Frontend SHALL initiate all KPI_Widget data fetches in parallel, completing the full widget set load within 3 seconds on a standard broadband connection.
8. THE Dashboard SHALL be fully usable at all three defined Breakpoints, reordering and resizing the KPI_Widget grid to a single-column layout on mobile viewports.
9. EACH KPI_Widget SHALL display a trend indicator (up, down, or stable) alongside the current metric value where a comparative previous value is available from the backend.
10. FOR ALL sets of KPI_Widget data responses, the count of rendered widgets SHALL equal the count of successfully resolved API responses plus the count of error-state widgets, confirming total widget count invariance regardless of individual fetch outcomes.

### Requirement 6: Service Catalog

**User Story:** As a developer, I want to browse, search, and filter the platform's service catalog, so that I can discover available services and submit provisioning requests for the ones I need.

#### Acceptance Criteria

1. THE Service_Catalog SHALL display all available platform services in a paginated DataTable with the following columns: Service Name, Category, Description, Health Status, and Actions.
2. WHEN a user enters text in the SearchBar on the Service_Catalog page, THE Service_Catalog SHALL filter the displayed services to those whose name or description contains the entered text, applying the filter within 300 milliseconds of the last keystroke.
3. THE Service_Catalog SHALL provide a FilterPanel allowing the user to filter services by Category and by Health Status simultaneously.
4. WHEN a user clicks the detail action for a service, THE Service_Catalog SHALL navigate to a service detail page displaying the full service description, category, tags, health status, owner team, and provisioning parameters.
5. THE Service_Catalog SHALL display a color-coded StatusBadge for each service indicating its current health status using at minimum the following states: HEALTHY, DEGRADED, and UNAVAILABLE.
6. WHEN a user clicks the provision action for a service, THE Service_Catalog SHALL navigate to the Provision_Request submission form pre-populated with the selected service's identifier and default parameters.
7. WHEN the Service_Catalog data fetch is in progress, THE Service_Catalog SHALL render loading skeletons in place of the DataTable rows.
8. WHEN the Service_Catalog returns zero results for the current search or filter criteria, THE Service_Catalog SHALL render the EmptyState component with a message indicating no matching services were found.
9. WHERE the current user's role does not include provisioning permission, THE Service_Catalog SHALL hide the provision action button for every service entry without hiding the detail action.
10. FOR ALL search term inputs, filtering then clearing the search term SHALL restore the full unfiltered service list, confirming search filter idempotence on empty input.

### Requirement 7: Provision Requests

**User Story:** As a developer, I want to submit, track, and review the status of service provisioning requests, and as an approver, I want to approve or reject requests, so that the provisioning workflow is transparent and auditable.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL display all Provision_Requests in a paginated DataTable with the following columns: Request ID, Service Name, Requester, Submitted At, Status, and Actions.
2. THE IDP_Frontend SHALL provide a FilterPanel on the Provision_Request list allowing the user to filter by Status and by date range.
3. WHEN a user submits the Provision_Request creation form with all required fields, THE IDP_Frontend SHALL call the backend API, display a success Toast, and update the Provision_Request list to include the newly created request with status PENDING.
4. IF the Provision_Request creation form is submitted with one or more required fields missing, THEN THE IDP_Frontend SHALL display inline validation error messages adjacent to each invalid field without submitting the form to the backend.
5. WHEN a user clicks the detail action on a Provision_Request, THE IDP_Frontend SHALL render the request detail page showing all submitted parameters, the current status, the complete status history, and the associated Audit_Log entries.
6. WHERE the current user's role includes approval permission, THE IDP_Frontend SHALL render Approve and Reject action buttons on each Provision_Request in PENDING status.
7. WHEN an approver clicks Approve or Reject on a Provision_Request, THE IDP_Frontend SHALL display the ConfirmDialog before dispatching the decision to the backend; WHEN the user confirms, THE IDP_Frontend SHALL call the backend approval endpoint and update the request status in the list.
8. THE IDP_Frontend SHALL represent the Provision_Request status lifecycle as the following ordered transitions: PENDING → APPROVED or REJECTED; APPROVED → PROVISIONED. THE IDP_Frontend SHALL not render transition actions that violate this lifecycle order.
9. THE IDP_Frontend SHALL display the Provision_Request audit trail on the detail page as a TimelineComponent showing each status transition with actor, timestamp, and optional comment.
10. FOR ALL Provision_Request status transitions driven by the current user, the status displayed in the list view after navigation back from the detail view SHALL reflect the latest confirmed status returned by the backend, confirming list-detail data consistency.

### Requirement 8: Deployment Management

**User Story:** As a developer or release engineer, I want to view, filter, trigger, and monitor deployments through the Deployment_Console, so that I have full visibility into the deployment lifecycle and can take action when needed.

#### Acceptance Criteria

1. THE Deployment_Console SHALL display all deployments in a paginated DataTable with the following columns: Deployment ID, Service Name, Environment, Version, Status, Triggered By, Started At, and Actions.
2. THE Deployment_Console SHALL provide a FilterPanel allowing the user to filter deployments by Status, by Environment, and by date range simultaneously.
3. WHEN a user clicks the detail action on a deployment, THE Deployment_Console SHALL navigate to the deployment detail page displaying all metadata, the current status, the deployment configuration, and the LogViewer for deployment output.
4. WHERE the current user's role includes deployment trigger permission, THE Deployment_Console SHALL render a Trigger Deployment action button on deployments in IDLE or FAILED status.
5. WHEN an authorized user clicks Trigger Deployment, THE Deployment_Console SHALL display the ConfirmDialog before dispatching the trigger request; WHEN the user confirms, THE Deployment_Console SHALL call the backend trigger endpoint and update the deployment status in the list.
6. WHILE a deployment is in RUNNING status, THE Deployment_Console SHALL poll the backend for status updates at intervals of no more than 5 seconds and update the StatusBadge in the list without requiring a full page reload.
7. THE LogViewer on the deployment detail page SHALL display streaming log output appended in real time while the deployment is RUNNING, and SHALL support auto-scroll-to-bottom behavior that the user can pause by scrolling up manually.
8. THE Deployment_Console SHALL render a deployment history TimelineComponent on the detail page showing all previous executions for the same service and environment, ordered chronologically from most recent to oldest.
9. WHEN a deployment transitions to FAILED status, THE Deployment_Console SHALL display the failure reason prominently in the StatusBadge tooltip and at the top of the LogViewer.
10. FOR ALL deployments visible in the DataTable, each deployment's StatusBadge color SHALL correspond exactly to its Status value, confirming that the status-to-color mapping function is total and consistent across all list and detail views.

### Requirement 9: Terraform Management

**User Story:** As a platform engineer, I want to manage the full Terraform lifecycle — including planning, applying, and destroying infrastructure — from the IDP_Frontend, so that I can provision and modify cloud infrastructure with full visibility into execution output and job history.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL display all Terraform_Jobs in a paginated DataTable with the following columns: Job ID, Workspace, Operation Type, Status, Triggered By, Started At, Completed At, and Actions.
2. THE IDP_Frontend SHALL provide a FilterPanel on the Terraform_Job list allowing the user to filter by Operation Type (Plan, Apply, Destroy) and by Status (PENDING, RUNNING, SUCCESS, FAILED).
3. WHERE the current user's role includes Terraform execution permission, THE IDP_Frontend SHALL render Plan, Apply, and Destroy action buttons scoped to the relevant Terraform workspace, each guarded by the ConfirmDialog before dispatch.
4. WHEN a Terraform Plan operation completes, THE IDP_Frontend SHALL render the plan output in a dedicated plan visualization panel using the LogViewer, clearly distinguishing resource additions, modifications, and destructions using color coding.
5. WHILE a Terraform_Job is in RUNNING status, THE IDP_Frontend SHALL stream real-time execution log output into the LogViewer on the job detail page at intervals of no more than 3 seconds.
6. WHEN a Terraform Apply or Destroy operation is dispatched, THE IDP_Frontend SHALL display a prominent warning in the ConfirmDialog that the operation will modify or destroy live infrastructure before the user confirms.
7. THE IDP_Frontend SHALL display the current Terraform state summary for each workspace on the workspace detail page, including resource count, last modified timestamp, and state version.
8. WHEN a Terraform_Job transitions to FAILED status, THE IDP_Frontend SHALL display the failure reason and the last error line from the log output prominently on the job detail page.
9. THE IDP_Frontend SHALL render a Terraform_Job execution history TimelineComponent per workspace showing all past jobs with their operation type, status, triggered-by actor, and timestamp.
10. FOR ALL Terraform_Job status values, the set { PENDING, RUNNING, SUCCESS, FAILED } SHALL be exhaustively handled by the StatusBadge component, ensuring no status value produces an unformatted or unstyled output (completeness property).

### Requirement 10: CI/CD Pipeline

**User Story:** As a developer or release manager, I want to view CI/CD pipeline executions, build history, running workflow status, and deployment linkages from a unified pipeline console, so that I can monitor build health and trace deployments to their originating pipelines.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL display a Pipeline list showing all configured GitHub Actions workflows with the following columns: Pipeline Name, Repository, Status, Last Run, Duration, and Actions.
2. THE IDP_Frontend SHALL render a StatusBadge for each Pipeline reflecting the most recent execution result using at minimum the following states: SUCCESS, FAILURE, RUNNING, CANCELLED, and NOT_RUN.
3. WHEN a user clicks the detail action on a Pipeline, THE IDP_Frontend SHALL navigate to the pipeline detail page showing the execution configuration, a build history list, and the LogViewer for the most recent execution.
4. THE Pipeline detail page SHALL highlight the last successful build with a distinct visual indicator and display its timestamp and commit reference.
5. THE Pipeline detail page SHALL render a failed builds list showing all failed executions within the last 30 days, each with its timestamp, triggering commit, and a link to the associated log output.
6. WHILE a Pipeline execution is in RUNNING status, THE IDP_Frontend SHALL update the StatusBadge and elapsed duration counter in the list without a full page reload, polling at intervals of no more than 5 seconds.
7. THE LogViewer on the Pipeline detail page SHALL display the selected build's log output in a collapsible panel, defaulting to collapsed for completed executions and expanded for running executions.
8. THE Pipeline detail page SHALL render a deployment history section listing all deployments triggered by executions of that Pipeline, linking each deployment entry to its corresponding record in the Deployment_Console.
9. THE IDP_Frontend SHALL provide a FilterPanel on the Pipeline list allowing the user to filter by Status and by Repository.
10. FOR ALL Pipeline execution log entries fetched and displayed, the chronological order of log lines in the LogViewer SHALL match the order returned by the backend API, confirming that the rendering pipeline preserves log line ordering (sequence invariant).

### Requirement 11: Docker / Container Management

**User Story:** As a platform engineer, I want a fully scaffolded container management module available from Sprint 1, so that I can manage Docker images, monitor running containers, inspect logs, and control container lifecycle — all rendered from mock data immediately and from live Docker API data once integration is available.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL register a Lazy_Route for the Container Management module under `/features/containers` from Sprint 1, guarded by the RBAC_Guard with permissions `containers:read`, `containers:start`, `containers:stop`, and `containers:logs`.
2. THE Container Management module SHALL define the following data model interfaces in its `models/` subdirectory from Sprint 1: ContainerImage (name, tag, size, pushedAt, digest), Container (id, name, image, status, cpuUsage, memoryUsage, createdAt), and ContainerLog (containerId, timestamp, line).
3. THE Container Management module SHALL implement a `ContainerMockService` in its `mocks/` subdirectory that generates realistic container data — including names, image references, status values, CPU percentages, and memory usage figures — for development and demo purposes.
4. THE Container Management module SHALL implement a `ContainerStore` using the ResourceState_Pattern with Signal-based state for images, containers, and logs; the store SHALL initialize with Feature_Readiness_Level MOCK and load data from the ContainerMockService until Docker API integration is activated.
5. THE Container Management module SHALL render a Docker images list using the DataTable component with columns: Image Name, Tag, Size, Pushed At, and Digest, populated from the active data source.
6. THE Container Management module SHALL render a running containers list using the DataTable component with columns: Container Name, Image, Status, CPU Usage, Memory Usage, and Actions, populated from the active data source.
7. THE Container Management module SHALL display a StatusBadge per container for at minimum the following states: RUNNING, STOPPED, EXITED, and RESTARTING, using the shared StatusBadge component with appropriate color mapping.
8. WHERE the current user's role includes `containers:start` or `containers:stop` permission, THE Container Management module SHALL render Start and Stop action buttons on each container entry, each guarded by the ConfirmDialog.
9. THE LogViewer SHALL display container log output for a selected container, populated by the Mock_Adapter until the Docker API integration is live, supporting auto-scroll and manual pause behaviors.
10. THE Container Management module SHALL display CPU and memory usage MetricCard components per container updated at intervals of no more than 10 seconds while the container list page is active.
11. WHEN the Feature_Readiness_Level of the containers module is changed from MOCK to LIVE in `environment.ts`, THE Data_Source_Strategy SHALL switch the ContainerStore to use live Docker API calls with no changes required to any component, template, or routing configuration.

### Requirement 12: Kubernetes Dashboard

**User Story:** As a platform engineer, I want a fully scaffolded Kubernetes dashboard module available from Sprint 1, so that I can inspect cluster health, browse workloads by namespace, and view all Kubernetes resource details — rendered from mock data immediately and from a live Kubernetes API once integration is available.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL register a Lazy_Route for the Kubernetes Dashboard under `/features/kubernetes` from Sprint 1, guarded by the RBAC_Guard with permissions `kubernetes:read`, `kubernetes:exec`, and `kubernetes:admin`.
2. THE Kubernetes Dashboard module SHALL define data model interfaces in its `models/` subdirectory from Sprint 1 for: ClusterOverview (healthStatus, nodeCount, podCount, version), Node (name, status, roles, cpuAllocatable, memoryAllocatable), Pod (name, namespace, status, node, restartCount, age), Deployment (name, namespace, desiredReplicas, readyReplicas, status), Service (name, namespace, type, clusterIp, ports), Ingress (name, namespace, host, tlsEnabled), Namespace (name, status, age), ConfigMap (name, namespace, keys), Secret (name, namespace, type, keys — values masked), and PersistentVolume (name, capacity, accessModes, status, storageClass).
3. THE Kubernetes Dashboard module SHALL implement a `KubernetesMockService` in its `mocks/` subdirectory that generates realistic cluster data — including node and pod counts, health statuses, namespaces, and resource names — for development and demo purposes.
4. THE Kubernetes Dashboard module SHALL implement a `KubernetesStore` using the ResourceState_Pattern with Signal-based state per resource type (nodes, pods, deployments, services, ingresses, namespaces, configMaps, secrets, persistentVolumes); the store SHALL initialize with Feature_Readiness_Level MOCK.
5. THE Kubernetes Dashboard SHALL render a cluster overview panel displaying health status, node count, pod count, and cluster version as MetricCard components, populated from the active data source.
6. THE Kubernetes Dashboard SHALL provide a Namespace selector that filters all resource lists (Pods, Deployments, Services, Ingress, ConfigMaps, Secrets) to the selected Namespace simultaneously.
7. THE Kubernetes Dashboard SHALL render a Nodes list using the DataTable component with columns: Name, Status, Roles, CPU Allocatable, and Memory Allocatable.
8. THE Kubernetes Dashboard SHALL render Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, and PersistentVolumes as individual tabbed list views within the Kubernetes Dashboard, each using the DataTable component.
9. THE Kubernetes Dashboard SHALL display Secret values as masked strings (e.g., `••••••••`) in all list and detail views, never rendering the raw secret value in the DOM.
10. THE Kubernetes Dashboard SHALL render cluster health indicators as color-coded StatusBadge components for at minimum the following states: HEALTHY, DEGRADED, and CRITICAL.
11. THE Kubernetes Dashboard SHALL update cluster overview metrics at intervals of no more than 30 seconds while the Kubernetes Dashboard page is active.
12. THE Router configuration SHALL support child routes for the Kubernetes module including at minimum `/kubernetes/pods/:namespace`, `/kubernetes/deployments/:namespace`, and `/kubernetes/nodes/:name`.
13. WHEN the Feature_Readiness_Level of the kubernetes module is changed from MOCK to LIVE in `environment.ts`, THE Data_Source_Strategy SHALL switch the KubernetesStore to use live Kubernetes API calls with no changes required to any component, template, or routing configuration.

### Requirement 13: Cloud Resources — Azure

**User Story:** As a cloud platform engineer, I want a fully scaffolded Azure cloud resources module available from Sprint 1, so that I can view and manage Azure resources across resource groups — rendered from mock data immediately and from live Azure API data once integration is available — with a provider selector ready for future multi-cloud expansion.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL register a Lazy_Route for the Cloud Resources module under `/features/cloud-resources` from Sprint 1, guarded by the RBAC_Guard with permissions `cloud:read`, `cloud:manage`, and `cloud:cost-view`.
2. THE Cloud Resources module SHALL define data model interfaces in its `models/` subdirectory from Sprint 1 for: ResourceGroup (name, location, subscriptionId, tags), VirtualNetwork (name, resourceGroup, addressSpace, location), StorageAccount (name, resourceGroup, sku, kind, location), AksCluster (name, resourceGroup, kubernetesVersion, nodeCount, status), KeyVaultEntry (name, resourceGroup, vaultUri, sku), PublicIp (name, resourceGroup, ipAddress, allocationMethod), and CostOverview (subscriptionId, billingPeriod, totalCost, currency, costByResourceGroup).
3. THE Cloud Resources module SHALL implement a `CloudResourceMockService` in its `mocks/` subdirectory that generates realistic Azure resource data — including resource group names, locations, AKS cluster configurations, and cost figures — for development and demo purposes.
4. THE Cloud Resources module SHALL implement a `CloudResourceStore` using the ResourceState_Pattern with Signal-based state for each resource type; the store SHALL initialize with Feature_Readiness_Level MOCK.
5. THE Cloud Resources module SHALL render a Resource Groups list using the DataTable component with columns: Name, Location, Subscription, Tag Count, and Actions, populated from the active data source.
6. THE Cloud Resources module SHALL provide a provider selector control in the PageHeader; the provider list SHALL be driven by `environment.ts` configuration data, not hard-coded values, enabling future providers to be added without component code changes.
7. THE Cloud Resources module SHALL render a Cost Overview MetricCard displaying the total billing cost for the current billing period with currency denomination, populated from the active data source.
8. THE Cloud Resources module SHALL render separate list views for Virtual Networks, Storage Accounts, AKS Clusters, Key Vault entries, and Public IPs, each using the DataTable component with columns appropriate to the resource type.
9. THE Cloud Resources module SHALL display a StatusBadge for AKS Clusters reflecting the cluster provisioning or operational state.
10. WHEN the Feature_Readiness_Level of the cloud-resources module is changed from MOCK to LIVE in `environment.ts`, THE Data_Source_Strategy SHALL switch the CloudResourceStore to use live Azure API calls with no changes required to any component, template, or routing configuration.

### Requirement 14: Monitoring & Observability

**User Story:** As a platform operations engineer, I want a fully scaffolded monitoring module available from Sprint 1, so that I can view Prometheus metrics, Grafana dashboards, Loki log streams, active alerts, and infrastructure health timelines — rendered from mock data immediately and from live observability backends once integration is available.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL register a Lazy_Route for the Monitoring module under `/features/monitoring` from Sprint 1, guarded by the RBAC_Guard with permissions `monitoring:read` and `monitoring:alerts:manage`.
2. THE Monitoring module SHALL define data model interfaces in its `models/` subdirectory from Sprint 1 for: MetricSeries (metricName, labels, dataPoints with timestamp and value), AlertRule (name, expression, severity, state, lastEvaluated), ActiveAlert (ruleName, severity, firingSince, labels, annotations), and InfrastructureEvent (timestamp, source, severity, description).
3. THE Monitoring module SHALL implement a `MonitoringMockService` in its `mocks/` subdirectory that generates realistic time-series metric data, fake alert rules, and simulated log entries for development and demo purposes.
4. THE Monitoring module SHALL implement a `MonitoringStore` using the ResourceState_Pattern with Signal-based state for metrics, alertRules, activeAlerts, and infrastructureEvents; the store SHALL initialize with Feature_Readiness_Level MOCK.
5. THE Monitoring module SHALL render Prometheus CPU, memory, and network metrics as time-series charts using MetricCard components updated at intervals of no more than 30 seconds, populated from the active data source.
6. THE Monitoring module SHALL embed Grafana dashboards via an iframe element within a designated Grafana panel; WHEN `environment.grafanaUrl` is configured, THE iframe SHALL load that URL; WHEN `environment.grafanaUrl` is not configured, THE Monitoring module SHALL render a clearly labelled "Grafana not configured" informational state in place of the iframe.
7. THE Monitoring module SHALL stream Loki log entries into a LogViewer component, supporting real-time tail mode and manual pause, populated from the Mock_Adapter until Loki integration is active.
8. THE Monitoring module SHALL render an Alert Rules list using the DataTable component with columns: Rule Name, Expression, Severity, State, and Last Evaluated.
9. THE Monitoring module SHALL render an Active Alerts panel displaying all currently firing alerts with severity-coded StatusBadge components, ordered by severity from highest to lowest.
10. THE Monitoring module SHALL render an Infrastructure Monitoring TimelineComponent showing infrastructure events ordered chronologically with source, severity, and description.
11. THE Monitoring module SHALL render alert severity levels using the following StatusBadge color mapping: CRITICAL → red, WARNING → amber, INFO → blue, ensuring the mapping is exhaustive for all defined severity levels.
12. THE Router configuration SHALL support child routes for the Monitoring module including at minimum `/monitoring/alerts/:id`.
13. WHEN the Feature_Readiness_Level of the monitoring module is changed from MOCK to LIVE in `environment.ts`, THE Data_Source_Strategy SHALL switch the MonitoringStore to use live Prometheus, Loki, and alerting API calls with no changes required to any component, template, or routing configuration.

### Requirement 15: Notifications

**User Story:** As a platform user, I want to receive, view, and manage real-time in-app notifications, so that I am promptly informed of platform events relevant to my work without relying on external communication channels.

#### Acceptance Criteria

1. THE Notification_Center SHALL be accessible from the notification bell icon in the TopNav and SHALL render as an overlay panel without navigating away from the current page.
2. THE Notification_Center SHALL display notifications using at least the following types, each with a distinct visual indicator: INFO (blue), WARNING (amber), ERROR (red), and SUCCESS (green).
3. THE IDP_Frontend SHALL fetch new notifications at polling intervals of no more than 30 seconds while the user session is active, updating the unread-count badge on the notification bell icon after each successful poll.
4. THE Notification_Center SHALL display a paginated list of historical notifications ordered from most recent to oldest, with each entry showing notification type, title, message, and relative timestamp.
5. WHEN a user clicks a notification entry, THE Notification_Center SHALL mark that notification as read and update the unread-count badge to reflect the new unread count.
6. WHEN a user clicks the "Mark all as read" action in the Notification_Center, THE IDP_Frontend SHALL call the backend mark-all-read endpoint and set the unread-count badge to zero.
7. THE Notification_Center SHALL visually distinguish unread notifications from read notifications using a persistent visual indicator (e.g., bold text or colored dot) on each unread entry.
8. WHEN the backend returns a notification with type ERROR, THE IDP_Frontend SHALL additionally display a Toast at the edge of the viewport for 8 seconds alongside the badge count update.
9. WHEN the IDP_Frontend receives a new notification while the Notification_Center overlay is open, THE Notification_Center SHALL prepend the new notification to the list without requiring the user to close and reopen the panel.
10. FOR ALL sequences of mark-as-read operations, the unread-count badge value SHALL equal the total notification count minus the count of notifications marked as read, confirming that the badge count is a consistent aggregate of read state (count invariant property).

### Requirement 16: Incidents Management

**User Story:** As a platform operations engineer, I want a fully scaffolded incidents management module available from Sprint 1, so that I can track, assign, and resolve platform incidents through a structured workflow with severity classification and timeline visibility — rendered from mock data immediately and from a live incidents API once integration is available.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL register a Lazy_Route for the Incidents module under `/features/incidents` from Sprint 1, guarded by the RBAC_Guard with permissions `incidents:read`, `incidents:assign`, and `incidents:resolve`.
2. THE Incidents module SHALL define data model interfaces in its `models/` subdirectory from Sprint 1 for: Incident (id, title, description, severity, status, assignee, createdAt, updatedAt, resolvedAt), IncidentEvent (incidentId, actor, action, timestamp, comment), and IncidentAssignment (incidentId, assigneeUserId, assignedAt, assignedBy).
3. THE Incidents module SHALL implement an `IncidentMockService` in its `mocks/` subdirectory that generates realistic incident scenarios — including P1–P4 severity examples, varied statuses, and timeline events — for development and demo purposes.
4. THE Incidents module SHALL implement an `IncidentStore` using the ResourceState_Pattern with Signal-based state for incidents and incidentEvents; the store SHALL initialize with Feature_Readiness_Level MOCK.
5. THE Incidents module SHALL render an Active Incidents list using the DataTable component with columns: Incident ID, Title, Severity, Status, Assignee, Created At, and Actions, populated from the active data source.
6. THE Incidents module SHALL render a StatusBadge per incident using the following P1_P4_Severity color mapping: P1 → red (critical), P2 → orange (high), P3 → amber (medium), P4 → blue (low).
7. WHERE the current user's role includes `incidents:assign` permission, THE Incidents module SHALL render an Assign action on each unassigned incident; WHERE the current user's role includes `incidents:resolve` permission, THE Incidents module SHALL render a Resolve action on each active incident; each action SHALL be guarded by the ConfirmDialog.
8. THE Incidents module SHALL render an Incident Timeline on the detail page showing all IncidentEvents in chronological order using the TimelineComponent.
9. THE Incidents module SHALL enforce the following incident status lifecycle in the UI: OPEN → ASSIGNED → INVESTIGATING → RESOLVED, hiding transition actions that violate this order.
10. THE Incidents module SHALL display the elapsed time since incident creation as a live-updating counter while the incident status is not RESOLVED.
11. THE Router configuration SHALL support child routes including `/incidents/:id` for the incident detail page.
12. WHEN the Feature_Readiness_Level of the incidents module is changed from MOCK to LIVE in `environment.ts`, THE Data_Source_Strategy SHALL switch the IncidentStore to use live API calls with no changes required to any component, template, or routing configuration.

### Requirement 17: Recommendations

**User Story:** As a platform engineer, I want a fully scaffolded recommendations module available from Sprint 1, so that I can review platform-generated optimization suggestions and track their disposition — rendered from mock data immediately and from a live recommendations API once integration is available.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL register a Lazy_Route for the Recommendations module under `/features/recommendations` from Sprint 1, guarded by the RBAC_Guard with permissions `recommendations:read` and `recommendations:manage`.
2. THE Recommendations module SHALL define a data model interface for Recommendation in its `models/` subdirectory from Sprint 1, containing: id, title, description, category (INFRASTRUCTURE_OPTIMIZATION, COST_SAVING, SECURITY, PERFORMANCE), status (NEW, ACKNOWLEDGED, APPLIED, DISMISSED), priority, estimatedSavings (optional), createdAt, and updatedAt.
3. THE Recommendations module SHALL implement a `RecommendationMockService` in its `mocks/` subdirectory that generates realistic infrastructure optimization and cost saving suggestions with varied categories, priorities, and estimated savings figures.
4. THE Recommendations module SHALL implement a `RecommendationStore` using the ResourceState_Pattern with Signal-based state for recommendations; the store SHALL initialize with Feature_Readiness_Level MOCK.
5. THE Recommendations module SHALL render a Recommendations list using the DataTable component with columns: Title, Category, Priority, Status, Created At, and Actions, populated from the active data source.
6. THE Recommendations module SHALL render a StatusBadge per recommendation using the following status color mapping: NEW → blue, ACKNOWLEDGED → amber, APPLIED → green, DISMISSED → grey.
7. THE Recommendations module SHALL provide a FilterPanel allowing the user to filter recommendations by Category and by Status simultaneously.
8. WHERE the current user's role includes `recommendations:manage` permission, THE Recommendations module SHALL render Acknowledge, Apply, and Dismiss action buttons on each recommendation in NEW or ACKNOWLEDGED status, each guarded by the ConfirmDialog.
9. THE Recommendations module SHALL render cost saving recommendations with the estimated savings amount prominently displayed as a MetricCard value on the recommendation detail page.
10. FOR ALL recommendation status transitions, a recommendation in DISMISSED status SHALL not render the Apply or Acknowledge action buttons, confirming that the terminal DISMISSED state is consistently enforced in the UI.
11. WHEN the Feature_Readiness_Level of the recommendations module is changed from MOCK to LIVE in `environment.ts`, THE Data_Source_Strategy SHALL switch the RecommendationStore to use live API calls with no changes required to any component, template, or routing configuration.

### Requirement 18: Organizations & Teams

**User Story:** As an admin, I want to manage the organizational hierarchy of the platform — creating organizations, forming teams within them, and assigning members to teams — so that access control, resource ownership, and operational responsibility are clearly structured.

#### Acceptance Criteria

1. THE Admin_Console SHALL display all organizations in a paginated DataTable with the following columns: Organization Name, Description, Team Count, Member Count, Created At, and Actions.
2. WHERE the current user's role includes organization management permission, THE Admin_Console SHALL render Create, Edit, and Delete action controls for organizations.
3. WHEN an authorized user clicks Create Organization, THE Admin_Console SHALL display a creation form requiring organization name and description; WHEN submitted with valid data, THE Admin_Console SHALL call the backend API, display a success Toast, and add the new organization to the list.
4. WHEN an authorized user clicks Delete Organization, THE Admin_Console SHALL display the ConfirmDialog warning that deleting the organization will also remove all associated teams; WHEN confirmed, THE Admin_Console SHALL call the backend delete endpoint and remove the organization from the list.
5. WHEN a user clicks the detail action on an organization, THE Admin_Console SHALL navigate to the organization detail page displaying all teams within that organization in a nested DataTable with columns: Team Name, Member Count, and Actions.
6. WHERE the current user's role includes team management permission, THE Admin_Console SHALL render Create Team and Delete Team actions on the organization detail page.
7. WHEN an authorized user creates a team, THE Admin_Console SHALL require a team name and allow the user to assign one or more existing users as initial members from a searchable multi-select control.
8. WHEN a user navigates to a team detail page, THE Admin_Console SHALL display the team's members list with columns: Display Name, Email, Role, and Actions, and SHALL provide an Add Member and Remove Member control.
9. THE Admin_Console SHALL render the user-team-organization hierarchy as a breadcrumb trail on team and user detail pages, reflecting the full organizational path.
10. FOR ALL organization delete operations, the teams and member assignments formerly belonging to the deleted organization SHALL not appear in any team or member list view after the delete operation is confirmed, verifying cascading removal consistency.

### Requirement 19: User Management

**User Story:** As an administrator, I want to manage platform users — viewing their profiles, creating and deactivating accounts, assigning roles, and reviewing activity summaries — so that I maintain full control over platform access and user identity.

#### Acceptance Criteria

1. THE Admin_Console SHALL display all users in a paginated DataTable with the following columns: Display Name, Email, Role, Status (ACTIVE/INACTIVE), Organization, Last Login, and Actions.
2. THE Admin_Console SHALL provide a SearchBar on the user list that filters by display name or email address, applying the filter within 300 milliseconds of the last keystroke.
3. THE Admin_Console SHALL provide a FilterPanel on the user list allowing filtering by Role and by Status simultaneously.
4. WHERE the current user's role is ADMIN, THE Admin_Console SHALL render Create User, Edit User, and Deactivate User actions.
5. WHEN an admin clicks Create User, THE Admin_Console SHALL display a creation form requiring display name, email, role, and organization assignment; IF submitted with invalid or duplicate data, THEN THE Admin_Console SHALL display descriptive inline validation errors without calling the backend.
6. WHEN an admin deactivates a user, THE Admin_Console SHALL display the ConfirmDialog before calling the backend deactivate endpoint; WHEN confirmed, THE Admin_Console SHALL update the user's Status badge to INACTIVE in the list.
7. WHEN an admin clicks the detail action on a user, THE Admin_Console SHALL navigate to the user profile page displaying: display name, email, role, organization membership, team memberships, account creation date, last login timestamp, and a recent activity summary.
8. THE Admin_Console user profile page SHALL render the user's recent activity summary as a TimelineComponent showing the last 10 Audit_Log entries attributed to that user.
9. WHERE the current user's role is ADMIN, THE Admin_Console SHALL render a role assignment control on the user profile page allowing the admin to change the user's role from a dropdown of all available roles; WHEN saved, THE Admin_Console SHALL call the backend role assignment endpoint and reflect the updated role on the profile page.
10. FOR ALL user deactivation operations, the deactivated user SHALL appear with INACTIVE status in subsequent list queries, and the user's Role and Organization fields SHALL remain readable in the list view to preserve audit context.

### Requirement 20: RBAC — Roles & Permissions

**User Story:** As an administrator, I want to define and manage roles with specific permission sets and view the complete permissions matrix, so that I can enforce the principle of least privilege across all platform users.

#### Acceptance Criteria

1. THE Admin_Console SHALL display all roles in a paginated DataTable with the following columns: Role Name, Description, Permission Count, User Count, and Actions.
2. WHERE the current user's role is ADMIN, THE Admin_Console SHALL render Create Role, Edit Role, and Delete Role actions.
3. WHEN an admin clicks Create Role, THE Admin_Console SHALL display a creation form requiring a unique role name, an optional description, and a multi-select list of all available permissions.
4. WHEN an admin clicks Edit Role, THE Admin_Console SHALL display the edit form pre-populated with the role's current name, description, and selected permissions, allowing the admin to add or remove individual permissions.
5. WHEN an admin clicks Delete Role, THE Admin_Console SHALL display the ConfirmDialog warning that users currently assigned this role will lose access to all associated permissions; WHEN confirmed, THE Admin_Console SHALL call the backend delete endpoint and remove the role from the list.
6. THE Admin_Console SHALL provide a Permission_Matrix view accessible from the RBAC section, rendering a two-dimensional grid with roles as columns and permissions as rows, with a checkbox or checkmark indicator at each intersection reflecting whether the role grants the permission.
7. WHEN the Permission_Matrix is updated by assigning or revoking a permission from a role, THE Admin_Console SHALL call the backend permission assignment endpoint and reflect the updated state in the Permission_Matrix without requiring a full page reload.
8. THE IDP_Frontend SHALL never allow the ADMIN role to be deleted or have its core administrative permissions revoked through the RBAC management UI.
9. THE Admin_Console SHALL display a user count for each role in the roles list, reflecting the number of active users currently assigned that role.
10. FOR ALL role-permission assignments stored and retrieved, the set of permissions rendered in the Permission_Matrix for a given role SHALL exactly equal the set of permissions returned by the backend for that role, confirming round-trip data fidelity between the API response and the rendered matrix.

### Requirement 21: Settings

**User Story:** As a platform user, I want a settings page where I can manage my profile, change my password, configure theme and notification preferences, and manage my API tokens, so that I can personalise my platform experience and control programmatic access to my account.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL provide a Settings page accessible via the Sidebar navigation entry labelled "Settings", organized into the following distinct sections: Profile, Security, Appearance, Notifications, API Tokens, and — for admin users only — System Configuration.
2. THE Settings page SHALL render the Profile section with editable fields for display name and email address; WHEN saved, THE IDP_Frontend SHALL call the backend profile update endpoint and display a success Toast; IF the submitted email is already in use, THEN THE IDP_Frontend SHALL display an inline error message without submitting the update.
3. THE Settings page SHALL render the Security section with a password change form requiring current password, new password, and new password confirmation; IF the new password and confirmation do not match, THEN THE IDP_Frontend SHALL display an inline error without calling the backend.
4. THE Settings page SHALL render the Appearance section with a theme preference control offering Light Mode and Dark Mode options; WHEN the user selects a preference, THE Theme_Service SHALL apply the selected theme immediately and persist the preference.
5. THE Settings page SHALL render the Notifications section with toggles allowing the user to opt in or out of in-app notifications for each notification type (INFO, WARNING, ERROR, SUCCESS); WHEN saved, THE IDP_Frontend SHALL call the backend notification preference endpoint and reflect the updated state.
6. THE Settings page SHALL render the API Tokens section displaying a list of the user's existing API_Tokens with columns: Token Name, Created At, Last Used, Expiry, and a Revoke action.
7. WHEN a user clicks Generate API Token in the API Tokens section, THE IDP_Frontend SHALL display a creation form requiring a token name and optional expiry date; WHEN the token is created, THE IDP_Frontend SHALL display the raw token value once in a copy-to-clipboard dialog and SHALL not display it again.
8. WHEN a user clicks Revoke on an API_Token, THE IDP_Frontend SHALL display the ConfirmDialog before calling the backend revoke endpoint; WHEN confirmed, THE IDP_Frontend SHALL remove the token from the list and display a success Toast.
9. WHERE the current user's role is ADMIN, THE Settings page SHALL render the System Configuration section; WHERE the current user's role is not ADMIN, THE System Configuration section SHALL not be rendered or accessible by any navigation path.
10. WHEN the theme preference is changed in the Appearance section, THE IDP_Frontend SHALL apply the new theme to all components on the page immediately without requiring a page reload, and the selected theme SHALL persist after browser refresh.

### Requirement 22: AI Assistant

**User Story:** As a platform engineer, I want a fully scaffolded AI Assistant module available from Sprint 1, so that I can interact with an AI-powered chat interface for platform recommendations, incident analysis, deployment guidance, and infrastructure suggestions — rendered from mock responses immediately and from a live AI backend once integration is available.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL register a Lazy_Route for the AI Assistant module under `/features/ai-assistant` from Sprint 1, guarded by the RBAC_Guard with permissions `ai-assistant:read` and `ai-assistant:chat`.
2. THE AI Assistant module SHALL define data model interfaces in its `models/` subdirectory from Sprint 1 for: ChatMessage (id, sessionId, role (USER or ASSISTANT), content, timestamp), ChatSession (id, userId, title, createdAt, lastActive), and AiSuggestion (type (RECOMMENDATION, INCIDENT_ANALYSIS, DEPLOYMENT, INFRASTRUCTURE), title, description, confidenceScore, linkedEntityId).
3. THE AI Assistant module SHALL implement an `AiAssistantMockService` in its `mocks/` subdirectory that provides simulated AI responses with a realistic typing delay of 500–1500 milliseconds, covering all AiSuggestion types and returning contextually appropriate text.
4. THE AI Assistant module SHALL implement an `AiAssistantStore` using the ResourceState_Pattern with a Signal-based conversation history — `conversations: Signal<ChatMessage[]>` and `isTyping: Signal<boolean>` — initialized with Feature_Readiness_Level MOCK.
5. THE AI Assistant module SHALL render a full-page chat console at `/features/ai-assistant` from Sprint 1, displaying conversation history for the current session and a message input field, populated by the AiAssistantMockService until live AI backend integration is active.
6. THE Shell SHALL render a floating chat assistant widget anchored to the bottom-right corner of every authenticated page from Sprint 1, independently of the current active route, populated by the AiAssistantMockService.
7. THE IDP_Frontend SHALL preserve conversation history per browser session using the session storage mechanism, restoring the history when the user navigates back to the AI Assistant console within the same session.
8. THE Incidents module detail page SHALL render an inline AiSuggestion panel of type INCIDENT_ANALYSIS from Sprint 1, populated by the AiAssistantMockService and clearly labelled as AI-generated content.
9. THE Deployment_Console detail page SHALL render an inline AiSuggestion panel of type DEPLOYMENT from Sprint 1, populated by the AiAssistantMockService and clearly labelled as AI-generated content.
10. WHILE a chat response is being generated (or simulated by the Mock_Adapter), THE IDP_Frontend SHALL render the response incrementally in the chat panel and display a typing indicator until the response is complete.
11. WHEN the Feature_Readiness_Level of the ai-assistant module is changed from MOCK to LIVE in `environment.ts`, THE Data_Source_Strategy SHALL switch the AiAssistantStore to use live AI API calls with no changes required to any component, template, or routing configuration.

### Requirement 23: Theme Architecture

**User Story:** As a platform engineer, I want the IDP_Frontend to implement a rigorous design token system supporting light and dark modes with brand-aligned colors, so that the visual identity is consistent, maintainable, and easily extensible.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL implement the Design_Token_System as a set of CSS custom properties defined in global SCSS files under `src/styles/`, covering at minimum the following categories: color (brand, semantic, neutral), typography (font family, size scale, weight), spacing (scale from 4px base), border radius, shadow levels, and z-index scale.
2. THE IDP_Frontend SHALL define the following named brand color Design_Tokens: `--color-primary: #0070AD`, `--color-secondary: #12ABDB`, `--color-accent: #6F2C91`, `--color-background: #F5F7FA`, and `--color-sidebar: #1F2937`.
3. THE IDP_Frontend SHALL implement a light mode theme and a dark mode theme by overriding Design_Token values on the root `html` element using a `data-theme` attribute, so that all components consume theme values exclusively through CSS custom properties without hardcoded color values.
4. WHEN the Theme_Service applies a theme, THE IDP_Frontend SHALL update the `data-theme` attribute on the `html` element, causing all components that consume Design_Tokens to rerender with the updated theme values without a page reload.
5. THE Theme_Service SHALL persist the user's theme preference in localStorage under the key `idp-theme-preference` and SHALL restore the persisted theme on application startup before the first render, preventing a flash of unstyled or wrong-theme content.
6. THE IDP_Frontend SHALL integrate Angular Material component theming by defining a custom Angular Material theme palette that maps Angular Material's primary, accent, and warn palettes to the brand Design_Tokens, ensuring Material components inherit the brand color scheme.
7. THE IDP_Frontend SHALL not contain any hardcoded hex color values, RGB values, or font-size pixel values in component SCSS files; all such values SHALL be referenced via Design_Token CSS custom properties.
8. FOR ALL Design_Token CSS custom properties defined in the light mode theme, an equivalent override SHALL exist in the dark mode theme definition, confirming that the two theme definitions are structurally isomorphic (complete override property).
9. WHEN the application is built for production, THE IDP_Frontend SHALL not generate unused CSS custom property definitions in the output stylesheet, confirming that the Design_Token_System is free of orphaned token definitions.

### Requirement 24: Responsive Design

**User Story:** As a platform user, I want the IDP_Frontend to be fully usable on desktop, tablet, and mobile devices, so that I can access platform functions from any device without loss of functionality or usability.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL define exactly three canonical Breakpoints: Desktop (viewport width ≥ 1280px), Tablet (viewport width 768px to 1279px inclusive), and Mobile (viewport width less than 768px).
2. THE IDP_Frontend SHALL implement all Breakpoint-conditional layout adjustments using SCSS mixins defined in `src/styles/_breakpoints.scss`, and SHALL not use inline styles or JavaScript-based layout switching for Breakpoint transitions.
3. WHILE the viewport width is 1280px or greater, THE Layout_Component SHALL render the Sidebar in fully expanded state, the main content area in a multi-column layout with a minimum of two columns for list and detail views, and the TopNav at full width.
4. WHILE the viewport width is between 768px and 1279px inclusive, THE Layout_Component SHALL render the Sidebar in icon-only collapsed state occupying no more than 64px width, and the main content area in a two-column layout.
5. WHILE the viewport width is less than 768px, THE Layout_Component SHALL hide the Sidebar, render a hamburger menu button in the TopNav, and render the main content area in a single-column stacked layout.
6. THE IDP_Frontend SHALL render all DataTable components with horizontal scroll enabled on Mobile and Tablet Breakpoints so that no table content is clipped or hidden.
7. THE IDP_Frontend SHALL render all form pages in a single-column layout on Mobile Breakpoints, stacking field labels above their input controls.
8. THE IDP_Frontend SHALL ensure that all interactive touch targets on Mobile Breakpoints have a minimum size of 44px × 44px in compliance with WCAG 2.1 AA success criterion 2.5.5.
9. FOR ALL three Breakpoints, every page in the IDP_Frontend SHALL be fully navigable and operable using only the controls visible at that Breakpoint, with no functionality accessible exclusively at a different Breakpoint.
10. WHEN the viewport is resized across a Breakpoint boundary during an active session, THE Layout_Component SHALL transition to the appropriate layout state without requiring a page reload, and the current route SHALL remain active throughout the transition.

### Requirement 25: State Management

**User Story:** As a frontend architect, I want the IDP_Frontend to use a disciplined, consistent state management approach based on Angular Signals, with all 19 feature-level Signal stores fully initialized from Sprint 1 using Mock_Adapter data, so that reactive data flow is predictable, testable, and performant across all feature modules from day one.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL use Angular Signals as the exclusive reactive primitive for all synchronous component-level state, replacing RxJS Subject and BehaviorSubject in all new code.
2. THE IDP_Frontend SHALL implement a lightweight Signal-based store per Feature_Module, encapsulating the feature's data, loading state, and error state in a structured Signal object conforming to the ResourceState_Pattern.
3. THE IDP_Frontend SHALL implement the following 19 feature-level Signal stores from Sprint 1, one per feature module: `DashboardStore`, `ServiceCatalogStore`, `ProvisionRequestStore`, `DeploymentStore`, `TerraformStore`, `CicdStore`, `InfrastructureStore`, `ContainerStore`, `KubernetesStore`, `CloudResourceStore`, `MonitoringStore`, `NotificationStore`, `IncidentStore`, `RecommendationStore`, `OrganizationStore`, `TeamStore`, `UserStore`, `SettingsStore`, and `AiAssistantStore`.
4. EACH of the 19 feature-level stores SHALL be initialized with Feature_Readiness_Level MOCK and SHALL load data from the corresponding Mock_Adapter until backend integration is activated by changing the module's Feature_Readiness_Level in `environment.ts`.
5. THE IDP_Frontend SHALL implement global application state — including authenticated user, current theme, and unread notification count — as Signal stores in the Core_Module, accessible to any component through service injection.
6. THE ResourceState_Pattern SHALL expose a Signal of shape `{ loading: boolean; error: string | null; data: T | null }` for every HTTP-backed store, so that all components consuming the store render consistently based on a single reactive source of truth.
7. THE IDP_Frontend SHALL not introduce NgRx for state management unless a Feature_Module requires state that is shared across more than two independent feature areas and cannot be cleanly owned by a single Core_Module service.
8. WHEN an HTTP operation is dispatched by a feature store, THE feature store SHALL set `loading` to `true` and `error` to `null` before the request is sent, set `data` on success and `loading` to `false`, and set `error` to a descriptive message and `loading` to `false` on failure.
9. THE IDP_Frontend SHALL not mutate Signal values directly from within component templates; all Signal writes SHALL be performed through explicit store service methods.
10. THE IDP_Frontend SHALL destroy all feature-level Signal stores when the corresponding Lazy_Route component is destroyed, releasing all associated memory and subscriptions.
11. FOR ALL ResourceState Signal stores, the invariant `loading === true` implies `data === null OR data holds the previous successful value` SHALL hold at all times, confirming that no component is presented with a loading indicator alongside stale data simultaneously.
12. FOR ALL ResourceState Signal stores, transitioning from an error state by retrying the HTTP operation SHALL reset `error` to `null` and set `loading` to `true` before the new request is dispatched, confirming that the error state is cleared before a retry attempt (idempotent retry state transition).

### Requirement 26: Shared Components Library

**User Story:** As a frontend developer, I want a well-defined library of reusable shared UI components in the Shared_Module, so that every list, form, dialog, and data display in the IDP_Frontend uses consistent, accessible, and maintainable building blocks.

#### Acceptance Criteria

1. THE Shared_Module SHALL contain the following Standalone_Components, each declared in its own file under `src/app/shared/components/`: StatusBadge, DataTable, ConfirmDialog, LogViewer, MetricCard, PageHeader, EmptyState, LoadingSpinner, ErrorAlert, SearchBar, FilterPanel, and TimelineComponent.
2. THE StatusBadge component SHALL accept a `status` input of a string union type and a `colorMap` input mapping status values to CSS class names, so that any feature module can configure the badge for its own status vocabulary without modifying the component.
3. THE DataTable component SHALL accept inputs for column definitions (including label, field, sortable flag, and cell template), a data array, a page size, and an optional loading state; WHEN the loading input is true, THE DataTable SHALL render skeleton rows in place of data rows.
4. THE DataTable component SHALL support client-side sorting by any column marked sortable; WHEN a sortable column header is clicked once, THE DataTable SHALL sort ascending; WHEN clicked a second time, THE DataTable SHALL sort descending; WHEN clicked a third time, THE DataTable SHALL restore the original order.
5. THE ConfirmDialog component SHALL accept inputs for title, message, and confirm button label, and SHALL emit a confirmed or dismissed event; THE ConfirmDialog SHALL trap focus within the dialog while open and restore focus to the triggering element when closed.
6. THE LogViewer component SHALL accept a `lines` input of string array and a `streaming` boolean input; WHILE `streaming` is true, THE LogViewer SHALL auto-scroll to the last line; WHEN the user scrolls up manually, THE LogViewer SHALL pause auto-scroll and display a "scroll to bottom" button.
7. THE PageHeader component SHALL accept inputs for page title, breadcrumb items array, and a projected content slot for action buttons, and SHALL render the breadcrumb trail using the router link directive for each item.
8. THE EmptyState component SHALL accept inputs for an icon identifier, a primary message, and an optional secondary message, and SHALL render the icon at a minimum size of 48px × 48px.
9. THE SearchBar component SHALL debounce keystroke events by 300 milliseconds before emitting a `search` output event, preventing excessive API calls during rapid typing.
10. THE FilterPanel component SHALL accept a filter configuration array defining filter fields, their types (dropdown, checkbox, date range), and their available options, and SHALL emit a `filterChange` output event containing all active filter criteria as a structured object.
11. THE TimelineComponent SHALL accept a `events` input array where each event contains a timestamp, an actor, an action label, and an optional description, and SHALL render events in chronological order with a vertical connecting line between entries.
12. FOR ALL Shared_Module components, applying the same input values twice SHALL produce an identical rendered output to applying them once, confirming that all shared components are pure and free of internal side effects that accumulate across renders (idempotence property).

### Requirement 27: Core Services

**User Story:** As a frontend developer, I want a complete set of application-wide core services in the Core_Module, including a Feature_Flag_Service and a Mock_Data_Service, so that cross-cutting concerns such as authentication, HTTP communication, notifications, theming, error handling, permissions, and mock data generation are handled uniformly and are independently unit-testable.

#### Acceptance Criteria

1. THE Core_Module SHALL provide the Auth_Service implementing the following public API: `login(credentials)`, `logout()`, `refreshToken()`, `isAuthenticated(): Signal<boolean>`, `currentUser(): Signal<User | null>`, and `hasRole(role: string): boolean`.
2. THE Core_Module SHALL provide an HTTP Interceptor that attaches the current JWT access token as a Bearer Authorization header to all outgoing requests targeting the backend API base URL, and that intercepts 401 responses to invoke the Auth_Service token refresh flow before retrying the failed request once.
3. THE Core_Module SHALL provide the API_Gateway_Service implementing typed wrapper methods for every backend REST endpoint, returning Observables or Promises conforming to the ResourceState_Pattern, so that no component or feature store calls `HttpClient` directly.
4. THE Core_Module SHALL provide the NotificationService implementing: `showToast(message, type, durationMs)`, `getNotifications(): Signal<Notification[]>`, `getUnreadCount(): Signal<number>`, `markAsRead(id)`, and `markAllAsRead()`.
5. THE Core_Module SHALL provide the Theme_Service implementing: `applyTheme(theme: 'light' | 'dark')`, `toggleTheme()`, `currentTheme(): Signal<'light' | 'dark'>`, and `loadPersistedTheme()` called on application initialization.
6. THE Core_Module SHALL provide the ErrorHandlerService that implements Angular's `ErrorHandler` interface, catching all uncaught application errors, logging them with a timestamp and stack trace, and displaying an ErrorAlert component to the user without crashing the application.
7. THE Core_Module SHALL provide the AuditLogService implementing: `getAuditLogs(filters): Observable<AuditLog[]>` and `exportAuditLogsCsv(filters): Observable<Blob>`, returning paginated and filterable audit log data from the backend.
8. THE Core_Module SHALL provide the Permission_Service implementing: `hasPermission(permission: string): boolean` and `canActivate(requiredPermissions: string[]): boolean`, deriving permission decisions from the current authenticated user's role and permission set stored in the Auth_Service Signal.
9. THE Permission_Service SHALL evaluate permissions synchronously from the in-memory Signal state without making HTTP calls, so that all UI visibility decisions are resolved without introducing asynchronous latency in component rendering.
10. THE Core_Module SHALL provide the Feature_Flag_Service implementing: `getReadinessLevel(featureName: string): FeatureReadinessLevel`, reading `environment.featureFlags` configuration on initialization and exposing all module readiness levels as a `Signal<Record<string, FeatureReadinessLevel>>`; the Feature_Flag_Service SHALL be the single source of truth for Data_Source_Strategy switching across all 19 feature modules.
11. THE Core_Module SHALL provide the Mock_Data_Service supplying shared random data generators — including names, IDs, timestamps, statuses, and numeric ranges — used across all feature Mock_Adapters to ensure consistent and realistic mock data generation throughout the application.
12. FOR ALL combinations of role and permission inputs to the Permission_Service `hasPermission` method, calling the method with the same role and permission input multiple times without an intervening login or role change SHALL return the same boolean result, confirming idempotent permission evaluation.

### Requirement 28: Routing Strategy

**User Story:** As a platform architect, I want the IDP_Frontend routing configuration to register all 19 lazy routes from Sprint 1, enforce authentication and RBAC without blocking any module based on readiness level, and handle graceful error page scenarios, so that navigation is secure, performant, and resilient to invalid or unauthorized route access.

#### Acceptance Criteria

1. THE Router SHALL register ALL 19 Lazy_Routes in the root router configuration from Sprint 1 using `loadComponent` or `loadChildren`, so that no Feature_Module bundle is included in the initial application payload and all routes are immediately navigable.
2. THE RBAC_Guard SHALL be applied to every authenticated route in the router configuration; THE RBAC_Guard SHALL evaluate the current user's role against the `data.requiredRole` annotation defined on each route before activating the route; THE RBAC_Guard SHALL NOT block any route based on the module's Feature_Readiness_Level.
3. No route SHALL be conditionally registered or omitted based on Feature_Readiness_Level — all 19 routes SHALL always be active in the router configuration regardless of the corresponding module's integration status.
4. WHEN an unauthenticated user navigates to any protected route, THE Router SHALL redirect the user to `/auth/login` and preserve the originally requested URL as a redirect parameter for post-login navigation.
5. WHEN an authenticated user navigates to `/auth/login`, THE Router SHALL redirect the user to the Dashboard (`/dashboard`) without rendering the login page.
6. THE Router configuration SHALL include a dedicated `/403` route rendering a 403 Forbidden page with a link back to the Dashboard, a dedicated `/404` route rendering a 404 Not Found page, and a wildcard route `**` that redirects to `/404`.
7. THE IDP_Frontend SHALL apply a Preloading_Strategy that eagerly preloads the Dashboard and Service_Catalog Lazy_Routes in the background after the initial application bundle has loaded, reducing perceived navigation latency for the most-accessed routes.
8. WHEN the RBAC_Guard denies access to a route due to insufficient role, THE Router SHALL navigate to `/403` without exposing the denied route's URL in the browser address bar.
9. WHEN post-login redirect is active, THE Router SHALL navigate the user to the originally requested URL after a successful login, consuming and discarding the redirect parameter from the URL.
10. THE Router SHALL apply route-level title resolution so that the browser tab title updates on every navigation event to reflect the current page name, formatted as `{Page Name} — IDP Platform`.
11. THE Router configuration SHALL support child routes for all modules that have list and detail pages, including at minimum: `/kubernetes/pods/:namespace`, `/kubernetes/deployments/:namespace`, `/kubernetes/nodes/:name`, `/containers/:id`, `/monitoring/alerts/:id`, `/incidents/:id`, `/deployments/:id`, `/provision-requests/:id`, and `/terraform/workspaces/:id`.
12. FOR ALL defined Lazy_Routes, the route's associated JavaScript bundle SHALL not be present in the initial network payload, verifiable by confirming the bundle file is absent from the initial page load's network requests and present only after the first navigation to that route.

### Requirement 29: Audit Log

**User Story:** As an administrator or compliance officer, I want to search, filter, and export the platform's audit log, so that I can review the history of all actions performed on the platform for operational and compliance purposes.

#### Acceptance Criteria

1. THE Admin_Console SHALL provide an Audit Log viewer page accessible to users with audit log read permission, displaying all audit log entries in a paginated DataTable with the following columns: Timestamp, Actor (user display name), Action, Target Entity Type, Target Entity ID, and IP Address.
2. THE Audit Log viewer SHALL provide a SearchBar that filters audit log entries by actor name or target entity ID, applying the filter within 300 milliseconds of the last keystroke.
3. THE Audit Log viewer SHALL provide a FilterPanel allowing the user to filter by Action type, by Target Entity Type, and by date range with a start date and end date picker.
4. WHEN the user applies one or more filters, THE Audit Log viewer SHALL dispatch a backend API request with the filter parameters and render the filtered results in the DataTable without a full page reload.
5. THE Audit Log viewer SHALL display audit log entries in reverse chronological order by default, with the most recent entry at the top.
6. WHEN a user clicks an audit log entry, THE Audit Log viewer SHALL expand an inline detail panel beneath the row showing the full action payload, the before-state, and the after-state of the affected entity where available from the backend.
7. THE Audit Log viewer SHALL provide an Export to CSV action in the PageHeader; WHEN clicked, THE IDP_Frontend SHALL call the AuditLogService `exportAuditLogsCsv` method with the currently active filter criteria and trigger a browser file download of the resulting CSV file.
8. THE Audit_Log data SHALL be displayed as read-only; THE Audit Log viewer SHALL not render any edit, delete, or modify actions on individual log entries.
9. IF the AuditLogService fetch call fails, THEN THE Audit Log viewer SHALL render the ErrorAlert component with a descriptive message and a retry button, without displaying partial or stale data.
10. FOR ALL CSV export operations, the exported CSV file SHALL contain exactly the same entries as the currently filtered and paginated DataTable view would show across all pages, confirming that the export applies the same filter criteria as the active view (export-filter consistency property).

### Requirement 30: Non-Functional Requirements

**User Story:** As a platform stakeholder, I want the IDP_Frontend to meet defined standards for performance, accessibility, security, scalability, testability, deployability, and maintainability — including zero-refactor module evolution from MOCK to LIVE — so that the platform is production-grade and fit for enterprise operation from the first release.

#### Acceptance Criteria

1. THE IDP_Frontend SHALL achieve an initial page load time of under 3 seconds on a standard broadband connection (25 Mbps download), measured from navigation start to the Dashboard's first meaningful paint with all KPI_Widget skeletons rendered.
2. THE IDP_Frontend SHALL conform to WCAG 2.1 AA across all pages, meeting at minimum the following success criteria: 1.4.3 (contrast ratio ≥ 4.5:1 for normal text), 1.4.4 (text resizable to 200% without loss of content), 2.1.1 (all functionality operable by keyboard), 2.4.3 (logical focus order), and 4.1.2 (all form inputs have programmatic labels).
3. THE IDP_Frontend SHALL not store JWT access tokens in localStorage in the production build; tokens SHALL be stored in secure in-memory state within the Auth_Service Signal store, with the refresh token optionally persisted in a secure, HttpOnly_Cookie mechanism coordinated with the backend.
4. THE IDP_Frontend SHALL support a minimum of 20 Feature_Modules registered as Lazy_Routes without measurable increase in the initial bundle size, router initialization time, or application bootstrap time attributable to the number of registered routes.
5. THE IDP_Frontend SHALL achieve a Lighthouse Performance score of 80 or above and a Lighthouse Accessibility score of 90 or above on the Dashboard page when measured in a production build.
6. THE IDP_Frontend SHALL produce a deployable Docker image using a multi-stage Dockerfile: a build stage using the official Node.js image to compile the Angular application, and a serve stage using the official Nginx image to serve the compiled static assets, resulting in a final image smaller than 150 MB.
7. THE IDP_Frontend SHALL include Kubernetes manifests under the `k8s/` directory defining at minimum a Deployment resource, a Service resource, a ConfigMap for Nginx configuration, and a HorizontalPodAutoscaler, all compatible with AKS deployment.
8. THE IDP_Frontend SHALL provide unit tests for all Core_Module services and all Shared_Module components, achievable with either Jest or Karma test runners without requiring a running backend, achieving a minimum branch coverage of 80% for tested units.
9. THE IDP_Frontend SHALL enforce zero tolerance for duplicated UI patterns: any UI pattern used in more than one feature module SHALL be extracted into a Shared_Module component before the implementing pull request is merged.
10. THE IDP_Frontend SHALL produce a TypeScript compilation with zero errors and zero warnings in strict mode (`strict: true`, `noImplicitAny: true`, `strictNullChecks: true`) on every production build, ensuring type safety is maintained throughout the codebase.
11. THE IDP_Frontend SHALL support switching any module from MOCK to PARTIAL to LIVE Feature_Readiness_Level by changing a single configuration flag in `environment.ts`, requiring no changes to any component, template, routing configuration, or store implementation.
12. THE IDP_Frontend SHALL display meaningful mock data for all 19 modules in a freshly cloned repository with no backend services running, enabling complete frontend development, UI review, and design iteration in full isolation from backend dependencies.

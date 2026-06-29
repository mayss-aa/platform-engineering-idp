import { UserRole } from './auth.models';

/**
 * Permission type — maps to the `action` field in the backend `permissions` table.
 *
 * Backend source: CustomUserDetailsService.java
 *   authorities.add(new SimpleGrantedAuthority(permission.getAction()));
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * DATABASE SEED STATUS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The backend does NOT contain any automatic seed mechanism:
 *   - No data.sql / import.sql
 *   - No CommandLineRunner / ApplicationRunner
 *   - No Flyway / Liquibase migrations
 *   - JPA is `ddl-auto=update` (creates tables only, no data)
 *
 * REQUIRED DATABASE SEED (must be inserted manually or via a future seeder):
 *
 * Table: roles
 *   INSERT INTO roles (name, description) VALUES
 *     ('ADMIN', 'Platform owner — unrestricted access'),
 *     ('PLATFORM_ENGINEER', 'Technical platform management'),
 *     ('DEVELOPER', 'Platform consumer — deploy code, request infra'),
 *     ('VIEWER', 'Read-only operational visibility'),
 *     ('AUDITOR', 'Compliance and security review');
 *
 * Table: permissions
 *   Each Permission value below must exist as a row with matching `action`.
 *
 * Table: role_permissions
 *   Many-to-many join matching the ROLE_PERMISSIONS matrix below.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PERMISSION CLASSIFICATION
 *
 * [BACKEND]     = Authority confirmed in existing @PreAuthorize annotations.
 *                 These are enforced server-side right now.
 *
 * [PLACEHOLDER] = Frontend-only authority for modules not yet implemented
 *                 in the backend. When those backend modules are developed,
 *                 these will be replaced by real Spring Security authorities
 *                 WITHOUT requiring frontend architectural changes — only
 *                 the Permission type values and ROLE_PERMISSIONS entries
 *                 need updating.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export type Permission =
  // ── [BACKEND] Deployments ─────────────────────────────────
  | 'CREATE_DEPLOYMENT'       // DeploymentController POST
  | 'VIEW_DEPLOYMENTS'        // DeploymentController GET
  | 'MANAGE_DEPLOYMENTS'      // DeploymentController PUT/DELETE/terraform
  // ── [BACKEND] Provision Requests ──────────────────────────
  | 'CREATE'                  // ProvisionRequestController POST
  | 'APPROVE_REQUEST'         // ProvisionRequestController approve/reject
  // ── [BACKEND] Service Catalog ─────────────────────────────
  | 'MANAGE_SERVICE_CATALOG'  // ServiceCatalogController CRUD
  // ── [BACKEND] Users ───────────────────────────────────────
  | 'MANAGE_USERS'            // UserController (class-level)
  // ── [BACKEND] Roles & Permissions ─────────────────────────
  | 'MANAGE_ROLES'            // RoleController + RolePermissionController (hasRole('ADMIN'))
  // ── [PLACEHOLDER] Notifications ───────────────────────────
  | 'VIEW_NOTIFICATIONS'      // Backend: any authenticated (no @PreAuthorize)
  // ── [PLACEHOLDER] Organizations ───────────────────────────
  | 'VIEW_ORGANIZATIONS'      // Backend: any authenticated (no @PreAuthorize)
  | 'MANAGE_ORGANIZATIONS'    // Future backend authority
  // ── [PLACEHOLDER] Teams ───────────────────────────────────
  | 'VIEW_TEAMS'              // Backend: any authenticated (no @PreAuthorize)
  | 'MANAGE_TEAMS'            // Future backend authority
  // ── [PLACEHOLDER] Audit Logs ──────────────────────────────
  | 'VIEW_AUDIT_LOGS'         // Backend: any authenticated (no @PreAuthorize)
  // ── [PLACEHOLDER] Monitoring ──────────────────────────────
  | 'VIEW_MONITORING'         // Future: Prometheus/Grafana integration
  | 'MANAGE_MONITORING'       // Future: alert rule management
  // ── [PLACEHOLDER] Incidents ───────────────────────────────
  | 'VIEW_INCIDENTS'          // Future: incidents backend module
  | 'MANAGE_INCIDENTS'        // Future: assign/resolve
  // ── [PLACEHOLDER] Terraform ───────────────────────────────
  | 'VIEW_TERRAFORM'          // Future: dedicated Terraform controller
  | 'MANAGE_TERRAFORM'        // Future: plan/apply/destroy
  // ── [PLACEHOLDER] Kubernetes ──────────────────────────────
  | 'VIEW_KUBERNETES'         // Future: K8s API integration
  | 'MANAGE_KUBERNETES'       // Future: exec/admin
  // ── [PLACEHOLDER] Containers ──────────────────────────────
  | 'VIEW_CONTAINERS'         // Future: Docker API integration
  | 'MANAGE_CONTAINERS'       // Future: start/stop
  // ── [PLACEHOLDER] Cloud Resources ─────────────────────────
  | 'VIEW_CLOUD_RESOURCES'    // Future: Azure API integration
  | 'MANAGE_CLOUD_RESOURCES'  // Future: resource management
  // ── [PLACEHOLDER] Infrastructure ──────────────────────────
  | 'VIEW_INFRASTRUCTURE'     // Future: infrastructure overview
  | 'MANAGE_INFRASTRUCTURE'   // Future: infrastructure provisioning
  // ── [PLACEHOLDER] CI/CD ───────────────────────────────────
  | 'VIEW_CICD'               // Future: GitHub Actions integration
  | 'MANAGE_CICD'             // Future: trigger/cancel pipelines
  // ── [PLACEHOLDER] GitOps ──────────────────────────────────
  | 'VIEW_GITOPS'             // Future: ArgoCD integration
  | 'MANAGE_GITOPS'           // Future: sync/rollback
  // ── [PLACEHOLDER] Recommendations ─────────────────────────
  | 'VIEW_RECOMMENDATIONS'    // Future: recommendation engine
  // ── [PLACEHOLDER] Settings ────────────────────────────────
  | 'MANAGE_SETTINGS'         // Future: platform config
  // ── [PLACEHOLDER] AI Assistant ────────────────────────────
  | 'VIEW_AI_ASSISTANT'       // Future: AI backend integration
  | 'USE_AI_ASSISTANT';       // Future: chat/query

/**
 * ROLE_PERMISSIONS — the SINGLE source of truth for frontend RBAC.
 *
 * This mirrors what should exist in the backend `role_permissions` join table.
 * All permission checks flow through: PermissionService → AuthStore → this matrix.
 *
 * When a new backend module adds @PreAuthorize annotations:
 * 1. Add the new authority string to the Permission type above
 * 2. Add it to the appropriate role arrays below
 * 3. The sidebar, guards, and directives automatically adapt — no other changes needed
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // All permissions — unrestricted platform owner
    'CREATE_DEPLOYMENT', 'VIEW_DEPLOYMENTS', 'MANAGE_DEPLOYMENTS',
    'CREATE', 'APPROVE_REQUEST',
    'MANAGE_SERVICE_CATALOG',
    'MANAGE_USERS', 'MANAGE_ROLES',
    'VIEW_NOTIFICATIONS',
    'VIEW_ORGANIZATIONS', 'MANAGE_ORGANIZATIONS',
    'VIEW_TEAMS', 'MANAGE_TEAMS',
    'VIEW_AUDIT_LOGS',
    'VIEW_MONITORING', 'MANAGE_MONITORING',
    'VIEW_INCIDENTS', 'MANAGE_INCIDENTS',
    'VIEW_TERRAFORM', 'MANAGE_TERRAFORM',
    'VIEW_KUBERNETES', 'MANAGE_KUBERNETES',
    'VIEW_CONTAINERS', 'MANAGE_CONTAINERS',
    'VIEW_CLOUD_RESOURCES', 'MANAGE_CLOUD_RESOURCES',
    'VIEW_INFRASTRUCTURE', 'MANAGE_INFRASTRUCTURE',
    'VIEW_CICD', 'MANAGE_CICD',
    'VIEW_GITOPS', 'MANAGE_GITOPS',
    'VIEW_RECOMMENDATIONS',
    'MANAGE_SETTINGS',
    'VIEW_AI_ASSISTANT', 'USE_AI_ASSISTANT',
  ],

  PLATFORM_ENGINEER: [
    // Technical platform — no user/security admin
    'CREATE_DEPLOYMENT', 'VIEW_DEPLOYMENTS', 'MANAGE_DEPLOYMENTS',
    'CREATE', 'APPROVE_REQUEST',
    'MANAGE_SERVICE_CATALOG',
    'VIEW_NOTIFICATIONS',
    'VIEW_MONITORING', 'MANAGE_MONITORING',
    'VIEW_INCIDENTS', 'MANAGE_INCIDENTS',
    'VIEW_TERRAFORM', 'MANAGE_TERRAFORM',
    'VIEW_KUBERNETES', 'MANAGE_KUBERNETES',
    'VIEW_CONTAINERS', 'MANAGE_CONTAINERS',
    'VIEW_CLOUD_RESOURCES', 'MANAGE_CLOUD_RESOURCES',
    'VIEW_INFRASTRUCTURE', 'MANAGE_INFRASTRUCTURE',
    'VIEW_CICD', 'MANAGE_CICD',
    'VIEW_GITOPS', 'MANAGE_GITOPS',
    'VIEW_RECOMMENDATIONS',
    'VIEW_AI_ASSISTANT', 'USE_AI_ASSISTANT',
  ],

  DEVELOPER: [
    // Consumes the platform — deploy, provision, view
    'CREATE_DEPLOYMENT', 'VIEW_DEPLOYMENTS',
    'CREATE',
    'VIEW_NOTIFICATIONS',
    'VIEW_CICD',
    'VIEW_GITOPS',
    'VIEW_RECOMMENDATIONS',
    'VIEW_AI_ASSISTANT', 'USE_AI_ASSISTANT',
  ],

  VIEWER: [
    // Read-only operational visibility
    'VIEW_DEPLOYMENTS',
    'VIEW_MONITORING',
    'VIEW_NOTIFICATIONS',
    'VIEW_RECOMMENDATIONS',
  ],

  AUDITOR: [
    // Compliance and security review
    'VIEW_AUDIT_LOGS',
    'VIEW_MONITORING',
    'VIEW_INCIDENTS',
    'VIEW_NOTIFICATIONS',
    'VIEW_ORGANIZATIONS',
    'VIEW_TEAMS',
    'MANAGE_USERS',
    'MANAGE_ROLES',
  ],
};

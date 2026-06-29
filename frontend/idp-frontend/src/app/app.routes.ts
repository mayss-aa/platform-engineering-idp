import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { rbacGuard } from './core/guards/rbac.guard';

/**
 * Root router configuration — ALL 23 feature routes registered from Sprint 1.
 *
 * Architecture (Requirements 28.1–28.12):
 * - Every feature route uses loadComponent (lazy-loaded, separate bundle).
 * - All authenticated routes wrapped with authGuard + rbacGuard.
 * - requiredPermissions annotation on each route via route data.
 * - Route-level title: "{Page Name} — IDP Platform".
 * - /auth/login is public; /403, /404 are standalone error pages.
 * - Wildcard ** → /404.
 * - No route is conditionally registered based on FeatureReadinessLevel.
 */
export const routes: Routes = [
  // ── Public routes ─────────────────────────────────────────
  {
    path: 'auth/login',
    loadComponent: () => import('./pages/auth/login.page').then((m) => m.LoginPageComponent),
    title: 'Sign In — IDP Platform',
  },

  // ── Error pages ───────────────────────────────────────────
  {
    path: '403',
    loadComponent: () => import('./pages/error/403.page').then((m) => m.ForbiddenPageComponent),
    title: '403 Forbidden — IDP Platform',
  },
  {
    path: '404',
    loadComponent: () => import('./pages/error/404.page').then((m) => m.NotFoundPageComponent),
    title: '404 Not Found — IDP Platform',
  },

  // ── Authenticated shell ───────────────────────────────────
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      // Default → Dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // 1 — Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: [] },
        title: 'Dashboard — IDP Platform',
      },

      // 2 — Service Catalog
      {
        path: 'service-catalog',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['CREATE'] },
        title: 'Service Catalog — IDP Platform',
      },

      // 3 — Provision Requests
      {
        path: 'provision-requests',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['CREATE'] },
        title: 'Provision Requests — IDP Platform',
      },

      // 4 — Deployments
      {
        path: 'deployments',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_DEPLOYMENTS'] },
        title: 'Deployments — IDP Platform',
      },

      // 5 — Terraform
      {
        path: 'terraform',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_TERRAFORM'] },
        title: 'Terraform — IDP Platform',
      },

      // 6 — CI/CD
      {
        path: 'cicd',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_DEPLOYMENTS'] },
        title: 'CI/CD — IDP Platform',
      },

      // 7 — GitOps
      {
        path: 'gitops',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_DEPLOYMENTS'] },
        title: 'GitOps — IDP Platform',
      },

      // 8 — Infrastructure
      {
        path: 'infrastructure',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_CLOUD_RESOURCES'] },
        title: 'Infrastructure — IDP Platform',
      },

      // 9 — Containers
      {
        path: 'containers',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_CONTAINERS'] },
        title: 'Containers — IDP Platform',
      },

      // 10 — Kubernetes
      {
        path: 'kubernetes',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_KUBERNETES'] },
        title: 'Kubernetes — IDP Platform',
      },

      // 11 — Cloud Resources
      {
        path: 'cloud-resources',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_CLOUD_RESOURCES'] },
        title: 'Cloud Resources — IDP Platform',
      },

      // 12 — Monitoring
      {
        path: 'monitoring',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_MONITORING'] },
        title: 'Monitoring — IDP Platform',
      },

      // 13 — Notifications
      {
        path: 'notifications',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: [] },
        title: 'Notifications — IDP Platform',
      },

      // 14 — Incidents
      {
        path: 'incidents',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_INCIDENTS'] },
        title: 'Incidents — IDP Platform',
      },

      // 15 — Recommendations
      {
        path: 'recommendations',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_RECOMMENDATIONS'] },
        title: 'Recommendations — IDP Platform',
      },

      // 16 — Organizations
      {
        path: 'organizations',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_ORGANIZATIONS'] },
        title: 'Organizations — IDP Platform',
      },

      // 17 — Teams
      {
        path: 'teams',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_TEAMS'] },
        title: 'Teams — IDP Platform',
      },

      // 18 — Users
      {
        path: 'users',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['MANAGE_USERS'] },
        title: 'Users — IDP Platform',
      },

      // 19 — Roles
      {
        path: 'roles',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['MANAGE_ROLES'] },
        title: 'Roles — IDP Platform',
      },

      // 20 — Permissions
      {
        path: 'permissions',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['MANAGE_ROLES'] },
        title: 'Permissions — IDP Platform',
      },

      // 21 — Audit Logs
      {
        path: 'audit-logs',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_AUDIT_LOGS'] },
        title: 'Audit Logs — IDP Platform',
      },

      // 22 — Settings
      {
        path: 'settings',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: [] },
        title: 'Settings — IDP Platform',
      },

      // 23 — AI Assistant
      {
        path: 'ai-assistant',
        loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePageComponent),
        canActivate: [rbacGuard],
        data: { requiredPermissions: ['VIEW_AI_ASSISTANT'] },
        title: 'AI Assistant — IDP Platform',
      },
    ],
  },

  // ── Wildcard → 404 ────────────────────────────────────────
  { path: '**', redirectTo: '404' },
];

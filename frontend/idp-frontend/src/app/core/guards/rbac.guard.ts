import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { Permission } from '../models/rbac.models';

/**
 * RbacGuard — functional CanActivateFn for role-based access control.
 *
 * Responsibilities (Requirements 3.9, 28.2, 28.3, 28.8):
 * - Evaluates `route.data['requiredPermissions']` using PermissionService.
 * - If empty array: allows any authenticated user (auth check already passed by authGuard).
 * - If user lacks required permissions: redirects to /403.
 * - NEVER blocks based on FeatureReadinessLevel (Requirement 28.2, 28.3).
 * - Does not expose the denied route URL in the browser address bar (Req 28.8).
 *
 * Usage in routes:
 * ```ts
 * {
 *   path: 'deployments',
 *   canActivate: [authGuard, rbacGuard],
 *   data: { requiredPermissions: ['deployments:read'] },
 *   loadChildren: () => import('./features/deployments/deployments.routes'),
 * }
 * ```
 */
export const rbacGuard: CanActivateFn = (route): boolean | UrlTree => {
  const permissionService = inject(PermissionService);
  const router = inject(Router);

  // Extract required permissions from route data
  const requiredPermissions: Permission[] =
    (route.data?.['requiredPermissions'] as Permission[]) ?? [];

  // Empty array means any authenticated user can access (no specific permission needed)
  if (requiredPermissions.length === 0) {
    return true;
  }

  // Evaluate against the current user's role-derived permissions
  if (permissionService.canActivate(requiredPermissions)) {
    return true;
  }

  // Insufficient permissions — redirect to 403 (Requirement 28.8)
  return router.createUrlTree(['/403']);
};

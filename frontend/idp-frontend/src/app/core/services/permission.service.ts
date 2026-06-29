import { Injectable, inject } from '@angular/core';
import { Permission, ROLE_PERMISSIONS } from '../models/rbac.models';
import { UserRole } from '../models/auth.models';
import { AuthStore } from '../stores/auth.store';

/**
 * PermissionService — synchronous, pure RBAC evaluation.
 *
 * Responsibilities (Requirements 27.8, 27.9, 27.12):
 * - All permission decisions are derived from AuthStore Signals.
 * - No HTTP calls — pure in-memory evaluation (synchronous).
 * - Calling hasPermission() with the same inputs always returns the same
 *   result within a session (idempotence property, Property 12).
 * - Used by RbacGuard (Task 7) and *idpHasPermission structural directive (Task 10).
 */
@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly authStore = inject(AuthStore);

  // ── Role checks ───────────────────────────────────────────

  /**
   * Returns true when the current user has exactly the given role.
   * Synchronous — reads AuthStore Signal.
   */
  hasRole(role: UserRole): boolean {
    return this.authStore.currentRole() === role;
  }

  /**
   * Returns true when the current user has any of the given roles.
   */
  hasAnyRole(roles: UserRole[]): boolean {
    const current = this.authStore.currentRole();
    if (!current) return false;
    return roles.includes(current);
  }

  // ── Permission checks (Requirement 27.8) ─────────────────

  /**
   * Returns true when the current user has the specified permission.
   * Derived from their role via the ROLE_PERMISSIONS matrix.
   * Pure and synchronous — no async latency in template rendering (Req 27.9).
   */
  hasPermission(permission: Permission): boolean {
    const permissions = this.authStore.permissions();
    return permissions.includes(permission);
  }

  /**
   * Returns true when the current user has at least one of the specified permissions.
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    if (permissions.length === 0) return true;
    const userPermissions = this.authStore.permissions();
    return permissions.some((p) => userPermissions.includes(p));
  }

  /**
   * Returns true only when the current user has ALL of the specified permissions.
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    if (permissions.length === 0) return true;
    const userPermissions = this.authStore.permissions();
    return permissions.every((p) => userPermissions.includes(p));
  }

  /**
   * Gate check used by RbacGuard.
   * Returns true when requiredPermissions is empty (authenticated-only route)
   * or when the user holds ALL required permissions.
   * Never evaluates FeatureReadinessLevel (Requirement 28.2).
   */
  canActivate(requiredPermissions: Permission[]): boolean {
    if (requiredPermissions.length === 0) {
      // Route only requires authentication, not a specific permission.
      return this.authStore.isAuthenticated();
    }
    if (!this.authStore.isAuthenticated()) return false;
    return this.hasAllPermissions(requiredPermissions);
  }

  // ── Full permission set for a role (used by Permission Matrix, Task 31) ──

  /**
   * Returns the complete set of permissions for a given role.
   * Does not depend on the current session — pure lookup.
   */
  getPermissionsForRole(role: UserRole): Permission[] {
    return ROLE_PERMISSIONS[role] ?? [];
  }

  /**
   * Returns the complete set of permissions for the currently authenticated user.
   * Equivalent to reading authStore.permissions() directly.
   */
  getCurrentPermissions(): Permission[] {
    return this.authStore.permissions();
  }
}

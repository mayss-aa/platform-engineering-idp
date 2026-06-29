import { TestBed } from '@angular/core/testing';
import { PermissionService } from './permission.service';
import { AuthStore } from '../stores/auth.store';
import { User, AuthTokens } from '../models/auth.models';

describe('PermissionService', () => {
  let service: PermissionService;
  let authStore: AuthStore;

  const tokens: AuthTokens = {
    accessToken: 'token',
    expiresAt: Date.now() + 3600000,
  };

  const adminUser: User = {
    id: 'usr-001', displayName: 'Admin', email: 'admin@test.com',
    role: 'ADMIN', organizationId: null, lastLogin: '',
  };

  const viewerUser: User = {
    id: 'usr-002', displayName: 'Viewer', email: 'viewer@test.com',
    role: 'VIEWER', organizationId: null, lastLogin: '',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionService);
    authStore = TestBed.inject(AuthStore);
  });

  it('should return false for all permissions when unauthenticated', () => {
    expect(service.hasPermission('VIEW_DEPLOYMENTS')).toBe(false);
    expect(service.hasRole('ADMIN')).toBe(false);
    expect(service.canActivate(['VIEW_DEPLOYMENTS'])).toBe(false);
  });

  it('should grant all permissions to ADMIN', () => {
    authStore.setAuthenticated(adminUser, tokens);
    expect(service.hasPermission('CREATE_DEPLOYMENT')).toBe(true);
    expect(service.hasPermission('MANAGE_USERS')).toBe(true);
    expect(service.hasPermission('MANAGE_KUBERNETES')).toBe(true);
    expect(service.hasPermission('VIEW_AUDIT_LOGS')).toBe(true);
  });

  it('should deny write permissions to VIEWER', () => {
    authStore.setAuthenticated(viewerUser, tokens);
    expect(service.hasPermission('VIEW_DEPLOYMENTS')).toBe(true);
    expect(service.hasPermission('CREATE_DEPLOYMENT')).toBe(false);
    expect(service.hasPermission('MANAGE_USERS')).toBe(false);
  });

  it('hasAnyPermission should return true if at least one matches', () => {
    authStore.setAuthenticated(viewerUser, tokens);
    expect(service.hasAnyPermission(['VIEW_DEPLOYMENTS', 'MANAGE_USERS'])).toBe(true);
  });

  it('hasAllPermissions should return false if one is missing', () => {
    authStore.setAuthenticated(viewerUser, tokens);
    expect(service.hasAllPermissions(['VIEW_DEPLOYMENTS', 'CREATE_DEPLOYMENT'])).toBe(false);
  });

  it('canActivate with empty array should pass for authenticated user', () => {
    authStore.setAuthenticated(viewerUser, tokens);
    expect(service.canActivate([])).toBe(true);
  });

  it('canActivate with empty array should fail for unauthenticated', () => {
    expect(service.canActivate([])).toBe(false);
  });

  it('hasPermission is idempotent (Property 12)', () => {
    authStore.setAuthenticated(adminUser, tokens);
    const result1 = service.hasPermission('VIEW_DEPLOYMENTS');
    const result2 = service.hasPermission('VIEW_DEPLOYMENTS');
    const result3 = service.hasPermission('VIEW_DEPLOYMENTS');
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });

  it('hasRole returns correct value', () => {
    authStore.setAuthenticated(adminUser, tokens);
    expect(service.hasRole('ADMIN')).toBe(true);
    expect(service.hasRole('VIEWER')).toBe(false);
  });

  it('getPermissionsForRole returns role permissions without auth', () => {
    const perms = service.getPermissionsForRole('DEVELOPER');
    expect(perms).toContain('VIEW_DEPLOYMENTS');
    expect(perms).toContain('CREATE_DEPLOYMENT');
    expect(perms).not.toContain('MANAGE_USERS');
  });
});

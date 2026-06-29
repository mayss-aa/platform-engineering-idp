import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { User, AuthTokens } from '../models/auth.models';

describe('AuthStore', () => {
  let store: AuthStore;

  const mockUser: User = {
    id: 'usr-001',
    displayName: 'Test Admin',
    email: 'admin@idp.internal',
    role: 'ADMIN',
    organizationId: 'org-001',
    lastLogin: '2025-01-15T10:00:00Z',
  };

  const mockTokens: AuthTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: Date.now() + 3600000,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AuthStore);
  });

  it('should start unauthenticated', () => {
    expect(store.user()).toBeNull();
    expect(store.tokens()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.currentRole()).toBeNull();
    expect(store.permissions()).toEqual([]);
  });

  it('should authenticate user and set tokens', () => {
    store.setAuthenticated(mockUser, mockTokens);

    expect(store.user()).toEqual(mockUser);
    expect(store.tokens()).toEqual(mockTokens);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentRole()).toBe('ADMIN');
    expect(store.permissions().length).toBeGreaterThan(0);
  });

  it('should clear session on logout', () => {
    store.setAuthenticated(mockUser, mockTokens);
    store.clearSession();

    expect(store.user()).toBeNull();
    expect(store.tokens()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('should update tokens without changing user', () => {
    store.setAuthenticated(mockUser, mockTokens);
    const newTokens: AuthTokens = {
      accessToken: 'new-access-token',
      expiresAt: Date.now() + 7200000,
    };
    store.updateTokens(newTokens);

    expect(store.tokens()).toEqual(newTokens);
    expect(store.user()).toEqual(mockUser);
  });

  it('should clear error when loading starts', () => {
    store.setError('Some error');
    expect(store.error()).toBe('Some error');

    store.setLoading(true);
    expect(store.error()).toBeNull();
    expect(store.loading()).toBe(true);
  });

  it('should detect token expiring soon', () => {
    const expiringTokens: AuthTokens = {
      accessToken: 'token',
      expiresAt: Date.now() + 30000, // 30s from now — within 60s threshold
    };
    store.setAuthenticated(mockUser, expiringTokens);
    expect(store.tokenExpiresSoon()).toBe(true);
  });

  it('should NOT detect token expiring soon when far from expiry', () => {
    store.setAuthenticated(mockUser, mockTokens); // 1hr from now
    expect(store.tokenExpiresSoon()).toBe(false);
  });

  it('should return ADMIN permissions for ADMIN role', () => {
    store.setAuthenticated(mockUser, mockTokens);
    expect(store.permissions()).toContain('CREATE_DEPLOYMENT');
    expect(store.permissions()).toContain('MANAGE_USERS');
    expect(store.permissions()).toContain('MANAGE_KUBERNETES');
  });
});

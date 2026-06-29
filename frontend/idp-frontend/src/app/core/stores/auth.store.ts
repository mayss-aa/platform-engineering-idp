import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/auth.models';
import { AuthTokens } from '../models/auth.models';
import { Permission, ROLE_PERMISSIONS } from '../models/rbac.models';

/**
 * AuthStore — Core Signal store for authentication state.
 *
 * Design rules (Requirements 25.1, 25.5, 25.8, 25.9):
 * - All state is held in Signals; no RxJS Subjects.
 * - Access token is kept in-memory only — never written to localStorage.
 * - Refresh token is managed externally (sessionStorage / HttpOnly cookie);
 *   only its existence is tracked here.
 * - All Signal writes go through explicit store methods; never mutated from templates.
 * - providedIn: 'root' makes the store a singleton for the entire application.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  // ── Private writable signals ──────────────────────────────
  private readonly _user = signal<User | null>(null);
  private readonly _tokens = signal<AuthTokens | null>(null);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // ── Public readonly signals ───────────────────────────────

  /** Currently authenticated user, or null when logged out. */
  readonly user = this._user.asReadonly();

  /**
   * JWT tokens (in-memory only).
   * accessToken is NEVER written to localStorage or sessionStorage.
   */
  readonly tokens = this._tokens.asReadonly();

  /** True while an auth operation (login / refresh) is in flight. */
  readonly loading = this._loading.asReadonly();

  /** Last auth error message, or null. */
  readonly error = this._error.asReadonly();

  // ── Computed signals ──────────────────────────────────────

  /** True when a user is present in the store (token validity is checked by the interceptor). */
  readonly isAuthenticated = computed(() => this._user() !== null && this._tokens() !== null);

  /** The current user's role, or null when unauthenticated. */
  readonly currentRole = computed(() => this._user()?.role ?? null);

  /** All permissions granted to the current user based on their role. */
  readonly permissions = computed<Permission[]>(() => {
    const role = this._user()?.role;
    if (!role) return [];
    return ROLE_PERMISSIONS[role] ?? [];
  });

  /**
   * True when the access token is within 60 seconds of expiry.
   * Used by the JWT interceptor for proactive refresh (Requirement 3.3).
   */
  readonly tokenExpiresSoon = computed(() => {
    const tokens = this._tokens();
    if (!tokens) return false;
    const nowMs = Date.now();
    const expiresAt = tokens.expiresAt; // Unix timestamp in ms
    return expiresAt - nowMs < 60_000;
  });

  // ── Mutation methods ──────────────────────────────────────

  /**
   * Called by AuthService after a successful login response.
   * Sets user and tokens atomically.
   */
  setAuthenticated(user: User, tokens: AuthTokens): void {
    this._error.set(null);
    this._user.set(user);
    this._tokens.set(tokens);
    this._loading.set(false);
  }

  /**
   * Called by AuthService when a token refresh succeeds.
   * Replaces tokens without touching the user object.
   */
  updateTokens(tokens: AuthTokens): void {
    this._tokens.set(tokens);
  }

  /**
   * Called by AuthService on logout or session expiry.
   * Clears all auth state atomically.
   */
  clearSession(): void {
    this._user.set(null);
    this._tokens.set(null);
    this._error.set(null);
    this._loading.set(false);
  }

  /** Signals that an auth operation has started. */
  setLoading(loading: boolean): void {
    this._loading.set(loading);
    if (loading) {
      // Clear error when a new attempt begins (Requirement 25.12)
      this._error.set(null);
    }
  }

  /** Records an auth error (wrong credentials, network failure, etc.). */
  setError(message: string): void {
    this._error.set(message);
    this._loading.set(false);
  }
}

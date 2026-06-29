import { Injectable, inject, Signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError, timer } from 'rxjs';
import { delay, tap, catchError, switchMap } from 'rxjs/operators';
import { User, UserRole, AuthTokens } from '../models/auth.models';
import { AuthStore } from '../stores/auth.store';

/** Credentials submitted on the login form. */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/** Shape returned by the backend /auth/login endpoint. */
export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number; // seconds until access token expires
}

// ─── Refresh-token storage keys (never used for access tokens) ──────────────
const RT_SESSION_KEY = 'idp_rt'; // sessionStorage — no remember-me
// remember-me refresh token is handled via HttpOnly cookie by the backend.
// We only store a flag here so AuthService knows one exists.
const RT_REMEMBER_FLAG = 'idp_rt_remember';

// ─── Mock user fixtures ──────────────────────────────────────────────────────
// Used only while the backend is not yet available (Feature_Readiness_Level MOCK).
// Real credentials are validated against the backend in LIVE mode.
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'admin@idp.internal': {
    password: 'admin123',
    user: {
      id: 'usr-001',
      displayName: 'Admin Engineer',
      email: 'admin@idp.internal',
      role: 'ADMIN' as UserRole,
      organizationId: 'org-001',
      lastLogin: new Date().toISOString(),
    },
  },
  'platform@idp.internal': {
    password: 'platform123',
    user: {
      id: 'usr-002',
      displayName: 'Platform Engineer',
      email: 'platform@idp.internal',
      role: 'PLATFORM_ENGINEER' as UserRole,
      organizationId: 'org-001',
      lastLogin: new Date().toISOString(),
    },
  },
  'dev@idp.internal': {
    password: 'dev123',
    user: {
      id: 'usr-003',
      displayName: 'Developer User',
      email: 'dev@idp.internal',
      role: 'DEVELOPER' as UserRole,
      organizationId: 'org-001',
      lastLogin: new Date().toISOString(),
    },
  },
  'viewer@idp.internal': {
    password: 'viewer123',
    user: {
      id: 'usr-004',
      displayName: 'Viewer User',
      email: 'viewer@idp.internal',
      role: 'VIEWER' as UserRole,
      organizationId: 'org-001',
      lastLogin: new Date().toISOString(),
    },
  },
  'auditor@idp.internal': {
    password: 'auditor123',
    user: {
      id: 'usr-005',
      displayName: 'Auditor User',
      email: 'auditor@idp.internal',
      role: 'AUDITOR' as UserRole,
      organizationId: 'org-001',
      lastLogin: new Date().toISOString(),
    },
  },
};

/**
 * AuthService — manages authentication lifecycle.
 *
 * Responsibilities (Requirement 27.1):
 * - login() / logout() / refreshToken()
 * - Stores access token in-memory via AuthStore (never localStorage)
 * - Refresh token → sessionStorage (no remember-me) or HttpOnly cookie (remember-me)
 * - Exposes isAuthenticated() and currentUser() as Signal accessors
 * - No JWT value ever appears in URL, query params, or console logs (Req 3.11)
 *
 * In MOCK mode: validates credentials against the in-memory fixture table above.
 * In LIVE mode (Task 6 HTTP interceptor wired): delegates to ApiGatewayService.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  // ── Public Signal accessors (Requirement 27.1) ────────────────────────────

  /** Signal: currently authenticated user. */
  currentUser(): Signal<User | null> {
    return this.authStore.user;
  }

  /** Signal: true when a valid session exists in the store. */
  isAuthenticated(): Signal<boolean> {
    return this.authStore.isAuthenticated;
  }

  /** Synchronous snapshot of authentication status. */
  isAuthenticatedSnapshot(): boolean {
    return this.authStore.isAuthenticated();
  }

  /** Synchronous check of the current user's role. */
  hasRole(role: UserRole): boolean {
    return this.authStore.currentRole() === role;
  }

  // ── Login (Requirement 3.1, 3.2) ─────────────────────────────────────────

  /**
   * Authenticate with email + password.
   * In MOCK mode validates against the fixture table with a 400ms simulated delay.
   * On success: populates AuthStore and persists refresh token appropriately.
   * On failure: sets error on AuthStore without navigating.
   */
  login(credentials: LoginCredentials): Observable<User> {
    this.authStore.setLoading(true);
    return this._mockLogin(credentials).pipe(
      tap((response) => {
        const tokens: AuthTokens = {
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          expiresAt: Date.now() + response.expiresIn * 1000,
        };
        this.authStore.setAuthenticated(response.user, tokens);
        this._persistRefreshToken(response.refreshToken, credentials.rememberMe ?? false);
      }),
      switchMap((response) => of(response.user)),
      catchError((err: Error) => {
        this.authStore.setError(err.message);
        return throwError(() => err);
      }),
    );
  }

  // ── Logout (Requirement 3.6) ──────────────────────────────────────────────

  /**
   * Terminate the session.
   * Clears AuthStore, removes stored refresh token, and navigates to /auth/login.
   * In LIVE mode this would also call the backend logout endpoint.
   */
  logout(): void {
    this._clearRefreshToken();
    this.authStore.clearSession();
    // Navigate without exposing any token in the URL (Requirement 3.11)
    this.router.navigate(['/auth/login']);
  }

  // ── Token refresh (Requirement 3.3) ──────────────────────────────────────

  /**
   * Proactively refresh the access token.
   * Called by the JWT interceptor (Task 6) when tokenExpiresSoon is true.
   * In MOCK mode: issues a new mock token without a network call.
   */
  refreshToken(): Observable<AuthTokens> {
    const refreshToken = this._loadRefreshToken();
    if (!refreshToken) {
      this.authStore.clearSession();
      this.router.navigate(['/auth/login']);
      return throwError(() => new Error('No refresh token available.'));
    }
    return this._mockRefresh(refreshToken).pipe(
      tap((tokens) => {
        this.authStore.updateTokens(tokens);
      }),
      catchError((err: Error) => {
        // Refresh failed — clear session (Requirement 3.4)
        this._clearRefreshToken();
        this.authStore.clearSession();
        this.router.navigate(['/auth/login']);
        return throwError(() => err);
      }),
    );
  }

  // ── Session restoration ───────────────────────────────────────────────────

  /**
   * Attempt to restore a session from a persisted refresh token on app init.
   * Called in APP_INITIALIZER (Task 6 / Task 12).
   * Returns true when a session was successfully restored.
   */
  tryRestoreSession(): Observable<boolean> {
    const refreshToken = this._loadRefreshToken();
    if (!refreshToken) return of(false);
    return this.refreshToken().pipe(
      switchMap(() => of(true)),
      catchError(() => of(false)),
    );
  }

  // ── Private: mock implementations ────────────────────────────────────────

  private _mockLogin(credentials: LoginCredentials): Observable<LoginResponse> {
    const fixture = MOCK_USERS[credentials.email.toLowerCase()];
    if (!fixture || fixture.password !== credentials.password) {
      return timer(400).pipe(
        switchMap(() => throwError(() => new Error('Invalid email or password.'))),
      );
    }
    const response: LoginResponse = {
      user: { ...fixture.user, lastLogin: new Date().toISOString() },
      accessToken: `mock-access-${Date.now()}`,
      refreshToken: `mock-refresh-${Date.now()}`,
      expiresIn: 3600, // 1 hour
    };
    return of(response).pipe(delay(400));
  }

  private _mockRefresh(_refreshToken: string): Observable<AuthTokens> {
    const tokens: AuthTokens = {
      accessToken: `mock-access-${Date.now()}`,
      expiresAt: Date.now() + 3600 * 1000,
    };
    return of(tokens).pipe(delay(200));
  }

  // ── Private: refresh token persistence (Requirement 3.5) ─────────────────

  private _persistRefreshToken(refreshToken: string | undefined, rememberMe: boolean): void {
    if (!refreshToken) return;
    if (rememberMe) {
      // Signal to the app that a remember-me session is active.
      // Actual token storage is via HttpOnly cookie set by the backend.
      localStorage.setItem(RT_REMEMBER_FLAG, '1');
    } else {
      sessionStorage.setItem(RT_SESSION_KEY, refreshToken);
    }
  }

  private _loadRefreshToken(): string | null {
    // Check sessionStorage first (no remember-me)
    const session = sessionStorage.getItem(RT_SESSION_KEY);
    if (session) return session;
    // Check remember-me flag (actual token comes from HttpOnly cookie)
    const rememberFlag = localStorage.getItem(RT_REMEMBER_FLAG);
    if (rememberFlag) return 'cookie-backed'; // backend reads from cookie
    return null;
  }

  private _clearRefreshToken(): void {
    sessionStorage.removeItem(RT_SESSION_KEY);
    localStorage.removeItem(RT_REMEMBER_FLAG);
  }
}

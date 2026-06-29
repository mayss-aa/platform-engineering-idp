import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthStore } from '../stores/auth.store';

/**
 * AuthGuard — functional CanActivateFn (Angular 20 best practice).
 *
 * Responsibilities (Requirements 28.4, 3.9):
 * - Blocks unauthenticated users from protected routes.
 * - Redirects to /auth/login with a `redirect` query param preserving
 *   the originally requested URL for post-login navigation (Req 28.9).
 * - Never blocks based on FeatureReadinessLevel.
 * - Reads AuthStore Signals synchronously — no async latency.
 */
export const authGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated()) {
    return true;
  }

  // Preserve original URL for redirect after login (Requirement 28.4, 28.9)
  return router.createUrlTree(['/auth/login'], {
    queryParams: { redirect: state.url },
  });
};

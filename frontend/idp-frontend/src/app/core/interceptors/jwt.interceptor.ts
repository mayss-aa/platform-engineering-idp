import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthStore } from '../stores/auth.store';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Tracks whether a token refresh is already in flight to prevent
 * multiple concurrent refresh attempts when several 401s arrive simultaneously.
 */
let isRefreshing = false;
const refreshSubject$ = new BehaviorSubject<boolean>(false);

/**
 * JWT Interceptor — functional interceptor (Angular 20 best practice).
 *
 * Responsibilities (Requirements 3.3, 3.4, 3.7, 27.2):
 * 1. Attach Bearer token to all requests targeting the API base URL.
 * 2. Proactively refresh when token is within 60s of expiry.
 * 3. On 401: attempt one token refresh, then retry the original request.
 *    If the refresh also fails → clear session, redirect to /auth/login.
 * 4. On 403: navigate to /403 without clearing session (Req 3.8).
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  const authStore = inject(AuthStore);
  const authService = inject(AuthService);
  const router = inject(Router);

  // Only attach token to requests targeting our API
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const tokens = authStore.tokens();

  // Proactive refresh if token is close to expiry (Requirement 3.3)
  if (tokens && authStore.tokenExpiresSoon() && !isRefreshing) {
    isRefreshing = true;
    refreshSubject$.next(false);
    authService.refreshToken().subscribe({
      next: () => {
        isRefreshing = false;
        refreshSubject$.next(true);
      },
      error: () => {
        isRefreshing = false;
        refreshSubject$.next(true);
      },
    });
  }

  // Attach Bearer token
  const authedReq = tokens
    ? req.clone({ setHeaders: { Authorization: `Bearer ${tokens.accessToken}` } })
    : req;

  return next(authedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401(authedReq, next, authService, authStore, router);
      }
      if (error.status === 403) {
        // Navigate to /403 without clearing session (Requirement 3.8)
        router.navigate(['/403']);
        return EMPTY;
      }
      return throwError(() => error);
    }),
  );
};

/**
 * Handle 401 — attempt one refresh then retry.
 * If refresh fails → clear session and redirect (Requirement 3.7).
 */
function handle401(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  authStore: AuthStore,
  router: Router,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject$.next(false);

    return authService.refreshToken().pipe(
      switchMap(() => {
        isRefreshing = false;
        refreshSubject$.next(true);
        const newTokens = authStore.tokens();
        const retryReq = newTokens
          ? req.clone({ setHeaders: { Authorization: `Bearer ${newTokens.accessToken}` } })
          : req;
        return next(retryReq);
      }),
      catchError(() => {
        isRefreshing = false;
        refreshSubject$.next(true);
        authService.logout();
        return EMPTY;
      }),
    );
  }

  // Another refresh is already in flight — wait for it, then retry
  return refreshSubject$.pipe(
    filter((done) => done),
    take(1),
    switchMap(() => {
      const newTokens = authStore.tokens();
      if (!newTokens) {
        router.navigate(['/auth/login']);
        return EMPTY;
      }
      const retryReq = req.clone({
        setHeaders: { Authorization: `Bearer ${newTokens.accessToken}` },
      });
      return next(retryReq);
    }),
  );
}

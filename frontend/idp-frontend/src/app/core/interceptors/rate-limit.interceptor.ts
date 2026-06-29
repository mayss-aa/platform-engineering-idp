import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Rate-Limit Interceptor — exponential backoff on HTTP 429.
 *
 * Strategy (Requirement implied by enterprise resilience):
 * - On 429 Too Many Requests: retry up to 3 times with exponential backoff.
 * - Delays: 1s → 2s → 4s.
 * - After 3 retries, propagate the error to the caller.
 */
export const rateLimitInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    retry({
      count: 3,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        if (error.status === 429) {
          const backoffMs = Math.pow(2, retryCount - 1) * 1000; // 1s, 2s, 4s
          return timer(backoffMs);
        }
        // Not a 429 — do not retry, propagate immediately
        return throwError(() => error);
      },
    }),
    catchError((error: HttpErrorResponse) => {
      return throwError(() => error);
    }),
  );
};

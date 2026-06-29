import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { NotificationService } from './notification.service';

/**
 * GlobalErrorHandlerService — Angular ErrorHandler implementation.
 *
 * Responsibilities (Requirement 27.6):
 * - Catches all uncaught application errors.
 * - Logs with timestamp and stack trace (development mode).
 * - Displays an ERROR toast for 8 seconds.
 * - Does not crash the application.
 *
 * Registered as the Angular ErrorHandler provider in AppModule (Task 12/38.7).
 */
@Injectable({ providedIn: 'root' })
export class GlobalErrorHandlerService implements ErrorHandler {
  private readonly ngZone = inject(NgZone);
  private readonly notificationService = inject(NotificationService);

  handleError(error: unknown): void {
    // Extract a meaningful message
    const message = this._extractMessage(error);
    const timestamp = new Date().toISOString();

    // Log to console with timestamp and stack (never exposes JWT)
    // eslint-disable-next-line no-console
    console.error(`[IDP Error ${timestamp}]`, error);

    // Show toast — run inside NgZone to ensure change detection picks it up
    this.ngZone.run(() => {
      this.notificationService.showToast({
        message: message || 'An unexpected error occurred.',
        type: 'ERROR',
        durationMs: 8000,
      });
    });
  }

  private _extractMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;
    if (error && typeof error === 'object' && 'message' in error) {
      return String((error as { message: unknown }).message);
    }
    return 'An unexpected error occurred.';
  }
}

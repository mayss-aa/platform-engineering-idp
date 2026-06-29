import { Injectable, inject, OnDestroy, NgZone } from '@angular/core';
import { AuthService } from './auth.service';
import { AuthStore } from '../stores/auth.store';
import { NotificationService } from './notification.service';

/** Default session configuration. */
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;      // 30 minutes
const WARNING_BEFORE_MS = 2 * 60 * 1000;     // 2 minutes before expiry
const CHECK_INTERVAL_MS = 30 * 1000;          // check every 30 seconds

/** Activity events that reset the idle timer. */
const ACTIVITY_EVENTS: string[] = [
  'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click',
];

/**
 * SessionTimeoutService — enforces idle session timeout.
 *
 * Responsibilities (Task 6 spec):
 * - 30-minute idle timeout.
 * - 2-minute warning banner before logout.
 * - Calls AuthService.logout() on expiry.
 * - Resets timer on user activity.
 *
 * Started from APP_INITIALIZER or AppComponent.ngOnInit() (Task 12).
 */
@Injectable({ providedIn: 'root' })
export class SessionTimeoutService implements OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly authStore = inject(AuthStore);
  private readonly notificationService = inject(NotificationService);
  private readonly ngZone = inject(NgZone);

  private lastActivityTimestamp = Date.now();
  private checkIntervalId: ReturnType<typeof setInterval> | null = null;
  private warningShown = false;
  private started = false;

  /** Start monitoring idle time. Call once after successful login. */
  start(): void {
    if (this.started) return;
    this.started = true;
    this.lastActivityTimestamp = Date.now();
    this.warningShown = false;

    // Listen for user activity — outside NgZone to avoid triggering change detection
    this.ngZone.runOutsideAngular(() => {
      ACTIVITY_EVENTS.forEach((event) => {
        document.addEventListener(event, this._onActivity, { passive: true });
      });

      this.checkIntervalId = setInterval(() => this._check(), CHECK_INTERVAL_MS);
    });
  }

  /** Stop monitoring (on logout or service destroy). */
  stop(): void {
    this.started = false;
    this.warningShown = false;
    if (this.checkIntervalId !== null) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
    ACTIVITY_EVENTS.forEach((event) => {
      document.removeEventListener(event, this._onActivity);
    });
  }

  ngOnDestroy(): void {
    this.stop();
  }

  // ── Private ───────────────────────────────────────────────

  private readonly _onActivity = (): void => {
    this.lastActivityTimestamp = Date.now();
    if (this.warningShown) {
      this.warningShown = false;
    }
  };

  private _check(): void {
    // Only enforce timeout when authenticated
    if (!this.authStore.isAuthenticated()) return;

    const elapsed = Date.now() - this.lastActivityTimestamp;
    const remaining = IDLE_TIMEOUT_MS - elapsed;

    if (remaining <= 0) {
      // Session expired — logout
      this.ngZone.run(() => {
        this.notificationService.showToast({
          message: 'Session expired due to inactivity. Please sign in again.',
          type: 'WARNING',
          durationMs: 8000,
        });
        this.authService.logout();
        this.stop();
      });
      return;
    }

    if (remaining <= WARNING_BEFORE_MS && !this.warningShown) {
      // Show 2-minute warning
      this.warningShown = true;
      this.ngZone.run(() => {
        this.notificationService.showToast({
          message: 'Your session will expire in 2 minutes due to inactivity.',
          type: 'WARNING',
          durationMs: 10000,
        });
      });
    }
  }
}

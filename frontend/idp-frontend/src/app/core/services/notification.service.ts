import { Injectable, inject, Signal, signal, computed } from '@angular/core';
import { Notification, NotificationType } from '../models/notification.models';
import { NotificationCountStore } from '../stores/notification-count.store';

/** Configuration for a toast message. */
export interface ToastConfig {
  message: string;
  type: NotificationType;
  durationMs?: number; // default 5000; ERROR type uses 8000
}

/** Shape of a currently visible toast. */
export interface ActiveToast {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
}

/**
 * NotificationService — manages in-app notifications and toasts.
 *
 * Responsibilities (Requirement 27.4):
 * - showToast(message, type, durationMs)
 * - getNotifications(): Signal<Notification[]>
 * - getUnreadCount(): Signal<number>
 * - markAsRead(id)
 * - markAllAsRead()
 *
 * In MOCK mode: notifications are held in memory.
 * In LIVE mode (future): delegates to backend polling + WebSocket.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly countStore = inject(NotificationCountStore);

  // ── Notification list (in-memory for now) ─────────────────
  private readonly _notifications = signal<Notification[]>([]);
  private readonly _toasts = signal<ActiveToast[]>([]);

  // ── Public Signals ────────────────────────────────────────

  /** All notifications (newest first). */
  getNotifications(): Signal<Notification[]> {
    return this._notifications.asReadonly();
  }

  /** Unread count — delegates to NotificationCountStore. */
  getUnreadCount(): Signal<number> {
    return this.countStore.unreadCount;
  }

  /** Active toasts currently on screen. */
  readonly activeToasts: Signal<ActiveToast[]> = this._toasts.asReadonly();

  /** True when there are visible toasts. */
  readonly hasToasts = computed(() => this._toasts().length > 0);

  // ── Toast management ──────────────────────────────────────

  /**
   * Show a toast notification overlay.
   * ERROR-type toasts display for 8 seconds (Requirement 15.8, 27.6).
   * All others display for 5 seconds by default.
   */
  showToast(config: ToastConfig): void {
    const duration = config.durationMs ?? (config.type === 'ERROR' ? 8000 : 5000);
    const toast: ActiveToast = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      message: config.message,
      type: config.type,
      timestamp: Date.now(),
    };
    this._toasts.update((list) => [...list, toast]);

    // Auto-dismiss after duration
    setTimeout(() => {
      this._toasts.update((list) => list.filter((t) => t.id !== toast.id));
    }, duration);
  }

  // ── Notification CRUD ─────────────────────────────────────

  /**
   * Add a new notification (simulates receiving from backend/WebSocket).
   * Prepends to list and increments unread count.
   */
  addNotification(notification: Notification): void {
    this._notifications.update((list) => [notification, ...list]);
    this.countStore.addNotification();

    // If ERROR type, also show a toast (Requirement 15.8)
    if (notification.type === 'ERROR') {
      this.showToast({ message: notification.message, type: 'ERROR' });
    }
  }

  /**
   * Mark a single notification as read (Requirement 15.5).
   * Updates the list and decrements the unread count.
   */
  markAsRead(notificationId: string): void {
    this._notifications.update((list) =>
      list.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );
    this.countStore.markOneRead();
  }

  /**
   * Mark all notifications as read (Requirement 15.6).
   * Updates the list and sets unread count to zero.
   */
  markAllAsRead(): void {
    this._notifications.update((list) => list.map((n) => ({ ...n, read: true })));
    this.countStore.markAllRead();
  }

  /**
   * Remove a notification from the list entirely.
   */
  removeNotification(notificationId: string): void {
    const notification = this._notifications().find((n) => n.id === notificationId);
    this._notifications.update((list) => list.filter((n) => n.id !== notificationId));
    if (notification && !notification.read) {
      this.countStore.markOneRead();
    }
  }

  /**
   * Set notifications from a bulk fetch (polling response).
   * Replaces the entire list and syncs counts.
   */
  setNotifications(notifications: Notification[]): void {
    this._notifications.set(notifications);
    const unread = notifications.filter((n) => !n.read).length;
    this.countStore.setCounts(notifications.length, unread);
  }

  /**
   * Dismiss a toast manually before its auto-dismiss timer.
   */
  dismissToast(toastId: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== toastId));
  }
}

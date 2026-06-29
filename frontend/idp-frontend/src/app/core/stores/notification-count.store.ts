import { Injectable, signal, computed } from '@angular/core';

/**
 * NotificationCountStore — Core Signal store for the unread notification badge.
 *
 * Design rules (Requirements 15.3, 15.5, 15.6, 15.10, 27.4):
 * - Tracks only the unread count and total count as lightweight scalars.
 * - The full notification list is owned by NotificationStore (Task 6's
 *   NotificationService). This store is intentionally lightweight so the
 *   TopNav badge can inject it without pulling in the full notification module.
 * - Invariant: unreadCount is always >= 0 and <= totalCount (Requirement 15.10).
 */
@Injectable({ providedIn: 'root' })
export class NotificationCountStore {
  // ── Private writable signals ──────────────────────────────
  private readonly _unreadCount = signal<number>(0);
  private readonly _totalCount = signal<number>(0);

  // ── Public readonly signals ───────────────────────────────

  /** Number of unread notifications — drives the TopNav bell badge. */
  readonly unreadCount = this._unreadCount.asReadonly();

  /** Total notification count (read + unread). */
  readonly totalCount = this._totalCount.asReadonly();

  // ── Computed signals ──────────────────────────────────────

  /** True when there is at least one unread notification. */
  readonly hasUnread = computed(() => this._unreadCount() > 0);

  /**
   * Clamped badge label: shows the raw count, or '99+' when over 99
   * to prevent layout overflow in the badge chip.
   */
  readonly badgeLabel = computed(() => {
    const count = this._unreadCount();
    if (count <= 0) return '';
    if (count > 99) return '99+';
    return String(count);
  });

  // ── Mutation methods ──────────────────────────────────────

  /**
   * Set counts after a notification poll response.
   * Enforces the invariant: unread cannot exceed total.
   */
  setCounts(total: number, unread: number): void {
    const safeTotalCount = Math.max(0, total);
    const safeUnread = Math.min(Math.max(0, unread), safeTotalCount);
    this._totalCount.set(safeTotalCount);
    this._unreadCount.set(safeUnread);
  }

  /**
   * Decrement unread count by 1 when a single notification is marked as read
   * (Requirement 15.5). Guards against going below zero.
   */
  markOneRead(): void {
    this._unreadCount.update((n) => Math.max(0, n - 1));
  }

  /**
   * Set unread count to zero when "Mark all as read" is confirmed
   * (Requirement 15.6).
   */
  markAllRead(): void {
    this._unreadCount.set(0);
  }

  /**
   * Increment both counts when a new notification arrives in real time
   * (Requirement 15.3, 15.9).
   */
  addNotification(): void {
    this._totalCount.update((n) => n + 1);
    this._unreadCount.update((n) => n + 1);
  }

  /** Reset to zero — called on logout to clear the badge. */
  reset(): void {
    this._unreadCount.set(0);
    this._totalCount.set(0);
  }
}

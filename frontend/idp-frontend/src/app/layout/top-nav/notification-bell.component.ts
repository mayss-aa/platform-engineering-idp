import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { NotificationCountStore } from '../../core/stores/notification-count.store';

/**
 * NotificationBellComponent — bell icon with unread badge + overlay panel.
 *
 * Opens the notification center as an overlay without navigating (Req 4.13, 15.1).
 */
@Component({
  selector: 'idp-notification-bell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="notif-bell">
      <button
        class="notif-bell__btn"
        type="button"
        (click)="panelOpen.set(!panelOpen())"
        [attr.aria-expanded]="panelOpen()"
        aria-haspopup="true"
        [attr.aria-label]="'Notifications — ' + countStore.badgeLabel() + ' unread'"
      >
        <svg class="notif-bell__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 2a6 6 0 0 0-6 6v2.586l-.707.707A1 1 0 0 0 4 13h12a1 1 0 0 0 .707-1.707L16 10.586V8a6 6 0 0 0-6-6Zm0 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2Z"/>
        </svg>
        @if (countStore.hasUnread()) {
          <span class="notif-bell__badge" aria-hidden="true">{{ countStore.badgeLabel() }}</span>
        }
      </button>

      @if (panelOpen()) {
        <div class="notif-bell__panel" role="dialog" aria-label="Notifications panel">
          <div class="notif-bell__panel-header">
            <span class="notif-bell__panel-title">Notifications</span>
            <button class="notif-bell__mark-all" type="button" aria-label="Mark all as read">
              Mark all read
            </button>
          </div>
          <div class="notif-bell__panel-body">
            <p class="notif-bell__empty">No notifications yet.</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-flex; }

    .notif-bell { position: relative; }

    .notif-bell__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 34px;
      height: 34px;
      border-radius: var(--radius-md);
      background: none;
      border: none;
      color: var(--color-topnav-text-muted);
      cursor: pointer;
      transition: var(--transition-color);
      position: relative;
    }

    .notif-bell__btn:hover {
      background-color: var(--color-surface-2);
      color: var(--color-topnav-text);
    }

    .notif-bell__icon { width: 18px; height: 18px; }

    .notif-bell__badge {
      position: absolute;
      top: 3px;
      right: 3px;
      min-width: 16px;
      height: 16px;
      padding: 0 3px;
      background-color: var(--color-error);
      color: var(--color-primary-contrast);
      border-radius: var(--radius-badge);
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      font-family: var(--font-family-sans);
    }

    .notif-bell__panel {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      width: 320px;
      max-height: 400px;
      background-color: var(--color-surface-1);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-dropdown);
      z-index: var(--z-dropdown);
      overflow: hidden;
      animation: fade-in var(--duration-fast) var(--ease-out);
    }

    .notif-bell__panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border-muted);
    }

    .notif-bell__panel-title {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .notif-bell__mark-all {
      background: none;
      border: none;
      font-size: var(--font-size-xs);
      color: var(--color-text-link);
      cursor: pointer;
      font-family: var(--font-family-sans);
    }

    .notif-bell__mark-all:hover { text-decoration: underline; }

    .notif-bell__panel-body {
      padding: var(--space-4);
      overflow-y: auto;
      max-height: 340px;
    }

    .notif-bell__empty {
      font-size: var(--font-size-sm);
      color: var(--color-text-tertiary);
      text-align: center;
    }
  `]
})
export class NotificationBellComponent {
  readonly countStore = inject(NotificationCountStore);
  readonly panelOpen = signal(false);
}

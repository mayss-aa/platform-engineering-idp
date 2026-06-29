import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { AuthStore } from '../../core/stores/auth.store';
import { AuthService } from '../../core/services/auth.service';

/**
 * UserProfileMenuComponent — dropdown with display name, role, profile link, logout.
 *
 * Requirement 4.9.
 */
@Component({
  selector: 'idp-user-profile-menu',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="user-menu">
      <button
        class="user-menu__trigger"
        type="button"
        (click)="open.set(!open())"
        [attr.aria-expanded]="open()"
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <span class="user-menu__avatar" aria-hidden="true">
          {{ initials }}
        </span>
        <span class="user-menu__info">
          <span class="user-menu__name">{{ displayName }}</span>
          <span class="user-menu__role">{{ role }}</span>
        </span>
        <svg class="user-menu__chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"/>
        </svg>
      </button>

      @if (open()) {
        <div class="user-menu__dropdown" role="menu" aria-label="User options">
          <div class="user-menu__header">
            <span class="user-menu__header-name">{{ displayName }}</span>
            <span class="user-menu__header-email">{{ email }}</span>
          </div>
          <div class="user-menu__divider" role="separator"></div>
          <button class="user-menu__item" role="menuitem" type="button">
            Profile Settings
          </button>
          <button class="user-menu__item" role="menuitem" type="button">
            API Tokens
          </button>
          <div class="user-menu__divider" role="separator"></div>
          <button class="user-menu__item user-menu__item--danger" role="menuitem" type="button" (click)="logout()">
            Sign Out
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: inline-flex; }

    .user-menu { position: relative; }

    .user-menu__trigger {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      height: 36px;
      padding: 0 var(--space-2);
      border-radius: var(--radius-md);
      background: none;
      border: none;
      color: var(--color-topnav-text);
      cursor: pointer;
      transition: var(--transition-color);
    }

    .user-menu__trigger:hover { background-color: var(--color-surface-2); }

    .user-menu__avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-full);
      background-color: var(--color-primary);
      color: var(--color-primary-contrast);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      flex-shrink: 0;
      font-family: var(--font-family-sans);
    }

    .user-menu__info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1px;
    }

    .user-menu__name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      line-height: 1.2;
      white-space: nowrap;
    }

    .user-menu__role {
      font-size: 10px;
      color: var(--color-text-tertiary);
      letter-spacing: var(--letter-spacing-wide);
      line-height: 1;
    }

    .user-menu__chevron {
      width: 14px;
      height: 14px;
      color: var(--color-text-tertiary);
    }

    @media (max-width: 767px) {
      .user-menu__info { display: none; }
      .user-menu__chevron { display: none; }
    }

    .user-menu__dropdown {
      position: absolute;
      top: calc(100% + var(--space-2));
      right: 0;
      width: 220px;
      background-color: var(--color-surface-1);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-dropdown);
      z-index: var(--z-dropdown);
      overflow: hidden;
      animation: fade-in var(--duration-fast) var(--ease-out);
    }

    .user-menu__header {
      padding: var(--space-3) var(--space-4);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-menu__header-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .user-menu__header-email {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
    }

    .user-menu__divider {
      height: 1px;
      background-color: var(--color-border-muted);
    }

    .user-menu__item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: var(--space-2) var(--space-4);
      background: none;
      border: none;
      text-align: left;
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      cursor: pointer;
      transition: var(--transition-color);
      font-family: var(--font-family-sans);
    }

    .user-menu__item:hover { background-color: var(--color-surface-2); }
    .user-menu__item--danger { color: var(--color-error); }
  `]
})
export class UserProfileMenuComponent {
  private readonly authStore = inject(AuthStore);
  private readonly authService = inject(AuthService);
  readonly open = signal(false);

  get displayName(): string {
    return this.authStore.user()?.displayName ?? 'Platform User';
  }

  get email(): string {
    return this.authStore.user()?.email ?? 'user@idp.internal';
  }

  get role(): string {
    return this.authStore.currentRole() ?? 'VIEWER';
  }

  get initials(): string {
    const name = this.displayName;
    const parts = name.split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.open.set(false);
    this.authService.logout();
  }
}

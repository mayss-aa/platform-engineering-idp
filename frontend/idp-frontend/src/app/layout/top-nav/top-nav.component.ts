import {
  Component,
  Output,
  EventEmitter,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'idp-top-nav',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="topnav" role="banner">

      <!-- ── Left: hamburger + brand ───────────────────────── -->
      <div class="topnav__left">
        <button
          class="topnav__icon-btn"
          type="button"
          (click)="sidebarToggle.emit()"
          aria-label="Toggle navigation menu"
        >
          <svg class="topnav__svg-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <rect x="2" y="4"  width="16" height="1.5" rx="0.75"/>
            <rect x="2" y="9"  width="16" height="1.5" rx="0.75"/>
            <rect x="2" y="14" width="16" height="1.5" rx="0.75"/>
          </svg>
        </button>

        <a class="topnav__brand" routerLink="/" aria-label="IDP Platform — go to overview">
          <span class="topnav__brand-diamond" aria-hidden="true"></span>
          <span class="topnav__brand-name">IDP Platform</span>
        </a>

        <div class="topnav__divider" aria-hidden="true"></div>

        <nav class="topnav__quick-nav" aria-label="Quick navigation">
          <a class="topnav__quick-link" routerLink="/dashboard">Overview</a>
          <a class="topnav__quick-link" routerLink="/deployments">Deployments</a>
          <a class="topnav__quick-link" routerLink="/monitoring">Monitoring</a>
        </nav>
      </div>

      <!-- ── Centre: global search ─────────────────────────── -->
      <div class="topnav__search-wrap" role="search">
        <label for="global-search" class="sr-only">Search platform</label>
        <svg class="topnav__search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M8.5 3a5.5 5.5 0 1 0 3.45 9.814l3.118 3.118a.75.75 0 1 0 1.06-1.06l-3.117-3.118A5.5 5.5 0 0 0 8.5 3Zm-4 5.5a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"/>
        </svg>
        <input
          id="global-search"
          class="topnav__search-input"
          type="search"
          placeholder="Search resources, modules, docs&hellip;"
          autocomplete="off"
          spellcheck="false"
          (focus)="searchFocused.set(true)"
          (blur)="searchFocused.set(false)"
          [class.topnav__search-input--focused]="searchFocused()"
          aria-label="Search platform"
        />
        <kbd class="topnav__search-kbd" aria-label="Press slash to focus search">/</kbd>
      </div>

      <!-- ── Right: actions + user ─────────────────────────── -->
      <div class="topnav__right">

        <!-- Environment badge -->
        <span class="topnav__env-badge" aria-label="Environment: Mock data active">
          <span class="topnav__env-dot" aria-hidden="true"></span>
          MOCK
        </span>

        <!-- Notifications -->
        <button
          class="topnav__icon-btn topnav__icon-btn--rel"
          type="button"
          aria-label="Notifications — 3 unread"
        >
          <svg class="topnav__svg-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path d="M10 2a6 6 0 0 0-6 6v2.586l-.707.707A1 1 0 0 0 4 13h12a1 1 0 0 0 .707-1.707L16 10.586V8a6 6 0 0 0-6-6Zm0 16a2 2 0 0 1-2-2h4a2 2 0 0 1-2 2Z"/>
          </svg>
          <span class="topnav__notif-badge" aria-hidden="true">3</span>
        </button>

        <!-- Theme toggle -->
        <button
          class="topnav__icon-btn"
          type="button"
          (click)="toggleTheme()"
          [attr.aria-label]="isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
          [attr.aria-pressed]="isDark()"
        >
          @if (isDark()) {
            <svg class="topnav__svg-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4.22 2.78a1 1 0 0 1 0 1.415L13.157 7.25a1 1 0 0 1-1.414-1.415l1.063-1.063a1 1 0 0 1 1.414 0ZM17 9a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-6.22 2.78a1 1 0 0 1 1.415 0L6.25 9.843a1 1 0 0 1-1.414 1.414L3.772 10.194a1 1 0 0 1 0-1.414ZM3 11a1 1 0 1 1 0-2H2a1 1 0 1 1 0 2H3Zm2.836 3.164a1 1 0 0 1 0-1.414L6.9 11.686a1 1 0 0 1 1.414 1.415l-1.063 1.063a1 1 0 0 1-1.414 0ZM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Zm5.164-1.836a1 1 0 0 1-1.414 0L12.686 13.1a1 1 0 0 1 1.415-1.414l1.063 1.063a1 1 0 0 1 0 1.415Z"/>
            </svg>
          } @else {
            <svg class="topnav__svg-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z"/>
            </svg>
          }
        </button>

        <!-- Help -->
        <button class="topnav__icon-btn" type="button" aria-label="Help and documentation">
          <svg class="topnav__svg-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM9.25 8.5a.75.75 0 0 0 0 1.5h.008a.75.75 0 0 0 0-1.5H9.25Zm.75 3a.75.75 0 0 0-1.5 0v2a.75.75 0 0 0 1.5 0v-2Zm-.75-5.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"/>
          </svg>
        </button>

        <div class="topnav__divider" aria-hidden="true"></div>

        <!-- User menu -->
        <div class="topnav__user-wrap">
          <button
            class="topnav__user-btn"
            type="button"
            (click)="userMenuOpen.set(!userMenuOpen())"
            [attr.aria-expanded]="userMenuOpen()"
            aria-haspopup="menu"
            aria-label="User menu — Admin Engineer"
          >
            <span class="topnav__avatar" aria-hidden="true">AE</span>
            <span class="topnav__user-info">
              <span class="topnav__user-name">Admin Engineer</span>
              <span class="topnav__user-role">ADMIN</span>
            </span>
            <svg class="topnav__svg-icon topnav__svg-icon--sm topnav__chevron" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"/>
            </svg>
          </button>

          @if (userMenuOpen()) {
            <div class="topnav__dropdown" role="menu" aria-label="User options">
              <div class="topnav__dropdown-header">
                <span class="topnav__dropdown-name">Admin Engineer</span>
                <span class="topnav__dropdown-email">admin&#64;idp.internal</span>
              </div>
              <div class="topnav__dropdown-section">
                <button class="topnav__dropdown-item" role="menuitem" type="button">
                  <svg class="topnav__dropdown-item-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3Z"/>
                  </svg>
                  Profile Settings
                </button>
                <button class="topnav__dropdown-item" role="menuitem" type="button">
                  <svg class="topnav__dropdown-item-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM6.5 5.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM8 10a4 4 0 0 0-3.46 2h6.92A4 4 0 0 0 8 10Z"/>
                  </svg>
                  API Tokens
                </button>
              </div>
              <div class="topnav__dropdown-divider" role="separator"></div>
              <div class="topnav__dropdown-section">
                <button class="topnav__dropdown-item topnav__dropdown-item--danger" role="menuitem" type="button">
                  <svg class="topnav__dropdown-item-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M7 1H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4v-1.5H3a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5h4V1Zm5.854 5.646-1.5-1.5a.5.5 0 0 0-.708.708L11.793 7H6.5a.5.5 0 0 0 0 1h5.293l-1.147 1.146a.5.5 0 0 0 .708.708l1.5-1.5a.5.5 0 0 0 0-.708Z"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          }
        </div>

      </div>
    </header>
  `,
  styles: [`
    /* ── Host ──────────────────────────────────────────────── */
    :host { display: block; }

    /* ── Bar ───────────────────────────────────────────────── */
    .topnav {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--color-topnav-height);
      background-color: var(--color-topnav-bg);
      border-bottom: 1px solid var(--color-topnav-border);
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: 0 var(--space-5);
      z-index: var(--z-topnav);
    }

    /* ── Sections ──────────────────────────────────────────── */
    .topnav__left {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }

    .topnav__search-wrap {
      flex: 1;
      max-width: 520px;
      position: relative;
      display: flex;
      align-items: center;
    }

    .topnav__right {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      flex-shrink: 0;
      margin-left: auto;
    }

    /* ── Brand ─────────────────────────────────────────────── */
    .topnav__brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
      flex-shrink: 0;
    }

    .topnav__brand-diamond {
      width: 22px;
      height: 22px;
      background-color: var(--color-primary);
      transform: rotate(45deg);
      border-radius: 3px;
      flex-shrink: 0;
    }

    .topnav__brand-name {
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
      color: var(--color-topnav-text);
      letter-spacing: var(--letter-spacing-tight);
      white-space: nowrap;
    }

    /* ── Quick nav ─────────────────────────────────────────── */
    .topnav__quick-nav {
      display: flex;
      align-items: center;
      gap: 0;
    }

    .topnav__quick-link {
      display: flex;
      align-items: center;
      height: 36px;
      padding: 0 var(--space-3);
      font-size: var(--font-size-sm);
      color: var(--color-topnav-text-muted);
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: var(--transition-color);
      white-space: nowrap;
    }

    .topnav__quick-link:hover {
      color: var(--color-topnav-text);
      background-color: var(--color-surface-2);
    }

    @media (max-width: 1279px) {
      .topnav__quick-nav { display: none; }
    }

    /* ── Divider ───────────────────────────────────────────── */
    .topnav__divider {
      width: 1px;
      height: 20px;
      background-color: var(--color-border-default);
      margin: 0 var(--space-1);
      flex-shrink: 0;
    }

    /* ── Search ────────────────────────────────────────────── */
    .topnav__search-icon {
      position: absolute;
      left: var(--space-3);
      width: 16px;
      height: 16px;
      color: var(--color-text-tertiary);
      pointer-events: none;
      flex-shrink: 0;
    }

    .topnav__search-input {
      width: 100%;
      height: 34px;
      background-color: var(--color-surface-2);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      padding: 0 var(--space-8) 0 var(--space-8);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      font-family: var(--font-family-sans);
      transition: border-color var(--duration-fast) var(--ease-default),
                  background-color var(--duration-fast) var(--ease-default);
      outline: none;
    }

    .topnav__search-input::placeholder { color: var(--color-text-tertiary); }

    .topnav__search-input:focus,
    .topnav__search-input--focused {
      background-color: var(--color-surface-1);
      border-color: var(--color-border-focus);
      box-shadow: var(--shadow-focus);
    }

    .topnav__search-kbd {
      position: absolute;
      right: var(--space-3);
      display: flex;
      align-items: center;
      justify-content: center;
      height: 20px;
      min-width: 20px;
      padding: 0 var(--space-1);
      background-color: var(--color-surface-3);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-sm);
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
      font-family: var(--font-family-mono);
      pointer-events: none;
    }

    /* ── Icon buttons ──────────────────────────────────────── */
    .topnav__icon-btn {
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
      flex-shrink: 0;
    }

    .topnav__icon-btn:hover {
      background-color: var(--color-surface-2);
      color: var(--color-topnav-text);
    }

    .topnav__icon-btn--rel { position: relative; }

    .topnav__svg-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    .topnav__svg-icon--sm {
      width: 14px;
      height: 14px;
    }

    /* ── Notification badge ────────────────────────────────── */
    .topnav__notif-badge {
      position: absolute;
      top: 4px;
      right: 4px;
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

    /* ── Environment badge ─────────────────────────────────── */
    .topnav__env-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      padding: 3px var(--space-2);
      background-color: var(--color-surface-2);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-badge);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      letter-spacing: var(--letter-spacing-wider);
      white-space: nowrap;
    }

    .topnav__env-dot {
      width: 6px;
      height: 6px;
      border-radius: var(--radius-full);
      background-color: var(--color-warning);
      flex-shrink: 0;
    }

    /* ── User ──────────────────────────────────────────────── */
    .topnav__user-wrap { position: relative; }

    .topnav__user-btn {
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

    .topnav__user-btn:hover { background-color: var(--color-surface-2); }

    .topnav__avatar {
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

    .topnav__user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1px;
    }

    .topnav__user-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      line-height: 1.2;
      white-space: nowrap;
    }

    .topnav__user-role {
      font-size: 10px;
      color: var(--color-text-tertiary);
      letter-spacing: var(--letter-spacing-wide);
      line-height: 1;
    }

    .topnav__chevron {
      color: var(--color-text-tertiary);
      margin-left: auto;
    }

    @media (max-width: 767px) {
      .topnav__user-info { display: none; }
      .topnav__chevron { display: none; }
    }

    /* ── Dropdown ──────────────────────────────────────────── */
    .topnav__dropdown {
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

    .topnav__dropdown-header {
      padding: var(--space-3) var(--space-4);
      border-bottom: 1px solid var(--color-border-muted);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .topnav__dropdown-name {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
    }

    .topnav__dropdown-email {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
    }

    .topnav__dropdown-section { padding: var(--space-1) 0; }

    .topnav__dropdown-divider {
      height: 1px;
      background-color: var(--color-border-muted);
      margin: 0;
    }

    .topnav__dropdown-item {
      display: flex;
      align-items: center;
      gap: var(--space-2);
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

    .topnav__dropdown-item:hover { background-color: var(--color-surface-2); }
    .topnav__dropdown-item--danger { color: var(--color-error); }

    .topnav__dropdown-item-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
      color: var(--color-text-tertiary);
    }

    .topnav__dropdown-item--danger .topnav__dropdown-item-icon { color: var(--color-error); }
  `]
})
export class TopNavComponent {
  @Output() sidebarToggle = new EventEmitter<void>();

  readonly isDark = signal(false);
  readonly userMenuOpen = signal(false);
  readonly searchFocused = signal(false);

  toggleTheme(): void {
    const next = !this.isDark();
    this.isDark.set(next);
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light');
  }
}

import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';

/**
 * ThemeToggleComponent — calls ThemeService.toggleTheme() (Req 27.5).
 */
@Component({
  selector: 'idp-theme-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      class="theme-toggle"
      type="button"
      (click)="themeService.toggleTheme()"
      [attr.aria-label]="themeService.isDark()() ? 'Switch to light theme' : 'Switch to dark theme'"
      [attr.aria-pressed]="themeService.isDark()()"
    >
      @if (themeService.isDark()()) {
        <svg class="theme-toggle__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M10 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V3a1 1 0 0 1 1-1Zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-1.93-4.95a1 1 0 0 1 0-1.414l.707-.707a1 1 0 1 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414 0ZM17 9a1 1 0 1 1 0 2h-1a1 1 0 1 1 0-2h1ZM4 11a1 1 0 1 1 0-2H3a1 1 0 1 1 0 2h1Zm1.636-6.364a1 1 0 0 1 1.414 0l.707.707a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 0-1.414ZM10 16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"/>
        </svg>
      } @else {
        <svg class="theme-toggle__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707a8.001 8.001 0 1 0 10.586 10.586Z"/>
        </svg>
      }
    </button>
  `,
  styles: [`
    :host { display: inline-flex; }

    .theme-toggle {
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
    }

    .theme-toggle:hover {
      background-color: var(--color-surface-2);
      color: var(--color-topnav-text);
    }

    .theme-toggle__icon { width: 18px; height: 18px; }
  `]
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
}

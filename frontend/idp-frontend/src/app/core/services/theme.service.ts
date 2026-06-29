import { Injectable, inject, Signal } from '@angular/core';
import { ThemeStore, ThemeValue } from '../stores/theme.store';

/**
 * ThemeService — public API for theme management.
 *
 * Responsibilities (Requirement 27.5, 23.3–23.5):
 * - Delegates all state to ThemeStore.
 * - Exposes a clean API surface for layout components and settings page.
 * - loadPersistedTheme() is called from APP_INITIALIZER to prevent
 *   flash of wrong-theme content (Requirement 23.5).
 *
 * Components call ThemeService, never ThemeStore directly.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly store = inject(ThemeStore);

  /** Signal: the currently active theme ('light' | 'dark'). */
  currentTheme(): Signal<ThemeValue> {
    return this.store.current;
  }

  /** Signal: true when dark mode is active. */
  isDark(): Signal<boolean> {
    return this.store.isDark;
  }

  /**
   * Apply a specific theme.
   * Persists to localStorage and updates the DOM attribute.
   */
  applyTheme(theme: ThemeValue): void {
    this.store.applyTheme(theme);
  }

  /** Toggle between light and dark. */
  toggleTheme(): void {
    this.store.toggleTheme();
  }

  /**
   * Load the persisted theme on app startup.
   * Called from APP_INITIALIZER (Task 12) before the first render.
   * ThemeStore already reads localStorage in its constructor and applies
   * the DOM attribute, so this method is effectively a no-op that confirms
   * initialization has occurred. It exists for explicit APP_INITIALIZER wiring.
   */
  loadPersistedTheme(): void {
    // ThemeStore constructor already applied the persisted theme.
    // This explicit call makes the initialization intent clear in providers.
  }
}

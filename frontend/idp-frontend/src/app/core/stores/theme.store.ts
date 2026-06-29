import { Injectable, signal, computed, effect } from '@angular/core';

/** The two supported theme values. */
export type ThemeValue = 'light' | 'dark';

/** localStorage key used to persist theme preference (Requirement 23.5). */
const THEME_STORAGE_KEY = 'idp-theme-preference';

/**
 * ThemeStore — Core Signal store for theme state.
 *
 * Design rules (Requirements 23.3–23.5, 27.5):
 * - Theme is stored as a Signal<'light' | 'dark'>.
 * - Applying a theme writes the `data-theme` attribute on <html>.
 * - Preference is persisted in localStorage so it survives page reload.
 * - ThemeService (Task 6) delegates to this store; components and layout
 *   components call ThemeService, never this store directly.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  // ── Private writable signal ───────────────────────────────
  private readonly _current = signal<ThemeValue>(this._loadPersistedTheme());

  // ── Public readonly signals ───────────────────────────────

  /** The currently active theme. */
  readonly current = this._current.asReadonly();

  // ── Computed signals ──────────────────────────────────────

  /** True when dark mode is active. */
  readonly isDark = computed(() => this._current() === 'dark');

  /** True when light mode is active. */
  readonly isLight = computed(() => this._current() === 'light');

  constructor() {
    // Apply the initial theme to the DOM immediately — prevents flash of
    // wrong-theme content before Angular renders (Requirement 23.5).
    this._applyToDom(this._current());

    // Whenever the signal changes, sync to DOM and localStorage.
    effect(() => {
      const theme = this._current();
      this._applyToDom(theme);
      this._persist(theme);
    });
  }

  // ── Mutation methods ──────────────────────────────────────

  /** Apply a specific theme. */
  applyTheme(theme: ThemeValue): void {
    this._current.set(theme);
  }

  /** Toggle between light and dark. */
  toggleTheme(): void {
    this._current.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  // ── Private helpers ───────────────────────────────────────

  private _loadPersistedTheme(): ThemeValue {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') return stored;
    } catch {
      // localStorage may be unavailable in SSR or restricted environments.
    }
    return 'light';
  }

  private _persist(theme: ThemeValue): void {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Silently ignore write failures.
    }
  }

  private _applyToDom(theme: ThemeValue): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }
}

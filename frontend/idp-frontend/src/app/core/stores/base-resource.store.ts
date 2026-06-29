import { signal, computed, Signal } from '@angular/core';
import { Observable, Subject, takeUntil } from 'rxjs';
import { ResourceState, createInitialState } from '../models/resource-state.models';

/**
 * BaseResourceStore — abstract helper for all 19 feature Signal stores.
 *
 * Encapsulates the ResourceState state machine:
 *
 *   IDLE ──[load()]──► LOADING ──[success]──► SUCCESS
 *                          │
 *                          └──[error]───────► ERROR ──[retry()]──► LOADING
 *
 * Invariants enforced:
 *   1. loading === true  implies  error === null (atomic transition)
 *   2. retry() from error state resets error to null before setting loading
 *   3. All Signal writes go through explicit methods — never mutated from templates
 *
 * Usage in feature stores:
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class DeploymentStore {
 *   readonly deployments = new BaseResourceStore<Deployment[]>();
 *   readonly selected = new BaseResourceStore<Deployment>();
 *
 *   load(): void {
 *     this.deployments.load(this.service.getDeployments());
 *   }
 * }
 * ```
 *
 * Requirements: 2.8, 25.6, 25.8, 25.11, 25.12
 */
export class BaseResourceStore<T> {
  // ── Private writable signal ───────────────────────────────
  private readonly _state = signal<ResourceState<T>>(createInitialState<T>());
  private readonly _destroy$ = new Subject<void>();

  // ── Public readonly signals ───────────────────────────────

  /** Full ResourceState signal — for consumers that need all three fields. */
  readonly state: Signal<ResourceState<T>> = this._state.asReadonly();

  /** True while an HTTP operation is in flight. */
  readonly loading = computed(() => this._state().loading);

  /** Error message, or null when no error. */
  readonly error = computed(() => this._state().error);

  /** Data payload, or null when not loaded. */
  readonly data = computed(() => this._state().data);

  /** True when data is successfully loaded and available. */
  readonly hasData = computed(() => this._state().data !== null && !this._state().loading);

  /** True when in error state. */
  readonly hasError = computed(() => this._state().error !== null);

  // ── State machine transitions ─────────────────────────────

  /**
   * Start loading — sets loading=true, error=null atomically.
   * Does NOT clear previous data (allows optimistic UI patterns).
   * Invariant 1 enforced: loading=true → error=null.
   */
  setLoading(): void {
    this._state.update((s) => ({
      ...s,
      loading: true,
      error: null, // Invariant 1: clear error when loading starts
    }));
  }

  /**
   * Success — sets data, clears loading and error.
   */
  setData(data: T): void {
    this._state.set({
      loading: false,
      error: null,
      data,
    });
  }

  /**
   * Error — sets error message, clears loading. Preserves previous data.
   */
  setError(message: string): void {
    this._state.update((s) => ({
      ...s,
      loading: false,
      error: message,
    }));
  }

  /**
   * Reset to initial idle state — used on destroy or manual clear.
   */
  reset(): void {
    this._state.set(createInitialState<T>());
  }

  /**
   * Load from an Observable — complete state machine in one call.
   * Handles setLoading → subscribe → setData / setError.
   *
   * Cancels any previous in-flight request for this store instance.
   */
  load(source$: Observable<T>): void {
    // Cancel previous
    this._destroy$.next();

    // Invariant 1: set loading, clear error
    this.setLoading();

    source$.pipe(takeUntil(this._destroy$)).subscribe({
      next: (data) => this.setData(data),
      error: (err) => this.setError(this._extractMessage(err)),
    });
  }

  /**
   * Retry — identical to load() but makes the retry intent explicit.
   * Invariant 2: resets error to null before the new request.
   */
  retry(source$: Observable<T>): void {
    this.load(source$);
  }

  /**
   * Destroy — cancels in-flight subscriptions.
   * Called from the feature store's ngOnDestroy.
   */
  destroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  // ── Private ───────────────────────────────────────────────

  private _extractMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object' && 'message' in err) {
      return String((err as { message: unknown }).message);
    }
    return 'An unexpected error occurred.';
  }
}

import { Injectable, Signal, signal, computed } from '@angular/core';
import { FeatureReadinessLevel } from '../models/resource-state.models';
import { environment } from '../../../environments/environment';

/**
 * FeatureFlagService — single source of truth for module readiness levels.
 *
 * Responsibilities (Requirements 2.11, 27.10, 30.11):
 * - Reads environment.featureFlags on initialize() (called from APP_INITIALIZER in Task 12).
 * - Exposes each module's FeatureReadinessLevel as a Signal so any service
 *   or store can react to flag changes without component involvement.
 * - Used exclusively by Data_Source_Strategy in every feature service
 *   (Tasks 15–34) to decide MOCK vs LIVE data source.
 * - NEVER blocks navigation — FeatureReadinessLevel is orthogonal to RBAC.
 *
 * The service is providedIn: 'root' so there is exactly one instance across
 * the entire application (singleton).
 */
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  // ── Private state ─────────────────────────────────────────

  private readonly _flags = signal<Record<string, FeatureReadinessLevel>>(
    // Pre-populate from environment so flags are available synchronously
    // even before initialize() is called from APP_INITIALIZER.
    { ...environment.featureFlags },
  );

  private _initialized = false;

  // ── Public Signals ────────────────────────────────────────

  /**
   * All feature flags as a Signal record.
   * Consumers read this to react whenever flags change at runtime.
   * Shape: { 'dashboard': 'MOCK', 'deployments': 'LIVE', ... }
   */
  readonly getAllFlags: Signal<Record<string, FeatureReadinessLevel>> =
    this._flags.asReadonly();

  // ── Computed: per-module readiness Signals ────────────────
  // Pre-built computed Signals for every module so feature services
  // can inject a stable Signal reference rather than calling getReadinessLevel()
  // in a computed() themselves.

  readonly dashboard         = computed(() => this._flags()['dashboard']          ?? 'MOCK');
  readonly serviceCatalog    = computed(() => this._flags()['service-catalog']    ?? 'MOCK');
  readonly provisionRequests = computed(() => this._flags()['provision-requests'] ?? 'MOCK');
  readonly deployments       = computed(() => this._flags()['deployments']        ?? 'MOCK');
  readonly terraform         = computed(() => this._flags()['terraform']          ?? 'MOCK');
  readonly cicd              = computed(() => this._flags()['cicd']               ?? 'MOCK');
  readonly infrastructure    = computed(() => this._flags()['infrastructure']     ?? 'MOCK');
  readonly containers        = computed(() => this._flags()['containers']         ?? 'MOCK');
  readonly kubernetes        = computed(() => this._flags()['kubernetes']         ?? 'MOCK');
  readonly cloudResources    = computed(() => this._flags()['cloud-resources']    ?? 'MOCK');
  readonly monitoring        = computed(() => this._flags()['monitoring']         ?? 'MOCK');
  readonly notifications     = computed(() => this._flags()['notifications']      ?? 'MOCK');
  readonly incidents         = computed(() => this._flags()['incidents']          ?? 'MOCK');
  readonly recommendations   = computed(() => this._flags()['recommendations']    ?? 'MOCK');
  readonly organizations     = computed(() => this._flags()['organizations']      ?? 'MOCK');
  readonly teams             = computed(() => this._flags()['teams']              ?? 'MOCK');
  readonly users             = computed(() => this._flags()['users']              ?? 'MOCK');
  readonly settings          = computed(() => this._flags()['settings']           ?? 'MOCK');
  readonly aiAssistant       = computed(() => this._flags()['ai-assistant']       ?? 'MOCK');

  // ── Initialization ────────────────────────────────────────

  /**
   * Called once from APP_INITIALIZER (Task 12).
   * Re-reads environment.featureFlags and publishes the snapshot as a Signal update.
   * This ensures any lazy-loaded feature service that is instantiated after boot
   * sees the correct initial flags value.
   */
  initialize(): void {
    if (this._initialized) return;
    this._initialized = true;
    this._flags.set({ ...environment.featureFlags });
  }

  // ── Imperative access ─────────────────────────────────────

  /**
   * Synchronously read the readiness level for a named feature module.
   * Returns 'MOCK' as a safe fallback for unknown feature names.
   *
   * Used by Data_Source_Strategy in every feature service:
   *   const isLive = computed(() => this.flags.getReadinessLevel('deployments') === 'LIVE');
   */
  getReadinessLevel(featureName: string): FeatureReadinessLevel {
    return this._flags()[featureName] ?? 'MOCK';
  }

  /**
   * Returns true when the given module is in LIVE mode.
   * Convenience method for feature services.
   */
  isLive(featureName: string): boolean {
    return this.getReadinessLevel(featureName) === 'LIVE';
  }

  /**
   * Returns true when the given module is still in MOCK mode.
   */
  isMock(featureName: string): boolean {
    return this.getReadinessLevel(featureName) === 'MOCK';
  }

  /**
   * Override a specific flag at runtime — useful for development tooling
   * and integration testing without restarting the application.
   * This method is intentionally NOT exposed in the public API surface
   * visible to feature components; it is only used by dev tooling and tests.
   */
  _overrideFlag(featureName: string, level: FeatureReadinessLevel): void {
    this._flags.update((flags) => ({ ...flags, [featureName]: level }));
  }
}

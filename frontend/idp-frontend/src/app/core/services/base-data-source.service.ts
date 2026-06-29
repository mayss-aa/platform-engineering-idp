import { computed, Signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FeatureFlagService } from './feature-flag.service';
import { ApiGatewayService } from './api-gateway.service';
import { FeatureReadinessLevel } from '../models/resource-state.models';

/**
 * BaseDataSourceService — abstract scaffold for the Data_Source_Strategy pattern.
 *
 * Every feature service extends this class. The single switch point:
 *   - MOCK mode → delegates to the mock adapter method
 *   - LIVE mode → delegates to ApiGatewayService
 *
 * Switching from MOCK to LIVE requires ONLY changing environment.featureFlags.{module}.
 * Zero component, template, route, or store changes needed (Requirements 2.13, 30.11).
 *
 * Usage:
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class DeploymentService extends BaseDataSourceService {
 *   constructor() { super('deployments'); }
 *
 *   private readonly mock = inject(DeploymentMockService);
 *
 *   getDeployments(): Observable<Deployment[]> {
 *     return this.fromSource(
 *       '/deployments',
 *       () => this.mock.getDeployments()
 *     );
 *   }
 *
 *   getDeployment(id: string): Observable<Deployment> {
 *     return this.fromSource(
 *       `/deployments/${id}`,
 *       () => this.mock.getDeployment(id)
 *     );
 *   }
 * }
 * ```
 */
export abstract class BaseDataSourceService {
  protected readonly flagService = inject(FeatureFlagService);
  protected readonly api = inject(ApiGatewayService);

  /** The feature module name matching environment.featureFlags key. */
  protected readonly featureName: string;

  /**
   * Computed Signal: true when this feature's readiness level is LIVE.
   * Used internally by fromSource() and available to subclasses.
   */
  readonly isLive: Signal<boolean>;

  /**
   * Computed Signal: current FeatureReadinessLevel for this module.
   */
  readonly readinessLevel: Signal<FeatureReadinessLevel>;

  constructor(featureName: string) {
    this.featureName = featureName;
    this.isLive = computed(() => this.flagService.getReadinessLevel(this.featureName) === 'LIVE');
    this.readinessLevel = computed(() => this.flagService.getReadinessLevel(this.featureName));
  }

  /**
   * The core Data_Source_Strategy delegate.
   *
   * When LIVE: calls ApiGatewayService.get<T>(apiPath)
   * When MOCK: calls mockFn() and wraps in Observable
   *
   * @param apiPath — REST API path (e.g., '/deployments')
   * @param mockFn — function returning mock data synchronously
   */
  protected fromSource<T>(apiPath: string, mockFn: () => T): Observable<T> {
    if (this.isLive()) {
      return this.api.get<T>(apiPath);
    }
    return of(mockFn());
  }

  /**
   * POST variant of fromSource.
   * LIVE: calls ApiGatewayService.post<T>(apiPath, body)
   * MOCK: calls mockFn() and wraps in Observable
   */
  protected postSource<T>(apiPath: string, body: unknown, mockFn: () => T): Observable<T> {
    if (this.isLive()) {
      return this.api.post<T>(apiPath, body);
    }
    return of(mockFn());
  }

  /**
   * PUT variant of fromSource.
   */
  protected putSource<T>(apiPath: string, body: unknown, mockFn: () => T): Observable<T> {
    if (this.isLive()) {
      return this.api.put<T>(apiPath, body);
    }
    return of(mockFn());
  }

  /**
   * PATCH variant of fromSource.
   */
  protected patchSource<T>(apiPath: string, body: unknown, mockFn: () => T): Observable<T> {
    if (this.isLive()) {
      return this.api.patch<T>(apiPath, body);
    }
    return of(mockFn());
  }

  /**
   * DELETE variant of fromSource.
   */
  protected deleteSource<T>(apiPath: string, mockFn: () => T): Observable<T> {
    if (this.isLive()) {
      return this.api.delete<T>(apiPath);
    }
    return of(mockFn());
  }

  /**
   * BLOB download variant (e.g., CSV export).
   */
  protected downloadSource(apiPath: string, mockFn: () => Blob): Observable<Blob> {
    if (this.isLive()) {
      return this.api.downloadBlob(apiPath);
    }
    return of(mockFn());
  }
}

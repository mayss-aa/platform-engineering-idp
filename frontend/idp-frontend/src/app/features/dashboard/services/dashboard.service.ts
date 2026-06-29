import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseDataSourceService } from '../../../core/services/base-data-source.service';
import { DashboardMockService } from '../mocks/dashboard.mock.service';
import { DashboardData } from '../models/dashboard.models';

/**
 * DashboardService — Data_Source_Strategy implementation for Dashboard.
 *
 * Extends BaseDataSourceService with featureName='dashboard'.
 * Delegates to DashboardMockService in MOCK mode, ApiGatewayService in LIVE mode.
 * Switching: change environment.featureFlags.dashboard from 'MOCK' to 'LIVE'.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseDataSourceService {
  private readonly mock = inject(DashboardMockService);

  constructor() {
    super('dashboard');
  }

  /** Fetch all dashboard data in one call. */
  getDashboardData(): Observable<DashboardData> {
    return this.fromSource('/dashboard', () => this.mock.getDashboardData());
  }
}

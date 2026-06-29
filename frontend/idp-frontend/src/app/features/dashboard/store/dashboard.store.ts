import { Injectable, inject, OnDestroy } from '@angular/core';
import { BaseResourceStore } from '../../../core/stores/base-resource.store';
import { DashboardService } from '../services/dashboard.service';
import { DashboardData } from '../models/dashboard.models';

/**
 * DashboardStore — Signal-based store using BaseResourceStore pattern.
 *
 * Owns the dashboard data lifecycle. Components read from this store's
 * signals and never call DashboardService directly.
 */
@Injectable({ providedIn: 'root' })
export class DashboardStore implements OnDestroy {
  private readonly service = inject(DashboardService);

  /** Main dashboard data resource. */
  readonly dashboard = new BaseResourceStore<DashboardData>();

  /** Load (or refresh) all dashboard data. */
  load(): void {
    this.dashboard.load(this.service.getDashboardData());
  }

  /** Retry after error. */
  retry(): void {
    this.dashboard.retry(this.service.getDashboardData());
  }

  ngOnDestroy(): void {
    this.dashboard.destroy();
  }
}

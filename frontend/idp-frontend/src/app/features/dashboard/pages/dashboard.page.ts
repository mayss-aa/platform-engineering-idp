import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DashboardStore } from '../store/dashboard.store';
import { AuthStore } from '../../../core/stores/auth.store';
import { getDashboardConfig } from '../../../pages/home/dashboard-config';
import { computed } from '@angular/core';

/**
 * DashboardPageComponent — the canonical feature page implementation.
 *
 * Architecture pattern:
 * - Injects Store (not Service directly)
 * - Calls store.load() on init
 * - Reads store signals for loading/error/data state
 * - Uses role-specific config for layout (from getDashboardConfig)
 * - OnPush change detection
 *
 * This page serves as the template for all future feature pages.
 */
@Component({
  selector: 'idp-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash-page">
      <div class="dash-page__header">
        <div>
          <p class="dash-page__breadcrumb">{{ config().subtitle }}</p>
          <h1 class="dash-page__title">{{ config().title }}</h1>
        </div>
        <div class="dash-page__actions">
          <button class="btn btn--ghost btn--sm" type="button" (click)="refresh()">Refresh</button>
          <span class="dash-page__role">{{ currentRole() }}</span>
        </div>
      </div>

      @if (store.dashboard.loading()) {
        <div class="dash-page__loading">Loading dashboard data...</div>
      }

      @if (store.dashboard.hasError()) {
        <div class="dash-page__error">
          <p>{{ store.dashboard.error() }}</p>
          <button class="btn btn--ghost btn--sm" type="button" (click)="store.retry()">Retry</button>
        </div>
      }

      @if (store.dashboard.hasData()) {
        <div class="dash-page__kpi-grid">
          @for (w of config().kpiWidgets; track w.label) {
            <div class="kpi" [class]="'kpi--' + w.status" [class.kpi--wide]="w.wide">
              <div class="kpi__top">
                <span class="kpi__label">{{ w.label }}</span>
              </div>
              <div class="kpi__value">{{ w.value }}<span class="kpi__unit">{{ w.unit }}</span></div>
              @if (w.trend) {
                <div class="kpi__trend" [class.kpi__trend--up]="w.trendUp" [class.kpi__trend--down]="w.trendUp===false">{{ w.trend }}</div>
              }
            </div>
          }
        </div>

        <div class="dash-page__grid">
          <section class="panel">
            <div class="panel__header"><h2 class="panel__title">Recent Activity</h2></div>
            <div class="panel__body">
              @for (e of config().recentActivity; track e.time + e.target) {
                <div class="activity-row">
                  <span class="activity-row__dot" [class]="'activity-row__dot--' + e.type"></span>
                  <span class="activity-row__actor">{{ e.actor }}</span>
                  <span class="activity-row__action">{{ e.action }}</span>
                  <span class="activity-row__target">{{ e.target }}</span>
                  <span class="activity-row__time">{{ e.time }}</span>
                </div>
              }
            </div>
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dash-page { padding: var(--space-6); max-width: 1600px; }
    .dash-page__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-6); flex-wrap: wrap; }
    .dash-page__breadcrumb { font-size: var(--font-size-xs); color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: var(--letter-spacing-wider); font-weight: var(--font-weight-medium); margin-bottom: var(--space-1); }
    .dash-page__title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .dash-page__actions { display: flex; align-items: center; gap: var(--space-3); }
    .dash-page__role { font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); padding: var(--space-1) var(--space-3); background-color: var(--color-surface-2); border: 1px solid var(--color-border-default); border-radius: var(--radius-badge); letter-spacing: var(--letter-spacing-wider); }

    .btn { display: inline-flex; align-items: center; gap: var(--space-1-5); border-radius: var(--radius-button); border: none; cursor: pointer; font-family: var(--font-family-sans); font-weight: var(--font-weight-medium); transition: var(--transition-color); }
    .btn--ghost { background: transparent; border: 1px solid var(--color-border-default); color: var(--color-text-secondary); }
    .btn--ghost:hover { background-color: var(--color-surface-2); color: var(--color-text-primary); }
    .btn--sm { height: 32px; padding: 0 var(--space-3); font-size: var(--font-size-sm); }

    .dash-page__loading { padding: var(--space-8); text-align: center; color: var(--color-text-tertiary); font-size: var(--font-size-sm); }
    .dash-page__error { padding: var(--space-6); text-align: center; color: var(--color-error); font-size: var(--font-size-sm); }

    .dash-page__kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); margin-bottom: var(--space-6); }
    @media (max-width: 1279px) { .dash-page__kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .dash-page__kpi-grid { grid-template-columns: 1fr; } }

    .kpi { background-color: var(--color-surface-1); border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); padding: var(--space-5); position: relative; overflow: hidden; transition: box-shadow var(--duration-fast) var(--ease-default); }
    .kpi:hover { box-shadow: var(--shadow-md); }
    .kpi--wide { grid-column: span 2; }
    @media (max-width: 767px) { .kpi--wide { grid-column: span 1; } }
    .kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    .kpi--healthy::before { background-color: var(--color-success); }
    .kpi--warning::before { background-color: var(--color-warning); }
    .kpi--error::before { background-color: var(--color-error); }
    .kpi--info::before { background-color: var(--color-primary); }
    .kpi--neutral::before { background-color: var(--color-border-strong); }
    .kpi__top { margin-bottom: var(--space-3); }
    .kpi__label { font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: var(--letter-spacing-wide); }
    .kpi__value { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); line-height: 1; display: flex; align-items: baseline; gap: var(--space-1); }
    .kpi__unit { font-size: var(--font-size-sm); font-weight: var(--font-weight-regular); color: var(--color-text-secondary); }
    .kpi__trend { font-size: var(--font-size-xs); color: var(--color-text-tertiary); margin-top: var(--space-2); }
    .kpi__trend--up { color: var(--color-success); }
    .kpi__trend--down { color: var(--color-error); }

    .dash-page__grid { display: flex; flex-direction: column; gap: var(--space-5); }
    .panel { background-color: var(--color-surface-1); border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); overflow: hidden; }
    .panel__header { padding: var(--space-3) var(--space-5); border-bottom: 1px solid var(--color-border-muted); }
    .panel__title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .panel__body { padding: var(--space-1) 0; }
    .activity-row { display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2-5) var(--space-5); font-size: var(--font-size-xs); }
    .activity-row:not(:last-child) { border-bottom: 1px solid var(--color-border-muted); }
    .activity-row__dot { width: 7px; height: 7px; border-radius: var(--radius-full); flex-shrink: 0; }
    .activity-row__dot--deploy { background-color: var(--color-primary); }
    .activity-row__dot--provision { background-color: var(--color-accent); }
    .activity-row__dot--incident { background-color: var(--color-error); }
    .activity-row__dot--user { background-color: var(--color-success); }
    .activity-row__dot--terraform { background-color: var(--color-secondary); }
    .activity-row__dot--audit { background-color: var(--color-warning); }
    .activity-row__actor { font-weight: var(--font-weight-medium); color: var(--color-text-primary); white-space: nowrap; }
    .activity-row__action { color: var(--color-text-secondary); white-space: nowrap; }
    .activity-row__target { color: var(--color-text-link); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
    .activity-row__time { color: var(--color-text-tertiary); white-space: nowrap; margin-left: auto; }
  `]
})
export class DashboardPageComponent implements OnInit {
  readonly store = inject(DashboardStore);
  private readonly authStore = inject(AuthStore);

  readonly currentRole = computed(() => this.authStore.currentRole() ?? 'VIEWER');
  readonly config = computed(() => getDashboardConfig(this.currentRole()));

  ngOnInit(): void {
    this.store.load();
  }

  refresh(): void {
    this.store.load();
  }
}

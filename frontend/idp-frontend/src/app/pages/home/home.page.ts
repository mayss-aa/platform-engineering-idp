import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { AuthStore } from '../../core/stores/auth.store';
import { getDashboardConfig, DashboardConfig } from './dashboard-config';

/**
 * HomePageComponent — role-driven dashboard.
 *
 * Renders from a configuration object selected by the current user's role.
 * Each role gets a completely different set of widgets, actions, and activity
 * — not just hidden cards from a master list.
 *
 * Architecture: single component, config-driven, zero duplicated permission logic.
 */
@Component({
  selector: 'idp-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash">
      <div class="dash__header">
        <div>
          <p class="dash__breadcrumb">{{ config().subtitle }}</p>
          <h1 class="dash__title">{{ config().title }}</h1>
        </div>
        <div class="dash__header-right">
          <button class="btn btn--ghost btn--sm" type="button">Refresh</button>
          <span class="dash__role-badge">{{ currentRole() }}</span>
        </div>
      </div>

      <div class="dash__kpi-grid">
        @for (w of config().kpiWidgets; track w.label) {
          <div class="kpi" [class]="'kpi--' + w.status" [class.kpi--wide]="w.wide">
            <div class="kpi__top">
              <span class="kpi__label">{{ w.label }}</span>
              <span class="kpi__icon-wrap">
                <svg class="kpi__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                  <path [attr.d]="w.svgPath" />
                </svg>
              </span>
            </div>
            <div class="kpi__value">{{ w.value }}<span class="kpi__unit">{{ w.unit }}</span></div>
            @if (w.trend) {
              <div class="kpi__trend" [class.kpi__trend--up]="w.trendUp" [class.kpi__trend--down]="w.trendUp===false">{{ w.trend }}</div>
            }
          </div>
        }
      </div>

      <div class="dash__main-grid">
        <div class="dash__col-main">
          @if (config().recentActivity.length > 0) {
            <section class="panel">
              <div class="panel__header"><h2 class="panel__title">Recent Activity</h2></div>
              <div class="panel__activity">
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
          }
        </div>

        <aside class="dash__col-aside">
          @if (config().quickActions.length > 0) {
            <section class="panel">
              <div class="panel__header"><h2 class="panel__title">Quick Actions</h2></div>
              <div class="panel__actions">
                @for (a of config().quickActions; track a.label) {
                  <button class="action-btn" [class.action-btn--primary]="a.primary" type="button">
                    <svg class="action-btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                      <path [attr.d]="a.svgPath" />
                    </svg>
                    <span class="action-btn__label">{{ a.label }}</span>
                  </button>
                }
              </div>
            </section>
          }
        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .dash { padding: var(--space-6); max-width: 1600px; }

    .dash__header { display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-4); margin-bottom: var(--space-6); flex-wrap: wrap; }
    .dash__breadcrumb { font-size: var(--font-size-xs); color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: var(--letter-spacing-wider); font-weight: var(--font-weight-medium); margin-bottom: var(--space-1); }
    .dash__title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); line-height: var(--line-height-tight); }
    .dash__header-right { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
    .dash__role-badge { display: inline-flex; align-items: center; padding: var(--space-1) var(--space-3); background-color: var(--color-surface-2); border: 1px solid var(--color-border-default); border-radius: var(--radius-badge); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); letter-spacing: var(--letter-spacing-wider); }

    .btn { display: inline-flex; align-items: center; gap: var(--space-1-5); border-radius: var(--radius-button); border: none; cursor: pointer; font-family: var(--font-family-sans); font-weight: var(--font-weight-medium); transition: var(--transition-color); }
    .btn--ghost { background: transparent; border: 1px solid var(--color-border-default); color: var(--color-text-secondary); }
    .btn--ghost:hover { background-color: var(--color-surface-2); color: var(--color-text-primary); }
    .btn--sm { height: 32px; padding: 0 var(--space-3); font-size: var(--font-size-sm); }

    .dash__kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); margin-bottom: var(--space-6); }
    @media (max-width: 1279px) { .dash__kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px) { .dash__kpi-grid { grid-template-columns: 1fr; } }

    .kpi { background-color: var(--color-surface-1); border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); padding: var(--space-5); position: relative; overflow: hidden; transition: box-shadow var(--duration-fast) var(--ease-default), transform var(--duration-fast) var(--ease-default); }
    .kpi:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
    .kpi--wide { grid-column: span 2; }
    @media (max-width: 767px) { .kpi--wide { grid-column: span 1; } }
    .kpi::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background-color: var(--color-border-default); }
    .kpi--healthy::before { background-color: var(--color-success); }
    .kpi--warning::before { background-color: var(--color-warning); }
    .kpi--error::before { background-color: var(--color-error); }
    .kpi--info::before { background-color: var(--color-primary); }
    .kpi--neutral::before { background-color: var(--color-border-strong); }

    .kpi__top { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); }
    .kpi__label { font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: var(--letter-spacing-wide); }
    .kpi__icon-wrap { width: 36px; height: 36px; border-radius: var(--radius-md); background-color: var(--color-surface-2); display: flex; align-items: center; justify-content: center; }
    .kpi__icon { width: 18px; height: 18px; color: var(--color-text-tertiary); }
    .kpi--healthy .kpi__icon { color: var(--color-success); }
    .kpi--warning .kpi__icon { color: var(--color-warning); }
    .kpi--error .kpi__icon { color: var(--color-error); }
    .kpi--info .kpi__icon { color: var(--color-primary); }
    .kpi__value { font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); color: var(--color-text-primary); line-height: 1; display: flex; align-items: baseline; gap: var(--space-1); }
    .kpi__unit { font-size: var(--font-size-sm); font-weight: var(--font-weight-regular); color: var(--color-text-secondary); }
    .kpi__trend { font-size: var(--font-size-xs); color: var(--color-text-tertiary); margin-top: var(--space-2); }
    .kpi__trend--up { color: var(--color-success); }
    .kpi__trend--down { color: var(--color-error); }

    .dash__main-grid { display: grid; grid-template-columns: 1fr 300px; gap: var(--space-5); align-items: start; }
    @media (max-width: 1279px) { .dash__main-grid { grid-template-columns: 1fr; } }
    .dash__col-main { display: flex; flex-direction: column; gap: var(--space-5); }
    .dash__col-aside { display: flex; flex-direction: column; gap: var(--space-5); }

    .panel { background-color: var(--color-surface-1); border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); overflow: hidden; }
    .panel__header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-5); border-bottom: 1px solid var(--color-border-muted); }
    .panel__title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }

    .panel__activity { padding: var(--space-1) 0; }
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

    .panel__actions { padding: var(--space-2); display: flex; flex-direction: column; gap: var(--space-1); }
    .action-btn { display: flex; align-items: center; gap: var(--space-3); width: 100%; padding: var(--space-2-5) var(--space-3); background: none; border: none; border-radius: var(--radius-md); color: var(--color-text-primary); cursor: pointer; font-size: var(--font-size-sm); font-family: var(--font-family-sans); transition: var(--transition-color); text-align: left; }
    .action-btn:hover { background-color: var(--color-surface-2); }
    .action-btn--primary { font-weight: var(--font-weight-medium); color: var(--color-primary); }
    .action-btn--primary:hover { background-color: var(--color-info-light); }
    .action-btn__icon { width: 16px; height: 16px; color: var(--color-text-secondary); flex-shrink: 0; }
    .action-btn--primary .action-btn__icon { color: var(--color-primary); }
    .action-btn__label { flex: 1; }
  `]
})
export class HomePageComponent {
  private readonly authStore = inject(AuthStore);

  readonly currentRole = computed(() => this.authStore.currentRole() ?? 'VIEWER');
  readonly config = computed<DashboardConfig>(() => getDashboardConfig(this.currentRole()));
}

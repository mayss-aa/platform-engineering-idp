import { Component, ChangeDetectionStrategy } from '@angular/core';

// ─── Data interfaces ──────────────────────────────────────────
interface KpiWidget {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  status: 'healthy' | 'warning' | 'error' | 'info' | 'neutral';
  svgPath: string;
}

interface ActivityEntry {
  actor: string;
  action: string;
  target: string;
  time: string;
  type: 'deploy' | 'provision' | 'incident' | 'user' | 'terraform';
}

interface ServiceHealth {
  name: string;
  category: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  uptime: string;
  latency: string;
}

@Component({
  selector: 'idp-home-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dash">

      <!-- ══ Page header ══════════════════════════════════ -->
      <div class="dash__header">
        <div>
          <p class="dash__breadcrumb">Platform Overview</p>
          <h1 class="dash__title">Platform Engineering Dashboard</h1>
          <p class="dash__subtitle">
            Real-time health &amp; operational metrics &mdash; Sprint&nbsp;1 &bull; Mock data active
          </p>
        </div>
        <div class="dash__header-actions">
          <button class="btn btn--ghost btn--sm" type="button">
            <svg class="btn__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M4 2a1 1 0 0 1 1 1v2.101a7.002 7.002 0 0 1 11.601 2.566 1 1 0 1 1-1.885.666A5.002 5.002 0 0 0 5.999 7H9a1 1 0 0 1 0 2H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Zm.008 9.057a1 1 0 0 1 1.276.61A5.002 5.002 0 0 0 14.001 13H11a1 1 0 1 1 0-2h5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-2.101a7.002 7.002 0 0 1-11.601-2.566 1 1 0 0 1 .608-1.276Z"/>
            </svg>
            Refresh
          </button>
          <div class="dash__status-pill">
            <span class="dash__status-dot dash__status-dot--green"></span>
            All Systems Operational
          </div>
        </div>
      </div>

      <!-- ══ KPI grid ══════════════════════════════════════ -->
      <div class="dash__kpi-grid">
        @for (w of kpiWidgets; track w.label) {
          <div class="kpi" [class]="'kpi--' + w.status">
            <div class="kpi__top">
              <span class="kpi__label">{{ w.label }}</span>
              <span class="kpi__icon-wrap">
                <svg class="kpi__icon" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="1.75"
                  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path [attr.d]="w.svgPath" />
                </svg>
              </span>
            </div>
            <div class="kpi__value">
              {{ w.value }}
              @if (w.unit) { <span class="kpi__unit">{{ w.unit }}</span> }
            </div>
            @if (w.trend) {
              <div class="kpi__trend" [class.kpi__trend--up]="w.trendUp" [class.kpi__trend--down]="w.trendUp === false">
                {{ w.trend }}
              </div>
            }
          </div>
        }
      </div>

      <!-- ══ Main 2-col grid ═══════════════════════════════ -->
      <div class="dash__main-grid">

        <!-- ── Left column ──────────────────────────────── -->
        <div class="dash__col-main">

          <!-- Service health table -->
          <section class="panel">
            <div class="panel__header">
              <h2 class="panel__title">Service Health</h2>
              <span class="panel__meta">{{ serviceHealth.length }} services monitored</span>
            </div>
            <div class="panel__table-wrap">
              <table class="data-table" aria-label="Service health overview">
                <thead>
                  <tr>
                    <th class="data-table__th">Service</th>
                    <th class="data-table__th">Category</th>
                    <th class="data-table__th">Status</th>
                    <th class="data-table__th">Uptime</th>
                    <th class="data-table__th">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  @for (svc of serviceHealth; track svc.name) {
                    <tr class="data-table__row">
                      <td class="data-table__td data-table__td--name">{{ svc.name }}</td>
                      <td class="data-table__td data-table__td--muted">{{ svc.category }}</td>
                      <td class="data-table__td">
                        <span class="badge" [class]="'badge--' + svc.status.toLowerCase()">
                          {{ svc.status }}
                        </span>
                      </td>
                      <td class="data-table__td data-table__td--mono">{{ svc.uptime }}</td>
                      <td class="data-table__td data-table__td--mono">{{ svc.latency }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </section>

          <!-- Recent activity -->
          <section class="panel">
            <div class="panel__header">
              <h2 class="panel__title">Recent Activity</h2>
              <span class="panel__meta">Last 20 events</span>
            </div>
            <div class="panel__activity">
              @for (entry of recentActivity; track entry.time + entry.target) {
                <div class="activity-row">
                  <span class="activity-row__dot" [class]="'activity-row__dot--' + entry.type"></span>
                  <span class="activity-row__actor">{{ entry.actor }}</span>
                  <span class="activity-row__action">{{ entry.action }}</span>
                  <span class="activity-row__target">{{ entry.target }}</span>
                  <span class="activity-row__time">{{ entry.time }}</span>
                </div>
              }
            </div>
          </section>

        </div>

        <!-- ── Right column ─────────────────────────────── -->
        <aside class="dash__col-aside">

          <!-- Platform info -->
          <section class="panel">
            <div class="panel__header">
              <h2 class="panel__title">Platform Stack</h2>
            </div>
            <div class="panel__rows">
              @for (row of stackInfo; track row.label) {
                <div class="info-row">
                  <span class="info-row__label">{{ row.label }}</span>
                  <span class="info-row__value">{{ row.value }}</span>
                </div>
              }
            </div>
          </section>

          <!-- Quick actions -->
          <section class="panel">
            <div class="panel__header">
              <h2 class="panel__title">Quick Actions</h2>
            </div>
            <div class="panel__actions">
              @for (action of quickActions; track action.label) {
                <button class="action-btn" type="button">
                  <svg class="action-btn__icon" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.75"
                    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path [attr.d]="action.svgPath" />
                  </svg>
                  <span class="action-btn__label">{{ action.label }}</span>
                  <svg class="action-btn__arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" clip-rule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"/>
                  </svg>
                </button>
              }
            </div>
          </section>

          <!-- Engineering roadmap -->
          <section class="panel">
            <div class="panel__header">
              <h2 class="panel__title">Engineering Roadmap</h2>
            </div>
            <div class="panel__roadmap">
              @for (step of roadmap; track step.label) {
                <div class="roadmap-item" [class.roadmap-item--done]="step.done" [class.roadmap-item--active]="step.active">
                  <div class="roadmap-item__connector"></div>
                  <span class="roadmap-item__dot"></span>
                  <div class="roadmap-item__body">
                    <span class="roadmap-item__label">{{ step.label }}</span>
                    @if (step.active) { <span class="roadmap-item__tag">In Progress</span> }
                    @if (step.done)   { <span class="roadmap-item__tag roadmap-item__tag--done">Done</span> }
                  </div>
                </div>
              }
            </div>
          </section>

        </aside>
      </div>
    </div>
  `,
  styles: [`
    /* ── Page shell ──────────────────────────────────────── */
    .dash { padding: var(--space-6); max-width: 1600px; }

    /* ── Header ──────────────────────────────────────────── */
    .dash__header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-6);
      flex-wrap: wrap;
    }
    .dash__breadcrumb {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wider);
      font-weight: var(--font-weight-medium);
      margin-bottom: var(--space-1);
    }
    .dash__title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      line-height: var(--line-height-tight);
      margin-bottom: var(--space-1);
    }
    .dash__subtitle { font-size: var(--font-size-sm); color: var(--color-text-secondary); }
    .dash__header-actions { display: flex; align-items: center; gap: var(--space-3); flex-shrink: 0; }
    .dash__status-pill {
      display: flex; align-items: center; gap: var(--space-1-5);
      padding: var(--space-1) var(--space-3);
      background-color: var(--color-badge-success-bg);
      color: var(--color-badge-success-text);
      border-radius: var(--radius-badge);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
    }
    .dash__status-dot {
      width: 6px; height: 6px; border-radius: var(--radius-full); flex-shrink: 0;
    }
    .dash__status-dot--green { background-color: var(--color-success); }

    /* ── Buttons ─────────────────────────────────────────── */
    .btn {
      display: inline-flex; align-items: center; gap: var(--space-1-5);
      border-radius: var(--radius-button); border: none; cursor: pointer;
      font-family: var(--font-family-sans); font-weight: var(--font-weight-medium);
      transition: var(--transition-color);
    }
    .btn--ghost {
      background-color: transparent;
      border: 1px solid var(--color-border-default);
      color: var(--color-text-secondary);
    }
    .btn--ghost:hover { background-color: var(--color-surface-2); color: var(--color-text-primary); }
    .btn--sm { height: 32px; padding: 0 var(--space-3); font-size: var(--font-size-sm); }
    .btn__icon { width: 14px; height: 14px; flex-shrink: 0; }

    /* ── KPI grid ────────────────────────────────────────── */
    .dash__kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-6);
    }
    @media (max-width: 1279px) { .dash__kpi-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 767px)  { .dash__kpi-grid { grid-template-columns: 1fr; } }

    .kpi {
      background-color: var(--color-surface-1);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      padding: var(--space-4) var(--space-5);
      position: relative;
      overflow: hidden;
    }
    .kpi::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0;
      height: 3px; background-color: var(--color-border-default);
    }
    .kpi--healthy::before  { background-color: var(--color-success); }
    .kpi--warning::before  { background-color: var(--color-warning); }
    .kpi--error::before    { background-color: var(--color-error); }
    .kpi--info::before     { background-color: var(--color-primary); }
    .kpi--neutral::before  { background-color: var(--color-border-strong); }

    .kpi__top { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3); }
    .kpi__label {
      font-size: var(--font-size-xs); font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary); text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }
    .kpi__icon-wrap {
      width: 32px; height: 32px; border-radius: var(--radius-md);
      background-color: var(--color-surface-2);
      display: flex; align-items: center; justify-content: center;
    }
    .kpi__icon { width: 16px; height: 16px; color: var(--color-text-tertiary); }
    .kpi--healthy .kpi__icon { color: var(--color-success); }
    .kpi--warning .kpi__icon { color: var(--color-warning); }
    .kpi--error   .kpi__icon { color: var(--color-error); }
    .kpi--info    .kpi__icon { color: var(--color-primary); }

    .kpi__value {
      font-size: var(--font-size-3xl); font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary); line-height: 1;
      display: flex; align-items: baseline; gap: var(--space-1);
    }
    .kpi__unit { font-size: var(--font-size-sm); font-weight: var(--font-weight-regular); color: var(--color-text-secondary); }
    .kpi__trend { font-size: var(--font-size-xs); color: var(--color-text-tertiary); margin-top: var(--space-2); }
    .kpi__trend--up   { color: var(--color-success); }
    .kpi__trend--down { color: var(--color-error); }

    /* ── Main grid ───────────────────────────────────────── */
    .dash__main-grid {
      display: grid; grid-template-columns: 1fr 300px;
      gap: var(--space-5); align-items: start;
    }
    @media (max-width: 1279px) { .dash__main-grid { grid-template-columns: 1fr; } }

    .dash__col-main { display: flex; flex-direction: column; gap: var(--space-5); }
    .dash__col-aside { display: flex; flex-direction: column; gap: var(--space-5); }

    /* ── Panel ───────────────────────────────────────────── */
    .panel {
      background-color: var(--color-surface-1);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg); overflow: hidden;
    }
    .panel__header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-3) var(--space-5);
      border-bottom: 1px solid var(--color-border-muted);
    }
    .panel__title { font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .panel__meta  { font-size: var(--font-size-xs); color: var(--color-text-tertiary); }

    /* ── Data table ──────────────────────────────────────── */
    .panel__table-wrap { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table__th {
      padding: var(--space-2) var(--space-4);
      font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary); text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide); text-align: left;
      background-color: var(--color-surface-2);
      border-bottom: 1px solid var(--color-border-muted);
      white-space: nowrap;
    }
    .data-table__row { transition: background-color var(--duration-fast) var(--ease-default); }
    .data-table__row:hover { background-color: var(--color-surface-2); }
    .data-table__row:not(:last-child) td { border-bottom: 1px solid var(--color-border-muted); }
    .data-table__td { padding: var(--space-2-5) var(--space-4); font-size: var(--font-size-sm); color: var(--color-text-primary); }
    .data-table__td--muted { color: var(--color-text-secondary); }
    .data-table__td--mono { font-family: var(--font-family-mono); font-size: var(--font-size-xs); }
    .data-table__td--name { font-weight: var(--font-weight-medium); }

    /* ── Status badge ────────────────────────────────────── */
    .badge {
      display: inline-flex; align-items: center;
      padding: 2px var(--space-2);
      border-radius: var(--radius-badge);
      font-size: var(--font-size-xs); font-weight: var(--font-weight-medium);
      letter-spacing: var(--letter-spacing-wide); white-space: nowrap;
    }
    .badge--healthy    { background-color: var(--color-badge-healthy-bg);    color: var(--color-badge-healthy-text); }
    .badge--degraded   { background-color: var(--color-badge-degraded-bg);   color: var(--color-badge-degraded-text); }
    .badge--unavailable{ background-color: var(--color-badge-unavailable-bg);color: var(--color-badge-unavailable-text); }

    /* ── Activity feed ───────────────────────────────────── */
    .panel__activity { padding: var(--space-1) 0; }
    .activity-row {
      display: flex; align-items: center; gap: var(--space-2);
      padding: var(--space-2) var(--space-5); font-size: var(--font-size-xs);
    }
    .activity-row:not(:last-child) { border-bottom: 1px solid var(--color-border-muted); }
    .activity-row__dot {
      width: 7px; height: 7px; border-radius: var(--radius-full); flex-shrink: 0;
    }
    .activity-row__dot--deploy    { background-color: var(--color-primary); }
    .activity-row__dot--provision { background-color: var(--color-accent); }
    .activity-row__dot--incident  { background-color: var(--color-error); }
    .activity-row__dot--user      { background-color: var(--color-success); }
    .activity-row__dot--terraform { background-color: var(--color-secondary); }
    .activity-row__actor  { font-weight: var(--font-weight-medium); color: var(--color-text-primary); white-space: nowrap; }
    .activity-row__action { color: var(--color-text-secondary); white-space: nowrap; }
    .activity-row__target { color: var(--color-text-link); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; }
    .activity-row__time   { color: var(--color-text-tertiary); white-space: nowrap; margin-left: auto; }

    /* ── Info rows ───────────────────────────────────────── */
    .panel__rows { padding: var(--space-1) 0; }
    .info-row {
      display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);
      padding: var(--space-2) var(--space-5); font-size: var(--font-size-xs);
    }
    .info-row:not(:last-child) { border-bottom: 1px solid var(--color-border-muted); }
    .info-row__label { color: var(--color-text-secondary); }
    .info-row__value { font-weight: var(--font-weight-medium); color: var(--color-text-primary); }

    /* ── Quick action buttons ────────────────────────────── */
    .panel__actions { padding: var(--space-2); display: flex; flex-direction: column; gap: var(--space-1); }
    .action-btn {
      display: flex; align-items: center; gap: var(--space-3);
      width: 100%; padding: var(--space-2) var(--space-3);
      background: none; border: none; border-radius: var(--radius-md);
      color: var(--color-text-primary); cursor: pointer;
      font-size: var(--font-size-sm); font-family: var(--font-family-sans);
      transition: var(--transition-color); text-align: left;
    }
    .action-btn:hover { background-color: var(--color-surface-2); }
    .action-btn__icon { width: 16px; height: 16px; color: var(--color-text-secondary); flex-shrink: 0; }
    .action-btn__label { flex: 1; }
    .action-btn__arrow { width: 14px; height: 14px; color: var(--color-text-tertiary); flex-shrink: 0; }

    /* ── Roadmap ─────────────────────────────────────────── */
    .panel__roadmap { padding: var(--space-4) var(--space-5); display: flex; flex-direction: column; }
    .roadmap-item { display: flex; align-items: flex-start; gap: var(--space-3); position: relative; padding-bottom: var(--space-4); }
    .roadmap-item:last-child { padding-bottom: 0; }
    .roadmap-item__connector {
      position: absolute; left: 3px; top: 14px; bottom: 0;
      width: 1px; background-color: var(--color-border-muted);
    }
    .roadmap-item:last-child .roadmap-item__connector { display: none; }
    .roadmap-item__dot {
      width: 8px; height: 8px; border-radius: var(--radius-full);
      background-color: var(--color-border-strong); flex-shrink: 0; margin-top: 3px;
      position: relative; z-index: 1;
    }
    .roadmap-item--done .roadmap-item__dot   { background-color: var(--color-success); }
    .roadmap-item--active .roadmap-item__dot { background-color: var(--color-primary); box-shadow: 0 0 0 3px var(--color-info-light); }
    .roadmap-item__body { display: flex; align-items: center; gap: var(--space-2); flex: 1; min-width: 0; }
    .roadmap-item__label { font-size: var(--font-size-xs); color: var(--color-text-secondary); flex: 1; }
    .roadmap-item--done .roadmap-item__label   { color: var(--color-text-primary); }
    .roadmap-item--active .roadmap-item__label { color: var(--color-primary); font-weight: var(--font-weight-medium); }
    .roadmap-item__tag {
      font-size: 10px; font-weight: var(--font-weight-medium);
      color: var(--color-badge-running-text); background-color: var(--color-badge-running-bg);
      padding: 1px var(--space-1-5); border-radius: var(--radius-badge);
      white-space: nowrap; letter-spacing: var(--letter-spacing-wide);
    }
    .roadmap-item__tag--done { color: var(--color-badge-success-text); background-color: var(--color-badge-success-bg); }
  `]
})
export class HomePageComponent {
  readonly kpiWidgets: KpiWidget[] = [
    { label: 'Cluster Health', value: '99.9', unit: '%', status: 'healthy', trend: '↑ Up from 99.7% yesterday', trendUp: true, svgPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { label: 'Running Deployments', value: '12', unit: 'active', status: 'info', trend: '+2 triggered today', trendUp: true, svgPath: 'M5 10l7-7m0 0 7 7m-7-7v18' },
    { label: 'Terraform Jobs', value: '4', unit: 'running', status: 'info', trend: '2 pending approval', svgPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' },
    { label: 'Active Pods', value: '247', unit: 'pods', status: 'healthy', trend: '↑ +11 in 1h', trendUp: true, svgPath: 'M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'CPU Usage', value: '64', unit: '%', status: 'warning', trend: '↑ +8% vs last hour', trendUp: false, svgPath: 'M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18' },
    { label: 'Memory Usage', value: '71', unit: '%', status: 'warning', trend: '14.2 GB / 20 GB used', svgPath: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4' },
    { label: 'Storage', value: '2.4', unit: 'TB used', status: 'neutral', trend: '58% capacity', svgPath: 'M5 8h14M5 8a2 2 0 1 1 0-4h14a2 2 0 1 1 0 4M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8m-9 4h4' },
    { label: 'Cloud Cost', value: '€3,241', unit: '/mo', status: 'info', trend: '↓ -7% vs last month', trendUp: true, svgPath: 'M3 15a4 4 0 0 0 4 4h9a5 5 0 1 0-.1-9.999 5.002 5.002 0 0 0-9.78 2.096A4.001 4.001 0 0 0 3 15z' },
    { label: 'Open Incidents', value: '1', unit: 'active', status: 'warning', trend: 'No P1 or P2 — 1 P3', svgPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { label: 'Pending Approvals', value: '5', unit: 'requests', status: 'warning', trend: '3 provision · 2 deploy', svgPath: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4' },
    { label: 'Failed Pipelines', value: '2', unit: 'last 24h', status: 'error', trend: '↓ Down from 5 yesterday', trendUp: true, svgPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15' },
    { label: 'Platform Modules', value: '19', unit: 'scaffolded', status: 'healthy', trend: 'Sprint 1 complete', svgPath: 'M4 6h16M4 10h16M4 14h16M4 18h16' },
  ];

  readonly serviceHealth: ServiceHealth[] = [
    { name: 'API Gateway',       category: 'Core',        status: 'HEALTHY',     uptime: '99.97%', latency: '42 ms'  },
    { name: 'Auth Service',      category: 'Security',    status: 'HEALTHY',     uptime: '99.99%', latency: '18 ms'  },
    { name: 'Deployment Engine', category: 'CI/CD',       status: 'HEALTHY',     uptime: '99.82%', latency: '310 ms' },
    { name: 'Terraform Runner',  category: 'IaC',         status: 'DEGRADED',    uptime: '98.10%', latency: '1.2 s'  },
    { name: 'Notification Hub',  category: 'Messaging',   status: 'HEALTHY',     uptime: '99.95%', latency: '55 ms'  },
    { name: 'Metrics Collector', category: 'Observability',status: 'HEALTHY',    uptime: '99.91%', latency: '70 ms'  },
    { name: 'Secret Manager',    category: 'Security',    status: 'HEALTHY',     uptime: '100.00%',latency: '12 ms'  },
    { name: 'Log Aggregator',    category: 'Observability',status: 'UNAVAILABLE', uptime: '95.40%', latency: 'N/A'    },
  ];

  readonly recentActivity: ActivityEntry[] = [
    { actor: 'alice.martin',   action: 'triggered deployment',     target: 'payments-service v2.4.1',  time: '2 min ago',  type: 'deploy'    },
    { actor: 'bob.chen',       action: 'approved provision request',target: 'PR-1042 Redis cluster',    time: '8 min ago',  type: 'provision' },
    { actor: 'System',         action: 'escalated incident',       target: 'INC-0081 API latency spike',time: '14 min ago', type: 'incident'  },
    { actor: 'carol.dubois',   action: 'applied terraform plan',   target: 'prod-aks-cluster-v3',      time: '22 min ago', type: 'terraform' },
    { actor: 'david.kwame',    action: 'joined team',              target: 'Platform Engineering Core', time: '35 min ago', type: 'user'      },
    { actor: 'alice.martin',   action: 'triggered deployment',     target: 'auth-service v1.9.3',      time: '47 min ago', type: 'deploy'    },
    { actor: 'System',         action: 'auto-scaled deployment',   target: 'api-gateway → 6 replicas', time: '1 hr ago',   type: 'deploy'    },
    { actor: 'emma.schulz',    action: 'created provision request',target: 'PR-1043 PostgreSQL HA',    time: '1.5 hr ago', type: 'provision' },
    { actor: 'bob.chen',       action: 'resolved incident',        target: 'INC-0080 DB timeout',      time: '2 hr ago',   type: 'incident'  },
    { actor: 'carol.dubois',   action: 'planned terraform',        target: 'staging-network-v2',       time: '3 hr ago',   type: 'terraform' },
  ];

  readonly stackInfo = [
    { label: 'Frontend',    value: 'Angular 20 + Signals'  },
    { label: 'Backend',     value: 'Spring Boot 3 / Java 21'},
    { label: 'Auth',        value: 'JWT Bearer'             },
    { label: 'Kubernetes',  value: 'AKS 1.29'              },
    { label: 'CI/CD',       value: 'GitHub Actions'         },
    { label: 'GitOps',      value: 'ArgoCD'                 },
    { label: 'Monitoring',  value: 'Prometheus + Grafana'   },
    { label: 'Logs',        value: 'Loki + Promtail'        },
    { label: 'Data mode',   value: 'MOCK (Sprint 1)'        },
  ];

  readonly quickActions = [
    { label: 'Trigger Deployment',     svgPath: 'M5 10l7-7m0 0 7 7m-7-7v18' },
    { label: 'Submit Provision Request',svgPath: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2' },
    { label: 'Open Incident',          svgPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { label: 'Plan Terraform',         svgPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z' },
    { label: 'Ask AI Assistant',       svgPath: 'M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  ];

  readonly roadmap = [
    { label: 'Spring Boot 3 Backend + Docker', done: true,   active: false },
    { label: 'Angular 20 Shell + Design System', done: false, active: true  },
    { label: 'Kubernetes + AKS Deployment',    done: false,  active: false },
    { label: 'GitHub Actions CI/CD',           done: false,  active: false },
    { label: 'ArgoCD GitOps',                  done: false,  active: false },
    { label: 'Prometheus / Grafana / Loki',    done: false,  active: false },
    { label: 'AI-Powered Platform Engineering',done: false,  active: false },
  ];
}

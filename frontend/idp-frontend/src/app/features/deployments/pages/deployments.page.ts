import { Component, inject, OnInit, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { DeploymentStore } from '../store/deployment.store';
import { Deployment } from '../models/deployment.models';

@Component({
  selector: 'idp-deployments-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">Deployments</h1>
        <p class="page__subtitle">Monitor and manage application deployments</p>
      </div>

      <div class="page__toolbar">
        <input class="page__search" type="search" placeholder="Search deployments..." [value]="searchTerm()" (input)="onSearch($event)" />
      </div>

      @if (store.deployments.loading()) { <p class="page__loading">Loading deployments...</p> }
      @if (store.deployments.hasError()) { <p class="page__error">{{ store.deployments.error() }}</p> }
      @if (store.deployments.hasData()) {
        <div class="page__table-wrap">
          <table class="table">
            <thead><tr>
              <th class="table__th">Application</th>
              <th class="table__th">Version</th>
              <th class="table__th">Environment</th>
              <th class="table__th">Strategy</th>
              <th class="table__th">Status</th>
              <th class="table__th">Health</th>
              <th class="table__th">Triggered By</th>
              <th class="table__th">Replicas</th>
            </tr></thead>
            <tbody>
              @for (dep of filtered(); track dep.id) {
                <tr class="table__row">
                  <td class="table__td table__td--name">{{ dep.applicationName }}</td>
                  <td class="table__td table__td--mono">{{ dep.version }}</td>
                  <td class="table__td"><span class="env-badge">{{ dep.environment }}</span></td>
                  <td class="table__td">{{ dep.deploymentStrategy }}</td>
                  <td class="table__td"><span class="status" [class]="'status--' + dep.deploymentStatus.toLowerCase().replace('_', '-')">{{ dep.deploymentStatus }}</span></td>
                  <td class="table__td"><span class="health" [class]="'health--' + dep.healthStatus.toLowerCase()">{{ dep.healthStatus }}</span></td>
                  <td class="table__td">{{ dep.triggeredBy }}</td>
                  <td class="table__td table__td--mono">{{ dep.availableReplicas }}/{{ dep.desiredReplicas }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (filtered().length === 0) { <p class="page__empty">No deployments match your search.</p> }
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
    .page { padding: var(--space-6); max-width: 1600px; }
    .page__header { margin-bottom: var(--space-4); }
    .page__title { font-size: var(--font-size-2xl); font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
    .page__subtitle { font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-1); }
    .page__toolbar { margin-bottom: var(--space-4); }
    .page__search { width: 100%; max-width: 400px; height: 36px; padding: 0 var(--space-3); background-color: var(--color-surface-2); border: 1px solid var(--color-border-default); border-radius: var(--radius-md); font-size: var(--font-size-sm); font-family: var(--font-family-sans); color: var(--color-text-primary); outline: none; }
    .page__search:focus { border-color: var(--color-border-focus); }
    .page__loading, .page__error, .page__empty { padding: var(--space-8); text-align: center; font-size: var(--font-size-sm); color: var(--color-text-tertiary); }
    .page__error { color: var(--color-error); }
    .page__table-wrap { overflow-x: auto; border: 1px solid var(--color-border-default); border-radius: var(--radius-lg); background-color: var(--color-surface-1); }
    .table { width: 100%; border-collapse: collapse; }
    .table__th { padding: var(--space-2-5) var(--space-4); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: var(--letter-spacing-wide); text-align: left; background-color: var(--color-surface-2); border-bottom: 1px solid var(--color-border-muted); white-space: nowrap; position: sticky; top: 0; }
    .table__row:hover { background-color: var(--color-surface-2); }
    .table__row:not(:last-child) td { border-bottom: 1px solid var(--color-border-muted); }
    .table__td { padding: var(--space-2-5) var(--space-4); font-size: var(--font-size-sm); color: var(--color-text-primary); white-space: nowrap; }
    .table__td--name { font-weight: var(--font-weight-medium); }
    .table__td--mono { font-family: var(--font-family-mono); font-size: var(--font-size-xs); }

    .env-badge { display: inline-flex; padding: 2px var(--space-2); border-radius: var(--radius-badge); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); background-color: var(--color-surface-2); color: var(--color-text-secondary); border: 1px solid var(--color-border-default); }

    .status, .health { display: inline-flex; padding: 2px var(--space-2); border-radius: var(--radius-badge); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }
    .status--running { background-color: var(--color-badge-running-bg); color: var(--color-badge-running-text); }
    .status--progressing { background-color: var(--color-badge-running-bg); color: var(--color-badge-running-text); }
    .status--pending { background-color: var(--color-badge-pending-bg); color: var(--color-badge-pending-text); }
    .status--failed { background-color: var(--color-badge-failed-bg); color: var(--color-badge-failed-text); }
    .status--completed { background-color: var(--color-badge-success-bg); color: var(--color-badge-success-text); }
    .status--cancelled { background-color: var(--color-badge-cancelled-bg); color: var(--color-badge-cancelled-text); }
    .status--rolling-back { background-color: var(--color-badge-degraded-bg); color: var(--color-badge-degraded-text); }

    .health--healthy { background-color: var(--color-badge-healthy-bg); color: var(--color-badge-healthy-text); }
    .health--degraded { background-color: var(--color-badge-degraded-bg); color: var(--color-badge-degraded-text); }
    .health--unhealthy { background-color: var(--color-badge-failed-bg); color: var(--color-badge-failed-text); }
    .health--unknown { background-color: var(--color-badge-idle-bg); color: var(--color-badge-idle-text); }
  `]
})
export class DeploymentsPageComponent implements OnInit {
  readonly store = inject(DeploymentStore);
  readonly searchTerm = signal('');

  readonly filtered = computed<Deployment[]>(() => {
    const data = this.store.deployments.data();
    if (!data) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return data.deployments;
    return data.deployments.filter((d) =>
      d.applicationName.toLowerCase().includes(term) ||
      d.version.toLowerCase().includes(term) ||
      d.environment.toLowerCase().includes(term) ||
      d.deploymentStatus.toLowerCase().includes(term) ||
      d.triggeredBy.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void { this.store.load(); }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}

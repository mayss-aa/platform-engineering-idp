import { Component, inject, OnInit, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { TerraformStore } from '../store/terraform.store';
import { TerraformExecution } from '../models/terraform.models';

@Component({
  selector: 'idp-terraform-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">Terraform</h1>
        <p class="page__subtitle">Infrastructure as Code execution management</p>
      </div>

      <div class="page__toolbar">
        <input class="page__search" type="search" placeholder="Search executions..." [value]="searchTerm()" (input)="onSearch($event)" />
      </div>

      @if (store.executions.loading()) { <p class="page__loading">Loading executions...</p> }
      @if (store.executions.hasError()) { <p class="page__error">{{ store.executions.error() }}</p> }
      @if (store.executions.hasData()) {
        <div class="page__table-wrap">
          <table class="table">
            <thead><tr>
              <th class="table__th">Workspace</th>
              <th class="table__th">Type</th>
              <th class="table__th">Status</th>
              <th class="table__th">Environment</th>
              <th class="table__th">Resources</th>
              <th class="table__th">Cost Impact</th>
              <th class="table__th">Created By</th>
              <th class="table__th">Duration</th>
            </tr></thead>
            <tbody>
              @for (exec of filtered(); track exec.id) {
                <tr class="table__row">
                  <td class="table__td table__td--name">{{ exec.workspace }}</td>
                  <td class="table__td"><span class="type-badge" [class]="'type-badge--' + exec.executionType.toLowerCase()">{{ exec.executionType }}</span></td>
                  <td class="table__td"><span class="status" [class]="'status--' + exec.executionStatus.toLowerCase().replace('_', '-')">{{ exec.executionStatus }}</span></td>
                  <td class="table__td"><span class="env-badge">{{ exec.environment }}</span></td>
                  <td class="table__td table__td--mono">+{{ exec.resourcesToAdd }} ~{{ exec.resourcesToChange }} -{{ exec.resourcesToDestroy }}</td>
                  <td class="table__td table__td--mono">{{ exec.costImpact ?? 'N/A' }}</td>
                  <td class="table__td">{{ exec.createdBy }}</td>
                  <td class="table__td table__td--mono">{{ exec.duration ?? 'In progress' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (filtered().length === 0) { <p class="page__empty">No executions match your search.</p> }
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

    .type-badge { display: inline-flex; padding: 2px var(--space-2); border-radius: var(--radius-badge); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); }
    .type-badge--plan { background-color: var(--color-badge-running-bg); color: var(--color-badge-running-text); }
    .type-badge--apply { background-color: var(--color-badge-success-bg); color: var(--color-badge-success-text); }
    .type-badge--destroy { background-color: var(--color-badge-failed-bg); color: var(--color-badge-failed-text); }

    .status { display: inline-flex; padding: 2px var(--space-2); border-radius: var(--radius-badge); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }
    .status--pending { background-color: var(--color-badge-pending-bg); color: var(--color-badge-pending-text); }
    .status--running { background-color: var(--color-badge-running-bg); color: var(--color-badge-running-text); }
    .status--succeeded { background-color: var(--color-badge-success-bg); color: var(--color-badge-success-text); }
    .status--failed { background-color: var(--color-badge-failed-bg); color: var(--color-badge-failed-text); }
    .status--cancelled { background-color: var(--color-badge-cancelled-bg); color: var(--color-badge-cancelled-text); }
    .status--awaiting-approval { background-color: var(--color-badge-pending-bg); color: var(--color-badge-pending-text); }
  `]
})
export class TerraformPageComponent implements OnInit {
  readonly store = inject(TerraformStore);
  readonly searchTerm = signal('');

  readonly filtered = computed<TerraformExecution[]>(() => {
    const data = this.store.executions.data();
    if (!data) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return data.executions;
    return data.executions.filter((e) =>
      e.workspace.toLowerCase().includes(term) ||
      e.executionType.toLowerCase().includes(term) ||
      e.executionStatus.toLowerCase().includes(term) ||
      e.environment.toLowerCase().includes(term) ||
      e.createdBy.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void { this.store.load(); }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}

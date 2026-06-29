import { Component, inject, OnInit, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { ProvisionRequestStore } from '../store/provision-request.store';
import { ProvisionRequest } from '../models/provision-request.models';

@Component({
  selector: 'idp-provision-requests-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">Provision Requests</h1>
        <p class="page__subtitle">Track infrastructure provisioning workflows</p>
      </div>

      <div class="page__toolbar">
        <input
          class="page__search"
          type="search"
          placeholder="Search requests..."
          [value]="searchTerm()"
          (input)="onSearch($event)"
        />
      </div>

      @if (store.requests.loading()) {
        <p class="page__loading">Loading requests...</p>
      }
      @if (store.requests.hasError()) {
        <p class="page__error">{{ store.requests.error() }}</p>
      }
      @if (store.requests.hasData()) {
        <div class="page__table-wrap">
          <table class="table">
            <thead><tr>
              <th class="table__th">ID</th>
              <th class="table__th">Service</th>
              <th class="table__th">Requester</th>
              <th class="table__th">Environment</th>
              <th class="table__th">Priority</th>
              <th class="table__th">Status</th>
              <th class="table__th">Cost</th>
            </tr></thead>
            <tbody>
              @for (req of filteredRequests(); track req.id) {
                <tr class="table__row">
                  <td class="table__td table__td--mono">{{ req.id }}</td>
                  <td class="table__td table__td--name">{{ req.requestedService }}</td>
                  <td class="table__td">{{ req.requester }}</td>
                  <td class="table__td">{{ req.environment }}</td>
                  <td class="table__td"><span class="priority" [class]="'priority--' + req.priority.toLowerCase()">{{ req.priority }}</span></td>
                  <td class="table__td"><span class="status" [class]="'status--' + req.status.toLowerCase()">{{ req.status }}</span></td>
                  <td class="table__td table__td--mono">\u20AC{{ req.estimatedMonthlyCost }}/mo</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (filteredRequests().length === 0) {
          <p class="page__empty">No requests match your search.</p>
        }
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
    .table__th { padding: var(--space-2-5) var(--space-4); font-size: var(--font-size-xs); font-weight: var(--font-weight-semibold); color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: var(--letter-spacing-wide); text-align: left; background-color: var(--color-surface-2); border-bottom: 1px solid var(--color-border-muted); }
    .table__row:hover { background-color: var(--color-surface-2); }
    .table__row:not(:last-child) td { border-bottom: 1px solid var(--color-border-muted); }
    .table__td { padding: var(--space-2-5) var(--space-4); font-size: var(--font-size-sm); color: var(--color-text-primary); white-space: nowrap; }
    .table__td--name { font-weight: var(--font-weight-medium); }
    .table__td--mono { font-family: var(--font-family-mono); font-size: var(--font-size-xs); }

    .priority, .status { display: inline-flex; padding: 2px var(--space-2); border-radius: var(--radius-badge); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }
    .priority--low { background-color: var(--color-badge-idle-bg); color: var(--color-badge-idle-text); }
    .priority--medium { background-color: var(--color-badge-pending-bg); color: var(--color-badge-pending-text); }
    .priority--high { background-color: var(--color-badge-degraded-bg); color: var(--color-badge-degraded-text); }
    .priority--critical { background-color: var(--color-badge-failed-bg); color: var(--color-badge-failed-text); }

    .status--draft { background-color: var(--color-badge-idle-bg); color: var(--color-badge-idle-text); }
    .status--submitted { background-color: var(--color-badge-queued-bg); color: var(--color-badge-queued-text); }
    .status--pending_approval { background-color: var(--color-badge-pending-bg); color: var(--color-badge-pending-text); }
    .status--approved { background-color: var(--color-badge-approved-bg); color: var(--color-badge-approved-text); }
    .status--rejected { background-color: var(--color-badge-rejected-bg); color: var(--color-badge-rejected-text); }
    .status--provisioning { background-color: var(--color-badge-running-bg); color: var(--color-badge-running-text); }
    .status--provisioned { background-color: var(--color-badge-provisioned-bg); color: var(--color-badge-provisioned-text); }
    .status--failed { background-color: var(--color-badge-failed-bg); color: var(--color-badge-failed-text); }
    .status--cancelled { background-color: var(--color-badge-cancelled-bg); color: var(--color-badge-cancelled-text); }
  `]
})
export class ProvisionRequestsPageComponent implements OnInit {
  readonly store = inject(ProvisionRequestStore);
  readonly searchTerm = signal('');

  readonly filteredRequests = computed<ProvisionRequest[]>(() => {
    const data = this.store.requests.data();
    if (!data) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return data.requests;
    return data.requests.filter((r) =>
      r.id.toLowerCase().includes(term) ||
      r.requestedService.toLowerCase().includes(term) ||
      r.requester.toLowerCase().includes(term) ||
      r.status.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void { this.store.load(); }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}

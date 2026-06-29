import { Component, inject, OnInit, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { ServiceCatalogStore } from '../store/service-catalog.store';
import { CatalogService } from '../models/service-catalog.models';

@Component({
  selector: 'idp-service-catalog-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <div class="page__header">
        <h1 class="page__title">Service Catalog</h1>
        <p class="page__subtitle">Browse and discover platform services</p>
      </div>

      <div class="page__toolbar">
        <input
          class="page__search"
          type="search"
          placeholder="Search services..."
          [value]="searchTerm()"
          (input)="onSearch($event)"
        />
      </div>

      @if (store.catalog.loading()) {
        <p class="page__loading">Loading services...</p>
      }
      @if (store.catalog.hasError()) {
        <p class="page__error">{{ store.catalog.error() }}</p>
      }
      @if (store.catalog.hasData()) {
        <div class="page__table-wrap">
          <table class="table">
            <thead><tr>
              <th class="table__th">Service</th>
              <th class="table__th">Category</th>
              <th class="table__th">Owner</th>
              <th class="table__th">Health</th>
              <th class="table__th">Version</th>
            </tr></thead>
            <tbody>
              @for (svc of filteredServices(); track svc.id) {
                <tr class="table__row">
                  <td class="table__td table__td--name">{{ svc.name }}</td>
                  <td class="table__td">{{ svc.category }}</td>
                  <td class="table__td">{{ svc.owner }}</td>
                  <td class="table__td"><span class="badge" [class]="'badge--' + svc.healthStatus.toLowerCase()">{{ svc.healthStatus }}</span></td>
                  <td class="table__td table__td--mono">{{ svc.version }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (filteredServices().length === 0) {
          <p class="page__empty">No services match your search.</p>
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
    .table__td { padding: var(--space-2-5) var(--space-4); font-size: var(--font-size-sm); color: var(--color-text-primary); }
    .table__td--name { font-weight: var(--font-weight-medium); }
    .table__td--mono { font-family: var(--font-family-mono); font-size: var(--font-size-xs); }
    .badge { display: inline-flex; padding: 2px var(--space-2); border-radius: var(--radius-badge); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }
    .badge--healthy { background-color: var(--color-badge-healthy-bg); color: var(--color-badge-healthy-text); }
    .badge--degraded { background-color: var(--color-badge-degraded-bg); color: var(--color-badge-degraded-text); }
    .badge--unavailable { background-color: var(--color-badge-unavailable-bg); color: var(--color-badge-unavailable-text); }
  `]
})
export class ServiceCatalogPageComponent implements OnInit {
  readonly store = inject(ServiceCatalogStore);
  readonly searchTerm = signal('');

  readonly filteredServices = computed<CatalogService[]>(() => {
    const data = this.store.catalog.data();
    if (!data) return [];
    const term = this.searchTerm().toLowerCase();
    if (!term) return data.services;
    return data.services.filter((s) =>
      s.name.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term) ||
      s.category.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void { this.store.load(); }

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}

import { Component, Input, Output, EventEmitter, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** Filter field definition. */
export interface FilterFieldDef {
  key: string;
  label: string;
  type: 'dropdown' | 'checkbox' | 'date-range' | 'multi-select';
  options?: { value: string; label: string }[];
}

/**
 * FilterPanel — multi-criteria filter controls for list views.
 *
 * Design (Requirement 26.10):
 * - config: FilterFieldDef[] defining fields
 * - initialValues: pre-applied filter values
 * - Emits filterChange with all active criteria
 * - Supports dropdown, checkbox, date-range, multi-select types
 */
@Component({
  selector: 'idp-filter-panel',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="filter-panel" role="group" aria-label="Filters">
      @for (field of config; track field.key) {
        <div class="filter-panel__field">
          <label class="filter-panel__label" [attr.for]="'filter-' + field.key">{{ field.label }}</label>

          @if (field.type === 'dropdown') {
            <select
              class="filter-panel__select"
              [id]="'filter-' + field.key"
              [ngModel]="getFilterValue(field.key)"
              (ngModelChange)="updateFilter(field.key, $event)"
            >
              <option value="">All</option>
              @for (opt of field.options ?? []; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          }

          @if (field.type === 'checkbox') {
            <div class="filter-panel__checkboxes">
              @for (opt of field.options ?? []; track opt.value) {
                <label class="filter-panel__checkbox-label">
                  <input
                    type="checkbox"
                    class="filter-panel__checkbox"
                    [checked]="isChecked(field.key, opt.value)"
                    (change)="toggleCheckbox(field.key, opt.value)"
                  />
                  {{ opt.label }}
                </label>
              }
            </div>
          }

          @if (field.type === 'date-range') {
            <div class="filter-panel__date-range">
              <input
                type="date"
                class="filter-panel__date-input"
                [ngModel]="getDateValue(field.key, 'start')"
                (ngModelChange)="updateDateRange(field.key, 'start', $event)"
                aria-label="Start date"
              />
              <span class="filter-panel__date-sep">to</span>
              <input
                type="date"
                class="filter-panel__date-input"
                [ngModel]="getDateValue(field.key, 'end')"
                (ngModelChange)="updateDateRange(field.key, 'end', $event)"
                aria-label="End date"
              />
            </div>
          }
        </div>
      }

      @if (hasActiveFilters()) {
        <button class="filter-panel__clear" type="button" (click)="clearAll()">
          Clear filters
        </button>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .filter-panel {
      display: flex;
      align-items: flex-end;
      gap: var(--space-3);
      flex-wrap: wrap;
      padding: var(--space-3) 0;
    }

    .filter-panel__field { display: flex; flex-direction: column; gap: var(--space-1); }

    .filter-panel__label {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
    }

    .filter-panel__select {
      height: 32px;
      padding: 0 var(--space-3);
      background-color: var(--color-surface-2);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-family: var(--font-family-sans);
      color: var(--color-text-primary);
      outline: none;
      min-width: 140px;
    }

    .filter-panel__select:focus { border-color: var(--color-border-focus); }

    .filter-panel__checkboxes { display: flex; gap: var(--space-3); flex-wrap: wrap; }

    .filter-panel__checkbox-label {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      font-size: var(--font-size-sm);
      color: var(--color-text-primary);
      cursor: pointer;
    }

    .filter-panel__checkbox { accent-color: var(--color-primary); }

    .filter-panel__date-range { display: flex; align-items: center; gap: var(--space-2); }

    .filter-panel__date-input {
      height: 32px;
      padding: 0 var(--space-2);
      background-color: var(--color-surface-2);
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-family: var(--font-family-sans);
      color: var(--color-text-primary);
      outline: none;
    }

    .filter-panel__date-input:focus { border-color: var(--color-border-focus); }
    .filter-panel__date-sep { font-size: var(--font-size-xs); color: var(--color-text-tertiary); }

    .filter-panel__clear {
      height: 32px;
      padding: 0 var(--space-3);
      background: none;
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-button);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-secondary);
      cursor: pointer;
      font-family: var(--font-family-sans);
      transition: var(--transition-color);
    }

    .filter-panel__clear:hover {
      background-color: var(--color-surface-2);
      color: var(--color-text-primary);
    }
  `]
})
export class FilterPanelComponent implements OnInit {
  @Input({ required: true }) config: FilterFieldDef[] = [];
  @Input() initialValues: Record<string, unknown> = {};
  @Output() filterChange = new EventEmitter<Record<string, unknown>>();

  private readonly _filters = signal<Record<string, unknown>>({});

  ngOnInit(): void {
    if (this.initialValues && Object.keys(this.initialValues).length > 0) {
      this._filters.set({ ...this.initialValues });
    }
  }

  getFilterValue(key: string): string {
    return (this._filters()[key] as string) ?? '';
  }

  getDateValue(key: string, position: 'start' | 'end'): string {
    const range = this._filters()[key] as { start?: string; end?: string } | undefined;
    return range?.[position] ?? '';
  }

  isChecked(key: string, value: string): boolean {
    const selected = (this._filters()[key] as string[]) ?? [];
    return selected.includes(value);
  }

  updateFilter(key: string, value: string): void {
    this._filters.update((f) => ({ ...f, [key]: value || undefined }));
    this._emit();
  }

  toggleCheckbox(key: string, value: string): void {
    const current = ((this._filters()[key] as string[]) ?? []).slice();
    const idx = current.indexOf(value);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(value);
    this._filters.update((f) => ({ ...f, [key]: current.length > 0 ? current : undefined }));
    this._emit();
  }

  updateDateRange(key: string, position: 'start' | 'end', value: string): void {
    const current = (this._filters()[key] as { start?: string; end?: string }) ?? {};
    const updated = { ...current, [position]: value || undefined };
    this._filters.update((f) => ({ ...f, [key]: updated }));
    this._emit();
  }

  hasActiveFilters(): boolean {
    return Object.values(this._filters()).some((v) => v !== undefined && v !== '' && v !== null);
  }

  clearAll(): void {
    this._filters.set({});
    this._emit();
  }

  private _emit(): void {
    // Remove undefined values before emitting
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(this._filters())) {
      if (v !== undefined && v !== '') clean[k] = v;
    }
    this.filterChange.emit(clean);
  }
}

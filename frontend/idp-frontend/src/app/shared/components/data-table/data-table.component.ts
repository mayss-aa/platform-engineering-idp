import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, signal, computed,
} from '@angular/core';

/** Column definition for the DataTable. */
export interface ColumnDef {
  /** Unique key — used for tracking and as the object property accessor. */
  field: string;
  /** Display label in the column header. */
  label: string;
  /** Whether this column supports client-side sorting. */
  sortable?: boolean;
  /** Optional width (CSS value, e.g., '120px', '20%'). */
  width?: string;
}

/** Emitted on page navigation. */
export interface PageEvent {
  pageIndex: number;
  pageSize: number;
}

/** Emitted on sort change. */
export interface SortEvent {
  field: string;
  direction: 'asc' | 'desc' | null;
}

type SortDirection = 'asc' | 'desc' | null;

/**
 * DataTable — paginated, sortable table for list views.
 *
 * Design (Requirement 26.3, 26.4):
 * - columns: ColumnDef[] with field, label, sortable, width
 * - data: T[] row data
 * - pageSize: rows per page (default 20)
 * - loading: renders skeleton rows
 * - totalCount: total items for server-side pagination info
 * - Emits pageChange, sortChange
 * - Client-side sort cycle: none → ASC → DESC → none
 * - Horizontal scroll on mobile/tablet
 */
@Component({
  selector: 'idp-data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="table-wrap" role="region" aria-label="Data table" tabindex="0">
      <table class="table" [attr.aria-rowcount]="totalCount || data.length">
        <thead>
          <tr>
            @for (col of columns; track col.field) {
              <th
                class="table__th"
                [style.width]="col.width ?? 'auto'"
                [class.table__th--sortable]="col.sortable"
                [attr.aria-sort]="getAriaSort(col.field)"
                (click)="col.sortable ? toggleSort(col.field) : null"
                (keydown.enter)="col.sortable ? toggleSort(col.field) : null"
                [attr.tabindex]="col.sortable ? 0 : null"
                [attr.role]="col.sortable ? 'columnheader button' : 'columnheader'"
              >
                <span class="table__th-label">{{ col.label }}</span>
                @if (col.sortable) {
                  <span class="table__sort-icon" aria-hidden="true">
                    {{ getSortIcon(col.field) }}
                  </span>
                }
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @if (loading) {
            @for (_ of skeletonRows; track $index) {
              <tr class="table__row table__row--skeleton">
                @for (col of columns; track col.field) {
                  <td class="table__td">
                    <div class="table__skeleton-cell"></div>
                  </td>
                }
              </tr>
            }
          } @else {
            @for (row of paginatedData(); track $index) {
              <tr class="table__row">
                @for (col of columns; track col.field) {
                  <td class="table__td">{{ getCellValue(row, col.field) }}</td>
                }
              </tr>
            }
            @if (paginatedData().length === 0) {
              <tr>
                <td class="table__td table__td--empty" [attr.colspan]="columns.length">
                  No data available.
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    @if (!loading && totalPages() > 1) {
      <div class="table__pagination" role="navigation" aria-label="Table pagination">
        <span class="table__pagination-info">
          {{ paginationLabel() }}
        </span>
        <div class="table__pagination-controls">
          <button
            class="table__pagination-btn"
            type="button"
            [disabled]="currentPage() === 0"
            (click)="goToPage(currentPage() - 1)"
            aria-label="Previous page"
          >
            &#8249;
          </button>
          <span class="table__pagination-current">
            {{ currentPage() + 1 }} / {{ totalPages() }}
          </span>
          <button
            class="table__pagination-btn"
            type="button"
            [disabled]="currentPage() >= totalPages() - 1"
            (click)="goToPage(currentPage() + 1)"
            aria-label="Next page"
          >
            &#8250;
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-lg);
      background-color: var(--color-surface-1);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      font-size: var(--font-size-sm);
    }

    .table__th {
      padding: var(--space-2-5) var(--space-4);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: var(--letter-spacing-wide);
      text-align: left;
      background-color: var(--color-surface-2);
      border-bottom: 1px solid var(--color-border-muted);
      white-space: nowrap;
      user-select: none;
    }

    .table__th--sortable { cursor: pointer; }
    .table__th--sortable:hover { color: var(--color-text-primary); }

    .table__th-label { display: inline; }

    .table__sort-icon {
      display: inline-block;
      margin-left: var(--space-1);
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
    }

    .table__row {
      transition: background-color var(--duration-fast) var(--ease-default);
    }

    .table__row:hover { background-color: var(--color-surface-2); }
    .table__row:not(:last-child) .table__td { border-bottom: 1px solid var(--color-border-muted); }

    .table__td {
      padding: var(--space-2-5) var(--space-4);
      color: var(--color-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 300px;
    }

    .table__td--empty {
      text-align: center;
      color: var(--color-text-tertiary);
      padding: var(--space-8) var(--space-4);
    }

    /* Skeleton */
    .table__row--skeleton .table__td { padding: var(--space-3) var(--space-4); }

    .table__skeleton-cell {
      height: 14px;
      width: 70%;
      border-radius: var(--radius-sm);
      background: var(--color-surface-3);
      animation: shimmer 1.5s infinite;
      background-size: 200% 100%;
    }

    @media (prefers-reduced-motion: reduce) {
      .table__skeleton-cell { animation: none; }
    }

    /* Pagination */
    .table__pagination {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--space-2) var(--space-4);
      border-top: 1px solid var(--color-border-muted);
      background-color: var(--color-surface-1);
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
    }

    .table__pagination-info {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
    }

    .table__pagination-controls {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .table__pagination-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border: 1px solid var(--color-border-default);
      border-radius: var(--radius-md);
      background: none;
      color: var(--color-text-primary);
      font-size: var(--font-size-md);
      cursor: pointer;
      transition: var(--transition-color);
      font-family: var(--font-family-sans);
    }

    .table__pagination-btn:hover:not(:disabled) { background-color: var(--color-surface-2); }
    .table__pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .table__pagination-current {
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-medium);
      color: var(--color-text-primary);
      min-width: 48px;
      text-align: center;
    }
  `]
})
export class DataTableComponent<T = Record<string, unknown>> {
  @Input({ required: true }) columns: ColumnDef[] = [];
  @Input({ required: true }) data: T[] = [];
  @Input() pageSize = 20;
  @Input() loading = false;
  @Input() totalCount = 0;
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<SortEvent>();

  readonly currentPage = signal(0);
  private readonly sortField = signal<string | null>(null);
  private readonly sortDirection = signal<SortDirection>(null);

  readonly skeletonRows = Array(5);

  readonly totalPages = computed(() => {
    const total = this.totalCount || this.data.length;
    return Math.max(1, Math.ceil(total / this.pageSize));
  });

  readonly paginatedData = computed(() => {
    let sorted = [...this.data];
    const field = this.sortField();
    const dir = this.sortDirection();
    if (field && dir) {
      sorted.sort((a, b) => {
        const aVal = this.getCellValue(a, field);
        const bVal = this.getCellValue(b, field);
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return dir === 'asc' ? cmp : -cmp;
      });
    }
    const start = this.currentPage() * this.pageSize;
    return sorted.slice(start, start + this.pageSize);
  });

  readonly paginationLabel = computed(() => {
    const total = this.totalCount || this.data.length;
    const start = this.currentPage() * this.pageSize + 1;
    const end = Math.min(start + this.pageSize - 1, total);
    return `${start}–${end} of ${total}`;
  });

  toggleSort(field: string): void {
    const current = this.sortField() === field ? this.sortDirection() : null;
    let next: SortDirection;
    if (current === null) next = 'asc';
    else if (current === 'asc') next = 'desc';
    else next = null;

    this.sortField.set(next ? field : null);
    this.sortDirection.set(next);
    this.currentPage.set(0);
    this.sortChange.emit({ field, direction: next });
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.totalPages()) return;
    this.currentPage.set(page);
    this.pageChange.emit({ pageIndex: page, pageSize: this.pageSize });
  }

  getSortIcon(field: string): string {
    if (this.sortField() !== field) return '⇅';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  getAriaSort(field: string): string | null {
    if (this.sortField() !== field) return null;
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  getCellValue(row: T, field: string): unknown {
    return (row as Record<string, unknown>)[field] ?? '';
  }
}

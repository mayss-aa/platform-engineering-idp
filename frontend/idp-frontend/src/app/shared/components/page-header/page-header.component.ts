import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Breadcrumb item definition. */
export interface BreadcrumbItem {
  label: string;
  route?: string;
}

/**
 * PageHeader — page title + breadcrumb + action slot.
 *
 * Design (Requirement 26.7):
 * - title: page heading
 * - breadcrumbs: BreadcrumbItem[] — each with label and optional route
 * - Content projection: <ng-content select="[actions]"> for action buttons
 */
@Component({
  selector: 'idp-page-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <header class="page-header">
      <div class="page-header__left">
        @if (breadcrumbs.length > 0) {
          <nav class="page-header__breadcrumbs" aria-label="Breadcrumb">
            @for (item of breadcrumbs; track item.label; let last = $last) {
              @if (item.route && !last) {
                <a class="page-header__crumb-link" [routerLink]="item.route">{{ item.label }}</a>
              } @else {
                <span class="page-header__crumb-current" [attr.aria-current]="last ? 'page' : null">{{ item.label }}</span>
              }
              @if (!last) {
                <span class="page-header__crumb-sep" aria-hidden="true">/</span>
              }
            }
          </nav>
        }
        <h1 class="page-header__title">{{ title }}</h1>
      </div>
      <div class="page-header__actions">
        <ng-content select="[actions]"></ng-content>
      </div>
    </header>
  `,
  styles: [`
    :host { display: block; margin-bottom: var(--space-5); }

    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--space-4);
      flex-wrap: wrap;
    }

    .page-header__left { flex: 1; min-width: 0; }

    .page-header__breadcrumbs {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      margin-bottom: var(--space-1);
    }

    .page-header__crumb-link {
      font-size: var(--font-size-xs);
      color: var(--color-text-link);
      text-decoration: none;
      transition: var(--transition-color);
    }

    .page-header__crumb-link:hover { text-decoration: underline; }

    .page-header__crumb-current {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
    }

    .page-header__crumb-sep {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
    }

    .page-header__title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-semibold);
      color: var(--color-text-primary);
      line-height: var(--line-height-tight);
    }

    .page-header__actions {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      flex-shrink: 0;
    }
  `]
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() breadcrumbs: BreadcrumbItem[] = [];
}

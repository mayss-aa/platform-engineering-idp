import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface BreadcrumbSegment {
  label: string;
  route: string;
}

/**
 * BreadcrumbComponent — updates on every NavigationEnd event.
 *
 * Reflects the full hierarchical path of the currently active route
 * (Requirement 4.7).
 */
@Component({
  selector: 'idp-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="breadcrumb" aria-label="Breadcrumb">
      @for (segment of segments(); track segment.route; let last = $last) {
        @if (!last) {
          <a class="breadcrumb__link" [routerLink]="segment.route">{{ segment.label }}</a>
          <span class="breadcrumb__sep" aria-hidden="true">/</span>
        } @else {
          <span class="breadcrumb__current" aria-current="page">{{ segment.label }}</span>
        }
      }
    </nav>
  `,
  styles: [`
    :host { display: flex; align-items: center; }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .breadcrumb__link {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
      text-decoration: none;
      transition: var(--transition-color);
    }

    .breadcrumb__link:hover { color: var(--color-text-link); }

    .breadcrumb__sep {
      font-size: var(--font-size-xs);
      color: var(--color-text-tertiary);
    }

    .breadcrumb__current {
      font-size: var(--font-size-xs);
      color: var(--color-text-secondary);
      font-weight: var(--font-weight-medium);
    }
  `]
})
export class BreadcrumbComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly segments = signal<BreadcrumbSegment[]>([]);

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
    ).subscribe(() => {
      this.segments.set(this._buildBreadcrumbs(this.activatedRoute.root));
    });
  }

  private _buildBreadcrumbs(route: ActivatedRoute, url = '', crumbs: BreadcrumbSegment[] = []): BreadcrumbSegment[] {
    const children = route.children;
    if (children.length === 0) return crumbs;

    for (const child of children) {
      const routeUrl = child.snapshot.url.map((s) => s.path).join('/');
      if (routeUrl) {
        url += `/${routeUrl}`;
        const label = this._formatLabel(routeUrl);
        crumbs.push({ label, route: url });
      }
      return this._buildBreadcrumbs(child, url, crumbs);
    }
    return crumbs;
  }

  private _formatLabel(segment: string): string {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

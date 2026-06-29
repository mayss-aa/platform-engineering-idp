import { Component, Input, ChangeDetectionStrategy, Signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/** Navigation item data shape. */
export interface NavItemData {
  label: string;
  route: string;
  svgPath: string;
  badge?: Signal<number>;
}

/**
 * NavItemComponent — a single sidebar navigation entry.
 *
 * Accepts a NavItemData interface; renders icon + label + optional badge.
 * Active route is highlighted via routerLinkActive (Requirement 4.8).
 */
@Component({
  selector: 'idp-nav-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <a
      class="nav-item"
      [routerLink]="item.route"
      routerLinkActive="nav-item--active"
      [attr.aria-label]="item.label"
      [attr.title]="collapsed ? item.label : null"
    >
      <svg
        class="nav-item__icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path [attr.d]="item.svgPath" />
      </svg>
      @if (!collapsed) {
        <span class="nav-item__label">{{ item.label }}</span>
        @if (item.badge && item.badge() > 0) {
          <span class="nav-item__badge">{{ item.badge() }}</span>
        }
      }
      @if (collapsed && item.badge && item.badge() > 0) {
        <span class="nav-item__badge nav-item__badge--dot"></span>
      }
    </a>
  `,
  styles: [`
    :host { display: block; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      height: 36px;
      padding: 0 var(--space-4);
      color: var(--color-sidebar-text);
      text-decoration: none;
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-regular);
      white-space: nowrap;
      overflow: hidden;
      position: relative;
      transition: background-color var(--duration-fast) var(--ease-default),
                  color var(--duration-fast) var(--ease-default);
    }

    :host-context(.sidebar--collapsed) .nav-item {
      padding: 0;
      justify-content: center;
    }

    .nav-item:hover {
      background-color: var(--color-sidebar-hover-bg);
    }

    .nav-item--active {
      background-color: var(--color-sidebar-active-bg);
      color: var(--color-sidebar-active-text);
      font-weight: var(--font-weight-medium);
    }

    .nav-item--active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 3px;
      background-color: var(--color-accent);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }

    .nav-item__icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      opacity: 0.85;
    }

    .nav-item--active .nav-item__icon { opacity: 1; }

    .nav-item__label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-item__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      background-color: var(--color-error);
      color: var(--color-primary-contrast);
      border-radius: var(--radius-badge);
      font-size: 10px;
      font-weight: var(--font-weight-bold);
      flex-shrink: 0;
      font-family: var(--font-family-sans);
    }

    .nav-item__badge--dot {
      position: absolute;
      top: 6px;
      right: 6px;
      min-width: 7px;
      height: 7px;
      padding: 0;
      border-radius: var(--radius-full);
    }
  `]
})
export class NavItemComponent {
  @Input({ required: true }) item!: NavItemData;
  @Input() collapsed = false;
}

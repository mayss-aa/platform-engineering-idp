import {
  Component,
  Input,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface NavItem {
  label: string;
  route: string;
  /** SVG path data for the 20×20 icon */
  svgPath: string;
  badge?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// ─── Navigation structure ────────────────────────────────────
// Covers all platform domains from the spec + additional enterprise modules
const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        route: '/dashboard',
        svgPath: 'M2 11l8-8 8 8M4 9v9a1 1 0 0 0 1 1h4v-5h2v5h4a1 1 0 0 0 1-1V9',
      },
    ],
  },
  {
    label: 'Developer Tools',
    items: [
      {
        label: 'Service Catalog',
        route: '/service-catalog',
        svgPath: 'M4 6h16M4 10h16M4 14h16M4 18h16',
      },
      {
        label: 'Provision Requests',
        route: '/provision-requests',
        svgPath: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4',
      },
      {
        label: 'Deployments',
        route: '/deployments',
        svgPath: 'M5 10l7-7m0 0 7 7m-7-7v18',
      },
      {
        label: 'Terraform',
        route: '/terraform',
        svgPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
      },
      {
        label: 'CI / CD',
        route: '/cicd',
        svgPath: 'M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15',
      },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      {
        label: 'Infrastructure',
        route: '/infrastructure',
        svgPath: 'M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7',
      },
      {
        label: 'Containers',
        route: '/containers',
        svgPath: 'M20 7l-8-4-8 4m16 0-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
      },
      {
        label: 'Kubernetes',
        route: '/kubernetes',
        svgPath: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z',
      },
      {
        label: 'Cloud Resources',
        route: '/cloud-resources',
        svgPath: 'M3 15a4 4 0 0 0 4 4h9a5 5 0 1 0-.1-9.999 5.002 5.002 0 0 0-9.78 2.096A4.001 4.001 0 0 0 3 15z',
      },
      {
        label: 'GitOps',
        route: '/gitops',
        svgPath: 'M10 20l4-16m4 4-4 4 4 4M6 16l-4-4 4-4',
      },
    ],
  },
  {
    label: 'Observability',
    items: [
      {
        label: 'Monitoring',
        route: '/monitoring',
        svgPath: 'M9 19v-6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2zm0 0V9a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v10m-6 0a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2m0 0V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2z',
      },
      {
        label: 'Incidents',
        route: '/incidents',
        svgPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        badge: '1',
      },
      {
        label: 'Recommendations',
        route: '/recommendations',
        svgPath: 'M13 10V3L4 14h7v7l9-11h-7z',
      },
      {
        label: 'Notifications',
        route: '/notifications',
        svgPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9',
        badge: '3',
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Organizations',
        route: '/organizations',
        svgPath: 'M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5m-4 0h4',
      },
      {
        label: 'Teams',
        route: '/teams',
        svgPath: 'M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 0 1 9.288 0M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm6 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM7 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z',
      },
      {
        label: 'Users',
        route: '/users',
        svgPath: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7z',
      },
      {
        label: 'Roles',
        route: '/roles',
        svgPath: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      },
      {
        label: 'Permissions',
        route: '/permissions',
        svgPath: 'M15 7a2 2 0 0 1 2 2m4 0a6 6 0 0 1-7.743 5.743L11 17H9v2H7v2H4a1 1 0 0 1-1-1v-2.586a1 1 0 0 1 .293-.707l5.964-5.964A6 6 0 1 1 21 9z',
      },
      {
        label: 'Audit Logs',
        route: '/audit-logs',
        svgPath: 'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
      },
      {
        label: 'Settings',
        route: '/settings',
        svgPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 0 0 1.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
      },
    ],
  },
  {
    label: 'AI',
    items: [
      {
        label: 'AI Assistant',
        route: '/ai-assistant',
        svgPath: 'M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
      },
    ],
  },
];

@Component({
  selector: 'idp-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav
      class="sidebar"
      [class.sidebar--collapsed]="collapsed()"
      role="navigation"
      aria-label="Main platform navigation"
    >
      <!-- ── Nav groups ──────────────────────────────────── -->
      <div class="sidebar__scroll">
        @for (group of groups; track group.label) {
          <div class="sidebar__group">

            @if (!collapsed()) {
              <span class="sidebar__group-label">{{ group.label }}</span>
            }

            @for (item of group.items; track item.route) {
              <a
                class="sidebar__item"
                [routerLink]="item.route"
                routerLinkActive="sidebar__item--active"
                [attr.aria-label]="item.label"
                [attr.title]="collapsed() ? item.label : null"
              >
                <svg
                  class="sidebar__item-icon"
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

                @if (!collapsed()) {
                  <span class="sidebar__item-label">{{ item.label }}</span>
                  @if (item.badge) {
                    <span class="sidebar__item-badge" [attr.aria-label]="item.badge + ' items'">
                      {{ item.badge }}
                    </span>
                  }
                }

                @if (collapsed() && item.badge) {
                  <span class="sidebar__item-badge sidebar__item-badge--dot" [attr.aria-label]="item.badge + ' items'"></span>
                }
              </a>
            }

          </div>
        }
      </div>

      <!-- ── Footer: collapse toggle ────────────────────── -->
      <div class="sidebar__footer">
        <button
          class="sidebar__collapse-btn"
          type="button"
          (click)="toggleCollapse()"
          [attr.aria-label]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
          [attr.title]="collapsed() ? 'Expand sidebar' : 'Collapse sidebar'"
        >
          <svg
            class="sidebar__collapse-icon"
            [class.sidebar__collapse-icon--flipped]="collapsed()"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M11 19l-7-7 7-7m8 14-7-7 7-7" />
          </svg>
          @if (!collapsed()) {
            <span class="sidebar__collapse-label">Collapse</span>
          }
        </button>
      </div>
    </nav>
  `,
  styles: [`
    :host { display: block; }

    /* ── Shell ─────────────────────────────────────────── */
    .sidebar {
      position: fixed;
      top: var(--color-topnav-height);
      left: 0;
      bottom: 0;
      width: var(--color-sidebar-width-expanded);
      background-color: var(--color-sidebar-bg);
      border-right: 1px solid var(--color-sidebar-border);
      display: flex;
      flex-direction: column;
      transition: var(--transition-sidebar);
      z-index: var(--z-sidebar);
      overflow: hidden;
    }

    .sidebar--collapsed {
      width: var(--color-sidebar-width-collapsed);
    }

    /* ── Scroll area ───────────────────────────────────── */
    .sidebar__scroll {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--space-2) 0 var(--space-4);
    }

    .sidebar__scroll::-webkit-scrollbar { width: 3px; }
    .sidebar__scroll::-webkit-scrollbar-track { background: transparent; }
    .sidebar__scroll::-webkit-scrollbar-thumb {
      background-color: var(--color-sidebar-border);
      border-radius: var(--radius-full);
    }

    /* ── Group ─────────────────────────────────────────── */
    .sidebar__group {
      margin-bottom: var(--space-1);
    }

    .sidebar__group-label {
      display: block;
      padding: var(--space-3) var(--space-4) var(--space-1);
      font-size: 10px;
      font-weight: var(--font-weight-semibold);
      color: var(--color-sidebar-group-label);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      white-space: nowrap;
      overflow: hidden;
      line-height: 1;
    }

    /* ── Item ──────────────────────────────────────────── */
    .sidebar__item {
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

    .sidebar--collapsed .sidebar__item {
      padding: 0;
      justify-content: center;
    }

    .sidebar__item:hover {
      background-color: var(--color-sidebar-hover-bg);
      color: var(--color-sidebar-text);
    }

    .sidebar__item--active {
      background-color: var(--color-sidebar-active-bg);
      color: var(--color-sidebar-active-text);
      font-weight: var(--font-weight-medium);
    }

    .sidebar__item--active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      bottom: 4px;
      width: 3px;
      background-color: var(--color-accent);
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }

    /* ── Icon ──────────────────────────────────────────── */
    .sidebar__item-icon {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      opacity: 0.85;
    }

    .sidebar__item--active .sidebar__item-icon { opacity: 1; }

    /* ── Label ─────────────────────────────────────────── */
    .sidebar__item-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Badge ─────────────────────────────────────────── */
    .sidebar__item-badge {
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

    .sidebar__item-badge--dot {
      position: absolute;
      top: 6px;
      right: 6px;
      min-width: 7px;
      height: 7px;
      padding: 0;
      border-radius: var(--radius-full);
    }

    /* ── Footer ────────────────────────────────────────── */
    .sidebar__footer {
      border-top: 1px solid var(--color-sidebar-border);
      padding: var(--space-2) 0;
      flex-shrink: 0;
    }

    .sidebar__collapse-btn {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
      height: 36px;
      padding: 0 var(--space-4);
      background: none;
      border: none;
      color: var(--color-sidebar-text-muted);
      cursor: pointer;
      font-size: var(--font-size-sm);
      font-family: var(--font-family-sans);
      transition: var(--transition-color);
    }

    .sidebar--collapsed .sidebar__collapse-btn {
      padding: 0;
      justify-content: center;
    }

    .sidebar__collapse-btn:hover {
      background-color: var(--color-sidebar-hover-bg);
      color: var(--color-sidebar-text);
    }

    .sidebar__collapse-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      transition: transform var(--duration-slow) var(--ease-sidebar);
    }

    .sidebar__collapse-icon--flipped {
      transform: rotate(180deg);
    }

    .sidebar__collapse-label {
      font-size: var(--font-size-sm);
      white-space: nowrap;
    }

    /* ── Mobile: hide sidebar by default ──────────────── */
    @media (max-width: 767px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar--mobile-open { transform: translateX(0); }
    }
  `]
})
export class SidebarComponent {
  @Input() set isCollapsed(value: boolean) {
    this.collapsed.set(value);
  }

  readonly collapsed = signal(false);
  readonly groups = NAV_GROUPS;

  toggleCollapse(): void {
    this.collapsed.set(!this.collapsed());
  }
}

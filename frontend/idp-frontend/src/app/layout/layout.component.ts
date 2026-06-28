import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopNavComponent } from './top-nav/top-nav.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
  selector: 'idp-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, TopNavComponent, SidebarComponent],
  template: `
    <idp-top-nav (sidebarToggle)="toggleSidebar()" />

    <div class="layout__body">
      <idp-sidebar [isCollapsed]="sidebarCollapsed()" />

      <main
        class="layout__main"
        [class.layout__main--collapsed]="sidebarCollapsed()"
        role="main"
        id="main-content"
      >
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--color-background);
    }

    .layout__body {
      display: flex;
      padding-top: var(--color-topnav-height);
      min-height: 100vh;
    }

    .layout__main {
      flex: 1;
      min-width: 0;
      margin-left: var(--color-sidebar-width-expanded);
      transition: margin-left var(--duration-slow) var(--ease-sidebar);
      background-color: var(--color-background);
      overflow-x: hidden;
    }

    .layout__main--collapsed {
      margin-left: var(--color-sidebar-width-collapsed);
    }

    @media (max-width: 767px) {
      .layout__main {
        margin-left: 0;
      }

      .layout__main--collapsed {
        margin-left: 0;
      }
    }
  `]
})
export class LayoutComponent {
  readonly sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.set(!this.sidebarCollapsed());
  }
}

import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

/**
 * Root router configuration — Task 2 shell routes.
 *
 * The full 19-module lazy route table is implemented in Task 12.
 * The authenticated shell (LayoutComponent) wraps all content routes,
 * providing the top navigation and sidebar for every page.
 */
export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.page').then((m) => m.HomePageComponent),
        title: 'Overview — IDP Platform',
      },
    ],
  },
  // Catch-all — render home page until /404 is implemented in Task 12
  {
    path: '**',
    component: LayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home/home.page').then((m) => m.HomePageComponent),
        title: 'Overview — IDP Platform',
      },
    ],
  },
];

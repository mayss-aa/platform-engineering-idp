import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard.page').then((m) => m.DashboardPageComponent),
    title: 'Dashboard — IDP Platform',
  },
];

export default routes;

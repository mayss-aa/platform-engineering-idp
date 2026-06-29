import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/deployments.page').then((m) => m.DeploymentsPageComponent),
    title: 'Deployments — IDP Platform',
  },
];

export default routes;

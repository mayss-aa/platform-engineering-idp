import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/provision-requests.page').then((m) => m.ProvisionRequestsPageComponent),
    title: 'Provision Requests — IDP Platform',
  },
];

export default routes;

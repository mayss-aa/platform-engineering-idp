import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/service-catalog.page').then((m) => m.ServiceCatalogPageComponent),
    title: 'Service Catalog — IDP Platform',
  },
];

export default routes;

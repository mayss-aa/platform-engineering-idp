import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/terraform.page').then((m) => m.TerraformPageComponent),
    title: 'Terraform — IDP Platform',
  },
];

export default routes;

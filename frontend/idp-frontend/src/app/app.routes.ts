import { Routes } from '@angular/router';

/**
 * Root router configuration.
 * All 19 feature routes will be registered here in Task 12.
 * This placeholder ensures the project compiles from Task 1.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];

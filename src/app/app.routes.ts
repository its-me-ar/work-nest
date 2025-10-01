import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard),

    children: [
      {
        path: 'tasks',
        loadComponent: () => import('./pages/dashboard/tasks/tasks').then(m => m.Tasks)
      },
    ]
  },
  { path: 'login', canActivate: [authGuard], loadComponent: () => import('./pages/login/login').then(m => m.Login) },
];

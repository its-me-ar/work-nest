import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
    children: [
      {
        path: '', // default child route
        loadComponent: () => import('./pages/dashboard/home/home').then((m) => m.Home),
      },
      {
        path: 'tasks',
        loadComponent: () => import('./pages/dashboard/tasks/tasks').then((m) => m.Tasks),
      },
      {
        path: 'leaves',
        loadComponent: () => import('./pages/dashboard/leaves/leaves').then((m) => m.Leaves),
      },
    ],
  },
  {
    path: 'login',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
];

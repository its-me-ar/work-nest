import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

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
      {
        path: 'leave-management',
        canActivate: [authGuard, roleGuard], // protect with auth + role
        data: { roles: ['admin'] }, // only admins allowed
        loadComponent: () =>
          import('./pages/dashboard/leave-management/leave-management').then(
            (m) => m.LeaveManagement
          ),
      },
    ],
  },
  {
    path: 'login',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
];

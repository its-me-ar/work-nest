import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { authGuard } from './core/guards/auth-guard';


export const routes: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    component: Dashboard,

    // children: [
    //   {
    //     path: 'reports',
    //     loadComponent: () => import('./features/dashboard/reports/reports.component').then(m => m.ReportsComponent)
    //   },
    //   {
    //     path: 'settings',
    //     loadComponent: () => import('./features/dashboard/settings/settings.component').then(m => m.SettingsComponent)
    //   }
    // ]
  },
  { path: 'login', canActivate: [authGuard], component: Login },
];

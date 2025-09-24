import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../services/auth';


export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const isLoggedIn = auth.isLoggedIn();
  const requestedRoute = route.routeConfig?.path;

  // If user tries to access login page while logged in → redirect to dashboard
  if (requestedRoute === 'login' && isLoggedIn) {
    return router.parseUrl('/');
  }

  // If user tries to access any protected page (dashboard) while not logged in → redirect to login
  if (requestedRoute !== 'login' && !isLoggedIn) {
    return router.parseUrl('/login');
  }

  return true; // allow access
};

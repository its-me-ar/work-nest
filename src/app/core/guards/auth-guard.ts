import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../services/users/user-service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const loggedIn = userService.isLoggedIn(); // signal
  const requestedRoute = route.routeConfig?.path;

  // Redirect logged-in users away from login page
  if (requestedRoute === 'login' && loggedIn) {
    return router.parseUrl('/');
  }

  // Redirect not logged-in users away from protected pages
  if (requestedRoute !== 'login' && !loggedIn) {
    return router.parseUrl('/login');
  }

  return true; // allow access
};

import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { UserService } from '../services/users/user-service';

/**
 * Role-based guard
 * Usage: add `data: { roles: ['admin'] }` to route
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const userService = inject(UserService);
  const router = inject(Router);

  const user = userService.user(); // current user
  const allowedRoles: string[] = route.data['roles'] || [];

  // If no roles are defined, allow access
  if (!allowedRoles.length) return true;

  // If user is missing or role not allowed, redirect
  if (!user || !allowedRoles.includes(user.role || '')) {
    return router.parseUrl('/'); // redirect to dashboard or unauthorized page
  }

  return true; // role allowed
};

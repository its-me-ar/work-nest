import { inject, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  UrlTree,
  RouterStateSnapshot,
} from '@angular/router';
import { UserService } from '../services/users/user-service'; // Assumed dependency

// --- Role Guard Implementation ---

/**
 * Role-based guard
 * Usage: add `data: { roles: ['admin'] }` to route
 */
export const roleGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  // Casting to 'any' for testing purposes since we don't have the actual UserService definition
  const userService = inject(UserService) as any;
  const router = inject(Router);

  const user = userService.user(); // current user (assumed to be a signal or function that returns the user object)
  const allowedRoles: string[] = route.data['roles'] || [];

  // If no roles are defined, allow access
  if (!allowedRoles.length) return true;

  // If user is missing or role not allowed, redirect
  if (!user || !allowedRoles.includes(user.role || '')) {
    return router.parseUrl('/'); // redirect to dashboard or unauthorized page
  }

  return true; // role allowed
};

// --- Test Suite ---

describe('roleGuard', () => {
  // Mock Data
  interface MockUser {
    id: number;
    role: string;
  }
  const mockUserAdmin: MockUser = { id: 1, role: 'admin' };
  const mockUserBasic: MockUser = { id: 2, role: 'basic' };

  // Mocks for dependencies
  // The user signal will hold the state we test against (admin, basic, or null)
  const mockUserSignal = signal<MockUser | null>(null);

  const mockUserService = {
    // We mock the user() method/signal accessor used in the guard
    user: () => mockUserSignal(),
  };

  // Use a spy object for the Router to track calls to parseUrl
  const mockRouter = {
    // parseUrl should return the string URL for assertions
    parseUrl: jasmine.createSpy('parseUrl').and.callFake((url: string) => url as any),
  };

  // Helper function to execute the guard in the proper injection context
  const executeGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) =>
    TestBed.runInInjectionContext(() => roleGuard(route, state));

  // Helper to run the guard with mock state
  const mockRouterState: RouterStateSnapshot = { url: '/', root: {} } as RouterStateSnapshot;
  // Type as 'any' to allow comparison against boolean/string literals
  const runGuard = (route: ActivatedRouteSnapshot): any => executeGuard(route, mockRouterState);

  // Helper to create a minimal ActivatedRouteSnapshot with route data
  const createRouteSnapshot = (data: { roles?: string[] } = {}): ActivatedRouteSnapshot => {
    return {
      data: data,
    } as unknown as ActivatedRouteSnapshot;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // Provide the mock services
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
      ],
    });
    // Reset state before each test
    mockRouter.parseUrl.calls.reset();
    mockUserSignal.set(mockUserBasic); // Set default to 'basic' user
  });

  it('should be created and allow access if no roles are required (default basic user)', () => {
    // Arrange: No role data is supplied
    const route = createRouteSnapshot({});

    // Act
    const result = runGuard(route);

    // Assert
    expect(result).toBe(true);
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });

  // SCENARIO 1: Allowed Role Match
  it('should allow access if the user has a required role', () => {
    // Arrange
    mockUserSignal.set(mockUserAdmin);
    const route = createRouteSnapshot({ roles: ['admin', 'manager'] });

    // Act
    const result = runGuard(route);

    // Assert
    expect(result).toBe(true);
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });

  // SCENARIO 2: Disallowed Role Mismatch
  it('should redirect to "/" if the user does NOT have the required role', () => {
    // Arrange: User is 'basic' (default setup)
    const route = createRouteSnapshot({ roles: ['admin'] });

    // Act
    const result = runGuard(route);

    // Assert
    expect(result).toBe('/');
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/');
  });

  // SCENARIO 3: Not Logged In
  it('should redirect to "/" if the user is NULL (not logged in) and roles are required', () => {
    // Arrange
    mockUserSignal.set(null);
    const route = createRouteSnapshot({ roles: ['admin'] });

    // Act
    const result = runGuard(route);

    // Assert
    expect(result).toBe('/');
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/');
  });

  // SCENARIO 4: User role is undefined/empty string
  it('should redirect to "/" if the user is logged in but has an empty role and one is required', () => {
    // Arrange
    mockUserSignal.set({ id: 3, role: '' });
    const route = createRouteSnapshot({ roles: ['admin'] });

    // Act
    const result = runGuard(route);

    // Assert
    expect(result).toBe('/');
    expect(mockRouter.parseUrl).toHaveBeenCalledWith('/');
  });
});

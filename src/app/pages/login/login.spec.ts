import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Login } from './login';
import { AuthService } from '../../core/services/auth/auth-service';
import { UserService } from '../../core/services/users/user-service';

// --- Mock Dependencies using Jasmine Spies ---

// 1. Mock the AuthService methods
const mockAuthService = {
  // Use jasmine.createSpy().and.returnValue() for methods that return a value (like an Observable)
  login: jasmine.createSpy('login').and.returnValue(of({ id: 1, email: 'test@user.com' })),
};

// 2. Mock the UserService methods
const mockUserService = {
  // Use jasmine.createSpy() for methods that are called to perform an action
  setUser: jasmine.createSpy('setUser'),
};

// 3. Mock the Router methods
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

// -------------------------

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let authService: AuthService;
  let userService: UserService;
  let router: Router;

  beforeEach(async () => {
    // 💡 Configure the Testing Module with provided mocks
    await TestBed.configureTestingModule({
      // Login component uses its own imports (CommonModule, ReactiveFormsModule)
      imports: [Login, ReactiveFormsModule],
      providers: [
        FormBuilder, // Provide the real FormBuilder service
        // Provide the mock objects for the required dependencies
        { provide: AuthService, useValue: mockAuthService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;

    // Get references to the mock services
    authService = TestBed.inject(AuthService);
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);

    // Initial change detection
    fixture.detectChanges();
  });

  // Reset spies after each test to ensure test isolation
  afterEach(() => {
    mockAuthService.login.calls.reset();
    mockUserService.setUser.calls.reset();
    mockRouter.navigate.calls.reset();
  });

  // --- Test Cases ---

  it('should create the component successfully', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form as invalid', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should call authService.login, userService.setUser, and navigate on successful submission', () => {
    const mockUser = { id: 1, email: 'test@example.com', name: 'Test User', role: 'user' };

    // Arrange: Set up the mock response and form values
    (authService.login as jasmine.Spy).and.returnValue(of(mockUser));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    // Act: Submit the form
    component.onSubmit();

    // Assert: Check the side effects
    expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(userService.setUser).toHaveBeenCalledWith(mockUser);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(component.loading()).toBeFalsy();
    expect(component.error()).toEqual('');
  });

  it('should set an error message on invalid credentials from backend (null user)', () => {
    // Arrange: Mock the auth service to return a null user
    (authService.login as jasmine.Spy).and.returnValue(of(null));

    component.loginForm.setValue({
      email: 'bad@user.com',
      password: 'wrongpassword',
    });

    // Act
    component.onSubmit();

    // Assert
    expect(component.loading()).toBeFalsy();
    expect(component.error()).toEqual('Invalid email or password');
    expect(userService.setUser).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should handle a server error during login and set error signal', () => {
    // Arrange: Mock the auth service to return an error observable
    (authService.login as jasmine.Spy).and.returnValue(throwError(() => new Error('HTTP 500')));

    component.loginForm.setValue({
      email: 'test@example.com',
      password: 'password123',
    });

    // Act
    component.onSubmit();

    // Assert
    expect(component.loading()).toBeFalsy();
    expect(component.error()).toEqual('Server error');
    expect(userService.setUser).not.toHaveBeenCalled();
  });
});

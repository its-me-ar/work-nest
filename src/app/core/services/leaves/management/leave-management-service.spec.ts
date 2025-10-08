import { TestBed } from '@angular/core/testing';
import { LeaveManagementService } from './leave-management-service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { UserService } from '../../users/user-service';
import { signal } from '@angular/core';

// Mock the UserService to provide a necessary dependency
const mockUserService = {
  // Assuming a basic structure is needed for the user (specifically the 'id')
  user: signal({ id: 1, email: 'admin@test.com', role: 'admin' }),
};

describe('LeaveManagementService', () => {
  let service: LeaveManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        // FIX: Add required providers for HttpClient and its testing utilities
        provideHttpClient(),
        provideHttpClientTesting(),
        // Mock the required UserService dependency
        { provide: UserService, useValue: mockUserService },
      ],
    });
    service = TestBed.inject(LeaveManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { LeavesService } from './leaves-service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http'; // ADDED: Provide base HttpClient
import { UserService } from '../users/user-service';
import { Leave } from '../../models/leave.model';
import { signal } from '@angular/core';
import { environment } from '../../../../environment/environment';

// --- Mocks and Mock Data ---

// Define a type for the user object used in the mock (assuming id and email are present)
interface MockUser { id: number; email: string; }
const mockUser: MockUser = { id: 42, email: 'test@example.com' };

// 1. Mock the UserService to control the logged-in user state
const mockUserService = {
  // Explicitly type the signal to allow MockUser or null
  user: signal<MockUser | null>(mockUser),
};

// 2. Mock Data for API responses
const mockLeaves: Leave[] = [
  { id: 1, fromDate: '2025-11-01', toDate: '2025-11-01', type: 'Sick', reason: 'Fever', status: 'Approved', userId: 42 },
  { id: 2, fromDate: '2025-12-24', toDate: '2025-12-25', type: 'Casual', reason: 'Holiday', status: 'Pending', userId: 42 },
];

describe('LeavesService', () => {
  let service: LeavesService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/leaves`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // REMOVED: imports: [HttpClientTestingModule],
      providers: [
        LeavesService,
        // ADDED: New function-based providers for HttpClient testing
        provideHttpClient(),
        provideHttpClientTesting(),
        // Provide the mock UserService
        { provide: UserService, useValue: mockUserService },
      ],
    });
    service = TestBed.inject(LeavesService);
    httpTestingController = TestBed.inject(HttpTestingController);

    // FIX: Ensure the mock user is authenticated (not null) at the start of every test
    mockUserService.user.set(mockUser);
  });

  afterEach(() => {
    // Verify that there are no outstanding HTTP requests after each test
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // --- loadLeaves and leaves() tests ---

  it('should call loadLeaves and update the leaves signal with fetched data', () => {
    // Arrange: Verify initial state
    expect(service.leaves().length).toBe(0);

    // Act
    service.loadLeaves();

    // Assert: Expect a GET request to the correct endpoint with userId filter
    const req = httpTestingController.expectOne(`${apiUrl}?userId=${mockUser.id}`);
    expect(req.request.method).toBe('GET');

    // Respond to the request with mock data
    req.flush(mockLeaves);

    // Assert: Check if the internal signal was updated and returned by leaves()
    expect(service.leaves()).toEqual(mockLeaves);
  });

  // --- applyLeave tests ---

  it('should call applyLeave, make a POST request with default status/userId, and add the new leave to the signal', () => {
    // Arrange: Define the data the component sends
    const newLeaveData = {
      fromDate: '2026-01-01',
      toDate: '2026-01-05',
      type: 'Casual' as const,
      reason: 'New Year trip',
    };

    // Define the payload the service sends to the API
    const expectedPostPayload = {
      ...newLeaveData,
      status: 'Pending' as const, // Added 'as const' to maintain literal type
      userId: mockUser.id, // userId added by service
    };

    // Define the response the API returns (includes the new ID)
    const mockResponse: Leave = {
      id: 3, // Assigned ID from server
      ...expectedPostPayload,
      // Explicitly define status to satisfy the strict union type
      status: 'Pending',
    };

    // Simulate initial load so the signal has data to update
    service.loadLeaves();
    // Flush the initial load request for user 42
    httpTestingController.expectOne(`${apiUrl}?userId=${mockUser.id}`).flush(mockLeaves);
    expect(service.leaves().length).toBe(2);

    // Act
    service.applyLeave(newLeaveData);

    // Assert: Expect a POST request to the API
    const req = httpTestingController.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedPostPayload);

    // Respond to the POST request
    req.flush(mockResponse);

    // Assert: Check if the new leave was added to the signal
    expect(service.leaves().length).toBe(mockLeaves.length + 1);
    expect(service.leaves()).toContain(mockResponse);
  });

  it('should NOT call applyLeave if userService.user returns null (unauthenticated user)', () => {
    // Arrange: Set the mock user signal to null
    mockUserService.user.set(null);
    const newLeaveData = {
      fromDate: '2026-01-01',
      toDate: '2026-01-05',
      type: 'Casual' as const,
      reason: 'No ID user',
    };

    // Act
    service.applyLeave(newLeaveData);

    // Assert: Verify that no HTTP requests were made to the API URL
    httpTestingController.expectNone(apiUrl);
  });
});

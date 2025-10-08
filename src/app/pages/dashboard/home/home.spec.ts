import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { signal } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/tasks/tasks-service';
import { UserService } from '../../../core/services/users/user-service';

// --- Mocks and Mock Data ---

// Define a type for the user object used in the mock
interface MockUser {
  id: number;
  email: string;
}
const mockUser: MockUser = { id: 1, email: 'test@example.com' };

// 1. Mock the UserService
const mockUserService = {
  // Explicitly type the signal to allow MockUser or null for auth tests
  user: signal<MockUser | null>(mockUser),
};

// 2. Mock Data for API responses
// Adjusted to ensure tests like toggleTask can run: one completed, one pending.
const mockTasks: Task[] = [
  { id: 1, title: 'Completed Task 1', completed: true, userId: 1 },
  { id: 2, title: 'Pending Task 2', completed: false, userId: 1 },
];

const reloadedTasks: Task[] = [{ id: 4, title: 'New Reloaded Task', completed: false, userId: 1 }];

describe('TaskService', () => {
  let service: TaskService;
  let httpTestingController: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/tasks`;
  const userIdQuery = `?userId=${mockUser.id}`;

  // Use a simple beforeEach to initialize, relying on flushing the initial request
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TaskService,
        // Provide base HttpClient and testing module
        provideHttpClient(),
        provideHttpClientTesting(),
        // Provide the mock UserService
        { provide: UserService, useValue: mockUserService },
      ],
    });

    // Ensure the mock user is authenticated at the start of every test
    mockUserService.user.set(mockUser);

    service = TestBed.inject(TaskService);
    httpTestingController = TestBed.inject(HttpTestingController);

    // Handle the initial loadTasks() call from the constructor synchronously
    // This ensures the service starts with data before any tests run.
    const initialReq = httpTestingController.expectOne(`${apiUrl}${userIdQuery}`);
    initialReq.flush(mockTasks);
  });

  afterEach(() => {
    // Verify that there are no outstanding HTTP requests after each test
    httpTestingController.verify();
  });

  it('should be created and initialized with data', () => {
    expect(service).toBeTruthy();
    expect(service.tasks().length).toBe(2);
    expect(service.filter()).toBe('all');
  });

  // --- CRUD Tests ---

  it('should call loadTasks correctly and replace existing data', () => {
    service.loadTasks();

    // Expect a GET request (only the second one, as the first was handled in beforeEach)
    const req = httpTestingController.expectOne(`${apiUrl}${userIdQuery}`);
    expect(req.request.method).toBe('GET');

    // Respond with new data
    req.flush(reloadedTasks);

    // Assert that the signal is updated with the new data
    expect(service.tasks().length).toBe(1);
    expect(service.tasks()[0].title).toBe('New Reloaded Task');
  });

  it('should addTask, make a POST request, and update the signal', () => {
    // Arrange
    const newTitle = 'New Test Task';
    const mockResponse: Task = { id: 10, title: newTitle, completed: false, userId: mockUser.id };
    const expectedPayload: Omit<Task, 'id'> = {
      title: newTitle,
      completed: false,
      userId: mockUser.id,
    };
    const initialLength = service.tasks().length;

    // Act
    service.addTask(newTitle);

    // Assert: Expect a POST request
    const req = httpTestingController.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedPayload);

    // Respond
    req.flush(mockResponse);

    // Assert: Signal is updated synchronously
    expect(service.tasks().length).toBe(initialLength + 1);
    expect(service.tasks()[initialLength]).toEqual(mockResponse);
  });

  it('should updateTask and make a PUT request', () => {
    // Arrange: Use the completed task (ID 1)
    const taskToUpdate = service.tasks().find((t) => t.id === 1)!;
    const updatedTitle = 'Updated Completed Task 1';
    const updatedTask: Task = { ...taskToUpdate, title: updatedTitle };

    // Act
    service.updateTask(updatedTask);

    // Assert: Expect a PUT request
    const req = httpTestingController.expectOne(`${apiUrl}/${updatedTask.id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTask);

    // Respond with the updated task
    req.flush(updatedTask);

    // Assert: Signal is updated
    const taskInSignal = service.tasks().find((t) => t.id === 1);
    expect(taskInSignal!.title).toBe(updatedTitle);
  });

  it('should deleteTask and remove it from the signal', () => {
    // Arrange: Use pending task (ID 2)
    const idToDelete = 2;
    const initialLength = service.tasks().length;

    // Act
    service.deleteTask(idToDelete);

    // Assert: Expect a DELETE request
    const req = httpTestingController.expectOne(`${apiUrl}/${idToDelete}`);
    expect(req.request.method).toBe('DELETE');

    // Respond (200 OK with no body)
    req.flush(null);

    // Assert: Signal is updated
    expect(service.tasks().length).toBe(initialLength - 1);
    expect(service.tasks().some((t) => t.id === idToDelete)).toBeFalse();
  });

  it('should toggleTask and call updateTask to mark a pending task complete', () => {
    // Arrange: Grab the pending task (ID 2)
    const pendingTask = service.tasks().find((t) => t.id === 2)!;

    // Act
    service.toggleTask(pendingTask);

    // Assert 1: Expect a PUT request for the toggled task (completed: true)
    const updateReq = httpTestingController.expectOne(`${apiUrl}/${pendingTask.id}`);
    expect(updateReq.request.method).toBe('PUT');
    expect(updateReq.request.body.completed).toBeTrue();

    // Respond
    const toggledTask: Task = { ...pendingTask, completed: true };
    updateReq.flush(toggledTask);

    // Assert 2: Check signal
    expect(service.tasks().find((t) => t.id === 2)!.completed).toBeTrue();

    // Act 2: Try to toggle the now-completed task again (should be guarded by service logic)
    service.toggleTask(toggledTask);

    // Assert 3: No new requests should be queued
    httpTestingController.expectNone(`${apiUrl}/${pendingTask.id}`);
  });

  // --- Filtering & Computed Signal Tests ---

  it('should correctly compute filteredTasks for "all"', () => {
    service.setFilter('all');
    expect(service.filteredTasks().length).toBe(2);
  });

  it('should correctly compute filteredTasks for "completed"', () => {
    service.setFilter('completed');
    // Expect 1 completed task
    expect(service.filteredTasks().length).toBe(1);
    expect(service.filteredTasks().every((t) => t.completed)).toBeTrue();
  });

  it('should correctly compute filteredTasks for "pending"', () => {
    service.setFilter('pending');
    // Expect 1 pending task
    expect(service.filteredTasks().length).toBe(1);
    expect(service.filteredTasks().every((t) => !t.completed)).toBeTrue();
  });

  // --- Authentication Guard Tests (Refactored for Stability) ---

  it('should NOT call loadTasks if user is null', () => {
    // Ensure the initial request from beforeEach is cleared.
    httpTestingController.verify();

    // Un-authenticate the user
    mockUserService.user.set(null);
    service = TestBed.inject(TaskService); // Re-instantiate the service to trigger constructor

    // Assert that no GET request was made
    httpTestingController.expectNone(`${apiUrl}${userIdQuery}`);
  });

  it('should NOT call addTask if user is null', () => {
    // Ensure any requests from prior tests are cleared.
    httpTestingController.verify();

    // Un-authenticate the user
    mockUserService.user.set(null);

    // Act
    service.addTask('Unauthorized task');

    // Assert that no POST request was made
    httpTestingController.expectNone(apiUrl);
  });
});

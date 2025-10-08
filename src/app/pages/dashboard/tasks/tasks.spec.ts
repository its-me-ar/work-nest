import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Tasks } from './tasks';
import { Task } from '../../../core/models/task.model';
import { TaskService } from '../../../core/services/tasks/tasks-service';
import { ToastService } from '../../../core/services/toast/toast-service';

// --- Mock Data ---
const mockTask1: Task = { id: 1, title: 'Buy groceries', completed: false, userId: 101 };
const mockTask2: Task = { id: 2, title: 'Finish report', completed: true, userId: 101 };
const mockTasksData: Task[] = [mockTask1, mockTask2];

// --- Mock Dependencies ---

// 1. Mock TaskService using signals for state
const mockTaskService = {
  // Mock the signals used by the component getters
  tasks: signal<Task[]>(mockTasksData),
  filteredTasks: signal<Task[]>(mockTasksData),
  filter: signal<'all' | 'completed' | 'pending'>('all'),

  // Mock the action methods
  addTask: jasmine.createSpy('addTask'),
  updateTask: jasmine.createSpy('updateTask'),
  deleteTask: jasmine.createSpy('deleteTask'),
  toggleTask: jasmine.createSpy('toggleTask'),
  setFilter: jasmine.createSpy('setFilter'),
};

// 2. Mock ToastService
const mockToastService = {
  success: jasmine.createSpy('success'),
  info: jasmine.createSpy('info'),
  error: jasmine.createSpy('error'),
};

describe('Tasks', () => {
  let component: Tasks;
  let fixture: ComponentFixture<Tasks>;
  let taskService: typeof mockTaskService;
  let toastService: typeof mockToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tasks],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Tasks);
    component = fixture.componentInstance;
    
    // Inject services from the TestBed
    taskService = TestBed.inject(TaskService) as any;
    toastService = TestBed.inject(ToastService) as any;

    fixture.detectChanges();

    // Reset spies after initial creation/injection if needed
    taskService.addTask.calls.reset();
    toastService.success.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose filteredTasks and filter signals via getters', () => {
    // Assert against the mocked signals
    expect(component.filteredTasks()).toEqual(mockTasksData);
    expect(component.filter()).toBe('all');

    // Simulate change in service to ensure getter reflects it
    taskService.filter.set('pending');
    expect(component.filter()).toBe('pending');
  });

  describe('addOrUpdateTask', () => {
    it('should NOT call addTask if newTask is empty or whitespace', () => {
      component.newTask = '  ';
      component.addOrUpdateTask();

      expect(taskService.addTask).not.toHaveBeenCalled();
      expect(toastService.success).not.toHaveBeenCalled();
    });

    it('should call addTask and reset state when not in edit mode', () => {
      component.newTask = 'New Task Title';
      component.editTaskId = null;

      component.addOrUpdateTask();

      expect(taskService.addTask).toHaveBeenCalledWith('New Task Title');
      expect(toastService.success).toHaveBeenCalledWith('Task added successfully');
      expect(component.newTask).toBe('');
    });

    it('should call updateTask and reset state when in edit mode', () => {
      // Setup edit mode
      component.editTaskId = mockTask1.id;
      component.newTask = 'Updated Task Title';
      
      // Mock the task signal lookup (usually handled by the service, but we manually mock it here)
      // Since 'taskService.tasks()' is a signal, we simulate the internal find logic.
      taskService.tasks.set([mockTask1]);

      component.addOrUpdateTask();

      expect(taskService.updateTask).toHaveBeenCalledWith({ 
        ...mockTask1, 
        title: 'Updated Task Title' 
      });
      expect(toastService.success).toHaveBeenCalledWith('Task updated successfully');
      expect(component.newTask).toBe('');
      expect(component.editTaskId).toBeNull();
    });
  });

  it('should toggle a task and show info toast', () => {
    component.toggleTask(mockTask1);

    expect(taskService.toggleTask).toHaveBeenCalledWith(mockTask1);
    // Since mockTask1.completed is false, the message should be 'completed'
    expect(toastService.info).toHaveBeenCalledWith('Task marked completed');
  });

  describe('startEdit and cancelEdit', () => {
    it('should set edit state if task is not completed', () => {
      component.startEdit(mockTask1); // not completed

      expect(component.editTaskId).toBe(mockTask1.id);
      expect(component.newTask).toBe(mockTask1.title);
    });

    it('should NOT set edit state if task is completed', () => {
      component.startEdit(mockTask2); // completed

      expect(component.editTaskId).toBeNull();
      expect(component.newTask).toBe('');
    });

    it('should reset edit state on cancelEdit', () => {
      component.editTaskId = 5;
      component.newTask = 'editing...';

      component.cancelEdit();

      expect(component.editTaskId).toBeNull();
      expect(component.newTask).toBe('');
    });
  });

  describe('confirmDelete and deleteTaskConfirmed', () => {
    it('should set deleteTaskId on confirmDelete if task is not completed', () => {
      component.confirmDelete(mockTask1);

      expect(component.deleteTaskId).toBe(mockTask1.id);
    });

    it('should NOT set deleteTaskId on confirmDelete if task is completed', () => {
      component.confirmDelete(mockTask2);

      expect(component.deleteTaskId).toBeNull();
    });

    it('should call deleteTask, show success toast, and reset state on deleteTaskConfirmed', () => {
      component.deleteTaskId = mockTask1.id; // Simulate confirmation

      component.deleteTaskConfirmed();

      expect(taskService.deleteTask).toHaveBeenCalledWith(mockTask1.id);
      expect(toastService.success).toHaveBeenCalledWith('Task deleted successfully');
      expect(component.deleteTaskId).toBeNull();
    });

    it('should reset delete state on cancelDelete', () => {
      component.deleteTaskId = 5;
      component.cancelDelete();

      expect(component.deleteTaskId).toBeNull();
    });
  });

  it('should call taskService.setFilter when setFilter is called', () => {
    component.setFilter('completed');
    expect(taskService.setFilter).toHaveBeenCalledWith('completed');

    component.setFilter('pending');
    expect(taskService.setFilter).toHaveBeenCalledWith('pending');
  });
});

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environment/environment';
import { Task } from '../../models/task.model';
import { UserService } from '../users/user-service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private api = environment.apiUrl;
  private apiUrl = `${this.api}/tasks`;

  // Signals for state
  private tasksSignal = signal<Task[]>([]);
  private filterSignal = signal<'all' | 'completed' | 'pending'>('all');

  // Computed signal for filtered tasks
  readonly filteredTasks = computed(() => {
    const filter = this.filterSignal();
    const tasks = this.tasksSignal();

    if (filter === 'completed') return tasks.filter((t) => t.completed);
    if (filter === 'pending') return tasks.filter((t) => !t.completed);
    return tasks;
  });

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {
    this.loadTasks();
  }

  // API Calls
  loadTasks() {
    const user = this.userService.user();
    if (!user) return;

    // Load only tasks for the current user
    this.http
      .get<Task[]>(`${this.apiUrl}?userId=${user.id}`)
      .subscribe((tasks) => this.tasksSignal.set(tasks));
  }

  addTask(title: string) {
    const user = this.userService.user();
    if (!user) return;

    const newTask: Omit<Task, 'id'> = { title, completed: false, userId: user.id };
    this.http
      .post<Task>(this.apiUrl, newTask)
      .pipe(tap((task) => this.tasksSignal.update((tasks) => [...tasks, task])))
      .subscribe();
  }

  updateTask(task: Task) {
    this.http
      .put<Task>(`${this.apiUrl}/${task.id}`, task)
      .pipe(
        tap((updated) => {
          this.tasksSignal.update((tasks) => tasks.map((t) => (t.id === updated.id ? updated : t)));
        }),
      )
      .subscribe();
  }

  deleteTask(id: number) {
    this.http
      .delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.tasksSignal.update((tasks) => tasks.filter((t) => t.id !== id));
        }),
      )
      .subscribe();
  }

  toggleTask(task: Task) {
    if (task.completed) return;
    this.updateTask({ ...task, completed: !task.completed });
  }

  // Sibling communication
  setFilter(filter: 'all' | 'completed' | 'pending') {
    this.filterSignal.set(filter);
  }

  get tasks() {
    return this.tasksSignal.asReadonly();
  }

  get filter() {
    return this.filterSignal.asReadonly();
  }
}

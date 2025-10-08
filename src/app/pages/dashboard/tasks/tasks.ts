import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/tasks/tasks-service';
import { Task } from '../../../core/models/task.model';
import { ToastService } from '../../../core/services/toast/toast-service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tasks.html',
})
export class Tasks {
  newTask = '';
  editTaskId: number | null = null;
  deleteTaskId: number | null = null;

  constructor(
    private taskService: TaskService,
    private toast: ToastService,
  ) {}

  get filteredTasks() {
    return this.taskService.filteredTasks;
  }

  get filter() {
    return this.taskService.filter;
  }

  addOrUpdateTask() {
    if (!this.newTask.trim()) return;

    if (this.editTaskId) {
      const task = this.taskService.tasks().find((t) => t.id === this.editTaskId);
      if (task) {
        this.taskService.updateTask({ ...task, title: this.newTask });
        this.toast.success('Task updated successfully');
      }
      this.editTaskId = null;
    } else {
      this.taskService.addTask(this.newTask.trim());
      this.toast.success('Task added successfully');
    }

    this.newTask = '';
  }

  toggleTask(task: Task) {
    this.taskService.toggleTask(task);
    this.toast.info(`Task marked ${task.completed ? 'pending' : 'completed'}`);
  }

  startEdit(task: Task) {
    if (task.completed) return;
    this.editTaskId = task.id;
    this.newTask = task.title;
  }

  confirmDelete(task: Task) {
    if (task.completed) return;
    this.deleteTaskId = task.id;
  }

  deleteTaskConfirmed() {
    if (this.deleteTaskId !== null) {
      this.taskService.deleteTask(this.deleteTaskId);
      this.toast.success('Task deleted successfully');
      this.deleteTaskId = null;
    }
  }

  cancelDelete() {
    this.deleteTaskId = null;
  }

  cancelEdit() {
    this.editTaskId = null;
    this.newTask = '';
  }

  setFilter(filter: 'all' | 'completed' | 'pending') {
    this.taskService.setFilter(filter);
  }
}

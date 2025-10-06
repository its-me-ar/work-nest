import { Component, effect, signal } from '@angular/core';
import { TaskService } from '../../../core/services/tasks/tasks-service';
import { LeavesService } from '../../../core/services/leaves/leaves-service';
import { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './home.html',
})
export class Home {
  // Task stats
  totalCompleted = signal(0);
  totalPending = signal(0);

  // Leave stats
  leavesApproved = signal(0);
  leavesPending = signal(0);

  // Chart Data (as signals so they update reactively)
  taskChartData = signal<ChartData<'doughnut'>>({
    labels: ['Completed', 'Pending'],
    datasets: [
      { 
        data: [0, 0],
        backgroundColor: ['#16a34a', '#facc15'],
      }
    ],
  });

  leaveChartData = signal<ChartData<'doughnut'>>({
    labels: ['Approved', 'Pending'],
    datasets: [
      { 
        data: [0, 0],
        backgroundColor: ['#3b82f6', '#ef4444'],
      }
    ],
  });

  taskChartOptions: ChartOptions<'doughnut'> = { responsive: true };
  leaveChartOptions: ChartOptions<'doughnut'> = { responsive: true };

  constructor(
    private taskService: TaskService,
    private leavesService: LeavesService
  ) {
    this.leavesService.loadLeaves();

    // Reactive effect for tasks & leaves
    effect(() => {
      // ✅ Tasks
      const tasks = this.taskService.filteredTasks();
      const completed = tasks.filter((t) => t.completed).length;
      const pending = tasks.filter((t) => !t.completed).length;
      this.totalCompleted.set(completed);
      this.totalPending.set(pending);

      this.taskChartData.set({
        labels: ['Completed', 'Pending'],
        datasets: [
          { 
            data: [completed, pending],
            backgroundColor: ['#16a34a', '#facc15'],
          }
        ],
      });

      // ✅ Leaves
      const leaves = this.leavesService.leaves();
      const approved = leaves.filter((l) => l.status === 'Approved').length;
      const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;
      this.leavesApproved.set(approved);
      this.leavesPending.set(pendingLeaves);

      this.leaveChartData.set({
        labels: ['Approved', 'Pending'],
        datasets: [
          { 
            data: [approved, pendingLeaves],
            backgroundColor: ['#3b82f6', '#ef4444'],
          }
        ],
      });
    });
  }

  ngOnDestroy() {
    this.totalCompleted.set(0);
    this.totalPending.set(0);
    this.leavesApproved.set(0);
    this.leavesPending.set(0);
  }
}

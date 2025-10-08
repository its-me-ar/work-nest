import { Injectable, signal, computed } from '@angular/core';
import { Leave } from '../../models/leave.model';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../users/user-service';
import { environment } from '../../../../environment/environment';

@Injectable({ providedIn: 'root' })
export class LeavesService {
  private api = `${environment.apiUrl}/leaves`;
  private leavesSignal = signal<Leave[]>([]);

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  loadLeaves() {
    const userId = this.userService.user()?.id;
    this.http.get<Leave[]>(`${this.api}?userId=${userId}`).subscribe((leaves) => {
      this.leavesSignal.set(leaves);
    });
  }

  leaves() {
    return this.leavesSignal();
  }

  applyLeave(data: Omit<Leave, 'id' | 'status' | 'userId'>) {
    const userId = this.userService.user()?.id;
    if (!userId) return;

    const leave: Omit<Leave, 'id'> = {
      ...data,
      status: 'Pending', // default
      userId,
    };

    this.http.post<Leave>(this.api, leave).subscribe((l) => {
      this.leavesSignal.update((leaves) => [...leaves, l]);
    });
  }
}

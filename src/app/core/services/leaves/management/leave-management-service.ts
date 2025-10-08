import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../../environment/environment';
import { Leave, LeaveWithUser } from '../../../models/leave.model';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../users/user-service';

@Injectable({ providedIn: 'root' })
export class LeaveManagementService {
  private api = `${environment.apiUrl}/leaves`;
  private usersApi = `${environment.apiUrl}/users`;
  private leavesSignal = signal<LeaveWithUser[]>([]);

  constructor(
    private http: HttpClient,
    private userService: UserService,
  ) {}

  /** Load all leaves for admin excluding admin's own leaves and attach user info */
  loadLeaves() {
    const adminId = Number(this.userService.user()?.id); // convert to number

    this.http.get<Leave[]>(`${this.api}`).subscribe((leaves) => {
      this.http.get<any[]>(`${this.usersApi}`).subscribe((users) => {
        const filtered = leaves
          .filter((l) => Number(l.userId) !== adminId) // convert userId to number
          .map((l) => {
            const user = users.find((u) => Number(u.id) === Number(l.userId));
            return {
              ...l,
              userEmail: user?.email || '',
            };
          });
        this.leavesSignal.set(filtered);
      });
    });
  }

  /** Return current leaves signal */
  leaves() {
    return this.leavesSignal();
  }

  /** Approve leave */
  approveLeave(leaveId: number) {
    this.updateLeaveStatus(leaveId, 'Approved');
  }

  /** Reject leave with reason */
  rejectLeave(leaveId: number, reason: string) {
    this.updateLeaveStatus(leaveId, 'Rejected', reason);
  }

  /** Internal: update leave status */
  private updateLeaveStatus(
    leaveId: number,
    status: 'Approved' | 'Rejected',
    rejectReason?: string,
  ) {
    const leave = this.leavesSignal().find((l) => l.id === leaveId);
    if (!leave) return;

    const payload: Partial<LeaveWithUser> = { status };
    if (rejectReason) payload.rejectReason = rejectReason;

    this.http.patch<Leave>(`${this.api}/${leaveId}`, payload).subscribe((updated) => {
      // update local signal
      this.leavesSignal.set(
        this.leavesSignal().map((l) => (l.id === leaveId ? { ...l, ...updated } : l)),
      );
    });
  }
}

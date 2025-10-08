import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaveManagementService } from '../../../core/services/leaves/management/leave-management-service';
import { LeaveWithUser } from '../../../core/models/leave.model';
import { RejectReasonModal } from '../../../components/leaves/reject-reason-component/reject-reason-modal';

@Component({
  selector: 'app-leave-management',
  standalone: true,
  imports: [CommonModule, RejectReasonModal],
  templateUrl: './leave-management.html',
})
export class LeaveManagement implements OnInit {
  @ViewChild(RejectReasonModal) rejectModal!: RejectReasonModal;

  expandedLeaves = new Set<number>();

  constructor(public leaveService: LeaveManagementService) {}

  ngOnInit() {
    this.leaveService.loadLeaves();
  }

  toggleAccordion(leaveId: number) {
    this.expandedLeaves.has(leaveId)
      ? this.expandedLeaves.delete(leaveId)
      : this.expandedLeaves.add(leaveId);
  }

  isExpanded(leaveId: number) {
    return this.expandedLeaves.has(leaveId);
  }

  approve(leaveId: number) {
    this.leaveService.approveLeave(leaveId);
  }

  async reject(leaveId: number) {
    if (!this.rejectModal) return;

    // open modal and wait for user input
    const reason = await this.rejectModal.open();
    if (reason) {
      this.leaveService.rejectLeave(leaveId, reason);
    }
  }

  isPending(leave: LeaveWithUser) {
    return leave.status === 'Pending';
  }
}

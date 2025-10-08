// leaves.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { LeavesService } from '../../../core/services/leaves/leaves-service';
import { ToastService } from '../../../core/services/toast/toast-service';
import { leaveDateValidator, normalizeDate, toDateValidator } from '../../../utils/helper';

@Component({
  selector: 'app-leaves',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './leaves.html',
})
export class Leaves implements OnInit {
  leaveForm!: FormGroup;
  showForm = false;
  today = '';

  constructor(
    private fb: FormBuilder,
    private leaveService: LeavesService,
    private toast: ToastService,
  ) {}

  ngOnInit() {
    this.today = new Date().toISOString().split('T')[0]; // yyyy-MM-dd

    this.leaveForm = this.fb.group({
      fromDate: ['', [Validators.required, leaveDateValidator]],
      toDate: ['', [Validators.required, toDateValidator('fromDate')]],
      type: ['Sick', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(5)]],
    });

    this.leaveService.loadLeaves();
    this.onTypeChange(); // initialize dates for default type
  }

  // Expose leaves as a getter
  get leaves() {
    return this.leaveService.leaves();
  }

  // Shortcut for form controls
  get f() {
    return this.leaveForm.controls;
  }

  // Called when leave type changes
  onTypeChange() {
    const type = this.f['type'].value;
    const todayStr = new Date().toISOString().split('T')[0];

    if (type === 'Sick') {
      // Sick → only today
      this.f['fromDate'].setValue(todayStr);
      this.f['toDate'].setValue(todayStr);
    } else if (type === 'Casual') {
      // Casual → today or future
      const fromDate = this.f['fromDate'].value;
      if (!fromDate || new Date(fromDate) < new Date(todayStr)) {
        this.f['fromDate'].setValue(todayStr);
      }
      const toDate = this.f['toDate'].value;
      if (!toDate || new Date(toDate) < new Date(this.f['fromDate'].value)) {
        this.f['toDate'].setValue(this.f['fromDate'].value);
      }
    }

    // Re-validate dates
    this.f['fromDate'].updateValueAndValidity();
    this.f['toDate'].updateValueAndValidity();
  }

  applyLeave() {
    if (this.leaveForm.invalid) {
      this.toast.error('Please fix errors before submitting ❌');
      return;
    }

    const from = new Date(this.f['fromDate'].value);
    const to = new Date(this.f['toDate'].value);
    const leaveType = this.f['type'].value;
    const todayTime = normalizeDate(new Date());
    const fromTime = normalizeDate(from);

    // Sick → only today, Casual → today or future
    if (leaveType === 'Sick' && fromTime !== todayTime) {
      this.toast.error('Sick leave can only be applied for today ❌');
      return;
    }
    if (leaveType === 'Casual' && fromTime < todayTime) {
      this.toast.error('Casual leave cannot start in the past ❌');
      return;
    }

    // Check overlapping leaves
    const overlapping = this.leaves.some((leave) => {
      const leaveFrom = normalizeDate(new Date(leave.fromDate));
      const leaveTo = normalizeDate(new Date(leave.toDate));
      return fromTime <= leaveTo && normalizeDate(to) >= leaveFrom;
    });

    if (overlapping) {
      this.toast.error('You already have leave during these dates ❌');
      return;
    }

    // Apply leave
    this.leaveService.applyLeave({
      fromDate: this.f['fromDate'].value,
      toDate: this.f['toDate'].value,
      type: leaveType,
      reason: this.f['reason'].value,
    });

    this.toast.success('Leave added successfully ✅');
    this.leaveForm.reset({ type: 'Sick' });
    this.onTypeChange(); // reset dates according to default type
    this.leaveForm.markAsPristine();
    this.leaveForm.markAsUntouched();
    this.showForm = false;
  }
}

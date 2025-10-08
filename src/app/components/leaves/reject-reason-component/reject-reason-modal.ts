import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
} from '@angular/forms';

@Component({
  selector: 'app-reject-reason-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reject-reason-modal.html',
})
export class RejectReasonModal {
  @Output() onReject = new EventEmitter<string>();
  isOpen = false;

  form: FormGroup;

  private resolveCallback: ((reason: string) => void) | null = null;

  constructor(private fb: FormBuilder) {
    // Initialize form inside constructor
    this.form = this.fb.group({
      reason: ['', Validators.required],
    });
  }

  open(): Promise<string> {
    this.isOpen = true;
    this.form.reset();
    return new Promise((resolve) => {
      this.resolveCallback = resolve;
    });
  }

  submit() {
    if (this.form.valid) {
      const reason = this.form.value.reason!;
      this.isOpen = false;
      this.resolveCallback?.(reason);
      this.resolveCallback = null;
    }
  }

  close() {
    this.isOpen = false;
    this.resolveCallback?.('');
    this.resolveCallback = null;
  }
}

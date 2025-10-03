import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";

// ✅ Custom validator → From date cannot be in the past
export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(control.value);
  return selected < today ? { pastDate: true } : null;
}

// ✅ Custom validator → To date must be >= from date
export function toDateValidator(fromControlName: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;
    const fromDate = parent.get(fromControlName)?.value;
    const toDate = control.value;
    if (!fromDate || !toDate) return null;
    return new Date(toDate) < new Date(fromDate) ? { invalidRange: true } : null;
  };
}

export function leaveDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;

  const parent = control.parent as FormGroup;
  if (!parent) return null;

  const leaveType = parent.get('type')?.value;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(control.value);
  selected.setHours(0, 0, 0, 0);

  if (leaveType === 'Sick') {
    // Sick leave: only today
    if (selected.getTime() !== today.getTime()) {
      return { invalidSickDate: true };
    }
  } else if (leaveType === 'Casual') {
    // Casual leave: today or future
    if (selected < today) {
      return { pastCasualDate: true };
    }
  }

  return null;
}
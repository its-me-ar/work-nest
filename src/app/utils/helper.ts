import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";

// ✅ Custom validator → From date cannot be in the past
export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selected = new Date(control.value);
  return selected < today ? { pastDate: true } : null;
}


// ✅ Helper to normalize dates (ignore time)
export function normalizeDate(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

// ✅ Custom validator for Sick/Casual leave rules
export function leaveDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const parent = control.parent as FormGroup;
  if (!parent) return null;

  const leaveType = parent.get('type')?.value;
  const today = new Date();
  const selected = new Date(control.value);

  const todayTime = normalizeDate(today);
  const selectedTime = normalizeDate(selected);

  if (leaveType === 'Sick' && selectedTime !== todayTime) {
    return { invalidSickDate: true };
  }
  if (leaveType === 'Casual' && selectedTime < todayTime) {
    return { pastCasualDate: true };
  }
  return null;
}

// ✅ Validator to ensure toDate >= fromDate
export function toDateValidator(fromControlName: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const parent = control.parent as FormGroup;
    if (!parent) return null;

    const fromDate = parent.get(fromControlName)?.value;
    if (!fromDate) return null;

    const fromTime = normalizeDate(new Date(fromDate));
    const toTime = normalizeDate(new Date(control.value));

    return toTime < fromTime ? { dateRange: true } : null;
  };
}
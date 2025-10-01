import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSignal = signal<Toast[]>([]);
  private counter = 0;

  toasts = this.toastsSignal.asReadonly();

  show(message: string, type: ToastType = 'info', duration = 3000) {
    const id = this.counter++;
    const toast: Toast = { message, type, id };
    this.toastsSignal.update((t) => [...t, toast]);

    setTimeout(() => this.remove(id), duration);
  }

  remove(id: number) {
    this.toastsSignal.update((t) => t.filter((toast) => toast.id !== id));
  }

  success(message: string) {
    this.show(message, 'success');
  }
  error(message: string) {
    this.show(message, 'error');
  }
  info(message: string) {
    this.show(message, 'info');
  }
}

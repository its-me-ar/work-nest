import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UiStateService {
  private _isMobileMenuOpen = new BehaviorSubject<boolean>(false);
  isMobileMenuOpen$ = this._isMobileMenuOpen.asObservable();

  private _isSidebarOpen = new BehaviorSubject<boolean>(true);
  isSidebarOpen$ = this._isSidebarOpen.asObservable();

  constructor() {
    // Handle dynamic window resize (SSR-safe)
    if (typeof window !== 'undefined') {
      fromEvent(window, 'resize')
        .pipe(debounceTime(200))
        .subscribe(() => this.updateSidebarForViewport());
    }
  }

  /** Toggle mobile menu */
  toggleMobileMenu() {
    this._isMobileMenuOpen.next(!this._isMobileMenuOpen.value);
  }

  /** Toggle sidebar (desktop only) */
  toggleSidebar() {
    this._isSidebarOpen.next(!this._isSidebarOpen.value);
  }

  /** Initialize sidebar state */
  initSidebar() {
    this.updateSidebarForViewport();
    this._isMobileMenuOpen.next(false); // mobile menu closed
  }

  /** Update sidebar based on viewport width */
  private updateSidebarForViewport() {
    if (typeof window !== 'undefined') {
      const isDesktop = window.innerWidth >= 1024;
      this._isSidebarOpen.next(isDesktop);

      // Close mobile menu when switching to desktop
      if (isDesktop) {
        this._isMobileMenuOpen.next(false);
      }
    }
  }
}

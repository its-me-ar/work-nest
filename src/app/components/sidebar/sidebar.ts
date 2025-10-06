// sidebar.ts
import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboardIcon,
  ListCheckIcon,
  FileTextIcon,
  LogOutIcon,
  FileScanIcon,
} from 'lucide-angular';
import { UiStateService } from '../../core/services/ui-state.service';
import { UserService } from '../../core/services/users/user-service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  constructor(
    public ui: UiStateService,
    private userService: UserService,
    private router: Router
  ) {}
  readonly LayoutDashboardIcon = LayoutDashboardIcon;
  readonly ListCheckIcon = ListCheckIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly LogOutIcon = LogOutIcon;
  readonly FileScanIcon = FileScanIcon;
  // All possible nav items
  private allNavItems = [
    { icon: LayoutDashboardIcon, label: 'Dashboard', route: '/' },
    { icon: ListCheckIcon, label: 'My Task', route: '/tasks' },
    { icon: FileTextIcon, label: 'Leaves', route: '/leaves' },
    { icon: FileScanIcon, label: 'Leave-review', route: '/leave-management', roles: ['admin'] },
  ];

  // Filter nav items based on user role
  navItems = computed(() => {
    const user = this.userService.user();
    return this.allNavItems.filter(item => {
      if (!item.roles) return true; // no role restriction
      return user && item.roles.includes(user.role || '');
    });
  });

  isDesktop(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  }

  logout() {
    this.userService.clearUser();
    this.router.navigate(['/login']);
  }
}

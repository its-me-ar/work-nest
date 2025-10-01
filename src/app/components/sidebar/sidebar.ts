// sidebar.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboardIcon,
  ListCheckIcon,
  FileTextIcon,
  LogOutIcon,
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

  navItems = [
    { icon: LayoutDashboardIcon, label: 'Dashboard', route: '/' },
    { icon: ListCheckIcon, label: 'My Task', route: '/tasks' },
    { icon: FileTextIcon, label: 'Leaves', route: '/leaves' },
  ];

  isDesktop(): boolean {
    return typeof window !== 'undefined' && window.innerWidth >= 1024;
  }

  logout() {
    this.userService.clearUser();
    this.router.navigate(['/login']);
  }
}

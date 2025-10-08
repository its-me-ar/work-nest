import { Component } from '@angular/core';
import { LucideAngularModule, PanelRight, SearchIcon, BellIcon } from 'lucide-angular';
import { UiStateService } from '../../core/services/ui-state.service';

@Component({
  selector: 'app-header',
  imports: [LucideAngularModule],
  templateUrl: './header.html',
})
export class Header {
  constructor(public ui: UiStateService) {}
  readonly PanelRight = PanelRight;
  readonly SearchIcon = SearchIcon;
  readonly BellIcon = BellIcon;
}

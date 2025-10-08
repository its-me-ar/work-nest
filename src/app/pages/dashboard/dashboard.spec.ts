import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Dashboard } from './dashboard';
import { UiStateService } from '../../core/services/ui-state.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing'; // ADDED: Import RouterTestingModule

// --- Mock Dependencies ---

// 1. Mock UiStateService
const mockUiStateService = {
  // Spy on the method called in ngOnInit
  initSidebar: jasmine.createSpy('initSidebar'),
  // Add any other properties the component accesses publicly, though none are accessed directly in this version
};

describe('Dashboard', () => {
  let component: Dashboard;
  let fixture: ComponentFixture<Dashboard>;
  let uiStateService: typeof mockUiStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Dashboard,
        RouterTestingModule.withRoutes([]), // ADDED: Include RouterTestingModule
      ],
      providers: [
        { provide: UiStateService, useValue: mockUiStateService },
      ],
      // Since Dashboard imports other standalone components (Sidebar, Header) 
      // which we don't need to test here, we use NO_ERRORS_SCHEMA 
      // to prevent errors about unrecognized selectors if they are not explicitly mocked.
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(Dashboard);
    component = fixture.componentInstance;
    
    // Inject the mocked service
    uiStateService = TestBed.inject(UiStateService) as any;

    // Reset the spy here to clear any unwanted calls that may happen during component construction.
    uiStateService.initSidebar.calls.reset();

    // NOTE: fixture.detectChanges() is intentionally removed from beforeEach
    // and will be called only in the relevant test case below.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call uiStateService.initSidebar on ngOnInit', () => {
    // Manually trigger change detection to call ngOnInit exactly once for this test
    fixture.detectChanges(); 
    expect(uiStateService.initSidebar).toHaveBeenCalledTimes(1);
  });

  it('should expose the UiStateService instance publicly via the "ui" property', () => {
    expect(component.ui).toBe(uiStateService as any);
  });
});

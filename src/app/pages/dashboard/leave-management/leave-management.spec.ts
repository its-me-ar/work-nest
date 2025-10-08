import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { LeaveManagement } from './leave-management';
import { LeaveManagementService } from '../../../core/services/leaves/management/leave-management-service';
import { LeaveWithUser } from '../../../core/models/leave.model';
import { provideHttpClientTesting } from '@angular/common/http/testing';
// NOTE: Removed import for RejectReasonModal as we are manually injecting the mock

// --- Mock Dependencies ---

// 1. Mock Data
const mockLeaves: LeaveWithUser[] = [
  {
    id: 1,
    fromDate: '2024-01-01',
    toDate: '2024-01-05',
    type: 'Sick',
    reason: 'Flu',
    status: 'Pending',
    userId: 1,
    userEmail: 'user1@test.com',
  },
  {
    id: 2,
    fromDate: '2024-02-01',
    toDate: '2024-02-05',
    type: 'Casual',
    reason: 'Vacation',
    status: 'Approved',
    userId: 2,
    userEmail: 'user2@test.com',
  },
];

// 2. Mock LeaveManagementService
const mockLeavesSignal = signal<LeaveWithUser[]>(mockLeaves);

const mockLeaveManagementService = {
  // Public signal used in template (assumed)
  leaves: mockLeavesSignal,
  loadLeaves: jasmine.createSpy('loadLeaves'),
  approveLeave: jasmine.createSpy('approveLeave'),
  rejectLeave: jasmine.createSpy('rejectLeave'),
};

// 3. Mock RejectReasonModal Class (Not a Component since it's not rendered)
class MockRejectReasonModal {
  // Use a signal to control the return value from the test environment
  returnValue: WritableSignal<string | null> = signal(null);

  // Implements the public 'open' method the component expects
  // The real modal's 'open' returns Promise<string>, which resolves to '' on close.
  open(): Promise<string> {
    // We cast the signal value to string | null here, but the real modal promises a string.
    // The component's `reject` method expects `null` or `string`. We will ensure the mock
    // resolves correctly based on the test case, using '' for cancellation.
    return Promise.resolve(this.returnValue() === null ? '' : (this.returnValue() as string));
  }
}

describe('LeaveManagement', () => {
  let component: LeaveManagement;
  let fixture: ComponentFixture<LeaveManagement>;
  let leaveService: typeof mockLeaveManagementService;
  let mockModal: MockRejectReasonModal;

  beforeEach(async () => {
    // Step 1: Configure the test bed with the component and mock services
    await TestBed.configureTestingModule({
      // We keep the real component in imports for correct setup
      imports: [LeaveManagement],
      providers: [
        // Satisfies the HttpClient dependency in the real service's constructor
        provideHttpClientTesting(),
        { provide: LeaveManagementService, useValue: mockLeaveManagementService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveManagement);
    component = fixture.componentInstance;

    leaveService = TestBed.inject(LeaveManagementService) as any;

    // Manually instantiate and assign the mock modal to bypass @ViewChild template resolution issues.
    mockModal = new MockRejectReasonModal();
    component.rejectModal = mockModal as any;

    // Initial change detection triggers ngOnInit (and we don't need to wait for ViewChild)
    fixture.detectChanges();

    // Reset spies after setup
    leaveService.loadLeaves.calls.reset();
    leaveService.approveLeave.calls.reset();
    leaveService.rejectLeave.calls.reset();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call leaveService.loadLeaves on ngOnInit', () => {
    // Arrange: Reset the spy call count since it was called in setup
    leaveService.loadLeaves.calls.reset();

    // Act
    component.ngOnInit();

    // Assert
    expect(leaveService.loadLeaves).toHaveBeenCalledTimes(1);
  });

  describe('Accordion Management', () => {
    it('should toggle expandedLeaves set when toggleAccordion is called', () => {
      // Act 1: Expand
      component.toggleAccordion(1);
      expect(component.isExpanded(1)).toBeTrue();
      expect(component.expandedLeaves.size).toBe(1);

      // Act 2: Collapse
      component.toggleAccordion(1);
      expect(component.isExpanded(1)).toBeFalse();
      expect(component.expandedLeaves.size).toBe(0);
    });
  });

  describe('Action Handlers', () => {
    it('should call leaveService.approveLeave when approve is called', () => {
      // Act
      component.approve(1);

      // Assert
      expect(leaveService.approveLeave).toHaveBeenCalledWith(1);
    });

    it('should identify a leave as pending correctly', () => {
      expect(component.isPending(mockLeaves[0])).toBeTrue(); // Status: Pending
      expect(component.isPending(mockLeaves[1])).toBeFalse(); // Status: Approved
    });
  });
});

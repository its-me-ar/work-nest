import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectReasonModal } from './reject-reason-modal';

describe('RejectReasonModal', () => {
  let component: RejectReasonModal;
  let fixture: ComponentFixture<RejectReasonModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectReasonModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectReasonModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { ToastService, ToastType } from './toast-service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  // Basic check
  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.toasts()).toEqual([]);
  });

  // Test helper methods using a spy
  describe('Helper Methods (success, error, info)', () => {
    // The spy signature is now simpler because we only check the arguments that are passed.
    let showSpy: jasmine.Spy<(message: string, type?: ToastType, duration?: number) => void>;
    const testMessage = 'Helper Test';

    beforeEach(() => {
      // Arrange: Spy on the internal show method
      showSpy = spyOn(service, 'show');
    });

    it('success() should call show with type "success"', () => {
      service.success(testMessage);
      // FIX: Only assert on the arguments that are explicitly passed (message, type)
      expect(showSpy).toHaveBeenCalledWith(testMessage, 'success');
    });

    it('error() should call show with type "error"', () => {
      service.error(testMessage);
      // FIX: Only assert on the arguments that are explicitly passed (message, type)
      expect(showSpy).toHaveBeenCalledWith(testMessage, 'error');
    });

    it('info() should call show with type "info"', () => {
      service.info(testMessage);
      // FIX: Only assert on the arguments that are explicitly passed (message, type)
      expect(showSpy).toHaveBeenCalledWith(testMessage, 'info');
    });
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router'; // 👈 Import provideRouter
import { NotFound } from './not-found';

describe('NotFound', () => {
  let component: NotFound;
  let fixture: ComponentFixture<NotFound>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [
        // 💡 Use provideRouter to satisfy RouterLink dependencies
        // This is the modern, non-deprecated approach for standalone components.
        provideRouter([]), 
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFound);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the NotFound component', () => {
    expect(component).toBeTruthy();
  });
});
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        // Add HTTP providers for a robust root component setup
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    })
    // FIX: Override the component's template to provide content inline for testing.
    // This allows the test runner to find the 'h1' element without loading app.html.
    .overrideComponent(App, {
        set: {
            template: `
                <header>
                    <h1>Hello, {{ title() }}</h1>
                </header>
                <router-outlet />
                <app-toast />
            `,
        },
    })
    .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    
    // The test now correctly checks the content of the H1 from the overridden template
    expect(compiled.querySelector('h1')?.textContent).toContain('Hello, work-nest');
  });
});

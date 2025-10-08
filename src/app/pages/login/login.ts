import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth-service';
import { UserService } from '../../core/services/users/user-service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  loginForm: FormGroup;
  loading = signal(false);
  error = signal('');

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private userService: UserService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const { email, password } = this.loginForm.value;

    this.auth.login(email, password).subscribe({
      next: (user) => {
        this.loading.set(false);
        if (user) {
          this.userService.setUser(user);
          this.router.navigate(['/']); // redirect to dashboard
        } else {
          this.error.set('Invalid email or password');
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Server error');
      },
    });
  }
}

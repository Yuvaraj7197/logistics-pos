import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  // standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {

  email = '';
  password = '';
  step = 1; 
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;


  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
  this.errorMessage = '';
  this.successMessage = '';
  this.isLoading = true;

  if (this.step === 1) {
    // Step 1: Verify email
    const params = { email: this.email };
    this.authService.LoginVerify(params).subscribe({
      next: (response: any) => {
        console.log('Email verify response:', response);
        if (response?.email) {
          this.successMessage = 'Email verified. Please enter your password.';
          this.step = 2;
        } else {
          this.errorMessage = response?.message || 'No account found with this email.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Email verify error:', err);
        this.errorMessage = err.error?.message || 'Failed to verify email.';
        this.isLoading = false;
      }
    });
  } else if (this.step === 2) {
    // Step 2: Login with password
    const params = { email: this.email, password: this.password };
    this.authService.login(params).subscribe({
      next: (response: any) => {
        console.log('Login response:', response);
        if (response?.access) {
          this.successMessage = `Welcome back, ${response.full_name || this.email}!`;
          this.authService.saveLoginStatus(response);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Invalid password. Please try again.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = err.error?.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }
}


  showForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
  goToRegister() {
  this.router.navigate(['/register']);
}
togglePassword() {
  this.showPassword = !this.showPassword;
}

}
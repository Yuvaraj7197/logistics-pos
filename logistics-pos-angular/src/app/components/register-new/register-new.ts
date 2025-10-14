import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register-new',
  imports: [CommonModule, FormsModule],
  templateUrl: './register-new.html',
  styleUrls: ['./register-new.scss']
})
export class RegisterNew {
full_name = '';
  email = '';
  password = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;


  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
  this.errorMessage = '';
  this.successMessage = '';

  if (this.password !== this.confirmPassword) {
    this.errorMessage = 'Passwords do not match.';
    return;
  }

  const params = {
    full_name: this.full_name,
    email: this.email,
    password: this.password
  };

  this.isLoading = true;

  this.authService.register(params).subscribe({
    next: (response: any) => {
      this.isLoading = false;

      if (response?.message?.toLowerCase().includes('otp sent')) {
        // OTP sent successfully — redirect to verification
        this.successMessage = 'OTP sent! Please verify your email.';
        setTimeout(() => {
          this.router.navigate(['/verify-otp'], { state: { email: response.email } });
        }, 1000);
      } else {
        // fallback success
        this.successMessage = response?.message || 'Registration successful!';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      }
    },
    error: (err) => {
      this.isLoading = false;
      this.errorMessage = err.error?.message || 'Registration failed. Try again.';
    }
  });
}


  goToLogin() {
    this.router.navigate(['/login']);
  }
  togglePassword() {
  this.showPassword = !this.showPassword;
}

toggleConfirmPassword() {
  this.showConfirmPassword = !this.showConfirmPassword;
}

}

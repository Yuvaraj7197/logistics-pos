import { Component } from '@angular/core';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss'
})
export class ForgotPassword {
email = '';
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.email) {
      this.errorMessage = 'Please enter your registered email.';
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res?.message?.toLowerCase().includes('otp')) {
          this.successMessage = res.message || 'OTP sent to your email.';
          // Optionally redirect to verify OTP page
          setTimeout(() => {
            this.router.navigate(['/verify-otp'], { state: { email: this.email } });
          }, 1500);
        } else {
          this.successMessage = res.message || 'Please check your email.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send OTP. Try again.';
      }
    });
  }
  goToLogin() {
    this.router.navigate(['/login']);
  }
}


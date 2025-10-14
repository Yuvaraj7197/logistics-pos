import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verify-otp.html',
  styleUrls: ['./verify-otp.scss']
})
export class VerifyOtp {
// email = '';
//   otp = '';
//   message = '';

//   constructor(private http: HttpClient, private router: Router,private authService: AuthService) {
//     const nav = this.router.getCurrentNavigation();
//     this.email = nav?.extras?.state?.['email'] || '';
//   }

//   verifyOtp() {
//   if (!this.email || !this.otp) {
//     this.message = 'Please enter your OTP.';
//     return;
//   }

//   const params = { email: this.email, otp: this.otp };

//   this.authService.VerifyOtp(params).subscribe({
//     next: (res: any) => {
//       if (res.message?.toLowerCase().includes('user activated')) {
//         // Save login tokens
//         this.authService.saveLoginStatus({
//           access: res.access,
//           refresh: res.refresh,
//           full_name: res.full_name,
//           email: res.email,
//           role: res.role
//         });

//         this.message = 'User activated successfully!';
//         setTimeout(() => this.router.navigate(['/dashboard']), 1000);
//       } else {
//         this.message = res.message || 'Invalid OTP.';
//       }
//     },
//     error: (err) => {
//       this.message = err.error?.message || 'Verification failed. Try again.';
//     }
//   });
// }

// }

email = '';
  otp = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  oldPassword = '';
  otpVerified = false;

  constructor(private authService: AuthService, private router: Router) {
    const state = this.router.getCurrentNavigation()?.extras.state as any;
    if (state?.email) {
      this.email = state.email;
    } else {
      // redirect if no email in state
      this.router.navigate(['/forgot-password']);
    }
  }

  verifyOtp() {
    this.errorMessage = '';
    if (!this.otp) {
      this.errorMessage = 'Please enter OTP.';
      return;
    }

    this.isLoading = true;

    this.authService.VerifyOtp({ email: this.email, otp: this.otp }).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = res.message || 'OTP verified successfully!';
        this.otpVerified = true;
        this.saveLoginStatus(res);

      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Invalid OTP.';
      }
    });
  }

  resendOtp() {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;
    this.authService.forgotPassword(this.email).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = res.message || 'OTP resent successfully!';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to resend OTP.';
      }
    });
  }

  resetPassword() {
  this.errorMessage = '';
  this.successMessage = '';

  // Validate required fields
  if (!this.email || !this.otp || !this.newPassword || !this.confirmPassword) {
    this.errorMessage = 'All fields are required.';
    return;
  }

  // Validate password match
  if (this.newPassword !== this.confirmPassword) {
    this.errorMessage = 'Passwords do not match.';
    return;
  }

  this.isLoading = true;

  // Prepare payload
  const payload = {
    email: this.email,
    otp: this.otp,
    new_password: this.newPassword,
    confirm_password: this.confirmPassword
  };

  // Call API
  this.authService.resetPassword(payload.email, payload.otp, payload.new_password, payload.confirm_password)
    .subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.successMessage = res.message || 'Password reset successfully!';
        // Optionally redirect to login
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to reset password.';
      }
    });
}



  backToLogin() {
    this.router.navigate(['/login']);
  }
  saveLoginStatus(user: any) {
  localStorage.setItem('currentUser', JSON.stringify(user));
  localStorage.setItem('isLoggedIn', 'true');

  localStorage.setItem('admin_auth', user.access);
  localStorage.setItem('refresh_token', user.refresh);

  localStorage.setItem('email', user.email);
  localStorage.setItem('id', user.id);
  localStorage.setItem('full_name', user.full_name);
}


}

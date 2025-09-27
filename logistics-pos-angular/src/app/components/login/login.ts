import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    if (this.authService.login(this.username, this.password)) {
      this.successMessage = `Welcome back, ${this.authService.getCurrentUser()?.name}!`;
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 1000);
    } else {
      this.errorMessage = 'Invalid username or password. Please try again.';
      this.password = '';
    }

    this.isLoading = false;
  }

  showForgotPassword(): void {
    alert('Please contact your system administrator to reset your password.\n\nDemo credentials:\nUsername: admin\nPassword: password123');
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environmentCommon } from '../../environments/environment.common';
import { RemoteService } from './remote.service';

export interface User {
  username: string;
  password: string;
  role: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    api = environmentCommon.api;
    
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  // Demo users database
  private users: User[] = [
    { username: 'admin', password: 'password123', role: 'Administrator', name: 'System Administrator' },
    { username: 'manager', password: 'manager123', role: 'Manager', name: 'Production Manager' },
    { username: 'staff', password: 'staff123', role: 'Staff', name: 'Staff Member' },
    { username: 'demo', password: 'demo123', role: 'Demo User', name: 'Demo User' }
  ];

  constructor(private remote:RemoteService) {
    this.checkLoginStatus();
  }

  login(params: any) {
  return this.remote.sendRequest('POST', this.api.login.LOGIN, params);
}

  register(params: any) {
  return this.remote.sendRequest('POST', this.api.login.REGISTER, params);
}

  LoginVerify(params: any) {
    return this.remote.sendRequest('POST', this.api.login.LOGIN_VERIFY,params);
  }
  VerifyOtp(params: any) {
    return this.remote.sendRequest('POST', this.api.login.VERIFY_OTP,params);
  }
  forgotPassword(email: string) {
  return this.remote.sendRequest('POST', this.api.login.FORGOT_PASSWORD, { email });
}
changePassword(data: any) {
  return this.remote.sendRequest('POST', this.api.login.CHANGE_PASSWORD, data);
}

resetPassword(email: string, otp: string, newPassword: string, confirmPassword: string) {
  return this.remote.sendRequest('POST', this.api.login.RESET_PASSWORD, {
    email,
    otp,
    new_password: newPassword,
    confirm_password: confirmPassword
  });
}

  logout(): void {
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.isLoggedInSubject.value;
  }

  private checkLoginStatus(): void {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
    }
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

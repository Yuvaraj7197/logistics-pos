// auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor() {
    const storedUser = localStorage.getItem('admin_auth');
    if (storedUser) this.userSubject.next(JSON.parse(storedUser));
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

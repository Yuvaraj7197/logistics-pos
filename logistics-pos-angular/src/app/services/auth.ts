import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  constructor() {
    this.checkLoginStatus();
  }

  login(username: string, password: string): boolean {
    const user = this.users.find(u => u.username === username && u.password === password);

    if (user) {
      this.currentUserSubject.next(user);
      this.isLoggedInSubject.next(true);
      this.saveLoginStatus(user);
      return true;
    }

    return false;
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

  private saveLoginStatus(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }
}

// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isAuthenticated()) {
//     return true;
//   } else {
//     router.navigate(['/login']);
//     return false;
//   }
// };

import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Routes that do not require authentication
    const publicRoutes = ['login', 'mfa', 'forgot-password'];
    const currentRoute = route.routeConfig?.path?.split('/')[0];

    if (currentRoute && publicRoutes.includes(currentRoute)) {
      return true; 
    }

    const authData = localStorage.getItem('admin_auth');
    const mfaVerified = localStorage.getItem('mfa_verified');

    if (authData || mfaVerified) {
      return true; 
    }

    this.router.navigate(['/login']);
    return false;
  }
}

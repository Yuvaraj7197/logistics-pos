import { Routes } from '@angular/router';
import { AuthGuardService } from './guards/auth-guard';


export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) },
  {
  path: 'register',
  loadComponent: () =>
    import('./components/register-new/register-new').then(m => m.RegisterNew),
  },
  {
  path: 'verify-otp',
  loadComponent: () =>
    import('./components/verify-otp/verify-otp').then(m => m.VerifyOtp),
  },
  {
  path: 'forgot-password',
  loadComponent: () =>
    import('./components/forgot-password/forgot-password').then(m => m.ForgotPassword),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuardService]
  },
  {
    path: 'inventory',
    loadComponent: () => import('./components/inventory/inventory').then(m => m.InventoryComponent),
    canActivate: [AuthGuardService]
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/orders').then(m => m.OrdersComponent),
    canActivate: [AuthGuardService]
  },
  {
    path: 'staff',
    loadComponent: () => import('./components/staff/staff').then(m => m.StaffComponent),
    canActivate: [AuthGuardService]
  },
  {
    path: 'crm',
    loadComponent: () => import('./components/crm/crm').then(m => m.CrmComponent),
    canActivate: [AuthGuardService]
  },
  {
    path: 'suppliers',
    loadComponent: () => import('./components/suppliers/suppliers').then(m => m.SuppliersComponent),
    canActivate: [AuthGuardService]
  },
  {
    path: 'logistics',
    loadComponent: () => import('./components/logistics/logistics').then(m => m.LogisticsComponent),
    canActivate: [AuthGuardService]
  },
  {
    path: 'production',
    loadComponent: () => import('./components/production/production').then(m => m.ProductionComponent),
    canActivate: [AuthGuardService]
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports').then(m => m.ReportsComponent),
    canActivate: [AuthGuardService]
  },
  {
    path: 'accounting',
    loadComponent: () => import('./components/finance/finance').then(m => m.FinanceComponent),
    canActivate: [AuthGuardService]
  },
  { path: '**', redirectTo: '/dashboard' }
];

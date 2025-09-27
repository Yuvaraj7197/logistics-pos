import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login').then(m => m.LoginComponent) },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'inventory',
    loadComponent: () => import('./components/inventory/inventory').then(m => m.InventoryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./components/orders/orders').then(m => m.OrdersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'staff',
    loadComponent: () => import('./components/staff/staff').then(m => m.StaffComponent),
    canActivate: [authGuard]
  },
  {
    path: 'crm',
    loadComponent: () => import('./components/crm/crm').then(m => m.CrmComponent),
    canActivate: [authGuard]
  },
  {
    path: 'suppliers',
    loadComponent: () => import('./components/suppliers/suppliers').then(m => m.SuppliersComponent),
    canActivate: [authGuard]
  },
  {
    path: 'logistics',
    loadComponent: () => import('./components/logistics/logistics').then(m => m.LogisticsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'production',
    loadComponent: () => import('./components/production/production').then(m => m.ProductionComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    loadComponent: () => import('./components/reports/reports').then(m => m.ReportsComponent),
    canActivate: [authGuard]
  },
  {
    path: 'batch-tracking',
    loadComponent: () => import('./components/batch-tracking/batch-tracking').then(m => m.BatchTrackingComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];

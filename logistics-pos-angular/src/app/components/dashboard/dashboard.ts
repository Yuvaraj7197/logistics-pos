import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent {
  recentOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: 1250, status: 'Delivered', date: '2024-01-15' },
    { id: 'ORD-002', customer: 'Jane Smith', amount: 890, status: 'Pending', date: '2024-01-14' },
    { id: 'ORD-003', customer: 'Bob Johnson', amount: 2100, status: 'In Production', date: '2024-01-13' },
    { id: 'ORD-004', customer: 'Alice Brown', amount: 675, status: 'Dispatched', date: '2024-01-12' },
    { id: 'ORD-005', customer: 'Charlie Wilson', amount: 1450, status: 'Delivered', date: '2024-01-11' }
  ];

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'dispatched': return 'status-dispatched';
      case 'in production': return 'status-pending';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }
}

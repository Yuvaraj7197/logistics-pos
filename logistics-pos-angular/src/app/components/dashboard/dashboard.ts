import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  products$: Observable<any[]>;
  orders$: Observable<any[]>;
  staff$: Observable<any[]>;
  transactions$: Observable<any[]>;

  constructor(private dataService: DataService) {
    this.products$ = this.dataService.getProducts();
    this.orders$ = this.dataService.getOrders();
    this.staff$ = this.dataService.getStaff();
    this.transactions$ = this.dataService.getTransactions();
  }

  ngOnInit(): void {
    // Component initialization
  }

  getTotalOrders(): number {
    let total = 0;
    this.orders$.subscribe(orders => {
      total = orders.length;
    });
    return total;
  }

  getTodayRevenue(): number {
    const today = new Date().toISOString().split('T')[0];
    let revenue = 0;
    this.orders$.subscribe(orders => {
      revenue = orders
        .filter(order => order.date === today)
        .reduce((sum, order) => sum + order.total, 0);
    });
    return revenue;
  }

  getPendingOrders(): number {
    let pending = 0;
    this.orders$.subscribe(orders => {
      pending = orders.filter(order => order.status === 'Pending').length;
    });
    return pending;
  }

  getLowStockItems(): number {
    let lowStock = 0;
    this.products$.subscribe(products => {
      lowStock = products.filter(product => product.stock <= product.minStock).length;
    });
    return lowStock;
  }

  getRecentOrders(): any[] {
    let recentOrders: any[] = [];
    this.orders$.subscribe(orders => {
      recentOrders = orders
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    });
    return recentOrders;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'dispatched': return 'status-delivered';
      case 'in production': return 'status-pending';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }
}

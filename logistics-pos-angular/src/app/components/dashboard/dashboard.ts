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
}

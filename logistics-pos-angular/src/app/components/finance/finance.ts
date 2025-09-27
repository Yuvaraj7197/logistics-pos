import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Transaction } from '../../services/data';
import { Observable } from 'rxjs';

export interface Receivable {
  customer: string;
  amount: number;
  dueDate: string;
  status: string;
}

export interface Payable {
  supplier: string;
  amount: number;
  dueDate: string;
  status: string;
}

@Component({
  selector: 'app-finance',
  imports: [CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.scss'
})
export class FinanceComponent implements OnInit {
  transactions$: Observable<Transaction[]>;
  showAddTransactionModal: boolean = false;
  showReceivablesModal: boolean = false;
  showPayablesModal: boolean = false;

  Math = Math; // Make Math available in template

  newTransaction: Transaction = {
    id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Sale',
    amount: 0,
    currency: 'INR',
    gst: 0,
    description: '',
    status: 'Completed'
  };

  receivables: Receivable[] = [
    { customer: 'ABC Distributors', amount: 25000, dueDate: '2024-10-15', status: 'Pending' },
    { customer: 'XYZ Retail', amount: 15000, dueDate: '2024-10-20', status: 'Pending' },
    { customer: 'Direct Customer', amount: 8000, dueDate: '2024-10-25', status: 'Overdue' }
  ];

  payables: Payable[] = [
    { supplier: 'Supplier A', amount: 12000, dueDate: '2024-10-10', status: 'Pending' },
    { supplier: 'Supplier B', amount: 8500, dueDate: '2024-10-12', status: 'Pending' },
    { supplier: 'Supplier C', amount: 5500, dueDate: '2024-10-18', status: 'Pending' }
  ];

  // Filters
  typeFilter: string = '';
  statusFilter: string = '';
  currencyFilter: string = '';

  constructor(private dataService: DataService) {
    this.transactions$ = this.dataService.getTransactions();
  }

  ngOnInit(): void {
    this.generateTransactionId();
  }

  generateTransactionId(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newTransaction.id = `TXN${year}${month}${day}${random}`;
  }

  showAddTransaction(): void {
    this.showAddTransactionModal = true;
    this.generateTransactionId();
  }

  hideAddTransaction(): void {
    this.showAddTransactionModal = false;
    this.resetTransactionForm();
  }

  showReceivables(): void {
    this.showReceivablesModal = true;
  }

  hideReceivables(): void {
    this.showReceivablesModal = false;
  }

  showPayables(): void {
    this.showPayablesModal = true;
  }

  hidePayables(): void {
    this.showPayablesModal = false;
  }

  addTransaction(): void {
    if (this.isTransactionValid()) {
      this.dataService.addTransaction({...this.newTransaction});
      this.hideAddTransaction();
    }
  }

  calculateGST(): void {
    const gstRate = 0.18; // 18% GST
    this.newTransaction.gst = this.newTransaction.amount * gstRate;
  }

  getCurrencySymbol(currency: string): string {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'INR': return '₹';
      default: return '₹';
    }
  }

  getTotalReceivables(): number {
    return this.receivables.reduce((sum, r) => sum + r.amount, 0);
  }

  getTotalPayables(): number {
    return this.payables.reduce((sum, p) => sum + p.amount, 0);
  }

  getNetReceivables(): number {
    return this.getTotalReceivables() - this.getTotalPayables();
  }

  getTransactionStats(): { totalSales: number, totalPurchases: number, totalExpenses: number, netIncome: number } {
    let totalSales = 0;
    let totalPurchases = 0;
    let totalExpenses = 0;

    // This would need to be implemented with actual transaction data
    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      netIncome: totalSales - totalPurchases - totalExpenses
    };
  }

  private isTransactionValid(): boolean {
    return !!(this.newTransaction.description && this.newTransaction.amount !== 0);
  }

  private resetTransactionForm(): void {
    this.newTransaction = {
      id: '',
      date: new Date().toISOString().split('T')[0],
      type: 'Sale',
      amount: 0,
      currency: 'INR',
      gst: 0,
      description: '',
      status: 'Completed'
    };
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-delivered';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      case 'overdue': return 'status-cancelled';
      default: return 'status-pending';
    }
  }
}

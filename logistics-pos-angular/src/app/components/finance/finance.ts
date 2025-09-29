import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Transaction, Invoice, SalesReport, CreditDebitNote, TaxDetails, PaymentGateway, AccountingIntegration } from '../../services/data';
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
  invoices$: Observable<Invoice[]>;
  salesReports$: Observable<SalesReport[]>;

  showAddTransactionModal: boolean = false;
  showReceivablesModal: boolean = false;
  showPayablesModal: boolean = false;
  showInvoiceModal: boolean = false;
  showSalesReportModal: boolean = false;
  showTaxManagementModal: boolean = false;
  showPaymentGatewayModal: boolean = false;
  showAccountingIntegrationModal: boolean = false;
  showCreditDebitNoteModal: boolean = false;

  Math = Math; // Make Math available in template

  newTransaction: Transaction = {
    id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Sale',
    amount: 0,
    currency: 'INR',
    gst: 0,
    description: '',
    status: 'Completed',
    invoice: undefined,
    paymentGateway: undefined,
    taxDetails: undefined,
    accountingIntegration: undefined
  };

  newInvoice: Invoice = {
    id: '',
    invoiceNumber: '',
    orderId: '',
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: 0,
    taxAmount: 0,
    totalAmount: 0,
    status: 'Draft',
    gstCompliant: true,
    items: [],
    paymentTerms: 'Net30',
    notes: ''
  };

  newSalesReport: SalesReport = {
    id: '',
    reportType: 'Monthly',
    period: '',
    customerWise: [],
    productWise: [],
    locationWise: [],
    totalSales: 0,
    totalProfit: 0,
    generatedDate: new Date().toISOString(),
    generatedBy: ''
  };

  newCreditDebitNote: CreditDebitNote = {
    id: '',
    noteNumber: '',
    type: 'Credit',
    customerId: '',
    invoiceId: '',
    amount: 0,
    reason: '',
    issueDate: new Date().toISOString().split('T')[0],
    status: 'Draft',
    appliedToInvoice: ''
  };

  taxDetails: TaxDetails = {
    gstNumber: 'GST123456789',
    cgst: 0,
    sgst: 0,
    igst: 0,
    cess: 0,
    totalTax: 0,
    taxFilingPeriod: '2024-09',
    filingStatus: 'Pending'
  };

  paymentGateway: PaymentGateway = {
    id: '',
    gatewayName: 'Razorpay',
    transactionId: '',
    amount: 0,
    currency: 'INR',
    status: 'Pending',
    paymentMethod: 'Card',
    processedDate: '',
    fees: 0
  };

  accountingIntegration: AccountingIntegration = {
    software: 'Tally',
    syncStatus: 'Pending',
    lastSyncDate: '',
    syncErrors: []
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
    this.invoices$ = this.dataService.getInvoices();
    this.salesReports$ = this.dataService.getSalesReports();
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

  // Invoice Management Methods
  showInvoiceManagement(): void {
    this.showInvoiceModal = true;
  }

  hideInvoiceModal(): void {
    this.showInvoiceModal = false;
  }

  generateInvoice(orderId: string): void {
    this.newInvoice.orderId = orderId;
    this.newInvoice.invoiceNumber = `INV-${Date.now()}`;
    this.dataService.addInvoice({...this.newInvoice});
  }

  // Sales Report Methods
  showSalesReportGeneration(): void {
    this.showSalesReportModal = true;
  }

  hideSalesReportModal(): void {
    this.showSalesReportModal = false;
  }

  generateSalesReport(reportType: string, period: string): void {
    this.newSalesReport.reportType = reportType as 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
    this.newSalesReport.period = period;
    this.newSalesReport.generatedBy = 'Current User';
    this.dataService.addSalesReport({...this.newSalesReport});
  }

  // Tax Management Methods
  showTaxManagement(): void {
    this.showTaxManagementModal = true;
  }

  hideTaxManagementModal(): void {
    this.showTaxManagementModal = false;
  }

  calculateTax(amount: number, taxRate: number = 18): number {
    return amount * (taxRate / 100);
  }

  updateTaxDetails(): void {
    this.taxDetails.totalTax = this.taxDetails.cgst + this.taxDetails.sgst + this.taxDetails.igst + this.taxDetails.cess;
  }

  // Payment Gateway Methods
  showPaymentGatewayIntegration(): void {
    this.showPaymentGatewayModal = true;
  }

  hidePaymentGatewayModal(): void {
    this.showPaymentGatewayModal = false;
  }

  processPayment(amount: number, paymentMethod: string): void {
    this.paymentGateway.amount = amount;
    this.paymentGateway.paymentMethod = paymentMethod;
    this.paymentGateway.transactionId = `TXN-${Date.now()}`;
    this.paymentGateway.processedDate = new Date().toISOString();
    this.paymentGateway.status = 'Success';
  }

  // Accounting Integration Methods
  showAccountingIntegration(): void {
    this.showAccountingIntegrationModal = true;
  }

  hideAccountingIntegrationModal(): void {
    this.showAccountingIntegrationModal = false;
  }

  syncWithAccounting(): void {
    this.accountingIntegration.syncStatus = 'Synced';
    this.accountingIntegration.lastSyncDate = new Date().toISOString();
  }

  // Credit/Debit Note Methods
  showCreditDebitNote(): void {
    this.showCreditDebitNoteModal = true;
  }

  hideCreditDebitNoteModal(): void {
    this.showCreditDebitNoteModal = false;
  }

  createCreditDebitNote(type: 'Credit' | 'Debit', customerId: string, amount: number, reason: string): void {
    this.newCreditDebitNote.type = type;
    this.newCreditDebitNote.customerId = customerId;
    this.newCreditDebitNote.amount = amount;
    this.newCreditDebitNote.reason = reason;
    this.newCreditDebitNote.noteNumber = `${type === 'Credit' ? 'CN' : 'DN'}-${Date.now()}`;
  }

  // Multi-Currency Support
  getSupportedCurrencies(): string[] {
    return ['INR', 'USD', 'EUR', 'GBP', 'JPY'];
  }

  convertCurrency(amount: number, fromCurrency: string, toCurrency: string): number {
    // Simple conversion rates (in real app, use live rates)
    const rates: { [key: string]: number } = {
      'INR': 1,
      'USD': 83,
      'EUR': 89,
      'GBP': 102,
      'JPY': 0.55
    };

    const fromRate = rates[fromCurrency] || 1;
    const toRate = rates[toCurrency] || 1;

    return (amount * fromRate) / toRate;
  }

  // Profit & Loss Analysis
  getProfitLossAnalysis(period: string): { revenue: number, expenses: number, profit: number, margin: number } {
    let revenue = 0;
    let expenses = 0;

    this.transactions$.subscribe(transactions => {
      revenue = transactions
        .filter(t => t.type === 'Sale' && t.status === 'Completed')
        .reduce((sum, t) => sum + t.amount, 0);

      expenses = transactions
        .filter(t => (t.type === 'Purchase' || t.type === 'Expense') && t.status === 'Completed')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    });

    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    return { revenue, expenses, profit, margin };
  }

  // Export Methods
  exportFinancialReport(format: 'PDF' | 'Excel'): void {
    console.log(`Exporting financial report in ${format} format`);
  }

  exportTaxReport(): void {
    console.log('Exporting tax report');
  }

  exportInvoice(invoiceId: string): void {
    console.log(`Exporting invoice: ${invoiceId}`);
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

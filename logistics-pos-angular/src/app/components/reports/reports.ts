import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { Observable } from 'rxjs';

export interface ReportData {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  generatedDate: string;
  status: string;
  data: any[];
}

export interface AnalyticsData {
  period: string;
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  growth: number;
}

@Component({
  selector: 'app-reports',
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.html',
  styleUrl: './reports.scss'
})
export class ReportsComponent implements OnInit {
  showSalesReportModal: boolean = false;
  showInventoryReportModal: boolean = false;
  showFinancialReportModal: boolean = false;
  showPerformanceReportModal: boolean = false;
  showCustomReportModal: boolean = false;

  selectedReportType: string = '';
  selectedDateRange: string = '';
  selectedFormat: string = 'PDF';

  reports: ReportData[] = [
    { id: 'RPT001', name: 'Sales Report Q3 2024', type: 'Sales', dateRange: '2024-07-01 to 2024-09-30', generatedDate: '2024-09-30', status: 'Generated', data: [] },
    { id: 'RPT002', name: 'Inventory Analysis', type: 'Inventory', dateRange: '2024-09-01 to 2024-09-30', generatedDate: '2024-09-30', status: 'Generated', data: [] },
    { id: 'RPT003', name: 'Financial Summary', type: 'Financial', dateRange: '2024-09-01 to 2024-09-30', generatedDate: '2024-09-30', status: 'Generated', data: [] },
    { id: 'RPT004', name: 'Performance Metrics', type: 'Performance', dateRange: '2024-09-01 to 2024-09-30', generatedDate: '2024-09-30', status: 'Generated', data: [] }
  ];

  analyticsData: AnalyticsData[] = [
    { period: 'Q1 2024', revenue: 250000, orders: 150, customers: 75, products: 200, growth: 15 },
    { period: 'Q2 2024', revenue: 300000, orders: 180, customers: 90, products: 220, growth: 20 },
    { period: 'Q3 2024', revenue: 350000, orders: 210, customers: 105, products: 240, growth: 17 },
    { period: 'Q4 2024', revenue: 400000, orders: 240, customers: 120, products: 260, growth: 14 }
  ];

  // Filters
  reportTypeFilter: string = '';
  statusFilter: string = '';
  dateFilter: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {}

  showSalesReport(): void {
    this.showSalesReportModal = true;
    this.selectedReportType = 'Sales';
  }

  hideSalesReport(): void {
    this.showSalesReportModal = false;
  }

  showInventoryReport(): void {
    this.showInventoryReportModal = true;
    this.selectedReportType = 'Inventory';
  }

  hideInventoryReport(): void {
    this.showInventoryReportModal = false;
  }

  showFinancialReport(): void {
    this.showFinancialReportModal = true;
    this.selectedReportType = 'Financial';
  }

  hideFinancialReport(): void {
    this.showFinancialReportModal = false;
  }

  showPerformanceReport(): void {
    this.showPerformanceReportModal = true;
    this.selectedReportType = 'Performance';
  }

  hidePerformanceReport(): void {
    this.showPerformanceReportModal = false;
  }

  showCustomReport(): void {
    this.showCustomReportModal = true;
  }

  hideCustomReport(): void {
    this.showCustomReportModal = false;
  }

  generateReport(): void {
    const newReport: ReportData = {
      id: `RPT${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      name: `${this.selectedReportType} Report - ${new Date().toLocaleDateString()}`,
      type: this.selectedReportType,
      dateRange: this.selectedDateRange,
      generatedDate: new Date().toISOString().split('T')[0],
      status: 'Generated',
      data: []
    };

    this.reports.push(newReport);
    this.hideSalesReport();
    this.hideInventoryReport();
    this.hideFinancialReport();
    this.hidePerformanceReport();
    this.hideCustomReport();
  }

  exportReport(report: ReportData): void {
    console.log(`Exporting ${report.name} as ${this.selectedFormat}`);
  }

  getReportStats(): { totalReports: number, generatedReports: number, pendingReports: number, avgGenerationTime: number } {
    const totalReports = this.reports.length;
    const generatedReports = this.reports.filter(r => r.status === 'Generated').length;
    const pendingReports = this.reports.filter(r => r.status === 'Pending').length;
    const avgGenerationTime = 2.5; // Mock data

    return { totalReports, generatedReports, pendingReports, avgGenerationTime };
  }

  getAnalyticsStats(): { totalRevenue: number, totalOrders: number, totalCustomers: number, avgGrowth: number } {
    const totalRevenue = this.analyticsData.reduce((sum, a) => sum + a.revenue, 0);
    const totalOrders = this.analyticsData.reduce((sum, a) => sum + a.orders, 0);
    const totalCustomers = this.analyticsData.reduce((sum, a) => sum + a.customers, 0);
    const avgGrowth = this.analyticsData.length > 0 ? this.analyticsData.reduce((sum, a) => sum + a.growth, 0) / this.analyticsData.length : 0;

    return { totalRevenue, totalOrders, totalCustomers, avgGrowth };
  }

  getFilteredReports(): ReportData[] {
    let filtered = this.reports;

    if (this.reportTypeFilter) {
      filtered = filtered.filter(r => r.type === this.reportTypeFilter);
    }

    if (this.statusFilter) {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }

    return filtered;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'generated': return 'status-delivered';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'sales': return 'status-delivered';
      case 'inventory': return 'status-pending';
      case 'financial': return 'status-delivered';
      case 'performance': return 'status-pending';
      default: return 'status-pending';
    }
  }
}

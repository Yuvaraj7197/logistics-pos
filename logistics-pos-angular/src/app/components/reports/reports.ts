import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Analytics, DemandForecast, SalesReport } from '../../services/data';
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
  analytics$: Observable<Analytics[]>;
  demandForecasts$: Observable<DemandForecast[]>;
  salesReports$: Observable<SalesReport[]>;

  showSalesReportModal: boolean = false;
  showInventoryReportModal: boolean = false;
  showFinancialReportModal: boolean = false;
  showPerformanceReportModal: boolean = false;
  showCustomReportModal: boolean = false;
  showAnalyticsModal: boolean = false;
  showDemandForecastModal: boolean = false;
  showDashboardModal: boolean = false;

  selectedReportType: string = '';
  selectedDateRange: string = '';
  selectedFormat: string = 'PDF';

  // Enhanced analytics data
  dashboardMetrics = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    customerRetention: 0,
    inventoryTurnover: 0,
    profitMargin: 0,
    growthRate: 0
  };

  // Demand forecasting data
  demandForecastData = [
    { product: 'Product X', currentDemand: 100, predictedDemand: 120, confidence: 85, trend: 'Up' },
    { product: 'Product Y', currentDemand: 80, predictedDemand: 75, confidence: 78, trend: 'Down' },
    { product: 'Product Z', currentDemand: 60, predictedDemand: 70, confidence: 82, trend: 'Up' }
  ];

  // Stock vs Sales trend data
  stockSalesTrend = [
    { month: 'Jan', stock: 1000, sales: 800, ratio: 1.25 },
    { month: 'Feb', stock: 1200, sales: 900, ratio: 1.33 },
    { month: 'Mar', stock: 1100, sales: 950, ratio: 1.16 },
    { month: 'Apr', stock: 1300, sales: 1000, ratio: 1.30 },
    { month: 'May', stock: 1400, sales: 1100, ratio: 1.27 },
    { month: 'Jun', stock: 1200, sales: 1050, ratio: 1.14 }
  ];

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

  constructor(private dataService: DataService) {
    this.analytics$ = this.dataService.getAnalytics();
    this.demandForecasts$ = this.dataService.getDemandForecasts();
    this.salesReports$ = this.dataService.getSalesReports();
  }

  ngOnInit(): void {
    this.calculateDashboardMetrics();
  }

  // Dashboard Analytics Methods
  calculateDashboardMetrics(): void {
    // Calculate metrics from various data sources
    this.dataService.getOrders().subscribe(orders => {
      this.dashboardMetrics.totalOrders = orders.length;
      this.dashboardMetrics.totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
      this.dashboardMetrics.avgOrderValue = this.dashboardMetrics.totalOrders > 0 ?
        this.dashboardMetrics.totalRevenue / this.dashboardMetrics.totalOrders : 0;
    });

    this.dataService.getProducts().subscribe(products => {
      this.dashboardMetrics.totalProducts = products.length;
    });

    this.dataService.getStaff().subscribe(staff => {
      // Calculate customer retention and other metrics
      this.dashboardMetrics.customerRetention = 85; // Mock calculation
      this.dashboardMetrics.conversionRate = 12.5; // Mock calculation
      this.dashboardMetrics.inventoryTurnover = 6.2; // Mock calculation
      this.dashboardMetrics.profitMargin = 25.8; // Mock calculation
      this.dashboardMetrics.growthRate = 15.3; // Mock calculation
    });
  }

  showAnalyticsDashboard(): void {
    this.showAnalyticsModal = true;
  }

  hideAnalyticsModal(): void {
    this.showAnalyticsModal = false;
  }

  showDemandForecasting(): void {
    this.showDemandForecastModal = true;
  }

  hideDemandForecastModal(): void {
    this.showDemandForecastModal = false;
  }

  showDashboard(): void {
    this.showDashboardModal = true;
  }

  hideDashboardModal(): void {
    this.showDashboardModal = false;
  }

  // Demand Forecasting Methods
  generateDemandForecast(productSku: string, period: string): void {
    const forecast: DemandForecast = {
      id: `DF-${Date.now()}`,
      productSku: productSku,
      productName: this.getProductName(productSku),
      forecastPeriod: period,
      predictedDemand: this.calculatePredictedDemand(productSku),
      confidence: this.calculateConfidence(productSku),
      factors: this.getForecastFactors(productSku),
      lastUpdated: new Date().toISOString()
    };

    this.dataService.addDemandForecast(forecast);
  }

  private calculatePredictedDemand(productSku: string): number {
    // Mock calculation based on historical data
    const baseDemand = 100;
    const seasonalFactor = 1.2;
    const trendFactor = 1.1;
    return Math.round(baseDemand * seasonalFactor * trendFactor);
  }

  private calculateConfidence(productSku: string): number {
    // Mock confidence calculation
    return Math.round(Math.random() * 20 + 70); // 70-90% confidence
  }

  private getForecastFactors(productSku: string): any[] {
    return [
      { factor: 'Historical Sales', impact: 0.4, weight: 0.6 },
      { factor: 'Seasonal Trends', impact: 0.2, weight: 0.3 },
      { factor: 'Market Conditions', impact: 0.1, weight: 0.1 }
    ];
  }

  private getProductName(productSku: string): string {
    // Mock product name lookup
    const productMap: { [key: string]: string } = {
      'PRD-X-001': 'Product X',
      'PRD-Y-001': 'Product Y',
      'PRD-Z-001': 'Product Z'
    };
    return productMap[productSku] || 'Unknown Product';
  }

  // Stock vs Sales Analysis
  getStockSalesAnalysis(): { avgRatio: number, optimalRatio: number, recommendations: string[] } {
    const avgRatio = this.stockSalesTrend.reduce((sum, item) => sum + item.ratio, 0) / this.stockSalesTrend.length;
    const optimalRatio = 1.2; // Ideal stock to sales ratio
    const recommendations: string[] = [];

    if (avgRatio > optimalRatio * 1.2) {
      recommendations.push('Consider reducing stock levels - overstocked');
    } else if (avgRatio < optimalRatio * 0.8) {
      recommendations.push('Consider increasing stock levels - understocked');
    } else {
      recommendations.push('Stock levels are optimal');
    }

    return { avgRatio: Math.round(avgRatio * 100) / 100, optimalRatio, recommendations };
  }

  // Advanced Analytics Methods
  getTrendAnalysis(metric: string, period: string): { trend: string, change: number, direction: string } {
    // Mock trend analysis
    const mockData = {
      'revenue': { trend: 'Up', change: 15.3, direction: 'positive' },
      'orders': { trend: 'Up', change: 12.7, direction: 'positive' },
      'customers': { trend: 'Up', change: 8.9, direction: 'positive' },
      'inventory': { trend: 'Down', change: -5.2, direction: 'negative' }
    };

    return mockData[metric as keyof typeof mockData] || { trend: 'Stable', change: 0, direction: 'neutral' };
  }

  getPerformanceInsights(): string[] {
    return [
      'Revenue increased by 15.3% compared to last month',
      'Customer acquisition rate improved by 8.9%',
      'Inventory turnover rate is optimal at 6.2',
      'Profit margins are healthy at 25.8%',
      'Order fulfillment time decreased by 12%'
    ];
  }

  getRecommendations(): string[] {
    return [
      'Focus on high-value customers to increase average order value',
      'Optimize inventory for top-selling products',
      'Consider expanding product line based on demand forecast',
      'Implement automated reorder alerts for low-stock items',
      'Enhance customer retention programs'
    ];
  }

  // Export Methods
  exportAnalyticsReport(): void {
    const csvContent = "Metric,Value,Change,Trend\n" +
      `Total Revenue,${this.dashboardMetrics.totalRevenue},${this.getTrendAnalysis('revenue', 'month').change}%,${this.getTrendAnalysis('revenue', 'month').trend}\n` +
      `Total Orders,${this.dashboardMetrics.totalOrders},${this.getTrendAnalysis('orders', 'month').change}%,${this.getTrendAnalysis('orders', 'month').trend}\n` +
      `Total Customers,${this.dashboardMetrics.totalCustomers},${this.getTrendAnalysis('customers', 'month').change}%,${this.getTrendAnalysis('customers', 'month').trend}\n` +
      `Average Order Value,${this.dashboardMetrics.avgOrderValue},0%,Stable\n`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'analytics_report.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportDemandForecast(): void {
    const csvContent = "Product,Current Demand,Predicted Demand,Confidence,Trend\n" +
      this.demandForecastData.map(item =>
        `${item.product},${item.currentDemand},${item.predictedDemand},${item.confidence}%,${item.trend}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'demand_forecast.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportStockSalesTrend(): void {
    const csvContent = "Month,Stock,Sales,Ratio\n" +
      this.stockSalesTrend.map(item =>
        `${item.month},${item.stock},${item.sales},${item.ratio}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'stock_sales_trend.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

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

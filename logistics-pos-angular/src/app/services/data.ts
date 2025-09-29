import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Product {
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  location: string;
  reorderQty: number;
  supplier: string;
  barcode: string;
  description: string;
  warehouses: WarehouseStock[];
  batchTracking: boolean;
  expiryTracking: boolean;
  lastStockUpdate: string;
  stockAdjustments: StockAdjustment[];
  reorderAlerts: ReorderAlert[];
}

export interface WarehouseStock {
  warehouseId: string;
  warehouseName: string;
  stock: number;
  reservedStock: number;
  availableStock: number;
  lastUpdated: string;
}

export interface StockAdjustment {
  id: string;
  productSku: string;
  adjustmentType: 'Damaged' | 'Expired' | 'Lost' | 'Found' | 'Transfer' | 'Count';
  quantity: number;
  reason: string;
  adjustedBy: string;
  adjustmentDate: string;
  reference: string;
}

export interface ReorderAlert {
  id: string;
  productSku: string;
  currentStock: number;
  minStock: number;
  reorderQty: number;
  alertDate: string;
  status: 'Active' | 'Processed' | 'Cancelled';
  processedBy: string;
  processedDate: string;
}

export interface Order {
  id: string;
  type: 'Customer' | 'Distributor' | 'Internal' | 'Production';
  customer: string;
  date: string;
  status: 'Pending' | 'Approved' | 'InProduction' | 'Dispatched' | 'Delivered' | 'Cancelled' | 'Returned';
  priority: 'Low' | 'Normal' | 'High' | 'Urgent';
  total: number;
  amount: number;
  deliveryDate: string;
  paymentTerms: string;
  items: OrderItem[];
  instructions?: string;
  approvalWorkflow?: ApprovalWorkflow;
  returnRefund?: ReturnRefund;
  deliveryTracking?: DeliveryTracking;
  sourceWarehouse?: string;
  destinationWarehouse?: string;
  productionOrderId?: string;
  distributorId?: string;
  internalDepartment?: string;
}

export interface ApprovalWorkflow {
  id: string;
  orderId: string;
  approverId: string;
  approverName: string;
  approvalLevel: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  comments: string;
  approvalDate: string;
  requiredApprovals: number;
  completedApprovals: number;
}

export interface ReturnRefund {
  id: string;
  orderId: string;
  returnDate: string;
  reason: string;
  items: ReturnItem[];
  refundAmount: number;
  refundMethod: 'Cash' | 'Credit' | 'Bank Transfer';
  status: 'Pending' | 'Processed' | 'Rejected';
  processedBy: string;
  processedDate: string;
}

export interface ReturnItem {
  product: string;
  quantity: number;
  reason: string;
  condition: 'Good' | 'Damaged' | 'Defective';
  refundAmount: number;
}

export interface DeliveryTracking {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  actualDelivery: string;
  deliveryProof: string;
  deliveryNotes: string;
  status: 'Scheduled' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Failed';
}

export interface OrderItem {
  product: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  department: string;
  status: string;
  email: string;
  phone: string;
  shift: string;
  salary: number;
  biometricId: string;
  joiningDate: string;
  checkinTime: string | null;
  checkoutTime: string | null;
  productivityScore: number;
  attendanceRate: number;
  permissions: Permission[];
  shiftSchedule: ShiftSchedule[];
  attendanceRecords: AttendanceRecord[];
  performanceMetrics: PerformanceMetric[];
  payrollRecords: PayrollRecord[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  action: string;
  granted: boolean;
}

export interface ShiftSchedule {
  id: string;
  staffId: string;
  shiftType: 'Morning' | 'Afternoon' | 'Night' | 'Flexible';
  startTime: string;
  endTime: string;
  workDays: string[];
  effectiveDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
}

export interface AttendanceRecord {
  id: string;
  staffId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  checkInMethod: 'Biometric' | 'RFID' | 'Mobile' | 'Manual';
  checkOutMethod: 'Biometric' | 'RFID' | 'Mobile' | 'Manual';
  hoursWorked: number;
  overtime: number;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  notes: string;
}

export interface PerformanceMetric {
  id: string;
  staffId: string;
  period: string;
  ordersHandled: number;
  tasksCompleted: number;
  efficiency: number;
  qualityScore: number;
  customerRating: number;
  kpiScore: number;
  lastUpdated: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  payPeriod: string;
  basicSalary: number;
  overtimePay: number;
  bonuses: number;
  deductions: number;
  netSalary: number;
  status: 'Pending' | 'Processed' | 'Paid';
  processedDate: string;
  paymentMethod: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: string;
  amount: number;
  currency: string;
  gst: number;
  description: string;
  status: string;
  invoice?: Invoice;
  paymentGateway?: PaymentGateway;
  taxDetails?: TaxDetails;
  accountingIntegration?: AccountingIntegration;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled';
  gstCompliant: boolean;
  items: InvoiceItem[];
  paymentTerms: string;
  notes: string;
}

export interface InvoiceItem {
  product: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxRate: number;
  taxAmount: number;
}

export interface PaymentGateway {
  id: string;
  gatewayName: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Success' | 'Failed' | 'Refunded';
  paymentMethod: string;
  processedDate: string;
  fees: number;
}

export interface TaxDetails {
  gstNumber: string;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
  taxFilingPeriod: string;
  filingStatus: 'Pending' | 'Filed' | 'Late';
}

export interface AccountingIntegration {
  software: 'Tally' | 'Zoho Books' | 'QuickBooks' | 'SAP';
  syncStatus: 'Pending' | 'Synced' | 'Failed';
  lastSyncDate: string;
  syncErrors: string[];
}

export interface SalesReport {
  id: string;
  reportType: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  period: string;
  customerWise: CustomerSales[];
  productWise: ProductSales[];
  locationWise: LocationSales[];
  totalSales: number;
  totalProfit: number;
  generatedDate: string;
  generatedBy: string;
}

export interface CustomerSales {
  customerId: string;
  customerName: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface ProductSales {
  productSku: string;
  productName: string;
  totalSales: number;
  totalQuantity: number;
  profitMargin: number;
}

export interface LocationSales {
  locationId: string;
  locationName: string;
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
}

export interface CreditDebitNote {
  id: string;
  noteNumber: string;
  type: 'Credit' | 'Debit';
  customerId: string;
  invoiceId: string;
  amount: number;
  reason: string;
  issueDate: string;
  status: 'Draft' | 'Issued' | 'Applied';
  appliedToInvoice: string;
}

export interface Batch {
  batchNumber: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
  location: string;
}

export interface BOM {
  id: string;
  productSku: string;
  productName: string;
  version: string;
  components: BOMComponent[];
  totalCost: number;
  laborCost: number;
  overheadCost: number;
  createdDate: string;
  lastUpdated: string;
  status: 'Draft' | 'Active' | 'Obsolete';
}

export interface BOMComponent {
  componentSku: string;
  componentName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  supplier: string;
  leadTime: number;
}

export interface WorkOrder {
  id: string;
  bomId: string;
  productSku: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
  assignedTo: string;
  productionLine: string;
  materialsAllocated: MaterialAllocation[];
  qualityChecks: QualityCheck[];
  progress: number;
}

export interface MaterialAllocation {
  materialSku: string;
  materialName: string;
  allocatedQuantity: number;
  usedQuantity: number;
  remainingQuantity: number;
  location: string;
}

export interface QualityCheck {
  id: string;
  workOrderId: string;
  checkType: string;
  result: 'Pass' | 'Fail' | 'Pending';
  inspector: string;
  checkDate: string;
  notes: string;
}

export interface Analytics {
  id: string;
  type: 'Sales' | 'Inventory' | 'Production' | 'Staff' | 'Financial';
  period: string;
  metrics: AnalyticsMetric[];
  insights: string[];
  recommendations: string[];
  generatedDate: string;
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  unit: string;
  trend: 'Up' | 'Down' | 'Stable';
  changePercent: number;
}

export interface DemandForecast {
  id: string;
  productSku: string;
  productName: string;
  forecastPeriod: string;
  predictedDemand: number;
  confidence: number;
  factors: ForecastFactor[];
  lastUpdated: string;
}

export interface ForecastFactor {
  factor: string;
  impact: number;
  weight: number;
}

export interface SecurityAudit {
  id: string;
  userId: string;
  action: string;
  module: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  status: 'Success' | 'Failed' | 'Blocked';
  details: string;
}

export interface BackupRecord {
  id: string;
  backupType: 'Full' | 'Incremental' | 'Differential';
  backupDate: string;
  size: number;
  location: string;
  status: 'Success' | 'Failed' | 'In Progress';
  retentionPeriod: number;
  lastRestore: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private productsSubject = new BehaviorSubject<Product[]>(this.getInitialProducts());
  public products$ = this.productsSubject.asObservable();

  private ordersSubject = new BehaviorSubject<Order[]>(this.getInitialOrders());
  public orders$ = this.ordersSubject.asObservable();

  private staffSubject = new BehaviorSubject<Staff[]>(this.getInitialStaff());
  public staff$ = this.staffSubject.asObservable();

  private transactionsSubject = new BehaviorSubject<Transaction[]>(this.getInitialTransactions());
  public transactions$ = this.transactionsSubject.asObservable();

  private batchDataSubject = new BehaviorSubject<{[key: string]: Batch[]}>(this.getInitialBatchData());
  public batchData$ = this.batchDataSubject.asObservable();

  private invoicesSubject = new BehaviorSubject<Invoice[]>(this.getInitialInvoices());
  public invoices$ = this.invoicesSubject.asObservable();

  private salesReportsSubject = new BehaviorSubject<SalesReport[]>(this.getInitialSalesReports());
  public salesReports$ = this.salesReportsSubject.asObservable();

  private bomsSubject = new BehaviorSubject<BOM[]>(this.getInitialBOMs());
  public boms$ = this.bomsSubject.asObservable();

  private workOrdersSubject = new BehaviorSubject<WorkOrder[]>(this.getInitialWorkOrders());
  public workOrders$ = this.workOrdersSubject.asObservable();

  private analyticsSubject = new BehaviorSubject<Analytics[]>(this.getInitialAnalytics());
  public analytics$ = this.analyticsSubject.asObservable();

  private demandForecastsSubject = new BehaviorSubject<DemandForecast[]>(this.getInitialDemandForecasts());
  public demandForecasts$ = this.demandForecastsSubject.asObservable();

  private securityAuditsSubject = new BehaviorSubject<SecurityAudit[]>(this.getInitialSecurityAudits());
  public securityAudits$ = this.securityAuditsSubject.asObservable();

  private backupRecordsSubject = new BehaviorSubject<BackupRecord[]>(this.getInitialBackupRecords());
  public backupRecords$ = this.backupRecordsSubject.asObservable();

  constructor() {}

  // Products
  getProducts(): Observable<Product[]> {
    return this.products$;
  }

  addProduct(product: Product): void {
    const currentProducts = this.productsSubject.value;
    this.productsSubject.next([...currentProducts, product]);
  }

  updateProduct(product: Product): void {
    const currentProducts = this.productsSubject.value;
    const index = currentProducts.findIndex(p => p.sku === product.sku);
    if (index !== -1) {
      currentProducts[index] = product;
      this.productsSubject.next([...currentProducts]);
    }
  }

  deleteProduct(sku: string): void {
    const currentProducts = this.productsSubject.value;
    this.productsSubject.next(currentProducts.filter(p => p.sku !== sku));
  }

  // Orders
  getOrders(): Observable<Order[]> {
    return this.orders$;
  }

  addOrder(order: Order): void {
    const currentOrders = this.ordersSubject.value;
    this.ordersSubject.next([...currentOrders, order]);
  }

  updateOrder(order: Order): void {
    const currentOrders = this.ordersSubject.value;
    const index = currentOrders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      currentOrders[index] = order;
      this.ordersSubject.next([...currentOrders]);
    }
  }

  // Staff
  getStaff(): Observable<Staff[]> {
    return this.staff$;
  }

  addStaff(staff: Staff): void {
    const currentStaff = this.staffSubject.value;
    this.staffSubject.next([...currentStaff, staff]);
  }

  updateStaff(staff: Staff): void {
    const currentStaff = this.staffSubject.value;
    const index = currentStaff.findIndex(s => s.id === staff.id);
    if (index !== -1) {
      currentStaff[index] = staff;
      this.staffSubject.next([...currentStaff]);
    }
  }

  // Transactions
  getTransactions(): Observable<Transaction[]> {
    return this.transactions$;
  }

  addTransaction(transaction: Transaction): void {
    const currentTransactions = this.transactionsSubject.value;
    this.transactionsSubject.next([...currentTransactions, transaction]);
  }

  // Batch Data
  getBatchData(): Observable<{[key: string]: Batch[]}> {
    return this.batchData$;
  }

  updateBatchData(productName: string, batches: Batch[]): void {
    const currentBatchData = this.batchDataSubject.value;
    currentBatchData[productName] = batches;
    this.batchDataSubject.next({...currentBatchData});
  }

  // Invoices
  getInvoices(): Observable<Invoice[]> {
    return this.invoices$;
  }

  addInvoice(invoice: Invoice): void {
    const currentInvoices = this.invoicesSubject.value;
    this.invoicesSubject.next([...currentInvoices, invoice]);
  }

  updateInvoice(invoice: Invoice): void {
    const currentInvoices = this.invoicesSubject.value;
    const index = currentInvoices.findIndex(i => i.id === invoice.id);
    if (index !== -1) {
      currentInvoices[index] = invoice;
      this.invoicesSubject.next([...currentInvoices]);
    }
  }

  // Sales Reports
  getSalesReports(): Observable<SalesReport[]> {
    return this.salesReports$;
  }

  addSalesReport(report: SalesReport): void {
    const currentReports = this.salesReportsSubject.value;
    this.salesReportsSubject.next([...currentReports, report]);
  }

  // BOMs
  getBOMs(): Observable<BOM[]> {
    return this.boms$;
  }

  addBOM(bom: BOM): void {
    const currentBOMs = this.bomsSubject.value;
    this.bomsSubject.next([...currentBOMs, bom]);
  }

  updateBOM(bom: BOM): void {
    const currentBOMs = this.bomsSubject.value;
    const index = currentBOMs.findIndex(b => b.id === bom.id);
    if (index !== -1) {
      currentBOMs[index] = bom;
      this.bomsSubject.next([...currentBOMs]);
    }
  }

  // Work Orders
  getWorkOrders(): Observable<WorkOrder[]> {
    return this.workOrders$;
  }

  addWorkOrder(workOrder: WorkOrder): void {
    const currentWorkOrders = this.workOrdersSubject.value;
    this.workOrdersSubject.next([...currentWorkOrders, workOrder]);
  }

  updateWorkOrder(workOrder: WorkOrder): void {
    const currentWorkOrders = this.workOrdersSubject.value;
    const index = currentWorkOrders.findIndex(w => w.id === workOrder.id);
    if (index !== -1) {
      currentWorkOrders[index] = workOrder;
      this.workOrdersSubject.next([...currentWorkOrders]);
    }
  }

  // Analytics
  getAnalytics(): Observable<Analytics[]> {
    return this.analytics$;
  }

  addAnalytics(analytics: Analytics): void {
    const currentAnalytics = this.analyticsSubject.value;
    this.analyticsSubject.next([...currentAnalytics, analytics]);
  }

  // Demand Forecasts
  getDemandForecasts(): Observable<DemandForecast[]> {
    return this.demandForecasts$;
  }

  addDemandForecast(forecast: DemandForecast): void {
    const currentForecasts = this.demandForecastsSubject.value;
    this.demandForecastsSubject.next([...currentForecasts, forecast]);
  }

  updateDemandForecast(forecast: DemandForecast): void {
    const currentForecasts = this.demandForecastsSubject.value;
    const index = currentForecasts.findIndex(f => f.id === forecast.id);
    if (index !== -1) {
      currentForecasts[index] = forecast;
      this.demandForecastsSubject.next([...currentForecasts]);
    }
  }

  // Security Audits
  getSecurityAudits(): Observable<SecurityAudit[]> {
    return this.securityAudits$;
  }

  addSecurityAudit(audit: SecurityAudit): void {
    const currentAudits = this.securityAuditsSubject.value;
    this.securityAuditsSubject.next([...currentAudits, audit]);
  }

  // Backup Records
  getBackupRecords(): Observable<BackupRecord[]> {
    return this.backupRecords$;
  }

  addBackupRecord(backup: BackupRecord): void {
    const currentBackups = this.backupRecordsSubject.value;
    this.backupRecordsSubject.next([...currentBackups, backup]);
  }

  private getInitialProducts(): Product[] {
    return [
      {
        name: 'Raw Material A',
        sku: 'RM-A-001',
        category: 'Raw Materials',
        stock: 500,
        minStock: 100,
        price: 25.50,
        location: 'Warehouse 1',
        reorderQty: 200,
        supplier: 'Supplier A',
        barcode: '1234567890123',
        description: 'High quality raw material for production',
        warehouses: [
          { warehouseId: 'WH001', warehouseName: 'Warehouse 1', stock: 500, reservedStock: 50, availableStock: 450, lastUpdated: '2024-09-25' },
          { warehouseId: 'WH002', warehouseName: 'Warehouse 2', stock: 200, reservedStock: 20, availableStock: 180, lastUpdated: '2024-09-25' }
        ],
        batchTracking: true,
        expiryTracking: true,
        lastStockUpdate: '2024-09-25',
        stockAdjustments: [],
        reorderAlerts: []
      },
      {
        name: 'Product X',
        sku: 'PRD-X-001',
        category: 'Finished Goods',
        stock: 75,
        minStock: 50,
        price: 155.00,
        location: 'Warehouse 2',
        reorderQty: 150,
        supplier: 'Supplier B',
        barcode: '2345678901234',
        description: 'Premium finished product',
        warehouses: [
          { warehouseId: 'WH002', warehouseName: 'Warehouse 2', stock: 75, reservedStock: 10, availableStock: 65, lastUpdated: '2024-09-25' }
        ],
        batchTracking: true,
        expiryTracking: true,
        lastStockUpdate: '2024-09-25',
        stockAdjustments: [],
        reorderAlerts: []
      },
      {
        name: 'Packaging Box',
        sku: 'PKG-B-001',
        category: 'Packaging',
        stock: 200,
        minStock: 50,
        price: 5.25,
        location: 'Warehouse 1',
        reorderQty: 100,
        supplier: 'Supplier C',
        barcode: '3456789012345',
        description: 'Standard packaging material',
        warehouses: [
          { warehouseId: 'WH001', warehouseName: 'Warehouse 1', stock: 200, reservedStock: 30, availableStock: 170, lastUpdated: '2024-09-25' }
        ],
        batchTracking: false,
        expiryTracking: false,
        lastStockUpdate: '2024-09-25',
        stockAdjustments: [],
        reorderAlerts: []
      },
      {
        name: 'Raw Material B',
        sku: 'RM-B-001',
        category: 'Raw Materials',
        stock: 25,
        minStock: 50,
        price: 45.75,
        location: 'Warehouse 3',
        reorderQty: 100,
        supplier: 'Supplier A',
        barcode: '4567890123456',
        description: 'Secondary raw material',
        warehouses: [
          { warehouseId: 'WH003', warehouseName: 'Warehouse 3', stock: 25, reservedStock: 5, availableStock: 20, lastUpdated: '2024-09-25' }
        ],
        batchTracking: true,
        expiryTracking: true,
        lastStockUpdate: '2024-09-25',
        stockAdjustments: [],
        reorderAlerts: [
          { id: 'ALERT001', productSku: 'RM-B-001', currentStock: 25, minStock: 50, reorderQty: 100, alertDate: '2024-09-20', status: 'Active', processedBy: '', processedDate: '' }
        ]
      },
      {
        name: 'Product Y',
        sku: 'PRD-Y-001',
        category: 'Finished Goods',
        stock: 150,
        minStock: 80,
        price: 225.00,
        location: 'Warehouse 2',
        reorderQty: 120,
        supplier: 'Supplier B',
        barcode: '5678901234567',
        description: 'Deluxe finished product',
        warehouses: [
          { warehouseId: 'WH002', warehouseName: 'Warehouse 2', stock: 150, reservedStock: 20, availableStock: 130, lastUpdated: '2024-09-25' }
        ],
        batchTracking: true,
        expiryTracking: true,
        lastStockUpdate: '2024-09-25',
        stockAdjustments: [],
        reorderAlerts: []
      }
    ];
  }

  private getInitialOrders(): Order[] {
    return [
      {
        id: 'ORD-2024-001',
        type: 'Customer',
        customer: 'ABC Distributors',
        date: '2024-09-25',
        status: 'Delivered',
        priority: 'High',
        total: 25400,
        amount: 25400,
        deliveryDate: '2024-09-30',
        paymentTerms: 'Net30',
        items: [
          { product: 'Product X', quantity: 100, price: 155.00, total: 15500 },
          { product: 'Product Y', quantity: 50, price: 225.00, total: 11250 }
        ],
        instructions: 'Priority order for customer'
      },
      {
        id: 'ORD-2024-002',
        type: 'Distributor',
        customer: 'XYZ Retail',
        date: '2024-09-25',
        status: 'Dispatched',
        priority: 'Normal',
        total: 18750,
        amount: 18750,
        deliveryDate: '2024-10-01',
        paymentTerms: 'Net15',
        items: [
          { product: 'Product Z', quantity: 75, price: 180.00, total: 13500 },
          { product: 'Product A', quantity: 25, price: 210.00, total: 5250 }
        ],
        instructions: 'Standard distributor order'
      },
      {
        id: 'ORD-2024-003',
        type: 'Customer',
        customer: 'Direct Customer',
        date: '2024-09-24',
        status: 'InProduction',
        priority: 'Urgent',
        total: 12300,
        amount: 12300,
        deliveryDate: '2024-09-28',
        paymentTerms: 'COD',
        items: [
          { product: 'Product B', quantity: 60, price: 205.00, total: 12300 }
        ],
        instructions: 'Urgent customer request'
      },
      {
        id: 'ORD-2024-004',
        type: 'Internal',
        customer: 'Internal',
        date: '2024-09-23',
        status: 'Pending',
        priority: 'Normal',
        total: 8500,
        amount: 8500,
        deliveryDate: '2024-09-29',
        paymentTerms: 'Advance',
        items: [
          { product: 'Raw Material B', quantity: 200, price: 42.50, total: 8500 }
        ],
        instructions: 'Internal production order'
      }
    ];
  }

  private getInitialStaff(): Staff[] {
    return [
      {
        id: 'EMP001',
        name: 'John Smith',
        role: 'Manager',
        department: 'Production',
        status: 'Present',
        email: 'john.smith@company.com',
        phone: '+91-9876543210',
        shift: 'Morning (6AM-2PM)',
        salary: 75000,
        biometricId: 'BIO001',
        joiningDate: '2023-01-15',
        checkinTime: '06:15',
        checkoutTime: null,
        productivityScore: 95,
        attendanceRate: 98,
        permissions: [
          { id: 'PERM001', name: 'Order Management', description: 'Manage orders', module: 'Orders', action: 'CRUD', granted: true },
          { id: 'PERM002', name: 'Staff Management', description: 'Manage staff', module: 'Staff', action: 'CRUD', granted: true },
          { id: 'PERM003', name: 'Reports Access', description: 'View reports', module: 'Reports', action: 'Read', granted: true }
        ],
        shiftSchedule: [
          { id: 'SHIFT001', staffId: 'EMP001', shiftType: 'Morning', startTime: '06:00', endTime: '14:00', workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], effectiveDate: '2023-01-15', endDate: '', status: 'Active' }
        ],
        attendanceRecords: [
          { id: 'ATT001', staffId: 'EMP001', date: '2024-09-25', checkInTime: '06:15', checkOutTime: '14:30', checkInMethod: 'Biometric', checkOutMethod: 'Biometric', hoursWorked: 8.25, overtime: 0.25, status: 'Present', notes: 'On time' }
        ],
        performanceMetrics: [
          { id: 'PERF001', staffId: 'EMP001', period: 'September 2024', ordersHandled: 45, tasksCompleted: 38, efficiency: 95, qualityScore: 92, customerRating: 4.5, kpiScore: 88, lastUpdated: '2024-09-25' }
        ],
        payrollRecords: [
          { id: 'PAY001', staffId: 'EMP001', payPeriod: 'September 2024', basicSalary: 75000, overtimePay: 5000, bonuses: 2000, deductions: 3000, netSalary: 79000, status: 'Paid', processedDate: '2024-09-30', paymentMethod: 'Bank Transfer' }
        ]
      },
      {
        id: 'EMP002',
        name: 'Sarah Johnson',
        role: 'Supervisor',
        department: 'Logistics',
        status: 'Present',
        email: 'sarah.johnson@company.com',
        phone: '+91-9876543211',
        shift: 'Afternoon (2PM-10PM)',
        salary: 55000,
        biometricId: 'BIO002',
        joiningDate: '2023-03-20',
        checkinTime: '14:00',
        checkoutTime: null,
        productivityScore: 92,
        attendanceRate: 96,
        permissions: [
          { id: 'PERM004', name: 'Logistics Management', description: 'Manage logistics', module: 'Logistics', action: 'CRUD', granted: true },
          { id: 'PERM005', name: 'Inventory Access', description: 'View inventory', module: 'Inventory', action: 'Read', granted: true }
        ],
        shiftSchedule: [
          { id: 'SHIFT002', staffId: 'EMP002', shiftType: 'Afternoon', startTime: '14:00', endTime: '22:00', workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], effectiveDate: '2023-03-20', endDate: '', status: 'Active' }
        ],
        attendanceRecords: [
          { id: 'ATT002', staffId: 'EMP002', date: '2024-09-25', checkInTime: '14:00', checkOutTime: '22:00', checkInMethod: 'RFID', checkOutMethod: 'RFID', hoursWorked: 8, overtime: 0, status: 'Present', notes: 'Afternoon shift' }
        ],
        performanceMetrics: [
          { id: 'PERF002', staffId: 'EMP002', period: 'September 2024', ordersHandled: 32, tasksCompleted: 30, efficiency: 88, qualityScore: 89, customerRating: 4.2, kpiScore: 85, lastUpdated: '2024-09-25' }
        ],
        payrollRecords: [
          { id: 'PAY002', staffId: 'EMP002', payPeriod: 'September 2024', basicSalary: 55000, overtimePay: 3000, bonuses: 1500, deductions: 2500, netSalary: 57000, status: 'Paid', processedDate: '2024-09-30', paymentMethod: 'Bank Transfer' }
        ]
      },
      {
        id: 'EMP003',
        name: 'Mike Wilson',
        role: 'Operator',
        department: 'Production',
        status: 'On Leave',
        email: 'mike.wilson@company.com',
        phone: '+91-9876543212',
        shift: 'Night (10PM-6AM)',
        salary: 45000,
        biometricId: 'BIO003',
        joiningDate: '2023-06-10',
        checkinTime: null,
        checkoutTime: null,
        productivityScore: 88,
        attendanceRate: 92,
        permissions: [
          { id: 'PERM006', name: 'Production Access', description: 'Access production', module: 'Production', action: 'Read', granted: true }
        ],
        shiftSchedule: [
          { id: 'SHIFT003', staffId: 'EMP003', shiftType: 'Night', startTime: '22:00', endTime: '06:00', workDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], effectiveDate: '2023-06-10', endDate: '', status: 'Active' }
        ],
        attendanceRecords: [
          { id: 'ATT003', staffId: 'EMP003', date: '2024-09-25', checkInTime: '', checkOutTime: '', checkInMethod: 'Manual', checkOutMethod: 'Manual', hoursWorked: 0, overtime: 0, status: 'On Leave', notes: 'Sick leave' }
        ],
        performanceMetrics: [
          { id: 'PERF003', staffId: 'EMP003', period: 'September 2024', ordersHandled: 28, tasksCompleted: 25, efficiency: 85, qualityScore: 87, customerRating: 4.0, kpiScore: 82, lastUpdated: '2024-09-25' }
        ],
        payrollRecords: [
          { id: 'PAY003', staffId: 'EMP003', payPeriod: 'September 2024', basicSalary: 45000, overtimePay: 2000, bonuses: 1000, deductions: 2000, netSalary: 46000, status: 'Paid', processedDate: '2024-09-30', paymentMethod: 'Bank Transfer' }
        ]
      }
    ];
  }

  private getInitialTransactions(): Transaction[] {
    return [
      {
        id: 'TXN001',
        date: '2024-09-25',
        type: 'Sale',
        amount: 25400,
        currency: 'INR',
        gst: 4572,
        description: 'Product X sale to ABC Distributors',
        status: 'Completed'
      },
      {
        id: 'TXN002',
        date: '2024-09-25',
        type: 'Purchase',
        amount: -12500,
        currency: 'INR',
        gst: 2250,
        description: 'Raw material purchase from Supplier A',
        status: 'Completed'
      },
      {
        id: 'TXN003',
        date: '2024-09-24',
        type: 'Sale',
        amount: 18750,
        currency: 'USD',
        gst: 3375,
        description: 'Product Y export sale',
        status: 'Pending'
      }
    ];
  }

  private getInitialBatchData(): {[key: string]: Batch[]} {
    return {
      'Product X': [
        { batchNumber: 'BATCH-X-001', quantity: 50, manufacturingDate: '2024-08-15', expiryDate: '2025-08-15', status: 'Active', location: 'Warehouse 2' },
        { batchNumber: 'BATCH-X-002', quantity: 25, manufacturingDate: '2024-09-01', expiryDate: '2025-09-01', status: 'Active', location: 'Warehouse 2' }
      ],
      'Product Y': [
        { batchNumber: 'BATCH-Y-001', quantity: 100, manufacturingDate: '2024-08-20', expiryDate: '2025-08-20', status: 'Active', location: 'Warehouse 2' },
        { batchNumber: 'BATCH-Y-002', quantity: 50, manufacturingDate: '2024-09-05', expiryDate: '2025-09-05', status: 'Active', location: 'Warehouse 2' }
      ],
      'Raw Material A': [
        { batchNumber: 'BATCH-RM-A-001', quantity: 300, manufacturingDate: '2024-08-10', expiryDate: '2025-08-10', status: 'Active', location: 'Warehouse 1' },
        { batchNumber: 'BATCH-RM-A-002', quantity: 200, manufacturingDate: '2024-09-01', expiryDate: '2025-09-01', status: 'Active', location: 'Warehouse 1' }
      ]
    };
  }

  private getInitialInvoices(): Invoice[] {
    return [
      {
        id: 'INV001',
        invoiceNumber: 'INV-2024-001',
        orderId: 'ORD-2024-001',
        customerId: 'CUST001',
        issueDate: '2024-09-25',
        dueDate: '2024-10-25',
        amount: 25400,
        taxAmount: 4572,
        totalAmount: 29972,
        status: 'Sent',
        gstCompliant: true,
        items: [
          { product: 'Product X', quantity: 100, unitPrice: 155.00, totalPrice: 15500, taxRate: 18, taxAmount: 2790 },
          { product: 'Product Y', quantity: 50, unitPrice: 225.00, totalPrice: 11250, taxRate: 18, taxAmount: 2025 }
        ],
        paymentTerms: 'Net30',
        notes: 'Priority customer order'
      }
    ];
  }

  private getInitialSalesReports(): SalesReport[] {
    return [
      {
        id: 'SR001',
        reportType: 'Monthly',
        period: 'September 2024',
        customerWise: [
          { customerId: 'CUST001', customerName: 'ABC Distributors', totalSales: 45000, totalOrders: 5, averageOrderValue: 9000 },
          { customerId: 'CUST002', customerName: 'XYZ Retail', totalSales: 25000, totalOrders: 3, averageOrderValue: 8333 }
        ],
        productWise: [
          { productSku: 'PRD-X-001', productName: 'Product X', totalSales: 30000, totalQuantity: 200, profitMargin: 25 },
          { productSku: 'PRD-Y-001', productName: 'Product Y', totalSales: 40000, totalQuantity: 150, profitMargin: 30 }
        ],
        locationWise: [
          { locationId: 'LOC001', locationName: 'Mumbai', totalSales: 35000, totalOrders: 4, averageOrderValue: 8750 },
          { locationId: 'LOC002', locationName: 'Delhi', totalSales: 35000, totalOrders: 4, averageOrderValue: 8750 }
        ],
        totalSales: 70000,
        totalProfit: 17500,
        generatedDate: '2024-09-30',
        generatedBy: 'System'
      }
    ];
  }

  private getInitialBOMs(): BOM[] {
    return [
      {
        id: 'BOM001',
        productSku: 'PRD-X-001',
        productName: 'Product X',
        version: '1.0',
        components: [
          { componentSku: 'RM-A-001', componentName: 'Raw Material A', quantity: 2, unit: 'kg', unitCost: 25.50, totalCost: 51.00, supplier: 'Supplier A', leadTime: 7 },
          { componentSku: 'PKG-B-001', componentName: 'Packaging Box', quantity: 1, unit: 'pcs', unitCost: 5.25, totalCost: 5.25, supplier: 'Supplier C', leadTime: 3 }
        ],
        totalCost: 56.25,
        laborCost: 20.00,
        overheadCost: 10.00,
        createdDate: '2024-01-01',
        lastUpdated: '2024-09-01',
        status: 'Active'
      }
    ];
  }

  private getInitialWorkOrders(): WorkOrder[] {
    return [
      {
        id: 'WO001',
        bomId: 'BOM001',
        productSku: 'PRD-X-001',
        quantity: 100,
        startDate: '2024-09-25',
        endDate: '2024-09-30',
        status: 'In Progress',
        assignedTo: 'John Smith',
        productionLine: 'Line A',
        materialsAllocated: [
          { materialSku: 'RM-A-001', materialName: 'Raw Material A', allocatedQuantity: 200, usedQuantity: 150, remainingQuantity: 50, location: 'Warehouse 1' }
        ],
        qualityChecks: [
          { id: 'QC001', workOrderId: 'WO001', checkType: 'Dimensional Check', result: 'Pass', inspector: 'Quality Inspector 1', checkDate: '2024-09-26', notes: 'All dimensions within tolerance' }
        ],
        progress: 75
      }
    ];
  }

  private getInitialAnalytics(): Analytics[] {
    return [
      {
        id: 'ANAL001',
        type: 'Sales',
        period: 'September 2024',
        metrics: [
          { name: 'Total Sales', value: 70000, unit: 'INR', trend: 'Up', changePercent: 15 },
          { name: 'Orders Count', value: 8, unit: 'count', trend: 'Up', changePercent: 20 },
          { name: 'Average Order Value', value: 8750, unit: 'INR', trend: 'Stable', changePercent: 2 }
        ],
        insights: ['Sales increased by 15% compared to last month', 'Customer acquisition rate improved'],
        recommendations: ['Focus on high-value customers', 'Optimize inventory for top-selling products'],
        generatedDate: '2024-09-30'
      }
    ];
  }

  private getInitialDemandForecasts(): DemandForecast[] {
    return [
      {
        id: 'DF001',
        productSku: 'PRD-X-001',
        productName: 'Product X',
        forecastPeriod: 'October 2024',
        predictedDemand: 120,
        confidence: 85,
        factors: [
          { factor: 'Historical Sales', impact: 0.4, weight: 0.6 },
          { factor: 'Seasonal Trends', impact: 0.2, weight: 0.3 },
          { factor: 'Market Conditions', impact: 0.1, weight: 0.1 }
        ],
        lastUpdated: '2024-09-25'
      }
    ];
  }

  private getInitialSecurityAudits(): SecurityAudit[] {
    return [
      {
        id: 'SA001',
        userId: 'USER001',
        action: 'Login',
        module: 'Authentication',
        timestamp: '2024-09-25T10:30:00Z',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'Success',
        details: 'Successful login from office network'
      }
    ];
  }

  private getInitialBackupRecords(): BackupRecord[] {
    return [
      {
        id: 'BACKUP001',
        backupType: 'Full',
        backupDate: '2024-09-25T02:00:00Z',
        size: 1024000000,
        location: '/backups/full_20240925.bak',
        status: 'Success',
        retentionPeriod: 30,
        lastRestore: '2024-09-20T15:30:00Z'
      }
    ];
  }
}

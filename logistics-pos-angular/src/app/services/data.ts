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
}

export interface Order {
  id: string;
  type: string;
  customer: string;
  date: string;
  status: string;
  priority: string;
  total: number;
  amount: number;
  deliveryDate: string;
  paymentTerms: string;
  items: OrderItem[];
  instructions?: string;
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
}

export interface Batch {
  batchNumber: string;
  quantity: number;
  manufacturingDate: string;
  expiryDate: string;
  status: string;
  location: string;
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
        description: 'High quality raw material for production'
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
        description: 'Premium finished product'
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
        description: 'Standard packaging material'
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
        description: 'Secondary raw material'
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
        description: 'Deluxe finished product'
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
        status: 'In Production',
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
        attendanceRate: 98
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
        attendanceRate: 96
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
}

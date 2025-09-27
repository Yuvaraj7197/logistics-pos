import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { Observable } from 'rxjs';

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  status: string;
  rating: number;
  paymentTerms: string;
  totalOrders: number;
  totalAmount: number;
  lastOrderDate: string;
  notes: string;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  status: string;
  totalAmount: number;
  items: PurchaseOrderItem[];
  notes: string;
}

export interface PurchaseOrderItem {
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

@Component({
  selector: 'app-suppliers',
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss'
})
export class SuppliersComponent implements OnInit {
  showAddSupplierModal: boolean = false;
  showPurchaseOrderModal: boolean = false;
  showSettlementModal: boolean = false;
  showAnalyticsModal: boolean = false;

  newSupplier: Supplier = {
    id: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'Raw Materials',
    status: 'Active',
    rating: 5,
    paymentTerms: '30 Days',
    totalOrders: 0,
    totalAmount: 0,
    lastOrderDate: '',
    notes: ''
  };

  newPurchaseOrder: PurchaseOrder = {
    id: '',
    supplierId: '',
    supplierName: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    status: 'Pending',
    totalAmount: 0,
    items: [],
    notes: ''
  };

  suppliers: Supplier[] = [
    { id: 'SUP001', name: 'ABC Materials Ltd', contactPerson: 'John Smith', email: 'john@abcmaterials.com', phone: '+91-9876543210', address: '123 Industrial Area, Mumbai', category: 'Raw Materials', status: 'Active', rating: 5, paymentTerms: '30 Days', totalOrders: 25, totalAmount: 250000, lastOrderDate: '2024-09-25', notes: 'Reliable supplier' },
    { id: 'SUP002', name: 'XYZ Packaging Co', contactPerson: 'Sarah Johnson', email: 'sarah@xyzpackaging.com', phone: '+91-9876543211', address: '456 Packaging Zone, Delhi', category: 'Packaging', status: 'Active', rating: 4, paymentTerms: '15 Days', totalOrders: 18, totalAmount: 150000, lastOrderDate: '2024-09-20', notes: 'Good quality packaging' },
    { id: 'SUP003', name: 'Tech Equipment Inc', contactPerson: 'Mike Wilson', email: 'mike@techequipment.com', phone: '+91-9876543212', address: '789 Tech Park, Bangalore', category: 'Equipment', status: 'Preferred', rating: 5, paymentTerms: '45 Days', totalOrders: 12, totalAmount: 500000, lastOrderDate: '2024-09-15', notes: 'Premium equipment supplier' },
    { id: 'SUP004', name: 'Service Solutions', contactPerson: 'Emily Davis', email: 'emily@servicesolutions.com', phone: '+91-9876543213', address: '321 Service Hub, Chennai', category: 'Services', status: 'Inactive', rating: 3, paymentTerms: '30 Days', totalOrders: 8, totalAmount: 75000, lastOrderDate: '2024-08-10', notes: 'Service quality issues' }
  ];

  purchaseOrders: PurchaseOrder[] = [
    { id: 'PO-001', supplierId: 'SUP001', supplierName: 'ABC Materials Ltd', orderDate: '2024-09-25', expectedDate: '2024-10-05', status: 'Pending', totalAmount: 50000, items: [{ product: 'Steel Sheets', quantity: 100, unitPrice: 500, total: 50000 }], notes: 'Urgent order' },
    { id: 'PO-002', supplierId: 'SUP002', supplierName: 'XYZ Packaging Co', orderDate: '2024-09-20', expectedDate: '2024-09-30', status: 'Delivered', totalAmount: 25000, items: [{ product: 'Cardboard Boxes', quantity: 500, unitPrice: 50, total: 25000 }], notes: 'Standard packaging' },
    { id: 'PO-003', supplierId: 'SUP003', supplierName: 'Tech Equipment Inc', orderDate: '2024-09-15', expectedDate: '2024-10-15', status: 'In Transit', totalAmount: 100000, items: [{ product: 'Industrial Machine', quantity: 1, unitPrice: 100000, total: 100000 }], notes: 'Heavy machinery' }
  ];

  // Filters
  categoryFilter: string = '';
  statusFilter: string = '';
  ratingFilter: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.generateSupplierId();
    this.generatePurchaseOrderId();
  }

  generateSupplierId(): void {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newSupplier.id = `SUP${random}`;
  }

  generatePurchaseOrderId(): void {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newPurchaseOrder.id = `PO-${random}`;
  }

  showAddSupplier(): void {
    this.showAddSupplierModal = true;
    this.generateSupplierId();
  }

  hideAddSupplier(): void {
    this.showAddSupplierModal = false;
    this.resetSupplierForm();
  }

  showCreatePurchaseOrder(): void {
    this.showPurchaseOrderModal = true;
    this.generatePurchaseOrderId();
  }

  hidePurchaseOrderModal(): void {
    this.showPurchaseOrderModal = false;
    this.resetPurchaseOrderForm();
  }

  showSupplierSettlement(): void {
    this.showSettlementModal = true;
  }

  hideSettlementModal(): void {
    this.showSettlementModal = false;
  }

  showSupplierAnalytics(): void {
    this.showAnalyticsModal = true;
  }

  hideAnalyticsModal(): void {
    this.showAnalyticsModal = false;
  }

  addSupplier(): void {
    if (this.isSupplierValid()) {
      this.suppliers.push({...this.newSupplier});
      this.hideAddSupplier();
    }
  }

  createPurchaseOrder(): void {
    if (this.isPurchaseOrderValid()) {
      this.purchaseOrders.push({...this.newPurchaseOrder});
      this.hidePurchaseOrderModal();
    }
  }

  updateSupplierStatus(supplier: Supplier, status: string): void {
    supplier.status = status;
  }

  getSupplierStats(): { totalSuppliers: number, activeSuppliers: number, preferredSuppliers: number, avgRating: number } {
    const totalSuppliers = this.suppliers.length;
    const activeSuppliers = this.suppliers.filter(s => s.status === 'Active').length;
    const preferredSuppliers = this.suppliers.filter(s => s.status === 'Preferred').length;
    const avgRating = totalSuppliers > 0 ? this.suppliers.reduce((sum, s) => sum + s.rating, 0) / totalSuppliers : 0;

    return { totalSuppliers, activeSuppliers, preferredSuppliers, avgRating };
  }

  getPurchaseOrderStats(): { totalOrders: number, pendingOrders: number, deliveredOrders: number, totalValue: number } {
    const totalOrders = this.purchaseOrders.length;
    const pendingOrders = this.purchaseOrders.filter(po => po.status === 'Pending').length;
    const deliveredOrders = this.purchaseOrders.filter(po => po.status === 'Delivered').length;
    const totalValue = this.purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);

    return { totalOrders, pendingOrders, deliveredOrders, totalValue };
  }

  getFilteredSuppliers(): Supplier[] {
    let filtered = this.suppliers;

    if (this.categoryFilter) {
      filtered = filtered.filter(s => s.category === this.categoryFilter);
    }

    if (this.statusFilter) {
      filtered = filtered.filter(s => s.status === this.statusFilter);
    }

    if (this.ratingFilter) {
      filtered = filtered.filter(s => s.rating >= parseInt(this.ratingFilter));
    }

    return filtered;
  }

  exportSuppliers(): void {
    console.log('Exporting suppliers data...');
  }

  exportPurchaseOrders(): void {
    console.log('Exporting purchase orders data...');
  }

  private isSupplierValid(): boolean {
    return !!(this.newSupplier.name && this.newSupplier.contactPerson && this.newSupplier.email);
  }

  private isPurchaseOrderValid(): boolean {
    return !!(this.newPurchaseOrder.supplierId && this.newPurchaseOrder.items.length > 0);
  }

  private resetSupplierForm(): void {
    this.newSupplier = {
      id: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      category: 'Raw Materials',
      status: 'Active',
      rating: 5,
      paymentTerms: '30 Days',
      totalOrders: 0,
      totalAmount: 0,
      lastOrderDate: '',
      notes: ''
    };
  }

  private resetPurchaseOrderForm(): void {
    this.newPurchaseOrder = {
      id: '',
      supplierId: '',
      supplierName: '',
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: '',
      status: 'Pending',
      totalAmount: 0,
      items: [],
      notes: ''
    };
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'status-delivered';
      case 'preferred': return 'status-delivered';
      case 'inactive': return 'status-cancelled';
      case 'blacklisted': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getOrderStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'in transit': return 'status-pending';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }
}

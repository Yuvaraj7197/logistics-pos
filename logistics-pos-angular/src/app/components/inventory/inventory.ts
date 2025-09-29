import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Product, StockAdjustment, ReorderAlert, Batch } from '../../services/data';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class InventoryComponent implements OnInit {
  products$: Observable<Product[]>;
  showAddModal: boolean = false;
  showStockAdjustmentModal: boolean = false;
  showReorderModal: boolean = false;
  showBarcodeModal: boolean = false;
  showMultiWarehouseModal: boolean = false;
  selectedProduct: Product | null = null;

  newProduct: Product = {
    name: '',
    sku: '',
    category: '',
    stock: 0,
    minStock: 0,
    price: 0,
    location: '',
    reorderQty: 0,
    supplier: '',
    barcode: '',
    description: '',
    warehouses: [],
    batchTracking: false,
    expiryTracking: false,
    lastStockUpdate: new Date().toISOString(),
    stockAdjustments: [],
    reorderAlerts: []
  };

  newStockAdjustment: StockAdjustment = {
    id: '',
    productSku: '',
    adjustmentType: 'Damaged',
    quantity: 0,
    reason: '',
    adjustedBy: '',
    adjustmentDate: new Date().toISOString().split('T')[0],
    reference: ''
  };

  // Filters
  categoryFilter: string = '';
  warehouseFilter: string = '';
  lowStockFilter: boolean = false;
  batchTrackingFilter: boolean = false;

  // Additional properties for enhanced features
  scannedBarcode: string = '';

  constructor(private dataService: DataService) {
    this.products$ = this.dataService.getProducts();
  }

  ngOnInit(): void {
    // Component initialization
  }

  // Basic Product Management
  showAddProductModal(): void {
    this.showAddModal = true;
  }

  hideAddProductModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  addProduct(): void {
    if (this.isFormValid()) {
      this.dataService.addProduct({...this.newProduct});
      this.hideAddProductModal();
    }
  }

  deleteProduct(sku: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.dataService.deleteProduct(sku);
    }
  }

  // Stock Adjustment Methods
  showStockAdjustment(): void {
    this.showStockAdjustmentModal = true;
  }

  hideStockAdjustmentModal(): void {
    this.showStockAdjustmentModal = false;
    this.resetStockAdjustmentForm();
  }

  processStockAdjustment(): void {
    if (this.isStockAdjustmentValid()) {
      this.newStockAdjustment.id = `ADJ-${Date.now()}`;
      this.newStockAdjustment.adjustedBy = 'Current User';
      this.newStockAdjustment.adjustmentDate = new Date().toISOString();

      // Update product stock
      this.products$.subscribe(products => {
        const product = products.find(p => p.sku === this.newStockAdjustment.productSku);
        if (product) {
          // Apply adjustment based on type
          if (this.newStockAdjustment.adjustmentType === 'Damaged' ||
              this.newStockAdjustment.adjustmentType === 'Expired' ||
              this.newStockAdjustment.adjustmentType === 'Lost') {
            product.stock -= this.newStockAdjustment.quantity;
          } else if (this.newStockAdjustment.adjustmentType === 'Found') {
            product.stock += this.newStockAdjustment.quantity;
          } else if (this.newStockAdjustment.adjustmentType === 'Count') {
            product.stock = this.newStockAdjustment.quantity;
          }

          product.lastStockUpdate = new Date().toISOString();
          product.stockAdjustments.push({...this.newStockAdjustment});

          this.dataService.updateProduct(product);
        }
      });

      this.hideStockAdjustmentModal();
    }
  }

  // Reorder Alert Methods
  showReorderAlerts(): void {
    this.showReorderModal = true;
  }

  hideReorderModal(): void {
    this.showReorderModal = false;
  }

  processReorderAlert(productSku: string): void {
    console.log('Creating purchase order for:', productSku);
    // Implementation for creating purchase orders
  }

  // Barcode Methods
  showBarcodeScanner(): void {
    this.showBarcodeModal = true;
  }

  hideBarcodeModal(): void {
    this.showBarcodeModal = false;
  }

  scanBarcode(barcode: string): void {
    if (barcode) {
      this.products$.subscribe(products => {
        const product = products.find(p => p.barcode === barcode);
        if (product) {
          console.log('Product found:', product);
          // Implementation for barcode scanning result
        } else {
          console.log('Product not found for barcode:', barcode);
        }
      });
    }
  }

  generateBarcode(): void {
    const randomBarcode = Math.random().toString(36).substring(2, 15);
    console.log('Generated barcode:', randomBarcode);
    // Implementation for barcode generation
  }

  // Multi-Warehouse Methods
  showMultiWarehouseManagement(): void {
    this.showMultiWarehouseModal = true;
  }

  hideMultiWarehouseModal(): void {
    this.showMultiWarehouseModal = false;
  }

  updateWarehouseStock(productSku: string, warehouseId: string, quantity: number): void {
    this.products$.subscribe(products => {
      const product = products.find(p => p.sku === productSku);
      if (product) {
        const warehouseStock = product.warehouses.find(w => w.warehouseId === warehouseId);
        if (warehouseStock) {
          warehouseStock.stock = quantity;
          warehouseStock.lastUpdated = new Date().toISOString();
        } else {
          product.warehouses.push({
            warehouseId: warehouseId,
            warehouseName: warehouseId,
            stock: quantity,
            reservedStock: 0,
            availableStock: quantity,
            lastUpdated: new Date().toISOString()
          });
        }

        product.lastStockUpdate = new Date().toISOString();
        this.dataService.updateProduct(product);
      }
    });
  }

  // Enhanced Inventory Management Methods
  viewProductDetails(product: Product): void {
    console.log('Viewing product details:', product);
    // Implementation for viewing detailed product information
  }

  adjustStock(product: Product): void {
    this.newStockAdjustment.productSku = product.sku;
    this.showStockAdjustment();
  }

  getWarehouseProductCount(warehouse: string): number {
    let count = 0;
    this.products$.subscribe(products => {
      count = products.filter(p => p.location === warehouse).length;
    });
    return count;
  }

  getWarehouseValue(warehouse: string): number {
    let value = 0;
    this.products$.subscribe(products => {
      value = products
        .filter(p => p.location === warehouse)
        .reduce((sum, p) => sum + (p.stock * p.price), 0);
    });
    return value;
  }

  viewWarehouseDetails(warehouse: string): void {
    console.log('Viewing warehouse details:', warehouse);
    // Implementation for viewing warehouse details
  }

  // Enhanced filtering methods
  getFilteredProducts(): Product[] {
    let filtered: Product[] = [];

    this.products$.subscribe(products => {
      filtered = products;

      if (this.categoryFilter) {
        filtered = filtered.filter(p => p.category === this.categoryFilter);
      }

      if (this.warehouseFilter) {
        filtered = filtered.filter(p => p.location === this.warehouseFilter);
      }

      if (this.lowStockFilter) {
        filtered = filtered.filter(p => p.stock <= p.minStock);
      }

      if (this.batchTrackingFilter) {
        filtered = filtered.filter(p => p.batchTracking);
      }
    });

    return filtered;
  }

  // Enhanced inventory stats
  getInventoryStats(): { totalProducts: number, totalWarehouses: number, totalValue: number, lowStockCount: number } {
    let stats = { totalProducts: 0, totalWarehouses: 0, totalValue: 0, lowStockCount: 0 };

    this.products$.subscribe(products => {
      stats.totalProducts = products.length;
      stats.totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
      stats.lowStockCount = products.filter(p => p.stock <= p.minStock).length;

      // Count unique warehouses
      const warehouses = new Set(products.map(p => p.location));
      stats.totalWarehouses = warehouses.size;
    });

    return stats;
  }

  // Enhanced low stock products
  getLowStockProducts(): Product[] {
    let lowStockProducts: Product[] = [];

    this.products$.subscribe(products => {
      lowStockProducts = products.filter(p => p.stock <= p.minStock);
    });

    return lowStockProducts;
  }

  // Enhanced export functionality
  exportInventory(): void {
    const csvContent = "Name,SKU,Category,Stock,Min Stock,Price,Location,Supplier,Batch Tracking,Expiry Tracking,Last Updated\n" +
      this.getFilteredProducts().map(product =>
        `${product.name},${product.sku},${product.category},${product.stock},${product.minStock},${product.price},${product.location},${product.supplier},${product.batchTracking ? 'Yes' : 'No'},${product.expiryTracking ? 'Yes' : 'No'},${product.lastStockUpdate}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Enhanced batch data retrieval
  getBatchData(productSku: string): any[] {
    // Mock batch data - in real app, this would come from batch tracking service
    return [
      { batchNumber: 'BATCH-001', quantity: 100, expiryDate: '2025-12-31', status: 'Active' },
      { batchNumber: 'BATCH-002', quantity: 50, expiryDate: '2025-06-30', status: 'Active' }
    ];
  }

  // Enhanced expiring batches
  getExpiringBatches(): any[] {
    // Mock expiring batches data
    return [
      { productName: 'Product X', batchNumber: 'BATCH-001', expiryDate: '2024-12-31', daysToExpiry: 30 },
      { productName: 'Product Y', batchNumber: 'BATCH-002', expiryDate: '2024-11-15', daysToExpiry: 15 }
    ];
  }

  // Validation methods
  private isFormValid(): boolean {
    return !!(this.newProduct.name && this.newProduct.sku && this.newProduct.category);
  }

  private isStockAdjustmentValid(): boolean {
    return !!(this.newStockAdjustment.productSku &&
              this.newStockAdjustment.adjustmentType &&
              this.newStockAdjustment.quantity !== 0 &&
              this.newStockAdjustment.reason);
  }

  // Reset methods
  private resetStockAdjustmentForm(): void {
    this.newStockAdjustment = {
      id: '',
      productSku: '',
      adjustmentType: 'Damaged',
      quantity: 0,
      reason: '',
      adjustedBy: '',
      adjustmentDate: new Date().toISOString().split('T')[0],
      reference: ''
    };
  }

  private resetForm(): void {
    this.newProduct = {
      name: '',
      sku: '',
      category: '',
      stock: 0,
      minStock: 0,
      price: 0,
      location: '',
      reorderQty: 0,
      supplier: '',
      barcode: '',
      description: '',
      warehouses: [],
      batchTracking: false,
      expiryTracking: false,
      lastStockUpdate: new Date().toISOString(),
      stockAdjustments: [],
      reorderAlerts: []
    };
  }
}

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

  constructor(private dataService: DataService) {
    this.products$ = this.dataService.getProducts();
  }

  ngOnInit(): void {
    // Component initialization
  }

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

  private isFormValid(): boolean {
    return !!(this.newProduct.name && this.newProduct.sku && this.newProduct.category);
  }

  deleteProduct(sku: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.dataService.deleteProduct(sku);
    }
  }

  // Stock Adjustment Methods
  showStockAdjustment(product: Product): void {
    this.selectedProduct = product;
    this.newStockAdjustment.productSku = product.sku;
    this.showStockAdjustmentModal = true;
  }

  hideStockAdjustmentModal(): void {
    this.showStockAdjustmentModal = false;
    this.selectedProduct = null;
    this.resetStockAdjustmentForm();
  }

  processStockAdjustment(): void {
    if (this.selectedProduct && this.isStockAdjustmentValid()) {
      // Update product stock
      this.selectedProduct.stock += this.newStockAdjustment.quantity;
      this.selectedProduct.lastStockUpdate = new Date().toISOString();

      // Add adjustment record
      this.newStockAdjustment.id = `ADJ-${Date.now()}`;
      this.selectedProduct.stockAdjustments.push({...this.newStockAdjustment});

      this.dataService.updateProduct(this.selectedProduct);
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

  processReorderAlert(alert: ReorderAlert): void {
    alert.status = 'Processed';
    alert.processedBy = 'Current User';
    alert.processedDate = new Date().toISOString();
    // Update the product in the service
    this.dataService.getProducts().subscribe(products => {
      const product = products.find(p => p.sku === alert.productSku);
      if (product) {
        this.dataService.updateProduct(product);
      }
    });
  }

  // Barcode Methods
  showBarcodeScanner(): void {
    this.showBarcodeModal = true;
  }

  hideBarcodeModal(): void {
    this.showBarcodeModal = false;
  }

  scanBarcode(barcode: string): void {
    this.dataService.getProducts().subscribe(products => {
      const product = products.find(p => p.barcode === barcode);
      if (product) {
        this.selectedProduct = product;
        this.showStockAdjustment(product);
      } else {
        alert('Product not found with barcode: ' + barcode);
      }
    });
  }

  generateBarcode(product: Product): string {
    // Simple barcode generation (in real app, use proper barcode library)
    return product.sku.replace(/[^0-9]/g, '').padStart(13, '0');
  }

  // Multi-Warehouse Methods
  showMultiWarehouseManagement(product: Product): void {
    this.selectedProduct = product;
    this.showMultiWarehouseModal = true;
  }

  hideMultiWarehouseModal(): void {
    this.showMultiWarehouseModal = false;
    this.selectedProduct = null;
  }

  updateWarehouseStock(product: Product, warehouseId: string, newStock: number): void {
    const warehouse = product.warehouses.find(w => w.warehouseId === warehouseId);
    if (warehouse) {
      warehouse.stock = newStock;
      warehouse.availableStock = newStock - warehouse.reservedStock;
      warehouse.lastUpdated = new Date().toISOString();

      // Update total stock
      product.stock = product.warehouses.reduce((sum, w) => sum + w.stock, 0);
      product.lastStockUpdate = new Date().toISOString();

      this.dataService.updateProduct(product);
    }
  }

  // Batch Tracking Methods
  getBatchData(product: Product): Batch[] {
    // This would typically come from the service
    return [
      { batchNumber: 'BATCH-001', quantity: 100, manufacturingDate: '2024-08-01', expiryDate: '2025-08-01', status: 'Active', location: 'Warehouse 1' },
      { batchNumber: 'BATCH-002', quantity: 50, manufacturingDate: '2024-09-01', expiryDate: '2025-09-01', status: 'Active', location: 'Warehouse 2' }
    ];
  }

  getExpiringBatches(days: number = 30): Batch[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return this.getBatchData(this.selectedProduct!).filter(batch => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate <= cutoffDate;
    });
  }

  // Analytics Methods
  getInventoryStats(): { totalProducts: number, lowStockItems: number, totalValue: number, avgStockTurnover: number } {
    let totalProducts = 0;
    let lowStockItems = 0;
    let totalValue = 0;
    let totalStock = 0;

    this.dataService.getProducts().subscribe(products => {
      totalProducts = products.length;
      lowStockItems = products.filter(p => p.stock <= p.minStock).length;
      totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
      totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    });

    return {
      totalProducts,
      lowStockItems,
      totalValue,
      avgStockTurnover: totalStock > 0 ? totalValue / totalStock : 0
    };
  }

  getLowStockProducts(): Product[] {
    let lowStockProducts: Product[] = [];
    this.dataService.getProducts().subscribe(products => {
      lowStockProducts = products.filter(p => p.stock <= p.minStock);
    });
    return lowStockProducts;
  }

  getFilteredProducts(): Product[] {
    let filteredProducts: Product[] = [];

    this.dataService.getProducts().subscribe(products => {
      filteredProducts = products;

      if (this.categoryFilter) {
        filteredProducts = filteredProducts.filter(p => p.category === this.categoryFilter);
      }

      if (this.warehouseFilter) {
        filteredProducts = filteredProducts.filter(p =>
          p.warehouses.some(w => w.warehouseName === this.warehouseFilter)
        );
      }

      if (this.lowStockFilter) {
        filteredProducts = filteredProducts.filter(p => p.stock <= p.minStock);
      }

      if (this.batchTrackingFilter) {
        filteredProducts = filteredProducts.filter(p => p.batchTracking);
      }
    });

    return filteredProducts;
  }

  exportInventory(): void {
    const csvContent = "SKU,Name,Category,Stock,Min Stock,Price,Location,Supplier,Barcode\n" +
      this.getFilteredProducts().map(product =>
        `${product.sku},${product.name},${product.category},${product.stock},${product.minStock},${product.price},${product.location},${product.supplier},${product.barcode}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inventory_export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private isStockAdjustmentValid(): boolean {
    return !!(this.newStockAdjustment.reason && this.newStockAdjustment.quantity !== 0);
  }

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

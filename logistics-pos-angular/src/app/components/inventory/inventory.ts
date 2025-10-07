import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory',
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss'
})
export class InventoryComponent {
  categoryFilter: string = '';
  locationFilter: string = '';
  statusFilter: string = '';

  // Modal states
  showAddModal: boolean = false;
  showStockAdjustmentModal: boolean = false;
  showReorderModal: boolean = false;
  showBarcodeModal: boolean = false;
  showMultiWarehouseModal: boolean = false;

  // Form data
  newProduct: any = {
    name: '',
    sku: '',
    category: '',
    location: '',
    stock: 0,
    minStock: 0,
    price: 0,
    reorderQty: 0,
    supplier: '',
    barcode: '',
    batchTracking: false,
    expiryTracking: false,
    description: ''
  };

  newStockAdjustment: any = {
    productSku: '',
    adjustmentType: '',
    quantity: 0,
    reason: '',
    reference: ''
  };

  scannedBarcode: string = '';

  // Sample data
  sampleProducts = [
    {
      name: 'Steel Rods',
      sku: 'SR-001',
      category: 'Raw Materials',
      stock: 150,
      minStock: 200,
      price: 250,
      location: 'Warehouse 1',
      supplier: 'Steel Corp',
      batchTracking: true,
      lastStockUpdate: new Date('2024-01-15')
    },
    {
      name: 'Finished Product A',
      sku: 'FP-001',
      category: 'Finished Goods',
      stock: 50,
      minStock: 100,
      price: 1500,
      location: 'Warehouse 2',
      supplier: 'Manufacturing Ltd',
      batchTracking: false,
      lastStockUpdate: new Date('2024-01-14')
    },
    {
      name: 'Packaging Boxes',
      sku: 'PB-001',
      category: 'Packaging',
      stock: 5,
      minStock: 50,
      price: 25,
      location: 'Warehouse 3',
      supplier: 'Packaging Co',
      batchTracking: true,
      lastStockUpdate: new Date('2024-01-13')
    }
  ];

  reorderAlerts = [
    {
      product: 'Steel Rods',
      currentStock: 150,
      minStock: 200,
      reorderQuantity: 500,
      supplier: 'Steel Corp'
    },
    {
      product: 'Finished Product A',
      currentStock: 50,
      minStock: 100,
      reorderQuantity: 200,
      supplier: 'Manufacturing Ltd'
    },
    {
      product: 'Packaging Boxes',
      currentStock: 5,
      minStock: 50,
      reorderQuantity: 100,
      supplier: 'Packaging Co'
    }
  ];

  // Modal methods
  showAddProductModal(): void {
    this.showAddModal = true;
  }

  hideAddProductModal(): void {
    this.showAddModal = false;
    this.resetNewProduct();
  }

  showStockAdjustment(): void {
    this.showStockAdjustmentModal = true;
  }

  hideStockAdjustmentModal(): void {
    this.showStockAdjustmentModal = false;
    this.resetStockAdjustment();
  }

  showBarcodeScanner(): void {
    this.showBarcodeModal = true;
  }

  hideBarcodeModal(): void {
    this.showBarcodeModal = false;
  }

  showMultiWarehouseManagement(): void {
    this.showMultiWarehouseModal = true;
  }

  hideMultiWarehouseModal(): void {
    this.showMultiWarehouseModal = false;
  }

  showBatchTracking(): void {
    console.log('Show batch tracking');
  }

  // Action methods
  exportInventory(): void {
    console.log('Exporting inventory...');
  }

  generateReorderReport(): void {
    console.log('Generating reorder report...');
  }

  viewProductDetails(product: any): void {
    console.log('Viewing product details:', product);
  }

  adjustStock(product: any): void {
    console.log('Adjusting stock for:', product);
    this.showStockAdjustment();
  }

  deleteProduct(sku: string): void {
    if (confirm(`Are you sure you want to delete product ${sku}?`)) {
      console.log('Deleting product:', sku);
    }
  }

  createPurchaseOrder(alert: any): void {
    console.log('Creating purchase order for:', alert);
  }

  // Additional missing methods
  addProduct(): void {
    if (this.isValidProduct()) {
      console.log('Adding product:', this.newProduct);
      this.hideAddProductModal();
    }
  }

  processStockAdjustment(): void {
    if (this.isStockAdjustmentValid()) {
      console.log('Processing stock adjustment:', this.newStockAdjustment);
      this.hideStockAdjustmentModal();
    }
  }

  hideReorderModal(): void {
    this.showReorderModal = false;
  }

  scanBarcode(barcode: string): void {
    if (barcode) {
      console.log('Scanning barcode:', barcode);
    }
  }

  generateBarcode(): void {
    console.log('Generating barcode...');
  }

  getLowStockProducts(): any[] {
    return this.sampleProducts.filter(product => product.stock <= product.minStock);
  }

  getWarehouseProductCount(warehouse: string): number {
    return this.sampleProducts.filter(product => product.location === warehouse).length;
  }

  getWarehouseValue(warehouse: string): number {
    return this.sampleProducts
      .filter(product => product.location === warehouse)
      .reduce((sum, product) => sum + (product.stock * product.price), 0);
  }

  viewWarehouseDetails(warehouse: string): void {
    console.log('Viewing warehouse details:', warehouse);
  }

  processReorderAlert(sku: string): void {
    console.log('Processing reorder alert for:', sku);
  }

  // Validation methods
  private isValidProduct(): boolean {
    return !!(this.newProduct.name && this.newProduct.sku && this.newProduct.category);
  }

  private isStockAdjustmentValid(): boolean {
    return !!(this.newStockAdjustment.productSku && 
              this.newStockAdjustment.adjustmentType && 
              this.newStockAdjustment.quantity !== 0 &&
              this.newStockAdjustment.reason);
  }

  private resetNewProduct(): void {
    this.newProduct = {
      name: '',
      sku: '',
      category: '',
      location: '',
      stock: 0,
      minStock: 0,
      price: 0,
      reorderQty: 0,
      supplier: '',
      barcode: '',
      batchTracking: false,
      expiryTracking: false,
      description: ''
    };
  }

  private resetStockAdjustment(): void {
    this.newStockAdjustment = {
      productSku: '',
      adjustmentType: '',
      quantity: 0,
      reason: '',
      reference: ''
    };
  }
}

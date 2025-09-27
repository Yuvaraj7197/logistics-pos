import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Product } from '../../services/data';
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
    description: ''
  };

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
      description: ''
    };
  }

  deleteProduct(sku: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.dataService.deleteProduct(sku);
    }
  }
}

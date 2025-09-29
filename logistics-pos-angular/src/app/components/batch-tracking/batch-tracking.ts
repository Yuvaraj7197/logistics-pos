import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { Observable } from 'rxjs';

export interface Batch {
  id: string;
  productName: string;
  batchNumber: string;
  quantity: number;
  productionDate: string;
  expiryDate: string;
  status: string;
  location: string;
  supplier: string;
  qualityStatus: string;
  temperature: number;
  humidity: number;
  notes: string;
}

export interface BatchMovement {
  id: string;
  batchId: string;
  batchNumber: string;
  movementType: string;
  fromLocation: string;
  toLocation: string;
  quantity: number;
  date: string;
  operator: string;
  reason: string;
}

@Component({
  selector: 'app-batch-tracking',
  imports: [CommonModule, FormsModule],
  templateUrl: './batch-tracking.html',
  styleUrl: './batch-tracking.scss'
})
export class BatchTrackingComponent implements OnInit {
  showAddBatchModal: boolean = false;
  showBatchMovementModal: boolean = false;
  showBatchDetailsModal: boolean = false;
  showQualityCheckModal: boolean = false;

  newBatch: Batch = {
    id: '',
    productName: '',
    batchNumber: '',
    quantity: 0,
    productionDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    status: 'Active',
    location: '',
    supplier: '',
    qualityStatus: 'Pending',
    temperature: 0,
    humidity: 0,
    notes: ''
  };

  newMovement: BatchMovement = {
    id: '',
    batchId: '',
    batchNumber: '',
    movementType: 'Transfer',
    fromLocation: '',
    toLocation: '',
    quantity: 0,
    date: new Date().toISOString().split('T')[0],
    operator: '',
    reason: ''
  };

  batches: Batch[] = [
    { id: 'BATCH001', productName: 'Product X', batchNumber: 'BATCH-X-001', quantity: 1000, productionDate: '2024-09-01', expiryDate: '2025-09-01', status: 'Active', location: 'Warehouse A', supplier: 'ABC Materials', qualityStatus: 'Passed', temperature: 22, humidity: 45, notes: 'High quality batch' },
    { id: 'BATCH002', productName: 'Product Y', batchNumber: 'BATCH-Y-001', quantity: 500, productionDate: '2024-09-15', expiryDate: '2025-09-15', status: 'Active', location: 'Warehouse B', supplier: 'XYZ Corp', qualityStatus: 'Passed', temperature: 24, humidity: 50, notes: 'Standard batch' },
    { id: 'BATCH003', productName: 'Product Z', batchNumber: 'BATCH-Z-001', quantity: 750, productionDate: '2024-08-20', expiryDate: '2025-08-20', status: 'Expired', location: 'Disposal', supplier: 'DEF Ltd', qualityStatus: 'Failed', temperature: 25, humidity: 55, notes: 'Expired batch' },
    { id: 'BATCH004', productName: 'Product A', batchNumber: 'BATCH-A-001', quantity: 200, productionDate: '2024-09-20', expiryDate: '2025-09-20', status: 'Active', location: 'Production Line', supplier: 'GHI Inc', qualityStatus: 'Pending', temperature: 23, humidity: 48, notes: 'New batch' }
  ];

  batchMovements: BatchMovement[] = [
    { id: 'MOV001', batchId: 'BATCH001', batchNumber: 'BATCH-X-001', movementType: 'Transfer', fromLocation: 'Production', toLocation: 'Warehouse A', quantity: 1000, date: '2024-09-01', operator: 'John Smith', reason: 'Production completion' },
    { id: 'MOV002', batchId: 'BATCH002', batchNumber: 'BATCH-Y-001', movementType: 'Transfer', fromLocation: 'Production', toLocation: 'Warehouse B', quantity: 500, date: '2024-09-15', operator: 'Sarah Johnson', reason: 'Quality approved' },
    { id: 'MOV003', batchId: 'BATCH003', batchNumber: 'BATCH-Z-001', movementType: 'Disposal', fromLocation: 'Warehouse A', toLocation: 'Disposal', quantity: 750, date: '2024-09-20', operator: 'Mike Wilson', reason: 'Expired' },
    { id: 'MOV004', batchId: 'BATCH001', batchNumber: 'BATCH-X-001', movementType: 'Shipment', fromLocation: 'Warehouse A', toLocation: 'Customer', quantity: 200, date: '2024-09-25', operator: 'Emily Davis', reason: 'Order fulfillment' }
  ];

  // Filters
  statusFilter: string = '';
  locationFilter: string = '';
  qualityFilter: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.generateBatchId();
    this.generateMovementId();
  }

  generateBatchId(): void {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newBatch.id = `BATCH${random}`;
  }

  generateMovementId(): void {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newMovement.id = `MOV${random}`;
  }

  showAddBatch(): void {
    this.showAddBatchModal = true;
    this.generateBatchId();
  }

  hideAddBatch(): void {
    this.showAddBatchModal = false;
    this.resetBatchForm();
  }

  showBatchMovement(): void {
    this.showBatchMovementModal = true;
    this.generateMovementId();
  }

  hideBatchMovement(): void {
    this.showBatchMovementModal = false;
    this.resetMovementForm();
  }

  showBatchDetails(batch: Batch): void {
    this.showBatchDetailsModal = true;
  }

  hideBatchDetails(): void {
    this.showBatchDetailsModal = false;
  }

  showQualityCheck(): void {
    this.showQualityCheckModal = true;
  }

  hideQualityCheck(): void {
    this.showQualityCheckModal = false;
  }

  addBatch(): void {
    if (this.isBatchValid()) {
      this.batches.push({...this.newBatch});
      this.hideAddBatch();
    }
  }

  addBatchMovement(): void {
    if (this.isMovementValid()) {
      this.batchMovements.push({...this.newMovement});
      this.hideBatchMovement();
    }
  }

  updateBatchStatus(batch: Batch, status: string): void {
    batch.status = status;
  }

  getBatchStats(): { totalBatches: number, activeBatches: number, expiredBatches: number, pendingQuality: number } {
    const totalBatches = this.batches.length;
    const activeBatches = this.batches.filter(b => b.status === 'Active').length;
    const expiredBatches = this.batches.filter(b => b.status === 'Expired').length;
    const pendingQuality = this.batches.filter(b => b.qualityStatus === 'Pending').length;

    return { totalBatches, activeBatches, expiredBatches, pendingQuality };
  }

  getFilteredBatches(): Batch[] {
    let filtered = this.batches;

    if (this.statusFilter) {
      filtered = filtered.filter(b => b.status === this.statusFilter);
    }

    if (this.locationFilter) {
      filtered = filtered.filter(b => b.location === this.locationFilter);
    }

    if (this.qualityFilter) {
      filtered = filtered.filter(b => b.qualityStatus === this.qualityFilter);
    }

    return filtered;
  }

  getBatchMovements(batchId: string): BatchMovement[] {
    return this.batchMovements.filter(m => m.batchId === batchId);
  }

  getExpiringBatches(days: number = 30): Batch[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return this.batches.filter(batch => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate <= cutoffDate && batch.status === 'Active';
    });
  }

  getExpiredBatches(): Batch[] {
    const today = new Date();
    return this.batches.filter(batch => {
      const expiryDate = new Date(batch.expiryDate);
      return expiryDate < today && batch.status === 'Active';
    });
  }

  getBatchTraceability(batchNumber: string): { batch: Batch, movements: BatchMovement[], qualityChecks: any[] } {
    const batch = this.batches.find(b => b.batchNumber === batchNumber);
    const movements = this.batchMovements.filter(m => m.batchNumber === batchNumber);
    const qualityChecks:any = []; // Mock quality checks data

    return { batch: batch!, movements, qualityChecks };
  }

  calculateBatchAge(batch: Batch): number {
    const productionDate = new Date(batch.productionDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - productionDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  calculateDaysToExpiry(batch: Batch): number {
    const expiryDate = new Date(batch.expiryDate);
    const today = new Date();
    const diffTime = expiryDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getBatchQualityMetrics(): { passed: number, failed: number, pending: number, avgTemperature: number, avgHumidity: number } {
    const passed = this.batches.filter(b => b.qualityStatus === 'Passed').length;
    const failed = this.batches.filter(b => b.qualityStatus === 'Failed').length;
    const pending = this.batches.filter(b => b.qualityStatus === 'Pending').length;
    const avgTemperature = this.batches.length > 0 ?
      this.batches.reduce((sum, b) => sum + b.temperature, 0) / this.batches.length : 0;
    const avgHumidity = this.batches.length > 0 ?
      this.batches.reduce((sum, b) => sum + b.humidity, 0) / this.batches.length : 0;

    return { passed, failed, pending, avgTemperature: Math.round(avgTemperature * 100) / 100, avgHumidity: Math.round(avgHumidity * 100) / 100 };
  }

  exportBatchData(): void {
    const csvContent = "Batch Number,Product,Quantity,Production Date,Expiry Date,Status,Location,Quality Status,Temperature,Humidity\n" +
      this.batches.map(batch =>
        `${batch.batchNumber},${batch.productName},${batch.quantity},${batch.productionDate},${batch.expiryDate},${batch.status},${batch.location},${batch.qualityStatus},${batch.temperature},${batch.humidity}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'batch_data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportMovementData(): void {
    const csvContent = "Movement ID,Batch Number,Movement Type,From Location,To Location,Quantity,Date,Operator,Reason\n" +
      this.batchMovements.map(movement =>
        `${movement.id},${movement.batchNumber},${movement.movementType},${movement.fromLocation},${movement.toLocation},${movement.quantity},${movement.date},${movement.operator},${movement.reason}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'batch_movements.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportExpiryReport(): void {
    const expiringBatches = this.getExpiringBatches(30);
    const csvContent = "Batch Number,Product,Quantity,Expiry Date,Days to Expiry,Location,Status\n" +
      expiringBatches.map(batch =>
        `${batch.batchNumber},${batch.productName},${batch.quantity},${batch.expiryDate},${this.calculateDaysToExpiry(batch)},${batch.location},${batch.status}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'expiry_report.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private isBatchValid(): boolean {
    return !!(this.newBatch.productName && this.newBatch.batchNumber && this.newBatch.quantity > 0);
  }

  private isMovementValid(): boolean {
    return !!(this.newMovement.batchId && this.newMovement.movementType && this.newMovement.quantity > 0);
  }

  private resetBatchForm(): void {
    this.newBatch = {
      id: '',
      productName: '',
      batchNumber: '',
      quantity: 0,
      productionDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      status: 'Active',
      location: '',
      supplier: '',
      qualityStatus: 'Pending',
      temperature: 0,
      humidity: 0,
      notes: ''
    };
  }

  private resetMovementForm(): void {
    this.newMovement = {
      id: '',
      batchId: '',
      batchNumber: '',
      movementType: 'Transfer',
      fromLocation: '',
      toLocation: '',
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
      operator: '',
      reason: ''
    };
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'status-delivered';
      case 'expired': return 'status-cancelled';
      case 'disposed': return 'status-cancelled';
      case 'passed': return 'status-delivered';
      case 'failed': return 'status-cancelled';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  }

  getMovementTypeClass(type: string): string {
    switch (type.toLowerCase()) {
      case 'transfer': return 'status-pending';
      case 'shipment': return 'status-delivered';
      case 'disposal': return 'status-cancelled';
      case 'return': return 'status-pending';
      default: return 'status-pending';
    }
  }
}

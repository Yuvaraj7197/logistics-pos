import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { Observable } from 'rxjs';

export interface ManufacturingOrder {
  id: string;
  productName: string;
  quantity: number;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  assignedTo: string;
  qualityCheck: boolean;
  notes: string;
  batchNumber: string;
  productionLine: string;
  estimatedHours: number;
  actualHours: number;
  materialsUsed: MaterialUsage[];
}

export interface MaterialUsage {
  materialId: string;
  materialName: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface QualityControl {
  id: string;
  productName: string;
  batchNumber: string;
  testDate: string;
  inspector: string;
  status: string;
  defects: number;
  notes: string;
  testResults: TestResult[];
}

export interface TestResult {
  testName: string;
  result: string;
  value: number;
  unit: string;
  passed: boolean;
}

export interface ProductionLine {
  id: string;
  name: string;
  status: string;
  capacity: number;
  currentOrder: string;
  efficiency: number;
  lastMaintenance: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  productionLine: string;
  lastMaintenance: string;
  nextMaintenance: string;
  efficiency: number;
}

@Component({
  selector: 'app-production',
  imports: [CommonModule, FormsModule],
  templateUrl: './production.html',
  styleUrl: './production.scss'
})
export class ProductionComponent implements OnInit {
  showAddOrderModal: boolean = false;
  showQualityModal: boolean = false;
  showProductionLineModal: boolean = false;
  showEquipmentModal: boolean = false;
  showBatchTrackingModal: boolean = false;

  newOrder: ManufacturingOrder = {
    id: '',
    productName: '',
    quantity: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'Pending',
    priority: 'Normal',
    assignedTo: '',
    qualityCheck: false,
    notes: '',
    batchNumber: '',
    productionLine: '',
    estimatedHours: 0,
    actualHours: 0,
    materialsUsed: []
  };

  newQualityCheck: QualityControl = {
    id: '',
    productName: '',
    batchNumber: '',
    testDate: new Date().toISOString().split('T')[0],
    inspector: '',
    status: 'Pending',
    defects: 0,
    notes: '',
    testResults: []
  };

  manufacturingOrders: ManufacturingOrder[] = [
    { id: 'MO-001', productName: 'Product X', quantity: 100, startDate: '2024-09-25', endDate: '2024-09-30', status: 'In Progress', priority: 'High', assignedTo: 'John Smith', qualityCheck: true, notes: 'Priority order for customer', batchNumber: 'BATCH-X-001', productionLine: 'Line A', estimatedHours: 40, actualHours: 25, materialsUsed: [{ materialId: 'MAT001', materialName: 'Steel', quantity: 50, unit: 'kg', cost: 5000 }] },
    { id: 'MO-002', productName: 'Product Y', quantity: 50, startDate: '2024-09-26', endDate: '2024-10-01', status: 'Pending', priority: 'Normal', assignedTo: 'Sarah Johnson', qualityCheck: false, notes: 'Standard production run', batchNumber: 'BATCH-Y-001', productionLine: 'Line B', estimatedHours: 20, actualHours: 0, materialsUsed: [{ materialId: 'MAT002', materialName: 'Aluminum', quantity: 25, unit: 'kg', cost: 2500 }] },
    { id: 'MO-003', productName: 'Product Z', quantity: 200, startDate: '2024-09-24', endDate: '2024-09-28', status: 'Completed', priority: 'Urgent', assignedTo: 'Mike Wilson', qualityCheck: true, notes: 'Bulk order completed', batchNumber: 'BATCH-Z-001', productionLine: 'Line A', estimatedHours: 60, actualHours: 55, materialsUsed: [{ materialId: 'MAT003', materialName: 'Plastic', quantity: 100, unit: 'kg', cost: 3000 }] }
  ];

  qualityChecks: QualityControl[] = [
    { id: 'QC-001', productName: 'Product X', batchNumber: 'BATCH-X-001', testDate: '2024-09-25', inspector: 'Quality Inspector 1', status: 'Passed', defects: 0, notes: 'All quality checks passed', testResults: [{ testName: 'Dimensional Check', result: 'Pass', value: 100, unit: '%', passed: true }, { testName: 'Stress Test', result: 'Pass', value: 95, unit: '%', passed: true }] },
    { id: 'QC-002', productName: 'Product Y', batchNumber: 'BATCH-Y-001', testDate: '2024-09-24', inspector: 'Quality Inspector 2', status: 'Failed', defects: 3, notes: 'Minor defects found, rework required', testResults: [{ testName: 'Dimensional Check', result: 'Fail', value: 85, unit: '%', passed: false }, { testName: 'Stress Test', result: 'Pass', value: 90, unit: '%', passed: true }] },
    { id: 'QC-003', productName: 'Product Z', batchNumber: 'BATCH-Z-001', testDate: '2024-09-23', inspector: 'Quality Inspector 1', status: 'Passed', defects: 0, notes: 'Excellent quality', testResults: [{ testName: 'Dimensional Check', result: 'Pass', value: 98, unit: '%', passed: true }, { testName: 'Stress Test', result: 'Pass', value: 97, unit: '%', passed: true }] }
  ];

  productionLines: ProductionLine[] = [
    { id: 'LINE-A', name: 'Production Line A', status: 'Active', capacity: 1000, currentOrder: 'MO-001', efficiency: 95, lastMaintenance: '2024-09-20' },
    { id: 'LINE-B', name: 'Production Line B', status: 'Idle', capacity: 800, currentOrder: '', efficiency: 88, lastMaintenance: '2024-09-15' },
    { id: 'LINE-C', name: 'Production Line C', status: 'Maintenance', capacity: 1200, currentOrder: '', efficiency: 92, lastMaintenance: '2024-09-25' }
  ];

  equipment: Equipment[] = [
    { id: 'EQ001', name: 'CNC Machine 1', type: 'Machining', status: 'Active', productionLine: 'LINE-A', lastMaintenance: '2024-09-20', nextMaintenance: '2024-10-20', efficiency: 95 },
    { id: 'EQ002', name: 'Assembly Robot 1', type: 'Assembly', status: 'Active', productionLine: 'LINE-A', lastMaintenance: '2024-09-15', nextMaintenance: '2024-10-15', efficiency: 92 },
    { id: 'EQ003', name: 'Packaging Machine 1', type: 'Packaging', status: 'Maintenance', productionLine: 'LINE-B', lastMaintenance: '2024-09-25', nextMaintenance: '2024-09-30', efficiency: 88 },
    { id: 'EQ004', name: 'Quality Scanner', type: 'Quality Control', status: 'Active', productionLine: 'LINE-C', lastMaintenance: '2024-09-10', nextMaintenance: '2024-10-10', efficiency: 98 }
  ];

  // Filters
  statusFilter: string = '';
  priorityFilter: string = '';
  productionLineFilter: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.generateOrderId();
    this.generateQualityId();
  }

  generateOrderId(): void {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newOrder.id = `MO${random}`;
  }

  generateQualityId(): void {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newQualityCheck.id = `QC${random}`;
  }

  showAddOrder(): void {
    this.showAddOrderModal = true;
    this.generateOrderId();
  }

  hideAddOrder(): void {
    this.showAddOrderModal = false;
    this.resetOrderForm();
  }

  showAddQualityCheck(): void {
    this.showQualityModal = true;
    this.generateQualityId();
  }

  hideQualityModal(): void {
    this.showQualityModal = false;
    this.resetQualityForm();
  }

  showProductionLineManagement(): void {
    this.showProductionLineModal = true;
  }

  hideProductionLineModal(): void {
    this.showProductionLineModal = false;
  }

  showEquipmentManagement(): void {
    this.showEquipmentModal = true;
  }

  hideEquipmentModal(): void {
    this.showEquipmentModal = false;
  }

  showBatchTracking(): void {
    this.showBatchTrackingModal = true;
  }

  hideBatchTrackingModal(): void {
    this.showBatchTrackingModal = false;
  }

  addManufacturingOrder(): void {
    if (this.isOrderValid()) {
      this.manufacturingOrders.push({...this.newOrder});
      this.hideAddOrder();
    }
  }

  addQualityCheck(): void {
    if (this.isQualityValid()) {
      this.qualityChecks.push({...this.newQualityCheck});
      this.hideQualityModal();
    }
  }

  updateOrderStatus(order: ManufacturingOrder, status: string): void {
    order.status = status;
  }

  getProductionStats(): { totalOrders: number, inProgress: number, completed: number, pending: number } {
    return {
      totalOrders: this.manufacturingOrders.length,
      inProgress: this.manufacturingOrders.filter(o => o.status === 'In Progress').length,
      completed: this.manufacturingOrders.filter(o => o.status === 'Completed').length,
      pending: this.manufacturingOrders.filter(o => o.status === 'Pending').length
    };
  }

  getQualityStats(): { totalChecks: number, passed: number, failed: number, avgDefects: number } {
    const totalChecks = this.qualityChecks.length;
    const passed = this.qualityChecks.filter(q => q.status === 'Passed').length;
    const failed = this.qualityChecks.filter(q => q.status === 'Failed').length;
    const avgDefects = totalChecks > 0 ? this.qualityChecks.reduce((sum, q) => sum + q.defects, 0) / totalChecks : 0;

    return { totalChecks, passed, failed, avgDefects };
  }

  getProductionLineStats(): { activeLines: number, idleLines: number, maintenanceLines: number, avgEfficiency: number } {
    const activeLines = this.productionLines.filter(l => l.status === 'Active').length;
    const idleLines = this.productionLines.filter(l => l.status === 'Idle').length;
    const maintenanceLines = this.productionLines.filter(l => l.status === 'Maintenance').length;
    const avgEfficiency = this.productionLines.length > 0 ? this.productionLines.reduce((sum, l) => sum + l.efficiency, 0) / this.productionLines.length : 0;

    return { activeLines, idleLines, maintenanceLines, avgEfficiency };
  }

  getEquipmentStats(): { totalEquipment: number, activeEquipment: number, maintenanceEquipment: number, avgEfficiency: number } {
    const totalEquipment = this.equipment.length;
    const activeEquipment = this.equipment.filter(e => e.status === 'Active').length;
    const maintenanceEquipment = this.equipment.filter(e => e.status === 'Maintenance').length;
    const avgEfficiency = totalEquipment > 0 ? this.equipment.reduce((sum, e) => sum + e.efficiency, 0) / totalEquipment : 0;

    return { totalEquipment, activeEquipment, maintenanceEquipment, avgEfficiency };
  }

  getFilteredOrders(): ManufacturingOrder[] {
    let filtered = this.manufacturingOrders;

    if (this.statusFilter) {
      filtered = filtered.filter(o => o.status === this.statusFilter);
    }

    if (this.priorityFilter) {
      filtered = filtered.filter(o => o.priority === this.priorityFilter);
    }

    if (this.productionLineFilter) {
      filtered = filtered.filter(o => o.productionLine === this.productionLineFilter);
    }

    return filtered;
  }

  exportProductionData(): void {
    console.log('Exporting production data...');
  }

  exportQualityData(): void {
    console.log('Exporting quality data...');
  }

  exportEquipmentData(): void {
    console.log('Exporting equipment data...');
  }

  private isOrderValid(): boolean {
    return !!(this.newOrder.productName && this.newOrder.quantity > 0 && this.newOrder.assignedTo);
  }

  private isQualityValid(): boolean {
    return !!(this.newQualityCheck.productName && this.newQualityCheck.batchNumber && this.newQualityCheck.inspector);
  }

  private resetOrderForm(): void {
    this.newOrder = {
      id: '',
      productName: '',
      quantity: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'Pending',
      priority: 'Normal',
      assignedTo: '',
      qualityCheck: false,
      notes: '',
      batchNumber: '',
      productionLine: '',
      estimatedHours: 0,
      actualHours: 0,
      materialsUsed: []
    };
  }

  private resetQualityForm(): void {
    this.newQualityCheck = {
      id: '',
      productName: '',
      batchNumber: '',
      testDate: new Date().toISOString().split('T')[0],
      inspector: '',
      status: 'Pending',
      defects: 0,
      notes: '',
      testResults: []
    };
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'status-delivered';
      case 'in progress': return 'status-pending';
      case 'pending': return 'status-pending';
      case 'passed': return 'status-delivered';
      case 'failed': return 'status-cancelled';
      case 'active': return 'status-delivered';
      case 'idle': return 'status-pending';
      case 'maintenance': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'status-cancelled';
      case 'high': return 'status-pending';
      case 'normal': return 'status-delivered';
      default: return 'status-delivered';
    }
  }
}

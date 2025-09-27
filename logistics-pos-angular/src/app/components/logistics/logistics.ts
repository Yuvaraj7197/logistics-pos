import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { Observable } from 'rxjs';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  type: string;
  capacity: number;
  status: string;
  driverId: string;
  driverName: string;
  location: string;
  fuelLevel: number;
  lastMaintenance: string;
  nextMaintenance: string;
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  phone: string;
  experience: number;
  status: string;
  vehicleId: string;
  rating: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
}

export interface Delivery {
  id: string;
  orderId: string;
  customerName: string;
  customerAddress: string;
  vehicleId: string;
  driverId: string;
  scheduledDate: string;
  status: string;
  priority: string;
  estimatedTime: string;
  actualTime: string;
  notes: string;
}

@Component({
  selector: 'app-logistics',
  imports: [CommonModule, FormsModule],
  templateUrl: './logistics.html',
  styleUrl: './logistics.scss'
})
export class LogisticsComponent implements OnInit {
  showScheduleDeliveryModal: boolean = false;
  showVehicleModal: boolean = false;
  showDriverModal: boolean = false;
  showRouteOptimizationModal: boolean = false;

  Math = Math; // Make Math available in template

  newDelivery: Delivery = {
    id: '',
    orderId: '',
    customerName: '',
    customerAddress: '',
    vehicleId: '',
    driverId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    status: 'Scheduled',
    priority: 'Normal',
    estimatedTime: '',
    actualTime: '',
    notes: ''
  };

  vehicles: Vehicle[] = [
    { id: 'VEH001', registrationNumber: 'MH-01-AB-1234', type: 'Truck', capacity: 5000, status: 'Available', driverId: 'DRV001', driverName: 'Rajesh Kumar', location: 'Warehouse A', fuelLevel: 85, lastMaintenance: '2024-08-15', nextMaintenance: '2024-11-15' },
    { id: 'VEH002', registrationNumber: 'MH-02-CD-5678', type: 'Van', capacity: 2000, status: 'On Route', driverId: 'DRV002', driverName: 'Suresh Patel', location: 'In Transit', fuelLevel: 60, lastMaintenance: '2024-09-01', nextMaintenance: '2024-12-01' },
    { id: 'VEH003', registrationNumber: 'MH-03-EF-9012', type: 'Truck', capacity: 3000, status: 'Maintenance', driverId: '', driverName: '', location: 'Service Center', fuelLevel: 0, lastMaintenance: '2024-09-20', nextMaintenance: '2024-09-25' },
    { id: 'VEH004', registrationNumber: 'MH-04-GH-3456', type: 'Van', capacity: 1500, status: 'Available', driverId: 'DRV003', driverName: 'Amit Singh', location: 'Warehouse B', fuelLevel: 90, lastMaintenance: '2024-09-10', nextMaintenance: '2024-12-10' }
  ];

  drivers: Driver[] = [
    { id: 'DRV001', name: 'Rajesh Kumar', licenseNumber: 'DL123456789', phone: '+91-9876543210', experience: 5, status: 'Available', vehicleId: 'VEH001', rating: 4.5, totalDeliveries: 150, onTimeDeliveries: 142 },
    { id: 'DRV002', name: 'Suresh Patel', licenseNumber: 'DL987654321', phone: '+91-9876543211', experience: 3, status: 'On Route', vehicleId: 'VEH002', rating: 4.2, totalDeliveries: 120, onTimeDeliveries: 110 },
    { id: 'DRV003', name: 'Amit Singh', licenseNumber: 'DL456789123', phone: '+91-9876543212', experience: 7, status: 'Available', vehicleId: 'VEH004', rating: 4.8, totalDeliveries: 200, onTimeDeliveries: 195 },
    { id: 'DRV004', name: 'Vikram Sharma', licenseNumber: 'DL789123456', phone: '+91-9876543213', experience: 2, status: 'Off Duty', vehicleId: '', rating: 4.0, totalDeliveries: 80, onTimeDeliveries: 75 }
  ];

  deliveries: Delivery[] = [
    { id: 'DEL001', orderId: 'ORD-001', customerName: 'John Smith', customerAddress: '123 Main St, Mumbai', vehicleId: 'VEH001', driverId: 'DRV001', scheduledDate: '2024-09-26', status: 'Scheduled', priority: 'High', estimatedTime: '10:00', actualTime: '', notes: 'Fragile items' },
    { id: 'DEL002', orderId: 'ORD-002', customerName: 'Sarah Johnson', customerAddress: '456 Park Ave, Delhi', vehicleId: 'VEH002', driverId: 'DRV002', scheduledDate: '2024-09-26', status: 'In Transit', priority: 'Normal', estimatedTime: '14:00', actualTime: '13:45', notes: 'Standard delivery' },
    { id: 'DEL003', orderId: 'ORD-003', customerName: 'Mike Wilson', customerAddress: '789 Oak St, Bangalore', vehicleId: 'VEH004', driverId: 'DRV003', scheduledDate: '2024-09-27', status: 'Scheduled', priority: 'Normal', estimatedTime: '09:00', actualTime: '', notes: 'Bulk order' },
    { id: 'DEL004', orderId: 'ORD-004', customerName: 'Emily Davis', customerAddress: '321 Pine St, Chennai', vehicleId: '', driverId: '', scheduledDate: '2024-09-27', status: 'Pending', priority: 'Low', estimatedTime: '16:00', actualTime: '', notes: 'Awaiting vehicle assignment' }
  ];

  // Filters
  statusFilter: string = '';
  priorityFilter: string = '';
  vehicleFilter: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.generateDeliveryId();
  }

  generateDeliveryId(): void {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newDelivery.id = `DEL${random}`;
  }

  showScheduleDelivery(): void {
    this.showScheduleDeliveryModal = true;
    this.generateDeliveryId();
  }

  hideScheduleDelivery(): void {
    this.showScheduleDeliveryModal = false;
    this.resetDeliveryForm();
  }

  showVehicleManagement(): void {
    this.showVehicleModal = true;
  }

  hideVehicleModal(): void {
    this.showVehicleModal = false;
  }

  showDriverManagement(): void {
    this.showDriverModal = true;
  }

  hideDriverModal(): void {
    this.showDriverModal = false;
  }

  showRouteOptimization(): void {
    this.showRouteOptimizationModal = true;
  }

  hideRouteOptimizationModal(): void {
    this.showRouteOptimizationModal = false;
  }

  scheduleDelivery(): void {
    if (this.isDeliveryValid()) {
      this.deliveries.push({...this.newDelivery});
      this.hideScheduleDelivery();
    }
  }

  updateDeliveryStatus(delivery: Delivery, status: string): void {
    delivery.status = status;
    if (status === 'Delivered') {
      delivery.actualTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
    }
  }

  assignVehicleAndDriver(delivery: Delivery, vehicleId: string, driverId: string): void {
    delivery.vehicleId = vehicleId;
    delivery.driverId = driverId;
    delivery.status = 'Scheduled';
  }

  getLogisticsStats(): { activeVehicles: number, onRoute: number, pendingDeliveries: number, onTimeRate: number } {
    const activeVehicles = this.vehicles.filter(v => v.status === 'Available' || v.status === 'On Route').length;
    const onRoute = this.vehicles.filter(v => v.status === 'On Route').length;
    const pendingDeliveries = this.deliveries.filter(d => d.status === 'Pending' || d.status === 'Scheduled').length;
    const totalDeliveries = this.deliveries.filter(d => d.status === 'Delivered' || d.status === 'In Transit').length;
    const onTimeDeliveries = this.deliveries.filter(d => d.status === 'Delivered' && d.actualTime <= d.estimatedTime).length;
    const onTimeRate = totalDeliveries > 0 ? Math.round((onTimeDeliveries / totalDeliveries) * 100) : 0;

    return { activeVehicles, onRoute, pendingDeliveries, onTimeRate };
  }

  getDriverStats(): { totalDrivers: number, availableDrivers: number, onRouteDrivers: number, avgRating: number } {
    const totalDrivers = this.drivers.length;
    const availableDrivers = this.drivers.filter(d => d.status === 'Available').length;
    const onRouteDrivers = this.drivers.filter(d => d.status === 'On Route').length;
    const avgRating = totalDrivers > 0 ? this.drivers.reduce((sum, d) => sum + d.rating, 0) / totalDrivers : 0;

    return { totalDrivers, availableDrivers, onRouteDrivers, avgRating };
  }

  getFilteredDeliveries(): Delivery[] {
    let filtered = this.deliveries;

    if (this.statusFilter) {
      filtered = filtered.filter(d => d.status === this.statusFilter);
    }

    if (this.priorityFilter) {
      filtered = filtered.filter(d => d.priority === this.priorityFilter);
    }

    if (this.vehicleFilter) {
      filtered = filtered.filter(d => d.vehicleId === this.vehicleFilter);
    }

    return filtered;
  }

  optimizeRoute(deliveries: Delivery[]): void {
    // Simple route optimization logic
    console.log('Optimizing route for deliveries:', deliveries);
  }

  exportDeliveries(): void {
    console.log('Exporting deliveries data...');
  }

  exportVehicles(): void {
    console.log('Exporting vehicles data...');
  }

  exportDrivers(): void {
    console.log('Exporting drivers data...');
  }

  private isDeliveryValid(): boolean {
    return !!(this.newDelivery.orderId && this.newDelivery.customerName && this.newDelivery.customerAddress);
  }

  private resetDeliveryForm(): void {
    this.newDelivery = {
      id: '',
      orderId: '',
      customerName: '',
      customerAddress: '',
      vehicleId: '',
      driverId: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'Scheduled',
      priority: 'Normal',
      estimatedTime: '',
      actualTime: '',
      notes: ''
    };
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'in transit': return 'status-pending';
      case 'scheduled': return 'status-pending';
      case 'pending': return 'status-pending';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'status-cancelled';
      case 'high': return 'status-pending';
      case 'normal': return 'status-delivered';
      case 'low': return 'status-delivered';
      default: return 'status-delivered';
    }
  }

  getVehicleStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'available': return 'status-delivered';
      case 'on route': return 'status-pending';
      case 'maintenance': return 'status-cancelled';
      case 'out of service': return 'status-cancelled';
      default: return 'status-pending';
    }
  }
}

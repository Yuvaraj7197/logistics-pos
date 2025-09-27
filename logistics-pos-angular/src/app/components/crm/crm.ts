import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data';
import { Observable } from 'rxjs';

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  segment: string;
  status: string;
  loyaltyTier: string;
  loyaltyPoints: number;
  totalSpent: number;
  lastOrderDate: string;
  satisfactionRating: number;
  notes: string;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description: string;
  pointsPerRupee: number;
  tiers: LoyaltyTier[];
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  discount: number;
  benefits: string[];
}

@Component({
  selector: 'app-crm',
  imports: [CommonModule, FormsModule],
  templateUrl: './crm.html',
  styleUrl: './crm.scss'
})
export class CrmComponent implements OnInit {
  showAddCustomerModal: boolean = false;
  showLoyaltyModal: boolean = false;
  showReminderModal: boolean = false;
  showAnalyticsModal: boolean = false;

  newCustomer: Customer = {
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    segment: 'Regular',
    status: 'Active',
    loyaltyTier: 'Basic',
    loyaltyPoints: 0,
    totalSpent: 0,
    lastOrderDate: '',
    satisfactionRating: 0,
    notes: ''
  };

  customers: Customer[] = [
    { id: 'CUST001', name: 'John Smith', email: 'john@email.com', phone: '+91-9876543210', address: '123 Main St, Mumbai', segment: 'Premium', status: 'Active', loyaltyTier: 'Gold', loyaltyPoints: 1250, totalSpent: 45000, lastOrderDate: '2024-09-25', satisfactionRating: 4.5, notes: 'VIP Customer' },
    { id: 'CUST002', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+91-9876543211', address: '456 Park Ave, Delhi', segment: 'Regular', status: 'Active', loyaltyTier: 'Silver', loyaltyPoints: 750, totalSpent: 25000, lastOrderDate: '2024-09-20', satisfactionRating: 4.2, notes: 'Regular buyer' },
    { id: 'CUST003', name: 'Mike Wilson', email: 'mike@email.com', phone: '+91-9876543212', address: '789 Oak St, Bangalore', segment: 'New', status: 'Active', loyaltyTier: 'Bronze', loyaltyPoints: 150, totalSpent: 5000, lastOrderDate: '2024-09-15', satisfactionRating: 4.0, notes: 'New customer' },
    { id: 'CUST004', name: 'Emily Davis', email: 'emily@email.com', phone: '+91-9876543213', address: '321 Pine St, Chennai', segment: 'Inactive', status: 'Inactive', loyaltyTier: 'Basic', loyaltyPoints: 50, totalSpent: 2000, lastOrderDate: '2024-08-10', satisfactionRating: 3.5, notes: 'Inactive for 2 months' }
  ];

  loyaltyProgram: LoyaltyProgram = {
    id: 'LOYALTY001',
    name: 'Premium Rewards',
    description: 'Earn points on every purchase',
    pointsPerRupee: 1,
    tiers: [
      { name: 'Gold', minPoints: 1000, discount: 15, benefits: ['Free shipping', 'Priority support', 'Exclusive offers'] },
      { name: 'Silver', minPoints: 500, discount: 10, benefits: ['Free shipping', 'Priority support'] },
      { name: 'Bronze', minPoints: 100, discount: 5, benefits: ['Free shipping'] },
      { name: 'Basic', minPoints: 0, discount: 0, benefits: [] }
    ]
  };

  // Filters
  segmentFilter: string = '';
  statusFilter: string = '';
  loyaltyTierFilter: string = '';

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.generateCustomerId();
  }

  generateCustomerId(): void {
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newCustomer.id = `CUST${random}`;
  }

  showAddCustomer(): void {
    this.showAddCustomerModal = true;
    this.generateCustomerId();
  }

  hideAddCustomer(): void {
    this.showAddCustomerModal = false;
    this.resetCustomerForm();
  }

  showLoyaltyProgram(): void {
    this.showLoyaltyModal = true;
  }

  hideLoyaltyModal(): void {
    this.showLoyaltyModal = false;
  }

  showCustomerReminder(): void {
    this.showReminderModal = true;
  }

  hideReminderModal(): void {
    this.showReminderModal = false;
  }

  showCustomerAnalytics(): void {
    this.showAnalyticsModal = true;
  }

  hideAnalyticsModal(): void {
    this.showAnalyticsModal = false;
  }

  addCustomer(): void {
    if (this.isCustomerValid()) {
      this.customers.push({...this.newCustomer});
      this.hideAddCustomer();
    }
  }

  updateCustomerStatus(customer: Customer, status: string): void {
    customer.status = status;
  }

  updateLoyaltyTier(customer: Customer): void {
    const tier = this.loyaltyProgram.tiers.find(t => t.minPoints <= customer.loyaltyPoints);
    if (tier) {
      customer.loyaltyTier = tier.name;
    }
  }

  getCustomerStats(): { totalCustomers: number, activeCustomers: number, premiumCustomers: number, avgSatisfaction: number } {
    const totalCustomers = this.customers.length;
    const activeCustomers = this.customers.filter(c => c.status === 'Active').length;
    const premiumCustomers = this.customers.filter(c => c.segment === 'Premium').length;
    const avgSatisfaction = totalCustomers > 0 ? this.customers.reduce((sum, c) => sum + c.satisfactionRating, 0) / totalCustomers : 0;

    return { totalCustomers, activeCustomers, premiumCustomers, avgSatisfaction };
  }

  getLoyaltyStats(): { goldMembers: number, silverMembers: number, bronzeMembers: number, totalPoints: number } {
    const goldMembers = this.customers.filter(c => c.loyaltyTier === 'Gold').length;
    const silverMembers = this.customers.filter(c => c.loyaltyTier === 'Silver').length;
    const bronzeMembers = this.customers.filter(c => c.loyaltyTier === 'Bronze').length;
    const totalPoints = this.customers.reduce((sum, c) => sum + c.loyaltyPoints, 0);

    return { goldMembers, silverMembers, bronzeMembers, totalPoints };
  }

  getFilteredCustomers(): Customer[] {
    let filtered = this.customers;

    if (this.segmentFilter) {
      filtered = filtered.filter(c => c.segment === this.segmentFilter);
    }

    if (this.statusFilter) {
      filtered = filtered.filter(c => c.status === this.statusFilter);
    }

    if (this.loyaltyTierFilter) {
      filtered = filtered.filter(c => c.loyaltyTier === this.loyaltyTierFilter);
    }

    return filtered;
  }

  exportCustomers(): void {
    // Implementation for exporting customers data
    console.log('Exporting customers data...');
  }

  private isCustomerValid(): boolean {
    return !!(this.newCustomer.name && this.newCustomer.email && this.newCustomer.phone);
  }

  private resetCustomerForm(): void {
    this.newCustomer = {
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      segment: 'Regular',
      status: 'Active',
      loyaltyTier: 'Basic',
      loyaltyPoints: 0,
      totalSpent: 0,
      lastOrderDate: '',
      satisfactionRating: 0,
      notes: ''
    };
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'status-delivered';
      case 'inactive': return 'status-cancelled';
      case 'vip': return 'status-pending';
      default: return 'status-pending';
    }
  }

  getSegmentClass(segment: string): string {
    switch (segment.toLowerCase()) {
      case 'premium': return 'status-delivered';
      case 'regular': return 'status-pending';
      case 'new': return 'status-pending';
      case 'inactive': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getTierClass(tier: string): string {
    switch (tier.toLowerCase()) {
      case 'gold': return 'status-delivered';
      case 'silver': return 'status-pending';
      case 'bronze': return 'status-pending';
      case 'basic': return 'status-cancelled';
      default: return 'status-pending';
    }
  }
}

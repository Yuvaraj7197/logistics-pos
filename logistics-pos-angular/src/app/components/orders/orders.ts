import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService, Order, ApprovalWorkflow, ReturnRefund, DeliveryTracking } from '../../services/data';
import { Observable, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-orders',
  imports: [CommonModule, FormsModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss'
})
export class OrdersComponent implements OnInit {
  orders$: Observable<Order[]>;
  orders: Order[] = [];
  showAddModal: boolean = false;
  showViewModal: boolean = false;
  showApprovalModal: boolean = false;
  showReturnModal: boolean = false;
  showDeliveryModal: boolean = false;
  selectedOrder: Order | null = null;
  newOrder: Order = {
    id: '',
    type: 'Customer',
    customer: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Pending',
    priority: 'Normal',
    total: 0,
    amount: 0,
    deliveryDate: '',
    paymentTerms: 'Net30',
    items: [],
    instructions: '',
    approvalWorkflow: undefined,
    returnRefund: undefined,
    deliveryTracking: undefined,
    sourceWarehouse: '',
    destinationWarehouse: '',
    productionOrderId: '',
    distributorId: '',
    internalDepartment: ''
  };
  newOrderItem = {
    product: '',
    quantity: 0,
    price: 0,
    total: 0
  };

  // Filters
  typeFilter: string = '';
  statusFilter: string = '';
  priorityFilter: string = '';

  constructor(private dataService: DataService) {
    this.orders$ = this.dataService.getOrders();
    this.orders$.subscribe(orders => {
      this.orders = orders;
    });
  }

  ngOnInit(): void {
    this.generateOrderId();
  }

  generateOrderId(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.newOrder.id = `ORD-${year}-${month}${day}-${random}`;
  }

  showAddOrderModal(): void {
    this.showAddModal = true;
    this.generateOrderId();
  }

  hideAddOrderModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  showOrderDetails(order: Order): void {
    this.selectedOrder = order;
    this.showViewModal = true;
  }

  hideViewModal(): void {
    this.showViewModal = false;
    this.selectedOrder = null;
  }

  addOrder(): void {
    if (this.isFormValid()) {
      this.dataService.addOrder({...this.newOrder});
      this.hideAddOrderModal();
    }
  }

  addOrderItem(): void {
    if (this.newOrderItem.product && this.newOrderItem.quantity > 0 && this.newOrderItem.price > 0) {
      this.newOrderItem.total = this.newOrderItem.quantity * this.newOrderItem.price;
      this.newOrder.items.push({...this.newOrderItem});
      this.newOrder.total += this.newOrderItem.total;
      this.resetOrderItem();
    }
  }

  removeOrderItem(index: number): void {
    const item = this.newOrder.items[index];
    this.newOrder.total -= item.total;
    this.newOrder.items.splice(index, 1);
  }

  updateOrderStatus(order: Order, status: string): void {
    const updatedOrder:any = {...order, status};
    this.dataService.updateOrder(updatedOrder);
  }

  deleteOrder(order: Order): void {
    if (confirm('Are you sure you want to delete this order?')) {
      // Note: You'll need to add deleteOrder method to DataService
      console.log('Delete order:', order.id);
    }
  }

  getFilteredOrders(): Observable<Order[]> {
    return this.orders$; // This would need filtering logic
  }

  getPendingOrdersCount(): number {
    return this.orders.filter(order => order.status === 'Pending').length;
  }

  getDeliveredOrdersCount(): number {
    return this.orders.filter(order => order.status === 'Delivered').length;
  }

  getTotalOrdersValue(): number {
    return this.orders.reduce((sum, order) => sum + order.total, 0);
  }

  getPendingApprovalCount(): number {
    return this.orders.filter(order => order.status === 'Pending').length;
  }

  getInProductionCount(): number {
    return this.orders.filter((order:any) => order.status === 'In Production').length;
  }

  getDispatchedCount(): number {
    return this.orders.filter(order => order.status === 'Dispatched').length;
  }

  getDeliveredCount(): number {
    return this.orders.filter(order => order.status === 'Delivered').length;
  }

  exportOrders(): void {
    const csvContent = "Order ID,Type,Customer,Amount,Status,Priority,Date,Delivery Date,Payment Terms\n" +
      this.orders.map(order =>
        `${order.id},${order.type},${order.customer},${order.amount},${order.status},${order.priority},${order.date},${order.deliveryDate},${order.paymentTerms}`
      ).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'orders_export.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  bulkApproveOrders(): void {
    const selectedOrders = this.getSelectedOrders();
    if (selectedOrders.length === 0) {
      alert('Please select orders to approve');
      return;
    }

    selectedOrders.forEach(order => {
      this.updateOrderStatus(order, 'Approved');
    });

    alert(`${selectedOrders.length} orders approved successfully`);
  }

  showReturnRefundModal(): void {
    this.showReturnModal = true;
  }

  hideReturnModal(): void {
    this.showReturnModal = false;
  }

  showApprovalWorkflow(): void {
    this.showApprovalModal = true;
  }

  hideApprovalModal(): void {
    this.showApprovalModal = false;
  }

  showDeliveryTracking(): void {
    this.showDeliveryModal = true;
  }

  hideDeliveryModal(): void {
    this.showDeliveryModal = false;
  }

  createApprovalWorkflow(order: Order): void {
    const workflow: ApprovalWorkflow = {
      id: `WF-${order.id}`,
      orderId: order.id,
      approverId: 'APPROVER001',
      approverName: 'Manager',
      approvalLevel: 1,
      status: 'Pending',
      comments: '',
      approvalDate: '',
      requiredApprovals: 2,
      completedApprovals: 0
    };
    order.approvalWorkflow = workflow;
    this.dataService.updateOrder(order);
  }

  approveOrder(order: Order): void {
    if (order.approvalWorkflow) {
      order.approvalWorkflow.completedApprovals++;
      if (order.approvalWorkflow.completedApprovals >= order.approvalWorkflow.requiredApprovals) {
        order.approvalWorkflow.status = 'Approved';
        order.status = 'Approved';
        order.approvalWorkflow.approvalDate = new Date().toISOString();
      }
      this.dataService.updateOrder(order);
    }
  }

  rejectOrder(order: Order, reason: string): void {
    if (order.approvalWorkflow) {
      order.approvalWorkflow.status = 'Rejected';
      order.approvalWorkflow.comments = reason;
      order.status = 'Cancelled';
      this.dataService.updateOrder(order);
    }
  }

  processReturn(order: Order, returnData: any): void {
    const returnRefund: ReturnRefund = {
      id: `RET-${order.id}`,
      orderId: order.id,
      returnDate: new Date().toISOString().split('T')[0],
      reason: returnData.reason,
      items: returnData.items,
      refundAmount: returnData.refundAmount,
      refundMethod: returnData.refundMethod,
      status: 'Pending',
      processedBy: '',
      processedDate: ''
    };
    order.returnRefund = returnRefund;
    order.status = 'Returned';
    this.dataService.updateOrder(order);
  }

  updateDeliveryTracking(order: Order, trackingData: any): void {
    const deliveryTracking: DeliveryTracking = {
      orderId: order.id,
      trackingNumber: trackingData.trackingNumber,
      carrier: trackingData.carrier,
      estimatedDelivery: trackingData.estimatedDelivery,
      actualDelivery: trackingData.actualDelivery,
      deliveryProof: trackingData.deliveryProof,
      deliveryNotes: trackingData.deliveryNotes,
      status: trackingData.status
    };
    order.deliveryTracking = deliveryTracking;
    this.dataService.updateOrder(order);
  }

  getOrderTypes(): string[] {
    return ['Customer', 'Distributor', 'Internal', 'Production'];
  }

  getOrderStatuses(): string[] {
    return ['Pending', 'Approved', 'In-Production', 'Dispatched', 'Delivered', 'Cancelled', 'Returned'];
  }

  getOrderPriorities(): string[] {
    return ['Low', 'Normal', 'High', 'Urgent'];
  }

  getPaymentTerms(): string[] {
    return ['COD', 'Net15', 'Net30', 'Net45', 'Advance', 'Credit'];
  }

  getWarehouses(): string[] {
    return ['Warehouse 1', 'Warehouse 2', 'Warehouse 3'];
  }

  getDepartments(): string[] {
    return ['Production', 'Sales', 'Logistics', 'Finance', 'HR'];
  }

  getDistributors(): string[] {
    return ['ABC Distributors', 'XYZ Retail', 'DEF Wholesale'];
  }

  private getSelectedOrders(): Order[] {
    // TODO: Implement checkbox selection logic
    return [];
  }

  private isFormValid(): boolean {
    return !!(this.newOrder.customer && this.newOrder.items.length > 0);
  }

  private resetForm(): void {
    this.newOrder = {
      id: '',
      type: 'Customer',
      customer: '',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      priority: 'Normal',
      total: 0,
      amount: 0,
      deliveryDate: '',
      paymentTerms: 'Net30',
      items: [],
      instructions: '',
      approvalWorkflow: undefined,
      returnRefund: undefined,
      deliveryTracking: undefined,
      sourceWarehouse: '',
      destinationWarehouse: '',
      productionOrderId: '',
      distributorId: '',
      internalDepartment: ''
    };
    this.resetOrderItem();
  }

  private resetOrderItem(): void {
    this.newOrderItem = {
      product: '',
      quantity: 0,
      price: 0,
      total: 0
    };
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'delivered': return 'status-delivered';
      case 'dispatched': return 'status-delivered';
      case 'in production': return 'status-pending';
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
      default: return 'status-delivered';
    }
  }
}

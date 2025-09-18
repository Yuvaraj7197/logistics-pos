// Orders Management JavaScript
const ORDERS_STORAGE_KEY = 'logosic_orders_v1';
const ORDER_STATUS = getConfig('business.order.statuses', ['Pending', 'Completed', 'Shipped', 'Cancelled']);

// Initialize storage manager
const orderStorage = createStorageManager(ORDERS_STORAGE_KEY, []);

// Storage functions (using common utilities)
function loadOrders() {
  return orderStorage.load();
}

function saveOrders(orders) {
  return orderStorage.save(orders);
}

// Utility functions (using common utilities)
function orderBadgeClass(status) {
  return getStatusBadgeClass(status, 'order');
}

function generateOrderId() {
  return generateId('ORD', loadOrders());
}

// Main render function
function renderOrders() {
  const tbody = document.getElementById('ordersTbody');
  if (!tbody) return;
  
  const orders = loadOrders();
  
  // Apply filters
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  const dateStart = document.getElementById('orderDateStart')?.value || '';
  const dateEnd = document.getElementById('orderDateEnd')?.value || '';
  const searchTerm = document.getElementById('searchOrders')?.value?.toLowerCase() || '';
  const sortBy = document.getElementById('sortOrders')?.value || 'date-desc';
  
  let filtered = orders.filter(order => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (dateStart && order.date < dateStart) return false;
    if (dateEnd && order.date > dateEnd) return false;
    if (searchTerm) {
      const searchText = `${order.id} ${order.customer} ${order.items}`.toLowerCase();
      if (!searchText.includes(searchTerm)) return false;
    }
    return true;
  });
  
  // Sort orders
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'amount-desc':
        return b.totalAmount - a.totalAmount;
      case 'amount-asc':
        return a.totalAmount - b.totalAmount;
      case 'customer':
        return a.customer.localeCompare(b.customer);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });
  
  // Initialize or update pagination
  if (!window.paginationInstances['ordersContainer']) {
    createPagination('ordersContainer');
  }
  
  const pagination = window.paginationInstances['ordersContainer'];
  pagination.applyFilters(filtered);
  
  // Get current page data
  const currentPageData = pagination.getCurrentPageData();
  
  // Render table
  if (currentPageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="padding: 2rem; color: var(--gray-500);">
          <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No orders found
        </td>
      </tr>
    `;
    updateOrderStats();
    return;
  }
  
  tbody.innerHTML = currentPageData.map(order => `
    <tr>
      <td>
        <strong>${order.id}</strong>
        ${order.orderType === 'DC' ? '<br><small style="color: var(--success-600); font-weight: 500;">DC Order</small>' : ''}
      </td>
      <td>${order.customer}</td>
      <td>
        ${order.items}
        ${order.orderType === 'DC' && order.dcNumber ? `<br><small style="color: var(--gray-600);">DC: ${order.dcNumber}</small>` : ''}
      </td>
      <td>${formatINR(order.totalAmount)}</td>
      <td>
        <span class="${orderBadgeClass(order.status)}">${order.status}</span>
        ${order.orderType === 'DC' && order.materialStatus ? `<br><small style="color: var(--info-600);">Material: ${order.materialStatus}</small>` : ''}
      </td>
      <td>${formatDate(order.date)}</td>
      <td>
        ${createTableActionsDropdown(order.id, [
          { label: 'View Details', icon: 'pi pi-eye', onclick: `viewOrder('${order.id}')` },
          { label: 'Edit Order', icon: 'pi pi-pencil', onclick: `editOrder('${order.id}')` },
          { label: 'Duplicate', icon: 'pi pi-copy', onclick: `duplicateOrder('${order.id}')` },
          { label: 'Print', icon: 'pi pi-print', onclick: `printOrder('${order.id}')` },
          { label: 'Export', icon: 'pi pi-download', onclick: `exportOrder('${order.id}')` },
          { label: 'Delete', icon: 'pi pi-trash', onclick: `deleteOrder('${order.id}')`, class: 'danger' }
        ])}
      </td>
    </tr>
  `).join('');
  
  updateOrderStats();
}

function updateOrderStats() {
  const orders = loadOrders();
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const completedToday = orders.filter(o => o.status === 'Completed' && o.date === new Date().toISOString().slice(0, 10)).length;
  const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = orders.length > 0 ? totalValue / orders.length : 0;
  
  // Update stats display if elements exist
  const pendingEl = document.getElementById('pendingOrdersCount');
  const completedEl = document.getElementById('completedOrdersCount');
  const totalValueEl = document.getElementById('totalOrdersValue');
  const avgValueEl = document.getElementById('avgOrderValue');
  
  if (pendingEl) pendingEl.textContent = pendingOrders;
  if (completedEl) completedEl.textContent = completedToday;
  if (totalValueEl) totalValueEl.textContent = formatINR(totalValue);
  if (avgValueEl) avgValueEl.textContent = formatINR(avgOrderValue);
}

// Order management functions
function receiveOrder() {
  const body = `
    <div class="form-section">
      <h4>Order Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Name *</label>
          <input id="orderCustomer" type="text" placeholder="Enter customer name" required />
        </div>
        <div class="form-group col-6">
          <label>Contact Number</label>
          <input id="orderContact" type="tel" placeholder="Enter contact number" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Order Date *</label>
          <input id="orderDate" type="date" required />
        </div>
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="orderStatus" required>
            <option value="">Select status...</option>
            ${ORDER_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Items/Description *</label>
        <textarea id="orderItems" placeholder="Enter items and quantities" rows="3" required></textarea>
      </div>
      <div class="form-group col-12">
        <label>Total Amount (INR) *</label>
        <input id="orderAmount" type="number" min="0" step="0.01" placeholder="Enter total amount" required />
      </div>
    </div>

    <div class="form-section">
      <h4>Delivery Information</h4>
      <div class="form-group col-12">
        <label>Delivery Address</label>
        <textarea id="orderAddress" placeholder="Enter delivery address" rows="2"></textarea>
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="orderNotes" placeholder="Enter any notes" rows="2"></textarea>
      </div>
    </div>
  `;
  
  openModal('Receive New Order', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Create Order', type: 'primary', action: () => {
      const customer = document.getElementById('orderCustomer').value.trim();
      const items = document.getElementById('orderItems').value.trim();
      const amount = parseFloat(document.getElementById('orderAmount').value);
      const status = document.getElementById('orderStatus').value;
      const date = document.getElementById('orderDate').value;
      const address = document.getElementById('orderAddress').value.trim();
      const contact = document.getElementById('orderContact').value.trim();
      const notes = document.getElementById('orderNotes').value.trim();
      
      if (!customer || !items || isNaN(amount) || !status || !date || amount <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      const orders = loadOrders();
      const newOrder = {
        id: generateOrderId(),
        customer,
        items,
        totalAmount: amount,
        status,
        date,
        address: address || 'N/A',
        contact: contact || 'N/A',
        notes: notes || 'N/A',
        createdAt: new Date().toISOString()
      };
      
      orders.unshift(newOrder);
      saveOrders(orders);
      closeModal();
      renderOrders();
      updateDashboardStats(); // Update dashboard stats
      showToast('Order created successfully', 'success');
    }}
  ]);
  
  // Set default date to today
  setTimeout(() => {
    const dateInput = document.getElementById('orderDate');
    if (dateInput) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
  }, 100);
}

function viewOrder(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const isDCOrder = order.orderType === 'DC';
  
  const html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Order ID</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--brand-600);">
          ${order.id}
          ${isDCOrder ? '<span style="color: var(--success-600); font-size: 0.8rem; margin-left: 0.5rem;">(DC Order)</span>' : ''}
        </div>
      </div>
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Status</div>
        <div><span class="${orderBadgeClass(order.status)}">${order.status}</span></div>
      </div>
    </div>
    
    ${isDCOrder ? `
      <div style="background: var(--success-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid var(--success-500);">
        <div style="font-weight: 600; color: var(--success-700); margin-bottom: 0.5rem;">DC Order Information</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
          <div><strong>DC Number:</strong> ${order.dcNumber || 'N/A'}</div>
          <div><strong>Material Status:</strong> <span style="color: var(--info-600); font-weight: 500;">${order.materialStatus || 'N/A'}</span></div>
          <div><strong>Received Date:</strong> ${order.receivedDate ? formatDate(order.receivedDate) : 'N/A'}</div>
          <div><strong>Quality Status:</strong> <span style="color: var(--warning-600); font-weight: 500;">${order.qualityStatus || 'N/A'}</span></div>
        </div>
      </div>
    ` : ''}
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">${isDCOrder ? 'Customer & Order Details' : 'Order Details'}</div>
      <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">${order.customer}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
        <div><strong>Total Amount:</strong> ${formatINR(order.totalAmount)}</div>
        <div><strong>Order Date:</strong> ${formatDate(order.date)}</div>
        <div><strong>Contact:</strong> ${order.contact}</div>
        <div><strong>Created:</strong> ${formatDate(order.createdAt)}</div>
      </div>
    </div>
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">${isDCOrder ? 'Material Description' : 'Items'}</div>
      <div style="font-size: 0.9rem;">${order.items}</div>
    </div>
    
    ${order.address !== 'N/A' ? `
      <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Delivery Address</div>
        <div style="font-size: 0.9rem;">${order.address}</div>
      </div>
    ` : ''}
    
    ${order.notes !== 'N/A' ? `
      <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">${isDCOrder ? 'Material Notes' : 'Notes'}</div>
        <div style="font-size: 0.9rem;">${order.notes}</div>
      </div>
    ` : ''}
  `;
  
  openModal(isDCOrder ? 'DC Order Details' : 'Order Details', html, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Edit', type: 'primary', action: () => { closeModal(); editOrder(orderId); } }
  ], 'large');
}

function editOrder(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const body = `
    <div class="form-section">
      <h4>Order Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Name *</label>
          <input id="editOrderCustomer" type="text" value="${order.customer}" required />
        </div>
        <div class="form-group col-6">
          <label>Contact Number</label>
          <input id="editOrderContact" type="tel" value="${order.contact || ''}" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Order Date *</label>
          <input id="editOrderDate" type="date" value="${order.date}" required />
        </div>
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="editOrderStatus" required>
            <option value="">Select status...</option>
            ${ORDER_STATUS.map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Items/Description *</label>
        <textarea id="editOrderItems" rows="3" required>${order.items}</textarea>
      </div>
      <div class="form-group col-12">
        <label>Total Amount (INR) *</label>
        <input id="editOrderAmount" type="number" min="0" step="0.01" value="${order.totalAmount}" required />
      </div>
    </div>

    <div class="form-section">
      <h4>Delivery Information</h4>
      <div class="form-group col-12">
        <label>Delivery Address</label>
        <textarea id="editOrderAddress" rows="2">${order.address || ''}</textarea>
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="editOrderNotes" rows="2">${order.notes || ''}</textarea>
      </div>
    </div>
  `;
  
  openModal('Edit Order', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Update Order', type: 'primary', action: () => {
      const customer = document.getElementById('editOrderCustomer').value.trim();
      const items = document.getElementById('editOrderItems').value.trim();
      const amount = parseFloat(document.getElementById('editOrderAmount').value);
      const status = document.getElementById('editOrderStatus').value;
      const date = document.getElementById('editOrderDate').value;
      const address = document.getElementById('editOrderAddress').value.trim();
      const contact = document.getElementById('editOrderContact').value.trim();
      const notes = document.getElementById('editOrderNotes').value.trim();
      
      if (!customer || !items || isNaN(amount) || !status || !date || amount <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) return;
      
      orders[orderIndex] = {
        ...orders[orderIndex],
        customer,
        items,
        totalAmount: amount,
        status,
        date,
        address: address || 'N/A',
        contact: contact || 'N/A',
        notes: notes || 'N/A',
        updatedAt: new Date().toISOString()
      };
      
      saveOrders(orders);
      closeModal();
      renderOrders();
      updateDashboardStats(); // Update dashboard stats
      showToast('Order updated successfully', 'success');
    }}
  ]);
}

function deleteOrder(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  confirmModal('Delete Order', `Are you sure you want to delete this order: ${order.customer} (${orderId})?`, () => {
    const filtered = orders.filter(o => o.id !== orderId);
    saveOrders(filtered);
    renderOrders();
    showToast('Order deleted successfully', 'success');
  });
}

// DC Order management function
function receiveDCOrder() {
  const body = `
    <div class="form-section">
      <h4>DC Order Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Name *</label>
          <input id="dcOrderCustomer" type="text" placeholder="Enter customer name" required />
        </div>
        <div class="form-group col-6">
          <label>DC Number *</label>
          <input id="dcOrderNumber" type="text" placeholder="Enter DC number" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>DC Date *</label>
          <input id="dcOrderDate" type="date" required />
        </div>
        <div class="form-group col-6">
          <label>Received Date *</label>
          <input id="dcReceivedDate" type="date" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Material Status *</label>
          <select id="dcOrderMaterialStatus" required>
            <option value="">Select material status...</option>
            <option value="Received">Material Received</option>
            <option value="Partial">Partial Material</option>
            <option value="Pending">Material Pending</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>Quality Check Status</label>
          <select id="dcQualityStatus">
            <option value="Pending">Pending</option>
            <option value="Passed">Passed</option>
            <option value="Failed">Failed</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Material Description *</label>
        <textarea id="dcOrderMaterial" placeholder="Enter material details and quantities" rows="3" required></textarea>
      </div>
      <div class="form-group col-12">
        <label>Total Amount (INR) *</label>
        <input id="dcOrderAmount" type="number" min="0" step="0.01" placeholder="Enter total amount" required />
      </div>
    </div>

    <div class="form-section">
      <h4>Contact & Delivery Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Contact Number</label>
          <input id="dcOrderContact" type="tel" placeholder="Enter contact number" />
        </div>
        <div class="form-group col-6">
          <label>Delivery Address</label>
          <textarea id="dcOrderAddress" placeholder="Enter delivery address" rows="2"></textarea>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Material Notes</label>
        <textarea id="dcOrderNotes" placeholder="Enter any material-related notes" rows="2"></textarea>
      </div>
    </div>
  `;
  
  openModal('Receive DC Order', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Create DC Order', type: 'primary', action: () => {
      const customer = document.getElementById('dcOrderCustomer').value.trim();
      const dcNumber = document.getElementById('dcOrderNumber').value.trim();
      const material = document.getElementById('dcOrderMaterial').value.trim();
      const materialStatus = document.getElementById('dcOrderMaterialStatus').value;
      const amount = parseFloat(document.getElementById('dcOrderAmount').value);
      const dcDate = document.getElementById('dcOrderDate').value;
      const receivedDate = document.getElementById('dcReceivedDate').value;
      const address = document.getElementById('dcOrderAddress').value.trim();
      const contact = document.getElementById('dcOrderContact').value.trim();
      const notes = document.getElementById('dcOrderNotes').value.trim();
      const qualityStatus = document.getElementById('dcQualityStatus').value;
      
      if (!customer || !dcNumber || !material || !materialStatus || isNaN(amount) || !dcDate || !receivedDate || amount <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      // Only allow creation if material is received or partial
      if (materialStatus === 'Pending') {
        showToast('DC Order can only be created when material is received or partially received', 'error');
        return;
      }
      
      const orders = loadOrders();
      const newOrder = {
        id: generateOrderId(),
        customer,
        items: material,
        totalAmount: amount,
        status: 'Completed', // DC orders are typically completed when received
        date: dcDate,
        address: address || 'N/A',
        contact: contact || 'N/A',
        notes: notes || 'N/A',
        orderType: 'DC',
        dcNumber: dcNumber,
        materialStatus: materialStatus,
        receivedDate: receivedDate,
        qualityStatus: qualityStatus,
        createdAt: new Date().toISOString()
      };
      
      orders.unshift(newOrder);
      saveOrders(orders);
      closeModal();
      renderOrders();
      updateDashboardStats(); // Update dashboard stats
      showToast('DC Order created successfully', 'success');
    }}
  ]);
  
  // Set default dates
  setTimeout(() => {
    const today = new Date().toISOString().slice(0, 10);
    const dcDateInput = document.getElementById('dcOrderDate');
    const receivedDateInput = document.getElementById('dcReceivedDate');
    if (dcDateInput) dcDateInput.value = today;
    if (receivedDateInput) receivedDateInput.value = today;
  }, 100);
}

// Additional order actions for dropdown
function duplicateOrder(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const newOrder = {
    ...order,
    id: generateOrderId(),
    status: 'Pending',
    date: new Date().toISOString().slice(0, 10),
    createdAt: new Date().toISOString()
  };
  
  orders.unshift(newOrder);
  saveOrders(orders);
  renderOrders();
  showToast('Order duplicated successfully', 'success');
}

function printOrder(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const headers = ['Field', 'Value'];
  const data = [
    { Field: 'Order ID', Value: order.id },
    { Field: 'Customer', Value: order.customer },
    { Field: 'Items', Value: order.items },
    { Field: 'Amount', Value: formatINR(order.totalAmount) },
    { Field: 'Status', Value: order.status },
    { Field: 'Date', Value: formatDate(order.date) }
  ];
  
  printData(data, `Order Details - ${order.id}`, headers);
}

function exportOrder(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const data = [order];
  const headers = ['id', 'customer', 'items', 'totalAmount', 'status', 'date'];
  
  exportToCSV(data, `order-${order.id}`, headers);
}

// =============================================================================
// DATA MANAGEMENT
// =============================================================================

/**
 * Clear all order data with confirmation
 */
function clearAllOrders() {
  confirmAction('Are you sure you want to clear ALL order data? This action cannot be undone.', () => {
    try {
      // Clear from storage
      orderStorage.clear();
      
      // Re-render the table to show empty state
      renderOrders();
      
      // Update statistics
      updateOrderStats();
      
      showToast('All order data cleared successfully', 'success');
      return true;
    } catch (error) {
      handleError(error, 'Clear orders');
      return false;
    }
  });
}

/**
 * Reset order data to empty state
 */
function resetOrderData() {
  // Clear storage
  orderStorage.clear();
  
  // Initialize with empty array
  orderStorage.save([]);
  
  // Re-render
  renderOrders();
  updateOrderStats();
  
  console.log('Order data reset to empty state');
}

// =============================================================================
// FILTER FUNCTIONS
// =============================================================================

// Filter functions
function applyFilters() {
  renderOrders();
}

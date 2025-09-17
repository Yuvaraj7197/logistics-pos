// Orders Management JavaScript
const ORDERS_STORAGE_KEY = 'logosic_orders_v1';

// Sample orders data
const ORDERS_DATA = [
  { id: 'ORD-001', customer: 'ABC Company', items: 'Steel Rods (50kg), Cement Bags (20)', totalAmount: 45000, status: 'Completed', date: '2025-09-01' },
  { id: 'ORD-002', customer: 'XYZ Industries', items: 'Aluminum Sheets (100sqft)', totalAmount: 25000, status: 'Pending', date: '2025-09-02' },
  { id: 'ORD-003', customer: 'DEF Construction', items: 'Concrete Mix (5 tons)', totalAmount: 15000, status: 'Shipped', date: '2025-09-03' },
  { id: 'ORD-004', customer: 'GHI Manufacturing', items: 'Steel Beams (10 pieces)', totalAmount: 75000, status: 'Completed', date: '2025-09-04' },
  { id: 'ORD-005', customer: 'JKL Enterprises', items: 'Sand (2 tons), Gravel (1 ton)', totalAmount: 12000, status: 'Cancelled', date: '2025-09-05' }
];

const ORDER_STATUS = ['Pending', 'Completed', 'Shipped', 'Cancelled'];

// Storage functions
function loadOrders() {
  try {
    const stored = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading orders:', e);
  }
  return ORDERS_DATA;
}

function saveOrders(orders) {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders:', e);
  }
}

// Utility functions
function orderBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'completed') return 'status-badge status-completed';
  if (s === 'shipped') return 'status-badge status-shipped';
  if (s === 'pending') return 'status-badge status-pending';
  if (s === 'cancelled') return 'status-badge status-cancelled';
  return 'status-badge status-pending';
}

function generateOrderId() {
  const orders = loadOrders();
  let max = 0;
  orders.forEach(order => {
    const n = parseInt((order.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(3, '0');
  return `ORD-${next}`;
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
    createPagination('ordersContainer', 10);
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
      <td><strong>${order.id}</strong></td>
      <td>${order.customer}</td>
      <td>${order.items}</td>
      <td>${formatINR(order.totalAmount)}</td>
      <td><span class="${orderBadgeClass(order.status)}">${order.status}</span></td>
      <td>${formatDate(order.date)}</td>
      <td>
        <div class="btn-group">
          <button class="btn btn-primary btn-sm" onclick="viewOrder('${order.id}')">
            <i class="pi pi-eye"></i> View
          </button>
          <button class="btn btn-secondary btn-sm" onclick="editOrder('${order.id}')">
            <i class="pi pi-pencil"></i> Edit
          </button>
          <button class="btn btn-secondary btn-sm" onclick="deleteOrder('${order.id}')">
            <i class="pi pi-trash"></i> Delete
          </button>
        </div>
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
    <div class="form-group">
      <label>Customer Name *</label>
      <input id="orderCustomer" type="text" placeholder="Enter customer name" required />
    </div>
    <div class="form-group">
      <label>Items/Description *</label>
      <textarea id="orderItems" placeholder="Enter items and quantities" rows="3" required></textarea>
    </div>
    <div class="form-group">
      <label>Total Amount (INR) *</label>
      <input id="orderAmount" type="number" min="0" step="0.01" placeholder="Enter total amount" required />
    </div>
    <div class="form-group">
      <label>Status *</label>
      <select id="orderStatus" required>
        <option value="">Select status...</option>
        ${ORDER_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Order Date *</label>
      <input id="orderDate" type="date" required />
    </div>
    <div class="form-group">
      <label>Delivery Address</label>
      <textarea id="orderAddress" placeholder="Enter delivery address" rows="2"></textarea>
    </div>
    <div class="form-group">
      <label>Contact Number</label>
      <input id="orderContact" type="tel" placeholder="Enter contact number" />
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="orderNotes" placeholder="Enter any notes" rows="2"></textarea>
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
  
  const html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Order ID</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--brand-600);">${order.id}</div>
      </div>
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Status</div>
        <div><span class="${orderBadgeClass(order.status)}">${order.status}</span></div>
      </div>
    </div>
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Order Details</div>
      <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">${order.customer}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
        <div><strong>Total Amount:</strong> ${formatINR(order.totalAmount)}</div>
        <div><strong>Order Date:</strong> ${formatDate(order.date)}</div>
        <div><strong>Contact:</strong> ${order.contact}</div>
        <div><strong>Created:</strong> ${formatDate(order.createdAt)}</div>
      </div>
    </div>
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Items</div>
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
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Notes</div>
        <div style="font-size: 0.9rem;">${order.notes}</div>
      </div>
    ` : ''}
  `;
  
  openModal('Order Details', html, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Edit', type: 'primary', action: () => { closeModal(); editOrder(orderId); } }
  ], 'large');
}

function editOrder(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const body = `
    <div class="form-group">
      <label>Customer Name *</label>
      <input id="editOrderCustomer" type="text" value="${order.customer}" required />
    </div>
    <div class="form-group">
      <label>Items/Description *</label>
      <textarea id="editOrderItems" rows="3" required>${order.items}</textarea>
    </div>
    <div class="form-group">
      <label>Total Amount (INR) *</label>
      <input id="editOrderAmount" type="number" min="0" step="0.01" value="${order.totalAmount}" required />
    </div>
    <div class="form-group">
      <label>Status *</label>
      <select id="editOrderStatus" required>
        <option value="">Select status...</option>
        ${ORDER_STATUS.map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Order Date *</label>
      <input id="editOrderDate" type="date" value="${order.date}" required />
    </div>
    <div class="form-group">
      <label>Delivery Address</label>
      <textarea id="editOrderAddress" rows="2">${order.address || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Contact Number</label>
      <input id="editOrderContact" type="tel" value="${order.contact || ''}" />
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="editOrderNotes" rows="2">${order.notes || ''}</textarea>
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

// Filter functions
function applyFilters() {
  renderOrders();
}

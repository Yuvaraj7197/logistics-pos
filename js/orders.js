// Orders Management JavaScript
const ORDERS_STORAGE_KEY = 'logosic_orders_v1';
const ORDER_STATUS = getConfig('business.order.statuses', ['Pending', 'In Progress', 'Completed', 'Shipped', 'Delivered', 'Cancelled', 'On Hold']);
const ORDER_TYPES = ['Sales', 'DC', 'Bulk'];
const ORDER_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const MATERIAL_TYPES = [
  'Electronics',
  'Furniture',
  'Medical Equipment',
  'Industrial Parts',
  'Automotive Parts',
  'Textiles',
  'Food & Beverage',
  'Construction Materials',
  'Office Supplies',
  'Machinery',
  'Chemicals',
  'Other'
];

const PREDEFINED_ITEMS = [
  // Electronics
  { name: 'Laptop Computer', materialType: 'Electronics', description: 'High-performance laptop with 16GB RAM, 512GB SSD', defaultRate: 75000 },
  { name: 'Desktop Monitor', materialType: 'Electronics', description: '27-inch 4K LED monitor with HDMI and USB ports', defaultRate: 25000 },
  { name: 'Wireless Keyboard', materialType: 'Electronics', description: 'Mechanical wireless keyboard with RGB lighting', defaultRate: 3500 },
  { name: 'Computer Mouse', materialType: 'Electronics', description: 'Wireless optical mouse with ergonomic design', defaultRate: 1500 },
  { name: 'USB Cable', materialType: 'Electronics', description: 'High-speed USB-C to USB-A cable 2m length', defaultRate: 299 },
  
  // Furniture
  { name: 'Office Chair', materialType: 'Furniture', description: 'Ergonomic office chair with lumbar support', defaultRate: 12000 },
  { name: 'Office Desk', materialType: 'Furniture', description: 'Adjustable height office desk with drawers', defaultRate: 18000 },
  { name: 'Bookshelf', materialType: 'Furniture', description: '5-tier wooden bookshelf with adjustable shelves', defaultRate: 8500 },
  { name: 'Filing Cabinet', materialType: 'Furniture', description: '2-drawer metal filing cabinet with lock', defaultRate: 6500 },
  { name: 'Meeting Table', materialType: 'Furniture', description: 'Large conference table for 8 people', defaultRate: 35000 },
  
  // Medical Equipment
  { name: 'Blood Pressure Monitor', materialType: 'Medical Equipment', description: 'Digital automatic blood pressure monitor', defaultRate: 4500 },
  { name: 'Stethoscope', materialType: 'Medical Equipment', description: 'Professional grade stethoscope with dual head', defaultRate: 3500 },
  { name: 'Thermometer', materialType: 'Medical Equipment', description: 'Digital infrared thermometer for body temperature', defaultRate: 1200 },
  { name: 'First Aid Kit', materialType: 'Medical Equipment', description: 'Complete first aid kit with bandages and medicines', defaultRate: 2500 },
  { name: 'Medical Scale', materialType: 'Medical Equipment', description: 'Digital weighing scale with BMI calculation', defaultRate: 5500 },
  
  // Industrial Parts
  { name: 'Steel Bolts Set', materialType: 'Industrial Parts', description: 'Set of 100 stainless steel bolts M8x20mm', defaultRate: 850 },
  { name: 'Hydraulic Pump', materialType: 'Industrial Parts', description: 'High-pressure hydraulic pump 10HP motor', defaultRate: 45000 },
  { name: 'Conveyor Belt', materialType: 'Industrial Parts', description: 'Industrial conveyor belt 2m x 50cm rubber', defaultRate: 15000 },
  { name: 'Safety Helmet', materialType: 'Industrial Parts', description: 'ANSI certified hard hat with chin strap', defaultRate: 1200 },
  { name: 'Work Gloves', materialType: 'Industrial Parts', description: 'Cut-resistant work gloves pair', defaultRate: 450 },
  
  // Automotive Parts
  { name: 'Car Battery', materialType: 'Automotive Parts', description: '12V 60Ah car battery with 3-year warranty', defaultRate: 8500 },
  { name: 'Engine Oil', materialType: 'Automotive Parts', description: 'Synthetic engine oil 5W-30 grade 4L', defaultRate: 2500 },
  { name: 'Brake Pads', materialType: 'Automotive Parts', description: 'Ceramic brake pads front set', defaultRate: 3500 },
  { name: 'Air Filter', materialType: 'Automotive Parts', description: 'High-flow air filter for engine', defaultRate: 1200 },
  { name: 'Spark Plugs Set', materialType: 'Automotive Parts', description: 'Set of 4 iridium spark plugs', defaultRate: 1800 },
  
  // Textiles
  { name: 'Cotton T-Shirt', materialType: 'Textiles', description: '100% cotton t-shirt various sizes available', defaultRate: 450 },
  { name: 'Denim Jeans', materialType: 'Textiles', description: 'Premium denim jeans with stretch', defaultRate: 1800 },
  { name: 'Winter Jacket', materialType: 'Textiles', description: 'Insulated winter jacket with hood', defaultRate: 3500 },
  { name: 'Cotton Sheets Set', materialType: 'Textiles', description: 'King size cotton bedsheet set', defaultRate: 2200 },
  { name: 'Towels Set', materialType: 'Textiles', description: 'Set of 4 cotton bath towels', defaultRate: 1200 },
  
  // Food & Beverage
  { name: 'Rice Bag', materialType: 'Food & Beverage', description: 'Premium basmati rice 5kg bag', defaultRate: 850 },
  { name: 'Cooking Oil', materialType: 'Food & Beverage', description: 'Pure sunflower oil 1L bottle', defaultRate: 180 },
  { name: 'Spice Set', materialType: 'Food & Beverage', description: 'Complete Indian spice set 12 varieties', defaultRate: 1200 },
  { name: 'Tea Powder', materialType: 'Food & Beverage', description: 'Premium tea powder 500g packet', defaultRate: 450 },
  { name: 'Coffee Beans', materialType: 'Food & Beverage', description: 'Arabica coffee beans 1kg packet', defaultRate: 850 },
  
  // Construction Materials
  { name: 'Cement Bag', materialType: 'Construction Materials', description: 'Portland cement 50kg bag', defaultRate: 350 },
  { name: 'Steel Rods', materialType: 'Construction Materials', description: 'TMT steel rods 12mm diameter 40ft', defaultRate: 850 },
  { name: 'Bricks', materialType: 'Construction Materials', description: 'Red clay bricks 1000 pieces', defaultRate: 4500 },
  { name: 'Sand', materialType: 'Construction Materials', description: 'River sand 1 truck load', defaultRate: 12000 },
  { name: 'Paint Can', materialType: 'Construction Materials', description: 'Emulsion paint 20L can', defaultRate: 3500 },
  
  // Office Supplies
  { name: 'A4 Paper Ream', materialType: 'Office Supplies', description: '500 sheets A4 white paper 80gsm', defaultRate: 280 },
  { name: 'Pen Set', materialType: 'Office Supplies', description: 'Set of 12 ballpoint pens blue ink', defaultRate: 180 },
  { name: 'Stapler', materialType: 'Office Supplies', description: 'Heavy-duty stapler with staples', defaultRate: 450 },
  { name: 'File Folder', materialType: 'Office Supplies', description: 'Manila file folders pack of 100', defaultRate: 350 },
  { name: 'Calculator', materialType: 'Office Supplies', description: 'Scientific calculator with display', defaultRate: 850 },
  
  // Machinery
  { name: 'Drill Machine', materialType: 'Machinery', description: 'Electric drill machine with bits set', defaultRate: 4500 },
  { name: 'Angle Grinder', materialType: 'Machinery', description: 'Power angle grinder with safety guard', defaultRate: 3500 },
  { name: 'Welding Machine', materialType: 'Machinery', description: 'Arc welding machine 200A capacity', defaultRate: 25000 },
  { name: 'Compressor', materialType: 'Machinery', description: 'Air compressor 50L tank capacity', defaultRate: 18000 },
  { name: 'Generator', materialType: 'Machinery', description: 'Portable generator 5KVA diesel', defaultRate: 45000 },
  
  // Chemicals
  { name: 'Cleaning Solution', materialType: 'Chemicals', description: 'Multi-purpose cleaning solution 5L', defaultRate: 850 },
  { name: 'Lubricating Oil', materialType: 'Chemicals', description: 'Industrial lubricating oil 1L', defaultRate: 1200 },
  { name: 'Paint Thinner', materialType: 'Chemicals', description: 'Paint thinner solvent 1L bottle', defaultRate: 450 },
  { name: 'Adhesive Glue', materialType: 'Chemicals', description: 'Strong adhesive glue 250ml tube', defaultRate: 280 },
  { name: 'Detergent Powder', materialType: 'Chemicals', description: 'Laundry detergent powder 5kg', defaultRate: 650 }
];

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

function getOrderTypeBadgeClass(type) {
  const classes = {
    'Sales': 'badge-primary',
    'DC': 'badge-success',
    'Bulk': 'badge-warning'
  };
  return classes[type] || 'badge-secondary';
}

function getPriorityBadgeClass(priority) {
  const classes = {
    'Low': 'badge-secondary',
    'Medium': 'badge-info',
    'High': 'badge-warning',
    'Urgent': 'badge-danger'
  };
  return classes[priority] || 'badge-info';
}

function generateOrderId() {
  return generateId('ORD', loadOrders());
}

// GST calculation functions for orders
function calculateOrderGST(amount, gstRate, isInterstate = false) {
  const rate = parseFloat(gstRate) / 100;
  const gstAmount = amount * rate;
  
  if (isInterstate) {
    return {
      total: amount + gstAmount,
      gstAmount: gstAmount,
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      breakdown: `IGST @ ${gstRate}%`
    };
  } else {
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    return {
      total: amount + gstAmount,
      gstAmount: gstAmount,
      cgst: cgst,
      sgst: sgst,
      igst: 0,
      breakdown: `CGST @ ${gstRate/2}% + SGST @ ${gstRate/2}%`
    };
  }
}

// Main render function
function renderOrders() {
  const tbody = document.getElementById('ordersTbody');
  if (!tbody) return;
  
  const orders = loadOrders();
  
  // Apply filters
  const statusFilter = document.getElementById('statusFilter')?.value || '';
  const orderTypeFilter = document.getElementById('orderTypeFilter')?.value || '';
  const customerFilter = document.getElementById('customerFilter')?.value || '';
  const dateStart = document.getElementById('orderDateStart')?.value || '';
  const dateEnd = document.getElementById('orderDateEnd')?.value || '';
  const searchTerm = document.getElementById('searchOrders')?.value?.toLowerCase() || '';
  const sortBy = document.getElementById('sortOrders')?.value || 'date-desc';
  
  let filtered = orders.filter(order => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (orderTypeFilter && order.orderType !== orderTypeFilter) return false;
    if (customerFilter && order.customer !== customerFilter) return false;
    if (dateStart && order.date < dateStart) return false;
    if (dateEnd && order.date > dateEnd) return false;
    if (searchTerm) {
      const searchText = `${order.id} ${order.customer} ${order.items} ${order.dcNumber || ''}`.toLowerCase();
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
      case 'priority':
        const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
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
        <td colspan="9" class="text-center" style="padding: 2rem; color: var(--gray-500);">
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
        ${order.orderType === 'Bulk' ? '<br><small style="color: var(--warning-600); font-weight: 500;">Bulk Order</small>' : ''}
      </td>
      <td>
        <span class="badge ${getOrderTypeBadgeClass(order.orderType || 'Sales')}">${order.orderType || 'Sales'}</span>
      </td>
      <td>
        <div style="font-weight: 600;">${order.customer}</div>
        ${order.contact && order.contact !== 'N/A' ? `<small style="color: var(--gray-600);">${order.contact}</small>` : ''}
      </td>
      <td>
        <div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${order.items}">
          ${order.items}
        </div>
        ${order.orderType === 'DC' && order.dcNumber ? `<br><small style="color: var(--gray-600);">DC: ${order.dcNumber}</small>` : ''}
        ${order.orderType === 'Bulk' && order.batchNumber ? `<br><small style="color: var(--warning-600);">Batch: ${order.batchNumber}</small>` : ''}
      </td>
      <td>${formatINR(order.totalAmount)}</td>
      <td>
        <span class="${orderBadgeClass(order.status)}">${order.status}</span>
        ${order.orderType === 'DC' && order.materialStatus ? `<br><small style="color: var(--info-600);">Material: ${order.materialStatus}</small>` : ''}
      </td>
      <td>
        <span class="badge ${getPriorityBadgeClass(order.priority || 'Medium')}">${order.priority || 'Medium'}</span>
      </td>
      <td>${formatDate(order.date)}</td>
      <td>
        ${createTableActionsDropdown(order.id, [
          { label: 'View Details', icon: 'pi pi-eye', onclick: `viewOrder('${order.id}')` },
          { label: 'Edit Order', icon: 'pi pi-pencil', onclick: `editOrder('${order.id}')` },
          { label: 'Update Status', icon: 'pi pi-refresh', onclick: `updateOrderStatus('${order.id}')` },
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
          <label>Priority *</label>
          <select id="orderPriority" required>
            <option value="">Select priority...</option>
            ${ORDER_PRIORITIES.map(priority => `<option value="${priority}">${priority}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="orderStatus" required>
            <option value="">Select status...</option>
            ${ORDER_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Expected Delivery</label>
          <input id="expectedDelivery" type="date" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4>Order Items</h4>
      <div class="form-group col-12">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <label>Items *</label>
          <button type="button" class="btn btn-primary btn-sm" onclick="addOrderItem()">
            <i class="pi pi-plus"></i> Add Item
          </button>
        </div>
        <div id="orderItemsList" class="order-items-container">
          <!-- Items will be added here dynamically -->
        </div>
        <div class="order-summary">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>Total Amount:</strong>
            <span id="orderTotalAmount">₹0.00</span>
          </div>
        </div>
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
      const status = document.getElementById('orderStatus').value;
      const priority = document.getElementById('orderPriority').value;
      const date = document.getElementById('orderDate').value;
      const expectedDelivery = document.getElementById('expectedDelivery').value;
      const address = document.getElementById('orderAddress').value.trim();
      const contact = document.getElementById('orderContact').value.trim();
      const notes = document.getElementById('orderNotes').value.trim();
      
      // Get order items
      const orderItems = getOrderItems();
      const totalAmount = calculateOrderTotal();
      
      if (!customer || orderItems.length === 0 || !status || !priority || !date || totalAmount <= 0) {
        showToast('Please fill all required fields correctly and add at least one item', 'error');
        return;
      }
      
      // Format items for display
      const itemsText = orderItems.map(item => 
        `${item.itemName} - ${item.materialType} - ${item.description} (Qty: ${item.quantity}, Rate: ₹${item.rate.toFixed(2)}, Total: ₹${(item.quantity * item.rate).toFixed(2)})`
      ).join('; ');
      
      const newOrder = createOrderWithCustomerManagement({
        customer,
        items: itemsText,
        orderItems: orderItems, // Store structured items data
        totalAmount: totalAmount,
        status,
        priority,
        date,
        expectedDelivery: expectedDelivery || null,
        address: address || 'N/A',
        contact: contact || 'N/A',
        notes: notes || 'N/A',
        orderType: 'Sales'
      });
      closeModal();
      renderOrders();
      updateDashboardStats(); // Update dashboard stats
      showToast('Order created successfully', 'success');
    }}
  ], 'modal-large');
  
  // Set default date to today
  setTimeout(() => {
    const dateInput = document.getElementById('orderDate');
    if (dateInput) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
    // Add initial item
    addOrderItem();
  }, 100);
}

// Order Items Management Functions
let orderItemCounter = 0;

function addOrderItem() {
  orderItemCounter++;
  const itemsContainer = document.getElementById('orderItemsList');
  if (!itemsContainer) return;
  
  const itemHtml = `
    <div class="order-item" data-item-id="${orderItemCounter}">
      <div style="width: 180px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Item Name</label>
        <select class="order-item-name" onchange="onItemNameChange(${orderItemCounter})">
          <option value="">Select item...</option>
          ${PREDEFINED_ITEMS.map(item => `<option value="${item.name}" data-material="${item.materialType}" data-description="${item.description}" data-rate="${item.defaultRate}">${item.name}</option>`).join('')}
          <option value="custom">Custom Item</option>
        </select>
      </div>
      <div style="width: 150px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Material Type *</label>
        <select class="order-item-material-type" required>
          <option value="">Select type...</option>
          ${MATERIAL_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
        </select>
      </div>
      <div style="flex: 1;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Description *</label>
        <input type="text" class="order-item-description" placeholder="Enter item description" required />
      </div>
      <div style="width: 100px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Quantity *</label>
        <input type="number" class="order-item-quantity" placeholder="Qty" min="1" step="1" required onchange="updateOrderTotal()" />
      </div>
      <div style="width: 120px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Rate (₹) *</label>
        <input type="number" class="order-item-rate" placeholder="0.00" min="0" step="0.01" required onchange="updateOrderTotal()" />
      </div>
      <div style="width: 120px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Total (₹)</label>
        <input type="text" class="order-item-total" readonly />
      </div>
      <div style="width: 40px;">
        <button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItem(${orderItemCounter})">
          <i class="pi pi-trash"></i>
        </button>
      </div>
    </div>
  `;
  
  itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
  updateOrderTotal();
}

function removeOrderItem(itemId) {
  const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
  if (itemElement) {
    itemElement.remove();
    updateOrderTotal();
  }
}

function getOrderItems() {
  const items = [];
  const itemElements = document.querySelectorAll('.order-item');
  
  itemElements.forEach(element => {
    const itemName = element.querySelector('.order-item-name').value;
    const materialType = element.querySelector('.order-item-material-type').value;
    const description = element.querySelector('.order-item-description').value.trim();
    const quantity = parseFloat(element.querySelector('.order-item-quantity').value);
    const rate = parseFloat(element.querySelector('.order-item-rate').value);
    
    if (materialType && description && quantity > 0 && rate >= 0) {
      items.push({
        itemName: itemName || 'Custom Item',
        materialType,
        description,
        quantity,
        rate,
        total: quantity * rate
      });
    }
  });
  
  return items;
}

function calculateOrderTotal() {
  const items = getOrderItems();
  return items.reduce((total, item) => total + item.total, 0);
}

function updateOrderTotal() {
  const items = getOrderItems();
  const total = items.reduce((sum, item) => sum + item.total, 0);
  
  // Update individual item totals
  const itemElements = document.querySelectorAll('.order-item');
  itemElements.forEach(element => {
    const quantity = parseFloat(element.querySelector('.order-item-quantity').value) || 0;
    const rate = parseFloat(element.querySelector('.order-item-rate').value) || 0;
    const totalInput = element.querySelector('.order-item-total');
    if (totalInput) {
      totalInput.value = (quantity * rate).toFixed(2);
    }
  });
  
  // Update overall total
  const totalElement = document.getElementById('orderTotalAmount');
  if (totalElement) {
    totalElement.textContent = formatINR(total);
  }
}

function onItemNameChange(itemId) {
  const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
  if (!itemElement) return;
  
  const nameSelect = itemElement.querySelector('.order-item-name');
  const materialSelect = itemElement.querySelector('.order-item-material-type');
  const descriptionInput = itemElement.querySelector('.order-item-description');
  const rateInput = itemElement.querySelector('.order-item-rate');
  
  const selectedOption = nameSelect.options[nameSelect.selectedIndex];
  
  if (selectedOption.value && selectedOption.value !== 'custom') {
    // Auto-populate fields from selected item
    const materialType = selectedOption.getAttribute('data-material');
    const description = selectedOption.getAttribute('data-description');
    const rate = selectedOption.getAttribute('data-rate');
    
    materialSelect.value = materialType;
    descriptionInput.value = description;
    rateInput.value = rate;
    
    // Update total
    updateOrderTotal();
  } else if (selectedOption.value === 'custom') {
    // Clear fields for custom item
    materialSelect.value = '';
    descriptionInput.value = '';
    rateInput.value = '';
  }
}

// Edit Order Items Management Functions
let editOrderItemCounter = 0;

function addEditOrderItem() {
  editOrderItemCounter++;
  const itemsContainer = document.getElementById('editOrderItemsList');
  if (!itemsContainer) return;
  
  const itemHtml = `
    <div class="order-item" data-item-id="${editOrderItemCounter}">
      <div style="width: 180px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Item Name</label>
        <select class="edit-order-item-name" onchange="onEditItemNameChange(${editOrderItemCounter})">
          <option value="">Select item...</option>
          ${PREDEFINED_ITEMS.map(item => `<option value="${item.name}" data-material="${item.materialType}" data-description="${item.description}" data-rate="${item.defaultRate}">${item.name}</option>`).join('')}
          <option value="custom">Custom Item</option>
        </select>
      </div>
      <div style="width: 150px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Material Type *</label>
        <select class="edit-order-item-material-type" required>
          <option value="">Select type...</option>
          ${MATERIAL_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
        </select>
      </div>
      <div style="flex: 1;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Description *</label>
        <input type="text" class="edit-order-item-description" placeholder="Enter item description" required />
      </div>
      <div style="width: 100px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Quantity *</label>
        <input type="number" class="edit-order-item-quantity" placeholder="Qty" min="1" step="1" required onchange="updateEditOrderTotal()" />
      </div>
      <div style="width: 120px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Rate (₹) *</label>
        <input type="number" class="edit-order-item-rate" placeholder="0.00" min="0" step="0.01" required onchange="updateEditOrderTotal()" />
      </div>
      <div style="width: 120px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Total (₹)</label>
        <input type="text" class="edit-order-item-total" readonly />
      </div>
      <div style="width: 40px;">
        <button type="button" class="btn btn-danger btn-sm" onclick="removeEditOrderItem(${editOrderItemCounter})">
          <i class="pi pi-trash"></i>
        </button>
      </div>
    </div>
  `;
  
  itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
  updateEditOrderTotal();
}

function removeEditOrderItem(itemId) {
  const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
  if (itemElement) {
    itemElement.remove();
    updateEditOrderTotal();
  }
}

function getEditOrderItems() {
  const items = [];
  const itemElements = document.querySelectorAll('#editOrderItemsList .order-item');
  
  itemElements.forEach(element => {
    const itemName = element.querySelector('.edit-order-item-name').value;
    const materialType = element.querySelector('.edit-order-item-material-type').value;
    const description = element.querySelector('.edit-order-item-description').value.trim();
    const quantity = parseFloat(element.querySelector('.edit-order-item-quantity').value);
    const rate = parseFloat(element.querySelector('.edit-order-item-rate').value);
    
    if (materialType && description && quantity > 0 && rate >= 0) {
      items.push({
        itemName: itemName || 'Custom Item',
        materialType,
        description,
        quantity,
        rate,
        total: quantity * rate
      });
    }
  });
  
  return items;
}

function calculateEditOrderTotal() {
  const items = getEditOrderItems();
  return items.reduce((total, item) => total + item.total, 0);
}

function updateEditOrderTotal() {
  const items = getEditOrderItems();
  const total = items.reduce((sum, item) => sum + item.total, 0);
  
  // Update individual item totals
  const itemElements = document.querySelectorAll('#editOrderItemsList .order-item');
  itemElements.forEach(element => {
    const quantity = parseFloat(element.querySelector('.edit-order-item-quantity').value) || 0;
    const rate = parseFloat(element.querySelector('.edit-order-item-rate').value) || 0;
    const totalInput = element.querySelector('.edit-order-item-total');
    if (totalInput) {
      totalInput.value = (quantity * rate).toFixed(2);
    }
  });
  
  // Update overall total
  const totalElement = document.getElementById('editOrderTotalAmount');
  if (totalElement) {
    totalElement.textContent = formatINR(total);
  }
}

function onEditItemNameChange(itemId) {
  const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
  if (!itemElement) return;
  
  const nameSelect = itemElement.querySelector('.edit-order-item-name');
  const materialSelect = itemElement.querySelector('.edit-order-item-material-type');
  const descriptionInput = itemElement.querySelector('.edit-order-item-description');
  const rateInput = itemElement.querySelector('.edit-order-item-rate');
  
  const selectedOption = nameSelect.options[nameSelect.selectedIndex];
  
  if (selectedOption.value && selectedOption.value !== 'custom') {
    // Auto-populate fields from selected item
    const materialType = selectedOption.getAttribute('data-material');
    const description = selectedOption.getAttribute('data-description');
    const rate = selectedOption.getAttribute('data-rate');
    
    materialSelect.value = materialType;
    descriptionInput.value = description;
    rateInput.value = rate;
    
    // Update total
    updateEditOrderTotal();
  } else if (selectedOption.value === 'custom') {
    // Clear fields for custom item
    materialSelect.value = '';
    descriptionInput.value = '';
    rateInput.value = '';
  }
}

// Bulk Order management function
function receiveBulkOrder() {
  const body = `
    <div class="form-section">
      <h4>Bulk Order Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Name *</label>
          <input id="bulkOrderCustomer" type="text" placeholder="Enter customer name" required />
        </div>
        <div class="form-group col-6">
          <label>Batch Number *</label>
          <input id="bulkOrderBatch" type="text" placeholder="Enter batch number" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Order Date *</label>
          <input id="bulkOrderDate" type="date" required />
        </div>
        <div class="form-group col-6">
          <label>Priority *</label>
          <select id="bulkOrderPriority" required>
            <option value="">Select priority...</option>
            ${ORDER_PRIORITIES.map(priority => `<option value="${priority}">${priority}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="bulkOrderStatus" required>
            <option value="">Select status...</option>
            ${ORDER_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Expected Delivery</label>
          <input id="bulkExpectedDelivery" type="date" />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Items/Description *</label>
        <textarea id="bulkOrderItems" placeholder="Enter items and quantities" rows="3" required></textarea>
      </div>
      <div class="form-group col-12">
        <label>Total Amount (INR) *</label>
        <input id="bulkOrderAmount" type="number" min="0" step="0.01" placeholder="Enter total amount" required />
      </div>
    </div>

    <div class="form-section">
      <h4>Contact & Delivery Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Contact Number</label>
          <input id="bulkOrderContact" type="tel" placeholder="Enter contact number" />
        </div>
        <div class="form-group col-6">
          <label>Delivery Address</label>
          <textarea id="bulkOrderAddress" placeholder="Enter delivery address" rows="2"></textarea>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="bulkOrderNotes" placeholder="Enter any notes" rows="2"></textarea>
      </div>
    </div>
  `;
  
  openModal('Receive Bulk Order', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Create Bulk Order', type: 'primary', action: () => {
      const customer = document.getElementById('bulkOrderCustomer').value.trim();
      const batchNumber = document.getElementById('bulkOrderBatch').value.trim();
      const items = document.getElementById('bulkOrderItems').value.trim();
      const priority = document.getElementById('bulkOrderPriority').value;
      const amount = parseFloat(document.getElementById('bulkOrderAmount').value);
      const status = document.getElementById('bulkOrderStatus').value;
      const date = document.getElementById('bulkOrderDate').value;
      const expectedDelivery = document.getElementById('bulkExpectedDelivery').value;
      const address = document.getElementById('bulkOrderAddress').value.trim();
      const contact = document.getElementById('bulkOrderContact').value.trim();
      const notes = document.getElementById('bulkOrderNotes').value.trim();
      
      if (!customer || !batchNumber || !items || !priority || isNaN(amount) || !status || !date || amount <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      const newOrder = createOrderWithCustomerManagement({
        customer,
        items,
        totalAmount: amount,
        status,
        priority,
        date,
        expectedDelivery: expectedDelivery || null,
        address: address || 'N/A',
        contact: contact || 'N/A',
        notes: notes || 'N/A',
        orderType: 'Bulk',
        batchNumber: batchNumber
      });
      closeModal();
      renderOrders();
      updateDashboardStats(); // Update dashboard stats
      showToast('Bulk Order created successfully', 'success');
    }}
  ], 'modal-large');
  
  // Set default date to today
  setTimeout(() => {
    const dateInput = document.getElementById('bulkOrderDate');
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
      ${order.orderItems && order.orderItems.length > 0 ? `
        <div style="margin-bottom: 1rem;">
          <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
            <thead>
              <tr style="background: var(--gray-100);">
                <th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray-200);">Item Name</th>
                <th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray-200);">Material Type</th>
                <th style="padding: 0.5rem; text-align: left; border: 1px solid var(--gray-200);">Description</th>
                <th style="padding: 0.5rem; text-align: center; border: 1px solid var(--gray-200);">Qty</th>
                <th style="padding: 0.5rem; text-align: right; border: 1px solid var(--gray-200);">Rate</th>
                <th style="padding: 0.5rem; text-align: right; border: 1px solid var(--gray-200);">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.orderItems.map(item => `
                <tr>
                  <td style="padding: 0.5rem; border: 1px solid var(--gray-200); font-weight: 600; color: var(--brand-600);">${item.itemName || 'Custom Item'}</td>
                  <td style="padding: 0.5rem; border: 1px solid var(--gray-200); font-weight: 500; color: var(--success-600);">${item.materialType || 'N/A'}</td>
                  <td style="padding: 0.5rem; border: 1px solid var(--gray-200);">${item.description}</td>
                  <td style="padding: 0.5rem; text-align: center; border: 1px solid var(--gray-200);">${item.quantity}</td>
                  <td style="padding: 0.5rem; text-align: right; border: 1px solid var(--gray-200);">${formatINR(item.rate)}</td>
                  <td style="padding: 0.5rem; text-align: right; border: 1px solid var(--gray-200); font-weight: 600;">${formatINR(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : ''}
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
  ], 'modal-large');
}

function editOrder(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const isDCOrder = order.orderType === 'DC';
  
  const body = `
    <div class="form-section">
      <h4>${isDCOrder ? 'DC Order Information' : 'Order Information'}</h4>
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
          <label>${isDCOrder ? 'DC Date' : 'Order Date'} *</label>
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
      ${isDCOrder ? `
      <div class="form-row">
        <div class="form-group col-6">
          <label>DC Number *</label>
          <input id="editDCOrderNumber" type="text" value="${order.dcNumber || ''}" required />
        </div>
        <div class="form-group col-6">
          <label>Received Date *</label>
          <input id="editDCOrderReceivedDate" type="date" value="${order.receivedDate || ''}" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Material Status *</label>
          <select id="editDCOrderMaterialStatus" required>
            <option value="">Select material status...</option>
            <option value="Received" ${order.materialStatus === 'Received' ? 'selected' : ''}>Material Received</option>
            <option value="Partial" ${order.materialStatus === 'Partial' ? 'selected' : ''}>Partial Material</option>
            <option value="Pending" ${order.materialStatus === 'Pending' ? 'selected' : ''}>Material Pending</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>Quality Check Status</label>
          <select id="editDCOrderQualityStatus">
            <option value="Pending" ${order.qualityStatus === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Passed" ${order.qualityStatus === 'Passed' ? 'selected' : ''}>Passed</option>
            <option value="Failed" ${order.qualityStatus === 'Failed' ? 'selected' : ''}>Failed</option>
            <option value="Under Review" ${order.qualityStatus === 'Under Review' ? 'selected' : ''}>Under Review</option>
          </select>
        </div>
      </div>
      ` : ''}
    </div>

    <div class="form-section">
      <h4>Order Items</h4>
      <div class="form-group col-12">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <label>Items *</label>
          <button type="button" class="btn btn-primary btn-sm" onclick="addEditOrderItem()">
            <i class="pi pi-plus"></i> Add Item
          </button>
        </div>
        <div id="editOrderItemsList" class="order-items-container">
          <!-- Items will be added here dynamically -->
        </div>
        <div class="order-summary">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>Total Amount:</strong>
            <span id="editOrderTotalAmount">₹0.00</span>
          </div>
        </div>
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
      const status = document.getElementById('editOrderStatus').value;
      const date = document.getElementById('editOrderDate').value;
      const address = document.getElementById('editOrderAddress').value.trim();
      const contact = document.getElementById('editOrderContact').value.trim();
      const notes = document.getElementById('editOrderNotes').value.trim();
      
      // Get DC order specific fields if applicable
      let dcNumber, receivedDate, materialStatus, qualityStatus;
      if (isDCOrder) {
        dcNumber = document.getElementById('editDCOrderNumber').value.trim();
        receivedDate = document.getElementById('editDCOrderReceivedDate').value;
        materialStatus = document.getElementById('editDCOrderMaterialStatus').value;
        qualityStatus = document.getElementById('editDCOrderQualityStatus').value;
      }
      
      // Get order items
      const orderItems = getEditOrderItems();
      const totalAmount = calculateEditOrderTotal();
      
      if (!customer || orderItems.length === 0 || !status || !date || totalAmount <= 0) {
        showToast('Please fill all required fields correctly and add at least one item', 'error');
        return;
      }
      
      // Additional validation for DC orders
      if (isDCOrder && (!dcNumber || !receivedDate || !materialStatus)) {
        showToast('Please fill all DC order required fields', 'error');
        return;
      }
      
      // Format items for display
      const itemsText = orderItems.map(item => 
        `${item.itemName} - ${item.materialType} - ${item.description} (Qty: ${item.quantity}, Rate: ₹${item.rate.toFixed(2)}, Total: ₹${(item.quantity * item.rate).toFixed(2)})`
      ).join('; ');
      
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) return;
      
      const updatedOrder = {
        ...orders[orderIndex],
        customer,
        items: itemsText,
        orderItems: orderItems, // Store structured items data
        totalAmount: totalAmount,
        status,
        date,
        address: address || 'N/A',
        contact: contact || 'N/A',
        notes: notes || 'N/A',
        updatedAt: new Date().toISOString()
      };
      
      // Add DC order specific fields
      if (isDCOrder) {
        updatedOrder.dcNumber = dcNumber;
        updatedOrder.receivedDate = receivedDate;
        updatedOrder.materialStatus = materialStatus;
        updatedOrder.qualityStatus = qualityStatus;
      }
      
      orders[orderIndex] = updatedOrder;
      
      saveOrders(orders);
      closeModal();
      renderOrders();
      updateDashboardStats(); // Update dashboard stats
      showToast('Order updated successfully', 'success');
    }}
  ], 'modal-lg');
  
  // Populate existing items if they exist
  setTimeout(() => {
    if (order.orderItems && order.orderItems.length > 0) {
      order.orderItems.forEach(item => {
        addEditOrderItem();
        const itemsContainer = document.getElementById('editOrderItemsList');
        const lastItem = itemsContainer.lastElementChild;
        if (lastItem) {
          // Try to find matching predefined item
          const matchingItem = PREDEFINED_ITEMS.find(predefined => 
            predefined.name === item.itemName || 
            (predefined.description === item.description && predefined.materialType === item.materialType)
          );
          
          if (matchingItem) {
            lastItem.querySelector('.edit-order-item-name').value = matchingItem.name;
          } else {
            lastItem.querySelector('.edit-order-item-name').value = 'custom';
          }
          
          lastItem.querySelector('.edit-order-item-material-type').value = item.materialType || '';
          lastItem.querySelector('.edit-order-item-description').value = item.description;
          lastItem.querySelector('.edit-order-item-quantity').value = item.quantity;
          lastItem.querySelector('.edit-order-item-rate').value = item.rate;
        }
      });
      updateEditOrderTotal();
    } else {
      // Add one empty item if no existing items
      addEditOrderItem();
    }
  }, 100);
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
    </div>

    <div class="form-section">
      <h4>DC Order Items</h4>
      <div class="form-group col-12">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <label>Items *</label>
          <button type="button" class="btn btn-primary btn-sm" onclick="addDCOrderItem()">
            <i class="pi pi-plus"></i> Add Item
          </button>
        </div>
        <div id="dcOrderItemsList" class="order-items-container">
          <!-- Items will be added here dynamically -->
        </div>
        <div class="order-summary">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong>Total Amount:</strong>
            <span id="dcOrderTotalAmount">₹0.00</span>
          </div>
        </div>
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
      const materialStatus = document.getElementById('dcOrderMaterialStatus').value;
      const dcDate = document.getElementById('dcOrderDate').value;
      const receivedDate = document.getElementById('dcReceivedDate').value;
      const address = document.getElementById('dcOrderAddress').value.trim();
      const contact = document.getElementById('dcOrderContact').value.trim();
      const notes = document.getElementById('dcOrderNotes').value.trim();
      const qualityStatus = document.getElementById('dcQualityStatus').value;
      
      // Get DC order items
      const dcOrderItems = getDCOrderItems();
      const totalAmount = calculateDCOrderTotal();
      
      if (!customer || !dcNumber || !materialStatus || !dcDate || !receivedDate || dcOrderItems.length === 0 || totalAmount <= 0) {
        showToast('Please fill all required fields correctly and add at least one item', 'error');
        return;
      }
      
      // Only allow creation if material is received or partial
      if (materialStatus === 'Pending') {
        showToast('DC Order can only be created when material is received or partially received', 'error');
        return;
      }
      
      // Format items for display
      const itemsText = dcOrderItems.map(item => 
        `${item.itemName} - ${item.materialType} - ${item.description} (Qty: ${item.quantity}, Rate: ₹${item.rate.toFixed(2)}, Total: ₹${(item.quantity * item.rate).toFixed(2)})`
      ).join('; ');
      
      const newOrder = createOrderWithCustomerManagement({
        customer,
        items: itemsText,
        orderItems: dcOrderItems, // Store structured items data
        totalAmount: totalAmount,
        status: 'Completed', // DC orders are typically completed when received
        date: dcDate,
        address: address || 'N/A',
        contact: contact || 'N/A',
        notes: notes || 'N/A',
        orderType: 'DC',
        dcNumber: dcNumber,
        materialStatus: materialStatus,
        receivedDate: receivedDate,
        qualityStatus: qualityStatus
      });
      closeModal();
      renderOrders();
      updateDashboardStats(); // Update dashboard stats
      showToast('DC Order created successfully', 'success');
    }}
  ], 'modal-large');
  
  // Set default dates
  setTimeout(() => {
    const today = new Date().toISOString().slice(0, 10);
    const dcDateInput = document.getElementById('dcOrderDate');
    const receivedDateInput = document.getElementById('dcReceivedDate');
    if (dcDateInput) dcDateInput.value = today;
    if (receivedDateInput) receivedDateInput.value = today;
    // Add initial item
    addDCOrderItem();
  }, 100);
}

// DC Order Items Management Functions
let dcOrderItemCounter = 0;

function addDCOrderItem() {
  dcOrderItemCounter++;
  const itemsContainer = document.getElementById('dcOrderItemsList');
  if (!itemsContainer) return;
  
  const itemHtml = `
    <div class="order-item" data-item-id="${dcOrderItemCounter}">
      <div style="width: 180px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Item Name</label>
        <select class="dc-order-item-name" onchange="onDCOrderItemNameChange(${dcOrderItemCounter})">
          <option value="">Select item...</option>
          ${PREDEFINED_ITEMS.map(item => `<option value="${item.name}" data-material="${item.materialType}" data-description="${item.description}" data-rate="${item.defaultRate}">${item.name}</option>`).join('')}
          <option value="custom">Custom Item</option>
        </select>
      </div>
      <div style="width: 150px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Material Type *</label>
        <select class="dc-order-item-material-type" required>
          <option value="">Select type...</option>
          ${MATERIAL_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
        </select>
      </div>
      <div style="flex: 1;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Description *</label>
        <input type="text" class="dc-order-item-description" placeholder="Enter item description" required />
      </div>
      <div style="width: 100px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Quantity *</label>
        <input type="number" class="dc-order-item-quantity" placeholder="Qty" min="1" step="1" required onchange="updateDCOrderTotal()" />
      </div>
      <div style="width: 120px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Rate (₹) *</label>
        <input type="number" class="dc-order-item-rate" placeholder="0.00" min="0" step="0.01" required onchange="updateDCOrderTotal()" />
      </div>
      <div style="width: 120px;">
        <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Total (₹)</label>
        <input type="text" class="dc-order-item-total" readonly />
      </div>
      <div style="width: 40px;">
        <button type="button" class="btn btn-danger btn-sm" onclick="removeDCOrderItem(${dcOrderItemCounter})">
          <i class="pi pi-trash"></i>
        </button>
      </div>
    </div>
  `;
  
  itemsContainer.insertAdjacentHTML('beforeend', itemHtml);
  updateDCOrderTotal();
}

function removeDCOrderItem(itemId) {
  const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
  if (itemElement) {
    itemElement.remove();
    updateDCOrderTotal();
  }
}

function getDCOrderItems() {
  const items = [];
  const itemElements = document.querySelectorAll('#dcOrderItemsList .order-item');
  
  itemElements.forEach(element => {
    const itemName = element.querySelector('.dc-order-item-name').value;
    const materialType = element.querySelector('.dc-order-item-material-type').value;
    const description = element.querySelector('.dc-order-item-description').value.trim();
    const quantity = parseFloat(element.querySelector('.dc-order-item-quantity').value);
    const rate = parseFloat(element.querySelector('.dc-order-item-rate').value);
    
    if (materialType && description && quantity > 0 && rate >= 0) {
      items.push({
        itemName: itemName || 'Custom Item',
        materialType,
        description,
        quantity,
        rate,
        total: quantity * rate
      });
    }
  });
  
  return items;
}

function calculateDCOrderTotal() {
  const items = getDCOrderItems();
  return items.reduce((total, item) => total + item.total, 0);
}

function updateDCOrderTotal() {
  const items = getDCOrderItems();
  const total = items.reduce((sum, item) => sum + item.total, 0);
  
  // Update individual item totals
  const itemElements = document.querySelectorAll('#dcOrderItemsList .order-item');
  itemElements.forEach(element => {
    const quantity = parseFloat(element.querySelector('.dc-order-item-quantity').value) || 0;
    const rate = parseFloat(element.querySelector('.dc-order-item-rate').value) || 0;
    const totalInput = element.querySelector('.dc-order-item-total');
    if (totalInput) {
      totalInput.value = (quantity * rate).toFixed(2);
    }
  });
  
  // Update overall total
  const totalElement = document.getElementById('dcOrderTotalAmount');
  if (totalElement) {
    totalElement.textContent = formatINR(total);
  }
}

function onDCOrderItemNameChange(itemId) {
  const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
  if (!itemElement) return;
  
  const nameSelect = itemElement.querySelector('.dc-order-item-name');
  const materialSelect = itemElement.querySelector('.dc-order-item-material-type');
  const descriptionInput = itemElement.querySelector('.dc-order-item-description');
  const rateInput = itemElement.querySelector('.dc-order-item-rate');
  
  const selectedOption = nameSelect.options[nameSelect.selectedIndex];
  
  if (selectedOption.value && selectedOption.value !== 'custom') {
    // Auto-populate fields from selected item
    const materialType = selectedOption.getAttribute('data-material');
    const description = selectedOption.getAttribute('data-description');
    const rate = selectedOption.getAttribute('data-rate');
    
    materialSelect.value = materialType;
    descriptionInput.value = description;
    rateInput.value = rate;
    
    // Update total
    updateDCOrderTotal();
  } else if (selectedOption.value === 'custom') {
    // Clear fields for custom item
    materialSelect.value = '';
    descriptionInput.value = '';
    rateInput.value = '';
  }
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

// Update order status function
function updateOrderStatus(orderId) {
  const orders = loadOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const body = `
    <div class="form-section">
      <h4>Update Order Status</h4>
      <div class="form-group col-12">
        <label>Current Status</label>
        <div style="padding: 0.5rem; background: var(--gray-100); border-radius: 4px; margin-bottom: 1rem;">
          <span class="${orderBadgeClass(order.status)}">${order.status}</span>
        </div>
      </div>
      <div class="form-group col-12">
        <label>New Status *</label>
        <select id="newOrderStatus" required>
          <option value="">Select new status...</option>
          ${ORDER_STATUS.map(status => `<option value="${status}" ${order.status === status ? 'disabled' : ''}>${status}</option>`).join('')}
        </select>
      </div>
      <div class="form-group col-12">
        <label>Status Notes</label>
        <textarea id="statusNotes" placeholder="Enter any notes about this status change" rows="3"></textarea>
      </div>
    </div>
  `;
  
  openModal('Update Order Status', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Update Status', type: 'primary', action: () => {
      const newStatus = document.getElementById('newOrderStatus').value;
      const statusNotes = document.getElementById('statusNotes').value.trim();
      
      if (!newStatus || newStatus === order.status) {
        showToast('Please select a different status', 'error');
        return;
      }
      
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) return;
      
      orders[orderIndex] = {
        ...orders[orderIndex],
        status: newStatus,
        statusHistory: [
          ...(orders[orderIndex].statusHistory || []),
          {
            from: order.status,
            to: newStatus,
            date: new Date().toISOString(),
            notes: statusNotes || 'Status updated'
          }
        ],
        updatedAt: new Date().toISOString()
      };
      
      saveOrders(orders);
      closeModal();
      renderOrders();
      updateDashboardStats();
      showToast('Order status updated successfully', 'success');
    }}
  ], 'modal-md');
}

// Import orders function
function importOrders() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.csv,.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        let importedOrders = [];
        const content = e.target.result;
        
        if (file.name.endsWith('.csv')) {
          // Parse CSV
          const lines = content.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
              const values = lines[i].split(',').map(v => v.trim());
              const order = {};
              headers.forEach((header, index) => {
                order[header] = values[index] || '';
              });
              importedOrders.push(order);
            }
          }
        } else if (file.name.endsWith('.json')) {
          // Parse JSON
          importedOrders = JSON.parse(content);
        }
        
        if (importedOrders.length === 0) {
          showToast('No valid orders found in file', 'error');
          return;
        }
        
        // Validate and process imported orders
        const orders = loadOrders();
        let validOrders = 0;
        
        importedOrders.forEach(order => {
          if (order.customer && order.items && order.totalAmount) {
            const newOrder = {
              id: generateOrderId(),
              customer: order.customer,
              items: order.items,
              totalAmount: parseFloat(order.totalAmount) || 0,
              status: order.status || 'Pending',
              priority: order.priority || 'Medium',
              date: order.date || new Date().toISOString().slice(0, 10),
              address: order.address || 'N/A',
              contact: order.contact || 'N/A',
              notes: order.notes || 'N/A',
              orderType: order.orderType || 'Sales',
              createdAt: new Date().toISOString()
            };
            
            orders.unshift(newOrder);
            validOrders++;
          }
        });
        
        if (validOrders > 0) {
          saveOrders(orders);
          renderOrders();
          updateDashboardStats();
          showToast(`${validOrders} orders imported successfully`, 'success');
        } else {
          showToast('No valid orders found in file', 'error');
        }
        
      } catch (error) {
        console.error('Import error:', error);
        showToast('Error importing orders. Please check file format.', 'error');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

// Export all orders function
function exportAllOrders() {
  const orders = loadOrders();
  if (orders.length === 0) {
    showToast('No orders to export', 'warning');
    return;
  }
  
  const data = orders.map(order => ({
    'Order ID': order.id,
    'Type': order.orderType || 'Sales',
    'Customer': order.customer,
    'Items': order.items,
    'Total Amount': order.totalAmount,
    'Status': order.status,
    'Priority': order.priority || 'Medium',
    'Date': order.date,
    'Contact': order.contact,
    'Address': order.address,
    'Notes': order.notes,
    'Created At': order.createdAt
  }));
  
  exportToCSV(data, 'all-orders', Object.keys(data[0]));
  showToast('Orders exported successfully', 'success');
}

// Initialize customer filter
function initializeCustomerFilter() {
  const customerFilter = document.getElementById('customerFilter');
  if (!customerFilter) return;
  
  const orders = loadOrders();
  const customers = [...new Set(orders.map(order => order.customer))].sort();
  
  customerFilter.innerHTML = '<option value="">All Customers</option>' +
    customers.map(customer => `<option value="${customer}">${customer}</option>`).join('');
}

// Customer Management Functions
function getCustomerInfo(customerName) {
  const customers = loadCustomers();
  return customers.find(c => c.name === customerName) || null;
}

function loadCustomers() {
  try {
    const stored = localStorage.getItem('logosic_customers_v1');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function saveCustomers(customers) {
  try {
    localStorage.setItem('logosic_customers_v1', JSON.stringify(customers));
    return true;
  } catch (e) {
    console.error('Error saving customers:', e);
    return false;
  }
}

function addOrUpdateCustomer(customerData) {
  const customers = loadCustomers();
  const existingIndex = customers.findIndex(c => c.name === customerData.name);
  
  if (existingIndex >= 0) {
    customers[existingIndex] = { ...customers[existingIndex], ...customerData, updatedAt: new Date().toISOString() };
  } else {
    customers.push({ ...customerData, id: generateId('CUST', customers), createdAt: new Date().toISOString() });
  }
  
  return saveCustomers(customers);
}

function getCustomerOrderHistory(customerName) {
  const orders = loadOrders();
  return orders.filter(order => order.customer === customerName);
}

function getCustomerStats(customerName) {
  const orders = getCustomerOrderHistory(customerName);
  const totalOrders = orders.length;
  const totalValue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;
  const lastOrderDate = orders.length > 0 ? Math.max(...orders.map(o => new Date(o.date).getTime())) : null;
  
  return {
    totalOrders,
    totalValue,
    avgOrderValue,
    lastOrderDate: lastOrderDate ? new Date(lastOrderDate).toISOString().slice(0, 10) : null
  };
}

// Enhanced order creation with customer management
function createOrderWithCustomerManagement(orderData) {
  // Add or update customer information
  const customerData = {
    name: orderData.customer,
    contact: orderData.contact,
    address: orderData.address,
    email: orderData.email || null,
    company: orderData.company || null
  };
  
  addOrUpdateCustomer(customerData);
  
  // Create the order
  const orders = loadOrders();
  const newOrder = {
    ...orderData,
    id: generateOrderId(),
    createdAt: new Date().toISOString()
  };
  
  orders.unshift(newOrder);
  saveOrders(orders);
  
  return newOrder;
}

// Initialize order management when page loads
function initializeOrderManagement() {
  initializeCustomerFilter();
  renderOrders();
}

// Stock Management JavaScript
const STOCK_STORAGE_KEY = 'logosic_stock_v1';

const STOCK_CATEGORIES = ['Electronics', 'Furniture', 'Medical', 'Industrial', 'Automotive', 'Textiles', 'Food & Beverage', 'Other'];
const STOCK_STATUS = ['In Stock', 'Low Stock', 'Out of Stock'];

// Sample stock data
const STOCK_ITEMS = [
  { id: 'STK-001', name: 'Samsung Galaxy Smartphone', category: 'Electronics', currentStock: 25, minRequired: 10, unitPrice: 25000, supplier: 'Samsung India', lastUpdated: '2025-09-01', description: 'Latest Samsung Galaxy model' },
  { id: 'STK-002', name: 'Office Chair Premium', category: 'Furniture', currentStock: 15, minRequired: 5, unitPrice: 8500, supplier: 'Furniture Co.', lastUpdated: '2025-08-28', description: 'Ergonomic office chair' },
  { id: 'STK-003', name: 'Digital Thermometer', category: 'Medical', currentStock: 50, minRequired: 20, unitPrice: 1200, supplier: 'MediTech', lastUpdated: '2025-09-03', description: 'Digital medical thermometer' },
  { id: 'STK-004', name: 'Laptop Dell Inspiron', category: 'Electronics', currentStock: 8, minRequired: 15, unitPrice: 45000, supplier: 'Dell India', lastUpdated: '2025-08-30', description: 'Dell Inspiron laptop' },
  { id: 'STK-005', name: 'Industrial Drill Machine', category: 'Industrial', currentStock: 3, minRequired: 5, unitPrice: 15000, supplier: 'Industrial Tools', lastUpdated: '2025-09-02', description: 'Heavy-duty drill machine' }
];

// Storage functions
function loadStockItems() {
  try {
    const stored = localStorage.getItem(STOCK_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading stock items:', e);
  }
  return STOCK_ITEMS;
}

function saveStockItems(items) {
  try {
    localStorage.setItem(STOCK_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving stock items:', e);
  }
}

// Utility functions
function getStockStatus(currentStock, minRequired) {
  if (currentStock === 0) return 'Out of Stock';
  if (currentStock <= minRequired) return 'Low Stock';
  return 'In Stock';
}

function stockBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'in stock') return 'status-badge status-active';
  if (s === 'low stock') return 'status-badge status-pending';
  if (s === 'out of stock') return 'status-badge status-inactive';
  return 'status-badge status-pending';
}

function generateStockId() {
  const items = loadStockItems();
  let max = 0;
  items.forEach(item => {
    const n = parseInt((item.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(3, '0');
  return `STK-${next}`;
}

// Main render function
function renderStock() {
  const tbody = document.getElementById('stockTbody');
  if (!tbody) return;
  
  const items = loadStockItems();
  
  // Apply filters
  const categoryFilter = document.getElementById('stockCategoryFilter')?.value || '';
  const statusFilter = document.getElementById('stockLevelFilter')?.value || '';
  const searchTerm = document.getElementById('searchStockItems')?.value?.toLowerCase() || '';
  const sortBy = document.getElementById('sortStockItems')?.value || 'name';
  
  let filtered = items.filter(item => {
    if (categoryFilter && item.category !== categoryFilter) return false;
    if (statusFilter) {
      const status = getStockStatus(item.currentStock, item.minRequired);
      if (status !== statusFilter) return false;
    }
    if (searchTerm) {
      const searchText = `${item.name} ${item.id} ${item.supplier}`.toLowerCase();
      if (!searchText.includes(searchTerm)) return false;
    }
    return true;
  });
  
  // Sort items
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'stock-desc':
        return b.currentStock - a.currentStock;
      case 'stock-asc':
        return a.currentStock - b.currentStock;
      case 'price-desc':
        return b.unitPrice - a.unitPrice;
      case 'price-asc':
        return a.unitPrice - b.unitPrice;
      case 'category':
        return a.category.localeCompare(b.category);
      case 'status':
        return getStockStatus(a.currentStock, a.minRequired).localeCompare(getStockStatus(b.currentStock, b.minRequired));
      default:
        return 0;
    }
  });
  
  // Initialize or update pagination
  if (!window.paginationInstances['stockContainer']) {
    createPagination('stockContainer', 10);
  }
  
  const pagination = window.paginationInstances['stockContainer'];
  pagination.applyFilters(filtered);
  
  // Get current page data
  const currentPageData = pagination.getCurrentPageData();
  
  // Render table
  if (currentPageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="11" class="text-center" style="padding: 2rem; color: var(--gray-500);">
          <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No stock items found
        </td>
      </tr>
    `;
    updateStockStats();
    return;
  }
  
  tbody.innerHTML = currentPageData.map(item => {
    const status = getStockStatus(item.currentStock, item.minRequired);
    const totalValue = item.currentStock * item.unitPrice;
    
    return `
      <tr>
        <td><strong>${item.id}</strong></td>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.currentStock}</td>
        <td>${item.minRequired}</td>
        <td>${formatINR(item.unitPrice)}</td>
        <td>${formatINR(totalValue)}</td>
        <td><span class="${stockBadgeClass(status)}">${status}</span></td>
        <td>${item.supplier}</td>
        <td>${formatDate(item.lastUpdated)}</td>
        <td>
          <div class="btn-group">
            <button class="btn btn-primary btn-sm" onclick="viewStockItem('${item.id}')">
              <i class="pi pi-eye"></i> View
            </button>
            <button class="btn btn-secondary btn-sm" onclick="editStockItem('${item.id}')">
              <i class="pi pi-pencil"></i> Edit
            </button>
            <button class="btn btn-secondary btn-sm" onclick="deleteStockItem('${item.id}')">
              <i class="pi pi-trash"></i> Delete
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  updateStockStats();
}

function updateStockStats() {
  const items = loadStockItems();
  const totalItems = items.length;
  const lowStockItems = items.filter(item => getStockStatus(item.currentStock, item.minRequired) === 'Low Stock').length;
  const outOfStockItems = items.filter(item => getStockStatus(item.currentStock, item.minRequired) === 'Out of Stock').length;
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  
  // Update stats display if elements exist
  const totalEl = document.getElementById('totalItemsCount');
  const lowStockEl = document.getElementById('lowStockCount');
  const outOfStockEl = document.getElementById('outOfStockCount');
  const totalValueEl = document.getElementById('totalStockValue');
  
  if (totalEl) totalEl.textContent = totalItems;
  if (lowStockEl) lowStockEl.textContent = lowStockItems;
  if (outOfStockEl) outOfStockEl.textContent = outOfStockItems;
  if (totalValueEl) totalValueEl.textContent = formatINR(totalValue);
}

// Stock item management functions
function addStockItem() {
  const body = `
    <div class="form-group">
      <label>Product Name *</label>
      <input id="stockName" type="text" placeholder="Enter product name" required />
    </div>
    <div class="form-group">
      <label>Category *</label>
      <select id="stockCategory" required>
        <option value="">Select category...</option>
        ${STOCK_CATEGORIES.map(category => `<option value="${category}">${category}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Current Stock *</label>
      <input id="stockQuantity" type="number" min="0" placeholder="Enter current stock" required />
    </div>
    <div class="form-group">
      <label>Minimum Required *</label>
      <input id="stockMinRequired" type="number" min="0" placeholder="Enter minimum required" required />
    </div>
    <div class="form-group">
      <label>Unit Price (INR) *</label>
      <input id="stockUnitPrice" type="number" min="0" step="0.01" placeholder="Enter unit price" required />
    </div>
    <div class="form-group">
      <label>Supplier *</label>
      <input id="stockSupplier" type="text" placeholder="Enter supplier name" required />
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="stockDescription" placeholder="Product description or notes..." rows="3"></textarea>
    </div>
  `;
  
  openModal('Add Stock Item', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Add Item', type: 'primary', action: () => {
      const name = document.getElementById('stockName').value.trim();
      const category = document.getElementById('stockCategory').value;
      const quantity = parseInt(document.getElementById('stockQuantity').value, 10);
      const minRequired = parseInt(document.getElementById('stockMinRequired').value, 10);
      const unitPrice = parseFloat(document.getElementById('stockUnitPrice').value);
      const supplier = document.getElementById('stockSupplier').value.trim();
      const description = document.getElementById('stockDescription').value.trim();
      
      if (!name || !category || isNaN(quantity) || isNaN(minRequired) || isNaN(unitPrice) || !supplier || quantity < 0 || minRequired < 0 || unitPrice <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      const items = loadStockItems();
      const newItem = {
        id: generateStockId(),
        name,
        category,
        currentStock: quantity,
        minRequired,
        unitPrice,
        supplier,
        description: description || 'No description',
        lastUpdated: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      };
      
      items.unshift(newItem);
      saveStockItems(items);
      closeModal();
      renderStock();
      showToast('Stock item added successfully', 'success');
    }}
  ]);
}

function viewStockItem(itemId) {
  const items = loadStockItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const status = getStockStatus(item.currentStock, item.minRequired);
  const totalValue = item.currentStock * item.unitPrice;
  
  const html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Item ID</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--brand-600);">${item.id}</div>
      </div>
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Status</div>
        <div><span class="${stockBadgeClass(status)}">${status}</span></div>
      </div>
    </div>
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Product Details</div>
      <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">${item.name}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
        <div><strong>Category:</strong> ${item.category}</div>
        <div><strong>Current Stock:</strong> ${item.currentStock}</div>
        <div><strong>Min Required:</strong> ${item.minRequired}</div>
        <div><strong>Unit Price:</strong> ${formatINR(item.unitPrice)}</div>
        <div><strong>Total Value:</strong> ${formatINR(totalValue)}</div>
        <div><strong>Supplier:</strong> ${item.supplier}</div>
        <div><strong>Last Updated:</strong> ${formatDate(item.lastUpdated)}</div>
        <div><strong>Created:</strong> ${formatDate(item.createdAt)}</div>
      </div>
    </div>
    
    ${item.description !== 'No description' ? `
      <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Description</div>
        <div style="font-size: 0.9rem;">${item.description}</div>
      </div>
    ` : ''}
  `;
  
  openModal('Stock Item Details', html, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Edit', type: 'primary', action: () => { closeModal(); editStockItem(itemId); } }
  ], 'large');
}

function editStockItem(itemId) {
  const items = loadStockItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const body = `
    <div class="form-group">
      <label>Product Name *</label>
      <input id="editStockName" type="text" value="${item.name}" required />
    </div>
    <div class="form-group">
      <label>Category *</label>
      <select id="editStockCategory" required>
        <option value="">Select category...</option>
        ${STOCK_CATEGORIES.map(category => `<option value="${category}" ${item.category === category ? 'selected' : ''}>${category}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Current Stock *</label>
      <input id="editStockQuantity" type="number" min="0" value="${item.currentStock}" required />
    </div>
    <div class="form-group">
      <label>Minimum Required *</label>
      <input id="editStockMinRequired" type="number" min="0" value="${item.minRequired}" required />
    </div>
    <div class="form-group">
      <label>Unit Price (INR) *</label>
      <input id="editStockUnitPrice" type="number" min="0" step="0.01" value="${item.unitPrice}" required />
    </div>
    <div class="form-group">
      <label>Supplier *</label>
      <input id="editStockSupplier" type="text" value="${item.supplier}" required />
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editStockDescription" placeholder="Product description or notes..." rows="3">${item.description || ''}</textarea>
    </div>
  `;
  
  openModal('Edit Stock Item', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Update Item', type: 'primary', action: () => {
      const name = document.getElementById('editStockName').value.trim();
      const category = document.getElementById('editStockCategory').value;
      const quantity = parseInt(document.getElementById('editStockQuantity').value, 10);
      const minRequired = parseInt(document.getElementById('editStockMinRequired').value, 10);
      const unitPrice = parseFloat(document.getElementById('editStockUnitPrice').value);
      const supplier = document.getElementById('editStockSupplier').value.trim();
      const description = document.getElementById('editStockDescription').value.trim();
      
      if (!name || !category || isNaN(quantity) || isNaN(minRequired) || isNaN(unitPrice) || !supplier || quantity < 0 || minRequired < 0 || unitPrice <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      const itemIndex = items.findIndex(i => i.id === itemId);
      if (itemIndex === -1) return;
      
      items[itemIndex] = {
        ...items[itemIndex],
        name,
        category,
        currentStock: quantity,
        minRequired,
        unitPrice,
        supplier,
        description: description || 'No description',
        lastUpdated: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString()
      };
      
      saveStockItems(items);
      closeModal();
      renderStock();
      showToast('Stock item updated successfully', 'success');
    }}
  ]);
}

function deleteStockItem(itemId) {
  const items = loadStockItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  confirmModal('Delete Stock Item', `Are you sure you want to delete this stock item: ${item.name}?`, () => {
    const filtered = items.filter(i => i.id !== itemId);
    saveStockItems(filtered);
    renderStock();
    showToast('Stock item deleted successfully', 'success');
  });
}

// Filter functions
function applyStockFilters() {
  renderStock();
}

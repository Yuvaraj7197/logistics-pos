// Stock Management JavaScript
const STOCK_STORAGE_KEY = 'logosic_stock_v1';
const STOCK_CATEGORIES = getConfig('business.stock.categories', ['Electronics', 'Furniture', 'Medical', 'Industrial', 'Automotive', 'Textiles', 'Food & Beverage', 'Other']);
const STOCK_STATUS = getConfig('business.stock.statuses', ['In Stock', 'Low Stock', 'Out of Stock']);

// Initialize storage manager
const stockStorage = createStorageManager(STOCK_STORAGE_KEY, []);

// Storage functions (using common utilities)
function loadStockItems() {
  return stockStorage.load();
}

function saveStockItems(items) {
  return stockStorage.save(items);
}

// Utility functions (using common utilities)
function getStockStatus(currentStock, minRequired) {
  if (currentStock === 0) return 'Out of Stock';
  if (currentStock <= minRequired) return 'Low Stock';
  return 'In Stock';
}

function stockBadgeClass(status) {
  return getStatusBadgeClass(status, 'stock');
}

function generateStockId() {
  return generateId('STK', loadStockItems());
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
    createPagination('stockContainer');
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
    renderInventoryAnalytics();
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
          ${createTableActionsDropdown(item.id, [
            { label: 'View Details', icon: 'pi pi-eye', onclick: `viewStockItem('${item.id}')` },
            { label: 'Edit Item', icon: 'pi pi-pencil', onclick: `editStockItem('${item.id}')` },
            { label: 'Add Stock', icon: 'pi pi-plus', onclick: `addStockQuantity('${item.id}')` },
            { label: 'Remove Stock', icon: 'pi pi-minus', onclick: `removeStockQuantity('${item.id}')` },
            { label: 'Print Label', icon: 'pi pi-print', onclick: `printStockLabel('${item.id}')` },
            { label: 'Export', icon: 'pi pi-download', onclick: `exportStockItem('${item.id}')` },
            { label: 'Delete', icon: 'pi pi-trash', onclick: `deleteStockItem('${item.id}')`, class: 'danger' }
          ])}
        </td>
      </tr>
    `;
  }).join('');
  
  updateStockStats();
  renderInventoryAnalytics();
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
    <div class="form-section">
      <h4>Product Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Product Name *</label>
          <input id="stockName" type="text" placeholder="Enter product name" required />
        </div>
        <div class="form-group col-6">
          <label>Category *</label>
          <select id="stockCategory" required>
            <option value="">Select category...</option>
            ${STOCK_CATEGORIES.map(category => `<option value="${category}">${category}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Current Stock *</label>
          <input id="stockQuantity" type="number" min="0" placeholder="Enter current stock" required />
        </div>
        <div class="form-group col-6">
          <label>Minimum Required *</label>
          <input id="stockMinRequired" type="number" min="0" placeholder="Enter minimum required" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Unit Price (INR) *</label>
          <input id="stockUnitPrice" type="number" min="0" step="0.01" placeholder="Enter unit price" required />
        </div>
        <div class="form-group col-6">
          <label>Supplier *</label>
          <input id="stockSupplier" type="text" placeholder="Enter supplier name" required />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Description</label>
        <textarea id="stockDescription" placeholder="Product description or notes..." rows="3"></textarea>
      </div>
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
      updateDashboardStats(); // Update dashboard stats
      showToast('Stock item added successfully', 'success');
    }}
  ], 'modal-lg');
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
  ], 'modal-large');
}

function editStockItem(itemId) {
  const items = loadStockItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const body = `
    <div class="form-section">
      <h4>Product Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Product Name *</label>
          <input id="editStockName" type="text" value="${item.name}" required />
        </div>
        <div class="form-group col-6">
          <label>Category *</label>
          <select id="editStockCategory" required>
            <option value="">Select category...</option>
            ${STOCK_CATEGORIES.map(category => `<option value="${category}" ${item.category === category ? 'selected' : ''}>${category}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Current Stock *</label>
          <input id="editStockQuantity" type="number" min="0" value="${item.currentStock}" required />
        </div>
        <div class="form-group col-6">
          <label>Minimum Required *</label>
          <input id="editStockMinRequired" type="number" min="0" value="${item.minRequired}" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Unit Price (INR) *</label>
          <input id="editStockUnitPrice" type="number" min="0" step="0.01" value="${item.unitPrice}" required />
        </div>
        <div class="form-group col-6">
          <label>Supplier *</label>
          <input id="editStockSupplier" type="text" value="${item.supplier}" required />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Description</label>
        <textarea id="editStockDescription" placeholder="Product description or notes..." rows="3">${item.description || ''}</textarea>
      </div>
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
      updateDashboardStats(); // Update dashboard stats
      showToast('Stock item updated successfully', 'success');
    }}
  ], 'modal-lg');
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
// Additional stock actions for dropdown
function addStockQuantity(itemId) {
  const items = loadStockItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const quantity = prompt(`Add stock quantity for ${item.name}:`, '1');
  if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
    const qty = parseInt(quantity);
    item.currentStock += qty;
    item.lastUpdated = new Date().toISOString().slice(0, 10);
    
    // Record movement
    addStockMovement(itemId, item.name, 'in', qty, 'Manual Addition', 'Quick add via action button');
    
    saveStockItems(items);
    renderStock();
    showToast(`Added ${qty} units to ${item.name}`, 'success');
  }
}

function removeStockQuantity(itemId) {
  const items = loadStockItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const quantity = prompt(`Remove stock quantity for ${item.name} (Current: ${item.currentStock}):`, '1');
  if (quantity && !isNaN(quantity) && parseInt(quantity) > 0) {
    const qty = parseInt(quantity);
    if (qty <= item.currentStock) {
      item.currentStock -= qty;
      item.lastUpdated = new Date().toISOString().slice(0, 10);
      
      // Record movement
      addStockMovement(itemId, item.name, 'out', qty, 'Manual Removal', 'Quick remove via action button');
      
      saveStockItems(items);
      renderStock();
      showToast(`Removed ${qty} units from ${item.name}`, 'success');
    } else {
      showToast('Cannot remove more than current stock', 'error');
    }
  }
}

function printStockLabel(itemId) {
  const items = loadStockItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #000;">
      <h2>Stock Label</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Item Code:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.id}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Name:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Category:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.category}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Current Stock:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.currentStock}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;"><strong>Unit Price:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${formatINR(item.unitPrice)}</td>
        </tr>
      </table>
    </div>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
}

function exportStockItem(itemId) {
  const items = loadStockItems();
  const item = items.find(i => i.id === itemId);
  if (!item) return;
  
  const csvContent = `Item Code,Name,Category,Current Stock,Min Required,Unit Price,Total Value,Supplier,Last Updated
${item.id},${item.name},${item.category},${item.currentStock},${item.minRequired},${item.unitPrice},${item.currentStock * item.unitPrice},${item.supplier},${item.lastUpdated}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `stock-${item.id}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
  
  showToast('Stock item exported successfully', 'success');
}

function applyStockFilters() {
  renderStock();
}

// =============================================================================
// INVENTORY ANALYTICS FUNCTIONS
// =============================================================================

/**
 * Render inventory analytics including category breakdown and recent movements
 */
function renderInventoryAnalytics() {
  renderCategoryBreakdown();
  renderRecentMovements();
}

/**
 * Render category breakdown chart
 */
function renderCategoryBreakdown() {
  const container = document.getElementById('categoryBreakdown');
  if (!container) return;
  
  const items = loadStockItems();
  if (items.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
        <i class="pi pi-chart-pie" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        No data available
      </div>
    `;
    return;
  }
  
  // Group items by category
  const categoryData = {};
  items.forEach(item => {
    if (!categoryData[item.category]) {
      categoryData[item.category] = {
        count: 0,
        value: 0
      };
    }
    categoryData[item.category].count++;
    categoryData[item.category].value += item.currentStock * item.unitPrice;
  });
  
  // Sort by count
  const sortedCategories = Object.entries(categoryData)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 5); // Show top 5 categories
  
  if (sortedCategories.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
        <i class="pi pi-chart-pie" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        No category data available
      </div>
    `;
    return;
  }
  
  container.innerHTML = sortedCategories.map(([category, data]) => {
    const percentage = ((data.count / items.length) * 100).toFixed(1);
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: .5rem;">
        <span style="font-weight: 500;">${category}</span>
        <div style="text-align: right;">
          <div style="font-weight: 600;">${data.count} items</div>
          <div style="font-size: .8rem; color: var(--gray-500);">${formatINR(data.value)}</div>
        </div>
      </div>
      <div style="background: var(--gray-100); height: 4px; border-radius: 2px; margin-bottom: .75rem;">
        <div style="background: var(--brand-500); height: 100%; width: ${percentage}%; border-radius: 2px; transition: width 0.3s ease;"></div>
      </div>
    `;
  }).join('');
}

/**
 * Render recent stock movements
 */
function renderRecentMovements() {
  const container = document.getElementById('recentMovements');
  if (!container) return;
  
  const movements = loadStockMovements();
  if (movements.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
        <i class="pi pi-history" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
        No recent movements
      </div>
    `;
    return;
  }
  
  // Show last 5 movements
  const recentMovements = movements
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);
  
  container.innerHTML = recentMovements.map(movement => {
    const isPositive = movement.type === 'in' || movement.type === 'adjustment_in';
    const iconClass = isPositive ? 'pi pi-arrow-up' : 'pi pi-arrow-down';
    const colorClass = isPositive ? 'var(--success-500)' : 'var(--error-500)';
    const sign = isPositive ? '+' : '-';
    
    return `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; padding-bottom: .5rem; border-bottom: 1px solid var(--gray-100);">
        <div>
          <strong style="font-size: .9rem;">${movement.itemName}</strong>
          <div style="font-size: .8rem; color: var(--gray-500);">${movement.type === 'in' ? 'Stock Added' : movement.type === 'out' ? 'Stock Removed' : 'Stock Adjusted'}: ${sign}${movement.quantity} units</div>
        </div>
        <div style="text-align: right;">
          <span style="color: ${colorClass}; font-weight: 500; font-size: 1.1rem;">${sign}${movement.quantity}</span>
          <div style="font-size: .7rem; color: var(--gray-400);">${formatDate(movement.timestamp)}</div>
        </div>
      </div>
    `;
  }).join('');
}

// =============================================================================
// STOCK MOVEMENT FUNCTIONS
// =============================================================================

const STOCK_MOVEMENTS_STORAGE_KEY = 'logosic_stock_movements_v1';

/**
 * Load stock movements from storage
 */
function loadStockMovements() {
  try {
    const stored = localStorage.getItem(STOCK_MOVEMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Save stock movements to storage
 */
function saveStockMovements(movements) {
  try {
    localStorage.setItem(STOCK_MOVEMENTS_STORAGE_KEY, JSON.stringify(movements));
    return true;
  } catch (e) {
    console.error('Error saving stock movements:', e);
    return false;
  }
}

/**
 * Add stock movement record
 */
function addStockMovement(itemId, itemName, type, quantity, reason, notes = '') {
  const movements = loadStockMovements();
  const movement = {
    id: generateId('MOV', movements),
    itemId,
    itemName,
    type, // 'in', 'out', 'adjustment_in', 'adjustment_out'
    quantity: Math.abs(quantity),
    reason,
    notes,
    timestamp: new Date().toISOString(),
    user: 'Admin' // In a real app, this would be the logged-in user
  };
  
  movements.unshift(movement);
  saveStockMovements(movements);
  return movement;
}

/**
 * Open stock movement modal
 */
function openStockMovementModal() {
  const items = loadStockItems();
  if (items.length === 0) {
    showToast('No stock items available. Please add items first.', 'warning');
    return;
  }
  
  const body = `
    <div class="form-section">
      <h4>Stock Movement Details</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Item *</label>
          <select id="movementItemId" required onchange="updateMovementItemDetails()">
            <option value="">Select item...</option>
            ${items.map(item => `<option value="${item.id}" data-name="${item.name}" data-stock="${item.currentStock}">${item.name} (${item.id})</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Movement Type *</label>
          <select id="movementType" required>
            <option value="">Select type...</option>
            <option value="in">Stock In (Add)</option>
            <option value="out">Stock Out (Remove)</option>
            <option value="adjustment_in">Adjustment In</option>
            <option value="adjustment_out">Adjustment Out</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Quantity *</label>
          <input id="movementQuantity" type="number" min="1" placeholder="Enter quantity" required />
        </div>
        <div class="form-group col-6">
          <label>Current Stock</label>
          <input id="currentStockDisplay" type="text" readonly placeholder="Select item to see current stock" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Reason *</label>
          <select id="movementReason" required>
            <option value="">Select reason...</option>
            <option value="Purchase">Purchase</option>
            <option value="Sale">Sale</option>
            <option value="Return">Return</option>
            <option value="Adjustment">Adjustment</option>
            <option value="Transfer">Transfer</option>
            <option value="Damaged">Damaged</option>
            <option value="Expired">Expired</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>Notes</label>
          <input id="movementNotes" type="text" placeholder="Additional notes..." />
        </div>
      </div>
    </div>
  `;
  
  openModal('Stock Movement', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Record Movement', type: 'primary', action: processStockMovement }
  ], 'modal-large');
}

/**
 * Update movement item details when item is selected
 */
function updateMovementItemDetails() {
  const itemSelect = document.getElementById('movementItemId');
  const currentStockDisplay = document.getElementById('currentStockDisplay');
  
  if (itemSelect && currentStockDisplay) {
    const selectedOption = itemSelect.options[itemSelect.selectedIndex];
    if (selectedOption.value) {
      const currentStock = selectedOption.getAttribute('data-stock');
      currentStockDisplay.value = `${currentStock} units`;
    } else {
      currentStockDisplay.value = '';
    }
  }
}

/**
 * Process stock movement
 */
function processStockMovement() {
  const itemId = document.getElementById('movementItemId').value;
  const type = document.getElementById('movementType').value;
  const quantity = parseInt(document.getElementById('movementQuantity').value);
  const reason = document.getElementById('movementReason').value;
  const notes = document.getElementById('movementNotes').value.trim();
  
  if (!itemId || !type || !quantity || !reason || quantity <= 0) {
    showToast('Please fill all required fields correctly', 'error');
    return;
  }
  
  const items = loadStockItems();
  const item = items.find(i => i.id === itemId);
  if (!item) {
    showToast('Item not found', 'error');
    return;
  }
  
  // Check if removing more than available
  if ((type === 'out' || type === 'adjustment_out') && quantity > item.currentStock) {
    showToast(`Cannot remove more than current stock (${item.currentStock} units)`, 'error');
    return;
  }
  
  // Update stock quantity
  const isPositive = type === 'in' || type === 'adjustment_in';
  const quantityChange = isPositive ? quantity : -quantity;
  item.currentStock += quantityChange;
  item.lastUpdated = new Date().toISOString().slice(0, 10);
  
  // Add movement record
  addStockMovement(itemId, item.name, type, quantity, reason, notes);
  
  // Save updated items
  saveStockItems(items);
  
  closeModal();
  renderStock();
  showToast('Stock movement recorded successfully', 'success');
}

// =============================================================================
// EXPORT FUNCTIONS
// =============================================================================

/**
 * Export comprehensive stock report
 */
function exportStockReport() {
  const items = loadStockItems();
  const movements = loadStockMovements();
  
  if (items.length === 0) {
    showToast('No stock data to export', 'warning');
    return;
  }
  
  // Generate CSV content
  const csvContent = generateStockReportCSV(items, movements);
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `stock-inventory-report-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast('Stock report exported successfully', 'success');
}

/**
 * Generate CSV content for stock report
 */
function generateStockReportCSV(items, movements) {
  const headers = [
    'Item Code',
    'Product Name',
    'Category',
    'Current Stock',
    'Min Required',
    'Unit Price',
    'Total Value',
    'Status',
    'Supplier',
    'Last Updated',
    'Created Date'
  ];
  
  const csvRows = [headers.join(',')];
  
  items.forEach(item => {
    const status = getStockStatus(item.currentStock, item.minRequired);
    const totalValue = item.currentStock * item.unitPrice;
    
    const row = [
      item.id,
      `"${item.name}"`,
      item.category,
      item.currentStock,
      item.minRequired,
      item.unitPrice,
      totalValue,
      status,
      `"${item.supplier}"`,
      item.lastUpdated,
      item.createdAt ? item.createdAt.slice(0, 10) : ''
    ];
    
    csvRows.push(row.join(','));
  });
  
  // Add movements section
  if (movements.length > 0) {
    csvRows.push(''); // Empty row
    csvRows.push('STOCK MOVEMENTS');
    csvRows.push('Date,Item,Type,Quantity,Reason,Notes');
    
    movements.slice(0, 50).forEach(movement => { // Limit to last 50 movements
      const row = [
        movement.timestamp.slice(0, 10),
        `"${movement.itemName}"`,
        movement.type,
        movement.quantity,
        movement.reason,
        `"${movement.notes || ''}"`
      ];
      csvRows.push(row.join(','));
    });
  }
  
  return csvRows.join('\n');
}

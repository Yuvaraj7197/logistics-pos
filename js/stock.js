// Stock Management JavaScript
const STOCK_STORAGE_KEY = 'logosic_stock_v1';
const STOCK_CATEGORIES = ['Electronics', 'Furniture', 'Medical', 'Industrial', 'Automotive', 'Textiles', 'Food & Beverage', 'Other'];
const STOCK_STATUS = ['In Stock', 'Low Stock', 'Out of Stock'];

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

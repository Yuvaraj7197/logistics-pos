// Financial Management JavaScript
const FINANCIAL_STORAGE_KEY = 'logosic_financial_v1';

// Sample financial data - cleared
const FINANCIAL_RECORDS = [];

const FINANCIAL_TYPES = getConfig('business.financial.types', ['Machine EMI', 'Electric Bill', 'Transport Cost', 'Commission', 'Rent', 'Insurance', 'Maintenance', 'Other']);
// PAYMENT_METHODS is defined in billing.js
const FINANCIAL_STATUS = getConfig('business.financial.statuses', ['Paid', 'Pending', 'Overdue', 'Cancelled']);

// Storage functions
function loadFinancialRecords() {
  try {
    const stored = localStorage.getItem(FINANCIAL_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading financial records:', e);
  }
  return FINANCIAL_RECORDS;
}

function saveFinancialRecords(records) {
  try {
    localStorage.setItem(FINANCIAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving financial records:', e);
  }
}

// Utility functions
function financialBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'status-badge status-paid';
  if (s === 'pending') return 'status-badge status-pending';
  if (s === 'overdue') return 'status-badge status-cancelled';
  if (s === 'cancelled') return 'status-badge status-inactive';
  return 'status-badge status-pending';
}

function generateFinancialId() {
  const records = loadFinancialRecords();
  let max = 0;
  records.forEach(record => {
    const n = parseInt((record.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(3, '0');
  return `FIN-${next}`;
}

// Main render function
function renderFinancialRecords() {
  const tbody = document.getElementById('financialTbody');
  if (!tbody) return;
  
  const records = loadFinancialRecords();
  
  // Apply filters
  const typeFilter = document.getElementById('financialTypeFilter')?.value || '';
  const statusFilter = document.getElementById('financialStatusFilter')?.value || '';
  const dateStart = document.getElementById('financialDateStart')?.value || '';
  const dateEnd = document.getElementById('financialDateEnd')?.value || '';
  const searchTerm = document.getElementById('searchFinancialRecords')?.value?.toLowerCase() || '';
  const sortBy = document.getElementById('sortFinancialRecords')?.value || 'date-desc';
  
  let filtered = records.filter(record => {
    if (typeFilter && record.type !== typeFilter) return false;
    if (statusFilter && record.status !== statusFilter) return false;
    if (dateStart && record.date < dateStart) return false;
    if (dateEnd && record.date > dateEnd) return false;
    if (searchTerm) {
      const searchText = `${record.description} ${record.amount} ${record.reference || ''}`.toLowerCase();
      if (!searchText.includes(searchTerm)) return false;
    }
    return true;
  });
  
  // Sort records
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'type':
        return a.type.localeCompare(b.type);
      default:
        return 0;
    }
  });
  
  // Initialize or update pagination
  if (!window.paginationInstances['financialContainer']) {
    createPagination('financialContainer');
  }
  
  const pagination = window.paginationInstances['financialContainer'];
  pagination.applyFilters(filtered);
  
  // Get current page data
  const currentPageData = pagination.getCurrentPageData();
  
  // Render table
  if (currentPageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="text-center" style="padding: 2rem; color: var(--gray-500);">
          <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No financial records found
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = currentPageData.map(record => `
    <tr>
      <td>${formatDate(record.date)}</td>
      <td>${record.type}</td>
      <td>${record.description}</td>
      <td>${formatINR(record.amount)}</td>
      <td><span class="${financialBadgeClass(record.status)}">${record.status}</span></td>
      <td>${record.paymentMethod}</td>
      <td>${record.reference || '-'}</td>
      <td>
        ${createTableActionsDropdown(record.id, [
          { label: 'View Details', icon: 'pi pi-eye', onclick: `viewFinancialRecord('${record.id}')` },
          { label: 'Edit Record', icon: 'pi pi-pencil', onclick: `editFinancialRecord('${record.id}')` },
          { label: 'Mark Paid', icon: 'pi pi-check', onclick: `markFinancialPaid('${record.id}')`, class: 'success' },
          { label: 'Print Receipt', icon: 'pi pi-print', onclick: `printFinancialReceipt('${record.id}')` },
          { label: 'Export', icon: 'pi pi-download', onclick: `exportFinancialRecord('${record.id}')` },
          { label: 'Duplicate', icon: 'pi pi-copy', onclick: `duplicateFinancialRecord('${record.id}')` },
          { label: 'Delete', icon: 'pi pi-trash', onclick: `deleteFinancialRecord('${record.id}')`, class: 'danger' }
        ])}
      </td>
    </tr>
  `).join('');
  
  updateFinancialStats();
}

function updateFinancialStats() {
  const records = loadFinancialRecords();
  const totalAmount = records.reduce((sum, record) => sum + record.amount, 0);
  const paidAmount = records.filter(r => r.status === 'Paid').reduce((sum, record) => sum + record.amount, 0);
  const pendingAmount = records.filter(r => r.status === 'Pending').reduce((sum, record) => sum + record.amount, 0);
  const overdueAmount = records.filter(r => r.status === 'Overdue').reduce((sum, record) => sum + record.amount, 0);
  
  // Update stats display if elements exist
  const totalEl = document.getElementById('totalFinancialAmount');
  const paidEl = document.getElementById('paidFinancialAmount');
  const pendingEl = document.getElementById('pendingFinancialAmount');
  const overdueEl = document.getElementById('overdueFinancialAmount');
  
  if (totalEl) totalEl.textContent = formatINR(totalAmount);
  if (paidEl) paidEl.textContent = formatINR(paidAmount);
  if (pendingEl) pendingEl.textContent = formatINR(pendingAmount);
  if (overdueEl) overdueEl.textContent = formatINR(overdueAmount);
}

// Financial record management functions
function addFinancialRecord() {
  const body = `
    <div class="form-section">
      <h4>Financial Record Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Type *</label>
          <select id="financialType" required>
            <option value="">Select type...</option>
            ${FINANCIAL_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Amount (INR) *</label>
          <input id="financialAmount" type="number" min="0" step="0.01" placeholder="Enter amount" required />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Description *</label>
        <input id="financialDescription" type="text" placeholder="Enter description" required />
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="financialStatus" required>
            <option value="">Select status...</option>
            ${FINANCIAL_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Payment Method *</label>
          <select id="financialPaymentMethod" required>
            <option value="">Select method...</option>
            ${window.PAYMENT_METHODS ? window.PAYMENT_METHODS.map(method => `<option value="${method}">${method}</option>`).join('') : ''}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Date *</label>
          <input id="financialDate" type="date" required />
        </div>
        <div class="form-group col-6">
          <label>Due Date</label>
          <input id="financialDueDate" type="date" />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Reference Number</label>
        <input id="financialReference" type="text" placeholder="Enter reference number" />
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="financialNotes" placeholder="Enter notes" rows="3"></textarea>
      </div>
    </div>
  `;
  
  openModal('Add Financial Record', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Add Record', type: 'primary', action: () => {
      const type = document.getElementById('financialType').value;
      const description = document.getElementById('financialDescription').value.trim();
      const amount = parseFloat(document.getElementById('financialAmount').value);
      const status = document.getElementById('financialStatus').value;
      const paymentMethod = document.getElementById('financialPaymentMethod').value;
      const reference = document.getElementById('financialReference').value.trim();
      const date = document.getElementById('financialDate').value;
      const dueDate = document.getElementById('financialDueDate').value;
      const notes = document.getElementById('financialNotes').value.trim();
      
      if (!type || !description || isNaN(amount) || !status || !paymentMethod || !date || amount <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      const records = loadFinancialRecords();
      const newRecord = {
        id: generateFinancialId(),
        type,
        description,
        amount,
        status,
        paymentMethod,
        reference: reference || 'N/A',
        date,
        dueDate: dueDate || date,
        notes: notes || 'N/A',
        createdAt: new Date().toISOString()
      };
      
      records.unshift(newRecord);
      saveFinancialRecords(records);
      closeModal();
      renderFinancialRecords();
      updateDashboardStats(); // Update dashboard stats
      showToast('Financial record added successfully', 'success');
    }}
  ]);
  
  // Set default date to today
  setTimeout(() => {
    const dateInput = document.getElementById('financialDate');
    if (dateInput) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
  }, 100);
}

function viewFinancialRecord(recordId) {
  const records = loadFinancialRecords();
  const record = records.find(r => r.id === recordId);
  if (!record) return;
  
  const html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Record ID</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--brand-600);">${record.id}</div>
      </div>
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Status</div>
        <div><span class="${financialBadgeClass(record.status)}">${record.status}</span></div>
      </div>
    </div>
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Record Details</div>
      <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">${record.description}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
        <div><strong>Type:</strong> ${record.type}</div>
        <div><strong>Amount:</strong> ${formatINR(record.amount)}</div>
        <div><strong>Payment Method:</strong> ${record.paymentMethod}</div>
        <div><strong>Reference:</strong> ${record.reference}</div>
        <div><strong>Date:</strong> ${formatDate(record.date)}</div>
        <div><strong>Due Date:</strong> ${formatDate(record.dueDate)}</div>
      </div>
    </div>
    
    ${record.notes !== 'N/A' ? `
      <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Notes</div>
        <div style="font-size: 0.9rem;">${record.notes}</div>
      </div>
    ` : ''}
  `;
  
  openModal('Financial Record Details', html, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Edit', type: 'primary', action: () => { closeModal(); editFinancialRecord(recordId); } }
  ], 'large');
}

function editFinancialRecord(recordId) {
  const records = loadFinancialRecords();
  const record = records.find(r => r.id === recordId);
  if (!record) return;
  
  const body = `
    <div class="form-section">
      <h4>Financial Record Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Type *</label>
          <select id="editFinancialType" required>
            <option value="">Select type...</option>
            ${FINANCIAL_TYPES.map(type => `<option value="${type}" ${record.type === type ? 'selected' : ''}>${type}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Amount (INR) *</label>
          <input id="editFinancialAmount" type="number" min="0" step="0.01" value="${record.amount}" required />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Description *</label>
        <input id="editFinancialDescription" type="text" value="${record.description}" required />
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="editFinancialStatus" required>
            <option value="">Select status...</option>
            ${FINANCIAL_STATUS.map(status => `<option value="${status}" ${record.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Payment Method *</label>
          <select id="editFinancialPaymentMethod" required>
            <option value="">Select method...</option>
            ${window.PAYMENT_METHODS ? window.PAYMENT_METHODS.map(method => `<option value="${method}" ${record.paymentMethod === method ? 'selected' : ''}>${method}</option>`).join('') : ''}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Date *</label>
          <input id="editFinancialDate" type="date" value="${record.date}" required />
        </div>
        <div class="form-group col-6">
          <label>Due Date</label>
          <input id="editFinancialDueDate" type="date" value="${record.dueDate}" />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Reference Number</label>
        <input id="editFinancialReference" type="text" value="${record.reference}" />
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="editFinancialNotes" rows="3">${record.notes}</textarea>
      </div>
    </div>
  `;
  
  openModal('Edit Financial Record', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Update Record', type: 'primary', action: () => {
      const type = document.getElementById('editFinancialType').value;
      const description = document.getElementById('editFinancialDescription').value.trim();
      const amount = parseFloat(document.getElementById('editFinancialAmount').value);
      const status = document.getElementById('editFinancialStatus').value;
      const paymentMethod = document.getElementById('editFinancialPaymentMethod').value;
      const reference = document.getElementById('editFinancialReference').value.trim();
      const date = document.getElementById('editFinancialDate').value;
      const dueDate = document.getElementById('editFinancialDueDate').value;
      const notes = document.getElementById('editFinancialNotes').value.trim();
      
      if (!type || !description || isNaN(amount) || !status || !paymentMethod || !date || amount <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      const recordIndex = records.findIndex(r => r.id === recordId);
      if (recordIndex === -1) return;
      
      records[recordIndex] = {
        ...records[recordIndex],
        type,
        description,
        amount,
        status,
        paymentMethod,
        reference: reference || 'N/A',
        date,
        dueDate: dueDate || date,
        notes: notes || 'N/A',
        updatedAt: new Date().toISOString()
      };
      
      saveFinancialRecords(records);
      closeModal();
      renderFinancialRecords();
      updateDashboardStats(); // Update dashboard stats
      showToast('Financial record updated successfully', 'success');
    }}
  ]);
}

function deleteFinancialRecord(recordId) {
  const records = loadFinancialRecords();
  const record = records.find(r => r.id === recordId);
  if (!record) return;
  
  confirmModal('Delete Financial Record', `Are you sure you want to delete this financial record: ${record.description}?`, () => {
    const filtered = records.filter(r => r.id !== recordId);
    saveFinancialRecords(filtered);
    renderFinancialRecords();
    showToast('Financial record deleted successfully', 'success');
  });
}

// Filter functions
function applyFinancialFilters() {
  renderFinancialRecords();
}

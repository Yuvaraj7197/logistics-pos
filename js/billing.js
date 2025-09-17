// Billing Management JavaScript
const BILLING_STORAGE_KEY = 'logosic_billing_v1';

// Sample billing data
const BILLING_RECORDS = [
  { id: 'INV-001', customer: 'ABC Company', amount: 45000, issueDate: '2025-09-01', dueDate: '2025-09-15', status: 'Paid', paymentMethod: 'Bank Transfer' },
  { id: 'INV-002', customer: 'XYZ Industries', amount: 25000, issueDate: '2025-09-02', dueDate: '2025-09-17', status: 'Unpaid', paymentMethod: 'UPI' },
  { id: 'INV-003', customer: 'DEF Construction', amount: 15000, issueDate: '2025-09-03', dueDate: '2025-09-18', status: 'Paid', paymentMethod: 'Cash' },
  { id: 'INV-004', customer: 'GHI Manufacturing', amount: 75000, issueDate: '2025-09-04', dueDate: '2025-09-19', status: 'Overdue', paymentMethod: 'Bank Transfer' },
  { id: 'INV-005', customer: 'JKL Enterprises', amount: 12000, issueDate: '2025-09-05', dueDate: '2025-09-20', status: 'Partial', paymentMethod: 'Cheque' }
];

const BILLING_STATUS = ['Paid', 'Unpaid', 'Overdue', 'Partial', 'Cancelled'];
window.PAYMENT_METHODS = ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Credit Card', 'Online Payment'];

// Storage functions
function loadInvoices() {
  try {
    const stored = localStorage.getItem(BILLING_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading invoices:', e);
  }
  return BILLING_RECORDS;
}

function saveInvoices(invoices) {
  try {
    localStorage.setItem(BILLING_STORAGE_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Error saving invoices:', e);
  }
}

// Utility functions
function billingBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'status-badge status-paid';
  if (s === 'unpaid') return 'status-badge status-unpaid';
  if (s === 'overdue') return 'status-badge status-cancelled';
  if (s === 'partial') return 'status-badge status-pending';
  if (s === 'cancelled') return 'status-badge status-inactive';
  return 'status-badge status-pending';
}

function generateInvoiceId() {
  const invoices = loadInvoices();
  let max = 0;
  invoices.forEach(invoice => {
    const n = parseInt((invoice.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(3, '0');
  return `INV-${next}`;
}

// Main render function
function renderInvoices() {
  const tbody = document.getElementById('billingTbody');
  if (!tbody) return;
  
  const invoices = loadInvoices();
  
  // Initialize or update pagination
  if (!window.paginationInstances['billingContainer']) {
    createPagination('billingContainer', 10);
  }
  
  const pagination = window.paginationInstances['billingContainer'];
  pagination.updateData(invoices);
  
  // Get current page data
  const currentPageData = pagination.getCurrentPageData();
  
  // Render table
  if (currentPageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center" style="padding: 2rem; color: var(--gray-500);">
          <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No invoices found
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = currentPageData.map(invoice => `
    <tr>
      <td><strong>${invoice.id}</strong></td>
      <td>${invoice.customer}</td>
      <td>${formatINR(invoice.amount)}</td>
      <td>${formatDate(invoice.issueDate)}</td>
      <td>${formatDate(invoice.dueDate)}</td>
      <td><span class="${billingBadgeClass(invoice.status)}">${invoice.status}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-primary btn-sm" onclick="viewInvoice('${invoice.id}')">
            <i class="pi pi-eye"></i> View
          </button>
          <button class="btn btn-secondary btn-sm" onclick="editInvoice('${invoice.id}')">
            <i class="pi pi-pencil"></i> Edit
          </button>
          <button class="btn btn-secondary btn-sm" onclick="printInvoice('${invoice.id}')">
            <i class="pi pi-print"></i> Print
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Invoice management functions
function openCreateInvoiceModal() {
  const body = `
    <div class="form-group">
      <label>Customer Name *</label>
      <input id="invoiceCustomer" type="text" placeholder="Enter customer name" required />
    </div>
    <div class="form-group">
      <label>Amount (INR) *</label>
      <input id="invoiceAmount" type="number" min="0" step="0.01" placeholder="Enter amount" required />
    </div>
    <div class="form-group">
      <label>Issue Date *</label>
      <input id="invoiceIssueDate" type="date" required />
    </div>
    <div class="form-group">
      <label>Due Date *</label>
      <input id="invoiceDueDate" type="date" required />
    </div>
    <div class="form-group">
      <label>Status *</label>
      <select id="invoiceStatus" required>
        <option value="">Select status...</option>
        ${BILLING_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Payment Method</label>
      <select id="invoicePaymentMethod">
        <option value="">Select method...</option>
        ${PAYMENT_METHODS.map(method => `<option value="${method}">${method}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="invoiceDescription" placeholder="Enter invoice description" rows="3"></textarea>
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="invoiceNotes" placeholder="Enter any notes" rows="2"></textarea>
    </div>
  `;
  
  openModal('Create Invoice', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Create Invoice', type: 'primary', action: () => {
      const customer = document.getElementById('invoiceCustomer').value.trim();
      const amount = parseFloat(document.getElementById('invoiceAmount').value);
      const issueDate = document.getElementById('invoiceIssueDate').value;
      const dueDate = document.getElementById('invoiceDueDate').value;
      const status = document.getElementById('invoiceStatus').value;
      const paymentMethod = document.getElementById('invoicePaymentMethod').value;
      const description = document.getElementById('invoiceDescription').value.trim();
      const notes = document.getElementById('invoiceNotes').value.trim();
      
      if (!customer || isNaN(amount) || !issueDate || !dueDate || !status || amount <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      if (new Date(dueDate) < new Date(issueDate)) {
        showToast('Due date cannot be before issue date', 'error');
        return;
      }
      
      const invoices = loadInvoices();
      const newInvoice = {
        id: generateInvoiceId(),
        customer,
        amount,
        issueDate,
        dueDate,
        status,
        paymentMethod: paymentMethod || 'N/A',
        description: description || 'N/A',
        notes: notes || 'N/A',
        createdAt: new Date().toISOString()
      };
      
      invoices.unshift(newInvoice);
      saveInvoices(invoices);
      closeModal();
      renderInvoices();
      showToast('Invoice created successfully', 'success');
    }}
  ]);
  
  // Set default dates
  setTimeout(() => {
    const issueDateInput = document.getElementById('invoiceIssueDate');
    const dueDateInput = document.getElementById('invoiceDueDate');
    if (issueDateInput) {
      issueDateInput.value = new Date().toISOString().slice(0, 10);
    }
    if (dueDateInput) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15); // 15 days from today
      dueDateInput.value = dueDate.toISOString().slice(0, 10);
    }
  }, 100);
}

function viewInvoice(invoiceId) {
  const invoices = loadInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) return;
  
  const html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Invoice ID</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--brand-600);">${invoice.id}</div>
      </div>
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Status</div>
        <div><span class="${billingBadgeClass(invoice.status)}">${invoice.status}</span></div>
      </div>
    </div>
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Invoice Details</div>
      <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">${invoice.customer}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
        <div><strong>Amount:</strong> ${formatINR(invoice.amount)}</div>
        <div><strong>Issue Date:</strong> ${formatDate(invoice.issueDate)}</div>
        <div><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</div>
        <div><strong>Payment Method:</strong> ${invoice.paymentMethod}</div>
        <div><strong>Created:</strong> ${formatDate(invoice.createdAt)}</div>
        <div><strong>Days Overdue:</strong> ${calculateDaysOverdue(invoice.dueDate)}</div>
      </div>
    </div>
    
    ${invoice.description !== 'N/A' ? `
      <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Description</div>
        <div style="font-size: 0.9rem;">${invoice.description}</div>
      </div>
    ` : ''}
    
    ${invoice.notes !== 'N/A' ? `
      <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Notes</div>
        <div style="font-size: 0.9rem;">${invoice.notes}</div>
      </div>
    ` : ''}
  `;
  
  openModal('Invoice Details', html, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Edit', type: 'primary', action: () => { closeModal(); editInvoice(invoiceId); } }
  ], 'large');
}

function editInvoice(invoiceId) {
  const invoices = loadInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) return;
  
  const body = `
    <div class="form-group">
      <label>Customer Name *</label>
      <input id="editInvoiceCustomer" type="text" value="${invoice.customer}" required />
    </div>
    <div class="form-group">
      <label>Amount (INR) *</label>
      <input id="editInvoiceAmount" type="number" min="0" step="0.01" value="${invoice.amount}" required />
    </div>
    <div class="form-group">
      <label>Issue Date *</label>
      <input id="editInvoiceIssueDate" type="date" value="${invoice.issueDate}" required />
    </div>
    <div class="form-group">
      <label>Due Date *</label>
      <input id="editInvoiceDueDate" type="date" value="${invoice.dueDate}" required />
    </div>
    <div class="form-group">
      <label>Status *</label>
      <select id="editInvoiceStatus" required>
        <option value="">Select status...</option>
        ${BILLING_STATUS.map(status => `<option value="${status}" ${invoice.status === status ? 'selected' : ''}>${status}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Payment Method</label>
      <select id="editInvoicePaymentMethod">
        <option value="">Select method...</option>
        ${PAYMENT_METHODS.map(method => `<option value="${method}" ${invoice.paymentMethod === method ? 'selected' : ''}>${method}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Description</label>
      <textarea id="editInvoiceDescription" rows="3">${invoice.description || ''}</textarea>
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="editInvoiceNotes" rows="2">${invoice.notes || ''}</textarea>
    </div>
  `;
  
  openModal('Edit Invoice', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Update Invoice', type: 'primary', action: () => {
      const customer = document.getElementById('editInvoiceCustomer').value.trim();
      const amount = parseFloat(document.getElementById('editInvoiceAmount').value);
      const issueDate = document.getElementById('editInvoiceIssueDate').value;
      const dueDate = document.getElementById('editInvoiceDueDate').value;
      const status = document.getElementById('editInvoiceStatus').value;
      const paymentMethod = document.getElementById('editInvoicePaymentMethod').value;
      const description = document.getElementById('editInvoiceDescription').value.trim();
      const notes = document.getElementById('editInvoiceNotes').value.trim();
      
      if (!customer || isNaN(amount) || !issueDate || !dueDate || !status || amount <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      if (new Date(dueDate) < new Date(issueDate)) {
        showToast('Due date cannot be before issue date', 'error');
        return;
      }
      
      const invoiceIndex = invoices.findIndex(i => i.id === invoiceId);
      if (invoiceIndex === -1) return;
      
      invoices[invoiceIndex] = {
        ...invoices[invoiceIndex],
        customer,
        amount,
        issueDate,
        dueDate,
        status,
        paymentMethod: paymentMethod || 'N/A',
        description: description || 'N/A',
        notes: notes || 'N/A',
        updatedAt: new Date().toISOString()
      };
      
      saveInvoices(invoices);
      closeModal();
      renderInvoices();
      showToast('Invoice updated successfully', 'success');
    }}
  ]);
}

function printInvoice(invoiceId) {
  const invoices = loadInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) return;
  
  const html = `
    <html><head><title>Invoice ${invoice.id}</title><meta charset='utf-8'/>
    <style>body{font-family:Inter,Segoe UI,Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#111827}
    .invoice{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;max-width:850px;margin:0 auto}
    .header{text-align:center;margin-bottom:24px;border-bottom:2px solid #e5e7eb;padding-bottom:16px}
    .row{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:12px}
    table{border-collapse:collapse;width:100%;margin-top:12px}
    th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
    th{background:#f9fafb;font-weight:600}
    .muted{color:#6b7280;font-size:0.9rem}
    .total{font-weight:700;font-size:1.1rem;color:#7c3aed}
    </style></head><body>
    <div class='invoice'>
      <div class='header'>
        <h1 style='margin:0;color:#7c3aed'>INVOICE</h1>
        <div class='muted'>Invoice #${invoice.id}</div>
      </div>
      
      <div class='row'>
        <div>
          <div style='font-weight:600'>Bill To:</div>
          <div>${invoice.customer}</div>
        </div>
        <div style='text-align:right'>
          <div style='font-weight:600'>Status: ${invoice.status}</div>
          <div class='muted'>Issue Date: ${formatDate(invoice.issueDate)}</div>
          <div class='muted'>Due Date: ${formatDate(invoice.dueDate)}</div>
        </div>
      </div>
      
      <table>
        <tr><th>Description</th><th>Amount</th></tr>
        <tr><td>${invoice.description}</td><td class='total'>${formatINR(invoice.amount)}</td></tr>
      </table>
      
      <div style='text-align:right;margin-top:16px'>
        <div style='font-size:1.2rem;font-weight:700'>Total: ${formatINR(invoice.amount)}</div>
        <div class='muted'>Payment Method: ${invoice.paymentMethod}</div>
      </div>
    </div>
    <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),300)}<\/script>
    </body></html>`;
  
  const w = window.open('', '_blank');
  if (!w) {
    showToast('Popup blocked. Allow popups.', 'error');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function calculateDaysOverdue(dueDate) {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = today - due;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

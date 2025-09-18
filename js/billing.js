// Billing Management JavaScript
const BILLING_STORAGE_KEY = 'logosic_billing_v1';

// Sample billing data - cleared
const BILLING_RECORDS = [];

const BILLING_STATUS = getConfig('business.billing.statuses', ['Paid', 'Unpaid', 'Overdue', 'Partial', 'Cancelled']);
const QUOTATION_STATUS = getConfig('business.billing.quotationStatuses', ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']);
window.PAYMENT_METHODS = getConfig('business.billing.paymentMethods', ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Credit Card', 'Online Payment']);

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

// Quotation storage functions
function loadQuotations() {
  try {
    const stored = localStorage.getItem('logosic_quotations_v1');
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading quotations:', e);
  }
  return [];
}

function saveQuotations(quotations) {
  try {
    localStorage.setItem('logosic_quotations_v1', JSON.stringify(quotations));
  } catch (e) {
    console.error('Error saving quotations:', e);
  }
}

function generateQuotationId() {
  const quotations = loadQuotations();
  let max = 0;
  quotations.forEach(quotation => {
    const n = parseInt((quotation.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(3, '0');
  return `QUO-${next}`;
}

function quotationBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'draft') return 'status-badge status-pending';
  if (s === 'sent') return 'status-badge status-active';
  if (s === 'accepted') return 'status-badge status-completed';
  if (s === 'rejected') return 'status-badge status-cancelled';
  if (s === 'expired') return 'status-badge status-inactive';
  return 'status-badge status-pending';
}

// Main render function
function renderInvoices() {
  const tbody = document.getElementById('billingTbody');
  if (!tbody) return;
  
  const invoices = loadInvoices();
  
  // Initialize or update pagination
  if (!window.paginationInstances['billingContainer']) {
    createPagination('billingContainer');
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
        ${createTableActionsDropdown(invoice.id, [
          { label: 'View Invoice', icon: 'pi pi-eye', onclick: `viewInvoice('${invoice.id}')` },
          { label: 'Edit Invoice', icon: 'pi pi-pencil', onclick: `editInvoice('${invoice.id}')` },
          { label: 'Print Invoice', icon: 'pi pi-print', onclick: `printInvoice('${invoice.id}')` },
          { label: 'Send Email', icon: 'pi pi-send', onclick: `sendInvoiceEmail('${invoice.id}')` },
          { label: 'Mark Paid', icon: 'pi pi-check', onclick: `markInvoicePaid('${invoice.id}')`, class: 'success' },
          { label: 'Export PDF', icon: 'pi pi-download', onclick: `exportInvoicePDF('${invoice.id}')` },
          { label: 'Delete', icon: 'pi pi-trash', onclick: `deleteInvoice('${invoice.id}')`, class: 'danger' }
        ])}
      </td>
    </tr>
  `).join('');
}

// Invoice management functions
function openCreateInvoiceModal() {
  const body = `
    <div class="form-section">
      <h4>Invoice Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Name *</label>
          <input id="invoiceCustomer" type="text" placeholder="Enter customer name" required />
        </div>
        <div class="form-group col-6">
          <label>Amount (INR) *</label>
          <input id="invoiceAmount" type="number" min="0" step="0.01" placeholder="Enter amount" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Issue Date *</label>
          <input id="invoiceIssueDate" type="date" required />
        </div>
        <div class="form-group col-6">
          <label>Due Date *</label>
          <input id="invoiceDueDate" type="date" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="invoiceStatus" required>
            <option value="">Select status...</option>
            ${BILLING_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Payment Method</label>
          <select id="invoicePaymentMethod">
            <option value="">Select method...</option>
            ${PAYMENT_METHODS.map(method => `<option value="${method}">${method}</option>`).join('')}
          </select>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4>Additional Information</h4>
      <div class="form-group col-12">
        <label>Description</label>
        <textarea id="invoiceDescription" placeholder="Enter invoice description" rows="3"></textarea>
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="invoiceNotes" placeholder="Enter any notes" rows="2"></textarea>
      </div>
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
      updateDashboardStats(); // Update dashboard stats
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
      updateDashboardStats(); // Update dashboard stats
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

// =============================================================================
// QUOTATION MANAGEMENT FUNCTIONS
// =============================================================================

/**
 * Open create quotation modal
 */
function openCreateQuotationModal() {
  const body = `
    <div class="form-section">
      <h4>Customer Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Name *</label>
          <input id="quotationCustomer" type="text" placeholder="Enter customer name" required />
        </div>
        <div class="form-group col-6">
          <label>Company Name</label>
          <input id="quotationCompany" type="text" placeholder="Enter company name" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Email</label>
          <input id="quotationEmail" type="email" placeholder="Enter customer email" />
        </div>
        <div class="form-group col-6">
          <label>Customer Phone</label>
          <input id="quotationPhone" type="tel" placeholder="Enter customer phone" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4>Product/Service Details</h4>
      <div class="form-group col-12">
        <label>Service/Product Description *</label>
        <textarea id="quotationDescription" placeholder="Enter detailed description of services/products" rows="4" required></textarea>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Quantity *</label>
          <input id="quotationQuantity" type="number" min="1" placeholder="Enter quantity" required />
        </div>
        <div class="form-group col-6">
          <label>Unit Price (INR) *</label>
          <input id="quotationUnitPrice" type="number" min="0" step="0.01" placeholder="Enter unit price" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Discount (%)</label>
          <input id="quotationDiscount" type="number" min="0" max="100" step="0.01" placeholder="Enter discount percentage" value="0" />
        </div>
        <div class="form-group col-6">
          <label>Tax Rate (%)</label>
          <input id="quotationTaxRate" type="number" min="0" max="100" step="0.01" placeholder="Enter tax rate" value="18" />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4>Business Terms</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Valid Until *</label>
          <input id="quotationValidUntil" type="date" required />
        </div>
        <div class="form-group col-6">
          <label>Notes</label>
          <textarea id="quotationNotes" placeholder="Enter any additional notes" rows="2"></textarea>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Terms & Conditions</label>
        <textarea id="quotationTerms" placeholder="Enter terms and conditions" rows="3"></textarea>
      </div>
    </div>
  `;
  
  openModal('Create Quotation', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Create Quotation', type: 'primary', action: () => {
      const customer = document.getElementById('quotationCustomer').value.trim();
      const email = document.getElementById('quotationEmail').value.trim();
      const phone = document.getElementById('quotationPhone').value.trim();
      const company = document.getElementById('quotationCompany').value.trim();
      const description = document.getElementById('quotationDescription').value.trim();
      const quantity = parseInt(document.getElementById('quotationQuantity').value, 10);
      const unitPrice = parseFloat(document.getElementById('quotationUnitPrice').value);
      const discount = parseFloat(document.getElementById('quotationDiscount').value) || 0;
      const taxRate = parseFloat(document.getElementById('quotationTaxRate').value) || 18;
      const validUntil = document.getElementById('quotationValidUntil').value;
      const terms = document.getElementById('quotationTerms').value.trim();
      const notes = document.getElementById('quotationNotes').value.trim();
      
      if (!customer || !description || isNaN(quantity) || isNaN(unitPrice) || !validUntil || quantity <= 0 || unitPrice <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      // Calculate totals
      const subtotal = quantity * unitPrice;
      const discountAmount = (subtotal * discount) / 100;
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = (taxableAmount * taxRate) / 100;
      const totalAmount = taxableAmount + taxAmount;
      
      const quotations = loadQuotations();
      const newQuotation = {
        id: generateQuotationId(),
        customer,
        email: email || 'N/A',
        phone: phone || 'N/A',
        company: company || 'N/A',
        description,
        quantity,
        unitPrice,
        subtotal,
        discount,
        discountAmount,
        taxRate,
        taxAmount,
        totalAmount,
        validUntil,
        terms: terms || 'Standard terms and conditions apply',
        notes: notes || 'N/A',
        status: 'Draft',
        createdDate: new Date().toISOString().slice(0, 10),
        createdAt: new Date().toISOString()
      };
      
      quotations.unshift(newQuotation);
      saveQuotations(quotations);
      closeModal();
      renderInvoices(); // Refresh the billing table
      showToast(`Quotation ${newQuotation.id} created successfully`, 'success');
    }}
  ]);
  
  // Set default valid until date (30 days from now)
  setTimeout(() => {
    const validUntilInput = document.getElementById('quotationValidUntil');
    if (validUntilInput) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      validUntilInput.value = futureDate.toISOString().slice(0, 10);
    }
  }, 100);
}

/**
 * View quotation details
 */
function viewQuotation(quotationId) {
  const quotations = loadQuotations();
  const quotation = quotations.find(q => q.id === quotationId);
  if (!quotation) {
    showToast('Quotation not found', 'error');
    return;
  }
  
  const html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Quotation ID</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--brand-600);">${quotation.id}</div>
      </div>
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Status</div>
        <div><span class="${quotationBadgeClass(quotation.status)}">${quotation.status}</span></div>
      </div>
    </div>
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Customer Information</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
        <div><strong>Name:</strong> ${quotation.customer}</div>
        <div><strong>Email:</strong> ${quotation.email}</div>
        <div><strong>Phone:</strong> ${quotation.phone}</div>
        <div><strong>Company:</strong> ${quotation.company}</div>
      </div>
    </div>
    
    <div style="margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Service/Product Details</div>
      <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid var(--gray-200);">
        <div style="margin-bottom: 0.5rem;"><strong>Description:</strong> ${quotation.description}</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
          <div><strong>Quantity:</strong> ${quotation.quantity}</div>
          <div><strong>Unit Price:</strong> ${formatINR(quotation.unitPrice)}</div>
        </div>
      </div>
    </div>
    
    <div style="background: var(--brand-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--brand-700); margin-bottom: 0.5rem;">Pricing Breakdown</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
        <div><strong>Subtotal:</strong> ${formatINR(quotation.subtotal)}</div>
        <div><strong>Discount (${quotation.discount}%):</strong> -${formatINR(quotation.discountAmount)}</div>
        <div><strong>Tax (${quotation.taxRate}%):</strong> ${formatINR(quotation.taxAmount)}</div>
        <div><strong>Total Amount:</strong> <span style="font-weight: 700; color: var(--brand-600);">${formatINR(quotation.totalAmount)}</span></div>
      </div>
    </div>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Created Date</div>
        <div>${formatDate(quotation.createdDate)}</div>
      </div>
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Valid Until</div>
        <div>${formatDate(quotation.validUntil)}</div>
      </div>
    </div>
    
    ${quotation.terms ? `
      <div style="margin-bottom: 1rem;">
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Terms & Conditions</div>
        <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid var(--gray-200); font-size: 0.9rem;">
          ${quotation.terms}
        </div>
      </div>
    ` : ''}
    
    ${quotation.notes && quotation.notes !== 'N/A' ? `
      <div style="margin-bottom: 1rem;">
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Notes</div>
        <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid var(--gray-200); font-size: 0.9rem;">
          ${quotation.notes}
        </div>
      </div>
    ` : ''}
  `;
  
  openModal('Quotation Details', html, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Print Quotation', type: 'primary', action: () => printQuotation(quotationId) },
    { label: 'Convert to Invoice', type: 'success', action: () => convertQuotationToInvoice(quotationId) }
  ]);
}

/**
 * Print quotation
 */
function printQuotation(quotationId) {
  const quotations = loadQuotations();
  const quotation = quotations.find(q => q.id === quotationId);
  if (!quotation) return;
  
  const html = `
    <html><head><title>Quotation ${quotation.id}</title><meta charset='utf-8'/>
    <style>body{font-family:Inter,Segoe UI,Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#111827}
    .quotation{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;max-width:850px;margin:0 auto}
    .header{text-align:center;margin-bottom:24px;border-bottom:2px solid #e5e7eb;padding-bottom:16px}
    .row{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:12px}
    table{border-collapse:collapse;width:100%;margin-top:12px}
    th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
    th{background:#f9fafb;font-weight:600}
    .muted{color:#6b7280;font-size:0.9rem}
    .total{font-weight:700;font-size:1.1rem;color:#7c3aed}
    </style></head><body>
    <div class='quotation'>
      <div class='header'>
        <h1 style='margin:0;color:#7c3aed'>QUOTATION</h1>
        <div class='muted'>Quotation #${quotation.id}</div>
      </div>
      
      <div class='row'>
        <div>
          <div style='font-weight:600'>Quote To:</div>
          <div>${quotation.customer}</div>
          <div class='muted'>${quotation.company}</div>
          <div class='muted'>${quotation.email}</div>
          <div class='muted'>${quotation.phone}</div>
        </div>
        <div style='text-align:right'>
          <div style='font-weight:600'>Status: ${quotation.status}</div>
          <div class='muted'>Created: ${formatDate(quotation.createdDate)}</div>
          <div class='muted'>Valid Until: ${formatDate(quotation.validUntil)}</div>
        </div>
      </div>
      
      <table>
        <tr><th>Description</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
        <tr>
          <td>${quotation.description}</td>
          <td>${quotation.quantity}</td>
          <td>${formatINR(quotation.unitPrice)}</td>
          <td>${formatINR(quotation.subtotal)}</td>
        </tr>
        <tr><td colspan="3" style='text-align:right'>Discount (${quotation.discount}%)</td><td>-${formatINR(quotation.discountAmount)}</td></tr>
        <tr><td colspan="3" style='text-align:right'>Tax (${quotation.taxRate}%)</td><td>${formatINR(quotation.taxAmount)}</td></tr>
        <tr><td colspan="3" style='text-align:right;font-weight:600'>Total</td><td class='total'>${formatINR(quotation.totalAmount)}</td></tr>
      </table>
      
      ${quotation.terms ? `
        <div style='margin-top:24px'>
          <div style='font-weight:600;margin-bottom:8px'>Terms & Conditions:</div>
          <div class='muted'>${quotation.terms}</div>
        </div>
      ` : ''}
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

/**
 * Convert quotation to invoice
 */
function convertQuotationToInvoice(quotationId) {
  const quotations = loadQuotations();
  const quotation = quotations.find(q => q.id === quotationId);
  if (!quotation) {
    showToast('Quotation not found', 'error');
    return;
  }
  
  confirmAction('Are you sure you want to convert this quotation to an invoice?', () => {
    const invoices = loadInvoices();
    const newInvoice = {
      id: generateInvoiceId(),
      customer: quotation.customer,
      description: quotation.description,
      amount: quotation.totalAmount,
      status: 'Unpaid',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      paymentMethod: 'Bank Transfer',
      notes: `Converted from quotation ${quotation.id}`,
      createdAt: new Date().toISOString()
    };
    
    invoices.unshift(newInvoice);
    saveInvoices(invoices);
    
    // Update quotation status
    quotation.status = 'Accepted';
    saveQuotations(quotations);
    
    closeModal();
    renderInvoices();
    showToast(`Quotation converted to invoice ${newInvoice.id}`, 'success');
  });
}

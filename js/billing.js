// Enhanced Billing Management JavaScript with Invoice Generation
const BILLING_STORAGE_KEY = 'logosic_billing_v1';
const RECURRING_BILLING_STORAGE_KEY = 'logosic_recurring_billing_v1';
const PAYMENT_TRACKING_STORAGE_KEY = 'logosic_payment_tracking_v1';
const COMPANY_SETTINGS_KEY = 'logosic_company_settings_v1';

// Sample billing data - cleared
const BILLING_RECORDS = [];

// Default company settings based on UM PRECISION TECH
const DEFAULT_COMPANY_SETTINGS = {
  name: 'UM PRECISION TECH',
  address: 'No.404/C, Arakkonam Road, Pandiyanallur village, SHOLINGHUR, Ranipet Dist, Tamilnadu-631102',
  email: 'sivakumar050698@gmail.com',
  phone: '9787768587',
  gstin: '33KAWPS8606E1Z0',
  logo: 'assets/logos/company-logo.jpg'
};

const BILLING_STATUS = getConfig('business.billing.statuses', ['Paid', 'Unpaid', 'Overdue', 'Partial', 'Cancelled']);
const QUOTATION_STATUS = getConfig('business.billing.quotationStatuses', ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired']);
window.PAYMENT_METHODS = getConfig('business.billing.paymentMethods', ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Credit Card', 'PayPal', 'Stripe', 'Razorpay', 'PayU']);

// Invoice templates
const INVOICE_TEMPLATES = {
  modern: {
    name: 'Modern',
    colors: { primary: '#667eea', secondary: '#764ba2' },
    layout: 'gradient'
  },
  classic: {
    name: 'Classic',
    colors: { primary: '#f093fb', secondary: '#f5576c' },
    layout: 'traditional'
  },
  minimal: {
    name: 'Minimal',
    colors: { primary: '#4facfe', secondary: '#00f2fe' },
    layout: 'clean'
  }
};

// Payment gateways
const PAYMENT_GATEWAYS = {
  paypal: { name: 'PayPal', status: 'active', icon: 'pi-paypal' },
  stripe: { name: 'Stripe', status: 'active', icon: 'pi-credit-card' },
  razorpay: { name: 'Razorpay', status: 'setup_required', icon: 'pi-credit-card' },
  payu: { name: 'PayU', status: 'setup_required', icon: 'pi-credit-card' }
};

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

// Company settings functions
function loadCompanySettings() {
  try {
    const stored = localStorage.getItem(COMPANY_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_COMPANY_SETTINGS;
  } catch (e) {
    console.error('Error loading company settings:', e);
    return DEFAULT_COMPANY_SETTINGS;
  }
}

function saveCompanySettings(settings) {
  try {
    localStorage.setItem(COMPANY_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving company settings:', e);
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

// GST calculation functions
function calculateGST(amount, gstRate, isInterstate = false) {
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

function formatGSTBreakdown(gstData) {
  if (gstData.igst > 0) {
    return `IGST: ${formatINR(gstData.igst)}`;
  } else {
    return `CGST: ${formatINR(gstData.cgst)}, SGST: ${formatINR(gstData.sgst)}`;
  }
}

function generateInvoiceId() {
  const invoices = loadInvoices();
  let max = 0;
  invoices.forEach(invoice => {
    const n = parseInt((invoice.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(4, '0');
  return `INV-${next}`;
}

// QR Code generation using canvas - Enhanced Mock QR Code
function generateQRCode(text, size = 200) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  
  // Create a more realistic QR code pattern
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  
  // Draw QR code pattern
  ctx.fillStyle = '#000000';
  const moduleSize = size / 25; // 25x25 grid
  
  // Corner squares
  drawCornerSquare(ctx, 0, 0, moduleSize);
  drawCornerSquare(ctx, size - 7 * moduleSize, 0, moduleSize);
  drawCornerSquare(ctx, 0, size - 7 * moduleSize, moduleSize);
  
  // Random data pattern
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 25; j++) {
      // Skip corner squares
      if ((i < 7 && j < 7) || (i < 7 && j >= 18) || (i >= 18 && j < 7)) {
        continue;
      }
      
      if (Math.random() > 0.5) {
        ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
      }
    }
  }
  
  // Add text overlay
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 10px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('QR CODE', size / 2, size - 5);
  
  return canvas.toDataURL();
}

function drawCornerSquare(ctx, x, y, moduleSize) {
  // Outer square
  ctx.fillRect(x, y, 7 * moduleSize, 7 * moduleSize);
  
  // Inner white square
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(x + moduleSize, y + moduleSize, 5 * moduleSize, 5 * moduleSize);
  
  // Center black square
  ctx.fillStyle = '#000000';
  ctx.fillRect(x + 2 * moduleSize, y + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
}

// Invoice item management
let invoiceItemCounter = 0;

function addInvoiceItem() {
  invoiceItemCounter++;
  const itemsList = document.getElementById('invoiceItemsList');
  if (!itemsList) return;
  
  const itemHtml = `
    <div class="invoice-item" data-item-id="${invoiceItemCounter}">
      <div class="item-column">
        <input type="text" placeholder="Item description" class="item-description" onchange="updateInvoiceTotals()" />
      </div>
      <div class="item-column">
        <input type="number" min="0" step="0.01" placeholder="Qty" class="item-quantity" onchange="updateInvoiceTotals()" />
      </div>
      <div class="item-column">
        <input type="number" min="0" step="0.01" placeholder="Price" class="item-unit-price" onchange="updateInvoiceTotals()" />
      </div>
      <div class="item-column">
        <select class="item-tax-rate" onchange="updateInvoiceTotals()">
          <option value="0">0%</option>
          <option value="5">5%</option>
          <option value="12">12%</option>
          <option value="18" selected>18%</option>
          <option value="28">28%</option>
        </select>
      </div>
      <div class="item-column">
        <span class="item-amount">₹0.00</span>
      </div>
      <div class="item-column">
        <button type="button" class="btn btn-sm btn-danger" onclick="removeInvoiceItem(${invoiceItemCounter})">
          <i class="pi pi-trash"></i>
        </button>
      </div>
    </div>
  `;
  
  itemsList.insertAdjacentHTML('beforeend', itemHtml);
  updateInvoiceTotals();
}

function removeInvoiceItem(itemId) {
  const item = document.querySelector(`[data-item-id="${itemId}"]`);
  if (item) {
    item.remove();
    updateInvoiceTotals();
  }
}

function updateInvoiceTotals() {
  const items = [];
  const itemElements = document.querySelectorAll('.invoice-item');
  
  itemElements.forEach(itemElement => {
    const description = itemElement.querySelector('.item-description').value;
    const quantity = parseFloat(itemElement.querySelector('.item-quantity').value) || 0;
    const unitPrice = parseFloat(itemElement.querySelector('.item-unit-price').value) || 0;
    const taxRate = parseFloat(itemElement.querySelector('.item-tax-rate').value) || 0;
    
    if (description && quantity > 0 && unitPrice > 0) {
      const itemTotal = quantity * unitPrice;
      const taxData = calculateGST(itemTotal, taxRate, false);
      
      items.push({
        description,
        quantity,
        unitPrice,
        taxRate,
        amount: itemTotal,
        taxAmount: taxData.gstAmount,
        total: taxData.total
      });
      
      // Update item amount display
      const amountSpan = itemElement.querySelector('.item-amount');
      if (amountSpan) {
        amountSpan.textContent = formatINR(itemTotal);
      }
    }
  });
  
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;
  
  // Update totals display
  updateElement('invoiceSubtotal', formatINR(subtotal));
  updateElement('invoiceTaxAmount', formatINR(totalTax));
  updateElement('invoiceTotalAmount', formatINR(total));
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
  
  tbody.innerHTML = currentPageData.map(invoice => {
    const totalAmount = invoice.totalAmount || invoice.amount;
    const gstInfo = invoice.gstData ? `GST: ${invoice.gstRate}%` : '';
    
    return `
    <tr>
      <td><strong>${invoice.id}</strong></td>
      <td><span class="badge badge-${invoice.type === 'Recurring' ? 'warning' : invoice.type === 'Template' ? 'info' : 'secondary'}">${invoice.type || 'Standard'}</span></td>
      <td>${invoice.customer}</td>
      <td>
        <div>${formatINR(invoice.amount)}</div>
        ${gstInfo ? `<small class="text-muted">${gstInfo}</small>` : ''}
      </td>
      <td>${formatINR(totalAmount)}</td>
      <td>${formatDate(invoice.issueDate)}</td>
      <td>${formatDate(invoice.dueDate)}</td>
      <td><span class="${billingBadgeClass(invoice.status)}">${invoice.status}</span></td>
      <td>${invoice.paymentMethod}</td>
      <td>
        ${createTableActionsDropdown(invoice.id, [
          { label: 'View Invoice', icon: 'pi pi-eye', onclick: `viewInvoice('${invoice.id}')` },
          { label: 'Edit Invoice', icon: 'pi pi-pencil', onclick: `editInvoice('${invoice.id}')` },
          { label: 'Print Invoice', icon: 'pi pi-print', onclick: `printInvoice('${invoice.id}')` },
          { label: 'Send Email', icon: 'pi pi-send', onclick: `sendInvoiceEmail('${invoice.id}')` },
          { label: 'Mark Paid', icon: 'pi pi-check', onclick: `markInvoicePaid('${invoice.id}')`, class: 'success' },
          { label: 'Export PDF', icon: 'pi pi-download', onclick: `exportInvoicePDF('${invoice.id}')` },
          { label: 'Payment Tracking', icon: 'pi pi-credit-card', onclick: `trackPayment('${invoice.id}')` },
          { label: 'Delete', icon: 'pi pi-trash', onclick: `deleteInvoice('${invoice.id}')`, class: 'danger' }
        ])}
      </td>
    </tr>
    `;
  }).join('');
}

// Enhanced Invoice management functions
function openCreateInvoiceModal() {
  const companySettings = loadCompanySettings();
  
  const body = `
    <div class="form-section">
      <h4><i class="pi pi-building"></i> Company Information</h4>
      <div class="company-info-display">
        <div class="company-logo-section">
          <img src="${companySettings.logo}" alt="Company Logo" class="company-logo-preview" onerror="this.style.display='none';">
          <div class="company-details">
            <h3>${companySettings.name}</h3>
            <div>${companySettings.address}</div>
            <div>Email: ${companySettings.email} | Mobile: ${companySettings.phone}</div>
            <div>GSTIN: ${companySettings.gstin}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4><i class="pi pi-user"></i> Customer Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Name *</label>
          <input id="invoiceCustomer" type="text" placeholder="Enter customer name" required />
        </div>
        <div class="form-group col-6">
          <label>Customer GSTIN</label>
          <input id="invoiceCustomerGSTIN" type="text" placeholder="Enter customer GSTIN (optional)" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Email</label>
          <input id="invoiceCustomerEmail" type="email" placeholder="Enter customer email" />
        </div>
        <div class="form-group col-6">
          <label>Customer Phone</label>
          <input id="invoiceCustomerPhone" type="tel" placeholder="Enter customer phone" />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Customer Address</label>
        <textarea id="invoiceCustomerAddress" placeholder="Enter customer address" rows="2"></textarea>
      </div>
    </div>

    <div class="form-section">
      <h4><i class="pi pi-file"></i> Invoice Details</h4>
      <div class="form-row">
        <div class="form-group col-4">
          <label>Invoice Number</label>
          <input id="invoiceNumber" type="text" readonly />
        </div>
        <div class="form-group col-4">
          <label>Issue Date *</label>
          <input id="invoiceIssueDate" type="date" required />
        </div>
        <div class="form-group col-4">
          <label>Due Date *</label>
          <input id="invoiceDueDate" type="date" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Payment Terms</label>
          <select id="invoicePaymentTerms">
            <option value="Net 15">Net 15 Days</option>
            <option value="Net 30" selected>Net 30 Days</option>
            <option value="Net 45">Net 45 Days</option>
            <option value="Net 60">Net 60 Days</option>
            <option value="Due on Receipt">Due on Receipt</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>Currency</label>
          <select id="invoiceCurrency">
            <option value="INR" selected>Indian Rupee (INR)</option>
            <option value="USD">US Dollar (USD)</option>
            <option value="EUR">Euro (EUR)</option>
          </select>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4><i class="pi pi-shopping-cart"></i> Invoice Items</h4>
      <div class="items-container">
        <div class="items-header">
          <div class="item-column">Item Description</div>
          <div class="item-column">Quantity</div>
          <div class="item-column">Unit Price</div>
          <div class="item-column">Tax Rate</div>
          <div class="item-column">Amount</div>
          <div class="item-column">Actions</div>
        </div>
        <div id="invoiceItemsList">
          <!-- Items will be added dynamically -->
        </div>
        <button type="button" class="btn btn-secondary btn-sm" onclick="addInvoiceItem()">
          <i class="pi pi-plus"></i> Add Item
        </button>
      </div>
    </div>

    <div class="form-section">
      <h4><i class="pi pi-calculator"></i> Invoice Totals</h4>
      <div class="totals-container">
        <div class="total-row">
          <span>Subtotal:</span>
          <span id="invoiceSubtotal">₹0.00</span>
        </div>
        <div class="total-row">
          <span>Tax Amount:</span>
          <span id="invoiceTaxAmount">₹0.00</span>
        </div>
        <div class="total-row">
          <span>Discount:</span>
          <span id="invoiceDiscount">₹0.00</span>
        </div>
        <div class="total-row total-final">
          <span>Total Amount:</span>
          <span id="invoiceTotalAmount">₹0.00</span>
        </div>
      </div>
    </div>

    <div class="form-section">
      <h4><i class="pi pi-info-circle"></i> Additional Information</h4>
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
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="invoiceNotes" placeholder="Enter any additional notes" rows="3"></textarea>
      </div>
      <div class="form-group col-12">
        <label>Terms & Conditions</label>
        <textarea id="invoiceTerms" placeholder="Enter terms and conditions" rows="3"></textarea>
      </div>
    </div>
  `;
  
  openModal('Create Invoice', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Preview', type: 'info', action: () => previewInvoice() },
    { label: 'Create Invoice', type: 'primary', action: () => {
      const customer = document.getElementById('invoiceCustomer').value.trim();
      const customerGSTIN = document.getElementById('invoiceCustomerGSTIN').value.trim();
      const customerEmail = document.getElementById('invoiceCustomerEmail').value.trim();
      const customerPhone = document.getElementById('invoiceCustomerPhone').value.trim();
      const customerAddress = document.getElementById('invoiceCustomerAddress').value.trim();
      const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
      const issueDate = document.getElementById('invoiceIssueDate').value;
      const dueDate = document.getElementById('invoiceDueDate').value;
      const paymentTerms = document.getElementById('invoicePaymentTerms').value;
      const currency = document.getElementById('invoiceCurrency').value;
      const status = document.getElementById('invoiceStatus').value;
      const paymentMethod = document.getElementById('invoicePaymentMethod').value;
      const notes = document.getElementById('invoiceNotes').value.trim();
      const terms = document.getElementById('invoiceTerms').value.trim();
      
      if (!customer || !issueDate || !dueDate || !status) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      // Collect items
      const items = [];
      const itemElements = document.querySelectorAll('.invoice-item');
      
      itemElements.forEach(itemElement => {
        const description = itemElement.querySelector('.item-description').value.trim();
        const quantity = parseFloat(itemElement.querySelector('.item-quantity').value) || 0;
        const unitPrice = parseFloat(itemElement.querySelector('.item-unit-price').value) || 0;
        const taxRate = parseFloat(itemElement.querySelector('.item-tax-rate').value) || 0;
        
        if (description && quantity > 0 && unitPrice > 0) {
          const itemTotal = quantity * unitPrice;
          const taxData = calculateGST(itemTotal, taxRate, false);
          
          items.push({
            description,
            quantity,
            unitPrice,
            taxRate,
            amount: itemTotal,
            taxAmount: taxData.gstAmount,
            total: taxData.total
          });
        }
      });
      
      if (items.length === 0) {
        showToast('Please add at least one item', 'error');
        return;
      }
      
      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
      const total = subtotal + totalTax;
      
      if (new Date(dueDate) < new Date(issueDate)) {
        showToast('Due date cannot be before issue date', 'error');
        return;
      }
      
      const invoices = loadInvoices();
      const companySettings = loadCompanySettings();
      
      const newInvoice = {
        id: invoiceNumber,
        customer: {
          name: customer,
          gstin: customerGSTIN,
          email: customerEmail,
          phone: customerPhone,
          address: customerAddress
        },
        company: companySettings,
        items: items,
        totals: {
          subtotal: subtotal,
          taxAmount: totalTax,
          total: total
        },
        issueDate,
        dueDate,
        paymentTerms,
        currency,
        status,
        paymentMethod: paymentMethod || 'N/A',
        notes: notes || 'N/A',
        terms: terms || 'N/A',
        createdAt: new Date().toISOString(),
        qrCode: generateQRCode(`Invoice: ${invoiceNumber}, Amount: ${total}, Date: ${issueDate}`)
      };
      
      invoices.unshift(newInvoice);
      saveInvoices(invoices);
      closeModal();
      renderInvoices();
      updateDashboardStats();
      showToast(`Invoice ${invoiceNumber} created successfully`, 'success');
    }}
  ]);
  
  // Initialize form
  setTimeout(() => {
    // Generate invoice number
    const invoiceNumber = generateInvoiceId();
    updateElement('invoiceNumber', invoiceNumber);
    
    // Set default dates
    const today = new Date().toISOString().slice(0, 10);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    
    updateElement('invoiceIssueDate', today);
    updateElement('invoiceDueDate', dueDate.toISOString().slice(0, 10));
    
    // Add first item
    addInvoiceItem();
  }, 100);
}

// Company Settings Modal
function openCompanySettingsModal() {
  const settings = loadCompanySettings();
  
  const body = `
    <div class="form-section">
      <h4>Company Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Company Name *</label>
          <input id="companyName" type="text" value="${settings.name}" required />
        </div>
        <div class="form-group col-6">
          <label>GSTIN *</label>
          <input id="companyGSTIN" type="text" value="${settings.gstin}" required />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Company Address *</label>
        <textarea id="companyAddress" rows="3" required>${settings.address}</textarea>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Email *</label>
          <input id="companyEmail" type="email" value="${settings.email}" required />
        </div>
        <div class="form-group col-6">
          <label>Phone *</label>
          <input id="companyPhone" type="tel" value="${settings.phone}" required />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Company Logo</label>
        <input id="companyLogo" type="file" accept="image/*" onchange="previewCompanyLogo(this)" />
        <div class="logo-preview">
          <img id="logoPreview" src="${settings.logo}" alt="Logo Preview" style="max-width: 200px; max-height: 100px; margin-top: 10px;" />
        </div>
      </div>
    </div>
  `;
  
  openModal('Company Settings', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Save Settings', type: 'primary', action: () => {
      const settings = {
        name: document.getElementById('companyName').value.trim(),
        gstin: document.getElementById('companyGSTIN').value.trim(),
        address: document.getElementById('companyAddress').value.trim(),
        email: document.getElementById('companyEmail').value.trim(),
        phone: document.getElementById('companyPhone').value.trim(),
        logo: document.getElementById('logoPreview').src
      };
      
      if (!settings.name || !settings.gstin || !settings.address || !settings.email || !settings.phone) {
        showToast('Please fill all required fields', 'error');
        return;
      }
      
      saveCompanySettings(settings);
      closeModal();
      showToast('Company settings saved successfully', 'success');
    }}
  ]);
}

function previewCompanyLogo(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('logoPreview');
      if (preview) {
        preview.src = e.target.result;
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Invoice Preview Function
function previewInvoice() {
  const customer = document.getElementById('invoiceCustomer').value.trim();
  const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
  
  if (!customer || !invoiceNumber) {
    showToast('Please fill customer name and invoice number', 'error');
    return;
  }
  
  // Generate preview HTML
  const previewContent = generateInvoicePreviewHTML();
  
  const modal = document.getElementById('modalOverlay');
  const modalBody = document.getElementById('modalBody');
  const modalTitle = document.getElementById('modalTitle');
  const modalFooter = document.getElementById('modalFooter');
  
  if (modal && modalBody) {
    modalTitle.textContent = 'Invoice Preview';
    modalBody.innerHTML = previewContent;
    modalFooter.innerHTML = `
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      <button class="btn btn-primary" onclick="printInvoicePreview()">
        <i class="pi pi-print"></i> Print
      </button>
    `;
    modal.classList.remove('hidden');
  }
}

function generateInvoicePreviewHTML() {
  const companySettings = loadCompanySettings();
  const customer = document.getElementById('invoiceCustomer').value.trim();
  const customerGSTIN = document.getElementById('invoiceCustomerGSTIN').value.trim();
  const customerAddress = document.getElementById('invoiceCustomerAddress').value.trim();
  const invoiceNumber = document.getElementById('invoiceNumber').value.trim();
  const issueDate = document.getElementById('invoiceIssueDate').value;
  const dueDate = document.getElementById('invoiceDueDate').value;
  const paymentTerms = document.getElementById('invoicePaymentTerms').value;
  const notes = document.getElementById('invoiceNotes').value.trim();
  const terms = document.getElementById('invoiceTerms').value.trim();
  
  // Collect items
  const items = [];
  const itemElements = document.querySelectorAll('.invoice-item');
  
  itemElements.forEach(itemElement => {
    const description = itemElement.querySelector('.item-description').value.trim();
    const quantity = parseFloat(itemElement.querySelector('.item-quantity').value) || 0;
    const unitPrice = parseFloat(itemElement.querySelector('.item-unit-price').value) || 0;
    const taxRate = parseFloat(itemElement.querySelector('.item-tax-rate').value) || 0;
    
    if (description && quantity > 0 && unitPrice > 0) {
      const itemTotal = quantity * unitPrice;
      const taxData = calculateGST(itemTotal, taxRate, false);
      
      items.push({
        description,
        quantity,
        unitPrice,
        taxRate,
        amount: itemTotal,
        taxAmount: taxData.gstAmount,
        total: taxData.total
      });
    }
  });
  
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalTax = items.reduce((sum, item) => sum + item.taxAmount, 0);
  const total = subtotal + totalTax;
  const qrCode = generateQRCode(`Invoice: ${invoiceNumber}, Amount: ${total}, Date: ${issueDate}`);
  
  return `
    <div class="invoice-preview">
      <div class="invoice-header">
        <div class="company-info">
          <img src="${companySettings.logo}" alt="Company Logo" class="company-logo" onerror="this.style.display='none';">
          <div class="company-details">
            <h2>${companySettings.name}</h2>
            <p>${companySettings.address}</p>
            <p>Email: ${companySettings.email} | Phone: ${companySettings.phone}</p>
            <p>GSTIN: ${companySettings.gstin}</p>
          </div>
        </div>
        <div class="invoice-title">
          <h1>INVOICE</h1>
          <div class="invoice-number">#${invoiceNumber}</div>
        </div>
      </div>
      
      <div class="invoice-body">
        <div class="invoice-details">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <p><strong>${customer}</strong></p>
            ${customerAddress ? `<p>${customerAddress}</p>` : ''}
            ${customerGSTIN ? `<p>GSTIN: ${customerGSTIN}</p>` : ''}
          </div>
          <div class="invoice-info">
            <div class="info-row">
              <span>Issue Date:</span>
              <span>${formatDate(issueDate)}</span>
            </div>
            <div class="info-row">
              <span>Due Date:</span>
              <span>${formatDate(dueDate)}</span>
            </div>
            <div class="info-row">
              <span>Payment Terms:</span>
              <span>${paymentTerms}</span>
            </div>
          </div>
        </div>
        
        <div class="invoice-items">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Tax Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatINR(item.unitPrice)}</td>
                  <td>${item.taxRate}%</td>
                  <td>${formatINR(item.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="invoice-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatINR(subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Tax Amount:</span>
            <span>${formatINR(totalTax)}</span>
          </div>
          <div class="total-row total-final">
            <span>Total Amount:</span>
            <span>${formatINR(total)}</span>
          </div>
        </div>
        
        ${notes ? `
          <div class="invoice-notes">
            <h4>Notes:</h4>
            <p>${notes}</p>
          </div>
        ` : ''}
        
        ${terms ? `
          <div class="invoice-terms">
            <h4>Terms & Conditions:</h4>
            <p>${terms}</p>
          </div>
        ` : ''}
        
        <div class="invoice-footer">
          <div class="qr-code">
            <img src="${qrCode}" alt="QR Code" />
            <p>Scan for payment</p>
          </div>
          <div class="signature">
            <p>Authorized Signature</p>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function printInvoicePreview() {
  const modalBody = document.getElementById('modalBody');
  if (modalBody) {
    const printContent = modalBody.innerHTML;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice Print</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .invoice-preview { max-width: 800px; margin: 0 auto; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .company-info { flex: 1; }
            .invoice-title { text-align: right; }
            .invoice-title h1 { color: #667eea; margin: 0; }
            .invoice-number { font-size: 18px; font-weight: bold; margin-top: 10px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .bill-to h3 { margin-bottom: 10px; }
            .invoice-info { text-align: right; }
            .info-row { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; }
            .invoice-totals { text-align: right; margin-bottom: 30px; }
            .total-row { margin-bottom: 10px; }
            .total-final { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
            .invoice-footer { display: flex; justify-content: space-between; margin-top: 50px; }
            .qr-code { text-align: center; }
            .qr-code img { width: 100px; height: 100px; }
            .signature { text-align: right; }
            .signature-line { border-bottom: 1px solid #333; width: 200px; margin-top: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  }
}

// Print Invoice Function - Enhanced with proper data handling
function printInvoice(invoiceId) {
  const invoices = loadInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) {
    showToast('Invoice not found', 'error');
    return;
  }
  
  // Generate QR code for this invoice
  const qrCodeData = `Invoice: ${invoice.id}, Amount: ${invoice.totals?.total || invoice.totalAmount}, Date: ${invoice.issueDate}`;
  const qrCodeImage = generateQRCode(qrCodeData, 150);
  
  // Get company settings
  const companySettings = invoice.company || loadCompanySettings();
  
  // Generate print HTML with all details
  const printHTML = `
    <div class="invoice-preview">
      <div class="invoice-header">
        <div class="company-info">
          <img src="${companySettings.logo}" alt="Company Logo" class="company-logo" onerror="this.style.display='none';">
          <div class="company-details">
            <h2>${companySettings.name}</h2>
            <p>${companySettings.address}</p>
            <p>Email: ${companySettings.email} | Phone: ${companySettings.phone}</p>
            <p>GSTIN: ${companySettings.gstin}</p>
          </div>
        </div>
        <div class="invoice-title">
          <h1>INVOICE</h1>
          <div class="invoice-number">#${invoice.id}</div>
        </div>
      </div>
      
      <div class="invoice-body">
        <div class="invoice-details">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customer?.name || invoice.customer}</strong></p>
            ${invoice.customer?.address ? `<p>${invoice.customer.address}</p>` : ''}
            ${invoice.customer?.gstin ? `<p>GSTIN: ${invoice.customer.gstin}</p>` : ''}
            ${invoice.customer?.email ? `<p>Email: ${invoice.customer.email}</p>` : ''}
            ${invoice.customer?.phone ? `<p>Phone: ${invoice.customer.phone}</p>` : ''}
          </div>
          <div class="invoice-info">
            <div class="info-row">
              <span>Issue Date:</span>
              <span>${formatDate(invoice.issueDate)}</span>
            </div>
            <div class="info-row">
              <span>Due Date:</span>
              <span>${formatDate(invoice.dueDate)}</span>
            </div>
            <div class="info-row">
              <span>Payment Terms:</span>
              <span>${invoice.paymentTerms || 'Net 30 Days'}</span>
            </div>
            <div class="info-row">
              <span>Status:</span>
              <span class="status-badge ${billingBadgeClass(invoice.status)}">${invoice.status}</span>
            </div>
          </div>
        </div>
        
        <div class="invoice-items">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Tax Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items ? invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatINR(item.unitPrice)}</td>
                  <td>${item.taxRate}%</td>
                  <td>${formatINR(item.amount)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="4">${invoice.description || 'Service/Product'}</td>
                  <td>${formatINR(invoice.amount)}</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
        
        <div class="invoice-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatINR(invoice.totals?.subtotal || invoice.amount)}</span>
          </div>
          <div class="total-row">
            <span>Tax Amount:</span>
            <span>${formatINR(invoice.totals?.taxAmount || (invoice.totalAmount - invoice.amount))}</span>
          </div>
          <div class="total-row total-final">
            <span>Total Amount:</span>
            <span>${formatINR(invoice.totals?.total || invoice.totalAmount)}</span>
          </div>
        </div>
        
        ${invoice.notes ? `
          <div class="invoice-notes">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}
        
        ${invoice.terms ? `
          <div class="invoice-terms">
            <h4>Terms & Conditions:</h4>
            <p>${invoice.terms}</p>
          </div>
        ` : ''}
        
        <div class="invoice-footer">
          <div class="qr-code">
            <img src="${qrCodeImage}" alt="QR Code" />
            <p>Scan for payment</p>
          </div>
          <div class="signature">
            <p>Authorized Signature</p>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice ${invoice.id} - Print</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
            line-height: 1.6;
          }
          .invoice-preview { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white;
            padding: 0;
          }
          .invoice-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
          }
          .company-info { flex: 1; }
          .company-logo { 
            max-width: 120px; 
            max-height: 60px; 
            margin-bottom: 15px;
            border-radius: 4px;
          }
          .company-details h2 { 
            margin: 0 0 8px 0; 
            color: #667eea; 
            font-size: 24px;
            font-weight: 700;
          }
          .company-details p { 
            margin: 4px 0; 
            color: #666; 
            font-size: 14px;
          }
          .invoice-title { text-align: right; }
          .invoice-title h1 { 
            margin: 0; 
            color: #667eea; 
            font-size: 36px; 
            font-weight: 700;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .invoice-number { 
            font-size: 18px; 
            font-weight: 600; 
            margin-top: 8px; 
            color: #333;
            background: #f8f9fa;
            padding: 8px 16px;
            border-radius: 6px;
            display: inline-block;
          }
          .invoice-body { margin-top: 30px; }
          .invoice-details { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          .bill-to h3 { 
            margin-bottom: 12px; 
            color: #333;
            font-size: 18px;
            font-weight: 600;
          }
          .bill-to p { 
            margin: 6px 0; 
            color: #555;
            font-size: 14px;
          }
          .invoice-info { text-align: right; }
          .info-row { 
            margin-bottom: 8px; 
            display: flex; 
            justify-content: space-between; 
            gap: 20px;
            font-size: 14px;
          }
          .info-row span:first-child { 
            font-weight: 600; 
            color: #333;
          }
          .info-row span:last-child { color: #555; }
          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-paid { background: #d4edda; color: #155724; }
          .status-unpaid { background: #f8d7da; color: #721c24; }
          .status-overdue { background: #fff3cd; color: #856404; }
          .status-partial { background: #cce5ff; color: #004085; }
          .status-cancelled { background: #f8d7da; color: #721c24; }
          .invoice-items table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .invoice-items th,
          .invoice-items td { 
            border: 1px solid #dee2e6; 
            padding: 15px 12px; 
            text-align: left;
            font-size: 14px;
          }
          .invoice-items th { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .invoice-items tbody tr:nth-child(even) {
            background: #f8f9fa;
          }
          .invoice-totals { 
            text-align: right; 
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
          }
          .total-row { 
            margin-bottom: 10px; 
            display: flex; 
            justify-content: space-between; 
            gap: 20px;
            padding: 8px 0;
            font-size: 16px;
          }
          .total-final { 
            font-weight: 700; 
            font-size: 20px; 
            border-top: 3px solid #667eea; 
            padding-top: 15px; 
            margin-top: 15px; 
            color: #667eea;
            background: white;
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .invoice-notes,
          .invoice-terms { 
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .invoice-notes h4,
          .invoice-terms h4 { 
            margin-bottom: 12px; 
            color: #333;
            font-size: 16px;
            font-weight: 600;
          }
          .invoice-notes p,
          .invoice-terms p {
            color: #555;
            font-size: 14px;
            line-height: 1.6;
          }
          .invoice-footer { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
            margin-top: 50px; 
            padding-top: 30px; 
            border-top: 2px solid #e9ecef;
          }
          .qr-code { 
            text-align: center;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .qr-code img { 
            width: 120px; 
            height: 120px; 
            border: 2px solid #e9ecef;
            border-radius: 8px;
          }
          .qr-code p { 
            margin-top: 10px; 
            font-size: 12px; 
            color: #666;
            font-weight: 600;
          }
          .signature { 
            text-align: right;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .signature p {
            font-size: 14px;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .signature-line { 
            border-bottom: 2px solid #333; 
            width: 200px; 
            margin-top: 20px;
          }
          @media print { 
            body { margin: 0; padding: 15px; }
            .invoice-preview { box-shadow: none; }
            .invoice-header { page-break-inside: avoid; }
            .invoice-items { page-break-inside: avoid; }
            .invoice-totals { page-break-inside: avoid; }
            .invoice-footer { page-break-inside: avoid; }
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        </style>
      </head>
      <body>
        ${printHTML}
      </body>
    </html>
  `);
  printWindow.document.close();
  
  // Wait for images to load before printing
  setTimeout(() => {
    printWindow.print();
  }, 1000);
}

// Export Invoice to PDF Function
function exportInvoiceToPDF(invoiceId) {
  const invoices = loadInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) return;
  
  // For now, we'll use a simple approach with window.print() and PDF generation
  // In a production environment, you would use libraries like jsPDF or html2pdf
  showToast('PDF export feature requires additional libraries. Using print option instead.', 'info');
  
  // Alternative: Generate a downloadable HTML file
  const invoiceHTML = generateDetailedInvoiceHTML(invoice);
  const blob = new Blob([`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice ${invoice.id}</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
            line-height: 1.6;
          }
          .invoice-preview { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white;
            padding: 0;
          }
          .invoice-header { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-start;
            margin-bottom: 30px; 
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
          }
          .company-info { flex: 1; }
          .company-logo { 
            max-width: 120px; 
            max-height: 60px; 
            margin-bottom: 15px;
            border-radius: 4px;
          }
          .company-details h2 { 
            margin: 0 0 8px 0; 
            color: #667eea; 
            font-size: 24px;
            font-weight: 700;
          }
          .company-details p { 
            margin: 4px 0; 
            color: #666; 
            font-size: 14px;
          }
          .invoice-title { text-align: right; }
          .invoice-title h1 { 
            margin: 0; 
            color: #667eea; 
            font-size: 36px; 
            font-weight: 700;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
          }
          .invoice-number { 
            font-size: 18px; 
            font-weight: 600; 
            margin-top: 8px; 
            color: #333;
            background: #f8f9fa;
            padding: 8px 16px;
            border-radius: 6px;
            display: inline-block;
          }
          .invoice-body { margin-top: 30px; }
          .invoice-details { 
            display: flex; 
            justify-content: space-between; 
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          .bill-to h3 { 
            margin-bottom: 12px; 
            color: #333;
            font-size: 18px;
            font-weight: 600;
          }
          .bill-to p { 
            margin: 6px 0; 
            color: #555;
            font-size: 14px;
          }
          .invoice-info { text-align: right; }
          .info-row { 
            margin-bottom: 8px; 
            display: flex; 
            justify-content: space-between; 
            gap: 20px;
            font-size: 14px;
          }
          .info-row span:first-child { 
            font-weight: 600; 
            color: #333;
          }
          .info-row span:last-child { color: #555; }
          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }
          .status-paid { background: #d4edda; color: #155724; }
          .status-unpaid { background: #f8d7da; color: #721c24; }
          .status-overdue { background: #fff3cd; color: #856404; }
          .status-partial { background: #cce5ff; color: #004085; }
          .status-cancelled { background: #f8d7da; color: #721c24; }
          .invoice-items table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 30px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          .invoice-items th,
          .invoice-items td { 
            border: 1px solid #dee2e6; 
            padding: 15px 12px; 
            text-align: left;
            font-size: 14px;
          }
          .invoice-items th { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .invoice-items tbody tr:nth-child(even) {
            background: #f8f9fa;
          }
          .invoice-items tbody tr:hover {
            background: #e9ecef;
          }
          .invoice-totals { 
            text-align: right; 
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 2px solid #e9ecef;
          }
          .total-row { 
            margin-bottom: 10px; 
            display: flex; 
            justify-content: space-between; 
            gap: 20px;
            padding: 8px 0;
            font-size: 16px;
          }
          .total-final { 
            font-weight: 700; 
            font-size: 20px; 
            border-top: 3px solid #667eea; 
            padding-top: 15px; 
            margin-top: 15px; 
            color: #667eea;
            background: white;
            padding: 15px 20px;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .invoice-notes,
          .invoice-terms { 
            margin-bottom: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
          }
          .invoice-notes h4,
          .invoice-terms h4 { 
            margin-bottom: 12px; 
            color: #333;
            font-size: 16px;
            font-weight: 600;
          }
          .invoice-notes p,
          .invoice-terms p {
            color: #555;
            font-size: 14px;
            line-height: 1.6;
          }
          .invoice-footer { 
            display: flex; 
            justify-content: space-between; 
            align-items: flex-end; 
            margin-top: 50px; 
            padding-top: 30px; 
            border-top: 2px solid #e9ecef;
          }
          .qr-code { 
            text-align: center;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .qr-code img { 
            width: 120px; 
            height: 120px; 
            border: 2px solid #e9ecef;
            border-radius: 8px;
          }
          .qr-code p { 
            margin-top: 10px; 
            font-size: 12px; 
            color: #666;
            font-weight: 600;
          }
          .signature { 
            text-align: right;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .signature p {
            font-size: 14px;
            color: #333;
            margin-bottom: 20px;
            font-weight: 600;
          }
          .signature-line { 
            border-bottom: 2px solid #333; 
            width: 200px; 
            margin-top: 20px;
          }
          @media print { 
            body { margin: 0; padding: 15px; }
            .invoice-preview { box-shadow: none; }
            .invoice-header { page-break-inside: avoid; }
            .invoice-items { page-break-inside: avoid; }
            .invoice-totals { page-break-inside: avoid; }
            .invoice-footer { page-break-inside: avoid; }
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        </style>
      </head>
      <body>
        ${invoiceHTML}
      </body>
    </html>
  `], { type: 'text/html' });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Invoice_${invoice.id}_${formatDate(invoice.issueDate).replace(/\//g, '-')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast(`Invoice ${invoice.id} exported successfully`, 'success');
}

// Quotation modal (placeholder function)
function openCreateQuotationModal() {
  showToast('Quotation creation feature coming soon', 'info');
}

function viewInvoice(invoiceId) {
  const invoices = loadInvoices();
  const invoice = invoices.find(i => i.id === invoiceId);
  if (!invoice) return;
  
  // Generate detailed invoice view HTML
  const invoiceHTML = generateDetailedInvoiceHTML(invoice);
  
  openModal('Invoice Details', invoiceHTML, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Print Invoice', type: 'primary', action: () => printInvoice(invoiceId) },
    { label: 'Export PDF', type: 'success', action: () => exportInvoiceToPDF(invoiceId) },
    { label: 'Edit', type: 'info', action: () => { closeModal(); editInvoice(invoiceId); } }
  ], 'large');
}

function generateDetailedInvoiceHTML(invoice) {
  const companySettings = invoice.company || loadCompanySettings();
  
  return `
    <div class="invoice-preview">
      <div class="invoice-header">
        <div class="company-info">
          <img src="${companySettings.logo}" alt="Company Logo" class="company-logo" onerror="this.style.display='none';">
          <div class="company-details">
            <h2>${companySettings.name}</h2>
            <p>${companySettings.address}</p>
            <p>Email: ${companySettings.email} | Phone: ${companySettings.phone}</p>
            <p>GSTIN: ${companySettings.gstin}</p>
          </div>
        </div>
        <div class="invoice-title">
          <h1>INVOICE</h1>
          <div class="invoice-number">#${invoice.id}</div>
        </div>
      </div>
      
      <div class="invoice-body">
        <div class="invoice-details">
          <div class="bill-to">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customer?.name || invoice.customer}</strong></p>
            ${invoice.customer?.address ? `<p>${invoice.customer.address}</p>` : ''}
            ${invoice.customer?.gstin ? `<p>GSTIN: ${invoice.customer.gstin}</p>` : ''}
            ${invoice.customer?.email ? `<p>Email: ${invoice.customer.email}</p>` : ''}
            ${invoice.customer?.phone ? `<p>Phone: ${invoice.customer.phone}</p>` : ''}
          </div>
          <div class="invoice-info">
            <div class="info-row">
              <span>Issue Date:</span>
              <span>${formatDate(invoice.issueDate)}</span>
            </div>
            <div class="info-row">
              <span>Due Date:</span>
              <span>${formatDate(invoice.dueDate)}</span>
            </div>
            <div class="info-row">
              <span>Payment Terms:</span>
              <span>${invoice.paymentTerms || 'Net 30 Days'}</span>
            </div>
            <div class="info-row">
              <span>Status:</span>
              <span class="status-badge ${billingBadgeClass(invoice.status)}">${invoice.status}</span>
            </div>
          </div>
        </div>
        
        <div class="invoice-items">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Tax Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items ? invoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatINR(item.unitPrice)}</td>
                  <td>${item.taxRate}%</td>
                  <td>${formatINR(item.amount)}</td>
                </tr>
              `).join('') : `
                <tr>
                  <td colspan="4">${invoice.description || 'Service/Product'}</td>
                  <td>${formatINR(invoice.amount)}</td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
        
        <div class="invoice-totals">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${formatINR(invoice.totals?.subtotal || invoice.amount)}</span>
          </div>
          <div class="total-row">
            <span>Tax Amount:</span>
            <span>${formatINR(invoice.totals?.taxAmount || (invoice.totalAmount - invoice.amount))}</span>
          </div>
          <div class="total-row total-final">
            <span>Total Amount:</span>
            <span>${formatINR(invoice.totals?.total || invoice.totalAmount)}</span>
          </div>
        </div>
        
        ${invoice.notes ? `
          <div class="invoice-notes">
            <h4>Notes:</h4>
            <p>${invoice.notes}</p>
          </div>
        ` : ''}
        
        ${invoice.terms ? `
          <div class="invoice-terms">
            <h4>Terms & Conditions:</h4>
            <p>${invoice.terms}</p>
          </div>
        ` : ''}
        
        <div class="invoice-footer">
          <div class="qr-code">
            <img src="${invoice.qrCode || generateQRCode(`Invoice: ${invoice.id}, Amount: ${invoice.totals?.total || invoice.totalAmount}, Date: ${invoice.issueDate}`, 150)}" alt="QR Code" />
            <p>Scan for payment</p>
          </div>
          <div class="signature">
            <p>Authorized Signature</p>
            <div class="signature-line"></div>
          </div>
        </div>
      </div>
    </div>
  `;
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

// =============================================================================
// ENHANCED BILLING FEATURES
// =============================================================================

/**
 * Select invoice template
 */
function selectInvoiceTemplate(templateId) {
  // Remove selected class from all templates
  document.querySelectorAll('.template-card').forEach(card => {
    card.classList.remove('selected');
  });
  
  // Add selected class to clicked template
  event.target.closest('.template-card').classList.add('selected');
  
  // Store selected template
  localStorage.setItem('selected_invoice_template', templateId);
  
  showToast(`Template "${INVOICE_TEMPLATES[templateId].name}" selected`, 'success');
}

/**
 * Open payment tracking modal
 */
function openPaymentTrackingModal() {
  const invoices = loadInvoices();
  const paymentTracking = loadPaymentTracking();
  
  const body = `
    <div class="payment-tracking-card">
      <h4><i class="pi pi-credit-card"></i> Payment Tracking Overview</h4>
      <div class="stats-grid" style="margin-bottom: 1.5rem;">
        <div class="stat-card">
          <div class="stat-value">${invoices.filter(i => i.status === 'Paid').length}</div>
          <div class="stat-label">Completed Payments</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${invoices.filter(i => i.status === 'Unpaid').length}</div>
          <div class="stat-label">Pending Payments</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${invoices.filter(i => i.status === 'Overdue').length}</div>
          <div class="stat-label">Overdue Payments</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">₹${formatINR(invoices.reduce((sum, i) => sum + (i.amount || 0), 0))}</div>
          <div class="stat-label">Total Processed</div>
        </div>
      </div>
      
      <div class="payment-timeline">
        <h4 style="margin-bottom: 1rem;">Recent Payment Activity</h4>
        ${paymentTracking.slice(0, 5).map(payment => `
          <div class="timeline-item ${payment.status}">
            <div class="timeline-content">
              <div class="timeline-title">${payment.title}</div>
              <div class="timeline-description">${payment.description}</div>
              <div class="timeline-meta">
                ${formatDate(payment.date)} • ${payment.method} • ${formatINR(payment.amount)}
              </div>
            </div>
          </div>
        `).join('')}
        
        ${paymentTracking.length === 0 ? `
          <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
            <i class="pi pi-credit-card" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
            No payment activity yet
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  openModal('Payment Tracking', body, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'View All Payments', type: 'primary', action: () => {
      closeModal();
      showAllPayments();
    }}
  ], 'large');
}

/**
 * Open recurring billing modal
 */
function openRecurringBillingModal() {
  const recurringBills = loadRecurringBilling();
  
  const body = `
    <div class="recurring-billing-card">
      <h4><i class="pi pi-refresh"></i> Recurring Billing Management</h4>
      
      <div style="margin-bottom: 1.5rem;">
        <button class="btn btn-primary" onclick="openCreateRecurringBillModal()">
          <i class="pi pi-plus"></i> Create Recurring Bill
        </button>
      </div>
      
      <div class="recurring-bills-list">
        ${recurringBills.length === 0 ? `
          <div style="text-align: center; color: var(--gray-500); padding: 2rem;">
            <i class="pi pi-refresh" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
            No recurring bills set up yet
          </div>
        ` : recurringBills.map(bill => `
          <div class="recurring-item">
            <div class="recurring-info">
              <div class="recurring-customer">${bill.customer}</div>
              <div class="recurring-details">
                ${formatINR(bill.amount)} • ${bill.frequency} • Next: ${formatDate(bill.nextDueDate)}
              </div>
            </div>
            <div class="recurring-actions">
              <button class="btn btn-sm btn-secondary" onclick="editRecurringBill('${bill.id}')">
                <i class="pi pi-pencil"></i> Edit
              </button>
              <button class="btn btn-sm btn-success" onclick="generateRecurringInvoice('${bill.id}')">
                <i class="pi pi-plus"></i> Generate
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteRecurringBill('${bill.id}')">
                <i class="pi pi-trash"></i> Delete
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  openModal('Recurring Billing', body, [
    { label: 'Close', type: 'secondary', action: closeModal }
  ], 'large');
}

/**
 * Load payment tracking data
 */
function loadPaymentTracking() {
  try {
    const stored = localStorage.getItem(PAYMENT_TRACKING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading payment tracking:', e);
    return [];
  }
}

/**
 * Save payment tracking data
 */
function savePaymentTracking(tracking) {
  try {
    localStorage.setItem(PAYMENT_TRACKING_STORAGE_KEY, JSON.stringify(tracking));
  } catch (e) {
    console.error('Error saving payment tracking:', e);
  }
}

/**
 * Load recurring billing data
 */
function loadRecurringBilling() {
  try {
    const stored = localStorage.getItem(RECURRING_BILLING_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error('Error loading recurring billing:', e);
    return [];
  }
}

/**
 * Save recurring billing data
 */
function saveRecurringBilling(bills) {
  try {
    localStorage.setItem(RECURRING_BILLING_STORAGE_KEY, JSON.stringify(bills));
  } catch (e) {
    console.error('Error saving recurring billing:', e);
  }
}

/**
 * Create recurring bill modal
 */
function openCreateRecurringBillModal() {
  const body = `
    <div class="form-section">
      <h4>Recurring Bill Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer Name *</label>
          <input id="recurringCustomer" type="text" placeholder="Enter customer name" required />
        </div>
        <div class="form-group col-6">
          <label>Amount (INR) *</label>
          <input id="recurringAmount" type="number" min="0" step="0.01" placeholder="Enter amount" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Frequency *</label>
          <select id="recurringFrequency" required>
            <option value="">Select frequency...</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Yearly">Yearly</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>Next Due Date *</label>
          <input id="recurringNextDue" type="date" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Description *</label>
          <input id="recurringDescription" type="text" placeholder="Enter description" required />
        </div>
        <div class="form-group col-6">
          <label>Payment Method</label>
          <select id="recurringPaymentMethod">
            <option value="">Select method...</option>
            ${PAYMENT_METHODS.map(method => `<option value="${method}">${method}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="recurringNotes" placeholder="Enter any notes" rows="3"></textarea>
      </div>
    </div>
  `;
  
  openModal('Create Recurring Bill', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Create Recurring Bill', type: 'primary', action: () => {
      const customer = document.getElementById('recurringCustomer').value.trim();
      const amount = parseFloat(document.getElementById('recurringAmount').value);
      const frequency = document.getElementById('recurringFrequency').value;
      const nextDue = document.getElementById('recurringNextDue').value;
      const description = document.getElementById('recurringDescription').value.trim();
      const paymentMethod = document.getElementById('recurringPaymentMethod').value;
      const notes = document.getElementById('recurringNotes').value.trim();
      
      if (!customer || isNaN(amount) || !frequency || !nextDue || !description || amount <= 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      const recurringBills = loadRecurringBilling();
      const newBill = {
        id: `RB-${Date.now()}`,
        customer,
        amount,
        frequency,
        nextDueDate: nextDue,
        description,
        paymentMethod: paymentMethod || 'Bank Transfer',
        notes: notes || 'N/A',
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      
      recurringBills.unshift(newBill);
      saveRecurringBilling(recurringBills);
      closeModal();
      openRecurringBillingModal(); // Refresh the modal
      showToast('Recurring bill created successfully', 'success');
    }}
  ]);
  
  // Set default next due date (30 days from now)
  setTimeout(() => {
    const nextDueInput = document.getElementById('recurringNextDue');
    if (nextDueInput) {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);
      nextDueInput.value = futureDate.toISOString().slice(0, 10);
    }
  }, 100);
}

/**
 * Generate recurring invoice
 */
function generateRecurringInvoice(billId) {
  const recurringBills = loadRecurringBilling();
  const bill = recurringBills.find(b => b.id === billId);
  if (!bill) return;
  
  const invoices = loadInvoices();
  const newInvoice = {
    id: generateInvoiceId(),
    customer: bill.customer,
    amount: bill.amount,
    description: bill.description,
    status: 'Unpaid',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: bill.nextDueDate,
    paymentMethod: bill.paymentMethod,
    notes: `Recurring bill - ${bill.frequency} • ${bill.notes}`,
    type: 'Recurring',
    recurringBillId: billId,
    createdAt: new Date().toISOString()
  };
  
  invoices.unshift(newInvoice);
  saveInvoices(invoices);
  
  // Update next due date
  const nextDue = new Date(bill.nextDueDate);
  switch (bill.frequency) {
    case 'Daily':
      nextDue.setDate(nextDue.getDate() + 1);
      break;
    case 'Weekly':
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    case 'Monthly':
      nextDue.setMonth(nextDue.getMonth() + 1);
      break;
    case 'Quarterly':
      nextDue.setMonth(nextDue.getMonth() + 3);
      break;
    case 'Yearly':
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
  }
  
  bill.nextDueDate = nextDue.toISOString().slice(0, 10);
  saveRecurringBilling(recurringBills);
  
  renderInvoices();
  showToast(`Recurring invoice ${newInvoice.id} generated successfully`, 'success');
}

/**
 * Apply billing filters
 */
function applyBillingFilters() {
  const invoices = loadInvoices();
  const statusFilter = document.getElementById('billingStatusFilter')?.value || '';
  const typeFilter = document.getElementById('billingTypeFilter')?.value || '';
  const dateStart = document.getElementById('billingDateStart')?.value || '';
  const dateEnd = document.getElementById('billingDateEnd')?.value || '';
  const searchTerm = document.getElementById('searchBillingInvoices')?.value.toLowerCase() || '';
  const sortBy = document.getElementById('sortBillingInvoices')?.value || 'date-desc';
  
  let filtered = invoices.filter(invoice => {
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    const matchesType = !typeFilter || (invoice.type || 'Standard') === typeFilter;
    const matchesDateStart = !dateStart || invoice.issueDate >= dateStart;
    const matchesDateEnd = !dateEnd || invoice.issueDate <= dateEnd;
    const matchesSearch = !searchTerm || 
      invoice.id.toLowerCase().includes(searchTerm) ||
      invoice.customer.toLowerCase().includes(searchTerm) ||
      invoice.amount.toString().includes(searchTerm);
    
    return matchesStatus && matchesType && matchesDateStart && matchesDateEnd && matchesSearch;
  });
  
  // Sort filtered results
  filtered.sort((a, b) => {
    switch (sortBy) {
      case 'date-desc':
        return new Date(b.issueDate) - new Date(a.issueDate);
      case 'date-asc':
        return new Date(a.issueDate) - new Date(b.issueDate);
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      case 'customer':
        return a.customer.localeCompare(b.customer);
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });
  
  // Update pagination with filtered data
  if (window.paginationInstances && window.paginationInstances['billingContainer']) {
    window.paginationInstances['billingContainer'].updateData(filtered);
    renderInvoices();
  }
}

/**
 * Enhanced invoice creation with template support
 */
function openCreateInvoiceModal(type = 'standard') {
  const selectedTemplate = localStorage.getItem('selected_invoice_template') || 'modern';
  const template = INVOICE_TEMPLATES[selectedTemplate];
  
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
      <div class="form-row">
        <div class="form-group col-6">
          <label>Invoice Type</label>
          <select id="invoiceType">
            <option value="Standard">Standard</option>
            <option value="Recurring">Recurring</option>
            <option value="Template">From Template</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>Template</label>
          <select id="invoiceTemplate">
            <option value="${selectedTemplate}">${template.name}</option>
            ${Object.entries(INVOICE_TEMPLATES).map(([key, tpl]) => 
              `<option value="${key}">${tpl.name}</option>`
            ).join('')}
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
  
  openModal(`Create ${type.charAt(0).toUpperCase() + type.slice(1)} Invoice`, body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Create Invoice', type: 'primary', action: () => {
      const customer = document.getElementById('invoiceCustomer').value.trim();
      const amount = parseFloat(document.getElementById('invoiceAmount').value);
      const issueDate = document.getElementById('invoiceIssueDate').value;
      const dueDate = document.getElementById('invoiceDueDate').value;
      const status = document.getElementById('invoiceStatus').value;
      const paymentMethod = document.getElementById('invoicePaymentMethod').value;
      const invoiceType = document.getElementById('invoiceType').value;
      const template = document.getElementById('invoiceTemplate').value;
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
        type: invoiceType,
        template: template,
        createdAt: new Date().toISOString()
      };
      
      invoices.unshift(newInvoice);
      saveInvoices(invoices);
      
      // Add payment tracking entry
      const paymentTracking = loadPaymentTracking();
      paymentTracking.unshift({
        id: `PT-${Date.now()}`,
        invoiceId: newInvoice.id,
        title: `Invoice ${newInvoice.id} Created`,
        description: `New ${invoiceType.toLowerCase()} invoice created for ${customer}`,
        amount: amount,
        method: paymentMethod || 'N/A',
        status: 'pending',
        date: new Date().toISOString()
      });
      savePaymentTracking(paymentTracking);
      
      closeModal();
      renderInvoices();
      updateDashboardStats();
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
      dueDate.setDate(dueDate.getDate() + 15);
      dueDateInput.value = dueDate.toISOString().slice(0, 10);
    }
  }, 100);
}

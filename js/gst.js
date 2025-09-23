// Enhanced GST Management JavaScript
const GST_STORAGE_KEY = 'logosic_gst_v1';
const GST_SETTINGS_KEY = 'logosic_gst_settings_v1';
const GST_CALCULATIONS_KEY = 'logosic_gst_calculations_v1';

// Sample GST data - cleared
const GST_RECORDS = [];

// Enhanced configuration
const GST_RETURN_TYPES = getConfig('business.gst.returnTypes', ['GSTR-1', 'GSTR-3B', 'GSTR-2A', 'GSTR-2B', 'GSTR-9', 'GSTR-9C']);
const GST_STATUS = getConfig('business.gst.statuses', ['Draft', 'Filed', 'Approved', 'Rejected', 'Under Review']);
const GST_TAX_RATES = getConfig('business.gst.taxRates', {});
const GST_COMPLIANCE = getConfig('business.gst.compliance', {});
const GST_FILING_SCHEDULE = getConfig('business.gst.filingSchedule', {});

// Current tax configuration
let currentTaxConfig = {
  country: 'IN',
  currency: 'INR',
  rates: GST_TAX_RATES['IN']?.rates || [],
  components: GST_TAX_RATES['IN']?.components || ['CGST', 'SGST', 'IGST']
};

// Enhanced Storage Functions
function loadGstReturns() {
  try {
    const stored = localStorage.getItem(GST_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading GST returns:', e);
  }
  return GST_RECORDS;
}

function saveGstReturns(returns) {
  try {
    localStorage.setItem(GST_STORAGE_KEY, JSON.stringify(returns));
  } catch (e) {
    console.error('Error saving GST returns:', e);
  }
}

function loadGstSettings() {
  try {
    const stored = localStorage.getItem(GST_SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading GST settings:', e);
  }
  return {
    country: 'IN',
    currency: 'INR',
    autoCalculate: true,
    validateGSTIN: true,
    sendReminders: true,
    reminderDays: [7, 3, 1]
  };
}

function saveGstSettings(settings) {
  try {
    localStorage.setItem(GST_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving GST settings:', e);
  }
}

function loadGstCalculations() {
  try {
    const stored = localStorage.getItem(GST_CALCULATIONS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error loading GST calculations:', e);
  }
  return [];
}

function saveGstCalculations(calculations) {
  try {
    localStorage.setItem(GST_CALCULATIONS_KEY, JSON.stringify(calculations));
  } catch (e) {
    console.error('Error saving GST calculations:', e);
  }
}

// Enhanced Utility Functions
function gstBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'filed') return 'status-badge status-filed';
  if (s === 'approved') return 'status-badge status-active';
  if (s === 'rejected') return 'status-badge status-inactive';
  if (s === 'draft') return 'status-badge status-pending';
  if (s === 'under review') return 'status-badge status-warning';
  return 'status-badge status-pending';
}

function generateGstId() {
  const returns = loadGstReturns();
  let max = 0;
  returns.forEach(ret => {
    const n = parseInt((ret.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(3, '0');
  return `GST-${next}`;
}

// Advanced Tax Calculation Engine
function calculateGST(amount, taxRate, isInterstate = false) {
  const settings = loadGstSettings();
  const config = GST_TAX_RATES[settings.country] || GST_TAX_RATES['IN'];
  
  if (!config) {
    throw new Error('Tax configuration not found for country: ' + settings.country);
  }
  
  const rate = parseFloat(taxRate);
  const taxableAmount = parseFloat(amount);
  
  if (isNaN(rate) || isNaN(taxableAmount)) {
    throw new Error('Invalid amount or tax rate');
  }
  
  const totalTax = taxableAmount * rate;
  
  if (settings.country === 'IN') {
    // India GST calculation
    if (isInterstate) {
      return {
        taxableAmount: taxableAmount,
        igst: totalTax,
        cgst: 0,
        sgst: 0,
        totalTax: totalTax,
        totalAmount: taxableAmount + totalTax,
        rate: rate,
        currency: config.currency
      };
    } else {
      const halfRate = rate / 2;
      const cgst = taxableAmount * halfRate;
      const sgst = taxableAmount * halfRate;
      return {
        taxableAmount: taxableAmount,
        igst: 0,
        cgst: cgst,
        sgst: sgst,
        totalTax: totalTax,
        totalAmount: taxableAmount + totalTax,
        rate: rate,
        currency: config.currency
      };
    }
  } else {
    // Other countries - simplified calculation
    return {
      taxableAmount: taxableAmount,
      tax: totalTax,
      totalTax: totalTax,
      totalAmount: taxableAmount + totalTax,
      rate: rate,
      currency: config.currency
    };
  }
}

// GSTIN Validation
function validateGSTIN(gstin) {
  if (!gstin || gstin.length !== 15) return false;
  
  const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
  return pattern.test(gstin);
}

// Get due date for GST returns
function getGstDueDate(returnType, period) {
  const schedule = GST_FILING_SCHEDULE[returnType];
  if (!schedule) return null;
  
  const [year, month] = period.split('-');
  const dueDay = schedule.dueDay;
  
  // Calculate next month's due date
  const nextMonth = new Date(parseInt(year), parseInt(month), dueDay);
  return nextMonth.toISOString().slice(0, 10);
}

// Check if return is overdue
function isReturnOverdue(returnType, period) {
  const dueDate = getGstDueDate(returnType, period);
  if (!dueDate) return false;
  
  const today = new Date().toISOString().slice(0, 10);
  return today > dueDate;
}

// Calculate compliance score
function calculateComplianceScore() {
  const returns = loadGstReturns();
  if (returns.length === 0) return 100;
  
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  let totalReturns = 0;
  let filedReturns = 0;
  
  // Check last 12 months
  for (let i = 0; i < 12; i++) {
    const checkDate = new Date(currentYear, currentMonth - 1 - i, 1);
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, '0');
    const period = `${year}-${month}`;
    
    // Count expected returns for this period
    const expectedReturns = ['GSTR-1', 'GSTR-3B'];
    totalReturns += expectedReturns.length;
    
    // Count filed returns for this period
    expectedReturns.forEach(returnType => {
      const filed = returns.find(r => 
        r.returnType === returnType && 
        r.period === period && 
        (r.status === 'Filed' || r.status === 'Approved')
      );
      if (filed) filedReturns++;
    });
  }
  
  return totalReturns > 0 ? Math.round((filedReturns / totalReturns) * 100) : 100;
}

// Main render function
function renderGstReturns() {
  const tbody = document.getElementById('gstTbody');
  if (!tbody) {
    console.log('GST table body not found');
    return;
  }
  
  const returns = loadGstReturns();
  console.log('Rendering GST returns:', returns.length);
  
  // Simple rendering without pagination for now
  if (returns.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center" style="padding: 2rem; color: var(--gray-500);">
          <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No GST returns found. Click "File Return" to add your first return.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = returns.map(ret => `
    <tr>
      <td><strong>${ret.gstin || 'N/A'}</strong></td>
      <td>${ret.returnType || 'N/A'}</td>
      <td>${ret.period || 'N/A'}</td>
      <td>${formatINR(ret.taxableValue || 0)}</td>
      <td>${formatINR(ret.igst || 0)}</td>
      <td>${formatINR(ret.cgst || 0)}</td>
      <td>${formatINR(ret.sgst || 0)}</td>
      <td>${formatINR(ret.total || 0)}</td>
      <td><span class="${gstBadgeClass(ret.status)}">${ret.status || 'Draft'}</span></td>
      <td>
        ${createTableActionsDropdown(ret.id, [
          { label: 'View Return', icon: 'pi pi-eye', onclick: `viewGstReturn('${ret.id}')` },
          { label: 'Edit Return', icon: 'pi pi-pencil', onclick: `editGstReturn('${ret.id}')` },
          { label: 'File Return', icon: 'pi pi-upload', onclick: `fileGstReturn('${ret.id}')`, class: 'success' },
          { label: 'Print Return', icon: 'pi pi-print', onclick: `printGstReturn('${ret.id}')` },
          { label: 'Download PDF', icon: 'pi pi-download', onclick: `downloadGstPDF('${ret.id}')` },
          { label: 'Export Data', icon: 'pi pi-file-excel', onclick: `exportGstData('${ret.id}')` },
          { label: 'Delete', icon: 'pi pi-trash', onclick: `deleteGstReturn('${ret.id}')`, class: 'danger' }
        ])}
      </td>
    </tr>
  `).join('');
}

// GST return management functions
function openGstReturnModal() {
  const body = `
    <div class="form-section">
      <h4>GST Return Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>GSTIN *</label>
          <input id="gstGstin" type="text" placeholder="Enter 15-digit GSTIN" maxlength="15" required />
        </div>
        <div class="form-group col-6">
          <label>Return Type *</label>
          <select id="gstReturnType" required>
            <option value="">Select return type...</option>
            ${GST_RETURN_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Period (YYYY-MM) *</label>
          <input id="gstPeriod" type="month" required />
        </div>
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="gstStatus" required>
            <option value="">Select status...</option>
            ${GST_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Taxable Value (INR) *</label>
        <input id="gstTaxableValue" type="number" min="0" step="0.01" placeholder="Enter taxable value" required />
      </div>
    </div>

    <div class="form-section">
      <h4>Tax Details</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>IGST (INR)</label>
          <input id="gstIgst" type="number" min="0" step="0.01" placeholder="Enter IGST amount" />
        </div>
        <div class="form-group col-6">
          <label>CGST (INR)</label>
          <input id="gstCgst" type="number" min="0" step="0.01" placeholder="Enter CGST amount" />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>SGST (INR)</label>
          <input id="gstSgst" type="number" min="0" step="0.01" placeholder="Enter SGST amount" />
        </div>
        <div class="form-group col-6">
          <label>Filed Date</label>
          <input id="gstFiledDate" type="date" />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="gstNotes" placeholder="Enter any notes" rows="3"></textarea>
      </div>
    </div>
  `;
  
  openModal('File GST Return', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'File Return', type: 'primary', action: () => {
      const gstin = document.getElementById('gstGstin').value.trim();
      const returnType = document.getElementById('gstReturnType').value;
      const period = document.getElementById('gstPeriod').value;
      const taxableValue = parseFloat(document.getElementById('gstTaxableValue').value);
      const igst = parseFloat(document.getElementById('gstIgst').value) || 0;
      const cgst = parseFloat(document.getElementById('gstCgst').value) || 0;
      const sgst = parseFloat(document.getElementById('gstSgst').value) || 0;
      const status = document.getElementById('gstStatus').value;
      const filedDate = document.getElementById('gstFiledDate').value;
      const notes = document.getElementById('gstNotes').value.trim();
      
      if (!gstin || !returnType || !period || isNaN(taxableValue) || !status || taxableValue < 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      if (gstin.length !== 15) {
        showToast('GSTIN must be 15 characters long', 'error');
        return;
      }
      
      const total = igst + cgst + sgst;
      
      const returns = loadGstReturns();
      const newReturn = {
        id: generateGstId(),
        gstin,
        returnType,
        period,
        taxableValue,
        igst,
        cgst,
        sgst,
        total,
        status,
        filedDate: filedDate || (status === 'Filed' ? new Date().toISOString().slice(0, 10) : ''),
        notes: notes || 'N/A',
        createdAt: new Date().toISOString()
      };
      
      returns.unshift(newReturn);
      saveGstReturns(returns);
      closeModal();
      renderGstReturns();
      updateDashboardStats(); // Update dashboard stats
      showToast('GST return filed successfully', 'success');
    }}
  ], 'modal-lg');
  
  // Set default period to current month
  setTimeout(() => {
    const periodInput = document.getElementById('gstPeriod');
    if (periodInput) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      periodInput.value = `${year}-${month}`;
    }
  }, 100);
}

function viewGstReturn(returnId) {
  const returns = loadGstReturns();
  const ret = returns.find(r => r.id === returnId);
  if (!ret) return;
  
  const html = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Return ID</div>
        <div style="font-size: 1.1rem; font-weight: 700; color: var(--brand-600);">${ret.id}</div>
      </div>
      <div>
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.25rem;">Status</div>
        <div><span class="${gstBadgeClass(ret.status)}">${ret.status}</span></div>
      </div>
    </div>
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Return Details</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
        <div><strong>GSTIN:</strong> ${ret.gstin}</div>
        <div><strong>Return Type:</strong> ${ret.returnType}</div>
        <div><strong>Period:</strong> ${ret.period}</div>
        <div><strong>Taxable Value:</strong> ${formatINR(ret.taxableValue)}</div>
        <div><strong>IGST:</strong> ${formatINR(ret.igst)}</div>
        <div><strong>CGST:</strong> ${formatINR(ret.cgst)}</div>
        <div><strong>SGST:</strong> ${formatINR(ret.sgst)}</div>
        <div><strong>Total Tax:</strong> ${formatINR(ret.total)}</div>
        <div><strong>Filed Date:</strong> ${ret.filedDate || 'Not filed'}</div>
        <div><strong>Created:</strong> ${formatDate(ret.createdAt)}</div>
      </div>
    </div>
    
    ${ret.notes !== 'N/A' ? `
      <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
        <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Notes</div>
        <div style="font-size: 0.9rem;">${ret.notes}</div>
      </div>
    ` : ''}
  `;
  
  openModal('GST Return Details', html, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Edit', type: 'primary', action: () => { closeModal(); editGstReturn(returnId); } }
  ], 'modal-large');
}

function editGstReturn(returnId) {
  const returns = loadGstReturns();
  const ret = returns.find(r => r.id === returnId);
  if (!ret) return;
  
  const body = `
    <div class="form-group">
      <label>GSTIN *</label>
      <input id="editGstGstin" type="text" value="${ret.gstin}" maxlength="15" required />
    </div>
    <div class="form-group">
      <label>Return Type *</label>
      <select id="editGstReturnType" required>
        <option value="">Select return type...</option>
        ${GST_RETURN_TYPES.map(type => `<option value="${type}" ${ret.returnType === type ? 'selected' : ''}>${type}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Period (YYYY-MM) *</label>
      <input id="editGstPeriod" type="month" value="${ret.period}" required />
    </div>
    <div class="form-group">
      <label>Taxable Value (INR) *</label>
      <input id="editGstTaxableValue" type="number" min="0" step="0.01" value="${ret.taxableValue}" required />
    </div>
    <div class="form-group">
      <label>IGST (INR)</label>
      <input id="editGstIgst" type="number" min="0" step="0.01" value="${ret.igst}" />
    </div>
    <div class="form-group">
      <label>CGST (INR)</label>
      <input id="editGstCgst" type="number" min="0" step="0.01" value="${ret.cgst}" />
    </div>
    <div class="form-group">
      <label>SGST (INR)</label>
      <input id="editGstSgst" type="number" min="0" step="0.01" value="${ret.sgst}" />
    </div>
    <div class="form-group">
      <label>Status *</label>
      <select id="editGstStatus" required>
        <option value="">Select status...</option>
        ${GST_STATUS.map(status => `<option value="${status}" ${ret.status === status ? 'selected' : ''}>${status}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Filed Date</label>
      <input id="editGstFiledDate" type="date" value="${ret.filedDate || ''}" />
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="editGstNotes" rows="3">${ret.notes || ''}</textarea>
    </div>
  `;
  
  openModal('Edit GST Return', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Update Return', type: 'primary', action: () => {
      const gstin = document.getElementById('editGstGstin').value.trim();
      const returnType = document.getElementById('editGstReturnType').value;
      const period = document.getElementById('editGstPeriod').value;
      const taxableValue = parseFloat(document.getElementById('editGstTaxableValue').value);
      const igst = parseFloat(document.getElementById('editGstIgst').value) || 0;
      const cgst = parseFloat(document.getElementById('editGstCgst').value) || 0;
      const sgst = parseFloat(document.getElementById('editGstSgst').value) || 0;
      const status = document.getElementById('editGstStatus').value;
      const filedDate = document.getElementById('editGstFiledDate').value;
      const notes = document.getElementById('editGstNotes').value.trim();
      
      if (!gstin || !returnType || !period || isNaN(taxableValue) || !status || taxableValue < 0) {
        showToast('Please fill all required fields correctly', 'error');
        return;
      }
      
      if (gstin.length !== 15) {
        showToast('GSTIN must be 15 characters long', 'error');
        return;
      }
      
      const total = igst + cgst + sgst;
      
      const returnIndex = returns.findIndex(r => r.id === returnId);
      if (returnIndex === -1) return;
      
      returns[returnIndex] = {
        ...returns[returnIndex],
        gstin,
        returnType,
        period,
        taxableValue,
        igst,
        cgst,
        sgst,
        total,
        status,
        filedDate: filedDate || (status === 'Filed' ? new Date().toISOString().slice(0, 10) : ''),
        notes: notes || 'N/A',
        updatedAt: new Date().toISOString()
      };
      
      saveGstReturns(returns);
      closeModal();
      renderGstReturns();
      updateDashboardStats(); // Update dashboard stats
      showToast('GST return updated successfully', 'success');
    }}
  ], 'modal-lg');
}

function printGstReturn(returnId) {
  const returns = loadGstReturns();
  const ret = returns.find(r => r.id === returnId);
  if (!ret) return;
  
  const html = `
    <html><head><title>GST Return ${ret.id}</title><meta charset='utf-8'/>
    <style>body{font-family:Inter,Segoe UI,Roboto,sans-serif;background:#f8fafc;margin:0;padding:24px;color:#111827}
    .return{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;max-width:850px;margin:0 auto}
    .header{text-align:center;margin-bottom:24px;border-bottom:2px solid #e5e7eb;padding-bottom:16px}
    .row{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:12px}
    table{border-collapse:collapse;width:100%;margin-top:12px}
    th,td{border:1px solid #e5e7eb;padding:8px;text-align:left}
    th{background:#f9fafb;font-weight:600}
    .muted{color:#6b7280;font-size:0.9rem}
    .total{font-weight:700;font-size:1.1rem;color:#7c3aed}
    </style></head><body>
    <div class='return'>
      <div class='header'>
        <h1 style='margin:0;color:#7c3aed'>GST Return</h1>
        <div class='muted'>${ret.returnType} - ${ret.period}</div>
      </div>
      
      <div class='row'>
        <div>
          <div style='font-weight:600'>Return ID: ${ret.id}</div>
          <div class='muted'>GSTIN: ${ret.gstin}</div>
        </div>
        <div style='text-align:right'>
          <div style='font-weight:600'>Status: ${ret.status}</div>
          <div class='muted'>Filed: ${ret.filedDate || 'Not filed'}</div>
        </div>
      </div>
      
      <table>
        <tr><th>Taxable Value</th><td>${formatINR(ret.taxableValue)}</td><th>Total Tax</th><td class='total'>${formatINR(ret.total)}</td></tr>
        <tr><th>IGST</th><td>${formatINR(ret.igst)}</td><th>CGST</th><td>${formatINR(ret.cgst)}</td></tr>
        <tr><th>SGST</th><td>${formatINR(ret.sgst)}</td><th>Due Date</th><td>${ret.filedDate}</td></tr>
      </table>
      <div class='muted' style='margin-top:8px'>Filed Date: ${ret.filedDate}</div>
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

// Enhanced Dashboard Functions
function updateGstDashboardStats() {
  const returns = loadGstReturns();
  const settings = loadGstSettings();
  
  console.log('Updating GST dashboard stats with', returns.length, 'returns');
  
  // Calculate totals
  const totalGstCollected = returns.reduce((sum, ret) => sum + (ret.total || 0), 0);
  const totalGstPaid = returns.filter(ret => ret.status === 'Filed' || ret.status === 'Approved')
    .reduce((sum, ret) => sum + (ret.total || 0), 0);
  const totalGstPayable = totalGstCollected - totalGstPaid;
  const returnsFiled = returns.filter(ret => ret.status === 'Filed' || ret.status === 'Approved').length;
  
  // Calculate pending returns
  const pendingReturns = returns.filter(ret => 
    ret.status === 'Draft' || ret.status === 'Under Review'
  ).length;
  
  // Calculate compliance score
  const complianceScore = calculateComplianceScore();
  
  // Update UI elements safely
  updateElement('totalGstCollected', formatINR(totalGstCollected));
  updateElement('totalGstPaid', formatINR(totalGstPaid));
  updateElement('totalGstPayable', formatINR(totalGstPayable));
  updateElement('returnsFiledCount', returnsFiled);
  updateElement('pendingReturnsCount', pendingReturns);
  updateElement('complianceScore', complianceScore + '%');
  
  // Update trend indicators
  updateGstTrends();
  
  // Update return status and rate breakdown
  updateGstReturnStatus();
  updateGstRateBreakdown();
  
  // Update compliance alerts
  updateGstComplianceAlerts();
}

// Safe element update function
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  } else {
    console.log('Element not found:', id);
  }
}

// Update GST Trends
function updateGstTrends() {
  const returns = loadGstReturns();
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);
  
  // Calculate current month GST
  const currentMonthGst = returns.filter(ret => 
    ret.period === currentMonth && (ret.status === 'Filed' || ret.status === 'Approved')
  ).reduce((sum, ret) => sum + (ret.total || 0), 0);
  
  // Calculate last month GST
  const lastMonthGst = returns.filter(ret => 
    ret.period === lastMonth && (ret.status === 'Filed' || ret.status === 'Approved')
  ).reduce((sum, ret) => sum + (ret.total || 0), 0);
  
  // Calculate percentage change
  const change = lastMonthGst > 0 ? ((currentMonthGst - lastMonthGst) / lastMonthGst * 100) : 0;
  const trendIcon = change >= 0 ? 'pi-arrow-up' : 'pi-arrow-down';
  const trendColor = change >= 0 ? 'var(--success-500)' : 'var(--error-500)';
  
  // Update trend elements
  const trendElement = document.getElementById('gstCollectedTrend');
  if (trendElement) {
    trendElement.innerHTML = `<i class="pi ${trendIcon}" style="color: ${trendColor}"></i> ${Math.abs(change).toFixed(1)}%`;
  }
}

// Update GST Return Status
function updateGstReturnStatus() {
  const container = document.getElementById('gstReturnStatus');
  if (!container) {
    console.log('GST return status container not found');
    return;
  }
  
  const returns = loadGstReturns();
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;
  
  // Get last 3 months
  const months = [];
  for (let i = 0; i < 3; i++) {
    const checkDate = new Date(currentYear, currentMonth - 1 - i, 1);
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, '0');
    const period = `${year}-${month}`;
    const monthName = checkDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    months.push({
      period,
      monthName,
      returns: returns.filter(ret => ret.period === period)
    });
  }
  
  container.innerHTML = months.map(month => {
    const gstr1 = month.returns.find(r => r.returnType === 'GSTR-1');
    const gstr3b = month.returns.find(r => r.returnType === 'GSTR-3B');
    
    const gstr1Status = gstr1 ? gstr1.status : 'Not Filed';
    const gstr3bStatus = gstr3b ? gstr3b.status : 'Not Filed';
    
    const isOverdue = isReturnOverdue('GSTR-1', month.period) || isReturnOverdue('GSTR-3B', month.period);
    const statusClass = isOverdue ? 'status-overdue' : 'status-normal';
    
    return `
      <div class="return-status-item ${statusClass}">
        <div class="return-month">
          <strong>${month.monthName}</strong>
          ${isOverdue ? '<span class="overdue-badge">Overdue</span>' : ''}
        </div>
        <div class="return-details">
          <div class="return-item">
            <span>GSTR-1:</span>
            <span class="${gstBadgeClass(gstr1Status)}">${gstr1Status}</span>
          </div>
          <div class="return-item">
            <span>GSTR-3B:</span>
            <span class="${gstBadgeClass(gstr3bStatus)}">${gstr3bStatus}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Update GST Rate Breakdown
function updateGstRateBreakdown() {
  const container = document.getElementById('gstRateBreakdown');
  if (!container) {
    console.log('GST rate breakdown container not found');
    return;
  }
  
  const returns = loadGstReturns();
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  // Calculate current month breakdown
  const currentMonthReturns = returns.filter(ret => 
    ret.period === currentMonth && (ret.status === 'Filed' || ret.status === 'Approved')
  );
  
  const totalCgst = currentMonthReturns.reduce((sum, ret) => sum + (ret.cgst || 0), 0);
  const totalSgst = currentMonthReturns.reduce((sum, ret) => sum + (ret.sgst || 0), 0);
  const totalIgst = currentMonthReturns.reduce((sum, ret) => sum + (ret.igst || 0), 0);
  const totalGst = totalCgst + totalSgst + totalIgst;
  
  container.innerHTML = `
    <div class="rate-breakdown">
      <div class="rate-item">
        <span>CGST (9%)</span>
        <span class="rate-amount">${formatINR(totalCgst)}</span>
      </div>
      <div class="rate-item">
        <span>SGST (9%)</span>
        <span class="rate-amount">${formatINR(totalSgst)}</span>
      </div>
      <div class="rate-item">
        <span>IGST (18%)</span>
        <span class="rate-amount">${formatINR(totalIgst)}</span>
      </div>
      <hr class="rate-divider">
      <div class="rate-total">
        <span>Total GST</span>
        <span class="total-amount">${formatINR(totalGst)}</span>
      </div>
    </div>
  `;
}

// Update GST Compliance Alerts
function updateGstComplianceAlerts() {
  const container = document.getElementById('gstComplianceAlerts');
  if (!container) {
    console.log('GST compliance alerts container not found');
    return;
  }
  
  const returns = loadGstReturns();
  const alerts = [];
  
  // Check for overdue returns
  const overdueReturns = returns.filter(ret => 
    ret.status === 'Draft' && isReturnOverdue(ret.returnType, ret.period)
  );
  
  if (overdueReturns.length > 0) {
    alerts.push({
      type: 'error',
      icon: 'pi-exclamation-triangle',
      title: 'Overdue Returns',
      message: `${overdueReturns.length} return(s) are overdue and need immediate attention.`
    });
  }
  
  // Check for upcoming due dates
  const currentDate = new Date();
  const nextWeek = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingReturns = returns.filter(ret => {
    const dueDate = getGstDueDate(ret.returnType, ret.period);
    if (!dueDate) return false;
    
    const due = new Date(dueDate);
    return due <= nextWeek && due >= currentDate && ret.status === 'Draft';
  });
  
  if (upcomingReturns.length > 0) {
    alerts.push({
      type: 'warning',
      icon: 'pi-clock',
      title: 'Upcoming Due Dates',
      message: `${upcomingReturns.length} return(s) are due within the next 7 days.`
    });
  }
  
  // Check compliance score
  const complianceScore = calculateComplianceScore();
  if (complianceScore < 80) {
    alerts.push({
      type: 'info',
      icon: 'pi-info-circle',
      title: 'Compliance Score',
      message: `Your compliance score is ${complianceScore}%. Consider filing pending returns to improve it.`
    });
  }
  
  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      icon: 'pi-check-circle',
      title: 'All Good',
      message: 'No compliance issues found. Keep up the good work!'
    });
  }
  
  container.innerHTML = alerts.map(alert => `
    <div class="compliance-alert alert-${alert.type}">
      <i class="pi ${alert.icon}"></i>
      <div class="alert-content">
        <div class="alert-title">${alert.title}</div>
        <div class="alert-message">${alert.message}</div>
      </div>
    </div>
  `).join('');
}

// New Modal Functions
function openGstCalculatorModal() {
  const body = `
    <div class="calculator-container">
      <div class="form-section">
        <h4>Tax Calculator</h4>
        <div class="form-row">
          <div class="form-group col-6">
            <label>Amount *</label>
            <input id="calcAmount" type="number" min="0" step="0.01" placeholder="Enter amount" required />
          </div>
          <div class="form-group col-6">
            <label>Tax Rate (%) *</label>
            <select id="calcTaxRate" required>
              <option value="">Select tax rate...</option>
              <option value="0">0% (Exempt)</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-6">
            <label>Transaction Type</label>
            <select id="calcTransactionType">
              <option value="intrastate">Intrastate (CGST + SGST)</option>
              <option value="interstate">Interstate (IGST)</option>
            </select>
          </div>
          <div class="form-group col-6">
            <label>Currency</label>
            <select id="calcCurrency">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="calculation-results" id="calculationResults" style="display: none;">
        <h4>Calculation Results</h4>
        <div class="result-grid">
          <div class="result-item">
            <span>Taxable Amount:</span>
            <span id="resultTaxableAmount">₹0.00</span>
          </div>
          <div class="result-item">
            <span>CGST (9%):</span>
            <span id="resultCgst">₹0.00</span>
          </div>
          <div class="result-item">
            <span>SGST (9%):</span>
            <span id="resultSgst">₹0.00</span>
          </div>
          <div class="result-item">
            <span>IGST (18%):</span>
            <span id="resultIgst">₹0.00</span>
          </div>
          <div class="result-item total">
            <span>Total Tax:</span>
            <span id="resultTotalTax">₹0.00</span>
          </div>
          <div class="result-item total">
            <span>Total Amount:</span>
            <span id="resultTotalAmount">₹0.00</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  openModal('GST Tax Calculator', body, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Calculate', type: 'primary', action: calculateGstTax },
    { label: 'Save Calculation', type: 'info', action: saveGstCalculation }
  ], 'modal-large');
  
  // Add event listeners for real-time calculation
  setTimeout(() => {
    const amountInput = document.getElementById('calcAmount');
    const taxRateSelect = document.getElementById('calcTaxRate');
    const transactionTypeSelect = document.getElementById('calcTransactionType');
    
    if (amountInput && taxRateSelect && transactionTypeSelect) {
      [amountInput, taxRateSelect, transactionTypeSelect].forEach(element => {
        element.addEventListener('input', calculateGstTax);
        element.addEventListener('change', calculateGstTax);
      });
    }
  }, 100);
}

function calculateGstTax() {
  const amount = parseFloat(document.getElementById('calcAmount').value) || 0;
  const taxRate = parseFloat(document.getElementById('calcTaxRate').value) || 0;
  const transactionType = document.getElementById('calcTransactionType').value;
  const currency = document.getElementById('calcCurrency').value;
  
  if (amount <= 0 || taxRate < 0) {
    document.getElementById('calculationResults').style.display = 'none';
    return;
  }
  
  try {
    const isInterstate = transactionType === 'interstate';
    const calculation = calculateGST(amount, taxRate / 100, isInterstate);
    
    // Update results
    document.getElementById('resultTaxableAmount').textContent = `${currency === 'INR' ? '₹' : '$'}${calculation.taxableAmount.toFixed(2)}`;
    document.getElementById('resultCgst').textContent = `${currency === 'INR' ? '₹' : '$'}${calculation.cgst.toFixed(2)}`;
    document.getElementById('resultSgst').textContent = `${currency === 'INR' ? '₹' : '$'}${calculation.sgst.toFixed(2)}`;
    document.getElementById('resultIgst').textContent = `${currency === 'INR' ? '₹' : '$'}${calculation.igst.toFixed(2)}`;
    document.getElementById('resultTotalTax').textContent = `${currency === 'INR' ? '₹' : '$'}${calculation.totalTax.toFixed(2)}`;
    document.getElementById('resultTotalAmount').textContent = `${currency === 'INR' ? '₹' : '$'}${calculation.totalAmount.toFixed(2)}`;
    
    document.getElementById('calculationResults').style.display = 'block';
  } catch (error) {
    showToast('Error calculating GST: ' + error.message, 'error');
  }
}

function saveGstCalculation() {
  const amount = parseFloat(document.getElementById('calcAmount').value) || 0;
  const taxRate = parseFloat(document.getElementById('calcTaxRate').value) || 0;
  const transactionType = document.getElementById('calcTransactionType').value;
  const currency = document.getElementById('calcCurrency').value;
  
  if (amount <= 0 || taxRate < 0) {
    showToast('Please enter valid amount and tax rate', 'error');
    return;
  }
  
  try {
    const isInterstate = transactionType === 'interstate';
    const calculation = calculateGST(amount, taxRate / 100, isInterstate);
    
    const calculations = loadGstCalculations();
    const newCalculation = {
      id: 'CALC-' + Date.now(),
      amount: amount,
      taxRate: taxRate,
      transactionType: transactionType,
      currency: currency,
      calculation: calculation,
      createdAt: new Date().toISOString()
    };
    
    calculations.unshift(newCalculation);
    saveGstCalculations(calculations);
    
    showToast('Calculation saved successfully', 'success');
  } catch (error) {
    showToast('Error saving calculation: ' + error.message, 'error');
  }
}

function openGstReportsModal() {
  const body = `
    <div class="reports-container">
      <div class="form-section">
        <h4>Generate GST Reports</h4>
        <div class="form-row">
          <div class="form-group col-6">
            <label>Report Type</label>
            <select id="reportType">
              <option value="monthly">Monthly Summary</option>
              <option value="quarterly">Quarterly Summary</option>
              <option value="yearly">Yearly Summary</option>
              <option value="compliance">Compliance Report</option>
              <option value="detailed">Detailed Report</option>
            </select>
          </div>
          <div class="form-group col-6">
            <label>Period</label>
            <input id="reportPeriod" type="month" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-6">
            <label>Format</label>
            <select id="reportFormat">
              <option value="html">HTML</option>
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
            </select>
          </div>
          <div class="form-group col-6">
            <label>Include Charts</label>
            <input type="checkbox" id="includeCharts" checked />
          </div>
        </div>
      </div>
      
      <div class="report-preview" id="reportPreview" style="display: none;">
        <h4>Report Preview</h4>
        <div id="reportContent"></div>
      </div>
    </div>
  `;
  
  openModal('GST Reports', body, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Generate Report', type: 'primary', action: generateGstReport },
    { label: 'Download', type: 'info', action: downloadGstReport }
  ], 'modal-xl');
  
  // Set default period to current month
  setTimeout(() => {
    const periodInput = document.getElementById('reportPeriod');
    if (periodInput) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      periodInput.value = `${year}-${month}`;
    }
  }, 100);
}

function generateGstReport() {
  const reportType = document.getElementById('reportType').value;
  const period = document.getElementById('reportPeriod').value;
  const format = document.getElementById('reportFormat').value;
  const includeCharts = document.getElementById('includeCharts').checked;
  
  if (!period) {
    showToast('Please select a period', 'error');
    return;
  }
  
  // Generate report content based on type
  let reportContent = '';
  
  switch (reportType) {
    case 'monthly':
      reportContent = generateMonthlyReport(period);
      break;
    case 'quarterly':
      reportContent = generateQuarterlyReport(period);
      break;
    case 'yearly':
      reportContent = generateYearlyReport(period);
      break;
    case 'compliance':
      reportContent = generateComplianceReport();
      break;
    case 'detailed':
      reportContent = generateDetailedReport(period);
      break;
  }
  
  document.getElementById('reportContent').innerHTML = reportContent;
  document.getElementById('reportPreview').style.display = 'block';
  
  showToast('Report generated successfully', 'success');
}

function openGstSettingsModal() {
  const settings = loadGstSettings();
  const body = `
    <div class="settings-container">
      <div class="form-section">
        <h4>Tax Configuration</h4>
        <div class="form-row">
          <div class="form-group col-6">
            <label>Country</label>
            <select id="settingsCountry">
              <option value="IN" ${settings.country === 'IN' ? 'selected' : ''}>India</option>
              <option value="US" ${settings.country === 'US' ? 'selected' : ''}>United States</option>
              <option value="UK" ${settings.country === 'UK' ? 'selected' : ''}>United Kingdom</option>
            </select>
          </div>
          <div class="form-group col-6">
            <label>Currency</label>
            <select id="settingsCurrency">
              <option value="INR" ${settings.currency === 'INR' ? 'selected' : ''}>INR (₹)</option>
              <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>USD ($)</option>
              <option value="EUR" ${settings.currency === 'EUR' ? 'selected' : ''}>EUR (€)</option>
            </select>
          </div>
        </div>
      </div>
      
      <div class="form-section">
        <h4>Compliance Settings</h4>
        <div class="form-row">
          <div class="form-group col-6">
            <label>
              <input type="checkbox" id="settingsAutoCalculate" ${settings.autoCalculate ? 'checked' : ''} />
              Auto-calculate taxes
            </label>
          </div>
          <div class="form-group col-6">
            <label>
              <input type="checkbox" id="settingsValidateGSTIN" ${settings.validateGSTIN ? 'checked' : ''} />
              Validate GSTIN format
            </label>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group col-6">
            <label>
              <input type="checkbox" id="settingsSendReminders" ${settings.sendReminders ? 'checked' : ''} />
              Send filing reminders
            </label>
          </div>
          <div class="form-group col-6">
            <label>Reminder Days</label>
            <input type="text" id="settingsReminderDays" value="${settings.reminderDays.join(', ')}" placeholder="7, 3, 1" />
          </div>
        </div>
      </div>
    </div>
  `;
  
  openModal('GST Settings', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Save Settings', type: 'primary', action: saveGstSettingsModal }
  ], 'modal-large');
}

function saveGstSettingsModal() {
  const settings = {
    country: document.getElementById('settingsCountry').value,
    currency: document.getElementById('settingsCurrency').value,
    autoCalculate: document.getElementById('settingsAutoCalculate').checked,
    validateGSTIN: document.getElementById('settingsValidateGSTIN').checked,
    sendReminders: document.getElementById('settingsSendReminders').checked,
    reminderDays: document.getElementById('settingsReminderDays').value.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d))
  };
  
  saveGstSettings(settings);
  closeModal();
  showToast('Settings saved successfully', 'success');
  
  // Update current tax config
  currentTaxConfig = {
    country: settings.country,
    currency: settings.currency,
    rates: GST_TAX_RATES[settings.country]?.rates || [],
    components: GST_TAX_RATES[settings.country]?.components || []
  };
  
  // Refresh dashboard
  updateGstDashboardStats();
}

// Additional utility functions
function refreshGstStatus() {
  updateGstReturnStatus();
  updateGstComplianceAlerts();
  showToast('Status refreshed', 'success');
}

function switchGstChart(period) {
  // Update active button
  document.querySelectorAll('#gstAnalyticsChart').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  
  // Update chart based on period
  updateGstAnalyticsChart(period);
}

function updateGstAnalyticsChart(period) {
  // This would integrate with a charting library like Chart.js
  // For now, show a placeholder
  const chartContainer = document.getElementById('gstAnalyticsChart');
  if (chartContainer) {
    chartContainer.innerHTML = `
      <div class="chart-placeholder">
        <i class="pi pi-chart-bar" style="font-size: 3rem; color: var(--gray-400);"></i>
        <p>GST Analytics Chart - ${period.charAt(0).toUpperCase() + period.slice(1)} View</p>
        <small>Chart integration coming soon</small>
      </div>
    `;
  }
}

// Initialize GST management when page loads
function initializeGstManagement() {
  console.log('Initializing GST Management...');
  
  // Initialize with sample data if empty
  initializeSampleData();
  
  // Render the returns table first
  renderGstReturns();
  
  // Update all dashboard components
  updateGstDashboardStats();
  updateGstReturnStatus();
  updateGstRateBreakdown();
  updateGstComplianceAlerts();
  
  console.log('GST Management initialized successfully');
}

// Test function to verify GST functionality
function testGstManagement() {
  console.log('Testing GST Management...');
  
  // Test data loading
  const returns = loadGstReturns();
  console.log('Loaded returns:', returns.length);
  
  // Test settings loading
  const settings = loadGstSettings();
  console.log('Loaded settings:', settings);
  
  // Test calculation
  try {
    const calculation = calculateGST(10000, 0.18, false);
    console.log('GST calculation test:', calculation);
  } catch (error) {
    console.error('GST calculation error:', error);
  }
  
  // Test validation
  const validGstin = validateGSTIN('29ABCDE1234F1Z5');
  console.log('GSTIN validation test:', validGstin);
  
  console.log('GST Management test completed');
}

// Initialize sample data for demonstration
function initializeSampleData() {
  const returns = loadGstReturns();
  const settings = loadGstSettings();
  
  // Add sample returns if none exist
  if (returns.length === 0) {
    const sampleReturns = [
      {
        id: 'GST-001',
        gstin: '29ABCDE1234F1Z5',
        returnType: 'GSTR-1',
        period: '2024-01',
        taxableValue: 100000,
        igst: 0,
        cgst: 9000,
        sgst: 9000,
        total: 18000,
        status: 'Filed',
        filedDate: '2024-02-10',
        notes: 'Monthly return for January 2024',
        createdAt: new Date().toISOString()
      },
      {
        id: 'GST-002',
        gstin: '29ABCDE1234F1Z5',
        returnType: 'GSTR-3B',
        period: '2024-01',
        taxableValue: 100000,
        igst: 0,
        cgst: 9000,
        sgst: 9000,
        total: 18000,
        status: 'Filed',
        filedDate: '2024-02-20',
        notes: 'Monthly return for January 2024',
        createdAt: new Date().toISOString()
      },
      {
        id: 'GST-003',
        gstin: '29ABCDE1234F1Z5',
        returnType: 'GSTR-1',
        period: '2024-02',
        taxableValue: 150000,
        igst: 27000,
        cgst: 0,
        sgst: 0,
        total: 27000,
        status: 'Draft',
        filedDate: '',
        notes: 'Interstate sales for February 2024',
        createdAt: new Date().toISOString()
      }
    ];
    
    saveGstReturns(sampleReturns);
  }
  
  // Initialize settings if not set
  if (!settings.country) {
    saveGstSettings({
      country: 'IN',
      currency: 'INR',
      autoCalculate: true,
      validateGSTIN: true,
      sendReminders: true,
      reminderDays: [7, 3, 1]
    });
  }
}

// Report Generation Functions
function generateMonthlyReport(period) {
  const returns = loadGstReturns();
  const monthReturns = returns.filter(ret => ret.period === period);
  
  const totalCgst = monthReturns.reduce((sum, ret) => sum + (ret.cgst || 0), 0);
  const totalSgst = monthReturns.reduce((sum, ret) => sum + (ret.sgst || 0), 0);
  const totalIgst = monthReturns.reduce((sum, ret) => sum + (ret.igst || 0), 0);
  const totalGst = totalCgst + totalSgst + totalIgst;
  const totalTaxableValue = monthReturns.reduce((sum, ret) => sum + (ret.taxableValue || 0), 0);
  
  return `
    <div class="report-content">
      <h3>Monthly GST Report - ${period}</h3>
      <div class="report-summary">
        <div class="summary-item">
          <span>Total Taxable Value:</span>
          <span>${formatINR(totalTaxableValue)}</span>
        </div>
        <div class="summary-item">
          <span>CGST Collected:</span>
          <span>${formatINR(totalCgst)}</span>
        </div>
        <div class="summary-item">
          <span>SGST Collected:</span>
          <span>${formatINR(totalSgst)}</span>
        </div>
        <div class="summary-item">
          <span>IGST Collected:</span>
          <span>${formatINR(totalIgst)}</span>
        </div>
        <div class="summary-item total">
          <span>Total GST:</span>
          <span>${formatINR(totalGst)}</span>
        </div>
      </div>
      <div class="report-details">
        <h4>Return Details</h4>
        <table class="report-table">
          <thead>
            <tr>
              <th>Return Type</th>
              <th>Status</th>
              <th>Taxable Value</th>
              <th>Total Tax</th>
            </tr>
          </thead>
          <tbody>
            ${monthReturns.map(ret => `
              <tr>
                <td>${ret.returnType}</td>
                <td><span class="${gstBadgeClass(ret.status)}">${ret.status}</span></td>
                <td>${formatINR(ret.taxableValue)}</td>
                <td>${formatINR(ret.total)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function generateQuarterlyReport(period) {
  // Generate quarterly report based on period
  return generateMonthlyReport(period); // Simplified for now
}

function generateYearlyReport(period) {
  // Generate yearly report based on period
  return generateMonthlyReport(period); // Simplified for now
}

function generateComplianceReport() {
  const returns = loadGstReturns();
  const complianceScore = calculateComplianceScore();
  
  const overdueReturns = returns.filter(ret => 
    ret.status === 'Draft' && isReturnOverdue(ret.returnType, ret.period)
  );
  
  const filedReturns = returns.filter(ret => 
    ret.status === 'Filed' || ret.status === 'Approved'
  );
  
  return `
    <div class="report-content">
      <h3>GST Compliance Report</h3>
      <div class="compliance-summary">
        <div class="compliance-score">
          <h4>Compliance Score: ${complianceScore}%</h4>
          <div class="score-bar">
            <div class="score-fill" style="width: ${complianceScore}%"></div>
          </div>
        </div>
        <div class="compliance-stats">
          <div class="stat-item">
            <span>Total Returns:</span>
            <span>${returns.length}</span>
          </div>
          <div class="stat-item">
            <span>Filed Returns:</span>
            <span>${filedReturns.length}</span>
          </div>
          <div class="stat-item">
            <span>Overdue Returns:</span>
            <span class="${overdueReturns.length > 0 ? 'text-error' : 'text-success'}">${overdueReturns.length}</span>
          </div>
        </div>
      </div>
      ${overdueReturns.length > 0 ? `
        <div class="overdue-section">
          <h4>Overdue Returns</h4>
          <ul>
            ${overdueReturns.map(ret => `
              <li>${ret.returnType} - ${ret.period} (Due: ${getGstDueDate(ret.returnType, ret.period)})</li>
            `).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
}

function generateDetailedReport(period) {
  return generateMonthlyReport(period); // Simplified for now
}

function downloadGstReport() {
  const reportContent = document.getElementById('reportContent').innerHTML;
  const reportType = document.getElementById('reportType').value;
  const period = document.getElementById('reportPeriod').value;
  
  if (!reportContent) {
    showToast('Please generate a report first', 'error');
    return;
  }
  
  // Create downloadable content
  const html = `
    <html>
      <head>
        <title>GST ${reportType} Report - ${period}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .report-content { max-width: 800px; margin: 0 auto; }
          .summary-item { display: flex; justify-content: space-between; margin: 10px 0; }
          .summary-item.total { font-weight: bold; border-top: 1px solid #ccc; padding-top: 10px; }
          .report-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .report-table th, .report-table td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          .report-table th { background-color: #f5f5f5; }
        </style>
      </head>
      <body>
        ${reportContent}
      </body>
    </html>
  `;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GST_${reportType}_Report_${period}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Report downloaded successfully', 'success');
}

// Additional utility functions for missing actions
function fileGstReturn(returnId) {
  const returns = loadGstReturns();
  const returnIndex = returns.findIndex(r => r.id === returnId);
  
  if (returnIndex === -1) {
    showToast('Return not found', 'error');
    return;
  }
  
  returns[returnIndex].status = 'Filed';
  returns[returnIndex].filedDate = new Date().toISOString().slice(0, 10);
  returns[returnIndex].updatedAt = new Date().toISOString();
  
  saveGstReturns(returns);
  renderGstReturns();
  updateGstDashboardStats();
  showToast('Return filed successfully', 'success');
}

function deleteGstReturn(returnId) {
  confirmModal('Delete GST Return', 'Are you sure you want to delete this GST return? This action cannot be undone.', () => {
    const returns = loadGstReturns();
    const filteredReturns = returns.filter(r => r.id !== returnId);
    saveGstReturns(filteredReturns);
    renderGstReturns();
    updateGstDashboardStats();
    showToast('GST return deleted successfully', 'success');
  });
}

function downloadGstPDF(returnId) {
  const returns = loadGstReturns();
  const ret = returns.find(r => r.id === returnId);
  if (!ret) return;
  
  // For now, open print dialog
  printGstReturn(returnId);
  showToast('PDF download initiated', 'info');
}

function exportGstData(returnId) {
  const returns = loadGstReturns();
  const ret = returns.find(r => r.id === returnId);
  if (!ret) return;
  
  // Export as CSV
  const csvContent = `Return ID,GSTIN,Return Type,Period,Taxable Value,IGST,CGST,SGST,Total,Status,Filed Date
${ret.id},${ret.gstin},${ret.returnType},${ret.period},${ret.taxableValue},${ret.igst || 0},${ret.cgst || 0},${ret.sgst || 0},${ret.total},${ret.status},${ret.filedDate || ''}`;
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GST_Return_${ret.id}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  showToast('Data exported successfully', 'success');
}

// Make functions globally available
window.openGstCalculatorModal = openGstCalculatorModal;
window.openGstReportsModal = openGstReportsModal;
window.openGstSettingsModal = openGstSettingsModal;
window.refreshGstStatus = refreshGstStatus;
window.switchGstChart = switchGstChart;
window.initializeGstManagement = initializeGstManagement;
window.fileGstReturn = fileGstReturn;
window.deleteGstReturn = deleteGstReturn;
window.downloadGstPDF = downloadGstPDF;
window.exportGstData = exportGstData;

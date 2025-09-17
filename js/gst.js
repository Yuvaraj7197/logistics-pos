// GST Management JavaScript
const GST_STORAGE_KEY = 'logosic_gst_v1';

// Sample GST data
const GST_RECORDS = [
  { id: 'GST-001', gstin: '29ABCDE1234F1Z5', returnType: 'GSTR-1', period: '2025-08', taxableValue: 2400000, igst: 432000, cgst: 0, sgst: 0, total: 432000, status: 'Filed', filedDate: '2025-09-11' },
  { id: 'GST-002', gstin: '29ABCDE1234F1Z5', returnType: 'GSTR-3B', period: '2025-08', taxableValue: 2400000, igst: 432000, cgst: 0, sgst: 0, total: 432000, status: 'Filed', filedDate: '2025-09-20' },
  { id: 'GST-003', gstin: '29ABCDE1234F1Z5', returnType: 'GSTR-1', period: '2025-07', taxableValue: 2200000, igst: 396000, cgst: 0, sgst: 0, total: 396000, status: 'Filed', filedDate: '2025-08-11' },
  { id: 'GST-004', gstin: '29ABCDE1234F1Z5', returnType: 'GSTR-3B', period: '2025-07', taxableValue: 2200000, igst: 396000, cgst: 0, sgst: 0, total: 396000, status: 'Filed', filedDate: '2025-08-20' },
  { id: 'GST-005', gstin: '29ABCDE1234F1Z5', returnType: 'GSTR-1', period: '2025-09', taxableValue: 2600000, igst: 468000, cgst: 0, sgst: 0, total: 468000, status: 'Draft', filedDate: '' }
];

const GST_RETURN_TYPES = ['GSTR-1', 'GSTR-3B', 'GSTR-2A', 'GSTR-2B', 'GSTR-9'];
const GST_STATUS = ['Draft', 'Filed', 'Approved', 'Rejected'];

// Storage functions
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

// Utility functions
function gstBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'filed') return 'status-badge status-filed';
  if (s === 'approved') return 'status-badge status-active';
  if (s === 'rejected') return 'status-badge status-inactive';
  if (s === 'draft') return 'status-badge status-pending';
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

// Main render function
function renderGstReturns() {
  const tbody = document.getElementById('gstTbody');
  if (!tbody) return;
  
  const returns = loadGstReturns();
  
  // Initialize or update pagination
  if (!window.paginationInstances['gstContainer']) {
    createPagination('gstContainer', 10);
  }
  
  const pagination = window.paginationInstances['gstContainer'];
  pagination.updateData(returns);
  
  // Get current page data
  const currentPageData = pagination.getCurrentPageData();
  
  // Render table
  if (currentPageData.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" class="text-center" style="padding: 2rem; color: var(--gray-500);">
          <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No GST returns found
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = currentPageData.map(ret => `
    <tr>
      <td><strong>${ret.gstin}</strong></td>
      <td>${ret.returnType}</td>
      <td>${ret.period}</td>
      <td>${formatINR(ret.taxableValue)}</td>
      <td>${formatINR(ret.igst)}</td>
      <td>${formatINR(ret.cgst)}</td>
      <td>${formatINR(ret.sgst)}</td>
      <td>${formatINR(ret.total)}</td>
      <td><span class="${gstBadgeClass(ret.status)}">${ret.status}</span></td>
      <td>
        <div class="btn-group">
          <button class="btn btn-primary btn-sm" onclick="viewGstReturn('${ret.id}')">
            <i class="pi pi-eye"></i> View
          </button>
          <button class="btn btn-secondary btn-sm" onclick="editGstReturn('${ret.id}')">
            <i class="pi pi-pencil"></i> Edit
          </button>
          <button class="btn btn-secondary btn-sm" onclick="printGstReturn('${ret.id}')">
            <i class="pi pi-print"></i> Print
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// GST return management functions
function openGstReturnModal() {
  const body = `
    <div class="form-group">
      <label>GSTIN *</label>
      <input id="gstGstin" type="text" placeholder="Enter 15-digit GSTIN" maxlength="15" required />
    </div>
    <div class="form-group">
      <label>Return Type *</label>
      <select id="gstReturnType" required>
        <option value="">Select return type...</option>
        ${GST_RETURN_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Period (YYYY-MM) *</label>
      <input id="gstPeriod" type="month" required />
    </div>
    <div class="form-group">
      <label>Taxable Value (INR) *</label>
      <input id="gstTaxableValue" type="number" min="0" step="0.01" placeholder="Enter taxable value" required />
    </div>
    <div class="form-group">
      <label>IGST (INR)</label>
      <input id="gstIgst" type="number" min="0" step="0.01" placeholder="Enter IGST amount" />
    </div>
    <div class="form-group">
      <label>CGST (INR)</label>
      <input id="gstCgst" type="number" min="0" step="0.01" placeholder="Enter CGST amount" />
    </div>
    <div class="form-group">
      <label>SGST (INR)</label>
      <input id="gstSgst" type="number" min="0" step="0.01" placeholder="Enter SGST amount" />
    </div>
    <div class="form-group">
      <label>Status *</label>
      <select id="gstStatus" required>
        <option value="">Select status...</option>
        ${GST_STATUS.map(status => `<option value="${status}">${status}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label>Filed Date</label>
      <input id="gstFiledDate" type="date" />
    </div>
    <div class="form-group">
      <label>Notes</label>
      <textarea id="gstNotes" placeholder="Enter any notes" rows="3"></textarea>
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
      showToast('GST return filed successfully', 'success');
    }}
  ]);
  
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
  ], 'large');
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
      showToast('GST return updated successfully', 'success');
    }}
  ]);
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

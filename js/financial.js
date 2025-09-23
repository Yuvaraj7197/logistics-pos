// Comprehensive Financial Management System
// Includes Expense Tracking, Income Management, Double-Entry Accounting, Reporting, and Bank Reconciliation

const FINANCIAL_STORAGE_KEYS = {
  expenses: 'logosic_expenses_v2',
  income: 'logosic_income_v2',
  accounts: 'logosic_accounts_v2',
  transactions: 'logosic_transactions_v2',
  bankReconciliation: 'logosic_bank_reconciliation_v2',
  reports: 'logosic_financial_reports_v2'
};

// =============================================================================
// STORAGE MANAGEMENT
// =============================================================================

const financialStorage = {
  expenses: createStorageManager(FINANCIAL_STORAGE_KEYS.expenses, []),
  income: createStorageManager(FINANCIAL_STORAGE_KEYS.income, []),
  accounts: createStorageManager(FINANCIAL_STORAGE_KEYS.accounts, getDefaultAccounts()),
  transactions: createStorageManager(FINANCIAL_STORAGE_KEYS.transactions, []),
  bankReconciliation: createStorageManager(FINANCIAL_STORAGE_KEYS.bankReconciliation, []),
  reports: createStorageManager(FINANCIAL_STORAGE_KEYS.reports, [])
};

// =============================================================================
// DEFAULT ACCOUNTS SETUP
// =============================================================================

function getDefaultAccounts() {
  const config = getConfig('business.financial.accountTypes', {});
  const accounts = [];
  let accountId = 1;

  // Create default chart of accounts
  Object.entries(config).forEach(([type, subTypes]) => {
    subTypes.forEach(subType => {
      accounts.push({
        id: `ACC-${String(accountId).padStart(3, '0')}`,
        name: subType,
        type: type,
        code: `${type.substring(0, 3).toUpperCase()}-${String(accountId).padStart(3, '0')}`,
        balance: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      accountId++;
    });
  });

  return accounts;
}

// =============================================================================
// ID GENERATION
// =============================================================================

function generateFinancialId(prefix = 'FIN') {
  const records = [...financialStorage.expenses.load(), ...financialStorage.income.load()];
  let max = 0;
  records.forEach(record => {
    const n = parseInt((record.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(3, '0');
  return `${prefix}-${next}`;
}

function generateTransactionId() {
  const transactions = financialStorage.transactions.load();
  let max = 0;
  transactions.forEach(transaction => {
    const n = parseInt((transaction.id || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(n)) max = Math.max(max, n);
  });
  const next = String(max + 1).padStart(3, '0');
  return `TXN-${next}`;
}

// =============================================================================
// DOUBLE-ENTRY ACCOUNTING FUNCTIONS
// =============================================================================

function createTransaction(description, debitAccount, creditAccount, amount, reference = '', notes = '') {
  const transactionId = generateTransactionId();
  const timestamp = new Date().toISOString();
  
  const transaction = {
    id: transactionId,
    description,
    date: new Date().toISOString().split('T')[0],
    entries: [
      {
        accountId: debitAccount,
        debit: amount,
        credit: 0
      },
      {
        accountId: creditAccount,
        debit: 0,
        credit: amount
      }
    ],
    reference,
    notes,
    createdAt: timestamp,
    createdBy: 'system'
  };

  // Save transaction
  const transactions = financialStorage.transactions.load();
  transactions.push(transaction);
  financialStorage.transactions.save(transactions);

  // Update account balances
  updateAccountBalances(transaction);

  return transaction;
}

function updateAccountBalances(transaction) {
  const accounts = financialStorage.accounts.load();
  
  transaction.entries.forEach(entry => {
    const accountIndex = accounts.findIndex(acc => acc.id === entry.accountId);
    if (accountIndex !== -1) {
      accounts[accountIndex].balance += entry.credit - entry.debit;
      accounts[accountIndex].updatedAt = new Date().toISOString();
    }
  });

  financialStorage.accounts.save(accounts);
}

// =============================================================================
// EXPENSE MANAGEMENT
// =============================================================================

function addExpense() {
  const expenseCategories = getConfig('business.financial.expenseCategories', {});
  const paymentMethods = getConfig('business.financial.paymentMethods', []);
  const statuses = getConfig('business.financial.statuses', []);

  const categoryOptions = Object.entries(expenseCategories).map(([category, items]) => 
    `<optgroup label="${category}">
      ${items.map(item => `<option value="${item}">${item}</option>`).join('')}
    </optgroup>`
  ).join('');

  const body = `
    <div class="form-section">
      <h4>Expense Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Category *</label>
          <select id="expenseCategory" required onchange="updateExpenseSubcategory()">
            <option value="">Select category...</option>
            ${categoryOptions}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Amount (INR) *</label>
          <input id="expenseAmount" type="number" min="0" step="0.01" placeholder="Enter amount" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Subcategory</label>
          <select id="expenseSubcategory">
            <option value="">Select subcategory...</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>Payment Method *</label>
          <select id="expensePaymentMethod" required>
            <option value="">Select method...</option>
            ${paymentMethods.map(method => `<option value="${method}">${method}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Description *</label>
        <input id="expenseDescription" type="text" placeholder="Enter expense description" required />
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="expenseStatus" required>
            <option value="">Select status...</option>
            ${statuses.map(status => `<option value="${status}">${status}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Date *</label>
          <input id="expenseDate" type="date" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Vendor/Supplier</label>
          <input id="expenseVendor" type="text" placeholder="Enter vendor name" />
        </div>
        <div class="form-group col-6">
          <label>Reference Number</label>
          <input id="expenseReference" type="text" placeholder="Invoice/receipt number" />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Receipt/Invoice Upload</label>
        <input id="expenseReceipt" type="file" accept="image/*,.pdf" />
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="expenseNotes" placeholder="Additional notes" rows="3"></textarea>
      </div>
    </div>
  `;

  openModal('Add Expense', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Add Expense', type: 'primary', action: saveExpense }
  ], 'modal-large');

  // Set default date to today
  setTimeout(() => {
    const dateInput = document.getElementById('expenseDate');
    if (dateInput) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
  }, 100);
}

function updateExpenseSubcategory() {
  const categorySelect = document.getElementById('expenseCategory');
  const subcategorySelect = document.getElementById('expenseSubcategory');
  
  if (!categorySelect || !subcategorySelect) return;

  const selectedCategory = categorySelect.value;
  const expenseCategories = getConfig('business.financial.expenseCategories', {});
  
  subcategorySelect.innerHTML = '<option value="">Select subcategory...</option>';
  
  if (selectedCategory && expenseCategories[selectedCategory]) {
    expenseCategories[selectedCategory].forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      subcategorySelect.appendChild(option);
    });
  }
}

function saveExpense() {
  const category = document.getElementById('expenseCategory').value;
  const subcategory = document.getElementById('expenseSubcategory').value;
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const description = document.getElementById('expenseDescription').value.trim();
  const paymentMethod = document.getElementById('expensePaymentMethod').value;
  const status = document.getElementById('expenseStatus').value;
  const date = document.getElementById('expenseDate').value;
  const vendor = document.getElementById('expenseVendor').value.trim();
  const reference = document.getElementById('expenseReference').value.trim();
  const notes = document.getElementById('expenseNotes').value.trim();

  if (!category || isNaN(amount) || !description || !paymentMethod || !status || !date || amount <= 0) {
    showToast('Please fill all required fields correctly', 'error');
    return;
  }

  const expenses = financialStorage.expenses.load();
  const newExpense = {
    id: generateFinancialId('EXP'),
    category,
    subcategory: subcategory || category,
    amount,
    description,
    paymentMethod,
    status,
    date,
    vendor: vendor || 'N/A',
    reference: reference || 'N/A',
    notes: notes || 'N/A',
    createdAt: new Date().toISOString(),
    createdBy: 'user'
  };

  expenses.unshift(newExpense);
  financialStorage.expenses.save(expenses);

  // Create double-entry transaction
  const accounts = financialStorage.accounts.load();
  const expenseAccount = accounts.find(acc => acc.name.toLowerCase().includes('expense') || acc.name.toLowerCase().includes(category.toLowerCase()));
  const paymentAccount = accounts.find(acc => 
    acc.name.toLowerCase().includes(paymentMethod.toLowerCase()) || 
    acc.name.toLowerCase().includes('cash') || 
    acc.name.toLowerCase().includes('bank')
  );

  if (expenseAccount && paymentAccount) {
    createTransaction(
      `Expense: ${description}`,
      expenseAccount.id,
      paymentAccount.id,
      amount,
      reference || newExpense.id,
      notes
    );
  }

  closeModal();
  renderFinancialRecords();
  updateFinancialStats();
  showToast('Expense added successfully', 'success');
}

// =============================================================================
// INCOME MANAGEMENT
// =============================================================================

function addIncome() {
  const incomeCategories = getConfig('business.financial.incomeCategories', {});
  const paymentMethods = getConfig('business.financial.paymentMethods', []);
  const statuses = getConfig('business.financial.statuses', []);

  const categoryOptions = Object.entries(incomeCategories).map(([category, items]) => 
    `<optgroup label="${category}">
      ${items.map(item => `<option value="${item}">${item}</option>`).join('')}
    </optgroup>`
  ).join('');

  const body = `
    <div class="form-section">
      <h4>Income Information</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Category *</label>
          <select id="incomeCategory" required>
            <option value="">Select category...</option>
            ${categoryOptions}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Amount (INR) *</label>
          <input id="incomeAmount" type="number" min="0" step="0.01" placeholder="Enter amount" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Payment Method *</label>
          <select id="incomePaymentMethod" required>
            <option value="">Select method...</option>
            ${paymentMethods.map(method => `<option value="${method}">${method}</option>`).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="incomeStatus" required>
            <option value="">Select status...</option>
            ${statuses.map(status => `<option value="${status}">${status}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Description *</label>
        <input id="incomeDescription" type="text" placeholder="Enter income description" required />
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Customer/Client</label>
          <input id="incomeCustomer" type="text" placeholder="Enter customer name" />
        </div>
        <div class="form-group col-6">
          <label>Date *</label>
          <input id="incomeDate" type="date" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Invoice Number</label>
          <input id="incomeInvoice" type="text" placeholder="Invoice number" />
        </div>
        <div class="form-group col-6">
          <label>Reference Number</label>
          <input id="incomeReference" type="text" placeholder="Reference number" />
        </div>
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="incomeNotes" placeholder="Additional notes" rows="3"></textarea>
      </div>
    </div>
  `;

  openModal('Add Income', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Add Income', type: 'primary', action: saveIncome }
  ], 'modal-large');

  // Set default date to today
  setTimeout(() => {
    const dateInput = document.getElementById('incomeDate');
    if (dateInput) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
  }, 100);
}

function saveIncome() {
  const category = document.getElementById('incomeCategory').value;
  const amount = parseFloat(document.getElementById('incomeAmount').value);
  const description = document.getElementById('incomeDescription').value.trim();
  const paymentMethod = document.getElementById('incomePaymentMethod').value;
  const status = document.getElementById('incomeStatus').value;
  const customer = document.getElementById('incomeCustomer').value.trim();
  const date = document.getElementById('incomeDate').value;
  const invoice = document.getElementById('incomeInvoice').value.trim();
  const reference = document.getElementById('incomeReference').value.trim();
  const notes = document.getElementById('incomeNotes').value.trim();

  if (!category || isNaN(amount) || !description || !paymentMethod || !status || !date || amount <= 0) {
    showToast('Please fill all required fields correctly', 'error');
    return;
  }

  const income = financialStorage.income.load();
  const newIncome = {
    id: generateFinancialId('INC'),
    category,
    amount,
    description,
    paymentMethod,
    status,
    customer: customer || 'N/A',
    date,
    invoice: invoice || 'N/A',
    reference: reference || 'N/A',
    notes: notes || 'N/A',
    createdAt: new Date().toISOString(),
    createdBy: 'user'
  };

  income.unshift(newIncome);
  financialStorage.income.save(income);

  // Create double-entry transaction
  const accounts = financialStorage.accounts.load();
  const revenueAccount = accounts.find(acc => acc.name.toLowerCase().includes('revenue') || acc.name.toLowerCase().includes(category.toLowerCase()));
  const paymentAccount = accounts.find(acc => 
    acc.name.toLowerCase().includes(paymentMethod.toLowerCase()) || 
    acc.name.toLowerCase().includes('cash') || 
    acc.name.toLowerCase().includes('bank')
  );

  if (revenueAccount && paymentAccount) {
    createTransaction(
      `Income: ${description}`,
      paymentAccount.id,
      revenueAccount.id,
      amount,
      reference || newIncome.id,
      notes
    );
  }

  closeModal();
  renderFinancialRecords();
  updateFinancialStats();
  showToast('Income added successfully', 'success');
}

// =============================================================================
// INITIALIZATION FUNCTION
// =============================================================================

/**
 * Initialize financial management when screen is shown
 */
function initializeFinancialManagement() {
  console.log('Initializing Financial Management...');
  
  // Initialize default accounts if not exists
  initializeDefaultAccounts();
  
  // Check if we have any data, if not load sample data
  const expenses = financialStorage.expenses.load();
  const income = financialStorage.income.load();
  
  if (expenses.length === 0 && income.length === 0) {
    console.log('No financial data found, loading sample data...');
    if (typeof loadSampleFinancialData === 'function') {
      loadSampleFinancialData();
    }
  }
  
  // Load and render financial records
  renderFinancialRecords();
  
  // Update financial statistics
  updateFinancialStats();
  
  console.log('Financial Management initialized successfully');
}

/**
 * Initialize default accounts for double-entry accounting
 */
function initializeDefaultAccounts() {
  const accounts = financialStorage.accounts.load();
  
  if (accounts.length === 0) {
    console.log('Initializing default accounts...');
    const defaultAccounts = getDefaultAccounts();
    financialStorage.accounts.save(defaultAccounts);
    console.log(`Created ${defaultAccounts.length} default accounts`);
  }
}

// =============================================================================
// MAIN RENDER FUNCTION
// =============================================================================

function renderFinancialRecords() {
  const tbody = document.getElementById('financialTbody');
  if (!tbody) {
    console.log('Financial table body not found');
    return;
  }

  console.log('Rendering financial records...');
  
  const expenses = financialStorage.expenses.load();
  const income = financialStorage.income.load();
  
  console.log(`Loaded ${expenses.length} expenses and ${income.length} income records`);
  
  const allRecords = [
    ...expenses.map(exp => ({ ...exp, type: 'Expense', recordType: 'expense' })),
    ...income.map(inc => ({ ...inc, type: 'Income', recordType: 'income' }))
  ];

  // Apply filters
  const typeFilter = document.getElementById('financialTypeFilter')?.value || '';
  const statusFilter = document.getElementById('financialStatusFilter')?.value || '';
  const dateStart = document.getElementById('financialDateStart')?.value || '';
  const dateEnd = document.getElementById('financialDateEnd')?.value || '';
  const searchTerm = document.getElementById('searchFinancialRecords')?.value?.toLowerCase() || '';
  const sortBy = document.getElementById('sortFinancialRecords')?.value || 'date-desc';

  let filtered = allRecords.filter(record => {
    if (typeFilter && record.type !== typeFilter) return false;
    if (statusFilter && record.status !== statusFilter) return false;
    if (dateStart && record.date < dateStart) return false;
    if (dateEnd && record.date > dateEnd) return false;
    if (searchTerm) {
      const searchText = `${record.description} ${record.amount} ${record.reference || ''} ${record.category || ''}`.toLowerCase();
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
  if (!window.paginationInstances || !window.paginationInstances['financialContainer']) {
    if (typeof createPagination === 'function') {
      createPagination('financialContainer');
    }
  }

  if (window.paginationInstances && window.paginationInstances['financialContainer']) {
    const pagination = window.paginationInstances['financialContainer'];
    pagination.applyFilters(filtered);
    const currentPageData = pagination.getCurrentPageData();
    renderTable(currentPageData, tbody);
  } else {
    renderTable(filtered, tbody);
  }

  updateFinancialStats();
}

function renderTable(data, tbody) {
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center" style="padding: 2rem; color: var(--gray-500);">
          <i class="pi pi-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
          No financial records found
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = data.map(record => `
    <tr>
      <td>${formatDate(record.date)}</td>
      <td>${record.type}</td>
      <td>${record.category || record.description}</td>
      <td>${record.description}</td>
      <td>${formatINR(record.amount)}</td>
      <td><span class="${getFinancialBadgeClass(record.status)}">${record.status}</span></td>
      <td>${record.paymentMethod}</td>
      <td>${record.reference || '-'}</td>
      <td>
        ${createTableActionsDropdown(record.id, getFinancialActions(record))}
      </td>
    </tr>
  `).join('');
}

function getFinancialBadgeClass(status) {
  const s = (status || '').toLowerCase();
  if (s === 'paid') return 'status-badge status-completed';
  if (s === 'pending') return 'status-badge status-pending';
  if (s === 'overdue') return 'status-badge status-cancelled';
  if (s === 'cancelled') return 'status-badge status-inactive';
  if (s === 'partially paid') return 'status-badge status-warning';
  return 'status-badge status-pending';
}

// GST calculation functions for financial records
function calculateFinancialGST(amount, gstRate, isInterstate = false) {
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

function getFinancialActions(record) {
  const actions = [
    { label: 'View Details', icon: 'pi pi-eye', onclick: `viewFinancialRecord('${record.id}', '${record.recordType}')` },
    { label: 'Edit Record', icon: 'pi pi-pencil', onclick: `editFinancialRecord('${record.id}', '${record.recordType}')` }
  ];

  if (record.status !== 'Paid') {
    actions.push({ label: 'Mark Paid', icon: 'pi pi-check', onclick: `markFinancialPaid('${record.id}', '${record.recordType}')`, class: 'success' });
  }

  actions.push(
    { label: 'Print Receipt', icon: 'pi pi-print', onclick: `printFinancialReceipt('${record.id}', '${record.recordType}')` },
    { label: 'Export', icon: 'pi pi-download', onclick: `exportFinancialRecord('${record.id}', '${record.recordType}')` },
    { label: 'Duplicate', icon: 'pi pi-copy', onclick: `duplicateFinancialRecord('${record.id}', '${record.recordType}')` },
    { label: 'Delete', icon: 'pi pi-trash', onclick: `deleteFinancialRecord('${record.id}', '${record.recordType}')`, class: 'danger' }
  );

  return actions;
}

// =============================================================================
// STATISTICS AND DASHBOARD
// =============================================================================

function updateFinancialStats() {
  const expenses = financialStorage.expenses.load();
  const income = financialStorage.income.load();

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Calculate by status
  const paidExpenses = expenses.filter(exp => exp.status === 'Paid').reduce((sum, exp) => sum + exp.amount, 0);
  const pendingExpenses = expenses.filter(exp => exp.status === 'Pending').reduce((sum, exp) => sum + exp.amount, 0);
  const overdueExpenses = expenses.filter(exp => exp.status === 'Overdue').reduce((sum, exp) => sum + exp.amount, 0);

  const paidIncome = income.filter(inc => inc.status === 'Paid').reduce((sum, inc) => sum + inc.amount, 0);
  const pendingIncome = income.filter(inc => inc.status === 'Pending').reduce((sum, inc) => sum + inc.amount, 0);

  // Update stats display
  const elements = {
    totalIncomeAmount: formatINR(totalIncome),
    totalExpenseAmount: formatINR(totalExpenses),
    netProfitAmount: formatINR(netProfit),
    pendingAmount: formatINR(pendingExpenses + pendingIncome),
    paidAmount: formatINR(paidExpenses + paidIncome),
    overdueAmount: formatINR(overdueExpenses),
    // Also update the main financial stats
    totalFinancialAmount: formatINR(totalExpenses + totalIncome),
    paidFinancialAmount: formatINR(paidExpenses + paidIncome),
    pendingFinancialAmount: formatINR(pendingExpenses + pendingIncome),
    overdueFinancialAmount: formatINR(overdueExpenses)
  };

  Object.entries(elements).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = value;
  });

  // Update dashboard stats if function exists
  if (typeof updateDashboardStats === 'function') {
    updateDashboardStats();
  }
}

// =============================================================================
// FILTER FUNCTIONS
// =============================================================================

function applyFinancialFilters() {
  renderFinancialRecords();
}

// =============================================================================
// RECORD MANAGEMENT FUNCTIONS
// =============================================================================

function viewFinancialRecord(recordId, recordType) {
  const storage = recordType === 'expense' ? financialStorage.expenses : financialStorage.income;
  const records = storage.load();
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
        <div><span class="${getFinancialBadgeClass(record.status)}">${record.status}</span></div>
      </div>
    </div>
    
    <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
      <div style="font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem;">Record Details</div>
      <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">${record.description}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.9rem;">
        <div><strong>Type:</strong> ${recordType === 'expense' ? 'Expense' : 'Income'}</div>
        <div><strong>Amount:</strong> ${formatINR(record.amount)}</div>
        <div><strong>Category:</strong> ${record.category}</div>
        <div><strong>Payment Method:</strong> ${record.paymentMethod}</div>
        <div><strong>Date:</strong> ${formatDate(record.date)}</div>
        <div><strong>Reference:</strong> ${record.reference}</div>
        ${record.vendor ? `<div><strong>Vendor:</strong> ${record.vendor}</div>` : ''}
        ${record.customer ? `<div><strong>Customer:</strong> ${record.customer}</div>` : ''}
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
    { label: 'Edit', type: 'primary', action: () => { closeModal(); editFinancialRecord(recordId, recordType); } }
  ], 'modal-large');
}

function editFinancialRecord(recordId, recordType) {
  // Implementation for editing records
  showToast('Edit functionality will be implemented in the next phase', 'info');
}

function markFinancialPaid(recordId, recordType) {
  const storage = recordType === 'expense' ? financialStorage.expenses : financialStorage.income;
  const records = storage.load();
  const recordIndex = records.findIndex(r => r.id === recordId);
  
  if (recordIndex !== -1) {
    records[recordIndex].status = 'Paid';
    records[recordIndex].updatedAt = new Date().toISOString();
    storage.save(records);
    renderFinancialRecords();
    showToast('Record marked as paid', 'success');
  }
}

function printFinancialReceipt(recordId, recordType) {
  // Implementation for printing receipts
  showToast('Print functionality will be implemented in the next phase', 'info');
}

function exportFinancialRecord(recordId, recordType) {
  // Implementation for exporting records
  showToast('Export functionality will be implemented in the next phase', 'info');
}

function duplicateFinancialRecord(recordId, recordType) {
  // Implementation for duplicating records
  showToast('Duplicate functionality will be implemented in the next phase', 'info');
}

function deleteFinancialRecord(recordId, recordType) {
  const storage = recordType === 'expense' ? financialStorage.expenses : financialStorage.income;
  const records = storage.load();
  const record = records.find(r => r.id === recordId);
  
  if (!record) return;

  confirmModal('Delete Financial Record', `Are you sure you want to delete this record: ${record.description}?`, () => {
    const filtered = records.filter(r => r.id !== recordId);
    storage.save(filtered);
    renderFinancialRecords();
    showToast('Financial record deleted successfully', 'success');
  });
}

// =============================================================================
// REPORTING SYSTEM
// =============================================================================

function showReports() {
  const reportCategories = [
    {
      category: 'Financial Summary',
      reports: [
        { id: 'profit-loss', name: 'Profit & Loss Statement', description: 'Complete P&L analysis' },
        { id: 'cash-flow', name: 'Cash Flow Statement', description: 'Money in and out analysis' },
        { id: 'balance-sheet', name: 'Balance Sheet', description: 'Assets, liabilities, and equity' },
        { id: 'income-summary', name: 'Income Summary', description: 'Total income by category' },
        { id: 'expense-summary', name: 'Expense Summary', description: 'Total expenses by category' }
      ]
    },
    {
      category: 'Operational Reports',
      reports: [
        { id: 'monthly-summary', name: 'Monthly Summary', description: 'Monthly financial overview' },
        { id: 'quarterly-report', name: 'Quarterly Report', description: 'Quarterly financial analysis' },
        { id: 'yearly-report', name: 'Yearly Report', description: 'Annual financial summary' },
        { id: 'vendor-analysis', name: 'Vendor Analysis', description: 'Expense breakdown by vendor' },
        { id: 'customer-analysis', name: 'Customer Analysis', description: 'Income breakdown by customer' }
      ]
    },
    {
      category: 'Detailed Analysis',
      reports: [
        { id: 'expense-trends', name: 'Expense Trends', description: 'Expense patterns over time' },
        { id: 'income-trends', name: 'Income Trends', description: 'Income patterns over time' },
        { id: 'category-breakdown', name: 'Category Breakdown', description: 'Detailed category analysis' },
        { id: 'payment-methods', name: 'Payment Methods', description: 'Payment method distribution' },
        { id: 'status-analysis', name: 'Status Analysis', description: 'Payment status breakdown' }
      ]
    }
  ];

  const reportHtml = reportCategories.map(category => `
    <div style="margin-bottom: 2rem;">
      <h4 style="color: var(--brand-600); margin-bottom: 1rem; border-bottom: 2px solid var(--brand-100); padding-bottom: 0.5rem;">
        ${category.category}
      </h4>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
        ${category.reports.map(report => `
          <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; cursor: pointer; transition: all 0.3s ease;" 
               onclick="generateReport('${report.id}')" 
               onmouseover="this.style.background='var(--brand-50)'; this.style.transform='translateY(-2px)'"
               onmouseout="this.style.background='var(--gray-50)'; this.style.transform='translateY(0)'">
            <div style="font-weight: 600; color: var(--gray-800); margin-bottom: 0.5rem;">
              <i class="pi pi-chart-line" style="margin-right: 0.5rem; color: var(--brand-600);"></i>
              ${report.name}
            </div>
            <div style="font-size: 0.9rem; color: var(--gray-600);">
              ${report.description}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  openModal('Financial Reports', `
    <div style="max-height: 70vh; overflow-y: auto;">
      ${reportHtml}
    </div>
  `, [
    { label: 'Close', type: 'secondary', action: closeModal }
  ], 'modal-xl');
}

function generateReport(reportId) {
  const expenses = financialStorage.expenses.load();
  const income = financialStorage.income.load();
  const transactions = financialStorage.transactions.load();

  let reportData = {};
  let reportTitle = '';
  let reportContent = '';

  switch (reportId) {
    case 'profit-loss':
      reportTitle = 'Profit & Loss Statement';
      reportData = generateProfitLossReport(expenses, income);
      break;
    case 'cash-flow':
      reportTitle = 'Cash Flow Statement';
      reportData = generateCashFlowReport(transactions);
      break;
    case 'balance-sheet':
      reportTitle = 'Balance Sheet';
      reportData = generateBalanceSheetReport(transactions);
      break;
    case 'income-summary':
      reportTitle = 'Income Summary';
      reportData = generateIncomeSummaryReport(income);
      break;
    case 'expense-summary':
      reportTitle = 'Expense Summary';
      reportData = generateExpenseSummaryReport(expenses);
      break;
    case 'monthly-summary':
      reportTitle = 'Monthly Summary';
      reportData = generateMonthlySummaryReport(expenses, income);
      break;
    default:
      showToast('Report generation in progress', 'info');
      return;
  }

  // Display report
  displayReport(reportTitle, reportData);
}

function generateProfitLossReport(expenses, income) {
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  // Group expenses by category
  const expenseByCategory = {};
  expenses.forEach(exp => {
    if (!expenseByCategory[exp.category]) {
      expenseByCategory[exp.category] = 0;
    }
    expenseByCategory[exp.category] += exp.amount;
  });

  // Group income by category
  const incomeByCategory = {};
  income.forEach(inc => {
    if (!incomeByCategory[inc.category]) {
      incomeByCategory[inc.category] = 0;
    }
    incomeByCategory[inc.category] += inc.amount;
  });

  return {
    summary: {
      totalIncome,
      totalExpenses,
      netProfit,
      profitMargin: totalIncome > 0 ? (netProfit / totalIncome * 100).toFixed(2) : 0
    },
    incomeByCategory,
    expenseByCategory,
    period: 'All Time'
  };
}

function generateIncomeSummaryReport(income) {
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
  const incomeByCategory = {};
  const incomeByCustomer = {};
  const incomeByMonth = {};

  income.forEach(inc => {
    // By category
    if (!incomeByCategory[inc.category]) {
      incomeByCategory[inc.category] = 0;
    }
    incomeByCategory[inc.category] += inc.amount;

    // By customer
    if (!incomeByCustomer[inc.customer]) {
      incomeByCustomer[inc.customer] = 0;
    }
    incomeByCustomer[inc.customer] += inc.amount;

    // By month
    const month = inc.date.substring(0, 7); // YYYY-MM
    if (!incomeByMonth[month]) {
      incomeByMonth[month] = 0;
    }
    incomeByMonth[month] += inc.amount;
  });

  return {
    totalIncome,
    incomeByCategory,
    incomeByCustomer,
    incomeByMonth,
    totalRecords: income.length
  };
}

function generateExpenseSummaryReport(expenses) {
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const expenseByCategory = {};
  const expenseByVendor = {};
  const expenseByMonth = {};

  expenses.forEach(exp => {
    // By category
    if (!expenseByCategory[exp.category]) {
      expenseByCategory[exp.category] = 0;
    }
    expenseByCategory[exp.category] += exp.amount;

    // By vendor
    if (!expenseByVendor[exp.vendor]) {
      expenseByVendor[exp.vendor] = 0;
    }
    expenseByVendor[exp.vendor] += exp.amount;

    // By month
    const month = exp.date.substring(0, 7); // YYYY-MM
    if (!expenseByMonth[month]) {
      expenseByMonth[month] = 0;
    }
    expenseByMonth[month] += exp.amount;
  });

  return {
    totalExpenses,
    expenseByCategory,
    expenseByVendor,
    expenseByMonth,
    totalRecords: expenses.length
  };
}

function generateCashFlowReport(transactions) {
  // Simplified cash flow based on transactions
  const totalDebits = transactions.reduce((sum, txn) => 
    sum + txn.entries.reduce((entrySum, entry) => entrySum + entry.debit, 0), 0);
  const totalCredits = transactions.reduce((sum, txn) => 
    sum + txn.entries.reduce((entrySum, entry) => entrySum + entry.credit, 0), 0);

  return {
    totalInflow: totalCredits,
    totalOutflow: totalDebits,
    netCashFlow: totalCredits - totalDebits,
    totalTransactions: transactions.length
  };
}

function generateBalanceSheetReport(transactions) {
  const accounts = financialStorage.accounts.load();
  
  const assets = accounts.filter(acc => acc.type === 'Assets').reduce((sum, acc) => sum + acc.balance, 0);
  const liabilities = accounts.filter(acc => acc.type === 'Liabilities').reduce((sum, acc) => sum + acc.balance, 0);
  const equity = accounts.filter(acc => acc.type === 'Equity').reduce((sum, acc) => sum + acc.balance, 0);

  return {
    assets,
    liabilities,
    equity,
    totalBalance: assets - liabilities - equity
  };
}

function generateMonthlySummaryReport(expenses, income) {
  const monthlyData = {};
  
  // Process expenses
  expenses.forEach(exp => {
    const month = exp.date.substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { expenses: 0, income: 0, net: 0 };
    }
    monthlyData[month].expenses += exp.amount;
  });

  // Process income
  income.forEach(inc => {
    const month = inc.date.substring(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { expenses: 0, income: 0, net: 0 };
    }
    monthlyData[month].income += inc.amount;
  });

  // Calculate net for each month
  Object.keys(monthlyData).forEach(month => {
    monthlyData[month].net = monthlyData[month].income - monthlyData[month].expenses;
  });

  return monthlyData;
}

function displayReport(title, data) {
  let content = `<h3 style="margin-bottom: 1rem; color: var(--brand-600);">${title}</h3>`;

  if (data.summary) {
    content += `
      <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
        <h4>Summary</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
          ${Object.entries(data.summary).map(([key, value]) => `
            <div>
              <div style="font-weight: 600; color: var(--gray-700);">${key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
              <div style="font-size: 1.2rem; font-weight: 700; color: var(--brand-600);">
                ${typeof value === 'number' ? formatINR(value) : value}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Display category breakdowns
  const breakdownSections = ['incomeByCategory', 'expenseByCategory', 'expenseByVendor', 'incomeByCustomer'];
  breakdownSections.forEach(section => {
    if (data[section]) {
      const sectionTitle = section.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      content += `
        <div style="margin-bottom: 1rem;">
          <h4>${sectionTitle}</h4>
          <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
            ${Object.entries(data[section])
              .sort(([,a], [,b]) => b - a)
              .map(([category, amount]) => `
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--gray-200);">
                  <span>${category}</span>
                  <span style="font-weight: 600;">${formatINR(amount)}</span>
                </div>
              `).join('')}
          </div>
        </div>
      `;
    }
  });

  openModal(title, content, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'Export PDF', type: 'primary', action: () => exportReportToPDF(title, data) },
    { label: 'Print', type: 'info', action: () => printReport(title, data) }
  ], 'modal-xl');
}

function exportReportToPDF(title, data) {
  showToast('PDF export functionality will be implemented in the next phase', 'info');
}

function printReport(title, data) {
  showToast('Print functionality will be implemented in the next phase', 'info');
}

// =============================================================================
// BANK RECONCILIATION
// =============================================================================

function showBankReconciliation() {
  const reconciliationData = financialStorage.bankReconciliation.load();
  
  const body = `
    <div class="form-section">
      <h4>Bank Reconciliation</h4>
      <div style="margin-bottom: 1rem;">
        <button class="btn btn-primary" onclick="importBankStatement()">
          <i class="pi pi-upload"></i> Import Bank Statement
        </button>
        <button class="btn btn-success" onclick="autoReconcile()">
          <i class="pi pi-refresh"></i> Auto Reconcile
        </button>
      </div>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
          <h5>Bank Statement Balance</h5>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--brand-600);" id="bankBalance">₹0</div>
        </div>
        <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
          <h5>Book Balance</h5>
          <div style="font-size: 1.5rem; font-weight: 700; color: var(--brand-600);" id="bookBalance">₹0</div>
        </div>
      </div>
      
      <div style="background: var(--gray-50); padding: 1rem; border-radius: 8px;">
        <h5>Reconciliation Status</h5>
        <div id="reconciliationStatus">No reconciliation data available</div>
      </div>
    </div>
  `;

  openModal('Bank Reconciliation', body, [
    { label: 'Close', type: 'secondary', action: closeModal },
    { label: 'View Details', type: 'primary', action: viewReconciliationDetails }
  ], 'modal-large');
}

function importBankStatement() {
  showToast('Bank statement import functionality will be implemented in the next phase', 'info');
}

function autoReconcile() {
  showToast('Auto reconciliation functionality will be implemented in the next phase', 'info');
}

function viewReconciliationDetails() {
  showToast('Reconciliation details view will be implemented in the next phase', 'info');
}

// =============================================================================
// MAIN FINANCIAL RECORD FUNCTION
// =============================================================================

/**
 * Main function to add financial records (expenses or income)
 * This is the primary entry point called from the UI
 */
function addFinancialRecord() {
  const body = `
    <div class="form-section">
      <h4>Add Financial Record</h4>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Record Type *</label>
          <select id="recordType" required onchange="toggleRecordType()">
            <option value="">Select type...</option>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>Amount (INR) *</label>
          <input id="recordAmount" type="number" min="0" step="0.01" placeholder="Enter amount" required />
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Category *</label>
          <select id="recordCategory" required onchange="updateRecordSubcategory()">
            <option value="">Select category...</option>
          </select>
        </div>
        <div class="form-group col-6">
          <label>Subcategory</label>
          <select id="recordSubcategory">
            <option value="">Select subcategory...</option>
          </select>
        </div>
      </div>
      <div class="form-group col-12">
        <label>Description *</label>
        <input id="recordDescription" type="text" placeholder="Enter description" required />
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Payment Method *</label>
          <select id="recordPaymentMethod" required>
            <option value="">Select method...</option>
            ${getConfig('business.financial.paymentMethods', []).map(method => 
              `<option value="${method}">${method}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group col-6">
          <label>Status *</label>
          <select id="recordStatus" required>
            <option value="">Select status...</option>
            ${getConfig('business.financial.statuses', []).map(status => 
              `<option value="${status}">${status}</option>`
            ).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group col-6">
          <label>Date *</label>
          <input id="recordDate" type="date" required />
        </div>
        <div class="form-group col-6">
          <label>Reference Number</label>
          <input id="recordReference" type="text" placeholder="Invoice/receipt number" />
        </div>
      </div>
      <div class="form-group col-12" id="vendorCustomerField" style="display: none;">
        <label id="vendorCustomerLabel">Vendor/Supplier</label>
        <input id="recordVendorCustomer" type="text" placeholder="Enter vendor/supplier name" />
      </div>
      <div class="form-group col-12">
        <label>Notes</label>
        <textarea id="recordNotes" placeholder="Additional notes" rows="3"></textarea>
      </div>
    </div>
  `;

  openModal('Add Financial Record', body, [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Add Record', type: 'primary', action: saveFinancialRecord }
  ], 'modal-large');

  // Set default date to today
  setTimeout(() => {
    const dateInput = document.getElementById('recordDate');
    if (dateInput) {
      dateInput.value = new Date().toISOString().slice(0, 10);
    }
  }, 100);
}

function toggleRecordType() {
  const recordType = document.getElementById('recordType').value;
  const categorySelect = document.getElementById('recordCategory');
  const vendorCustomerField = document.getElementById('vendorCustomerField');
  const vendorCustomerLabel = document.getElementById('vendorCustomerLabel');
  const vendorCustomerInput = document.getElementById('recordVendorCustomer');

  // Clear existing options
  categorySelect.innerHTML = '<option value="">Select category...</option>';

  if (recordType === 'expense') {
    // Load expense categories
    const expenseCategories = getConfig('business.financial.expenseCategories', {});
    Object.entries(expenseCategories).forEach(([category, items]) => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = category;
      items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        optgroup.appendChild(option);
      });
      categorySelect.appendChild(optgroup);
    });

    // Show vendor field
    vendorCustomerField.style.display = 'block';
    vendorCustomerLabel.textContent = 'Vendor/Supplier';
    vendorCustomerInput.placeholder = 'Enter vendor/supplier name';
  } else if (recordType === 'income') {
    // Load income categories
    const incomeCategories = getConfig('business.financial.incomeCategories', {});
    Object.entries(incomeCategories).forEach(([category, items]) => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = category;
      items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        optgroup.appendChild(option);
      });
      categorySelect.appendChild(optgroup);
    });

    // Show customer field
    vendorCustomerField.style.display = 'block';
    vendorCustomerLabel.textContent = 'Customer/Client';
    vendorCustomerInput.placeholder = 'Enter customer/client name';
  } else {
    // Hide vendor/customer field
    vendorCustomerField.style.display = 'none';
  }
}

function updateRecordSubcategory() {
  const categorySelect = document.getElementById('recordCategory');
  const subcategorySelect = document.getElementById('recordSubcategory');
  const recordType = document.getElementById('recordType').value;
  
  if (!categorySelect || !subcategorySelect) return;

  const selectedCategory = categorySelect.value;
  subcategorySelect.innerHTML = '<option value="">Select subcategory...</option>';
  
  if (selectedCategory) {
    // For now, use the category as subcategory
    const option = document.createElement('option');
    option.value = selectedCategory;
    option.textContent = selectedCategory;
    subcategorySelect.appendChild(option);
  }
}

function saveFinancialRecord() {
  const recordType = document.getElementById('recordType').value;
  const amount = parseFloat(document.getElementById('recordAmount').value);
  const category = document.getElementById('recordCategory').value;
  const subcategory = document.getElementById('recordSubcategory').value;
  const description = document.getElementById('recordDescription').value.trim();
  const paymentMethod = document.getElementById('recordPaymentMethod').value;
  const status = document.getElementById('recordStatus').value;
  const date = document.getElementById('recordDate').value;
  const reference = document.getElementById('recordReference').value.trim();
  const vendorCustomer = document.getElementById('recordVendorCustomer').value.trim();
  const notes = document.getElementById('recordNotes').value.trim();

  if (!recordType || isNaN(amount) || !category || !description || !paymentMethod || !status || !date || amount <= 0) {
    showToast('Please fill all required fields correctly', 'error');
    return;
  }

  if (recordType === 'expense') {
    // Create expense record
    const expenses = financialStorage.expenses.load();
    const newExpense = {
      id: generateFinancialId('EXP'),
      category,
      subcategory: subcategory || category,
      amount,
      description,
      paymentMethod,
      status,
      date,
      vendor: vendorCustomer || 'N/A',
      reference: reference || 'N/A',
      notes: notes || 'N/A',
      createdAt: new Date().toISOString(),
      createdBy: 'user'
    };

    expenses.unshift(newExpense);
    financialStorage.expenses.save(expenses);

    // Create double-entry transaction
    const accounts = financialStorage.accounts.load();
    const expenseAccount = accounts.find(acc => acc.name.toLowerCase().includes('expense') || acc.name.toLowerCase().includes(category.toLowerCase()));
    const paymentAccount = accounts.find(acc => 
      acc.name.toLowerCase().includes(paymentMethod.toLowerCase()) || 
      acc.name.toLowerCase().includes('cash') || 
      acc.name.toLowerCase().includes('bank')
    );

    if (expenseAccount && paymentAccount) {
      createTransaction(
        `Expense: ${description}`,
        expenseAccount.id,
        paymentAccount.id,
        amount,
        reference || newExpense.id,
        notes
      );
    }

    showToast('Expense record added successfully', 'success');
  } else if (recordType === 'income') {
    // Create income record
    const income = financialStorage.income.load();
    const newIncome = {
      id: generateFinancialId('INC'),
      category,
      amount,
      description,
      paymentMethod,
      status,
      customer: vendorCustomer || 'N/A',
      date,
      invoice: reference || 'N/A',
      reference: reference || 'N/A',
      notes: notes || 'N/A',
      createdAt: new Date().toISOString(),
      createdBy: 'user'
    };

    income.unshift(newIncome);
    financialStorage.income.save(income);

    // Create double-entry transaction
    const accounts = financialStorage.accounts.load();
    const revenueAccount = accounts.find(acc => acc.name.toLowerCase().includes('revenue') || acc.name.toLowerCase().includes(category.toLowerCase()));
    const paymentAccount = accounts.find(acc => 
      acc.name.toLowerCase().includes(paymentMethod.toLowerCase()) || 
      acc.name.toLowerCase().includes('cash') || 
      acc.name.toLowerCase().includes('bank')
    );

    if (revenueAccount && paymentAccount) {
      createTransaction(
        `Income: ${description}`,
        paymentAccount.id,
        revenueAccount.id,
        amount,
        reference || newIncome.id,
        notes
      );
    }

    showToast('Income record added successfully', 'success');
  }

  closeModal();
  renderFinancialRecords();
  updateFinancialStats();
}

// =============================================================================
// LEGACY COMPATIBILITY
// =============================================================================

// Keep legacy functions for backward compatibility
const FINANCIAL_STORAGE_KEY = 'logosic_financial_v1';
const FINANCIAL_RECORDS = [];

function loadFinancialRecords() {
  return financialStorage.expenses.load();
}

function saveFinancialRecords(records) {
  financialStorage.expenses.save(records);
}

function financialBadgeClass(status) {
  return getFinancialBadgeClass(status);
}

// Make functions globally available
window.addFinancialRecord = addFinancialRecord;
window.addExpense = addExpense;
window.addIncome = addIncome;
window.updateExpenseSubcategory = updateExpenseSubcategory;
window.toggleRecordType = toggleRecordType;
window.updateRecordSubcategory = updateRecordSubcategory;
window.saveFinancialRecord = saveFinancialRecord;
window.showReports = showReports;
window.showBankReconciliation = showBankReconciliation;
window.renderFinancialRecords = renderFinancialRecords;
window.updateFinancialStats = updateFinancialStats;
window.applyFinancialFilters = applyFinancialFilters;
window.initializeFinancialManagement = initializeFinancialManagement;

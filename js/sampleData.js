// Sample Data for Financial Management System
// This file contains sample data to populate the financial management system

// =============================================================================
// SAMPLE FINANCIAL DATA
// =============================================================================

const SAMPLE_FINANCIAL_DATA = {
  expenses: [
    {
      id: 'EXP-001',
      category: 'Machine EMI',
      subcategory: 'Machine EMI',
      amount: 25000,
      description: 'Monthly EMI for CNC Machine',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      date: '2024-01-15',
      vendor: 'Machine Finance Ltd',
      reference: 'EMI-001',
      notes: 'Monthly EMI payment for CNC machine',
      createdAt: new Date('2024-01-15').toISOString(),
      createdBy: 'system'
    },
    {
      id: 'EXP-002',
      category: 'Electric Bill',
      subcategory: 'Electric Bill',
      amount: 8500,
      description: 'Monthly electricity bill',
      paymentMethod: 'UPI',
      status: 'Paid',
      date: '2024-01-20',
      vendor: 'State Electricity Board',
      reference: 'EB-001',
      notes: 'January electricity consumption',
      createdAt: new Date('2024-01-20').toISOString(),
      createdBy: 'system'
    },
    {
      id: 'EXP-003',
      category: 'Transport Cost',
      subcategory: 'Fuel',
      amount: 12000,
      description: 'Fuel expenses for delivery vehicles',
      paymentMethod: 'Cash',
      status: 'Paid',
      date: '2024-01-25',
      vendor: 'Petrol Pump',
      reference: 'FUEL-001',
      notes: 'Weekly fuel expenses',
      createdAt: new Date('2024-01-25').toISOString(),
      createdBy: 'system'
    },
    {
      id: 'EXP-004',
      category: 'Commission',
      subcategory: 'Commission',
      amount: 5000,
      description: 'Sales commission for January',
      paymentMethod: 'Bank Transfer',
      status: 'Pending',
      date: '2024-01-31',
      vendor: 'Sales Team',
      reference: 'COMM-001',
      notes: 'Monthly sales commission',
      createdAt: new Date('2024-01-31').toISOString(),
      createdBy: 'system'
    },
    {
      id: 'EXP-005',
      category: 'Rent',
      subcategory: 'Rent',
      amount: 15000,
      description: 'Monthly office rent',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      date: '2024-01-01',
      vendor: 'Property Owner',
      reference: 'RENT-001',
      notes: 'Monthly office space rent',
      createdAt: new Date('2024-01-01').toISOString(),
      createdBy: 'system'
    },
    {
      id: 'EXP-006',
      category: 'Insurance',
      subcategory: 'Insurance',
      amount: 3000,
      description: 'Vehicle insurance premium',
      paymentMethod: 'Credit Card',
      status: 'Paid',
      date: '2024-01-10',
      vendor: 'Insurance Company',
      reference: 'INS-001',
      notes: 'Annual vehicle insurance',
      createdAt: new Date('2024-01-10').toISOString(),
      createdBy: 'system'
    },
    {
      id: 'EXP-007',
      category: 'Maintenance',
      subcategory: 'Maintenance',
      amount: 8000,
      description: 'Equipment maintenance',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      date: '2024-01-18',
      vendor: 'Maintenance Services',
      reference: 'MAINT-001',
      notes: 'Monthly equipment maintenance',
      createdAt: new Date('2024-01-18').toISOString(),
      createdBy: 'system'
    }
  ],
  
  income: [
    {
      id: 'INC-001',
      category: 'Product Sales',
      amount: 75000,
      description: 'Product sales for January',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      customer: 'ABC Manufacturing',
      date: '2024-01-15',
      invoice: 'INV-001',
      reference: 'INV-001',
      notes: 'Monthly product sales',
      createdAt: new Date('2024-01-15').toISOString(),
      createdBy: 'system'
    },
    {
      id: 'INC-002',
      category: 'Service Revenue',
      amount: 25000,
      description: 'Logistics services',
      paymentMethod: 'UPI',
      status: 'Paid',
      customer: 'XYZ Logistics',
      date: '2024-01-20',
      invoice: 'INV-002',
      reference: 'INV-002',
      notes: 'Logistics service charges',
      createdAt: new Date('2024-01-20').toISOString(),
      createdBy: 'system'
    },
    {
      id: 'INC-003',
      category: 'Commission Income',
      amount: 12000,
      description: 'Commission from partners',
      paymentMethod: 'Bank Transfer',
      status: 'Paid',
      customer: 'Partner Network',
      date: '2024-01-25',
      invoice: 'INV-003',
      reference: 'INV-003',
      notes: 'Partner commission',
      createdAt: new Date('2024-01-25').toISOString(),
      createdBy: 'system'
    },
    {
      id: 'INC-004',
      category: 'Consulting Fees',
      amount: 18000,
      description: 'Consulting services',
      paymentMethod: 'Bank Transfer',
      status: 'Pending',
      customer: 'DEF Corporation',
      date: '2024-01-30',
      invoice: 'INV-004',
      reference: 'INV-004',
      notes: 'Monthly consulting fees',
      createdAt: new Date('2024-01-30').toISOString(),
      createdBy: 'system'
    }
  ]
};

// =============================================================================
// SAMPLE DATA LOADING FUNCTIONS
// =============================================================================

/**
 * Load sample financial data into the system
 */
function loadSampleFinancialData() {
  console.log('Loading sample financial data...');
  
  try {
    // Load expenses
    const expenses = financialStorage.expenses.load();
    if (expenses.length === 0) {
      financialStorage.expenses.save(SAMPLE_FINANCIAL_DATA.expenses);
      console.log(`Loaded ${SAMPLE_FINANCIAL_DATA.expenses.length} sample expenses`);
    }
    
    // Load income
    const income = financialStorage.income.load();
    if (income.length === 0) {
      financialStorage.income.save(SAMPLE_FINANCIAL_DATA.income);
      console.log(`Loaded ${SAMPLE_FINANCIAL_DATA.income.length} sample income records`);
    }
    
    // Initialize accounts
    initializeDefaultAccounts();
    
    console.log('Sample financial data loaded successfully');
    return true;
  } catch (error) {
    console.error('Error loading sample financial data:', error);
    return false;
  }
}

/**
 * Clear all financial data
 */
function clearFinancialData() {
  console.log('Clearing all financial data...');
  
  try {
    financialStorage.expenses.save([]);
    financialStorage.income.save([]);
    financialStorage.accounts.save([]);
    financialStorage.transactions.save([]);
    financialStorage.bankReconciliation.save([]);
    financialStorage.reports.save([]);
    
    console.log('All financial data cleared');
    return true;
  } catch (error) {
    console.error('Error clearing financial data:', error);
    return false;
  }
}

/**
 * Reset to sample data (clear and reload)
 */
function resetToSampleData() {
  if (confirm('This will clear all existing financial data and load sample data. Continue?')) {
    clearFinancialData();
    loadSampleFinancialData();
    
    // Refresh the display if we're on the financial screen
    if (typeof renderFinancialRecords === 'function') {
      renderFinancialRecords();
    }
    if (typeof updateFinancialStats === 'function') {
      updateFinancialStats();
    }
    
    showToast('Sample data loaded successfully', 'success');
  }
}

// Make functions globally available
window.loadSampleFinancialData = loadSampleFinancialData;
window.clearFinancialData = clearFinancialData;
window.resetToSampleData = resetToSampleData;

// Configuration Management for Logistics POS
// This file contains all configurable values that can be easily modified

// =============================================================================
// APPLICATION CONFIGURATION
// =============================================================================

const APP_CONFIG = {
  // Application Information
  appName: 'Logistics POS',
  version: '1.0.0',
  companyName: 'Logosic Logistics',
  
  // Default Settings
  defaultPageSize: 10,
  defaultCurrency: 'INR',
  defaultDateFormat: 'DD/MM/YYYY',
  
  // Storage Keys
  storageKeys: {
    orders: 'logosic_orders_v1',
    stock: 'logosic_stock_v1',
    staff: 'logosic_staff_v1',
    attendance: 'logosic_attendance_v1',
    leaveRequests: 'logistics_leave_requests',
    shifts: 'logistics_shifts',
    billing: 'logosic_billing_v1',
    financial: 'logosic_financial_v1',
    gst: 'logosic_gst_v1',
    quotations: 'logosic_quotations_v1'
  },
  
  // Login Configuration
  login: {
    enableAutoLogin: false,
    sessionTimeout: 30, // minutes
    maxLoginAttempts: 3
  }
};

// =============================================================================
// BUSINESS CONFIGURATION
// =============================================================================

const BUSINESS_CONFIG = {
  // Order Configuration
  order: {
    statuses: ['Pending', 'In Progress', 'Completed', 'Shipped', 'Delivered', 'Cancelled', 'On Hold'],
    priorities: ['Low', 'Medium', 'High', 'Urgent'],
    types: ['Sales', 'DC', 'Bulk'],
    defaultStatus: 'Pending',
    defaultPriority: 'Medium',
    defaultType: 'Sales',
    autoGenerateId: true,
    idPrefix: 'ORD'
  },
  
  // Stock Configuration
  stock: {
    categories: [
      'Electronics', 
      'Furniture', 
      'Medical', 
      'Industrial', 
      'Automotive', 
      'Textiles', 
      'Food & Beverage', 
      'Other'
    ],
    statuses: ['In Stock', 'Low Stock', 'Out of Stock'],
    defaultCategory: 'Other',
    lowStockThreshold: 10,
    idPrefix: 'STK'
  },
  
  // Staff Configuration
  staff: {
    departments: ['Production', 'Quality', 'Maintenance', 'Admin', 'HR', 'Finance'],
    roles: ['Manager', 'Supervisor', 'Operator', 'Technician', 'Assistant', 'Clerk', 'Driver'],
    shifts: [
      { name: 'Morning', start: '09:00', end: '18:00', duration: 9 },
      { name: 'Evening', start: '14:00', end: '23:00', duration: 9 },
      { name: 'Night', start: '22:00', end: '07:00', duration: 9 }
    ],
    leaveTypes: ['Sick Leave', 'Personal Leave', 'Vacation', 'Emergency', 'Maternity/Paternity'],
    leaveStatuses: ['Pending', 'Approved', 'Rejected'],
    attendanceStatuses: ['Present', 'Absent', 'Late'],
    defaultStatus: 'Active',
    idPrefix: 'EMP'
  },
  
  // Billing Configuration
  billing: {
    statuses: ['Paid', 'Unpaid', 'Overdue', 'Partial', 'Cancelled'],
    quotationStatuses: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
    paymentMethods: ['Bank Transfer', 'UPI', 'Cash', 'Cheque', 'Credit Card', 'Online Payment'],
    defaultStatus: 'Unpaid',
    defaultPaymentMethod: 'Bank Transfer',
    invoiceIdPrefix: 'INV',
    quotationIdPrefix: 'QUO',
    defaultDueDays: 15
  },
  
  // Financial Configuration
  financial: {
    // Expense Categories
    expenseCategories: {
      'Operating Expenses': [
        'Electric Bill', 'Water Bill', 'Internet', 'Phone', 'Office Supplies', 'Stationery', 'Cleaning'
      ],
      'Transport & Logistics': [
        'Fuel', 'Vehicle Maintenance', 'Transport Cost', 'Shipping', 'Freight', 'Delivery Charges', 'Toll Charges'
      ],
      'Equipment & Machinery': [
        'Machine EMI', 'Equipment Purchase', 'Maintenance', 'Repairs', 'Software License', 'Hardware'
      ],
      'Staff & HR': [
        'Salary', 'Commission', 'Bonus', 'PF Contribution', 'ESI Contribution', 'Training', 'Recruitment'
      ],
      'Property & Rent': [
        'Rent', 'Property Tax', 'Maintenance Charges', 'Security Deposit', 'Utilities'
      ],
      'Insurance & Legal': [
        'Insurance', 'Legal Fees', 'Compliance', 'Audit Fees', 'Professional Services'
      ],
      'Marketing & Sales': [
        'Advertising', 'Marketing', 'Promotional Activities', 'Website Development', 'Social Media'
      ],
      'Financial Services': [
        'Bank Charges', 'Interest', 'Loan EMI', 'Credit Card Fees', 'Transaction Fees'
      ],
      'Other Expenses': [
        'Miscellaneous', 'Contingency', 'Donations', 'Entertainment', 'Travel'
      ]
    },
    
    // Income Categories
    incomeCategories: {
      'Sales Revenue': [
        'Product Sales', 'Service Revenue', 'Consulting Fees', 'Commission Income'
      ],
      'Other Income': [
        'Interest Income', 'Rental Income', 'Dividend Income', 'Miscellaneous Income'
      ]
    },
    
    // Account Types for Double Entry
    accountTypes: {
      'Assets': [
        'Current Assets', 'Fixed Assets', 'Bank Accounts', 'Cash', 'Accounts Receivable', 'Inventory'
      ],
      'Liabilities': [
        'Current Liabilities', 'Long-term Liabilities', 'Accounts Payable', 'Loans', 'Creditors'
      ],
      'Equity': [
        'Owner Equity', 'Retained Earnings', 'Capital'
      ],
      'Revenue': [
        'Sales Revenue', 'Service Revenue', 'Other Income'
      ],
      'Expenses': [
        'Operating Expenses', 'Administrative Expenses', 'Financial Expenses'
      ]
    },
    
    // Payment Methods
    paymentMethods: [
      'Cash', 'Bank Transfer', 'UPI', 'Credit Card', 'Debit Card', 'Cheque', 
      'Online Payment', 'NEFT', 'RTGS', 'IMPS', 'Wallet Payment'
    ],
    
    // Transaction Types
    transactionTypes: [
      'Expense', 'Income', 'Transfer', 'Adjustment', 'Refund', 'Payment', 'Receipt'
    ],
    
    // Statuses
    statuses: ['Paid', 'Pending', 'Overdue', 'Cancelled', 'Partially Paid'],
    
    // Bank Reconciliation
    reconciliationStatuses: ['Matched', 'Unmatched', 'Reconciled', 'Disputed'],
    
    defaultStatus: 'Pending',
    idPrefix: 'FIN',
    expenseIdPrefix: 'EXP',
    incomeIdPrefix: 'INC'
  },
  
  // GST Configuration
  gst: {
    returnTypes: ['GSTR-1', 'GSTR-3B', 'GSTR-2A', 'GSTR-2B', 'GSTR-9', 'GSTR-9C'],
    statuses: ['Draft', 'Filed', 'Approved', 'Rejected', 'Under Review'],
    defaultStatus: 'Draft',
    idPrefix: 'GST',
    gstinLength: 15,
    
    // Global Tax Rates Configuration
    taxRates: {
      // India GST Rates
      'IN': {
        name: 'India GST',
        currency: 'INR',
        rates: [
          { rate: 0, name: '0% (Exempt)', description: 'Essential goods and services' },
          { rate: 0.05, name: '5%', description: 'Essential commodities' },
          { rate: 0.12, name: '12%', description: 'Processed foods, medicines' },
          { rate: 0.18, name: '18%', description: 'Most goods and services' },
          { rate: 0.28, name: '28%', description: 'Luxury items, automobiles' }
        ],
        components: ['CGST', 'SGST', 'IGST'],
        filingFrequency: 'monthly'
      },
      // US Sales Tax (example)
      'US': {
        name: 'US Sales Tax',
        currency: 'USD',
        rates: [
          { rate: 0, name: '0% (Exempt)', description: 'Essential goods' },
          { rate: 0.04, name: '4%', description: 'Basic rate' },
          { rate: 0.08, name: '8%', description: 'Standard rate' },
          { rate: 0.10, name: '10%', description: 'Higher rate' }
        ],
        components: ['State Tax', 'Local Tax'],
        filingFrequency: 'quarterly'
      },
      // UK VAT (example)
      'UK': {
        name: 'UK VAT',
        currency: 'GBP',
        rates: [
          { rate: 0, name: '0% (Zero-rated)', description: 'Essential goods' },
          { rate: 0.05, name: '5% (Reduced)', description: 'Energy, children\'s items' },
          { rate: 0.20, name: '20% (Standard)', description: 'Most goods and services' }
        ],
        components: ['VAT'],
        filingFrequency: 'quarterly'
      }
    },
    
    // Compliance Settings
    compliance: {
      autoCalculate: true,
      validateGSTIN: true,
      generateReturns: true,
      sendReminders: true,
      reminderDays: [7, 3, 1], // Days before due date
      lateFilingPenalty: 0.02, // 2% per day
      maxPenaltyDays: 30
    },
    
    // Return Filing Schedule
    filingSchedule: {
      'GSTR-1': { dueDay: 11, frequency: 'monthly' },
      'GSTR-3B': { dueDay: 20, frequency: 'monthly' },
      'GSTR-9': { dueDay: 31, frequency: 'yearly' },
      'GSTR-9C': { dueDay: 31, frequency: 'yearly' }
    }
  }
};

// =============================================================================
// UI CONFIGURATION
// =============================================================================

const UI_CONFIG = {
  // Pagination
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100],
    maxVisiblePages: 5
  },
  
  // Toast Notifications
  toast: {
    defaultDuration: 3000,
    position: 'top-right'
  },
  
  // Modal Configuration
  modal: {
    defaultSize: 'medium',
    sizes: {
      small: '400px',
      medium: '600px',
      large: '800px',
      xlarge: '1000px'
    }
  },
  
  // Table Configuration
  table: {
    defaultSort: 'date-desc',
    sortOptions: {
      orders: [
        { value: 'date-desc', label: 'Date (Newest First)' },
        { value: 'date-asc', label: 'Date (Oldest First)' },
        { value: 'amount-desc', label: 'Amount (Highest First)' },
        { value: 'amount-asc', label: 'Amount (Lowest First)' },
        { value: 'customer', label: 'Customer Name' },
        { value: 'status', label: 'Status' }
      ],
      stock: [
        { value: 'name', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' },
        { value: 'stock-desc', label: 'Stock (High to Low)' },
        { value: 'stock-asc', label: 'Stock (Low to High)' },
        { value: 'price-desc', label: 'Price (High to Low)' },
        { value: 'price-asc', label: 'Price (Low to High)' },
        { value: 'category', label: 'Category' },
        { value: 'status', label: 'Status' }
      ]
    }
  }
};

// =============================================================================
// VALIDATION CONFIGURATION
// =============================================================================

const VALIDATION_CONFIG = {
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  
  // Phone validation (Indian format)
  phone: {
    pattern: /^(\+91|91)?[6-9]\d{9}$/,
    message: 'Please enter a valid Indian phone number'
  },
  
  // GSTIN validation
  gstin: {
    length: 15,
    pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/,
    message: 'Please enter a valid 15-digit GSTIN'
  },
  
  // Required field validation
  required: {
    message: 'This field is required'
  },
  
  // Number validation
  number: {
    min: 0,
    message: 'Please enter a valid number'
  }
};

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

const EXPORT_CONFIG = {
  // CSV Export
  csv: {
    delimiter: ',',
    encoding: 'utf-8',
    includeHeaders: true
  },
  
  // PDF Export
  pdf: {
    pageSize: 'A4',
    orientation: 'portrait',
    margin: {
      top: '20mm',
      right: '20mm',
      bottom: '20mm',
      left: '20mm'
    }
  },
  
  // Print Configuration
  print: {
    pageSize: 'A4',
    orientation: 'portrait',
    margin: '20mm'
  }
};

// =============================================================================
// CONFIGURATION UTILITIES
// =============================================================================

/**
 * Get configuration value by path
 * @param {string} path - Dot notation path to config value
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value
 */
function getConfig(path, defaultValue = null) {
  const keys = path.split('.');
  let value = { ...APP_CONFIG, ...BUSINESS_CONFIG, ...UI_CONFIG, ...VALIDATION_CONFIG, ...EXPORT_CONFIG };
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
}

/**
 * Update configuration value
 * @param {string} path - Dot notation path to config value
 * @param {*} value - New value to set
 */
function setConfig(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let target = { ...APP_CONFIG, ...BUSINESS_CONFIG, ...UI_CONFIG, ...VALIDATION_CONFIG, ...EXPORT_CONFIG };
  
  for (const key of keys) {
    if (!target[key] || typeof target[key] !== 'object') {
      target[key] = {};
    }
    target = target[key];
  }
  
  target[lastKey] = value;
}

/**
 * Get all configuration as a single object
 * @returns {Object} Complete configuration object
 */
function getAllConfig() {
  return {
    app: APP_CONFIG,
    business: BUSINESS_CONFIG,
    ui: UI_CONFIG,
    validation: VALIDATION_CONFIG,
    export: EXPORT_CONFIG
  };
}

// Make configuration available globally
window.APP_CONFIG = APP_CONFIG;
window.BUSINESS_CONFIG = BUSINESS_CONFIG;
window.UI_CONFIG = UI_CONFIG;
window.VALIDATION_CONFIG = VALIDATION_CONFIG;
window.EXPORT_CONFIG = EXPORT_CONFIG;
window.getConfig = getConfig;
window.setConfig = setConfig;
window.getAllConfig = getAllConfig;


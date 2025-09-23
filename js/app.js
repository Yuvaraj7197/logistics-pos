// Main Application JavaScript
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize login functionality
  initializeLogin();
  
  // Initialize dashboard stats
  updateDashboardStats();
});

// =============================================================================
// LOGIN FUNCTIONALITY
// =============================================================================

/**
 * Initialize login form functionality
 */
function initializeLogin() {
  const loginForm = document.getElementById("loginForm");
  if (!loginForm) return;
  
  loginForm.addEventListener("submit", handleLogin);
}

/**
 * Handle login form submission
 */
function handleLogin(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  
  // Show loading state
  submitBtn.innerHTML = '<i class="pi pi-spinner pi-spin"></i> Signing In...';
  submitBtn.disabled = true;
  
  // Simulate login delay
  setTimeout(() => {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("dashboardPage").classList.remove("hidden");
    
    // Reset button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }, 1000);
}

// =============================================================================
// LOGOUT FUNCTIONALITY
// =============================================================================

// Logout functionality
function logout() {
  confirmModal('Logout', 'Are you sure you want to logout?', () => {
    document.getElementById("dashboardPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
    
    // Reset form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.reset();
    }
  });
}

// Navigation functions
function showScreen(screenId) {
  // Hide all component containers
  const containers = [
    'dashboardContainer',
    'ordersContainer', 
    'stockContainer',
    'staffContainer',
    'billingContainer',
    'financialContainer',
    'gstContainer'
  ];
  
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      container.classList.add("hidden");
    }
  });
  
  // Show selected screen
  const targetContainer = document.getElementById(screenId + 'Container');
  if (targetContainer) {
    targetContainer.classList.remove("hidden");
  }
  
  // Trigger screen-specific renders
  if (screenId === 'orders') {
    if (typeof initializeOrderManagement === 'function') {
      initializeOrderManagement();
    } else {
      renderOrders();
    }
  }
  if (screenId === 'stock') renderStock();
  if (screenId === 'billing') renderInvoices();
  if (screenId === 'financial') {
    if (typeof initializeFinancialManagement === 'function') {
      initializeFinancialManagement();
    } else {
      renderFinancialRecords();
    }
  }
  if (screenId === 'staff') renderStaff();
  if (screenId === 'gst') {
    renderGstReturns();
    if (typeof initializeGstManagement === 'function') {
      initializeGstManagement();
    }
  }
  
  // Update dashboard stats when showing dashboard
  if (screenId === 'dashboard') {
    updateDashboardStats();
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goTo(targetId, btn) {
  const allNav = document.querySelectorAll('.sidebar .nav-button');
  const allNavItems = document.querySelectorAll('.sidebar .nav-dropdown-item');
  
  // Remove active class from all navigation buttons and dropdown items
  allNav.forEach(b => b.classList.remove('active'));
  allNavItems.forEach(item => item.classList.remove('active'));
  
  // Add active class to clicked button/item
  if (btn) {
    btn.classList.add('active');
    
    // If it's a dropdown item, also close the dropdown
    const navDropdown = btn.closest('.nav-dropdown');
    if (navDropdown) {
      navDropdown.classList.remove('open');
    }
  }
  
  if (targetId === 'dashboard') {
    backToDashboard();
  } else {
    showScreen(targetId);
  }
}

function backToDashboard() {
  // Hide all component containers
  const containers = [
    'ordersContainer',
    'stockContainer',
    'staffContainer',
    'billingContainer',
    'financialContainer',
    'gstContainer'
  ];
  
  containers.forEach(containerId => {
    const container = document.getElementById(containerId);
    if (container) {
      container.classList.add("hidden");
    }
  });
  
  // Show dashboard
  const dashboardContainer = document.getElementById("dashboardContainer");
  if (dashboardContainer) {
    dashboardContainer.classList.remove("hidden");
  }
  
  // Update dashboard statistics
  updateDashboardStats();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// =============================================================================
// DASHBOARD STATISTICS
// =============================================================================

/**
 * Update dashboard statistics with dynamic values
 */
function updateDashboardStats() {
  try {
    // Load all data
    const orders = loadOrders() || [];
    const stockItems = loadStockItems() || [];
    const staff = loadStaff() || [];
    const invoices = loadInvoices() || [];
    const financialRecords = loadFinancialRecords() || [];
    const gstReturns = loadGstReturns() || [];
    
    // Calculate order statistics
    const totalOrders = orders.length;
    const completedToday = orders.filter(order => 
      order.status === 'Completed' && 
      order.date === new Date().toISOString().slice(0, 10)
    ).length;
    const totalOrderValue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    // Calculate stock statistics
    const totalStockItems = stockItems.length;
    const lowStockItems = stockItems.filter(item => 
      getStockStatus(item.currentStock, item.minRequired) === 'Low Stock'
    ).length;
    const outOfStockItems = stockItems.filter(item => 
      getStockStatus(item.currentStock, item.minRequired) === 'Out of Stock'
    ).length;
    const totalStockValue = stockItems.reduce((sum, item) => 
      sum + (item.currentStock * item.unitPrice), 0
    );
    
    // Calculate staff statistics
    const activeStaff = staff.filter(emp => emp.status === 'Active').length;
    const attendance = loadAttendance() || {};
    const today = new Date().toISOString().slice(0, 10);
    const presentToday = staff.filter(emp => {
      const todayAttendance = attendance[emp.id]?.[today];
      return todayAttendance && todayAttendance.status === 'P';
    }).length;
    
    // Calculate billing statistics
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    const pendingPayments = invoices.filter(invoice => 
      invoice.status === 'Unpaid' || invoice.status === 'Partial'
    ).reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    const invoicesGenerated = invoices.length;
    const overduePayments = invoices.filter(invoice => 
      invoice.status === 'Overdue'
    ).length;
    
    // Calculate monthly revenue (current month) - include financial records
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyRevenue = invoices.filter(invoice => 
      invoice.issueDate && invoice.issueDate.startsWith(currentMonth)
    ).reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
    
    // Add financial income for current month
    const financialIncome = financialRecords.filter(record => 
      record.type === 'Income' && record.date && record.date.startsWith(currentMonth)
    ).reduce((sum, record) => sum + (record.amount || 0), 0);
    
    const totalMonthlyRevenue = monthlyRevenue + financialIncome;
    
    // Update dashboard elements
    updateElement('totalOrdersCount', totalOrders);
    updateElement('totalStockItemsCount', totalStockItems);
    updateElement('activeStaffCount', activeStaff);
    updateElement('monthlyRevenueCount', formatINR(totalMonthlyRevenue));
    
    // Update billing elements
    updateElement('totalRevenueCount', formatINR(totalRevenue));
    updateElement('pendingPaymentsCount', formatINR(pendingPayments));
    updateElement('invoicesGeneratedCount', invoicesGenerated);
    updateElement('overduePaymentsCount', overduePayments);
    
    // Update order elements
    updateElement('pendingOrdersCount', orders.filter(o => o.status === 'Pending').length);
    updateElement('completedOrdersCount', completedToday);
    updateElement('totalOrdersValue', formatINR(totalOrderValue));
    updateElement('avgOrderValue', formatINR(totalOrders > 0 ? totalOrderValue / totalOrders : 0));
    
    // Update stock elements
    updateElement('totalItemsCount', totalStockItems);
    updateElement('lowStockCount', lowStockItems);
    updateElement('outOfStockCount', outOfStockItems);
    updateElement('totalStockValue', formatINR(totalStockValue));
    
    // Update staff elements
    updateElement('totalStaffCount', staff.length);
    updateElement('presentTodayCount', presentToday);
    updateElement('onLeaveCount', staff.filter(emp => emp.status === 'On Leave').length);
    updateElement('pendingLeaveCount', loadLeaveRequests().filter(req => req.status === 'Pending').length);
    
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
  }
}

/**
 * Helper function to update element text content
 */
function updateElement(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value;
  }
}

/**
 * Load data from different modules
 */
function loadOrders() {
  try {
    const stored = localStorage.getItem('logosic_orders_v1');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function loadStockItems() {
  try {
    const stored = localStorage.getItem('logosic_stock_v1');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function loadStaff() {
  try {
    const stored = localStorage.getItem('logosic_staff_v1');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function loadInvoices() {
  try {
    const stored = localStorage.getItem('logosic_billing_v1');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function loadFinancialRecords() {
  try {
    const stored = localStorage.getItem('logosic_financial_v1');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function loadAttendance() {
  try {
    const stored = localStorage.getItem('logosic_attendance_v1');
    return stored ? JSON.parse(stored) : {};
  } catch (e) {
    return {};
  }
}

function loadLeaveRequests() {
  try {
    const stored = localStorage.getItem('logistics_leave_requests');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

function loadGstReturns() {
  try {
    const stored = localStorage.getItem('logosic_gst_v1');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

// =============================================================================
// STORAGE MANAGEMENT
// =============================================================================

/**
 * Clear all local storage data
 */
function clearAllStorage() {
  const storageKeys = [
    'logosic_orders_v1',
    'logosic_stock_v1', 
    'logosic_staff_v1',
    'logosic_attendance_v1',
    'logistics_leave_requests',
    'logistics_shifts',
    'logosic_billing_v1',
    'logosic_financial_v1',
    'logosic_gst_v1'
  ];
  
  storageKeys.forEach(key => localStorage.removeItem(key));
  localStorage.clear();
  
  console.log('All local storage data cleared');
  return true;
}

/**
 * Clear storage and refresh the application
 */
function clearStorageAndRefresh() {
  confirmAction('Are you sure you want to clear ALL data? This action cannot be undone.', () => {
    clearAllStorage();
    showToast('All data cleared successfully', 'success');
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });
}

// Dropdown functionality
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;
  
  // Close all other dropdowns
  document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
    if (menu.id !== dropdownId) {
      menu.classList.remove('show');
    }
  });
  
  // Toggle current dropdown
  dropdown.classList.toggle('show');
}

// Navigation dropdown functionality
function toggleNavDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  const navDropdown = dropdown.closest('.nav-dropdown');
  if (!dropdown || !navDropdown) return;
  
  // Close all other navigation dropdowns
  document.querySelectorAll('.nav-dropdown.open').forEach(menu => {
    if (menu !== navDropdown) {
      menu.classList.remove('open');
    }
  });
  
  // Toggle current navigation dropdown
  navDropdown.classList.toggle('open');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
      menu.classList.remove('show');
    });
  }
  
  if (!event.target.closest('.nav-dropdown')) {
    document.querySelectorAll('.nav-dropdown.open').forEach(menu => {
      menu.classList.remove('open');
    });
  }
});

// Create dropdown HTML for table actions
function createTableActionsDropdown(id, actions) {
  const dropdownId = `dropdown-${id}`;
  const actionsHtml = actions.map(action => {
    const iconClass = action.icon || 'pi pi-circle';
    const itemClass = action.class || '';
    const onclick = action.onclick ? `onclick="${action.onclick}"` : '';
    
    return `<button class="dropdown-item ${itemClass}" ${onclick}>
      <i class="${iconClass}"></i> ${action.label}
    </button>`;
  }).join('');
  
  return `
    <div class="dropdown table-actions">
      <button class="dropdown-toggle" onclick="toggleDropdown('${dropdownId}')">
        <i class="pi pi-ellipsis-v"></i>
        Actions
      </button>
      <div class="dropdown-menu" id="${dropdownId}">
        ${actionsHtml}
      </div>
    </div>
  `;
}
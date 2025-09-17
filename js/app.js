// Main Application JavaScript
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize login functionality
  initializeLogin();
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
      const usernameInput = loginForm.querySelector('input[type="text"]');
      const passwordInput = loginForm.querySelector('input[type="password"]');
      if (usernameInput) usernameInput.value = "admin";
      if (passwordInput) passwordInput.value = "password";
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
    'inventoryContainer',
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
  if (screenId === 'orders') renderOrders();
  if (screenId === 'stock') renderStock();
  if (screenId === 'billing') renderInvoices();
  if (screenId === 'financial') renderFinancialRecords();
  if (screenId === 'staff') renderStaff();
  if (screenId === 'gst') renderGstReturns();
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function goTo(targetId, btn) {
  const allNav = document.querySelectorAll('.sidebar .nav-button');
  allNav.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
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
    'inventoryContainer',
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
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
      menu.classList.remove('show');
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
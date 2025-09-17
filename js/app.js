// Main Application JavaScript
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
  // Set current year
  const currentYearElement = document.getElementById("currentYear");
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }

  // Login functionality
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", e => {
      e.preventDefault();
      
      // Add loading animation (optional)
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
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
    });
  }

  // Add some interactive features
  // Add hover effects to cards
  const cards = document.querySelectorAll('.dashboard-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-2px)';
      card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    });
  });

  // Add row hover effects to tables
  const tables = document.querySelectorAll('table tbody tr');
  tables.forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.backgroundColor = 'var(--gray-50)';
    });
    
    row.addEventListener('mouseleave', () => {
      row.style.backgroundColor = 'transparent';
    });
  });
});

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

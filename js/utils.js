// Common Utilities for Logistics POS
// This file contains shared functions used across all modules

// =============================================================================
// STORAGE UTILITIES
// =============================================================================

/**
 * Generic storage functions for all modules
 */
function createStorageManager(storageKey, defaultData = []) {
  return {
    load: function() {
      try {
        const stored = localStorage.getItem(storageKey);
        return stored ? JSON.parse(stored) : defaultData;
      } catch (e) {
        console.error(`Error loading ${storageKey}:`, e);
        return defaultData;
      }
    },
    
    save: function(data) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
        return true;
      } catch (e) {
        console.error(`Error saving ${storageKey}:`, e);
        return false;
      }
    },
    
    clear: function() {
      try {
        localStorage.removeItem(storageKey);
        return true;
      } catch (e) {
        console.error(`Error clearing ${storageKey}:`, e);
        return false;
      }
    }
  };
}

// =============================================================================
// FORMATTING UTILITIES
// =============================================================================

/**
 * Format currency in Indian Rupees
 */
function formatINR(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}

/**
 * Format date in DD/MM/YYYY format
 */
function formatDate(dateString) {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return '-';
  }
}

/**
 * Format date and time
 */
function formatDateTime(dateString) {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    console.error('Error formatting datetime:', e);
    return '-';
  }
}

// =============================================================================
// STATUS BADGE UTILITIES
// =============================================================================

/**
 * Get CSS class for status badges
 */
function getStatusBadgeClass(status, type = 'default') {
  const statusMap = {
    // Order statuses
    'completed': 'status-badge status-completed',
    'shipped': 'status-badge status-shipped', 
    'pending': 'status-badge status-pending',
    'cancelled': 'status-badge status-cancelled',
    
    // Payment statuses
    'paid': 'status-badge status-completed',
    'unpaid': 'status-badge status-pending',
    'overdue': 'status-badge status-cancelled',
    'partial': 'status-badge status-warning',
    
    // Stock statuses
    'in stock': 'status-badge status-completed',
    'low stock': 'status-badge status-warning',
    'out of stock': 'status-badge status-cancelled',
    
    // Staff statuses
    'active': 'status-badge status-completed',
    'inactive': 'status-badge status-cancelled',
    'on leave': 'status-badge status-warning',
    
    // GST statuses
    'filed': 'status-badge status-completed',
    'draft': 'status-badge status-pending',
    'approved': 'status-badge status-completed',
    'rejected': 'status-badge status-cancelled'
  };
  
  const normalizedStatus = (status || '').toLowerCase();
  return statusMap[normalizedStatus] || 'status-badge status-pending';
}

// =============================================================================
// ID GENERATION UTILITIES
// =============================================================================

/**
 * Generate unique ID with prefix
 */
function generateId(prefix, existingData = []) {
  let max = 0;
  
  existingData.forEach(item => {
    const id = item.id || '';
    const match = id.match(new RegExp(`${prefix}-(\\d+)`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num)) max = Math.max(max, num);
    }
  });
  
  const next = String(max + 1).padStart(3, '0');
  return `${prefix}-${next}`;
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Validate required fields
 */
function validateRequiredFields(fields, data) {
  const errors = [];
  
  fields.forEach(field => {
    const value = data[field];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${field} is required`);
    }
  });
  
  return errors;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Indian format)
 */
function isValidPhone(phone) {
  const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// =============================================================================
// UI UTILITIES
// =============================================================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  // Check if toast function exists (from modal.js)
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  } else {
    // Fallback to alert
    alert(message);
  }
}

/**
 * Confirm action with user
 */
function confirmAction(message, callback) {
  if (typeof window.confirmModal === 'function') {
    window.confirmModal('Confirm Action', message, callback);
  } else if (confirm(message)) {
    callback();
  }
}

// =============================================================================
// PAGINATION UTILITIES
// =============================================================================

/**
 * Initialize pagination for a container
 */
function initializePagination(containerId, pageSize = 10) {
  if (typeof window.createPagination === 'function') {
    window.createPagination(containerId, pageSize);
  }
}


// =============================================================================
// EXPORT UTILITIES
// =============================================================================

/**
 * Export data as CSV
 */
function exportToCSV(data, filename, headers = null) {
  if (!data || data.length === 0) {
    showToast('No data to export', 'warning');
    return;
  }
  
  const csvHeaders = headers || Object.keys(data[0]);
  const csvContent = [
    csvHeaders.join(','),
    ...data.map(row => 
      csvHeaders.map(header => {
        const value = row[header] || '';
        // Escape commas and quotes in CSV
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
  
  showToast('Data exported successfully', 'success');
}

/**
 * Print data in a formatted table
 */
function printData(data, title, headers = null) {
  if (!data || data.length === 0) {
    showToast('No data to print', 'warning');
    return;
  }
  
  const tableHeaders = headers || Object.keys(data[0]);
  
  const printContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>${title}</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background: #f5f5f5;">
            ${tableHeaders.map(header => 
              `<th style="padding: 8px; border: 1px solid #ddd; text-align: left;">${header}</th>`
            ).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${tableHeaders.map(header => 
                `<td style="padding: 8px; border: 1px solid #ddd;">${row[header] || '-'}</td>`
              ).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.print();
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Handle errors gracefully
 */
function handleError(error, context = 'Operation') {
  console.error(`${context} error:`, error);
  showToast(`${context} failed. Please try again.`, 'error');
}

// =============================================================================
// DEBOUNCE UTILITY
// =============================================================================

/**
 * Debounce function calls
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// =============================================================================
// INITIALIZATION
// =============================================================================

// Initialize common functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Set current year
  const currentYearElement = document.getElementById("currentYear");
  if (currentYearElement) {
    currentYearElement.textContent = new Date().getFullYear();
  }
  
  // Add interactive effects
  addInteractiveEffects();
});

/**
 * Add interactive effects to UI elements
 */
function addInteractiveEffects() {
  // Card hover effects
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
  
  // Table row hover effects
  const tableRows = document.querySelectorAll('table tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      row.style.backgroundColor = 'var(--gray-50)';
    });
    
    row.addEventListener('mouseleave', () => {
      row.style.backgroundColor = 'transparent';
    });
  });
}

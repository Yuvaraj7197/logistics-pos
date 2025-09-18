// Modal & Toast Helpers
function checkModalElements() {
  const overlay = document.getElementById('modalOverlay');
  const modal = document.querySelector('.modal');
  const title = document.getElementById('modalTitle');
  const body = document.getElementById('modalBody');
  const footer = document.getElementById('modalFooter');
  
  console.log('Modal elements check:');
  console.log('Overlay:', overlay);
  console.log('Modal:', modal);
  console.log('Title:', title);
  console.log('Body:', body);
  console.log('Footer:', footer);
}

function openModal(title, body, buttons = [], size = '') {
  console.log('Opening modal:', title);
  
  const overlay = document.getElementById('modalOverlay');
  const modal = document.querySelector('.modal');
  const titleEl = document.getElementById('modalTitle');
  const bodyEl = document.getElementById('modalBody');
  const footerEl = document.getElementById('modalFooter');
  
  if (!overlay || !modal || !titleEl || !bodyEl || !footerEl) {
    console.error('Modal elements not found');
    checkModalElements();
    return;
  }
  
  // Set title
  titleEl.textContent = title;
  
  // Set body content
  bodyEl.innerHTML = body;
  
  // Clear and set buttons
  footerEl.innerHTML = '';
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.label;
    button.className = `btn ${btn.type === 'primary' ? 'btn-primary' : 'btn-secondary'}`;
    button.onclick = btn.action;
    footerEl.appendChild(button);
  });
  
  // Set modal size
  modal.className = `modal ${size}`;
  
  // Show modal
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  
  console.log('Modal opened successfully');
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function confirmModal(title, message, onConfirm) {
  const body = `<p>${message}</p>`;
  const buttons = [
    { label: 'Cancel', type: 'secondary', action: closeModal },
    { label: 'Confirm', type: 'primary', action: () => { onConfirm(); closeModal(); } }
  ];
  openModal(title, body, buttons);
}

// Toast notifications
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

// Dropdown Menu Helpers
function toggleDropdown(dropdownId) {
  // Close all other dropdowns
  document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
    if (menu.id !== dropdownId) {
      menu.classList.remove('show');
    }
  });
  
  // Toggle current dropdown
  const dropdown = document.getElementById(dropdownId);
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

function closeAllDropdowns() {
  document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
    menu.classList.remove('show');
  });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
  if (!event.target.closest('.dropdown')) {
    closeAllDropdowns();
  }
});

// Utility functions
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

function generateId(prefix = 'ID') {
  return `${prefix}-${Date.now()}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN');
}

// Pagination System
class PaginationSystem {
  constructor(containerId, itemsPerPage = null) {
    this.containerId = containerId;
    this.itemsPerPage = itemsPerPage || getConfig('ui.pagination.defaultPageSize', 10);
    this.currentPage = 1;
    this.totalItems = 0;
    this.totalPages = 0;
    this.data = [];
    this.filteredData = [];
  }

  // Initialize pagination
  init(data) {
    this.data = data;
    this.filteredData = [...data];
    this.totalItems = this.filteredData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
    this.renderPagination();
  }

  // Update data and reset pagination
  updateData(data) {
    this.data = data;
    this.filteredData = [...data];
    this.totalItems = this.filteredData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
    this.renderPagination();
  }

  // Apply filters and reset pagination
  applyFilters(filteredData) {
    this.filteredData = filteredData;
    this.totalItems = this.filteredData.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
    this.renderPagination();
  }

  // Get current page data
  getCurrentPageData() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredData.slice(startIndex, endIndex);
  }

  // Go to specific page
  goToPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.renderPagination();
      return this.getCurrentPageData();
    }
    return [];
  }

  // Go to next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      return this.goToPage(this.currentPage + 1);
    }
    return this.getCurrentPageData();
  }

  // Go to previous page
  prevPage() {
    if (this.currentPage > 1) {
      return this.goToPage(this.currentPage - 1);
    }
    return this.getCurrentPageData();
  }

  // Render pagination controls
  renderPagination() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    // Remove existing pagination
    const existingPagination = container.querySelector('.pagination');
    if (existingPagination) {
      existingPagination.remove();
    }

    if (this.totalPages <= 1) return;

    const paginationHTML = `
      <div class="pagination">
        <div class="pagination-info">
          <span>Showing ${((this.currentPage - 1) * this.itemsPerPage) + 1} to ${Math.min(this.currentPage * this.itemsPerPage, this.totalItems)} of ${this.totalItems} entries</span>
        </div>
        <div class="pagination-controls">
          <button class="btn btn-sm btn-secondary" onclick="window.paginationInstances['${this.containerId}'].prevPage()" ${this.currentPage === 1 ? 'disabled' : ''}>
            <i class="pi pi-chevron-left"></i> Previous
          </button>
          <div class="pagination-pages">
            ${this.generatePageNumbers()}
          </div>
          <button class="btn btn-sm btn-secondary" onclick="window.paginationInstances['${this.containerId}'].nextPage()" ${this.currentPage === this.totalPages ? 'disabled' : ''}>
            Next <i class="pi pi-chevron-right"></i>
          </button>
        </div>
        <div class="pagination-size">
          <label>Show:</label>
          <select onchange="window.paginationInstances['${this.containerId}'].changePageSize(this.value)">
            ${getConfig('ui.pagination.pageSizeOptions', [5, 10, 25, 50, 100]).map(size => 
              `<option value="${size}" ${this.itemsPerPage === size ? 'selected' : ''}>${size}</option>`
            ).join('')}
          </select>
        </div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', paginationHTML);
  }

  // Generate page number buttons
  generatePageNumbers() {
    let pages = '';
    const maxVisiblePages = getConfig('ui.pagination.maxVisiblePages', 5);
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages += `<button class="btn btn-sm btn-secondary" onclick="window.paginationInstances['${this.containerId}'].goToPage(1)">1</button>`;
      if (startPage > 2) {
        pages += `<span class="pagination-ellipsis">...</span>`;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages += `<button class="btn btn-sm ${i === this.currentPage ? 'btn-primary' : 'btn-secondary'}" onclick="window.paginationInstances['${this.containerId}'].goToPage(${i})">${i}</button>`;
    }

    if (endPage < this.totalPages) {
      if (endPage < this.totalPages - 1) {
        pages += `<span class="pagination-ellipsis">...</span>`;
      }
      pages += `<button class="btn btn-sm btn-secondary" onclick="window.paginationInstances['${this.containerId}'].goToPage(${this.totalPages})">${this.totalPages}</button>`;
    }

    return pages;
  }

  // Change page size
  changePageSize(newSize) {
    this.itemsPerPage = parseInt(newSize);
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.currentPage = 1;
    this.renderPagination();
    return this.getCurrentPageData();
  }

  // Get pagination info
  getPaginationInfo() {
    return {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.totalItems,
      itemsPerPage: this.itemsPerPage,
      startIndex: (this.currentPage - 1) * this.itemsPerPage,
      endIndex: Math.min(this.currentPage * this.itemsPerPage, this.totalItems)
    };
  }
}

// Global pagination instances
window.paginationInstances = {};

// Helper function to create pagination instance
function createPagination(containerId, itemsPerPage = null) {
  const instance = new PaginationSystem(containerId, itemsPerPage);
  window.paginationInstances[containerId] = instance;
  return instance;
}

function formatDateTime(date) {
  return new Date(date).toLocaleString('en-IN');
}

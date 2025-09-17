// Component Loader - Handles dynamic loading of HTML components
class ComponentLoader {
  constructor() {
    this.components = new Map();
    this.loadedComponents = new Set();
  }

  // Load a component from file
  async loadComponent(componentName) {
    if (this.loadedComponents.has(componentName)) {
      return this.components.get(componentName);
    }

    try {
      const response = await fetch(`components/${componentName}.html`);
      if (!response.ok) {
        throw new Error(`Failed to load component: ${componentName}`);
      }
      
      const html = await response.text();
      this.components.set(componentName, html);
      this.loadedComponents.add(componentName);
      
      console.log(`Component loaded: ${componentName}`);
      return html;
    } catch (error) {
      console.error(`Error loading component ${componentName}:`, error);
      return null;
    }
  }

  // Load multiple components
  async loadComponents(componentNames) {
    const promises = componentNames.map(name => this.loadComponent(name));
    return Promise.all(promises);
  }

  // Insert component into DOM
  insertComponent(componentName, targetElementId) {
    const html = this.components.get(componentName);
    if (html && document.getElementById(targetElementId)) {
      document.getElementById(targetElementId).innerHTML = html;
      return true;
    }
    return false;
  }

  // Load and insert component in one step
  async loadAndInsert(componentName, targetElementId) {
    await this.loadComponent(componentName);
    return this.insertComponent(componentName, targetElementId);
  }

  // Preload all components
  async preloadAllComponents() {
    const componentNames = [
      'login',
      'dashboard', 
      'orders',
      'stock',
      'inventory',
      'staff',
      'billing',
      'financial',
      'gst'
    ];

    try {
      await this.loadComponents(componentNames);
      console.log('All components preloaded successfully');
      return true;
    } catch (error) {
      console.error('Error preloading components:', error);
      return false;
    }
  }

  // Get component HTML
  getComponent(componentName) {
    return this.components.get(componentName);
  }

  // Check if component is loaded
  isLoaded(componentName) {
    return this.loadedComponents.has(componentName);
  }

  // Clear all components from memory
  clear() {
    this.components.clear();
    this.loadedComponents.clear();
  }
}

// Create global instance
window.componentLoader = new ComponentLoader();

// Initialize component loading when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  // Preload all components for better performance
  await window.componentLoader.preloadAllComponents();
  
  // Load initial components
  await loadInitialComponents();
});

// Load initial components
async function loadInitialComponents() {
  try {
    // Load login page
    await window.componentLoader.loadAndInsert('login', 'loginContainer');
    
    // Load dashboard
    await window.componentLoader.loadAndInsert('dashboard', 'dashboardContainer');
    
    // Load all other components into their containers
    await window.componentLoader.loadAndInsert('orders', 'ordersContainer');
    await window.componentLoader.loadAndInsert('stock', 'stockContainer');
    await window.componentLoader.loadAndInsert('inventory', 'inventoryContainer');
    await window.componentLoader.loadAndInsert('staff', 'staffContainer');
    await window.componentLoader.loadAndInsert('billing', 'billingContainer');
    await window.componentLoader.loadAndInsert('financial', 'financialContainer');
    await window.componentLoader.loadAndInsert('gst', 'gstContainer');
    
    console.log('All components loaded successfully');
  } catch (error) {
    console.error('Error loading initial components:', error);
  }
}

// Utility function to show a specific component
function showComponent(componentName) {
  const component = window.componentLoader.getComponent(componentName);
  if (component) {
    // Hide all other components
    const allContainers = [
      'loginContainer',
      'dashboardContainer', 
      'ordersContainer',
      'stockContainer',
      'inventoryContainer',
      'staffContainer',
      'billingContainer',
      'financialContainer',
      'gstContainer'
    ];
    
    allContainers.forEach(containerId => {
      const container = document.getElementById(containerId);
      if (container) {
        container.classList.add('hidden');
      }
    });
    
    // Show the requested component
    const targetContainer = document.getElementById(componentName + 'Container');
    if (targetContainer) {
      targetContainer.classList.remove('hidden');
    }
  }
}

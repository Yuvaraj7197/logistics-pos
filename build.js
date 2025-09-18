#!/usr/bin/env node

/**
 * Build Script for Logistics POS System
 * This script creates a production-ready build of the application
 */

const fs = require('fs');
const path = require('path');

// Build configuration
const BUILD_CONFIG = {
  sourceDir: './',
  buildDir: './dist',
  version: '1.0.0',
  buildDate: new Date().toISOString(),
  files: {
    html: ['index.html'],
    css: ['styles.css'],
    js: [
      'js/config.js',
      'js/utils.js',
      'js/modal.js',
      'js/app.js',
      'js/orders.js',
      'js/stock.js',
      'js/billing.js',
      'js/staff.js',
      'js/financial.js',
      'js/gst.js'
    ],
    components: [
      'components/dashboard.html',
      'components/orders.html',
      'components/stock.html',
      'components/billing.html',
      'components/staff.html',
      'components/financial.html',
      'components/gst.html',
      'components/inventory.html',
      'components/login.html'
    ]
  }
};

// Create build directory
function createBuildDir() {
  if (!fs.existsSync(BUILD_CONFIG.buildDir)) {
    fs.mkdirSync(BUILD_CONFIG.buildDir, { recursive: true });
  }
  console.log('✅ Created build directory');
}

// Copy files to build directory
function copyFiles() {
  const { files } = BUILD_CONFIG;
  
  // Copy HTML files
  files.html.forEach(file => {
    const sourcePath = path.join(BUILD_CONFIG.sourceDir, file);
    const destPath = path.join(BUILD_CONFIG.buildDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`📄 Copied ${file}`);
  });
  
  // Copy CSS files
  files.css.forEach(file => {
    const sourcePath = path.join(BUILD_CONFIG.sourceDir, file);
    const destPath = path.join(BUILD_CONFIG.buildDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`🎨 Copied ${file}`);
  });
  
  // Create JS directory and copy JS files
  const jsDir = path.join(BUILD_CONFIG.buildDir, 'js');
  if (!fs.existsSync(jsDir)) {
    fs.mkdirSync(jsDir, { recursive: true });
  }
  
  files.js.forEach(file => {
    const sourcePath = path.join(BUILD_CONFIG.sourceDir, file);
    const destPath = path.join(BUILD_CONFIG.buildDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`📜 Copied ${file}`);
  });
  
  // Create components directory and copy component files
  const componentsDir = path.join(BUILD_CONFIG.buildDir, 'components');
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }
  
  files.components.forEach(file => {
    const sourcePath = path.join(BUILD_CONFIG.sourceDir, file);
    const destPath = path.join(BUILD_CONFIG.buildDir, file);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`🧩 Copied ${file}`);
  });
}

// Minify CSS
function minifyCSS() {
  const cssFile = path.join(BUILD_CONFIG.buildDir, 'styles.css');
  if (fs.existsSync(cssFile)) {
    let css = fs.readFileSync(cssFile, 'utf8');
    
    // Basic CSS minification
    css = css
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/;\s*}/g, '}') // Remove semicolon before closing brace
      .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
      .replace(/\s*}\s*/g, '}') // Remove spaces around closing brace
      .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
      .replace(/\s*,\s*/g, ',') // Remove spaces around commas
      .trim();
    
    fs.writeFileSync(cssFile, css);
    console.log('🎨 Minified CSS');
  }
}

// Minify JavaScript
function minifyJS() {
  const jsDir = path.join(BUILD_CONFIG.buildDir, 'js');
  
  BUILD_CONFIG.files.js.forEach(file => {
    const jsFile = path.join(BUILD_CONFIG.buildDir, file);
    if (fs.existsSync(jsFile)) {
      let js = fs.readFileSync(jsFile, 'utf8');
      
      // Basic JS minification
      js = js
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\/\/.*$/gm, '') // Remove single-line comments
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\s*{\s*/g, '{') // Remove spaces around opening brace
        .replace(/\s*}\s*/g, '}') // Remove spaces around closing brace
        .replace(/\s*;\s*/g, ';') // Remove spaces around semicolons
        .replace(/\s*,\s*/g, ',') // Remove spaces around commas
        .replace(/\s*\(\s*/g, '(') // Remove spaces around opening parenthesis
        .replace(/\s*\)\s*/g, ')') // Remove spaces around closing parenthesis
        .trim();
      
      fs.writeFileSync(jsFile, js);
      console.log(`📜 Minified ${path.basename(file)}`);
    }
  });
}

// Create build info file
function createBuildInfo() {
  const buildInfo = {
    version: BUILD_CONFIG.version,
    buildDate: BUILD_CONFIG.buildDate,
    files: {
      html: BUILD_CONFIG.files.html.length,
      css: BUILD_CONFIG.files.css.length,
      js: BUILD_CONFIG.files.js.length,
      components: BUILD_CONFIG.files.components.length
    },
    totalFiles: Object.values(BUILD_CONFIG.files).flat().length
  };
  
  const buildInfoPath = path.join(BUILD_CONFIG.buildDir, 'build-info.json');
  fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
  console.log('📋 Created build info');
}

// Create package.json for the build
function createPackageJson() {
  const packageJson = {
    name: 'logistics-pos',
    version: BUILD_CONFIG.version,
    description: 'Logistics Point of Sale System - Dynamic Dashboard',
    main: 'index.html',
    scripts: {
      start: 'npx http-server . -p 8080 -o',
      serve: 'npx http-server . -p 8080',
      build: 'node build.js'
    },
    keywords: ['logistics', 'pos', 'inventory', 'management', 'dashboard'],
    author: 'Logosic Logistics',
    license: 'MIT',
    dependencies: {
      'http-server': '^14.1.1'
    },
    devDependencies: {},
    engines: {
      node: '>=14.0.0'
    }
  };
  
  const packageJsonPath = path.join(BUILD_CONFIG.buildDir, 'package.json');
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('📦 Created package.json');
}

// Create README for the build
function createReadme() {
  const readme = `# Logistics POS System - Build ${BUILD_CONFIG.version}

## 🚀 Quick Start

### Option 1: Direct File Opening
1. Open \`index.html\` in your web browser
2. The system will work with local storage

### Option 2: Local Server (Recommended)
1. Install dependencies: \`npm install\`
2. Start server: \`npm start\`
3. Open http://localhost:8080 in your browser

### Option 3: Any Web Server
1. Upload all files to your web server
2. Access via your domain

## 📁 Build Contents

- **HTML Files**: Main application files
- **CSS**: Minified stylesheets
- **JavaScript**: Minified and optimized scripts
- **Components**: Modular HTML components
- **Configuration**: Dynamic configuration system

## 🔧 Features

- ✅ Dynamic Dashboard Statistics
- ✅ Real-time Data Updates
- ✅ Configurable Business Rules
- ✅ Responsive Design
- ✅ Local Storage Persistence
- ✅ No Backend Required

## 📊 Modules

1. **Dashboard**: Overview and statistics
2. **Orders**: Order management and tracking
3. **Stock**: Inventory management
4. **Staff**: Employee management and attendance
5. **Billing**: Invoices and payments
6. **Financial**: Expense tracking
7. **GST**: Tax compliance

## ⚙️ Configuration

All settings can be modified in \`js/config.js\`:
- Business rules and statuses
- UI settings and pagination
- Validation rules
- Export settings

## 🔒 Security Note

This is a frontend-only application. For production use, consider:
- Adding backend authentication
- Implementing proper data validation
- Adding data encryption
- Setting up regular backups

## 📞 Support

For support or customization, contact the development team.

---
Build Date: ${BUILD_CONFIG.buildDate}
Version: ${BUILD_CONFIG.version}
`;

  const readmePath = path.join(BUILD_CONFIG.buildDir, 'README.md');
  fs.writeFileSync(readmePath, readme);
  console.log('📖 Created README.md');
}

// Create deployment script
function createDeployScript() {
  const deployScript = `#!/bin/bash

# Logistics POS Deployment Script
# This script helps deploy the application to various platforms

echo "🚀 Logistics POS Deployment Script"
echo "=================================="

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Build directory not found. Run 'node build.js' first."
    exit 1
fi

echo "📁 Build directory found"
echo ""

# Option 1: Local server
echo "1️⃣ Starting local server..."
echo "   Run: cd dist && npm start"
echo "   Then open: http://localhost:8080"
echo ""

# Option 2: GitHub Pages
echo "2️⃣ GitHub Pages deployment:"
echo "   - Push dist/ contents to gh-pages branch"
echo "   - Enable GitHub Pages in repository settings"
echo ""

# Option 3: Netlify
echo "3️⃣ Netlify deployment:"
echo "   - Drag dist/ folder to Netlify dashboard"
echo "   - Or connect GitHub repository"
echo ""

# Option 4: Vercel
echo "4️⃣ Vercel deployment:"
echo "   - Install Vercel CLI: npm i -g vercel"
echo "   - Run: cd dist && vercel"
echo ""

# Option 5: Any web server
echo "5️⃣ Traditional web server:"
echo "   - Upload all files from dist/ to your web server"
echo "   - Ensure index.html is in the root directory"
echo ""

echo "✅ Deployment options ready!"
echo "Choose your preferred method and follow the instructions above."
`;

  const deployScriptPath = path.join(BUILD_CONFIG.buildDir, 'deploy.sh');
  fs.writeFileSync(deployScriptPath, deployScript);
  
  // Make it executable on Unix systems
  if (process.platform !== 'win32') {
    fs.chmodSync(deployScriptPath, '755');
  }
  
  console.log('🚀 Created deployment script');
}

// Main build function
function build() {
  console.log('🏗️  Starting Logistics POS Build Process');
  console.log('==========================================');
  console.log(`Version: ${BUILD_CONFIG.version}`);
  console.log(`Build Date: ${BUILD_CONFIG.buildDate}`);
  console.log('');

  try {
    createBuildDir();
    copyFiles();
    minifyCSS();
    minifyJS();
    createBuildInfo();
    createPackageJson();
    createReadme();
    createDeployScript();
    
    console.log('');
    console.log('✅ Build completed successfully!');
    console.log(`📁 Build output: ${BUILD_CONFIG.buildDir}`);
    console.log('');
    console.log('🚀 Next steps:');
    console.log('   1. cd dist');
    console.log('   2. npm install');
    console.log('   3. npm start');
    console.log('   4. Open http://localhost:8080');
    console.log('');
    console.log('📖 See README.md in dist/ for more deployment options');
    
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

// Run build if this script is executed directly
if (require.main === module) {
  build();
}

module.exports = { build, BUILD_CONFIG };


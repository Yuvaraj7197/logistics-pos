# 🚛 Logistics POS System

A comprehensive, dynamic Point of Sale system designed specifically for logistics operations. Features real-time dashboard statistics, inventory management, staff tracking, billing, and financial management.

## ✨ Features

### 🎯 **Dynamic Dashboard**
- **Real-time Statistics**: All numbers calculated from actual data
- **Auto-updating**: Statistics refresh automatically when data changes
- **Comprehensive Overview**: Orders, stock, staff, and financial metrics

### 📦 **Order Management**
- Order creation and tracking
- DC (Delivery Challan) order support
- Status management (Pending, Completed, Shipped, Cancelled)
- Customer information and delivery tracking

### 📊 **Stock Management**
- Inventory tracking with real-time counts
- Low stock and out-of-stock alerts
- Category-based organization
- Supplier management
- Stock value calculations

### 👥 **Staff Management**
- Employee database with roles and departments
- Biometric check-in/check-out system
- Attendance tracking
- Leave request management
- Payroll generation

### 💰 **Billing & Payments**
- Invoice generation and management
- Quotation system
- Payment tracking
- Multiple payment methods
- Overdue payment alerts

### 📈 **Financial Management**
- Expense tracking (Machine EMI, Electric Bills, Transport, etc.)
- Financial record management
- Payment status tracking
- Revenue analysis

### 🏛️ **GST Management**
- GST return filing
- Tax calculation and tracking
- Compliance management
- Return status monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ (for build tools)
- Modern web browser
- No backend required!

### Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/your-username/logistics-pos.git
   cd logistics-pos
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

5. **Open in Browser**
   - Navigate to `http://localhost:8080`
   - The system is ready to use!

### Alternative: Direct File Opening
Simply open `index.html` in your web browser - no server required!

## 🏗️ Build Process

The build system creates an optimized, production-ready version:

```bash
# Clean build
npm run clean

# Build application
npm run build

# Rebuild everything
npm run rebuild
```

### Build Output
- **Minified CSS**: Optimized stylesheets
- **Minified JavaScript**: Compressed and optimized scripts
- **Organized Structure**: Clean file organization
- **Production Ready**: Optimized for deployment

## ⚙️ Configuration

All system settings are centralized in `js/config.js`:

### Business Configuration
```javascript
// Order statuses
BUSINESS_CONFIG.order.statuses = ['Pending', 'Completed', 'Shipped', 'Cancelled'];

// Stock categories
BUSINESS_CONFIG.stock.categories = ['Electronics', 'Furniture', 'Medical', ...];

// Staff departments
BUSINESS_CONFIG.staff.departments = ['Production', 'Quality', 'Maintenance', ...];
```

### UI Configuration
```javascript
// Pagination settings
UI_CONFIG.pagination.defaultPageSize = 10;
UI_CONFIG.pagination.pageSizeOptions = [5, 10, 25, 50, 100];

// Modal sizes
UI_CONFIG.modal.sizes = {
  small: '400px',
  medium: '600px',
  large: '800px'
};
```

## 📱 Usage

### Dashboard
- View real-time statistics
- Navigate between modules
- Monitor system status

### Adding Data
1. **Orders**: Click "New Order" to create orders
2. **Stock**: Click "Add Stock" to add inventory items
3. **Staff**: Click "Add Staff" to register employees
4. **Billing**: Click "Create Invoice" to generate invoices

### Managing Data
- Use the action dropdowns (⋮) for each item
- Edit, view, delete, or export data
- Filter and search across all modules

## 🔧 Customization

### Adding New Status Types
```javascript
// In js/config.js
BUSINESS_CONFIG.order.statuses.push('Processing', 'On Hold');
```

### Modifying Categories
```javascript
// Add new stock categories
BUSINESS_CONFIG.stock.categories.push('Pharmaceuticals', 'Electronics');
```

### Changing UI Settings
```javascript
// Modify pagination options
UI_CONFIG.pagination.pageSizeOptions = [10, 20, 50, 100, 200];
```

## 📊 Data Storage

- **Local Storage**: All data stored in browser's local storage
- **No Backend**: Completely frontend-based
- **Persistent**: Data survives browser restarts
- **Exportable**: Data can be exported to CSV/PDF

## 🚀 Deployment Options

### 1. Static Hosting
- Upload `dist/` folder to any web server
- Works with Apache, Nginx, or any static host

### 2. GitHub Pages
```bash
cd dist
git init
git add .
git commit -m "Deploy logistics POS"
git push origin gh-pages
```

### 3. Netlify
- Drag `dist/` folder to Netlify dashboard
- Automatic deployment and updates

### 4. Vercel
```bash
cd dist
npx vercel
```

### 5. Any Cloud Provider
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps

## 🔒 Security Considerations

### Current State
- Frontend-only application
- Data stored in browser local storage
- No authentication system

### Production Recommendations
- Implement backend authentication
- Add data encryption
- Set up regular backups
- Implement proper user management
- Add API rate limiting

## 📈 Performance

- **Lightweight**: Minimal dependencies
- **Fast Loading**: Optimized assets
- **Responsive**: Works on all devices
- **Efficient**: Real-time updates without performance impact

## 🛠️ Development

### File Structure
```
logistics-pos/
├── components/          # HTML components
├── js/                 # JavaScript modules
│   ├── config.js       # Configuration system
│   ├── app.js          # Main application
│   ├── utils.js        # Utility functions
│   └── modules/        # Feature modules
├── styles.css          # Main stylesheet
├── index.html          # Main application
├── build.js            # Build script
└── package.json        # Dependencies
```

### Adding New Features
1. Create new module in `js/`
2. Add configuration in `js/config.js`
3. Create HTML component in `components/`
4. Update navigation in `js/app.js`

## 📞 Support

For support, customization, or feature requests:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 📄 License

MIT License - see LICENSE file for details

## 🎉 Acknowledgments

- Built with modern web technologies
- Responsive design with PrimeFlex
- Icons from PrimeIcons
- Fonts from Google Fonts

---

**Version**: 1.0.0  
**Last Updated**: ${new Date().toLocaleDateString()}  
**Build Status**: ✅ Production Ready
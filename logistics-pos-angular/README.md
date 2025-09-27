# Logistics POS Angular Application

This is a modern Angular application converted from the original HTML/CSS/JavaScript POS (Point of Sale) system. The application provides comprehensive logistics and production management functionality.

## Features

### 🔐 Authentication System
- Secure login/logout functionality
- Role-based access control
- Session management with localStorage
- Route guards for protected pages

### 📊 Dashboard
- Real-time statistics and metrics
- Quick action buttons
- Recent activity feed
- Visual data representation

### 📦 Inventory Management
- Product catalog management
- Stock level tracking
- Low stock alerts
- Batch tracking
- Supplier management

### 🛒 Order Management
- Customer orders
- Purchase orders
- Order status tracking
- Order history

### 👥 Staff Management
- Employee directory
- Attendance tracking
- Shift management
- Productivity metrics

### 💰 Financial Management
- Transaction tracking
- Receivables and payables
- Multi-currency support
- GST calculations

### 🏭 Production Management
- Manufacturing orders
- Quality control
- Production scheduling
- Resource allocation

### 📈 Reports
- Comprehensive reporting system
- Data visualization
- Export capabilities
- Analytics dashboard

## Technology Stack

- **Angular 20+** - Latest version with standalone components
- **TypeScript** - Type-safe development
- **SCSS** - Enhanced styling capabilities
- **RxJS** - Reactive programming
- **PrimeNG** - UI component library
- **Chart.js** - Data visualization

## Project Structure

```
src/
├── app/
│   ├── components/          # Feature components
│   │   ├── login/           # Authentication
│   │   ├── dashboard/       # Main dashboard
│   │   ├── inventory/       # Inventory management
│   │   ├── orders/          # Order management
│   │   ├── staff/           # Staff management
│   │   ├── finance/         # Financial management
│   │   ├── production/      # Production management
│   │   └── reports/         # Reporting system
│   ├── services/            # Business logic services
│   │   ├── auth.ts         # Authentication service
│   │   └── data.ts         # Data management service
│   ├── guards/             # Route guards
│   │   └── auth-guard.ts   # Authentication guard
│   ├── app.routes.ts       # Routing configuration
│   ├── app.ts              # Main app component
│   ├── app.html            # Main app template
│   └── app.scss            # Global styles
└── styles.scss             # Global CSS variables and utilities
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Angular CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd logistics-pos-angular
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

### Demo Credentials

The application includes demo users for testing:

- **Admin**: `admin` / `password123`
- **Manager**: `manager` / `manager123`
- **Staff**: `staff` / `staff123`
- **Demo**: `demo` / `demo123`

## Key Improvements from Original HTML Version

### 🚀 Modern Architecture
- **Component-based architecture** - Modular and reusable components
- **Service-oriented design** - Separation of concerns
- **Reactive programming** - RxJS for data flow management
- **Type safety** - TypeScript for better development experience

### 🎨 Enhanced UI/UX
- **Responsive design** - Mobile-first approach
- **Modern styling** - SCSS with CSS variables
- **Consistent theming** - Unified design system
- **Accessibility** - WCAG compliant components

### 🔧 Better Development Experience
- **Hot reload** - Instant development feedback
- **Linting** - Code quality enforcement
- **Type checking** - Compile-time error detection
- **Modular imports** - Tree-shakable dependencies

### 📱 Mobile Support
- **Responsive layout** - Works on all device sizes
- **Touch-friendly** - Optimized for mobile interaction
- **Progressive Web App** - Can be installed on devices

### 🔒 Security Enhancements
- **Route guards** - Protected routes
- **Input validation** - Form validation
- **XSS protection** - Angular's built-in security
- **CSRF protection** - Cross-site request forgery prevention

## Development

### Adding New Components
```bash
ng generate component components/feature-name
```

### Adding New Services
```bash
ng generate service services/service-name
```

### Adding New Guards
```bash
ng generate guard guards/guard-name
```

### Building for Production
```bash
ng build --configuration production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

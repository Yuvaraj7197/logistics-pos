# Assets Folder Structure

This folder contains all static assets for the Logistics POS application.

## Folder Structure

```
assets/
├── images/          # General images, photos, screenshots
├── icons/           # Custom icons (SVG, PNG)
├── fonts/           # Custom fonts (if any)
├── logos/           # Company logos and branding
└── README.md        # This file
```

## Logo Usage Guidelines

### Company Logo Placement

1. **Main Logo**: Place your primary company logo in `assets/logos/`
   - Recommended formats: SVG (preferred), PNG, JPG
   - Recommended sizes: 
     - Header logo: 200x60px or similar aspect ratio
     - Favicon: 32x32px, 16x16px
     - Large logo: 400x120px for login page

2. **Logo Files to Add**:
   - `company-logo.svg` - Main logo (SVG format)
   - `company-logo.png` - Main logo (PNG format)
   - `company-logo-white.svg` - White version for dark backgrounds
   - `favicon.ico` - Browser favicon
   - `apple-touch-icon.png` - iOS home screen icon

### Where Logos Are Used

1. **Header/Logo Area** (styles.css line ~120-130)
2. **Login Page** (components/login.html)
3. **Favicon** (index.html head section)
4. **Print Templates** (invoices, receipts)

## File Naming Convention

- Use lowercase with hyphens: `company-logo.svg`
- Include size in filename if multiple sizes: `logo-200x60.png`
- Use descriptive names: `favicon-32x32.ico`

## Adding Your Company Logo

1. Place your logo files in `assets/logos/`
2. Update the CSS references in `styles.css`
3. Update HTML references in components
4. Test on different screen sizes

## Image Optimization

- Compress images for web use
- Use appropriate formats (SVG for logos, PNG for photos with transparency, JPG for photos)
- Consider responsive images for different screen sizes

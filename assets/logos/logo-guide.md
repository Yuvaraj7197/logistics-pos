# Company Logo Setup Guide

## ✅ Logo Successfully Integrated!

Your company logo (`company-logo.jpg`) has been successfully integrated into the application.

## Current Setup

1. **Active Logo Files** in this folder (`assets/logos/`):
   - ✅ `company-logo.jpg` - Your main logo (currently active)
   - `company-logo.svg` - Sample SVG logo (can be removed)
   - `company-logo-white.svg` - Sample white version (can be removed)
   - `favicon.svg` - Sample favicon

## Optional Additional Files

If you want to add more logo variations:
   - `company-logo-white.jpg` - White version for dark backgrounds
   - `favicon.ico` - Browser favicon (32x32px)
   - `apple-touch-icon.png` - iOS home screen icon (180x180px)
   - `favicon-32x32.png` - 32x32px favicon
   - `favicon-16x16.png` - 16x16px favicon

## Logo Specifications

### Main Logo
- **Format**: SVG (preferred) or PNG
- **Size**: 200x60px (header), 300x90px (login page)
- **Background**: Transparent or white
- **Colors**: Should work on light backgrounds

### White Logo Version
- **Format**: SVG (preferred) or PNG
- **Size**: Same as main logo
- **Background**: Transparent
- **Colors**: White/light colors for dark backgrounds

### Favicon
- **Format**: ICO, PNG
- **Sizes**: 16x16px, 32x32px
- **Background**: Can be colored
- **Design**: Simplified version of main logo

## Where Logos Are Used

1. **Header** (`index.html` line ~55-63)
   - Uses `company-logo.svg` with fallback to text
   - Size: 40px height

2. **Login Page** (`index.html` line ~28-30)
   - Uses `company-logo.svg` with fallback to icon
   - Size: 60px height

3. **Browser Tab** (`index.html` line ~9-12)
   - Uses favicon files for browser tab icon

## Testing Your Logo

1. Add your logo files to `assets/logos/`
2. Refresh the application
3. Check:
   - Header logo displays correctly
   - Login page logo displays correctly
   - Browser tab shows favicon
   - Fallback works if logo fails to load

## Troubleshooting

- **Logo not showing**: Check file path and format
- **Logo too big/small**: Adjust CSS classes in `styles.css`
- **Logo blurry**: Use SVG format or higher resolution PNG
- **Fallback not working**: Check `onerror` attribute in HTML

## Customization

To change logo sizes, edit these CSS classes in `styles.css`:
- `.company-logo` - Header logo (40px height)
- `.company-logo-large` - Login page logo (60px height)
- `.company-logo-small` - Small logo (24px height)

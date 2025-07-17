# DiffShot Configuration

## Project: Next.js E-commerce

**Framework**: Next.js
**Dev Server**: http://localhost:3000

## Routes

Critical pages that should be screenshotted when components change:

- `/` - Homepage with featured products
- `/products` - Product listing page
- `/products/[id]` - Product detail pages
- `/cart` - Shopping cart
- `/checkout` - Checkout flow
- `/account` - User account dashboard
- `/admin` - Admin dashboard

## Viewports

Testing responsive design across devices:

- Mobile: 390x844 (iPhone 14)
- Tablet: 768x1024 (iPad)
- Desktop: 1920x1080 (Full HD)

## Themes

- `light` - Default theme
- `dark` - Dark mode variant

## Authentication

Login credentials for protected routes:

```javascript
// Authentication script location
const authScript = '.diffshot/auth/login.js';

// Test accounts:
// Customer: customer@example.com / password123
// Admin: admin@example.com / admin123
```

## Special Instructions

- Product pages use dynamic routes - test with IDs: 1, 2, 3
- Admin panel requires admin role authentication
- Checkout flow has multiple steps - capture each step
- Cart state is preserved between page navigations
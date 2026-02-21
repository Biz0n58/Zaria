# Zaria Multi-App Platform - Setup Guide

## Project Structure

```
Zaria/
├── backend/
│   ├── cmd/
│   │   ├── server/main.go
│   │   ├── migrate/main.go
│   │   └── seed/main.go
│   ├── internal/
│   │   ├── db/pool.go
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── handlers/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── routes/
│   └── go.mod
├── apps/
│   ├── admin-web/ (Next.js - Port 3001)
│   ├── store-web/ (Next.js - Port 3000)
│   └── mobile/ (Expo React Native)
└── docker-compose.yml
```

## Remaining Files to Create

### Admin Web App (`apps/admin-web/`)
- [x] package.json, tsconfig.json, next.config.ts, tailwind.config.js
- [x] lib/admin.ts, lib/types.ts
- [x] middleware.ts
- [x] app/layout.tsx, app/globals.css
- [x] app/admin/login/page.tsx
- [x] app/admin/page.tsx
- [x] app/api/admin/login/route.ts
- [x] app/api/admin/logout/route.ts
- [ ] app/admin/products/page.tsx (copy from frontend/app/admin/products/page.tsx)
- [ ] app/admin/products/new/page.tsx (copy from frontend/app/admin/products/new/page.tsx)
- [ ] app/admin/products/[id]/edit/page.tsx (copy from frontend/app/admin/products/[id]/edit/page.tsx)
- [ ] app/admin/orders/page.tsx (copy from frontend/app/admin/orders/page.tsx)
- [ ] app/admin/orders/[id]/page.tsx (copy from frontend/app/admin/orders/[id]/page.tsx)
- [ ] app/api/admin/orders/route.ts (copy from frontend/app/api/admin/orders/route.ts)

### Store Web App (`apps/store-web/`)
- [ ] package.json (similar to admin-web, port 3000)
- [ ] tsconfig.json, next.config.ts, tailwind.config.js, postcss.config.mjs
- [ ] lib/api.ts (public API client)
- [ ] lib/cart.ts (copy from frontend/lib/cart.ts)
- [ ] lib/types.ts (copy from frontend/lib/types.ts)
- [ ] app/layout.tsx, app/globals.css
- [ ] app/page.tsx (product listing - copy from frontend/app/page.tsx)
- [ ] app/product/[id]/page.tsx (copy from frontend/app/product/[id]/page.tsx)
- [ ] app/cart/page.tsx (copy from frontend/app/cart/page.tsx)
- [ ] app/checkout/page.tsx (copy from frontend/app/checkout/page.tsx)
- [ ] app/payment/success/page.tsx (update to call GET /api/orders/:id)
- [ ] app/payment/failed/page.tsx (copy from frontend/app/payment/failed/page.tsx)

### Mobile App (`apps/mobile/`)
- [ ] package.json (Expo dependencies)
- [ ] app.json (Expo config)
- [ ] tsconfig.json
- [ ] app/_layout.tsx (Expo Router)
- [ ] app/(tabs)/index.tsx (Home - products list)
- [ ] app/(tabs)/cart.tsx
- [ ] app/product/[id].tsx
- [ ] app/checkout.tsx
- [ ] app/payment/success.tsx
- [ ] app/payment/failed.tsx
- [ ] lib/api.ts (API client)
- [ ] lib/storage.ts (SecureStore wrapper)
- [ ] lib/types.ts
- [ ] components/ProductCard.tsx
- [ ] components/CartItem.tsx
- [ ] components/PaymentForm.tsx

## Setup Commands

### 1. Database (PostgreSQL)
```bash
docker-compose up -d db
```

### 2. Backend
```bash
cd backend
go mod tidy
go run cmd/migrate/main.go
go run cmd/seed/main.go
go run cmd/server/main.go
```

### 3. Admin Web
```bash
cd apps/admin-web
npm install
npm run dev
# Runs on http://localhost:3001
```

### 4. Store Web
```bash
cd apps/store-web
npm install
npm run dev
# Runs on http://localhost:3000
```

### 5. Mobile App
```bash
cd apps/mobile
npm install
npx expo start
# Follow prompts for iOS/Android simulator
```

## Environment Variables

Copy `.env.example` files and fill in:
- Backend: Database credentials, JWT secrets, Stripe keys
- Admin Web: API base URL
- Store Web: API base URL, Stripe publishable key
- Mobile: API base URL, Stripe publishable key

## Testing Checklist

1. Admin login: `POST /api/admin/auth/login` → cookie set
2. Create product: `POST /api/admin/products` (protected)
3. List products: `GET /api/products` (public)
4. Checkout: `POST /api/checkout` → returns order_id
5. Payment intent: `POST /api/payments/stripe/create-intent` → returns client_secret
6. Webhook: `POST /api/payments/stripe/webhook` → updates order status
7. Get order: `GET /api/orders/:id` → returns order with items

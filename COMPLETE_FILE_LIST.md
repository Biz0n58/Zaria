# Complete File List - Zaria Multi-App Platform

## ✅ Completed Files

### Backend (Restructured)
- ✅ `backend/cmd/server/main.go`
- ✅ `backend/internal/db/pool.go`
- ✅ `backend/internal/migrations/001_create_tables.sql`
- ✅ `backend/internal/migrations/002_add_is_active_to_products.sql`
- ✅ `backend/internal/migrations/003_add_users_and_user_id.sql`
- ✅ `backend/internal/models/admin.go`
- ✅ `backend/internal/models/user.go`
- ✅ `backend/internal/models/product.go`
- ✅ `backend/internal/models/order.go`
- ✅ `backend/internal/models/payment.go`
- ✅ `backend/internal/services/auth.go`
- ✅ `backend/internal/services/stripe.go`
- ✅ `backend/internal/middleware/jwt.go`
- ✅ `backend/internal/handlers/admin_handler.go`
- ✅ `backend/internal/handlers/auth_handler.go`
- ✅ `backend/internal/handlers/product_handler.go`
- ✅ `backend/internal/handlers/checkout_handler.go`
- ✅ `backend/internal/handlers/order_handler.go`
- ✅ `backend/internal/handlers/payment_handler.go`
- ✅ `backend/internal/routes/register.go`
- ✅ `backend/cmd/migrate/main.go`
- ✅ `backend/cmd/seed/main.go`

### Admin Web App
- ✅ `apps/admin-web/package.json`
- ✅ `apps/admin-web/tsconfig.json`
- ✅ `apps/admin-web/next.config.ts`
- ✅ `apps/admin-web/tailwind.config.js`
- ✅ `apps/admin-web/postcss.config.mjs`
- ✅ `apps/admin-web/middleware.ts`
- ✅ `apps/admin-web/lib/admin.ts`
- ✅ `apps/admin-web/lib/types.ts`
- ✅ `apps/admin-web/app/layout.tsx`
- ✅ `apps/admin-web/app/globals.css`
- ✅ `apps/admin-web/app/admin/login/page.tsx`
- ✅ `apps/admin-web/app/admin/page.tsx`
- ✅ `apps/admin-web/app/api/admin/login/route.ts`
- ✅ `apps/admin-web/app/api/admin/logout/route.ts`

### Store Web App
- ✅ `apps/store-web/package.json`
- ✅ `apps/store-web/tsconfig.json`
- ✅ `apps/store-web/next.config.ts`
- ✅ `apps/store-web/tailwind.config.js`
- ✅ `apps/store-web/postcss.config.mjs`
- ✅ `apps/store-web/lib/api.ts`
- ✅ `apps/store-web/lib/cart.ts`
- ✅ `apps/store-web/lib/types.ts`
- ✅ `apps/store-web/app/layout.tsx`
- ✅ `apps/store-web/app/globals.css`

## 📋 Files to Copy from Existing Frontend

### Admin Web - Copy These Files:
1. `frontend/app/admin/products/page.tsx` → `apps/admin-web/app/admin/products/page.tsx`
2. `frontend/app/admin/products/new/page.tsx` → `apps/admin-web/app/admin/products/new/page.tsx`
3. `frontend/app/admin/products/[id]/edit/page.tsx` → `apps/admin-web/app/admin/products/[id]/edit/page.tsx`
4. `frontend/app/admin/orders/page.tsx` → `apps/admin-web/app/admin/orders/page.tsx`
5. `frontend/app/admin/orders/[id]/page.tsx` → `apps/admin-web/app/admin/orders/[id]/page.tsx`
6. `frontend/app/api/admin/orders/route.ts` → `apps/admin-web/app/api/admin/orders/route.ts`

### Store Web - Copy These Files:
1. `frontend/app/page.tsx` → `apps/store-web/app/page.tsx`
2. `frontend/app/product/[id]/page.tsx` → `apps/store-web/app/product/[id]/page.tsx`
3. `frontend/app/cart/page.tsx` → `apps/store-web/app/cart/page.tsx`
4. `frontend/app/checkout/page.tsx` → `apps/store-web/app/checkout/page.tsx`
5. `frontend/app/payment/failed/page.tsx` → `apps/store-web/app/payment/failed/page.tsx`

### Store Web - Update This File:
1. `frontend/app/payment/success/page.tsx` → `apps/store-web/app/payment/success/page.tsx`
   - Add: Call `api.orders.getById(orderId)` to fetch order details
   - Display: Order status, items, totals, payment status

## 📱 Mobile App - Files to Create

### Core Config
- `apps/mobile/package.json` (Expo + React Native + Stripe)
- `apps/mobile/app.json` (Expo config)
- `apps/mobile/tsconfig.json`
- `apps/mobile/.env.example`

### App Structure
- `apps/mobile/app/_layout.tsx` (Expo Router root layout)
- `apps/mobile/app/(tabs)/_layout.tsx` (Tab navigation)
- `apps/mobile/app/(tabs)/index.tsx` (Home - products list)
- `apps/mobile/app/(tabs)/cart.tsx` (Cart tab)
- `apps/mobile/app/product/[id].tsx` (Product details)
- `apps/mobile/app/checkout.tsx` (Checkout screen)
- `apps/mobile/app/payment/success.tsx` (Success screen)
- `apps/mobile/app/payment/failed.tsx` (Failed screen)

### Libraries
- `apps/mobile/lib/api.ts` (API client - same as store-web)
- `apps/mobile/lib/storage.ts` (Expo SecureStore wrapper)
- `apps/mobile/lib/types.ts` (TypeScript types)
- `apps/mobile/lib/cart.ts` (Cart management - AsyncStorage)

### Components
- `apps/mobile/components/ProductCard.tsx`
- `apps/mobile/components/CartItem.tsx`
- `apps/mobile/components/PaymentForm.tsx` (Stripe React Native)

## 🔧 Environment Files

Create these manually (blocked by .gitignore):
- `backend/.env.example`
- `apps/admin-web/.env.example`
- `apps/store-web/.env.example`
- `apps/mobile/.env.example`

See `SETUP_MULTI_APP.md` for environment variable details.

## 🚀 Next Steps

1. Copy remaining admin pages from `frontend/app/admin/`
2. Copy remaining store pages from `frontend/app/`
3. Create mobile app structure
4. Update `docker-compose.yml` if needed
5. Test all apps locally
6. Update imports in copied files to use new paths

# Admin Dashboard - Complete Implementation

## Folder Structure

### Backend
```
backend/
├── migrations/
│   ├── 001_create_tables.sql
│   └── 002_add_is_active_to_products.sql
├── models/
│   ├── product.go (updated with is_active)
│   └── order.go (updated with Payment field)
├── handlers/
│   ├── admin_handler.go (updated with pagination, filters)
│   └── product_handler.go (updated with search, pagination, filters, is_active)
└── cmd/migrate/main.go (updated to sort migrations)
```

### Frontend
```
frontend/
├── app/
│   ├── admin/
│   │   ├── page.tsx (dashboard with stats)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx (table with search, filters, pagination)
│   │   │   ├── new/
│   │   │   │   └── page.tsx (create form)
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx (edit form)
│   │   └── orders/
│   │       ├── page.tsx (table with filters, pagination)
│   │       └── [id]/
│   │           └── page.tsx (order details)
│   └── api/
│       └── admin/
│           ├── login/
│           │   └── route.ts
│           └── logout/
│               └── route.ts
├── lib/
│   ├── admin.ts (admin API client)
│   └── types.ts (updated with is_active, Payment)
└── middleware.ts (protects /admin routes)
```

## Environment Variables

### Backend (.env)
```env
APP_PORT=4000
DB_HOST=localhost
DB_PORT=5432
DB_USER=zaria
DB_PASSWORD=zaria
DB_NAME=zaria
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Setup Commands

### Backend
```bash
cd backend
go mod tidy
go run cmd/migrate/main.go
go run cmd/seed/main.go
go run main.go
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Admin Authentication
```bash
POST /api/admin/auth/login
Body: { "email": "admin@zaria.com", "password": "admin123" }
Response: { "token": "JWT", "admin": { "id": "...", "email": "..." } }
```

### Products (Protected)
```bash
GET /api/admin/products?search=term&page=1&limit=20&is_active=true
GET /api/admin/products/:id
POST /api/admin/products
Body: { "name": "...", "description": "...", "price_cents": 1000, "currency": "usd", "image_url": "...", "stock": 10, "is_active": true }
PUT /api/admin/products/:id
DELETE /api/admin/products/:id
```

### Orders (Protected)
```bash
GET /api/admin/orders?status=pending&page=1&limit=20
GET /api/admin/orders/:id
PATCH /api/admin/orders/:id/status
Body: { "status": "paid" }
```

## cURL Examples

### Admin Login
```bash
curl -X POST http://localhost:4000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zaria.com","password":"admin123"}'
```

### Get Products (with token)
```bash
TOKEN="your-jwt-token"
curl http://localhost:4000/api/admin/products?page=1&limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

### Create Product
```bash
TOKEN="your-jwt-token"
curl -X POST http://localhost:4000/api/admin/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Product",
    "description": "Test description",
    "price_cents": 1999,
    "currency": "usd",
    "image_url": "https://example.com/image.jpg",
    "stock": 100,
    "is_active": true
  }'
```

### Update Product
```bash
TOKEN="your-jwt-token"
PRODUCT_ID="product-uuid"
curl -X PUT http://localhost:4000/api/admin/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Product",
    "description": "Updated description",
    "price_cents": 2499,
    "currency": "usd",
    "image_url": "https://example.com/image.jpg",
    "stock": 50,
    "is_active": true
  }'
```

### Delete Product
```bash
TOKEN="your-jwt-token"
PRODUCT_ID="product-uuid"
curl -X DELETE http://localhost:4000/api/admin/products/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Get Orders
```bash
TOKEN="your-jwt-token"
curl http://localhost:4000/api/admin/orders?status=pending&page=1 \
  -H "Authorization: Bearer $TOKEN"
```

### Update Order Status
```bash
TOKEN="your-jwt-token"
ORDER_ID="order-uuid"
curl -X PATCH http://localhost:4000/api/admin/orders/$ORDER_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"paid"}'
```

## Features Implemented

✅ Secure admin authentication with JWT in httpOnly cookies
✅ Full CRUD for products with validation
✅ Product search, filtering, and pagination
✅ Order management with status filtering and pagination
✅ Order details page with payment status
✅ Dashboard with statistics
✅ Responsive UI with TailwindCSS
✅ Error handling and loading states
✅ Form validation (required fields, positive prices, non-negative stock)

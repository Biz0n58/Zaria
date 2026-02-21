# Zaria - Full-Stack E-Commerce Application

Complete e-commerce application with admin panel, product catalog, shopping cart, and Stripe payment integration.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + TypeScript + TailwindCSS
- **Backend**: Go + Fiber
- **Database**: PostgreSQL
- **Auth**: JWT
- **Payments**: Stripe (Payment Intents + Webhooks)

## Project Structure

```
Zaria/
├── backend/
│   ├── cmd/
│   │   ├── migrate/
│   │   │   └── main.go
│   │   └── seed/
│   │       └── main.go
│   ├── config/
│   │   └── db.go
│   ├── handlers/
│   │   ├── admin_handler.go
│   │   ├── checkout_handler.go
│   │   ├── payment_handler.go
│   │   └── product_handler.go
│   ├── middleware/
│   │   └── jwt.go
│   ├── migrations/
│   │   └── 001_create_tables.sql
│   ├── models/
│   │   ├── admin.go
│   │   ├── order.go
│   │   ├── payment.go
│   │   └── product.go
│   ├── routes/
│   │   └── register.go
│   ├── main.go
│   └── go.mod
├── frontend/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── orders/
│   │   │   │   └── page.tsx
│   │   │   ├── products/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   └── admin/
│   │   │       ├── login/
│   │   │       │   └── route.ts
│   │   │       ├── logout/
│   │   │       │   └── route.ts
│   │   │       └── orders/
│   │   │           └── route.ts
│   │   ├── cart/
│   │   │   └── page.tsx
│   │   ├── checkout/
│   │   │   └── page.tsx
│   │   ├── payment/
│   │   │   ├── success/
│   │   │   │   └── page.tsx
│   │   │   └── failed/
│   │   │       └── page.tsx
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── lib/
│   │   ├── api.ts
│   │   ├── cart.ts
│   │   └── types.ts
│   ├── middleware.ts
│   └── package.json
└── docker-compose.yml
```

## Setup Instructions

### Prerequisites

- Go 1.25+
- Node.js 18+
- PostgreSQL 16+
- Docker (optional, for PostgreSQL)

### Backend Setup

1. **Start PostgreSQL** (using Docker Compose):
   ```bash
   docker-compose up -d
   ```

2. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

3. **Install Go dependencies**:
   ```bash
   go mod tidy
   ```

4. **Create `.env` file** in `backend/` directory:
   ```env
   APP_PORT=4000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=zaria
   DB_PASSWORD=zaria
   DB_NAME=zaria
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

5. **Run migrations**:
   ```bash
   go run cmd/migrate/main.go
   ```

6. **Seed admin user**:
   ```bash
   go run cmd/seed/main.go
   ```
   Default admin credentials:
   - Email: `admin@zaria.com`
   - Password: `admin123`

7. **Start the server**:
   ```bash
   go run main.go
   ```

The backend will run on `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create `.env.local` file** in `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Public Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/checkout` - Create order
- `POST /api/payments/stripe/create-intent` - Create Stripe payment intent
- `POST /api/payments/stripe/webhook` - Stripe webhook handler

### Admin Endpoints (Protected)

- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/orders/:id` - Get order by ID
- `PATCH /api/admin/orders/:id/status` - Update order status
- `GET /api/admin/products` - Get all products (admin)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

## Frontend Routes

### Public Routes

- `/` - Product listing page
- `/product/[id]` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout page
- `/payment/success` - Payment success page
- `/payment/failed` - Payment failed page

### Admin Routes (Protected)

- `/admin/login` - Admin login page
- `/admin` - Admin dashboard
- `/admin/products` - Product management
- `/admin/orders` - Order management

## Testing with cURL/Postman

### Admin Login

```bash
curl -X POST http://localhost:4000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zaria.com","password":"admin123"}'
```

### Create Checkout

```bash
curl -X POST http://localhost:4000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "customer@example.com",
    "items": [
      {"product_id": "product-uuid-here", "qty": 2}
    ]
  }'
```

### Create Payment Intent

```bash
curl -X POST http://localhost:4000/api/payments/stripe/create-intent \
  -H "Content-Type: application/json" \
  -d '{"order_id": "order-uuid-here"}'
```

## Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard
3. Set up a webhook endpoint:
   - URL: `http://localhost:4000/api/payments/stripe/webhook`
   - Events to listen for:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
4. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET` in your backend `.env`

## Notes

- All prices are stored in cents (integer)
- Shipping is free for orders over $50 (5000 cents)
- JWT tokens expire after 24 hours
- Admin tokens are stored in httpOnly cookies
- Cart is stored in localStorage
- Stock is automatically decremented when orders are created

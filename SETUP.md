# Setup Guide - Zaria E-Commerce Application

## Quick Start Commands

### Backend Setup

```bash
cd backend

# Install dependencies
go mod tidy

# Run migrations
go run cmd/migrate/main.go

# Seed admin user
go run cmd/seed/main.go

# Start server
go run main.go
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

### Backend (.env)

Create `backend/.env`:

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

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Database Setup

### Using Docker Compose

```bash
docker-compose up -d
```

### Manual PostgreSQL Setup

1. Create database:
```sql
CREATE DATABASE zaria;
CREATE USER zaria WITH PASSWORD 'zaria';
GRANT ALL PRIVILEGES ON DATABASE zaria TO zaria;
```

2. Run migrations:
```bash
cd backend
go run cmd/migrate/main.go
```

3. Seed admin:
```bash
go run cmd/seed/main.go
```

## Default Admin Credentials

- **Email**: `admin@zaria.com`
- **Password**: `admin123`

## Stripe Configuration

1. Sign up at https://stripe.com
2. Get test API keys from Dashboard → Developers → API keys
3. Set up webhook:
   - Go to Developers → Webhooks
   - Add endpoint: `http://localhost:4000/api/payments/stripe/webhook`
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
   - Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET`

## Testing Endpoints

### Admin Login
```bash
curl -X POST http://localhost:4000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zaria.com","password":"admin123"}'
```

### Get Products
```bash
curl http://localhost:4000/api/products
```

### Create Order
```bash
curl -X POST http://localhost:4000/api/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "customer_email": "test@example.com",
    "items": [
      {"product_id": "YOUR_PRODUCT_UUID", "qty": 1}
    ]
  }'
```

## Troubleshooting

### Backend Issues

- **Database connection error**: Ensure PostgreSQL is running and credentials match `.env`
- **Migration errors**: Check that database exists and user has proper permissions
- **JWT errors**: Ensure `JWT_SECRET` is set and at least 32 characters

### Frontend Issues

- **API connection errors**: Verify `NEXT_PUBLIC_API_BASE_URL` matches backend port
- **Stripe errors**: Ensure `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is set correctly
- **Admin login fails**: Check backend is running and JWT_SECRET is configured

### Common Fixes

1. **go.sum out of sync**: Run `go mod tidy` in backend directory
2. **Port already in use**: Change `APP_PORT` in backend `.env` or kill process on port 4000
3. **CORS errors**: Verify backend CORS allows `http://localhost:3000`

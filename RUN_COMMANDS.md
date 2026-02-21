# Run Commands - Zaria Project

## Prerequisites

1. PostgreSQL running (via Docker Compose or local installation)
2. Go 1.25+ installed
3. Node.js 18+ installed

## Backend Setup

```bash
cd backend

# Install dependencies
go mod tidy

# Run migrations
go run cmd/migrate/main.go

# Seed admin user (email: admin@zaria.com, password: admin123)
go run cmd/seed/main.go

# Start server
go run main.go
```

The backend will run on `http://localhost:4000`

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Verify Everything Works

1. **Backend Health Check:**
   ```bash
   curl http://localhost:4000/health
   ```

2. **Admin Login:**
   - Navigate to `http://localhost:3000/admin/login`
   - Login with: `admin@zaria.com` / `admin123`

3. **Product CRUD:**
   - Go to `/admin/products`
   - Create, edit, delete products

4. **Orders Management:**
   - Go to `/admin/orders`
   - View orders and update status

5. **Public Flow:**
   - Browse products at `/`
   - Add to cart
   - Checkout at `/checkout`
   - Complete Stripe payment

## Environment Variables

### Backend (.env)
Copy `backend/.env.example` to `backend/.env` and fill in:
- `JWT_SECRET` - At least 32 characters
- `STRIPE_SECRET_KEY` - From Stripe Dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe Webhook settings

### Frontend (.env.local)
Copy `frontend/.env.example` to `frontend/.env.local` and fill in:
- `NEXT_PUBLIC_API_BASE_URL` - Backend URL (default: http://localhost:4000)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Stripe Dashboard

## Database Setup (Docker)

```bash
docker-compose up -d
```

This starts PostgreSQL on port 5432 with:
- User: `zaria`
- Password: `zaria`
- Database: `zaria`

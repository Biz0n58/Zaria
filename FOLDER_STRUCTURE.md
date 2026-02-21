# Complete Folder Structure

## Backend Structure

```
backend/
├── cmd/
│   ├── migrate/
│   │   └── main.go
│   └── seed/
│       └── main.go
├── config/
│   └── db.go
├── handlers/
│   ├── admin_handler.go
│   ├── checkout_handler.go
│   ├── payment_handler.go
│   └── product_handler.go
├── middleware/
│   └── jwt.go
├── migrations/
│   └── 001_create_tables.sql
├── models/
│   ├── admin.go
│   ├── order.go
│   ├── payment.go
│   └── product.go
├── routes/
│   └── register.go
├── .env.example
├── go.mod
├── go.sum
└── main.go
```

## Frontend Structure

```
frontend/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── orders/
│   │   │   └── page.tsx
│   │   ├── products/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── api/
│   │   └── admin/
│   │       ├── login/
│   │       │   └── route.ts
│   │       ├── logout/
│   │       │   └── route.ts
│   │       └── orders/
│   │           └── route.ts
│   ├── cart/
│   │   └── page.tsx
│   ├── checkout/
│   │   └── page.tsx
│   ├── payment/
│   │   ├── success/
│   │   │   └── page.tsx
│   │   └── failed/
│   │       └── page.tsx
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── api.ts
│   ├── cart.ts
│   └── types.ts
├── middleware.ts
├── .env.example
├── package.json
├── package-lock.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.ts
```

## Root Files

```
Zaria/
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
└── FOLDER_STRUCTURE.md
```

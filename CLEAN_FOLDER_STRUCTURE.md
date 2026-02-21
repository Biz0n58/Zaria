# Clean Folder Structure - Zaria

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
│   ├── 001_create_tables.sql
│   └── 002_add_is_active_to_products.sql
├── models/
│   ├── admin.go
│   ├── order.go
│   ├── payment.go
│   └── product.go
├── routes/
│   └── register.go
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
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   └── products/
│   │       ├── [id]/
│   │       │   └── edit/
│   │       │       └── page.tsx
│   │       ├── new/
│   │       │   └── page.tsx
│   │       └── page.tsx
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
│   │   ├── failed/
│   │   │   └── page.tsx
│   │   └── success/
│   │       └── page.tsx
│   ├── product/
│   │   └── [id]/
│   │       └── page.tsx
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── admin.ts
│   ├── api.ts
│   ├── cart.ts
│   └── types.ts
├── public/
│   └── image/
│       └── logo.jpg
├── middleware.ts
├── next-env.d.ts
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── tailwind.config.js
├── tsconfig.json
└── eslint.config.mjs
```

## Root Files

```
Zaria/
├── backend/
├── frontend/
├── docker-compose.yml
├── README.md
├── SETUP.md
├── ADMIN_DASHBOARD.md
├── FOLDER_STRUCTURE.md
├── CLEANUP_REPORT.md
└── CLEAN_FOLDER_STRUCTURE.md
```

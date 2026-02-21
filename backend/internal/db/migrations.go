package db

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func RunMigrations(pool *pgxpool.Pool) error {
	ctx := context.Background()

	migrations := []string{
		`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

		`CREATE TABLE IF NOT EXISTS admins (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT,
			created_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS products (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			name TEXT NOT NULL,
			description TEXT,
			price_cents INTEGER NOT NULL,
			currency TEXT NOT NULL DEFAULT 'usd',
			image_url TEXT,
			stock INTEGER NOT NULL DEFAULT 0,
			is_active BOOLEAN NOT NULL DEFAULT true,
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS orders (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id UUID REFERENCES users(id),
			customer_email TEXT NOT NULL,
			status TEXT NOT NULL DEFAULT 'pending',
			subtotal_cents INTEGER NOT NULL,
			shipping_cents INTEGER NOT NULL DEFAULT 0,
			total_cents INTEGER NOT NULL,
			currency TEXT NOT NULL DEFAULT 'usd',
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS order_items (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
			product_id UUID NOT NULL REFERENCES products(id),
			name_snapshot TEXT NOT NULL,
			price_cents_snapshot INTEGER NOT NULL,
			qty INTEGER NOT NULL
		)`,

		`CREATE TABLE IF NOT EXISTS payments (
			id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
			provider TEXT NOT NULL,
			provider_ref TEXT,
			status TEXT NOT NULL DEFAULT 'pending',
			amount_cents INTEGER NOT NULL,
			currency TEXT NOT NULL DEFAULT 'usd',
			created_at TIMESTAMPTZ DEFAULT NOW(),
			updated_at TIMESTAMPTZ DEFAULT NOW()
		)`,

		`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
		`CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email)`,
		`CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active)`,
		`CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON payments(provider_ref)`,
	}

	for _, migration := range migrations {
		if _, err := pool.Exec(ctx, migration); err != nil {
			return fmt.Errorf("migration failed: %w", err)
		}
	}

	return nil
}

func SeedAdmin(pool *pgxpool.Pool, email, password string) error {
	ctx := context.Background()

	if email == "" || password == "" {
		return fmt.Errorf("admin email or password not provided")
	}

	var exists bool
	err := pool.QueryRow(ctx, "SELECT EXISTS(SELECT 1 FROM admins WHERE email = $1)", email).Scan(&exists)
	if err != nil {
		return err
	}

	if exists {
		return fmt.Errorf("admin already exists")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	_, err = pool.Exec(ctx, "INSERT INTO admins (email, password_hash) VALUES ($1, $2)", email, string(hash))
	if err != nil {
		return err
	}

	return nil
}

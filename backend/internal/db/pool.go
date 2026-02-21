package db

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
)

func Connect(databaseURL string) (*pgxpool.Pool, error) {
	if databaseURL == "" {
		host := os.Getenv("DB_HOST")
		port := os.Getenv("DB_PORT")
		user := os.Getenv("DB_USER")
		pass := os.Getenv("DB_PASSWORD")
		name := os.Getenv("DB_NAME")
		databaseURL = fmt.Sprintf("postgres://%s:%s@%s:%s/%s", user, pass, host, port, name)
	}

	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}

	cfg.MaxConns = 10
	cfg.MinConns = 2
	cfg.MaxConnIdleTime = 5 * time.Minute

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}

	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}

	return pool, nil
}

func RunMigrations(db *pgxpool.Pool) error {
	migrationsDir := filepath.Join("internal", "migrations")
	files, err := filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
	if err != nil {
		migrationsDir = "migrations"
		files, err = filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
		if err != nil {
			return fmt.Errorf("failed to read migrations directory: %w", err)
		}
	}

	sort.Strings(files)

	ctx := context.Background()
	for _, file := range files {
		sql, err := os.ReadFile(file)
		if err != nil {
			return fmt.Errorf("failed to read migration file %s: %w", file, err)
		}

		_, err = db.Exec(ctx, string(sql))
		if err != nil {
			return fmt.Errorf("failed to execute migration %s: %w", file, err)
		}
	}

	return nil
}

func SeedAdmin(db *pgxpool.Pool, email, password string) error {
	if email == "" {
		email = "admin@zaria.com"
	}
	if password == "" {
		password = "admin123"
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	ctx := context.Background()
	_, err = db.Exec(ctx,
		"INSERT INTO admins (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password_hash = $2",
		email, string(hashedPassword),
	)
	if err != nil {
		return fmt.Errorf("failed to seed admin: %w", err)
	}

	return nil
}

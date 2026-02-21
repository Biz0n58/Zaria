package main

import (
	"context"
	"log"
	"os"
	"path/filepath"
	"sort"

	"github.com/Biz0n58/Zaria/backend/config"
)

func main() {
	_ = os.Setenv("DB_HOST", getEnv("DB_HOST", "localhost"))
	_ = os.Setenv("DB_PORT", getEnv("DB_PORT", "5432"))
	_ = os.Setenv("DB_USER", getEnv("DB_USER", "zaria"))
	_ = os.Setenv("DB_PASSWORD", getEnv("DB_PASSWORD", "zaria"))
	_ = os.Setenv("DB_NAME", getEnv("DB_NAME", "zaria"))

	db, err := config.NewDBPool()
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	migrationsDir := filepath.Join("..", "..", "migrations")
	files, err := filepath.Glob(filepath.Join(migrationsDir, "*.sql"))
	if err != nil {
		log.Fatal("Failed to read migrations directory:", err)
	}

	sort.Strings(files)

	for _, file := range files {
		log.Printf("Running migration: %s", file)
		sql, err := os.ReadFile(file)
		if err != nil {
			log.Fatal("Failed to read migration file:", err)
		}

		_, err = db.Exec(context.Background(), string(sql))
		if err != nil {
			log.Fatal("Failed to execute migration:", err)
		}
		log.Printf("Migration completed: %s", file)
	}

	log.Println("All migrations completed successfully")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

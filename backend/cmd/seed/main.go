package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/Biz0n58/Zaria/backend/config"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"
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

	email := "admin@zaria.com"
	password := "admin123"

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	var existingID string
	err = db.QueryRow(context.Background(), "SELECT id FROM admins WHERE email = $1", email).Scan(&existingID)
	if err == nil {
		log.Printf("Admin with email %s already exists, updating password...", email)
		_, err = db.Exec(context.Background(), "UPDATE admins SET password_hash = $1 WHERE email = $2", hashedPassword, email)
		if err != nil {
			log.Fatal("Failed to update admin:", err)
		}
		log.Println("Admin password updated successfully")
		return
	}

	_, err = db.Exec(
		context.Background(),
		"INSERT INTO admins (email, password_hash) VALUES ($1, $2) ON CONFLICT (email) DO UPDATE SET password_hash = $2",
		email, hashedPassword,
	)
	if err != nil {
		log.Fatal("Failed to create admin:", err)
	}

	log.Printf("Admin created successfully: %s / %s", email, password)
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

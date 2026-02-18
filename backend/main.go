package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"github.com/Biz0n58/Zaria/backend/config"
	"github.com/Biz0n58/Zaria/backend/routes"
)

func main() {
	_ = godotenv.Load()

	app := fiber.New()

	app.Use(logger.New())

	// Database connection
	db, err := config.NewDBPool()
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status": "ok",
		})
	})

	// Register routes
	routes.Register(app, db)

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "3000"
	}

	log.Println("Server running on port", port)
	log.Fatal(app.Listen(":" + port))
}

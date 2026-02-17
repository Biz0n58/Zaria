package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
	"github.com/joho/godotenv"

	"shop-backend/routes"
)

func main() {
	_ = godotenv.Load()

	app := fiber.New()
	routes.RegisterAIRoutes(app)

	log.Fatal(app.Listen(":8080"))
}

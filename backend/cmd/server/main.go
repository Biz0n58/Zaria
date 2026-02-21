package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
	"github.com/zaria/backend/internal/db"
	"github.com/zaria/backend/internal/handlers"
	"github.com/zaria/backend/internal/middleware"
	"github.com/zaria/backend/internal/services"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	database, err := db.Connect(os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	if err := db.RunMigrations(database); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	if err := db.SeedAdmin(database, os.Getenv("ADMIN_EMAIL"), os.Getenv("ADMIN_PASSWORD")); err != nil {
		log.Printf("Admin seed note: %v", err)
	}

	stripeService := services.NewStripeService(os.Getenv("STRIPE_SECRET_KEY"), os.Getenv("STRIPE_WEBHOOK_SECRET"))
	authService := services.NewAuthService(os.Getenv("JWT_SECRET"))

	h := handlers.NewHandler(database, stripeService, authService)

	app := fiber.New(fiber.Config{
		ErrorHandler: handlers.ErrorHandler,
	})

	app.Use(recover.New())
	app.Use(logger.New())

	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000,http://localhost:3001"
	}

	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: true,
	}))

	api := app.Group("/api")

	api.Post("/admin/auth/login", h.AdminLogin)

	api.Post("/auth/register", h.UserRegister)
	api.Post("/auth/login", h.UserLogin)

	api.Get("/products", h.GetPublicProducts)
	api.Get("/products/:id", h.GetPublicProduct)

	api.Post("/checkout", h.CreateCheckout)

	api.Get("/orders/:id", h.GetOrder)

	api.Post("/payments/stripe/create-intent", h.CreatePaymentIntent)
	api.Post("/payments/stripe/webhook", h.StripeWebhook)

	adminApi := api.Group("/admin", middleware.JWTAuth(authService, "admin"))
	adminApi.Get("/products", h.AdminGetProducts)
	adminApi.Post("/products", h.AdminCreateProduct)
	adminApi.Get("/products/:id", h.AdminGetProduct)
	adminApi.Put("/products/:id", h.AdminUpdateProduct)
	adminApi.Delete("/products/:id", h.AdminDeleteProduct)

	adminApi.Get("/orders", h.AdminGetOrders)
	adminApi.Get("/orders/:id", h.AdminGetOrder)
	adminApi.Put("/orders/:id/status", h.AdminUpdateOrderStatus)

	adminApi.Get("/stats", h.AdminGetStats)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

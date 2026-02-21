package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Biz0n58/Zaria/backend/handlers"
	"github.com/Biz0n58/Zaria/backend/middleware"
)

func Register(app *fiber.App, db *pgxpool.Pool) {
	adminHandler := handlers.NewAdminHandler(db)
	productHandler := handlers.NewProductHandler(db)
	checkoutHandler := handlers.NewCheckoutHandler(db)
	paymentHandler := handlers.NewPaymentHandler(db)

	app.Post("/api/admin/auth/login", adminHandler.Login)

	admin := app.Group("/api/admin", middleware.Protected)
	admin.Get("/orders", adminHandler.GetOrders)
	admin.Get("/orders/:id", adminHandler.GetOrder)
	admin.Patch("/orders/:id/status", adminHandler.UpdateOrderStatus)
	admin.Get("/products", productHandler.GetProducts)
	admin.Post("/products", productHandler.CreateProduct)
	admin.Put("/products/:id", productHandler.UpdateProduct)
	admin.Delete("/products/:id", productHandler.DeleteProduct)

	app.Get("/api/products", productHandler.GetPublicProducts)
	app.Get("/api/products/:id", productHandler.GetProduct)

	app.Post("/api/checkout", checkoutHandler.CreateOrder)
	app.Post("/api/payments/stripe/create-intent", paymentHandler.CreateStripeIntent)
	app.Post("/api/payments/stripe/webhook", paymentHandler.StripeWebhook)
}

package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Biz0n58/Zaria/backend/handlers"
	"github.com/Biz0n58/Zaria/backend/middleware"
)

func Register(app *fiber.App, db *pgxpool.Pool) {
	// existing admin routes (login + orders)
	AdminRoutes(app, db)

	ph := handlers.NewProductHandler(db)

	// public routes
	app.Get("/api/products", ph.GetProducts)
	app.Get("/api/products/:id", ph.GetProduct)

	// protected admin routes
	admin := app.Group("/api/admin", middleware.Protected)
	admin.Post("/products", ph.CreateProduct)
	admin.Put("/products/:id", ph.UpdateProduct)
	admin.Delete("/products/:id", ph.DeleteProduct)
}

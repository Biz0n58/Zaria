package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/Biz0n58/Zaria/backend/handlers"
	"github.com/Biz0n58/Zaria/backend/middleware"
)

func AdminRoutes(app *fiber.App, db *pgxpool.Pool) {
	h := handlers.NewAdminHandler(db)

	admin := app.Group("/api/admin")

	admin.Post("/login", h.Login)
	admin.Get("/orders", middleware.Protected, h.GetOrders)
}

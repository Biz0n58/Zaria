package handlers

import (
	"github.com/Biz0n58/Zaria/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type CheckoutHandler struct {
	DB *pgxpool.Pool
}

func NewCheckoutHandler(db *pgxpool.Pool) *CheckoutHandler {
	return &CheckoutHandler{DB: db}
}

type CheckoutItem struct {
	ProductID string `json:"product_id"`
	Qty       int    `json:"qty"`
}

type CheckoutRequest struct {
	UserID        *string         `json:"user_id,omitempty"`
	CustomerEmail string          `json:"customer_email"`
	Items         []CheckoutItem  `json:"items"`
}

type CheckoutResponse struct {
	OrderID    string `json:"order_id"`
	TotalCents int    `json:"total_cents"`
	Currency   string `json:"currency"`
}

func (h *CheckoutHandler) CreateOrder(c *fiber.Ctx) error {
	var req CheckoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	if len(req.Items) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "items required"})
	}

	tx, err := h.DB.Begin(c.Context())
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to start transaction"})
	}
	defer tx.Rollback(c.Context())

	subtotalCents := 0
	orderItems := []struct {
		productID uuid.UUID
		name      string
		price     int
		qty       int
	}{}

	for _, item := range req.Items {
		productUUID, err := uuid.Parse(item.ProductID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid product id"})
		}

		var product models.Product
		err = tx.QueryRow(
			c.Context(),
			`SELECT id, name, price_cents, stock FROM products WHERE id = $1 FOR UPDATE`,
			productUUID,
		).Scan(&product.ID, &product.Name, &product.PriceCents, &product.Stock)
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "product not found"})
		}

		if product.Stock < item.Qty {
			return c.Status(400).JSON(fiber.Map{"error": "insufficient stock"})
		}

		itemTotal := product.PriceCents * item.Qty
		subtotalCents += itemTotal

		orderItems = append(orderItems, struct {
			productID uuid.UUID
			name      string
			price     int
			qty       int
		}{
			productID: product.ID,
			name:      product.Name,
			price:     product.PriceCents,
			qty:       item.Qty,
		})

		_, err = tx.Exec(
			c.Context(),
			`UPDATE products SET stock = stock - $1 WHERE id = $2`,
			item.Qty, product.ID,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to update stock"})
		}
	}

	shippingCents := 0
	if subtotalCents < 5000 {
		shippingCents = 500
	}
	totalCents := subtotalCents + shippingCents

	var userID *uuid.UUID
	if req.UserID != nil {
		parsedUserID, err := uuid.Parse(*req.UserID)
		if err == nil {
			userID = &parsedUserID
		}
	}

	var orderID uuid.UUID
	if userID != nil {
		err = tx.QueryRow(
			c.Context(),
			`INSERT INTO orders (user_id, customer_email, status, subtotal_cents, shipping_cents, total_cents, currency) 
			 VALUES ($1, $2, $3, $4, $5, $6, $7) 
			 RETURNING id`,
			userID, req.CustomerEmail, "pending", subtotalCents, shippingCents, totalCents, "usd",
		).Scan(&orderID)
	} else {
		err = tx.QueryRow(
			c.Context(),
			`INSERT INTO orders (customer_email, status, subtotal_cents, shipping_cents, total_cents, currency) 
			 VALUES ($1, $2, $3, $4, $5, $6) 
			 RETURNING id`,
			req.CustomerEmail, "pending", subtotalCents, shippingCents, totalCents, "usd",
		).Scan(&orderID)
	}
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create order"})
	}

	for _, item := range orderItems {
		_, err = tx.Exec(
			c.Context(),
			`INSERT INTO order_items (order_id, product_id, name_snapshot, price_cents_snapshot, qty) 
			 VALUES ($1, $2, $3, $4, $5)`,
			orderID, item.productID, item.name, item.price, item.qty,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to create order items"})
		}
	}

	if err = tx.Commit(c.Context()); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to commit transaction"})
	}

	return c.JSON(CheckoutResponse{
		OrderID:    orderID.String(),
		TotalCents: totalCents,
		Currency:   "usd",
	})
}

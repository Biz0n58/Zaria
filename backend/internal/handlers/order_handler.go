package handlers

import (
	"github.com/Biz0n58/Zaria/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type OrderHandler struct {
	DB *pgxpool.Pool
}

func NewOrderHandler(db *pgxpool.Pool) *OrderHandler {
	return &OrderHandler{DB: db}
}

func (h *OrderHandler) GetOrder(c *fiber.Ctx) error {
	orderID := c.Params("id")
	orderUUID, err := uuid.Parse(orderID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid order id"})
	}

	var order models.Order
	err = h.DB.QueryRow(
		c.Context(),
		`SELECT id, user_id, customer_email, status, subtotal_cents, shipping_cents, total_cents, currency, created_at, updated_at 
		 FROM orders WHERE id = $1`,
		orderUUID,
	).Scan(
		&order.ID, &order.UserID, &order.CustomerEmail, &order.Status, &order.SubtotalCents,
		&order.ShippingCents, &order.TotalCents, &order.Currency, &order.CreatedAt, &order.UpdatedAt,
	)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "order not found"})
	}

	rows, err := h.DB.Query(
		c.Context(),
		`SELECT id, order_id, product_id, name_snapshot, price_cents_snapshot, qty 
		 FROM order_items WHERE order_id = $1`,
		orderUUID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var item models.OrderItem
			rows.Scan(
				&item.ID, &item.OrderID, &item.ProductID, &item.NameSnapshot,
				&item.PriceCentsSnapshot, &item.Qty,
			)
			order.Items = append(order.Items, item)
		}
	}

	var payment models.Payment
	err = h.DB.QueryRow(
		c.Context(),
		`SELECT id, order_id, provider, provider_ref, status, amount_cents, currency, created_at, updated_at 
		 FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1`,
		orderUUID,
	).Scan(
		&payment.ID, &payment.OrderID, &payment.Provider, &payment.ProviderRef,
		&payment.Status, &payment.AmountCents, &payment.Currency, &payment.CreatedAt, &payment.UpdatedAt,
	)
	if err == nil {
		order.Payment = &payment
	}

	return c.JSON(order)
}

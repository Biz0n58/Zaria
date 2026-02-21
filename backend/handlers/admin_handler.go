package handlers

import (
	"strconv"

	"github.com/Biz0n58/Zaria/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AdminHandler struct {
	DB *pgxpool.Pool
}

func NewAdminHandler(db *pgxpool.Pool) *AdminHandler {
	return &AdminHandler{DB: db}
}

type OrdersResponse struct {
	Orders []models.Order `json:"orders"`
	Total  int            `json:"total"`
	Page   int            `json:"page"`
	Limit  int            `json:"limit"`
}

func (h *AdminHandler) GetOrders(c *fiber.Ctx) error {
	status := c.Query("status", "")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}
	offset := (page - 1) * limit

	query := `SELECT id, customer_email, status, subtotal_cents, shipping_cents, total_cents, currency, created_at, updated_at 
		 FROM orders WHERE 1=1`
	args := []interface{}{}
	argPos := 1

	if status != "" {
		query += ` AND status = $` + strconv.Itoa(argPos)
		args = append(args, status)
		argPos++
	}

	query += ` ORDER BY created_at DESC LIMIT $` + strconv.Itoa(argPos) + ` OFFSET $` + strconv.Itoa(argPos+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(c.Context(), query, args...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch orders"})
	}
	defer rows.Close()

	orders := []models.Order{}
	for rows.Next() {
		var o models.Order
		err := rows.Scan(
			&o.ID, &o.CustomerEmail, &o.Status, &o.SubtotalCents,
			&o.ShippingCents, &o.TotalCents, &o.Currency, &o.CreatedAt, &o.UpdatedAt,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to scan order"})
		}
		orders = append(orders, o)
	}

	countQuery := `SELECT COUNT(*) FROM orders WHERE 1=1`
	countArgs := []interface{}{}
	countArgPos := 1

	if status != "" {
		countQuery += ` AND status = $` + strconv.Itoa(countArgPos)
		countArgs = append(countArgs, status)
		countArgPos++
	}

	var total int
	err = h.DB.QueryRow(c.Context(), countQuery, countArgs...).Scan(&total)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to count orders"})
	}

	return c.JSON(OrdersResponse{
		Orders: orders,
		Total:  total,
		Page:   page,
		Limit:  limit,
	})
}

func (h *AdminHandler) GetOrder(c *fiber.Ctx) error {
	orderID := c.Params("id")
	orderUUID, err := uuid.Parse(orderID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid order id"})
	}

	var order models.Order
	err = h.DB.QueryRow(
		c.Context(),
		`SELECT id, customer_email, status, subtotal_cents, shipping_cents, total_cents, currency, created_at, updated_at 
		 FROM orders WHERE id = $1`,
		orderUUID,
	).Scan(
		&order.ID, &order.CustomerEmail, &order.Status, &order.SubtotalCents,
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

type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

func (h *AdminHandler) UpdateOrderStatus(c *fiber.Ctx) error {
	orderID := c.Params("id")
	orderUUID, err := uuid.Parse(orderID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid order id"})
	}

	var req UpdateOrderStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	validStatuses := map[string]bool{
		"pending": true, "paid": true, "failed": true, "shipped": true, "cancelled": true,
	}
	if !validStatuses[req.Status] {
		return c.Status(400).JSON(fiber.Map{"error": "invalid status"})
	}

	_, err = h.DB.Exec(
		c.Context(),
		`UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
		req.Status, orderUUID,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to update order"})
	}

	return c.JSON(fiber.Map{"message": "order status updated"})
}

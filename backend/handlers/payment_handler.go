package handlers

import (
	"encoding/json"
	"os"

	"github.com/Biz0n58/Zaria/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stripe/stripe-go/v78"
	"github.com/stripe/stripe-go/v78/paymentintent"
	"github.com/stripe/stripe-go/v78/webhook"
)

type PaymentHandler struct {
	DB *pgxpool.Pool
}

func NewPaymentHandler(db *pgxpool.Pool) *PaymentHandler {
	return &PaymentHandler{DB: db}
}

type CreateIntentRequest struct {
	OrderID string `json:"order_id"`
}

type CreateIntentResponse struct {
	ClientSecret      string `json:"client_secret"`
	PaymentIntentID   string `json:"payment_intent_id"`
}

func (h *PaymentHandler) CreateStripeIntent(c *fiber.Ctx) error {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	if stripe.Key == "" {
		return c.Status(500).JSON(fiber.Map{"error": "stripe not configured"})
	}

	var req CreateIntentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	orderUUID, err := uuid.Parse(req.OrderID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid order id"})
	}

	var order models.Order
	err = h.DB.QueryRow(
		c.Context(),
		`SELECT id, total_cents, currency, status FROM orders WHERE id = $1`,
		orderUUID,
	).Scan(&order.ID, &order.TotalCents, &order.Currency, &order.Status)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "order not found"})
	}

	if order.Status != "pending" {
		return c.Status(400).JSON(fiber.Map{"error": "order not in pending status"})
	}

	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(int64(order.TotalCents)),
		Currency: stripe.String(order.Currency),
		Metadata: map[string]string{
			"order_id": order.ID.String(),
		},
	}

	pi, err := paymentintent.New(params)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create payment intent"})
	}

	var paymentID uuid.UUID
	err = h.DB.QueryRow(
		c.Context(),
		`INSERT INTO payments (order_id, provider, provider_ref, status, amount_cents, currency) 
		 VALUES ($1, $2, $3, $4, $5, $6) 
		 RETURNING id`,
		order.ID, "stripe", pi.ID, "pending", order.TotalCents, order.Currency,
	).Scan(&paymentID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to save payment"})
	}

	return c.JSON(CreateIntentResponse{
		ClientSecret:    pi.ClientSecret,
		PaymentIntentID: pi.ID,
	})
}

func (h *PaymentHandler) StripeWebhook(c *fiber.Ctx) error {
	payload := c.Body()
	sigHeader := c.Get("Stripe-Signature")
	endpointSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")

	event, err := webhook.ConstructEvent(payload, sigHeader, endpointSecret)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid signature"})
	}

	switch event.Type {
	case "payment_intent.succeeded":
		var pi stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
		}

		orderID := pi.Metadata["order_id"]
		if orderID == "" {
			return c.Status(400).JSON(fiber.Map{"error": "order_id missing"})
		}

		orderUUID, err := uuid.Parse(orderID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid order_id"})
		}

		_, err = h.DB.Exec(
			c.Context(),
			`UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE provider_ref = $2`,
			"succeeded", pi.ID,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to update payment"})
		}

		_, err = h.DB.Exec(
			c.Context(),
			`UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
			"paid", orderUUID,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to update order"})
		}

	case "payment_intent.payment_failed":
		var pi stripe.PaymentIntent
		if err := json.Unmarshal(event.Data.Raw, &pi); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
		}

		orderID := pi.Metadata["order_id"]
		if orderID == "" {
			return c.Status(400).JSON(fiber.Map{"error": "order_id missing"})
		}

		orderUUID, err := uuid.Parse(orderID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid order_id"})
		}

		_, err = h.DB.Exec(
			c.Context(),
			`UPDATE payments SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE provider_ref = $2`,
			"failed", pi.ID,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to update payment"})
		}

		_, err = h.DB.Exec(
			c.Context(),
			`UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
			"failed", orderUUID,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to update order"})
		}
	}

	return c.SendStatus(200)
}

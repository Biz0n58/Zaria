package models

import (
	"time"

	"github.com/google/uuid"
)

type Order struct {
	ID           uuid.UUID    `json:"id"`
	CustomerEmail string      `json:"customer_email"`
	Status       string       `json:"status"`
	SubtotalCents int         `json:"subtotal_cents"`
	ShippingCents int         `json:"shipping_cents"`
	TotalCents   int          `json:"total_cents"`
	Currency     string       `json:"currency"`
	Items        []OrderItem  `json:"items,omitempty"`
	Payment      *Payment     `json:"payment,omitempty"`
	CreatedAt    time.Time    `json:"created_at"`
	UpdatedAt    time.Time    `json:"updated_at"`
}

type OrderItem struct {
	ID                 uuid.UUID `json:"id"`
	OrderID            uuid.UUID `json:"order_id"`
	ProductID          uuid.UUID `json:"product_id"`
	NameSnapshot       string    `json:"name_snapshot"`
	PriceCentsSnapshot int       `json:"price_cents_snapshot"`
	Qty                int       `json:"qty"`
}

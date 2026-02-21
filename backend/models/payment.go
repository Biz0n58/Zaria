package models

import (
	"time"

	"github.com/google/uuid"
)

type Payment struct {
	ID          uuid.UUID `json:"id"`
	OrderID     uuid.UUID `json:"order_id"`
	Provider    string    `json:"provider"`
	ProviderRef string    `json:"provider_ref"`
	Status      string    `json:"status"`
	AmountCents int       `json:"amount_cents"`
	Currency    string    `json:"currency"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

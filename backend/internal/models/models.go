package models

import (
	"time"

	"github.com/google/uuid"
)

type Admin struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type User struct {
	ID           uuid.UUID `json:"id"`
	Email        string    `json:"email"`
	PasswordHash *string   `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

type Product struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	PriceCents  int       `json:"price_cents"`
	Currency    string    `json:"currency"`
	ImageURL    *string   `json:"image_url"`
	Stock       int       `json:"stock"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Order struct {
	ID            uuid.UUID    `json:"id"`
	UserID        *uuid.UUID   `json:"user_id"`
	CustomerEmail string       `json:"customer_email"`
	Status        string       `json:"status"`
	SubtotalCents int          `json:"subtotal_cents"`
	ShippingCents int          `json:"shipping_cents"`
	TotalCents    int          `json:"total_cents"`
	Currency      string       `json:"currency"`
	CreatedAt     time.Time    `json:"created_at"`
	UpdatedAt     time.Time    `json:"updated_at"`
	Items         []OrderItem  `json:"items,omitempty"`
	Payments      []Payment    `json:"payments,omitempty"`
}

type OrderItem struct {
	ID                 uuid.UUID `json:"id"`
	OrderID            uuid.UUID `json:"order_id"`
	ProductID          uuid.UUID `json:"product_id"`
	NameSnapshot       string    `json:"name_snapshot"`
	PriceCentsSnapshot int       `json:"price_cents_snapshot"`
	Qty                int       `json:"qty"`
}

type Payment struct {
	ID          uuid.UUID `json:"id"`
	OrderID     uuid.UUID `json:"order_id"`
	Provider    string    `json:"provider"`
	ProviderRef *string   `json:"provider_ref"`
	Status      string    `json:"status"`
	AmountCents int       `json:"amount_cents"`
	Currency    string    `json:"currency"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type AdminLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type AdminLoginResponse struct {
	Token string `json:"token"`
	Admin Admin  `json:"admin"`
}

type UserRegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserLoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserAuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type CreateProductRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	PriceCents  int     `json:"price_cents"`
	Currency    string  `json:"currency"`
	ImageURL    *string `json:"image_url"`
	Stock       int     `json:"stock"`
	IsActive    bool    `json:"is_active"`
}

type UpdateProductRequest struct {
	Name        *string `json:"name"`
	Description *string `json:"description"`
	PriceCents  *int    `json:"price_cents"`
	Currency    *string `json:"currency"`
	ImageURL    *string `json:"image_url"`
	Stock       *int    `json:"stock"`
	IsActive    *bool   `json:"is_active"`
}

type CheckoutItem struct {
	ProductID string `json:"product_id"`
	Qty       int    `json:"qty"`
}

type CheckoutRequest struct {
	CustomerEmail string         `json:"customer_email"`
	Items         []CheckoutItem `json:"items"`
}

type CheckoutResponse struct {
	OrderID    string `json:"order_id"`
	TotalCents int    `json:"total_cents"`
	Currency   string `json:"currency"`
}

type CreatePaymentIntentRequest struct {
	OrderID string `json:"order_id"`
}

type CreatePaymentIntentResponse struct {
	ClientSecret    string `json:"client_secret"`
	PaymentIntentID string `json:"payment_intent_id"`
}

type ProductsListResponse struct {
	Products   []Product `json:"products"`
	Total      int       `json:"total"`
	Page       int       `json:"page"`
	Limit      int       `json:"limit"`
	TotalPages int       `json:"total_pages"`
}

type OrdersListResponse struct {
	Orders     []Order `json:"orders"`
	Total      int     `json:"total"`
	Page       int     `json:"page"`
	Limit      int     `json:"limit"`
	TotalPages int     `json:"total_pages"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status"`
}

type StatsResponse struct {
	TotalOrders   int `json:"total_orders"`
	TotalRevenue  int `json:"total_revenue"`
	TotalProducts int `json:"total_products"`
	PendingOrders int `json:"pending_orders"`
}

package handlers

import (
	"context"
	"io"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stripe/stripe-go/v76"
	"github.com/zaria/backend/internal/models"
	"github.com/zaria/backend/internal/services"
	"github.com/zaria/backend/internal/utils"
	"golang.org/x/crypto/bcrypt"
)

type Handler struct {
	db            *pgxpool.Pool
	stripeService *services.StripeService
	authService   *services.AuthService
}

func NewHandler(db *pgxpool.Pool, stripeService *services.StripeService, authService *services.AuthService) *Handler {
	return &Handler{
		db:            db,
		stripeService: stripeService,
		authService:   authService,
	}
}

func ErrorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	if e, ok := err.(*fiber.Error); ok {
		code = e.Code
	}
	return c.Status(code).JSON(fiber.Map{
		"error": err.Error(),
	})
}

func (h *Handler) AdminLogin(c *fiber.Ctx) error {
	var req models.AdminLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	var admin models.Admin
	err := h.db.QueryRow(context.Background(),
		"SELECT id, email, password_hash, created_at FROM admins WHERE email = $1",
		req.Email,
	).Scan(&admin.ID, &admin.Email, &admin.PasswordHash, &admin.CreatedAt)

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(admin.PasswordHash), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	token, err := h.authService.GenerateToken(admin.ID, admin.Email, "admin")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate token",
		})
	}

	return c.JSON(models.AdminLoginResponse{
		Token: token,
		Admin: admin,
	})
}

func (h *Handler) UserRegister(c *fiber.Ctx) error {
	var req models.UserRegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "email and password are required",
		})
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to hash password",
		})
	}

	var user models.User
	err = h.db.QueryRow(context.Background(),
		"INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
		req.Email, string(hash),
	).Scan(&user.ID, &user.Email, &user.CreatedAt)

	if err != nil {
		if strings.Contains(err.Error(), "unique") {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "email already exists",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create user",
		})
	}

	token, err := h.authService.GenerateToken(user.ID, user.Email, "user")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate token",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(models.UserAuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *Handler) UserLogin(c *fiber.Ctx) error {
	var req models.UserLoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	var user models.User
	err := h.db.QueryRow(context.Background(),
		"SELECT id, email, password_hash, created_at FROM users WHERE email = $1",
		req.Email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.CreatedAt)

	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	if user.PasswordHash == nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	if err := bcrypt.CompareHashAndPassword([]byte(*user.PasswordHash), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "invalid credentials",
		})
	}

	token, err := h.authService.GenerateToken(user.ID, user.Email, "user")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to generate token",
		})
	}

	return c.JSON(models.UserAuthResponse{
		Token: token,
		User:  user,
	})
}

func (h *Handler) GetPublicProducts(c *fiber.Ctx) error {
	rows, err := h.db.Query(context.Background(),
		`SELECT id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at 
		FROM products WHERE is_active = true ORDER BY created_at DESC`,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch products",
		})
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.Currency, &p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt); err != nil {
			continue
		}
		products = append(products, p)
	}

	if products == nil {
		products = []models.Product{}
	}

	return c.JSON(fiber.Map{
		"products": products,
	})
}

func (h *Handler) GetPublicProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	productID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid product id",
		})
	}

	var p models.Product
	err = h.db.QueryRow(context.Background(),
		`SELECT id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at 
		FROM products WHERE id = $1 AND is_active = true`,
		productID,
	).Scan(&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.Currency, &p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "product not found",
		})
	}

	return c.JSON(p)
}

func (h *Handler) AdminGetProducts(c *fiber.Ctx) error {
	page, limit, offset := utils.GetPaginationParams(c)
	search := c.Query("search", "")
	isActiveFilter := c.Query("is_active", "")

	var total int
	countQuery := "SELECT COUNT(*) FROM products WHERE 1=1"
	query := `SELECT id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at FROM products WHERE 1=1`

	args := []interface{}{}
	argCount := 1

	if search != "" {
		countQuery += " AND (name ILIKE $" + string(rune('0'+argCount)) + " OR description ILIKE $" + string(rune('0'+argCount)) + ")"
		query += " AND (name ILIKE $" + string(rune('0'+argCount)) + " OR description ILIKE $" + string(rune('0'+argCount)) + ")"
		args = append(args, "%"+search+"%")
		argCount++
	}

	if isActiveFilter != "" {
		isActive := isActiveFilter == "true"
		countQuery += " AND is_active = $" + string(rune('0'+argCount))
		query += " AND is_active = $" + string(rune('0'+argCount))
		args = append(args, isActive)
		argCount++
	}

	h.db.QueryRow(context.Background(), countQuery, args...).Scan(&total)

	query += " ORDER BY created_at DESC LIMIT $" + string(rune('0'+argCount)) + " OFFSET $" + string(rune('0'+argCount+1))
	args = append(args, limit, offset)

	rows, err := h.db.Query(context.Background(), query, args...)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch products",
		})
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.Currency, &p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt); err != nil {
			continue
		}
		products = append(products, p)
	}

	if products == nil {
		products = []models.Product{}
	}

	return c.JSON(models.ProductsListResponse{
		Products:   products,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: utils.CalculateTotalPages(total, limit),
	})
}

func (h *Handler) AdminCreateProduct(c *fiber.Ctx) error {
	var req models.CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "name is required",
		})
	}

	if req.Currency == "" {
		req.Currency = "usd"
	}

	var p models.Product
	err := h.db.QueryRow(context.Background(),
		`INSERT INTO products (name, description, price_cents, currency, image_url, stock, is_active) 
		VALUES ($1, $2, $3, $4, $5, $6, $7) 
		RETURNING id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at`,
		req.Name, req.Description, req.PriceCents, req.Currency, req.ImageURL, req.Stock, req.IsActive,
	).Scan(&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.Currency, &p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create product",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(p)
}

func (h *Handler) AdminGetProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	productID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid product id",
		})
	}

	var p models.Product
	err = h.db.QueryRow(context.Background(),
		`SELECT id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at 
		FROM products WHERE id = $1`,
		productID,
	).Scan(&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.Currency, &p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "product not found",
		})
	}

	return c.JSON(p)
}

func (h *Handler) AdminUpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	productID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid product id",
		})
	}

	var req models.UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	var p models.Product
	err = h.db.QueryRow(context.Background(),
		`UPDATE products SET 
			name = COALESCE($1, name),
			description = COALESCE($2, description),
			price_cents = COALESCE($3, price_cents),
			currency = COALESCE($4, currency),
			image_url = COALESCE($5, image_url),
			stock = COALESCE($6, stock),
			is_active = COALESCE($7, is_active),
			updated_at = NOW()
		WHERE id = $8
		RETURNING id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at`,
		req.Name, req.Description, req.PriceCents, req.Currency, req.ImageURL, req.Stock, req.IsActive, productID,
	).Scan(&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.Currency, &p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "product not found",
		})
	}

	return c.JSON(p)
}

func (h *Handler) AdminDeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	productID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid product id",
		})
	}

	result, err := h.db.Exec(context.Background(), "DELETE FROM products WHERE id = $1", productID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to delete product",
		})
	}

	if result.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "product not found",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func (h *Handler) CreateCheckout(c *fiber.Ctx) error {
	var req models.CheckoutRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.CustomerEmail == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "customer_email is required",
		})
	}

	if len(req.Items) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "items are required",
		})
	}

	ctx := context.Background()
	tx, err := h.db.Begin(ctx)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to start transaction",
		})
	}
	defer tx.Rollback(ctx)

	var subtotal int
	currency := "usd"
	orderItems := []struct {
		ProductID  uuid.UUID
		Name       string
		PriceCents int
		Qty        int
	}{}

	for _, item := range req.Items {
		productID, err := uuid.Parse(item.ProductID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "invalid product_id: " + item.ProductID,
			})
		}

		var p models.Product
		err = tx.QueryRow(ctx,
			`SELECT id, name, price_cents, currency, stock, is_active FROM products WHERE id = $1 FOR UPDATE`,
			productID,
		).Scan(&p.ID, &p.Name, &p.PriceCents, &p.Currency, &p.Stock, &p.IsActive)

		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "product not found: " + item.ProductID,
			})
		}

		if !p.IsActive {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "product not available: " + p.Name,
			})
		}

		if p.Stock < item.Qty {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "insufficient stock for: " + p.Name,
			})
		}

		_, err = tx.Exec(ctx, "UPDATE products SET stock = stock - $1, updated_at = NOW() WHERE id = $2", item.Qty, productID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to update stock",
			})
		}

		subtotal += p.PriceCents * item.Qty
		currency = p.Currency
		orderItems = append(orderItems, struct {
			ProductID  uuid.UUID
			Name       string
			PriceCents int
			Qty        int
		}{
			ProductID:  productID,
			Name:       p.Name,
			PriceCents: p.PriceCents,
			Qty:        item.Qty,
		})
	}

	shippingCents := 0
	totalCents := subtotal + shippingCents

	var orderID uuid.UUID
	err = tx.QueryRow(ctx,
		`INSERT INTO orders (customer_email, status, subtotal_cents, shipping_cents, total_cents, currency) 
		VALUES ($1, 'pending', $2, $3, $4, $5) RETURNING id`,
		req.CustomerEmail, subtotal, shippingCents, totalCents, currency,
	).Scan(&orderID)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create order",
		})
	}

	for _, item := range orderItems {
		_, err = tx.Exec(ctx,
			`INSERT INTO order_items (order_id, product_id, name_snapshot, price_cents_snapshot, qty) 
			VALUES ($1, $2, $3, $4, $5)`,
			orderID, item.ProductID, item.Name, item.PriceCents, item.Qty,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to create order items",
			})
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to commit transaction",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(models.CheckoutResponse{
		OrderID:    orderID.String(),
		TotalCents: totalCents,
		Currency:   currency,
	})
}

func (h *Handler) CreatePaymentIntent(c *fiber.Ctx) error {
	var req models.CreatePaymentIntentRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	orderID, err := uuid.Parse(req.OrderID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid order_id",
		})
	}

	var order models.Order
	err = h.db.QueryRow(context.Background(),
		"SELECT id, total_cents, currency, status FROM orders WHERE id = $1",
		orderID,
	).Scan(&order.ID, &order.TotalCents, &order.Currency, &order.Status)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "order not found",
		})
	}

	if order.Status != "pending" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "order is not pending",
		})
	}

	pi, err := h.stripeService.CreatePaymentIntent(int64(order.TotalCents), order.Currency, orderID.String())
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create payment intent",
		})
	}

	_, err = h.db.Exec(context.Background(),
		`INSERT INTO payments (order_id, provider, provider_ref, status, amount_cents, currency) 
		VALUES ($1, 'stripe', $2, 'pending', $3, $4)`,
		orderID, pi.ID, order.TotalCents, order.Currency,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to create payment record",
		})
	}

	return c.JSON(models.CreatePaymentIntentResponse{
		ClientSecret:    pi.ClientSecret,
		PaymentIntentID: pi.ID,
	})
}

func (h *Handler) StripeWebhook(c *fiber.Ctx) error {
	payload, err := io.ReadAll(c.Request().BodyStream())
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "failed to read request body",
		})
	}

	signature := c.Get("Stripe-Signature")
	event, err := h.stripeService.ConstructEvent(payload, signature)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid webhook signature",
		})
	}

	ctx := context.Background()

	switch event.Type {
	case "payment_intent.succeeded":
		var pi stripe.PaymentIntent
		if err := event.Data.Raw.Unmarshal(&pi); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "failed to parse payment intent",
			})
		}

		_, err = h.db.Exec(ctx,
			"UPDATE payments SET status = 'succeeded', updated_at = NOW() WHERE provider_ref = $1",
			pi.ID,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to update payment",
			})
		}

		orderID := pi.Metadata["order_id"]
		if orderID != "" {
			_, err = h.db.Exec(ctx,
				"UPDATE orders SET status = 'paid', updated_at = NOW() WHERE id = $1",
				orderID,
			)
		}

	case "payment_intent.payment_failed":
		var pi stripe.PaymentIntent
		if err := event.Data.Raw.Unmarshal(&pi); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "failed to parse payment intent",
			})
		}

		_, err = h.db.Exec(ctx,
			"UPDATE payments SET status = 'failed', updated_at = NOW() WHERE provider_ref = $1",
			pi.ID,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "failed to update payment",
			})
		}

		orderID := pi.Metadata["order_id"]
		if orderID != "" {
			_, err = h.db.Exec(ctx,
				"UPDATE orders SET status = 'failed', updated_at = NOW() WHERE id = $1",
				orderID,
			)
		}
	}

	return c.JSON(fiber.Map{"received": true})
}

func (h *Handler) GetOrder(c *fiber.Ctx) error {
	id := c.Params("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid order id",
		})
	}

	var order models.Order
	err = h.db.QueryRow(context.Background(),
		`SELECT id, user_id, customer_email, status, subtotal_cents, shipping_cents, total_cents, currency, created_at, updated_at 
		FROM orders WHERE id = $1`,
		orderID,
	).Scan(&order.ID, &order.UserID, &order.CustomerEmail, &order.Status, &order.SubtotalCents, &order.ShippingCents, &order.TotalCents, &order.Currency, &order.CreatedAt, &order.UpdatedAt)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "order not found",
		})
	}

	rows, err := h.db.Query(context.Background(),
		"SELECT id, order_id, product_id, name_snapshot, price_cents_snapshot, qty FROM order_items WHERE order_id = $1",
		orderID,
	)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var item models.OrderItem
			if err := rows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.NameSnapshot, &item.PriceCentsSnapshot, &item.Qty); err == nil {
				order.Items = append(order.Items, item)
			}
		}
	}

	return c.JSON(order)
}

func (h *Handler) AdminGetOrders(c *fiber.Ctx) error {
	page, limit, offset := utils.GetPaginationParams(c)
	statusFilter := c.Query("status", "")

	var total int
	countQuery := "SELECT COUNT(*) FROM orders"
	query := `SELECT id, user_id, customer_email, status, subtotal_cents, shipping_cents, total_cents, currency, created_at, updated_at FROM orders`

	args := []interface{}{}
	if statusFilter != "" {
		countQuery += " WHERE status = $1"
		query += " WHERE status = $1"
		args = append(args, statusFilter)
	}

	h.db.QueryRow(context.Background(), countQuery, args...).Scan(&total)

	if statusFilter != "" {
		query += " ORDER BY created_at DESC LIMIT $2 OFFSET $3"
	} else {
		query += " ORDER BY created_at DESC LIMIT $1 OFFSET $2"
	}
	args = append(args, limit, offset)

	rows, err := h.db.Query(context.Background(), query, args...)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch orders",
		})
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		if err := rows.Scan(&o.ID, &o.UserID, &o.CustomerEmail, &o.Status, &o.SubtotalCents, &o.ShippingCents, &o.TotalCents, &o.Currency, &o.CreatedAt, &o.UpdatedAt); err != nil {
			continue
		}
		orders = append(orders, o)
	}

	if orders == nil {
		orders = []models.Order{}
	}

	return c.JSON(models.OrdersListResponse{
		Orders:     orders,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: utils.CalculateTotalPages(total, limit),
	})
}

func (h *Handler) AdminGetOrder(c *fiber.Ctx) error {
	id := c.Params("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid order id",
		})
	}

	var order models.Order
	err = h.db.QueryRow(context.Background(),
		`SELECT id, user_id, customer_email, status, subtotal_cents, shipping_cents, total_cents, currency, created_at, updated_at 
		FROM orders WHERE id = $1`,
		orderID,
	).Scan(&order.ID, &order.UserID, &order.CustomerEmail, &order.Status, &order.SubtotalCents, &order.ShippingCents, &order.TotalCents, &order.Currency, &order.CreatedAt, &order.UpdatedAt)

	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "order not found",
		})
	}

	itemRows, _ := h.db.Query(context.Background(),
		"SELECT id, order_id, product_id, name_snapshot, price_cents_snapshot, qty FROM order_items WHERE order_id = $1",
		orderID,
	)
	if itemRows != nil {
		defer itemRows.Close()
		for itemRows.Next() {
			var item models.OrderItem
			if err := itemRows.Scan(&item.ID, &item.OrderID, &item.ProductID, &item.NameSnapshot, &item.PriceCentsSnapshot, &item.Qty); err == nil {
				order.Items = append(order.Items, item)
			}
		}
	}

	paymentRows, _ := h.db.Query(context.Background(),
		"SELECT id, order_id, provider, provider_ref, status, amount_cents, currency, created_at, updated_at FROM payments WHERE order_id = $1",
		orderID,
	)
	if paymentRows != nil {
		defer paymentRows.Close()
		for paymentRows.Next() {
			var p models.Payment
			if err := paymentRows.Scan(&p.ID, &p.OrderID, &p.Provider, &p.ProviderRef, &p.Status, &p.AmountCents, &p.Currency, &p.CreatedAt, &p.UpdatedAt); err == nil {
				order.Payments = append(order.Payments, p)
			}
		}
	}

	return c.JSON(order)
}

func (h *Handler) AdminUpdateOrderStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	orderID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid order id",
		})
	}

	var req models.UpdateOrderStatusRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	validStatuses := map[string]bool{
		"pending":    true,
		"paid":       true,
		"processing": true,
		"shipped":    true,
		"delivered":  true,
		"cancelled":  true,
		"failed":     true,
	}

	if !validStatuses[req.Status] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid status",
		})
	}

	result, err := h.db.Exec(context.Background(),
		"UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2",
		req.Status, orderID,
	)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to update order status",
		})
	}

	if result.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "order not found",
		})
	}

	return c.JSON(fiber.Map{"status": req.Status})
}

func (h *Handler) AdminGetStats(c *fiber.Ctx) error {
	ctx := context.Background()

	var stats models.StatsResponse

	h.db.QueryRow(ctx, "SELECT COUNT(*) FROM orders").Scan(&stats.TotalOrders)
	h.db.QueryRow(ctx, "SELECT COALESCE(SUM(total_cents), 0) FROM orders WHERE status = 'paid'").Scan(&stats.TotalRevenue)
	h.db.QueryRow(ctx, "SELECT COUNT(*) FROM products WHERE is_active = true").Scan(&stats.TotalProducts)
	h.db.QueryRow(ctx, "SELECT COUNT(*) FROM orders WHERE status = 'pending'").Scan(&stats.PendingOrders)

	return c.JSON(stats)
}

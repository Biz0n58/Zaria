package handlers

import (
	"strconv"
	"strings"

	"github.com/Biz0n58/Zaria/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProductHandler struct {
	DB *pgxpool.Pool
}

func NewProductHandler(db *pgxpool.Pool) *ProductHandler {
	return &ProductHandler{DB: db}
}

type ProductsResponse struct {
	Products []models.Product `json:"products"`
	Total    int              `json:"total"`
	Page     int              `json:"page"`
	Limit    int              `json:"limit"`
}

func (h *ProductHandler) GetProducts(c *fiber.Ctx) error {
	search := c.Query("search", "")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	limit, _ := strconv.Atoi(c.Query("limit", "50"))
	isActiveStr := c.Query("is_active", "")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 50
	}
	offset := (page - 1) * limit

	query := `SELECT id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at FROM products WHERE 1=1`
	args := []interface{}{}
	argPos := 1

	if search != "" {
		query += ` AND (name ILIKE $` + strconv.Itoa(argPos) + ` OR description ILIKE $` + strconv.Itoa(argPos) + `)`
		args = append(args, "%"+search+"%")
		argPos++
	}

	if isActiveStr != "" {
		isActive, err := strconv.ParseBool(isActiveStr)
		if err == nil {
			query += ` AND is_active = $` + strconv.Itoa(argPos)
			args = append(args, isActive)
			argPos++
		}
	}

	query += ` ORDER BY updated_at DESC LIMIT $` + strconv.Itoa(argPos) + ` OFFSET $` + strconv.Itoa(argPos+1)
	args = append(args, limit, offset)

	rows, err := h.DB.Query(c.Context(), query, args...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch products"})
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.Currency,
			&p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to scan product"})
		}
		products = append(products, p)
	}

	countQuery := `SELECT COUNT(*) FROM products WHERE 1=1`
	countArgs := []interface{}{}
	countArgPos := 1

	if search != "" {
		countQuery += ` AND (name ILIKE $` + strconv.Itoa(countArgPos) + ` OR description ILIKE $` + strconv.Itoa(countArgPos) + `)`
		countArgs = append(countArgs, "%"+search+"%")
		countArgPos++
	}

	if isActiveStr != "" {
		isActive, err := strconv.ParseBool(isActiveStr)
		if err == nil {
			countQuery += ` AND is_active = $` + strconv.Itoa(countArgPos)
			countArgs = append(countArgs, isActive)
			countArgPos++
		}
	}

	var total int
	err = h.DB.QueryRow(c.Context(), countQuery, countArgs...).Scan(&total)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to count products"})
	}

	return c.JSON(ProductsResponse{
		Products: products,
		Total:    total,
		Page:     page,
		Limit:    limit,
	})
}

func (h *ProductHandler) GetPublicProducts(c *fiber.Ctx) error {
	rows, err := h.DB.Query(
		c.Context(),
		`SELECT id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at 
		 FROM products 
		 WHERE is_active = true
		 ORDER BY created_at DESC`,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch products"})
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		err := rows.Scan(
			&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.Currency,
			&p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "failed to scan product"})
		}
		products = append(products, p)
	}

	return c.JSON(products)
}

func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	productUUID, err := uuid.Parse(productID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid product id"})
	}

	var p models.Product
	err = h.DB.QueryRow(
		c.Context(),
		`SELECT id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at 
		 FROM products WHERE id = $1`,
		productUUID,
	).Scan(
		&p.ID, &p.Name, &p.Description, &p.PriceCents, &p.Currency,
		&p.ImageURL, &p.Stock, &p.IsActive, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "product not found"})
	}

	return c.JSON(p)
}

type CreateProductRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	PriceCents  int    `json:"price_cents"`
	Currency    string `json:"currency"`
	ImageURL    string `json:"image_url"`
	Stock       int    `json:"stock"`
	IsActive    bool   `json:"is_active"`
}

func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	var req CreateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	if strings.TrimSpace(req.Name) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name is required"})
	}
	if req.PriceCents < 0 {
		return c.Status(400).JSON(fiber.Map{"error": "price_cents must be positive"})
	}
	if req.Stock < 0 {
		return c.Status(400).JSON(fiber.Map{"error": "stock must be non-negative"})
	}

	if req.Currency == "" {
		req.Currency = "usd"
	}

	var product models.Product
	err := h.DB.QueryRow(
		c.Context(),
		`INSERT INTO products (name, description, price_cents, currency, image_url, stock, is_active) 
		 VALUES ($1, $2, $3, $4, $5, $6, $7) 
		 RETURNING id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at`,
		req.Name, req.Description, req.PriceCents, req.Currency, req.ImageURL, req.Stock, req.IsActive,
	).Scan(
		&product.ID, &product.Name, &product.Description, &product.PriceCents, &product.Currency,
		&product.ImageURL, &product.Stock, &product.IsActive, &product.CreatedAt, &product.UpdatedAt,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to create product"})
	}

	return c.Status(201).JSON(product)
}

type UpdateProductRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	PriceCents  int    `json:"price_cents"`
	Currency    string `json:"currency"`
	ImageURL    string `json:"image_url"`
	Stock       int    `json:"stock"`
	IsActive    bool   `json:"is_active"`
}

func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	productUUID, err := uuid.Parse(productID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid product id"})
	}

	var req UpdateProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	if strings.TrimSpace(req.Name) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "name is required"})
	}
	if req.PriceCents < 0 {
		return c.Status(400).JSON(fiber.Map{"error": "price_cents must be positive"})
	}
	if req.Stock < 0 {
		return c.Status(400).JSON(fiber.Map{"error": "stock must be non-negative"})
	}

	if req.Currency == "" {
		req.Currency = "usd"
	}

	var product models.Product
	err = h.DB.QueryRow(
		c.Context(),
		`UPDATE products 
		 SET name = $1, description = $2, price_cents = $3, currency = $4, image_url = $5, stock = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP 
		 WHERE id = $8 
		 RETURNING id, name, description, price_cents, currency, image_url, stock, is_active, created_at, updated_at`,
		req.Name, req.Description, req.PriceCents, req.Currency, req.ImageURL, req.Stock, req.IsActive, productUUID,
	).Scan(
		&product.ID, &product.Name, &product.Description, &product.PriceCents, &product.Currency,
		&product.ImageURL, &product.Stock, &product.IsActive, &product.CreatedAt, &product.UpdatedAt,
	)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to update product"})
	}

	return c.JSON(product)
}

func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	productID := c.Params("id")
	productUUID, err := uuid.Parse(productID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid product id"})
	}

	_, err = h.DB.Exec(c.Context(), "DELETE FROM products WHERE id = $1", productUUID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to delete product"})
	}

	return c.JSON(fiber.Map{"message": "product deleted"})
}

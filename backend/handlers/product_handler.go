package handlers

import (
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ProductHandler struct {
	DB *pgxpool.Pool
}

func NewProductHandler(db *pgxpool.Pool) *ProductHandler {
	return &ProductHandler{DB: db}
}

type Product struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	Stock       int     `json:"stock"`
}

func (h *ProductHandler) GetProducts(c *fiber.Ctx) error {
	rows, err := h.DB.Query(c.Context(), `
		SELECT id, name, description, price, stock
		FROM products
		ORDER BY id DESC
	`)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to fetch products"})
	}
	defer rows.Close()

	products := []Product{}

	for rows.Next() {
		var p Product
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock); err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "scan error"})
		}
		products = append(products, p)
	}

	return c.JSON(products)
}

func (h *ProductHandler) CreateProduct(c *fiber.Ctx) error {
	var p Product

	if err := c.BodyParser(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	err := h.DB.QueryRow(
		c.Context(),
		`INSERT INTO products (name, description, price, stock)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id`,
		p.Name, p.Description, p.Price, p.Stock,
	).Scan(&p.ID)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to insert"})
	}

	return c.Status(201).JSON(p)
}

func (h *ProductHandler) GetProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	var p Product

	err := h.DB.QueryRow(
		c.Context(),
		`SELECT id, name, description, price, stock FROM products WHERE id=$1`,
		id,
	).Scan(&p.ID, &p.Name, &p.Description, &p.Price, &p.Stock)

	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "not found"})
	}

	return c.JSON(p)
}

func (h *ProductHandler) UpdateProduct(c *fiber.Ctx) error {
	id := c.Params("id")
	var p Product

	if err := c.BodyParser(&p); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	_, err := h.DB.Exec(
		c.Context(),
		`UPDATE products SET name=$1, description=$2, price=$3, stock=$4 WHERE id=$5`,
		p.Name, p.Description, p.Price, p.Stock, id,
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "update failed"})
	}

	return c.JSON(fiber.Map{"message": "updated"})
}

func (h *ProductHandler) DeleteProduct(c *fiber.Ctx) error {
	id := c.Params("id")

	_, err := h.DB.Exec(
		c.Context(),
		`DELETE FROM products WHERE id=$1`,
		id,
	)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "delete failed"})
	}

	return c.JSON(fiber.Map{"message": "deleted"})
}

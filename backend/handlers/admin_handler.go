package handlers

import (
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AdminHandler struct {
	DB *pgxpool.Pool
}

func NewAdminHandler(db *pgxpool.Pool) *AdminHandler {
	return &AdminHandler{DB: db}
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *AdminHandler) Login(c *fiber.Ctx) error {
	var req loginReq
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}

	// مؤقتًا: Login ثابت (بعد شوي بنربطه بجدول admins)
	// لا تحط هالشي بالإنتاج.
	if req.Email != "admin@zaria.com" || req.Password != "admin123" {
		return c.Status(401).JSON(fiber.Map{"error": "invalid credentials"})
	}

	secret := os.Getenv("JWT_SECRET")

	claims := jwt.MapClaims{
		"sub": req.Email,
		"role": "admin",
		"exp": time.Now().Add(24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	signed, err := token.SignedString([]byte(secret))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "failed to sign token"})
	}

	return c.JSON(fiber.Map{"token": signed})
}

func (h *AdminHandler) GetOrders(c *fiber.Ctx) error {
	// مؤقت: رجّع بيانات fake (بعد شوي بنسوي جدول orders ونقرأ من DB)
	return c.JSON([]fiber.Map{
		{"id": 1, "status": "paid", "total": 12.5},
		{"id": 2, "status": "pending", "total": 7.0},
	})
}

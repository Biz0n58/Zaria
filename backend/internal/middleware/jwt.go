package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/zaria/backend/internal/services"
)

func JWTAuth(authService *services.AuthService, requiredUserType string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "authorization header required",
			})
		}

		if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid authorization header format",
			})
		}

		token := authHeader[7:]
		claims, err := authService.ValidateToken(token)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid token",
			})
		}

		if requiredUserType != "" && claims.UserType != requiredUserType {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "insufficient permissions",
			})
		}

		c.Locals("user_id", claims.UserID)
		c.Locals("user_type", claims.UserType)
		c.Locals("email", claims.Email)

		return c.Next()
	}
}

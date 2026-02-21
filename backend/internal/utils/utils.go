package utils

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
)

func GetPaginationParams(c *fiber.Ctx) (page, limit, offset int) {
	page, _ = strconv.Atoi(c.Query("page", "1"))
	limit, _ = strconv.Atoi(c.Query("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	offset = (page - 1) * limit
	return page, limit, offset
}

func CalculateTotalPages(total, limit int) int {
	if limit <= 0 {
		return 0
	}
	pages := total / limit
	if total%limit > 0 {
		pages++
	}
	return pages
}

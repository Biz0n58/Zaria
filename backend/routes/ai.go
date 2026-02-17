package routes

import (
	"context"
	"os"

	"github.com/gofiber/fiber/v3"
	openai "github.com/openai/openai-go"
)

type AIReq struct {
	Message string `json:"message"`
}

func RegisterAIRoutes(app *fiber.App) {
	client := openai.NewClient(
		openai.WithAPIKey(os.Getenv("OPENAI_API_KEY")),
	)

	app.Post("/ai/chat", func(c fiber.Ctx) error {
		var body AIReq
		if err := c.Bind().Body(&body); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
		}
		if body.Message == "" {
			return c.Status(400).JSON(fiber.Map{"error": "message required"})
		}

		resp, err := client.Chat.Completions.New(context.Background(), openai.ChatCompletionNewParams{
			Model: openai.F("gpt-4o-mini"),
			Messages: openai.F([]openai.ChatCompletionMessageParamUnion{
				openai.SystemMessage("You are a concise shopping assistant for this store. Do not invent products."),
				openai.UserMessage(body.Message),
			}),
		})
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "openai request failed"})
		}

		return c.JSON(fiber.Map{
			"reply": resp.Choices[0].Message.Content,
		})
	})
}

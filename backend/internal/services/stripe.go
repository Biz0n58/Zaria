package services

import (
	"github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/paymentintent"
	"github.com/stripe/stripe-go/v76/webhook"
)

type StripeService struct {
	webhookSecret string
}

func NewStripeService(secretKey, webhookSecret string) *StripeService {
	stripe.Key = secretKey
	return &StripeService{
		webhookSecret: webhookSecret,
	}
}

func (s *StripeService) CreatePaymentIntent(amountCents int64, currency, orderID string) (*stripe.PaymentIntent, error) {
	params := &stripe.PaymentIntentParams{
		Amount:   stripe.Int64(amountCents),
		Currency: stripe.String(currency),
		Metadata: map[string]string{
			"order_id": orderID,
		},
		AutomaticPaymentMethods: &stripe.PaymentIntentAutomaticPaymentMethodsParams{
			Enabled: stripe.Bool(true),
		},
	}

	return paymentintent.New(params)
}

func (s *StripeService) ConstructEvent(payload []byte, signature string) (stripe.Event, error) {
	return webhook.ConstructEvent(payload, signature, s.webhookSecret)
}

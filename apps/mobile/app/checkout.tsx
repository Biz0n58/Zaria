import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { apiClient } from "@/lib/api";
import { getCart, clearCart } from "@/lib/cart";
import type { Product, CheckoutResponse, PaymentIntentResponse } from "@/lib/types";

interface CartItemWithProduct {
  product: Product;
  qty: number;
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState("");

  const loadCartItems = useCallback(async () => {
    setLoading(true);
    const cart = await getCart();

    if (cart.items.length === 0) {
      router.replace("/cart");
      return;
    }

    const productPromises = cart.items.map(async (item) => {
      try {
        const product = await apiClient<Product>(
          `/api/products/${item.product_id}`
        );
        return { product, qty: item.qty };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(productPromises);
    setItems(
      results.filter((item): item is CartItemWithProduct => item !== null)
    );
    setLoading(false);
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [loadCartItems])
  );

  const subtotal = items.reduce(
    (total, item) => total + item.product.price_cents * item.qty,
    0
  );

  const currency = items[0]?.product.currency || "usd";

  const handleCheckout = async () => {
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setProcessing(true);

    try {
      const cart = await getCart();

      const checkoutData = await apiClient<CheckoutResponse>("/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          customer_email: email,
          items: cart.items,
        }),
      });

      setOrderId(checkoutData.order_id);

      const paymentData = await apiClient<PaymentIntentResponse>(
        "/api/payments/stripe/create-intent",
        {
          method: "POST",
          body: JSON.stringify({ order_id: checkoutData.order_id }),
        }
      );

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: paymentData.client_secret,
        merchantDisplayName: "Zaria",
        defaultBillingDetails: {
          email: email,
        },
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        setProcessing(false);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code !== "Canceled") {
          router.push(`/payment/failed?order_id=${checkoutData.order_id}`);
        }
        setProcessing(false);
        return;
      }

      await clearCart();
      router.replace(`/payment/success?order_id=${checkoutData.order_id}`);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Checkout failed"
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {items.map((item) => (
            <View key={item.product.id} style={styles.summaryItem}>
              <View style={styles.summaryItemInfo}>
                <Text style={styles.summaryItemName}>{item.product.name}</Text>
                <Text style={styles.summaryItemQty}>Qty: {item.qty}</Text>
              </View>
              <Text style={styles.summaryItemPrice}>
                {formatCurrency(
                  item.product.price_cents * item.qty,
                  item.product.currency
                )}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(subtotal, currency)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>Pay Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryItemInfo: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  summaryItemQty: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  summaryItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  payButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#93c5fd",
  },
  payButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

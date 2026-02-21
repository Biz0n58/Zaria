import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/lib/api";
import { getCart, updateCartItem, removeFromCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

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

export default function CartScreen() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCartItems = useCallback(async () => {
    setLoading(true);
    const cart = await getCart();

    if (cart.items.length === 0) {
      setItems([]);
      setLoading(false);
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCartItems();
    }, [loadCartItems])
  );

  const handleUpdateQty = async (productId: string, newQty: number) => {
    if (newQty < 1) return;
    await updateCartItem(productId, newQty);
    setItems(
      items.map((item) =>
        item.product.id === productId ? { ...item, qty: newQty } : item
      )
    );
  };

  const handleRemove = async (productId: string) => {
    await removeFromCart(productId);
    setItems(items.filter((item) => item.product.id !== productId));
  };

  const subtotal = items.reduce(
    (total, item) => total + item.product.price_cents * item.qty,
    0
  );

  const currency = items[0]?.product.currency || "usd";

  const renderItem = ({ item }: { item: CartItemWithProduct }) => (
    <View style={styles.cartItem}>
      {item.product.image_url ? (
        <Image
          source={{ uri: item.product.image_url }}
          style={styles.itemImage}
        />
      ) : (
        <View style={[styles.itemImage, styles.noImage]}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.product.name}
        </Text>
        <Text style={styles.itemPrice}>
          {formatCurrency(item.product.price_cents, item.product.currency)}
        </Text>

        <View style={styles.qtyRow}>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => handleUpdateQty(item.product.id, item.qty - 1)}
              disabled={item.qty <= 1}
            >
              <Ionicons name="remove" size={16} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{item.qty}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => handleUpdateQty(item.product.id, item.qty + 1)}
            >
              <Ionicons name="add" size={16} color="#1f2937" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemove(item.product.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.itemTotal}>
        {formatCurrency(
          item.product.price_cents * item.qty,
          item.product.currency
        )}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        <Ionicons name="bag-outline" size={64} color="#d1d5db" />
        <Text style={styles.emptyText}>Your cart is empty</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/")}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(subtotal, currency)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={() => router.push("/checkout")}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    backgroundColor: "#f9fafb",
  },
  list: {
    padding: 16,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  noImage: {
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    fontSize: 10,
    color: "#9ca3af",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  itemPrice: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
  },
  qtyButton: {
    padding: 6,
  },
  qtyValue: {
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  removeButton: {
    padding: 8,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 8,
  },
  footer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  checkoutButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 18,
    color: "#6b7280",
    marginTop: 16,
  },
  shopButton: {
    marginTop: 24,
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

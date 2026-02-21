import { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { apiClient } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import type { Product } from "@/lib/types";

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const data = await apiClient<Product>(`/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    await addToCart(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.image} />
      ) : (
        <View style={styles.noImage}>
          <Text style={styles.noImageText}>No Image</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>
          {formatCurrency(product.price_cents, product.currency)}
        </Text>

        <View
          style={[
            styles.stockBadge,
            { backgroundColor: product.stock > 0 ? "#dcfce7" : "#fee2e2" },
          ]}
        >
          <Text
            style={[
              styles.stockText,
              { color: product.stock > 0 ? "#16a34a" : "#dc2626" },
            ]}
          >
            {product.stock > 0
              ? `In Stock (${product.stock} available)`
              : "Out of Stock"}
          </Text>
        </View>

        {product.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>Description</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>
        )}

        <View style={styles.qtyContainer}>
          <Text style={styles.qtyLabel}>Quantity:</Text>
          <View style={styles.qtyControls}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQty(Math.max(1, qty - 1))}
              disabled={product.stock === 0}
            >
              <Ionicons name="remove" size={20} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{qty}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQty(qty + 1)}
              disabled={product.stock === 0}
            >
              <Ionicons name="add" size={20} color="#1f2937" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.addButton,
            added && styles.addedButton,
            product.stock === 0 && styles.disabledButton,
          ]}
          onPress={handleAddToCart}
          disabled={product.stock === 0}
        >
          <Ionicons
            name={added ? "checkmark" : "cart"}
            size={20}
            color="#fff"
          />
          <Text style={styles.addButtonText}>
            {added ? "Added!" : "Add to Cart"}
          </Text>
        </TouchableOpacity>

        {added && (
          <TouchableOpacity
            style={styles.viewCartButton}
            onPress={() => router.push("/cart")}
          >
            <Text style={styles.viewCartText}>View Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  noImage: {
    width: "100%",
    height: 300,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageText: {
    color: "#9ca3af",
    fontSize: 18,
  },
  content: {
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginTop: 8,
  },
  stockBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 12,
  },
  stockText: {
    fontSize: 14,
    fontWeight: "500",
  },
  descriptionContainer: {
    marginTop: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#4b5563",
    lineHeight: 24,
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
  },
  qtyLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginRight: 12,
  },
  qtyControls: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
  },
  qtyButton: {
    padding: 12,
  },
  qtyValue: {
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 8,
  },
  addedButton: {
    backgroundColor: "#16a34a",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  viewCartButton: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  viewCartText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
  },
});

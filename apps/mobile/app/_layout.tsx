import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StripeProvider } from "@stripe/stripe-react-native";

const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#fff" },
          headerTintColor: "#1f2937",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: "Zaria", headerShown: true }}
        />
        <Stack.Screen
          name="product/[id]"
          options={{ title: "Product Details" }}
        />
        <Stack.Screen name="cart" options={{ title: "Cart" }} />
        <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
        <Stack.Screen
          name="payment/success"
          options={{ title: "Order Confirmed", headerBackVisible: false }}
        />
        <Stack.Screen
          name="payment/failed"
          options={{ title: "Payment Failed" }}
        />
        <Stack.Screen name="auth/login" options={{ title: "Login" }} />
        <Stack.Screen name="auth/register" options={{ title: "Register" }} />
      </Stack>
    </StripeProvider>
  );
}

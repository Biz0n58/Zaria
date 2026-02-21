import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "zaria_auth_token";
const USER_KEY = "zaria_user";

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getUser(): Promise<{ id: string; email: string } | null> {
  try {
    const user = await SecureStore.getItemAsync(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

export async function setUser(user: { id: string; email: string }): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function removeUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

export async function logout(): Promise<void> {
  await removeToken();
  await removeUser();
}

import { account } from "@/lib/appwrite";

export const GUEST_CART_KEY = "clothing-cart";

export function getCustomerCartKey(userId: string): string {
  return `clothing-cart:${userId}`;
}

export async function getCartStorageKey(): Promise<string> {
  try {
    const user = await account.get();

    console.log("[CART DEBUG] Current Appwrite user:", user.$id);

    const key = getCustomerCartKey(user.$id);

    console.log("[CART DEBUG] Using storage key:", key);

    return key;
  } catch (error) {
    console.log("[CART DEBUG] No authenticated user. Using guest cart.", error);

    return GUEST_CART_KEY;
  }
}

export function notifyCartUpdated(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cart-updated"));
  }
}
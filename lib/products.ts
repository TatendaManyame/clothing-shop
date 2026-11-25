
import { TablesDB, Query } from "appwrite";
import { client } from "@/lib/appwrite";

const tablesDB = new TablesDB(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;

if (!databaseId) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID");
}

export type StoreProduct = {
  $id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  category_id: string;
  sku: string;
  image_url: string;
  images?: string[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  tag?: string | null;
};

export type StoreCategory = {
  $id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
};

export async function getProducts(): Promise<StoreProduct[]> {
  const response = await tablesDB.listRows({
    databaseId,
    tableId: "products",
    queries: [
      Query.equal("is_active", true),
      Query.limit(100),
    ],
  });

  return response.rows as unknown as StoreProduct[];
}

export async function getCategories(): Promise<StoreCategory[]> {
  const response = await tablesDB.listRows({
    databaseId,
    tableId: "categories",
    queries: [
      Query.equal("is_active", true),
      Query.limit(100),
    ],
  });

  return (response.rows as unknown as StoreCategory[]).sort(
    (a, b) => a.sort_order - b.sort_order
  );
}

export async function getProductById(
  id: string
): Promise<StoreProduct | null> {
  try {
    const product = await tablesDB.getRow({
      databaseId,
      tableId: "products",
      rowId: id,
    });

    const storeProduct = product as unknown as StoreProduct;

    if (!storeProduct.is_active) {
      return null;
    }

    return storeProduct;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}

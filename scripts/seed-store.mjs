
import { Client, TablesDB } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  throw new Error("Missing Appwrite environment variables.");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const db = new TablesDB(client);

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = ["Black", "White", "Grey"];

const categories = [
  {
    id: "tracksuits",
    name: "Tracksuits",
    slug: "tracksuits",
    description: "Comfortable tracksuits and sporty streetwear essentials.",
    sort_order: 1,
  },
  {
    id: "hoodies",
    name: "Hoodies",
    slug: "hoodies",
    description: "Relaxed hoodies designed for everyday comfort.",
    sort_order: 2,
  },
  {
    id: "pants",
    name: "Pants",
    slug: "pants",
    description: "Modern trousers, cargo pants and denim essentials.",
    sort_order: 3,
  },
  {
    id: "t-shirts",
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Everyday T-shirts and streetwear tops.",
    sort_order: 4,
  },
  {
    id: "jackets",
    name: "Jackets",
    slug: "jackets",
    description: "Versatile jackets and contemporary outerwear.",
    sort_order: 5,
  },
];

const products = [
  {
    id: "classic-track-set",
    name: "Classic Track Set",
    price: 45,
    category: "tracksuits",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
    tag: "BESTSELLER",
    description: "A comfortable everyday tracksuit designed for effortless streetwear style. Perfect for casual outings, travelling and everyday wear.",
    sku: "VW-TRK-001",
    featured: true,
  },
  {
    id: "essential-hoodie",
    name: "Essential Hoodie",
    price: 38,
    category: "hoodies",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
    tag: "NEW",
    description: "A versatile hoodie with a relaxed fit. An everyday essential that combines comfort and contemporary streetwear style.",
    sku: "VW-HOD-002",
    featured: true,
  },
  {
    id: "urban-cargo-pants",
    name: "Urban Cargo Pants",
    price: 42,
    category: "pants",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "Modern cargo-inspired styling with a relaxed silhouette. Made for everyday comfort and versatile outfits.",
    sku: "VW-PNT-003",
    featured: false,
  },
  {
    id: "everyday-white-tee",
    name: "Everyday White Tee",
    price: 22,
    category: "t-shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    tag: "POPULAR",
    description: "A clean, versatile white T-shirt that works with almost any outfit. A simple essential for your wardrobe.",
    sku: "VW-TEE-004",
    featured: true,
  },
  {
    id: "premium-black-jacket",
    name: "Premium Black Jacket",
    price: 65,
    category: "jackets",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85",
    tag: "NEW",
    description: "A statement jacket designed to elevate your everyday look. A versatile outerwear piece for modern wardrobes.",
    sku: "VW-JKT-005",
    featured: true,
  },
  {
    id: "relaxed-fit-hoodie",
    name: "Relaxed Fit Hoodie",
    price: 40,
    category: "hoodies",
    image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "A relaxed hoodie made for casual styling, layering and everyday comfort.",
    sku: "VW-HOD-006",
    featured: false,
  },
  {
    id: "streetwear-denim",
    name: "Streetwear Denim",
    price: 48,
    category: "pants",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "A versatile denim essential that brings a modern streetwear feel to everyday outfits.",
    sku: "VW-PNT-007",
    featured: false,
  },
  {
    id: "graphic-street-tee",
    name: "Graphic Street Tee",
    price: 25,
    category: "t-shirts",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
    tag: "NEW",
    description: "A graphic-inspired streetwear T-shirt for adding personality to your everyday look.",
    sku: "VW-TEE-008",
    featured: true,
  },
  {
    id: "sport-track-jacket",
    name: "Sport Track Jacket",
    price: 52,
    category: "tracksuits",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "A sporty outerwear essential designed for comfortable everyday styling.",
    sku: "VW-TRK-009",
    featured: false,
  },
  {
    id: "oversized-tee",
    name: "Oversized Tee",
    price: 28,
    category: "t-shirts",
    image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "An oversized everyday T-shirt with a relaxed streetwear-inspired silhouette.",
    sku: "VW-TEE-010",
    featured: false,
  },
  {
    id: "heavyweight-hoodie",
    name: "Heavyweight Hoodie",
    price: 55,
    category: "hoodies",
    image: "https://images.unsplash.com/photo-1609873814058-a5a8c5d2e7a5?auto=format&fit=crop&w=900&q=85",
    tag: "PREMIUM",
    description: "A premium-inspired heavyweight hoodie for a comfortable, relaxed everyday look.",
    sku: "VW-HOD-011",
    featured: true,
  },
  {
    id: "utility-cargo",
    name: "Utility Cargo",
    price: 50,
    category: "pants",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "Utility-inspired cargo trousers with a versatile design for everyday streetwear outfits.",
    sku: "VW-PNT-012",
    featured: false,
  },
];

async function getExistingRow(tableId, rowId) {
  try {
    return await db.getRow({
      databaseId,
      tableId,
      rowId,
    });
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

async function seedCategories() {
  console.log("\nSeeding categories...");

  for (const category of categories) {
    const existing = await getExistingRow("categories", category.id);

    const data = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      is_active: true,
      sort_order: category.sort_order,
    };

    if (existing) {
      await db.updateRow({
        databaseId,
        tableId: "categories",
        rowId: category.id,
        data,
      });
      console.log(`Updated category: ${category.name}`);
    } else {
      await db.createRow({
        databaseId,
        tableId: "categories",
        rowId: category.id,
        data,
      });
      console.log(`Created category: ${category.name}`);
    }
  }
}

async function seedProducts() {
  console.log("\nSeeding products...");

  for (const product of products) {
    const existing = await getExistingRow("products", product.id);

    const data = {
      name: product.name,
      slug: product.id,
      description: product.description,
      price: product.price,
      category_id: product.category,
      sku: product.sku,
      image_url: product.image,
      images: [product.image],
      sizes,
      colors,
      stock_quantity: 10,
      is_active: true,
      is_featured: product.featured,
      tag: product.tag || null,
    };

    if (existing) {
      await db.updateRow({
        databaseId,
        tableId: "products",
        rowId: product.id,
        data,
      });
      console.log(`Updated product: ${product.name}`);
    } else {
      await db.createRow({
        databaseId,
        tableId: "products",
        rowId: product.id,
        data,
      });
      console.log(`Created product: ${product.name}`);
    }
  }
}

async function main() {
  console.log("Starting VicWav catalogue seeding...");

  await seedCategories();
  await seedProducts();

  console.log("\nCatalogue seeding completed successfully!");
  console.log(`Categories: ${categories.length}`);
  console.log(`Products: ${products.length}`);
  console.log("Initial stock: 10 units per product");
}

main().catch((error) => {
  console.error("\nCatalogue seeding failed:");
  console.error(error.message);
  process.exit(1);
});

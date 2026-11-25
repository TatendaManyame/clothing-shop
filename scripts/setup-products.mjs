
import { Client, TablesDB } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  throw new Error("Missing Appwrite environment variables in .env.local");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const db = new TablesDB(client);
const tableId = "products";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureTable() {
  try {
    await db.getTable({ databaseId, tableId });
    console.log("Products table already exists.");
  } catch {
    await db.createTable({
      databaseId,
      tableId,
      name: "Products",
    });
    console.log("Created products table.");
  }
}

const columns = [
  { key: "name", type: "varchar", size: 150, required: true },
  { key: "slug", type: "varchar", size: 150, required: true },
  { key: "description", type: "text", required: false },
  { key: "price", type: "float", required: true },
  { key: "compare_at_price", type: "float", required: false },
  { key: "category_id", type: "varchar", size: 50, required: true },
  { key: "sku", type: "varchar", size: 64, required: true },
  { key: "image_url", type: "varchar", size: 2048, required: false },
  { key: "images", type: "varchar", size: 2048, required: false, array: true },
  { key: "sizes", type: "varchar", size: 50, required: false, array: true },
  { key: "colors", type: "varchar", size: 50, required: false, array: true },
  { key: "stock_quantity", type: "integer", required: true },
  { key: "is_active", type: "boolean", required: true },
  { key: "is_featured", type: "boolean", required: true },
  { key: "tag", type: "varchar", size: 30, required: false },
];

async function ensureColumn(column) {
  const existing = await db.listColumns({
    databaseId,
    tableId,
  });

  if (existing.columns.some((item) => item.key === column.key)) {
    console.log(`Column exists: ${column.key}`);
    return;
  }

  const common = {
    databaseId,
    tableId,
    key: column.key,
    required: column.required,
    array: column.array ?? false,
  };

  switch (column.type) {
    case "varchar":
      await db.createVarcharColumn({
        ...common,
        size: column.size,
      });
      break;
    case "text":
      await db.createTextColumn(common);
      break;
    case "float":
      await db.createFloatColumn(common);
      break;
    case "integer":
      await db.createIntegerColumn(common);
      break;
    case "boolean":
      await db.createBooleanColumn(common);
      break;
    default:
      throw new Error(`Unsupported column type: ${column.type}`);
  }

  console.log(`Created column: ${column.key}`);
}

async function waitForColumns() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = await db.listColumns({
      databaseId,
      tableId,
    });

    const ready = columns.every((column) => {
      const found = result.columns.find(
        (item) => item.key === column.key
      );

      return found && found.status === "available";
    });

    if (ready) return;

    await wait(2000);
  }

  throw new Error("Columns are still processing. Run the script again later.");
}

const indexes = [
  {
    key: "slug_unique",
    type: "unique",
    columns: ["slug"],
    lengths: [150],
  },
  {
    key: "sku_unique",
    type: "unique",
    columns: ["sku"],
    lengths: [64],
  },
  {
    key: "category_index",
    type: "key",
    columns: ["category_id"],
  },
  {
    key: "active_index",
    type: "key",
    columns: ["is_active"],
  },
  {
    key: "featured_index",
    type: "key",
    columns: ["is_featured"],
  },
];

async function ensureIndexes() {
  for (const index of indexes) {
    const existing = await db.listIndexes({
      databaseId,
      tableId,
    });

    if (existing.indexes.some((item) => item.key === index.key)) {
      console.log(`Index exists: ${index.key}`);
      continue;
    }

    await db.createIndex({
      databaseId,
      tableId,
      ...index,
    });

    console.log(`Created index: ${index.key}`);
  }
}

async function main() {
  console.log("Starting clothing store database setup...");

  await ensureTable();

  for (const column of columns) {
    await ensureColumn(column);
  }

  console.log("Waiting for columns to become available...");
  await waitForColumns();

  await ensureIndexes();

  console.log("Products table setup completed successfully!");
}

main().catch((error) => {
  console.error("Database setup failed:", error.message);
  process.exit(1);
});

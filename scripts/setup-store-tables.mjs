
import { Client, TablesDB } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new TablesDB(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;

if (
  !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
  !process.env.APPWRITE_API_KEY ||
  !databaseId
) {
  throw new Error("Missing Appwrite environment variables.");
}

const varchar = (key, size, required = false) => ({
  key, type: "varchar", size, required,
});

const text = (key, required = false) => ({
  key, type: "text", required,
});

const float = (key, required = false) => ({
  key, type: "float", required,
});

const integer = (key, required = false) => ({
  key, type: "integer", required,
});

const boolean = (key, required = false) => ({
  key, type: "boolean", required,
});

const datetime = (key, required = false) => ({
  key, type: "datetime", required,
});

const tables = [
  {
    id: "categories",
    name: "Categories",
    columns: [
      varchar("name", 100, true),
      varchar("slug", 120, true),
      text("description"),
      varchar("image_url", 2048),
      boolean("is_active", true),
      integer("sort_order", true),
    ],
    indexes: [
      { key: "category_slug_unique", type: "unique", columns: ["slug"] },
    ],
  },
  {
    id: "customers",
    name: "Customers",
    columns: [
      varchar("user_id", 64, true),
      varchar("full_name", 150, true),
      varchar("email", 254, true),
      varchar("phone", 30),
      varchar("address_line", 255),
      varchar("city", 100),
      varchar("country", 100),
    ],
    indexes: [
      { key: "customer_user_unique", type: "unique", columns: ["user_id"] },
      { key: "customer_email_index", type: "key", columns: ["email"] },
    ],
  },
  {
    id: "orders",
    name: "Orders",
    columns: [
      varchar("order_number", 50, true),
      varchar("customer_id", 64, true),
      float("subtotal", true),
      float("shipping_fee", true),
      float("total", true),
      varchar("currency", 10, true),
      varchar("payment_method", 50, true),
      varchar("payment_status", 30, true),
      varchar("order_status", 30, true),
      varchar("delivery_name", 150, true),
      varchar("delivery_phone", 30, true),
      varchar("delivery_address", 255, true),
      varchar("delivery_city", 100, true),
      text("customer_notes"),
      datetime("placed_at", true),
    ],
    indexes: [
      { key: "order_number_unique", type: "unique", columns: ["order_number"] },
      { key: "orders_customer_index", type: "key", columns: ["customer_id"] },
      { key: "orders_status_index", type: "key", columns: ["order_status"] },
    ],
  },
  {
    id: "order_items",
    name: "Order Items",
    columns: [
      varchar("order_id", 64, true),
      varchar("product_id", 64, true),
      varchar("product_name", 150, true),
      varchar("sku", 64, true),
      varchar("size", 50),
      varchar("color", 50),
      float("unit_price", true),
      integer("quantity", true),
      float("line_total", true),
    ],
    indexes: [
      { key: "items_order_index", type: "key", columns: ["order_id"] },
      { key: "items_product_index", type: "key", columns: ["product_id"] },
    ],
  },
];

async function ensureTable(table) {
  const result = await db.listTables({ databaseId });
  const exists = result.tables.some((item) => item.$id === table.id);

  if (!exists) {
    await db.createTable({
      databaseId,
      tableId: table.id,
      name: table.name,
    });
    console.log(`Created table: ${table.id}`);
  } else {
    console.log(`Table already exists: ${table.id}`);
  }
}

async function ensureColumn(tableId, column) {
  const result = await db.listColumns({ databaseId, tableId });

  if (result.columns.some((item) => item.key === column.key)) {
    console.log(`  Column exists: ${column.key}`);
    return;
  }

  const common = {
    databaseId,
    tableId,
    key: column.key,
    required: column.required,
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
    case "datetime":
      await db.createDatetimeColumn(common);
      break;
    default:
      throw new Error(`Unknown column type: ${column.type}`);
  }

  console.log(`  Created column: ${column.key}`);
}

async function waitForColumns(tableId, expectedColumns) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = await db.listColumns({ databaseId, tableId });

    const ready = expectedColumns.every((column) => {
      const found = result.columns.find((item) => item.key === column.key);
      return found && found.status === "available";
    });

    if (ready) return;

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Columns for ${tableId} did not become available.`);
}

async function ensureIndexes(tableId, indexes) {
  for (const index of indexes) {
    const result = await db.listIndexes({ databaseId, tableId });

    if (result.indexes.some((item) => item.key === index.key)) {
      console.log(`  Index exists: ${index.key}`);
      continue;
    }

    await db.createIndex({
      databaseId,
      tableId,
      ...index,
    });

    console.log(`  Created index: ${index.key}`);
  }
}

async function main() {
  console.log("Creating clothing store tables...");

  for (const table of tables) {
    console.log(`\nSetting up ${table.name}...`);

    await ensureTable(table);

    for (const column of table.columns) {
      await ensureColumn(table.id, column);
    }

    await waitForColumns(table.id, table.columns);
    await ensureIndexes(table.id, table.indexes);
  }

  console.log("\nAll four additional tables are ready!");
}

main().catch((error) => {
  console.error("\nSetup failed:", error.message);
  process.exit(1);
});

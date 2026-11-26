import { connection, NextRequest, NextResponse } from "next/server";
import { Account, Client, ID } from "node-appwrite";
import { databaseId, tablesDB } from "@/lib/appwrite-admin";

type IncomingItem = {
  productId: string;
  size: string;
  color: string;
  quantity: number;
};

type AuthenticatedUser = {
  $id: string;
  name?: string;
  email?: string;
  emailVerification: boolean;
} | null;

const paymentMethods = [
  "mobile-money",
  "card",
  "bank-transfer",
  "cash",
];

function cleanString(value: unknown, maxLength = 255): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

export async function POST(request: NextRequest) {
  await connection();

  let transactionId: string | undefined;

  try {
    const body = await request.json();

    // Verify an optional signed-in customer using their Appwrite JWT.
    let authenticatedUser: AuthenticatedUser = null;

    const authorization = request.headers.get("authorization");

    if (authorization) {
      const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7).trim()
        : "";

      if (!token) {
        return NextResponse.json(
          { error: "Invalid authentication token." },
          { status: 401 }
        );
      }

      const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

      if (!endpoint || !projectId) {
        throw new Error(
          "Appwrite authentication configuration is missing."
        );
      }

      try {
        const jwtClient = new Client()
          .setEndpoint(endpoint)
          .setProject(projectId)
          .setJWT(token);

        authenticatedUser = await new Account(jwtClient).get();
      } catch {
        return NextResponse.json(
          {
            error:
              "Your session is invalid or expired. Please sign in again.",
          },
          { status: 401 }
        );
      }

      // Reject authenticated customers whose email is not verified.
      if (!authenticatedUser.emailVerification) {
        return NextResponse.json(
          {
            error:
              "Please verify your email address before placing an order.",
            code: "EMAIL_NOT_VERIFIED",
          },
          { status: 403 }
        );
      }
    }

    const customer = body.customer;
    const paymentMethod = cleanString(body.paymentMethod, 50);

    if (!customer || typeof customer !== "object") {
      return NextResponse.json(
        { error: "Customer information is required." },
        { status: 400 }
      );
    }

    const firstName = cleanString(customer.firstName, 75);
    const lastName = cleanString(customer.lastName, 75);

    // Use the authenticated Appwrite email for signed-in customers.
    const email =
      authenticatedUser?.email?.toLowerCase() ||
      cleanString(customer.email, 254).toLowerCase();

    const phone = cleanString(customer.phone, 30);
    const address = cleanString(customer.address, 255);
    const city = cleanString(customer.city, 100);
    const country = cleanString(customer.country, 100);
    const postalCode = cleanString(customer.postalCode, 30);

    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !country
    ) {
      return NextResponse.json(
        {
          error:
            "Please complete all required customer and delivery fields.",
        },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    if (!paymentMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Invalid payment method." },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "Your cart is empty." },
        { status: 400 }
      );
    }

    if (body.items.length > 50) {
      return NextResponse.json(
        { error: "Too many items in the cart." },
        { status: 400 }
      );
    }

    const items: IncomingItem[] = body.items.map(
      (item: Record<string, unknown>) => ({
        productId: cleanString(item.productId, 36),
        size: cleanString(item.size, 50),
        color: cleanString(item.color, 50),
        quantity: Number(item.quantity),
      })
    );

    for (const item of items) {
      if (
        !item.productId ||
        !item.size ||
        !item.color ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1 ||
        item.quantity > 8
      ) {
        return NextResponse.json(
          { error: "One or more cart items are invalid." },
          { status: 400 }
        );
      }
    }

    // Combine duplicate product selections for stock validation.
    const productQuantities = new Map<string, number>();

    for (const item of items) {
      const nextQuantity =
        (productQuantities.get(item.productId) ?? 0) + item.quantity;

      if (nextQuantity > 8) {
        return NextResponse.json(
          { error: "Maximum quantity per product is 8." },
          { status: 400 }
        );
      }

      productQuantities.set(item.productId, nextQuantity);
    }

    // Start a transaction before reading products.
    const transaction = await tablesDB.createTransaction({
      ttl: 120,
    });

    transactionId = transaction.$id;

    type ProductRecord = {
      $id: string;
      name: string;
      sku: string;
      price: number;
      sizes: string[];
      colors: string[];
      stock_quantity: number;
      is_active: boolean;
    };

    const products = new Map<string, ProductRecord>();

    for (const productId of productQuantities.keys()) {
      const product = (await tablesDB.getRow({
        databaseId,
        tableId: "products",
        rowId: productId,
        transactionId,
      })) as unknown as ProductRecord;

      if (!product.is_active) {
        throw new Error(`${product.name} is no longer available.`);
      }

      const requestedQuantity = productQuantities.get(productId)!;

      if (
        !Number.isInteger(product.stock_quantity) ||
        product.stock_quantity < requestedQuantity
      ) {
        throw new Error(
          `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}.`
        );
      }

      if (!Number.isFinite(product.price) || product.price < 0) {
        throw new Error(`Invalid price for ${product.name}.`);
      }

      products.set(productId, product);
    }

    let subtotal = 0;

    const orderLines = items.map((item) => {
      const product = products.get(item.productId)!;

      if (!product.sizes.includes(item.size)) {
        throw new Error(
          `Size ${item.size} is unavailable for ${product.name}.`
        );
      }

      if (!product.colors.includes(item.color)) {
        throw new Error(
          `Colour ${item.color} is unavailable for ${product.name}.`
        );
      }

      const unitPrice = Number(product.price);
      const lineTotal =
        Math.round(unitPrice * item.quantity * 100) / 100;

      subtotal += lineTotal;

      return {
        productId: product.$id,
        productName: product.name,
        sku: product.sku,
        size: item.size,
        color: item.color,
        unitPrice,
        quantity: item.quantity,
        lineTotal,
      };
    });

    subtotal = Math.round(subtotal * 100) / 100;

    const shippingFee = subtotal >= 100 ? 0 : 5;
    const total = Math.round((subtotal + shippingFee) * 100) / 100;

    // Registered customers use their Appwrite account ID.
    // Guests receive a new customer ID.
    const customerId = authenticatedUser
      ? authenticatedUser.$id
      : ID.unique();

    const orderId = ID.unique();

    const orderNumber = `VW-${Date.now()}-${ID.unique()
      .slice(0, 6)
      .toUpperCase()}`;

    const deliveryAddress = postalCode
      ? `${address}, ${postalCode}`
      : address;

    const customerData = {
      user_id: customerId,
      full_name: `${firstName} ${lastName}`,
      email,
      phone,
      address_line: deliveryAddress,
      city,
      country,
    };

    // Create or update the customer record.
    if (authenticatedUser) {
      let customerExists = false;

      try {
        await tablesDB.getRow({
          databaseId,
          tableId: "customers",
          rowId: customerId,
          transactionId,
        });

        customerExists = true;
      } catch (error) {
        const isNotFound =
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === 404;

        if (!isNotFound) {
          throw error;
        }
      }

      if (customerExists) {
        await tablesDB.updateRow({
          databaseId,
          tableId: "customers",
          rowId: customerId,
          transactionId,
          data: customerData,
        });
      } else {
        await tablesDB.createRow({
          databaseId,
          tableId: "customers",
          rowId: customerId,
          permissions: [],
          transactionId,
          data: customerData,
        });
      }
    } else {
      // Guest checkout remains available.
      await tablesDB.createRow({
        databaseId,
        tableId: "customers",
        rowId: customerId,
        permissions: [],
        transactionId,
        data: customerData,
      });
    }

    // Create the order.
    await tablesDB.createRow({
      databaseId,
      tableId: "orders",
      rowId: orderId,
      permissions: [],
      transactionId,
      data: {
        order_number: orderNumber,
        customer_id: customerId,
        subtotal,
        shipping_fee: shippingFee,
        total,
        currency: "USD",
        payment_method: paymentMethod,
        payment_status: "pending",
        order_status: "pending",
        delivery_name: `${firstName} ${lastName}`,
        delivery_phone: phone,
        delivery_address: deliveryAddress,
        delivery_city: city,
        customer_notes: null,
        placed_at: new Date().toISOString(),
      },
    });

    // Create individual order items.
    for (const item of orderLines) {
      await tablesDB.createRow({
        databaseId,
        tableId: "order_items",
        rowId: ID.unique(),
        permissions: [],
        transactionId,
        data: {
          order_id: orderId,
          product_id: item.productId,
          product_name: item.productName,
          sku: item.sku,
          size: item.size,
          color: item.color,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          line_total: item.lineTotal,
        },
      });
    }

    // Reduce stock once per product.
    for (const [productId, quantity] of productQuantities.entries()) {
      const product = products.get(productId)!;

      await tablesDB.updateRow({
        databaseId,
        tableId: "products",
        rowId: productId,
        transactionId,
        data: {
          stock_quantity: product.stock_quantity - quantity,
        },
      });
    }

    // Commit all staged changes together.
    await tablesDB.updateTransaction({
      transactionId,
      commit: true,
    });

    transactionId = undefined;

    return NextResponse.json(
      {
        success: true,
        message: "Your order has been created successfully.",
        orderNumber,
        subtotal,
        shippingFee,
        total,
        currency: "USD",
        paymentStatus: "pending",
      },
      { status: 201 }
    );
  } catch (error) {
    if (transactionId) {
      try {
        await tablesDB.updateTransaction({
          transactionId,
          rollback: true,
        });
      } catch (rollbackError) {
        console.error(
          "Order transaction rollback failed:",
          rollbackError
        );
      }
    }

    console.error("Order creation failed:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create your order.";

    const isClientError =
      message.includes("Insufficient stock") ||
      message.includes("unavailable") ||
      message.includes("Invalid price");

    return NextResponse.json(
      {
        error: isClientError
          ? message
          : "Unable to create your order. Please try again.",
      },
      { status: isClientError ? 409 : 500 }
    );
  }
}
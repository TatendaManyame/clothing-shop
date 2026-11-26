
import { connection, NextRequest, NextResponse } from "next/server";
import { Account, Client, Query } from "node-appwrite";
import { databaseId, tablesDB } from "@/lib/appwrite-admin";

type AuthenticatedUser = {
  $id: string;
  email?: string;
} | null;

type OrderRecord = {
  $id: string;
  order_number: string;
  customer_id: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  order_status: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_address: string;
  delivery_city: string;
  customer_notes?: string | null;
  placed_at: string;
};

type OrderItemRecord = {
  $id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  sku: string;
  size: string | null;
  color: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export async function GET(request: NextRequest) {
  await connection();

  try {
    // Require a valid signed-in Appwrite customer.
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Please sign in to view your orders." },
        { status: 401 }
      );
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return NextResponse.json(
        { error: "Invalid authentication token." },
        { status: 401 }
      );
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    if (!endpoint || !projectId) {
      throw new Error("Appwrite authentication configuration is missing.");
    }

    let authenticatedUser: AuthenticatedUser;

    try {
      const jwtClient = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setJWT(token);

      authenticatedUser = await new Account(jwtClient).get();
    } catch {
      return NextResponse.json(
        {
          error: "Your session is invalid or expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    if (!authenticatedUser?.$id) {
      return NextResponse.json(
        { error: "Unable to verify your customer account." },
        { status: 401 }
      );
    }

    // Only retrieve orders belonging to the verified Appwrite user.
    const orderResult = await tablesDB.listRows({
      databaseId,
      tableId: "orders",
      queries: [
        Query.equal("customer_id", authenticatedUser.$id),
        Query.orderDesc("placed_at"),
        Query.limit(100),
      ],
      total: false,
      ttl: 0,
    });

    const orders = orderResult.rows as unknown as OrderRecord[];

    // Retrieve the items belonging to each order.
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const itemResult = await tablesDB.listRows({
          databaseId,
          tableId: "order_items",
          queries: [
            Query.equal("order_id", order.$id),
            Query.limit(100),
          ],
          total: false,
          ttl: 0,
        });

        const items = itemResult.rows as unknown as OrderItemRecord[];

        return {
          id: order.$id,
          orderNumber: order.order_number,
          placedAt: order.placed_at,
          subtotal: order.subtotal,
          shippingFee: order.shipping_fee,
          total: order.total,
          currency: order.currency,
          paymentMethod: order.payment_method,
          paymentStatus: order.payment_status,
          orderStatus: order.order_status,
          delivery: {
            name: order.delivery_name,
            phone: order.delivery_phone,
            address: order.delivery_address,
            city: order.delivery_city,
          },
          customerNotes: order.customer_notes ?? "",
          items: items.map((item) => ({
            id: item.$id,
            productId: item.product_id,
            productName: item.product_name,
            sku: item.sku,
            size: item.size,
            color: item.color,
            unitPrice: item.unit_price,
            quantity: item.quantity,
            lineTotal: item.line_total,
          })),
        };
      })
    );

    return NextResponse.json({
      success: true,
      orders: ordersWithItems,
    });
  } catch (error) {
    console.error("Customer order history error:", error);

    return NextResponse.json(
      { error: "Unable to load your order history. Please try again." },
      { status: 500 }
    );
  }
}

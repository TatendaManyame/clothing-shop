
import { connection, NextRequest, NextResponse } from "next/server";
import { Account, AppwriteException, Client, Query } from "node-appwrite";
import { databaseId, tablesDB } from "@/lib/appwrite-admin";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connection();

  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Please sign in to view this order." },
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

    let user;

    try {
      const jwtClient = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setJWT(token);

      user = await new Account(jwtClient).get();
    } catch {
      return NextResponse.json(
        { error: "Your session is invalid or expired. Please sign in again." },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id || id.length > 36) {
      return NextResponse.json(
        { error: "Invalid order reference." },
        { status: 400 }
      );
    }

    let order: OrderRecord;

    try {
      const result = await tablesDB.getRow({
        databaseId,
        tableId: "orders",
        rowId: id,
      });

      order = result as unknown as OrderRecord;
    } catch (error) {
      if (error instanceof AppwriteException && error.code === 404) {
        return NextResponse.json(
          { error: "Order not found." },
          { status: 404 }
        );
      }

      throw error;
    }

    // Never disclose an order belonging to another customer.
    if (order.customer_id !== user.$id) {
      return NextResponse.json(
        { error: "Order not found." },
        { status: 404 }
      );
    }

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

    return NextResponse.json({
      success: true,
      order: {
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
      },
    });
  } catch (error) {
    console.error("Customer order details error:", error);

    return NextResponse.json(
      { error: "Unable to load this order. Please try again." },
      { status: 500 }
    );
  }
}

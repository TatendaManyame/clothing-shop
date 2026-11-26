import { NextRequest, NextResponse } from "next/server";
import { AppwriteException, Query } from "node-appwrite";
import { databaseId, tablesDB } from "@/lib/appwrite-admin";
import { getAdminUserId } from "@/lib/admin-auth";

const validOrderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const validPaymentStatuses = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

type UpdateOrderBody = {
  orderStatus?: string;
  paymentStatus?: string;
};

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
  customer_notes?: string;
  placed_at: string;
};

type CustomerRecord = {
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
};

type OrderItemRecord = {
  $id: string;
  product_id: string;
  order_id: string;
  product_name: string;
  sku: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await getAdminUserId(request);

    if (!adminId) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    let order: OrderRecord;

    try {
      order = await tablesDB.getRow({
        databaseId,
        tableId: "orders",
        rowId: id,
      }) as unknown as OrderRecord;
    } catch (error) {
      if (
        error instanceof AppwriteException &&
        error.code === 404
      ) {
        return NextResponse.json(
          { error: "Order not found." },
          { status: 404 }
        );
      }

      throw error;
    }

    const [customerResult, itemResult] = await Promise.all([
      tablesDB.listRows({
        databaseId,
        tableId: "customers",
        queries: [
          Query.equal("user_id", order.customer_id),
          Query.limit(1),
        ],
        total: false,
        ttl: 0,
      }),
      tablesDB.listRows({
        databaseId,
        tableId: "order_items",
        queries: [
          Query.equal("order_id", order.$id),
          Query.limit(100),
        ],
        total: false,
        ttl: 0,
      }),
    ]);

    const customer =
      (customerResult.rows[0] as unknown as CustomerRecord) || null;

    const items = itemResult.rows as unknown as OrderItemRecord[];

    return NextResponse.json({
      success: true,
      order: {
        id: order.$id,
        orderNumber: order.order_number,
        customerId: order.customer_id,
        customer: {
          name: customer?.full_name || order.delivery_name,
          email: customer?.email || "",
          phone: customer?.phone || order.delivery_phone,
        },
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
        customerNotes: order.customer_notes || "",
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
      viewedBy: adminId,
    });
  } catch (error) {
    console.error("Admin order retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve order details." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const adminId = await getAdminUserId(request);

    if (!adminId) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Order ID is required." },
        { status: 400 }
      );
    }

    let body: UpdateOrderBody;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const updates: Record<string, string> = {};

    if (body.orderStatus !== undefined) {
      if (!validOrderStatuses.includes(body.orderStatus)) {
        return NextResponse.json(
          { error: "Invalid order status." },
          { status: 400 }
        );
      }

      updates.order_status = body.orderStatus;
    }

    if (body.paymentStatus !== undefined) {
      if (!validPaymentStatuses.includes(body.paymentStatus)) {
        return NextResponse.json(
          { error: "Invalid payment status." },
          { status: 400 }
        );
      }

      updates.payment_status = body.paymentStatus;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Provide at least one status to update." },
        { status: 400 }
      );
    }

    const updatedOrder = await tablesDB.updateRow({
      databaseId,
      tableId: "orders",
      rowId: id,
      data: updates,
    });

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: {
        id: updatedOrder.$id,
        orderStatus: updatedOrder.order_status,
        paymentStatus: updatedOrder.payment_status,
      },
      updatedBy: adminId,
    });
  } catch (error) {
    console.error("Admin order update failed:", error);

    return NextResponse.json(
      { error: "Unable to update order. Check that the order exists." },
      { status: 500 }
    );
  }
}

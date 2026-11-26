import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { databaseId, tablesDB } from "@/lib/appwrite-admin";
import { getAdminUserId } from "@/lib/admin-auth";

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
  order_id: string;
  product_name: string;
  sku: string;
  size: string | null;
  color: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

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

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminUserId(request);

    if (!adminId) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const search = (searchParams.get("search") || "").trim().toLowerCase();
    const orderStatus = searchParams.get("orderStatus") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "";

    if (
      orderStatus &&
      !validOrderStatuses.includes(orderStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid order status filter." },
        { status: 400 }
      );
    }

    if (
      paymentStatus &&
      !validPaymentStatuses.includes(paymentStatus)
    ) {
      return NextResponse.json(
        { error: "Invalid payment status filter." },
        { status: 400 }
      );
    }

    const queries = [
      Query.orderDesc("placed_at"),
      Query.limit(100),
    ];

    if (orderStatus) {
      queries.push(Query.equal("order_status", orderStatus));
    }

    if (paymentStatus) {
      queries.push(Query.equal("payment_status", paymentStatus));
    }

    const result = await tablesDB.listRows({
      databaseId,
      tableId: "orders",
      queries,
      total: true,
      ttl: 0,
    });

    const orders = result.rows as unknown as OrderRecord[];

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        let customer: CustomerRecord | null = null;
        let items: OrderItemRecord[] = [];

        try {
          const customerResult = await tablesDB.listRows({
            databaseId,
            tableId: "customers",
            queries: [
              Query.equal("user_id", order.customer_id),
              Query.limit(1),
            ],
            total: false,
            ttl: 0,
          });

          customer =
            (customerResult.rows[0] as unknown as CustomerRecord) ||
            null;
        } catch (error) {
          console.error("Customer lookup failed:", error);
        }

        try {
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

          items = itemResult.rows as unknown as OrderItemRecord[];
        } catch (error) {
          console.error("Order item lookup failed:", error);
        }

        return {
          id: order.$id,
          orderNumber: order.order_number,
          customerId: order.customer_id,
          customer: {
            name: customer?.full_name || order.delivery_name,
            email: customer?.email || "",
            phone: customer?.phone || order.delivery_phone,
          },
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
          placedAt: order.placed_at,
          items: items.map((item) => ({
            id: item.$id,
            productName: item.product_name,
            sku: item.sku,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            lineTotal: item.line_total,
          })),
        };
      })
    );

    const filteredOrders = search
      ? enrichedOrders.filter((order) => {
          return (
            order.orderNumber.toLowerCase().includes(search) ||
            order.customer.name.toLowerCase().includes(search) ||
            order.customer.email.toLowerCase().includes(search) ||
            order.customer.phone.toLowerCase().includes(search)
          );
        })
      : enrichedOrders;

    return NextResponse.json({
      success: true,
      orders: filteredOrders,
      total: filteredOrders.length,
      availableOrders: result.total,
    });
  } catch (error) {
    console.error("Admin orders retrieval failed:", error);

    return NextResponse.json(
      { error: "Unable to retrieve orders." },
      { status: 500 }
    );
  }
}
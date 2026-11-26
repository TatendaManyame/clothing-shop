import { NextRequest, NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { databaseId, tablesDB } from "@/lib/appwrite-admin";
import { getAdminUserId } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminUserId(request);

    if (!adminId) {
      return NextResponse.json(
        { error: "Administrator access required." },
        { status: 403 }
      );
    }

    const orders: Record<string, unknown>[] = [];
    let offset = 0;
    const pageSize = 100;

    while (true) {
      const result = await tablesDB.listRows({
        databaseId,
        tableId: "orders",
        queries: [
          Query.orderDesc("placed_at"),
          Query.limit(pageSize),
          Query.offset(offset),
        ],
      });

      const rows = result.rows as Record<string, unknown>[];
      orders.push(...rows);

      if (rows.length < pageSize) break;
      offset += pageSize;
    }

    const totalOrders = orders.length;

    const pendingOrders = orders.filter(
      (order) => order.order_status === "pending"
    ).length;

    const processingOrders = orders.filter(
      (order) => order.order_status === "processing"
    ).length;

    const completedOrders = orders.filter(
      (order) => order.order_status === "delivered"
    ).length;

    const revenue: Record<string, number> = {};

    for (const order of orders) {
      if (order.payment_status !== "paid") continue;

      const currency = String(order.currency || "USD");
      const total = Number(order.total || 0);

      revenue[currency] = (revenue[currency] || 0) + total;
    }

    const recentOrders = await Promise.all(
      orders.slice(0, 8).map(async (order) => {
        let customerName = String(order.delivery_name || "Customer");

        try {
          const customerResult = await tablesDB.listRows({
            databaseId,
            tableId: "customers",
            queries: [
              Query.equal("user_id", String(order.customer_id)),
              Query.limit(1),
            ],
          });

          const customer = customerResult.rows[0] as
            | Record<string, unknown>
            | undefined;

          if (customer?.full_name) {
            customerName = String(customer.full_name);
          }
        } catch {
          // Keep the delivery name if customer lookup fails.
        }

        return {
          id: String(order.$id),
          orderNumber: String(order.order_number || order.$id),
          customerName,
          orderStatus: String(order.order_status || "pending"),
          paymentStatus: String(order.payment_status || "pending"),
          total: Number(order.total || 0),
          currency: String(order.currency || "USD"),
          placedAt: String(order.placed_at || ""),
        };
      })
    );

    return NextResponse.json({
      success: true,
      metrics: {
        totalOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
      },
      revenue,
      recentOrders,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return NextResponse.json(
      { error: "Unable to load dashboard information." },
      { status: 500 }
    );
  }
}


"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { account } from "@/lib/appwrite";

type Order = {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  delivery: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  placedAt: string;
  items: {
    id: string;
    productName: string;
    sku: string;
    size: string | null;
    color: string | null;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }[];
};

const orderStatuses = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const paymentStatuses = ["pending", "paid", "failed", "refunded"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const getToken = useCallback(async () => {
    const jwt = await account.createJWT();
    return jwt.jwt;
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (orderStatus) params.set("orderStatus", orderStatus);
      if (paymentStatus) params.set("paymentStatus", paymentStatus);

      const response = await fetch(
        `/api/admin/orders?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to load orders.");
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, search, orderStatus, paymentStatus]);

  useEffect(() => {
    let active = true;

    async function initialise() {
      try {
        await account.get();

        if (active) {
          await loadOrders();
        }
      } catch {
        if (active) {
          window.location.href = "/login";
        }
      }
    }

    initialise();

    return () => {
      active = false;
    };
  }, [loadOrders]);

  async function updateStatus(
    orderId: string,
    field: "orderStatus" | "paymentStatus",
    value: string
  ) {
    setUpdatingId(orderId);
    setError("");

    try {
      const token = await getToken();

      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update order.");
      }

      await loadOrders();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order."
      );
    } finally {
      setUpdatingId("");
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  function formatMoney(value: number, currency: string) {
    return `${currency} ${Number(value).toFixed(2)}`;
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-900">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <Link href="/" className="text-2xl font-black tracking-[0.2em]">
              VICWAV
            </Link>
            <p className="mt-2 text-xs font-bold tracking-[0.2em] text-neutral-500">
              ADMINISTRATION
            </p>
          </div>

          <div className="flex gap-4 text-sm font-semibold">
            <Link href="/account" className="underline underline-offset-4">
              My account
            </Link>
            <Link href="/shop" className="underline underline-offset-4">
              Shop
            </Link>
          </div>
        </header>

        <div className="mb-8">
          <p className="mb-2 text-xs font-bold tracking-[0.2em] text-neutral-500">
            STORE MANAGEMENT
          </p>
          <h1 className="text-3xl font-semibold">Order management</h1>
          <p className="mt-2 text-sm text-neutral-500">
            View customer orders and manage their order and payment statuses.
          </p>
        </div>

        <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider">
                Search orders
              </label>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") loadOrders();
                }}
                placeholder="Order number, customer, email or phone"
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider">
                Order status
              </label>
              <select
                value={orderStatus}
                onChange={(event) => setOrderStatus(event.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm"
              >
                <option value="">All order statuses</option>
                {orderStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider">
                Payment status
              </label>
              <select
                value={paymentStatus}
                onChange={(event) => setPaymentStatus(event.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm"
              >
                <option value="">All payment statuses</option>
                {paymentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
            >
              {loading ? "LOADING..." : "APPLY FILTERS"}
            </button>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setOrderStatus("");
                setPaymentStatus("");
              }}
              className="rounded-lg border border-neutral-300 px-6 py-3 text-sm font-semibold hover:bg-neutral-100"
            >
              CLEAR FILTERS
            </button>

            <button
              type="button"
              onClick={loadOrders}
              disabled={loading}
              className="rounded-lg border border-neutral-300 px-6 py-3 text-sm font-semibold hover:bg-neutral-100 disabled:opacity-50"
            >
              REFRESH
            </button>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Customer orders</h2>
          <p className="text-sm text-neutral-500">
            {orders.length} order{orders.length === 1 ? "" : "s"} displayed
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center text-sm">
            Loading orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
            <p className="font-semibold">No orders found</p>
            <p className="mt-2 text-sm text-neutral-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article
                key={order.id}
                className="rounded-xl border border-neutral-200 bg-white p-5 md:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-100 pb-5">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-neutral-500">
                      ORDER NUMBER
                    </p>
                    <Link
                      href={`/admin/orders/${encodeURIComponent(order.id)}`}
                      className="mt-1 inline-block text-xl font-semibold underline underline-offset-4 hover:text-neutral-500"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-2 text-xs text-neutral-500">
                      {formatDate(order.placedAt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-neutral-500">ORDER TOTAL</p>
                    <p className="mt-1 text-xl font-bold">
                      {formatMoney(order.total, order.currency)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 py-6 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Customer
                    </h4>
                    <p className="text-sm font-semibold">
                      {order.customer.name}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {order.customer.email || "No email available"}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {order.customer.phone || "No phone available"}
                    </p>
                  </div>

                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Delivery details
                    </h4>
                    <p className="text-sm font-semibold">
                      {order.delivery.name}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {order.delivery.phone}
                    </p>
                    <p className="mt-1 text-sm text-neutral-600">
                      {order.delivery.address}, {order.delivery.city}
                    </p>
                  </div>
                </div>

                <div className="border-t border-neutral-100 py-5">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Items ordered
                  </h4>

                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-wrap justify-between gap-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="mt-1 text-xs text-neutral-500">
                            SKU: {item.sku} · Size: {item.size || "N/A"} ·
                            Colour: {item.color || "N/A"} · Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">
                          {formatMoney(item.lineTotal, order.currency)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 border-t border-neutral-100 pt-5 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Update order status
                    </h4>
                    <select
                      value={order.orderStatus}
                      disabled={updatingId === order.id}
                      onChange={(event) =>
                        updateStatus(order.id, "orderStatus", event.target.value)
                      }
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm disabled:opacity-50"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Update payment status
                    </h4>
                    <select
                      value={order.paymentStatus}
                      disabled={updatingId === order.id}
                      onChange={(event) =>
                        updateStatus(
                          order.id,
                          "paymentStatus",
                          event.target.value
                        )
                      }
                      className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-3 text-sm disabled:opacity-50"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-neutral-100 pt-5 text-sm">
                  <p className="text-neutral-500">
                    Payment method:{" "}
                    <span className="font-semibold text-neutral-900">
                      {order.paymentMethod}
                    </span>
                  </p>

                  {updatingId === order.id && (
                    <p className="font-semibold text-neutral-500">
                      Updating order...
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

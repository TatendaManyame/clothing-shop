"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { account } from "@/lib/appwrite";

type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  placedAt: string;
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
  customerNotes: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    sku: string;
    size: string | null;
    color: string | null;
    unitPrice: number;
    quantity: number;
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

const progressSteps = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

function OrderDetailsContent() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const getToken = useCallback(async () => {
    const jwt = await account.createJWT();
    return jwt.jwt;
  }, []);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(orderId)}`,
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

      if (response.status === 403) {
        throw new Error("Administrator access required.");
      }

      if (!response.ok) {
        throw new Error(data.error || "Unable to load order details.");
      }

      setOrder(data.order);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load order details."
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, orderId]);

  useEffect(() => {
    let active = true;

    async function initialise() {
      try {
        await account.get();

        if (active) {
          await loadOrder();
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
  }, [loadOrder]);

  async function updateStatus(
    field: "orderStatus" | "paymentStatus",
    value: string
  ) {
    if (!order) return;

    setUpdating(true);
    setError("");

    try {
      const token = await getToken();

      const response = await fetch(
        `/api/admin/orders/${encodeURIComponent(order.id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ [field]: value }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to update order.");
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              [field]: value,
            }
          : current
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update order."
      );
    } finally {
      setUpdating(false);
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString();
  }

  function formatMoney(value: number) {
    return `${order?.currency || "USD"} ${Number(value).toFixed(2)}`;
  }

  function getProgressIndex(status: string) {
    return progressSteps.indexOf(status);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-neutral-50 p-8 text-center text-sm text-neutral-600">
        Loading order details...
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-neutral-50 px-5 py-16 text-neutral-900">
        <div className="mx-auto max-w-3xl rounded-xl border border-neutral-200 bg-white p-8 text-center">
          <h1 className="text-xl font-semibold">Unable to load order</h1>
          <p className="mt-3 text-sm text-red-600">
            {error || "This order could not be found."}
          </p>
          <Link
            href="/admin/orders"
            className="mt-6 inline-block rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white"
          >
            BACK TO ORDERS
          </Link>
        </div>
      </main>
    );
  }

  const progressIndex = getProgressIndex(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <Link href="/" className="text-2xl font-black tracking-[0.2em]">
              VICWAV
            </Link>
            <p className="mt-2 text-xs font-bold tracking-[0.2em] text-neutral-500">
              ADMINISTRATION
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-sm font-semibold underline underline-offset-4"
          >
            ← Back to order management
          </Link>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <section className="mb-8 flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-neutral-500">
              ORDER DETAILS
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              {order.orderNumber}
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Placed {formatDate(order.placedAt)}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-xs text-neutral-500">ORDER TOTAL</p>
            <p className="mt-1 text-2xl font-bold">
              {formatMoney(order.total)}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold">Order progress</h2>

          {isCancelled ? (
            <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
              This order has been cancelled.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
              {progressSteps.map((step, index) => {
                const completed = progressIndex >= index;

                return (
                  <div key={step} className="flex items-center gap-3 sm:block">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        completed
                          ? "bg-black text-white"
                          : "bg-neutral-100 text-neutral-400"
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>
                    <p
                      className={`text-xs font-semibold uppercase sm:mt-3 ${
                        completed ? "text-neutral-900" : "text-neutral-400"
                      }`}
                    >
                      {step}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Customer information</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Customer name
              </p>
              <p className="mt-2 text-sm font-semibold">
                {order.customer.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Customer email
              </p>
              <p className="mt-2 break-all text-sm">
                {order.customer.email || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Customer phone
              </p>
              <p className="mt-2 text-sm">
                {order.customer.phone || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Customer account ID
              </p>
              <p className="mt-2 break-all text-xs text-neutral-600">
                {order.customerId}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Delivery information</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Recipient
              </p>
              <p className="mt-2 text-sm font-semibold">
                {order.delivery.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Contact number
              </p>
              <p className="mt-2 text-sm">{order.delivery.phone}</p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Delivery address
              </p>
              <p className="mt-2 text-sm">
                {order.delivery.address}, {order.delivery.city}
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-neutral-100 pt-5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
              Customer notes
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-neutral-700">
              {order.customerNotes || "No additional notes."}
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Products ordered</h2>

          <div className="space-y-5">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap justify-between gap-4 border-b border-neutral-100 pb-5 last:border-0 last:pb-0"
              >
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    SKU: {item.sku}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Size: {item.size || "N/A"} · Colour: {item.color || "N/A"}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    Quantity: {item.quantity} × {formatMoney(item.unitPrice)}
                  </p>
                </div>

                <p className="font-semibold">{formatMoney(item.lineTotal)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Payment summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-neutral-500">Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-neutral-500">Shipping fee</span>
              <span>{formatMoney(order.shippingFee)}</span>
            </div>

            <div className="flex justify-between gap-4 border-t border-neutral-200 pt-4 text-base font-bold">
              <span>Total</span>
              <span>{formatMoney(order.total)}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-5 border-t border-neutral-100 pt-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Payment method
              </p>
              <p className="mt-2 text-sm font-semibold">
                {order.paymentMethod}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Payment status
              </p>
              <p className="mt-2 text-sm font-semibold uppercase">
                {order.paymentStatus}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="mb-5 text-lg font-semibold">Manage order</h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="orderStatus"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500"
              >
                Order status
              </label>
              <select
                id="orderStatus"
                value={order.orderStatus}
                disabled={updating}
                onChange={(event) =>
                  updateStatus("orderStatus", event.target.value)
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
              <label
                htmlFor="paymentStatus"
                className="mb-2 block text-xs font-bold uppercase tracking-wider text-neutral-500"
              >
                Payment status
              </label>
              <select
                id="paymentStatus"
                value={order.paymentStatus}
                disabled={updating}
                onChange={(event) =>
                  updateStatus("paymentStatus", event.target.value)
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

          {updating && (
            <p className="mt-4 text-sm text-neutral-500">
              Updating order...
            </p>
          )}
        </section>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            BACK TO ORDER MANAGEMENT
          </Link>

          <button
            type="button"
            onClick={loadOrder}
            disabled={loading || updating}
            className="rounded-lg border border-neutral-300 px-6 py-3 text-sm font-semibold hover:bg-neutral-100 disabled:opacity-50"
          >
            REFRESH DETAILS
          </button>
        </div>
      </div>
    </main>
  );
}

export default function AdminOrderDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-50 p-8 text-center text-sm">
          Loading order details...
        </main>
      }
    >
      <OrderDetailsContent />
    </Suspense>
  );
}

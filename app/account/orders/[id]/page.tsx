
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { account } from "@/lib/appwrite";

type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

type Order = {
  id: string;
  orderNumber: string;
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
  items: OrderItem[];
};

const progressSteps = [
  {
    key: "pending",
    label: "Order placed",
    description: "Your order has been received.",
  },
  {
    key: "confirmed",
    label: "Payment confirmed",
    description: "Your payment has been confirmed.",
  },
  {
    key: "processing",
    label: "Processing",
    description: "Your order is being prepared.",
  },
  {
    key: "shipped",
    label: "Shipped",
    description: "Your order is on its way.",
  },
  {
    key: "delivered",
    label: "Delivered",
    description: "Your order has been delivered.",
  },
];

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${amount.toFixed(2)}`;
  }
}

function formatDate(date: string) {
  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status: string) {
  return (status || "pending")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getProgressIndex(status: string) {
  const normalized = (status || "pending").toLowerCase();

  if (["cancelled", "canceled", "refunded"].includes(normalized)) {
    return -1;
  }

  const indexes: Record<string, number> = {
    pending: 0,
    confirmed: 1,
    paid: 1,
    processing: 2,
    shipped: 3,
    dispatched: 3,
    "out for delivery": 3,
    delivered: 4,
  };

  return indexes[normalized] ?? 0;
}

function OrderDetailsContent() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrder() {
      try {
        const user = await account.get();

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const jwt = await account.createJWT();

        const response = await fetch(
          `/api/account/orders/${encodeURIComponent(orderId)}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwt.jwt}`,
            },
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(result.error || "Unable to load this order.");
        }

        if (active) {
          setOrder(result.order);
        }
      } catch (err: unknown) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (orderId) {
      loadOrder();
    }

    return () => {
      active = false;
    };
  }, [orderId]);

  const progressIndex = getProgressIndex(order?.orderStatus || "pending");
  const isCancelled = progressIndex === -1;

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between border-b border-neutral-200 pb-6">
          <Link href="/" className="text-xl font-black tracking-[0.2em]">
            VICWAV
          </Link>

          <Link
            href="/account"
            className="text-sm font-medium text-neutral-600 hover:text-black"
          >
            My account
          </Link>
        </header>

        <div className="mb-8">
          <Link
            href="/account/orders"
            className="text-sm text-neutral-500 hover:text-black"
          >
            ← Back to my orders
          </Link>

          <p className="mb-3 mt-8 text-xs font-semibold tracking-[0.25em] text-neutral-500">
            CUSTOMER ACCOUNT
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Order details
          </h1>
        </div>

        {loading && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <p className="text-sm text-neutral-500">
              Loading order details...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white p-8">
            <h2 className="font-semibold text-red-700">
              Unable to load order
            </h2>
            <p className="mt-2 text-sm text-neutral-600">{error}</p>
            <Link
              href="/account/orders"
              className="mt-5 inline-block text-sm font-semibold underline"
            >
              Return to my orders
            </Link>
          </div>
        )}

        {!loading && !error && order && (
          <div className="space-y-7">
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-semibold tracking-widest text-neutral-400">
                    ORDER NUMBER
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">
                    {order.orderNumber}
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">
                    Placed on {formatDate(order.placedAt)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium">
                    {formatStatus(order.orderStatus)}
                  </span>
                  <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium">
                    Payment: {formatStatus(order.paymentStatus)}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Order progress</h2>
              <p className="mt-1 text-sm text-neutral-500">
                Follow the status of your purchase.
              </p>

              {isCancelled ? (
                <div className="mt-6 rounded-xl bg-red-50 p-5">
                  <p className="font-semibold text-red-700">
                    {formatStatus(order.orderStatus)}
                  </p>
                  <p className="mt-1 text-sm text-red-600">
                    This order is no longer progressing through delivery.
                  </p>
                </div>
              ) : (
                <div className="mt-7 space-y-6">
                  {progressSteps.map((step, index) => {
                    const completed = index <= progressIndex;
                    const current = index === progressIndex;

                    return (
                      <div key={step.key} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                              completed
                                ? "bg-black text-white"
                                : "border border-neutral-300 bg-white text-neutral-400"
                            }`}
                          >
                            {completed ? "✓" : index + 1}
                          </div>

                          {index !== progressSteps.length - 1 && (
                            <div
                              className={`mt-2 min-h-7 w-px ${
                                index < progressIndex
                                  ? "bg-black"
                                  : "bg-neutral-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="pb-2">
                          <p
                            className={`text-sm font-semibold ${
                              completed ? "text-black" : "text-neutral-400"
                            }`}
                          >
                            {step.label}
                            {current && (
                              <span className="ml-2 text-xs font-medium text-neutral-500">
                                Current stage
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-sm text-neutral-500">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <p className="mt-6 border-t border-neutral-100 pt-4 text-xs text-neutral-400">
                Progress updates when the store updates your order status.
                This page does not provide live courier location tracking.
              </p>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
              <h2 className="text-lg font-semibold">Items ordered</h2>

              <div className="mt-6 divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col justify-between gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div>
                      <p className="font-semibold">{item.productName}</p>
                      <p className="mt-1 text-xs text-neutral-500">
                        SKU: {item.sku}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Size: {item.size || "N/A"} · Colour:{" "}
                        {item.color || "N/A"} · Quantity: {item.quantity}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        Unit price: {formatMoney(item.unitPrice, order.currency)}
                      </p>
                    </div>

                    <p className="font-semibold">
                      {formatMoney(item.lineTotal, order.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <div className="grid gap-7 md:grid-cols-2">
              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h2 className="text-lg font-semibold">Delivery information</h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div>
                    <p className="text-xs text-neutral-400">RECIPIENT</p>
                    <p className="mt-1 font-medium">{order.delivery.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">PHONE</p>
                    <p className="mt-1">{order.delivery.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-400">ADDRESS</p>
                    <p className="mt-1">{order.delivery.address}</p>
                    <p>{order.delivery.city}</p>
                  </div>
                </div>

                {order.customerNotes && (
                  <div className="mt-5 border-t border-neutral-100 pt-4">
                    <p className="text-xs text-neutral-400">ORDER NOTES</p>
                    <p className="mt-2 text-sm">{order.customerNotes}</p>
                  </div>
                )}
              </section>

              <section className="rounded-2xl border border-neutral-200 bg-white p-6">
                <h2 className="text-lg font-semibold">Payment summary</h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span>{formatMoney(order.subtotal, order.currency)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span>{formatMoney(order.shippingFee, order.currency)}</span>
                  </div>
                  <div className="flex justify-between border-t border-neutral-200 pt-4 text-base font-semibold">
                    <span>Total</span>
                    <span>{formatMoney(order.total, order.currency)}</span>
                  </div>
                </div>

                <div className="mt-5 border-t border-neutral-100 pt-4 text-sm">
                  <p className="text-xs text-neutral-400">PAYMENT METHOD</p>
                  <p className="mt-1 font-medium">
                    {formatStatus(order.paymentMethod)}
                  </p>
                  <p className="mt-4 text-xs text-neutral-400">PAYMENT STATUS</p>
                  <p className="mt-1 font-medium">
                    {formatStatus(order.paymentStatus)}
                  </p>
                </div>
              </section>
            </div>

            <div className="flex flex-wrap gap-4 border-t border-neutral-200 pt-6">
              <Link
                href="/account/orders"
                className="bg-black px-6 py-3 text-xs font-semibold tracking-widest text-white transition hover:bg-neutral-800"
              >
                BACK TO MY ORDERS
              </Link>

              <Link
                href="/shop"
                className="border border-neutral-300 px-6 py-3 text-xs font-semibold tracking-widest transition hover:bg-neutral-100"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function OrderDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-900">
          <div className="mx-auto max-w-5xl rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <p className="text-sm text-neutral-500">
              Loading order details...
            </p>
          </div>
        </main>
      }
    >
      <OrderDetailsContent />
    </Suspense>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatStatus(status: string) {
  return (status || "pending")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOrders() {
      try {
        const user = await account.get();

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const jwt = await account.createJWT();

        const response = await fetch("/api/account/orders", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwt.jwt}`,
          },
          cache: "no-store",
        });

        const result = await response.json();

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load your orders."
          );
        }

        if (active) {
          setOrders(result.orders ?? []);
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

    loadOrders();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-10 text-neutral-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 flex items-center justify-between border-b border-neutral-200 pb-6">
          <Link
            href="/"
            className="text-xl font-black tracking-[0.2em]"
          >
            VICWAV
          </Link>

          <Link
            href="/account"
            className="text-sm font-medium text-neutral-600 hover:text-black"
          >
            My account
          </Link>
        </header>

        <div className="mb-10">
          <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-neutral-500">
            CUSTOMER ACCOUNT
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My orders
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            View your purchases, payment statuses and delivery details.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <p className="text-sm text-neutral-500">
              Loading your orders...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white p-8">
            <p className="font-medium text-red-700">
              Unable to load your orders
            </p>

            <p className="mt-2 text-sm text-neutral-600">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-5 text-sm font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center">
            <h2 className="text-xl font-semibold">
              No orders yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm text-neutral-500">
              Your purchases will appear here once you place your first order.
            </p>

            <Link
              href="/shop"
              className="mt-7 inline-flex bg-black px-7 py-3 text-xs font-semibold tracking-widest text-white transition hover:bg-neutral-800"
            >
              EXPLORE THE SHOP
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-7">
            <p className="text-sm text-neutral-500">
              {orders.length} {orders.length === 1 ? "order" : "orders"} found
            </p>

            {orders.map((order) => (
              <section
                key={order.id}
                className="overflow-hidden rounded-2xl border border-neutral-200 bg-white"
              >
                <div className="flex flex-col gap-5 border-b border-neutral-200 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-neutral-400">
                      ORDER NUMBER
                    </p>

                    <h2 className="mt-2 text-lg font-semibold">
                      {order.orderNumber}
                    </h2>

                    <p className="mt-2 text-sm text-neutral-500">
                      Placed on {formatDate(order.placedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium">
                      Order: {formatStatus(order.orderStatus)}
                    </span>

                    <span className="rounded-full bg-neutral-100 px-4 py-2 text-xs font-medium">
                      Payment: {formatStatus(order.paymentStatus)}
                    </span>
                  </div>
                </div>

                <div className="space-y-5 p-6">
                  <div>
                    <h3 className="mb-4 text-xs font-semibold tracking-widest text-neutral-400">
                      ITEMS ORDERED
                    </h3>

                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-2 border-b border-neutral-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <p className="font-medium">
                              {item.productName}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              SKU: {item.sku}
                            </p>

                            <p className="mt-1 text-xs text-neutral-500">
                              Size: {item.size || "N/A"} · Colour:{" "}
                              {item.color || "N/A"} · Quantity:{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <p className="font-medium">
                            {formatMoney(item.lineTotal, order.currency)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-6 border-t border-neutral-200 pt-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-3 text-xs font-semibold tracking-widest text-neutral-400">
                        DELIVERY DETAILS
                      </h3>

                      <p className="text-sm font-medium">
                        {order.delivery.name}
                      </p>

                      <p className="mt-1 text-sm text-neutral-600">
                        {order.delivery.phone}
                      </p>

                      <p className="mt-1 text-sm text-neutral-600">
                        {order.delivery.address}
                      </p>

                      <p className="mt-1 text-sm text-neutral-600">
                        {order.delivery.city}
                      </p>
                    </div>

                    <div>
                      <h3 className="mb-3 text-xs font-semibold tracking-widest text-neutral-400">
                        PAYMENT SUMMARY
                      </h3>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-neutral-600">
                          <span>Subtotal</span>
                          <span>
                            {formatMoney(order.subtotal, order.currency)}
                          </span>
                        </div>

                        <div className="flex justify-between text-neutral-600">
                          <span>Shipping</span>
                          <span>
                            {formatMoney(order.shippingFee, order.currency)}
                          </span>
                        </div>

                        <div className="flex justify-between border-t border-neutral-200 pt-3 text-base font-semibold">
                          <span>Total</span>
                          <span>
                            {formatMoney(order.total, order.currency)}
                          </span>
                        </div>
                      </div>

                      <p className="mt-4 text-xs text-neutral-500">
                        Payment method: {formatStatus(order.paymentMethod)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-4">
                  <Link
                    href={`/account/orders/${encodeURIComponent(order.id)}`}
                    className="inline-flex items-center text-sm font-semibold tracking-wide text-black transition hover:underline"
                  >
                    VIEW ORDER DETAILS & TRACK ORDER →
                  </Link>
                </div>
              </section>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-neutral-200 pt-6">
          <Link
            href="/shop"
            className="text-sm font-medium text-neutral-600 hover:text-black"
          >
            ← Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

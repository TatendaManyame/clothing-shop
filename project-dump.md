# Project Structure
```
./.env.local
./.gitignore
./app/account/orders/[id]/page.tsx
./app/account/orders/page.tsx
./app/account/page.tsx
./app/account/settings/page.tsx
./app/admin/orders/[id]/page.tsx
./app/admin/orders/page.tsx
./app/admin/page.tsx
./app/api/account/orders/[id]/route.ts
./app/api/account/orders/route.ts
./app/api/admin/access/route.ts
./app/api/admin/dashboard/route.ts
./app/api/admin/orders/[id]/route.ts
./app/api/admin/orders/route.ts
./app/api/orders/route.ts
./app/cart/page.tsx
./app/checkout/page.tsx
./app/favicon.ico
./app/globals.css
./app/layout.tsx
./app/login/page.tsx
./app/page.tsx
./app/product/[id]/page.tsx
./app/product/[id]/ProductDetails.tsx
./app/register/page.tsx
./app/shop/page.tsx
./components/AppwritePing.tsx
./components/StoreFooter.tsx
./components/StoreNavbar.tsx
./eslint.config.mjs
./lib/admin-auth.ts
./lib/appwrite-admin.ts
./lib/appwrite.ts
./lib/products.ts
./next-env.d.ts
./next.config.ts
./package.json
./public/file.svg
./public/globe.svg
./public/next.svg
./public/vercel.svg
./public/window.svg
./README.md
./scripts/seed-store.mjs
./scripts/setup-products.mjs
./scripts/setup-store-tables.mjs
./tsconfig.json
```


## `./app/account/orders/[id]/page.tsx`
```tsx

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
```

## `./app/account/orders/page.tsx`
```tsx

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
```

## `./app/account/page.tsx`
```tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Models } from "appwrite";
import { account } from "@/lib/appwrite";

export default function AccountPage() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const currentUser = await account.get();

        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          window.location.href = "/login";
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await account.deleteSession({ sessionId: "current" });
      window.location.href = "/";
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log out. Please try again."
      );
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-xs font-bold tracking-[0.2em]">
          LOADING YOUR ACCOUNT...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-12 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-center justify-between border-b border-neutral-200 pb-6">
          <Link href="/" className="text-2xl font-black tracking-[0.2em]">
            VICWAV
          </Link>

          <Link
            href="/shop"
            className="text-sm font-semibold underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </header>

        <div className="mb-10">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-neutral-500">
            CUSTOMER ACCOUNT
          </p>

          <h1 className="text-4xl font-semibold">
            Welcome, {user.name || "Customer"}.
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Manage your account and enjoy your shopping experience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-xl border border-neutral-200 bg-white p-7 md:col-span-2">
            <h2 className="mb-6 text-lg font-semibold">
              Account information
            </h2>

            <div className="space-y-5">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Full name
                </p>
                <p className="text-sm font-medium">
                  {user.name || "Not provided"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Email address
                </p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Account ID
                </p>
                <p className="break-all text-sm font-medium">{user.$id}</p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Email verification
                </p>
                <p className="text-sm font-medium">
                  {user.emailVerification ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>
          </section>

          <aside className="rounded-xl border border-neutral-200 bg-white p-7">
            <h2 className="mb-4 text-lg font-semibold">Your account</h2>

            <p className="mb-6 text-sm leading-6 text-neutral-500">
              Your account is ready. You can continue shopping, view your
              purchases and track your orders.
            </p>

            <Link
              href="/account/orders"
              className="mb-3 block w-full rounded-lg border border-black px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-neutral-100"
            >
              MY ORDERS
            </Link>

            <Link
              href="/account/orders"
              className="mb-3 block w-full rounded-lg bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
              TRACK ORDERS
            </Link>

            <Link
              href="/shop"
              className="mb-3 block w-full rounded-lg bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              SHOP NOW
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-100 disabled:opacity-60"
            >
              {loggingOut ? "LOGGING OUT..." : "LOG OUT"}
            </button>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {error}
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
```

## `./app/account/settings/page.tsx`
```tsx

"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Models } from "appwrite";
import { account } from "@/lib/appwrite";

export default function AccountSettingsPage() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const currentUser = await account.get();

        if (active) {
          setUser(currentUser);
          setName(currentUser.name || "");
        }
      } catch {
        if (active) {
          window.location.href = "/login";
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, []);

  async function handleNameUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    setSavingName(true);

    try {
      const updatedUser = await account.updateName({ name: trimmedName });
      setUser(updatedUser);
      setName(updatedUser.name);
      setSuccess("Your name has been updated successfully.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to update your name."
      );
    } finally {
      setSavingName(false);
    }
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your new passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      await account.updatePassword({
        password: newPassword,
        oldPassword: currentPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Your password has been changed successfully.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to change your password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <p className="text-xs font-bold tracking-[0.2em] text-[#07152e]">
          LOADING SETTINGS...
        </p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <Link
            href="/account"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Back to My Account
          </Link>

          <p className="mt-8 text-xs font-bold tracking-[0.25em] text-blue-600">
            ACCOUNT PREFERENCES
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#07152e]">
            Account Settings
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        {success && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid gap-7 lg:grid-cols-3">
          <div className="space-y-7 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-[#07152e]">
                Personal information
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Update the name associated with your VICWAV account.
              </p>

              <form onSubmit={handleNameUpdate} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your full name"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingName}
                  className="rounded-lg bg-[#07152e] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingName ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-[#07152e]">
                Password and security
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Choose a strong password to keep your account secure.
              </p>

              <form onSubmit={handlePasswordUpdate} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Current password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold"
                  >
                    New password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Confirm new password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Confirm your new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {changingPassword ? "UPDATING..." : "CHANGE PASSWORD"}
                </button>
              </form>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-bold text-[#07152e]">
              Account details
            </h2>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email address
                </p>
                <p className="mt-2 break-all text-sm font-medium">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Account ID
                </p>
                <p className="mt-2 break-all text-xs font-medium text-slate-600">
                  {user.$id}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email verification
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    user.emailVerification
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {user.emailVerification ? "Verified" : "Not verified"}
                </span>
              </div>
            </div>

            <Link
              href="/account/orders"
              className="mt-8 block rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-bold text-[#07152e] transition hover:bg-slate-50"
            >
              VIEW MY ORDERS
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}
```

## `./app/admin/orders/[id]/page.tsx`
```tsx
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
```

## `./app/admin/orders/page.tsx`
```tsx

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
```

## `./app/admin/page.tsx`
```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";

type RecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  currency: string;
  placedAt: string;
};

type DashboardData = {
  metrics: {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
  };
  revenue: Record<string, number>;
  recentOrders: RecentOrder[];
};

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = useCallback(async () => {
    try {
      setError("");

      const jwt = await account.createJWT();

      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${jwt.jwt}`,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.error || "Unable to load dashboard.");
      }

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        await account.get();

        if (active) {
          await loadDashboard();
        }
      } catch {
        if (active) {
          router.replace("/login");
        }
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [loadDashboard, router]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadDashboard();
  }

  const metrics = data?.metrics;

  const metricCards = [
    {
      label: "Total orders",
      value: metrics?.totalOrders ?? 0,
      description: "All orders received",
    },
    {
      label: "Pending orders",
      value: metrics?.pendingOrders ?? 0,
      description: "Awaiting action",
    },
    {
      label: "Processing orders",
      value: metrics?.processingOrders ?? 0,
      description: "Currently being fulfilled",
    },
    {
      label: "Completed orders",
      value: metrics?.completedOrders ?? 0,
      description: "Successfully delivered",
    },
  ];

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-6">
          <div>
            <Link href="/" className="text-2xl font-black tracking-[0.2em]">
              VICWAV
            </Link>
            <p className="mt-1 text-xs font-semibold tracking-[0.2em] text-neutral-500">
              ADMINISTRATION
            </p>
          </div>

          <nav className="flex items-center gap-5 text-sm font-semibold">
            <Link href="/account" className="hover:text-neutral-500">
              MY ACCOUNT
            </Link>
            <Link href="/shop" className="hover:text-neutral-500">
              SHOP
            </Link>
          </nav>
        </header>

        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold tracking-[0.2em] text-neutral-500">
              STORE MANAGEMENT
            </p>
            <h1 className="text-3xl font-black tracking-tight">
              Dashboard overview
            </h1>
            <p className="mt-2 text-sm text-neutral-600">
              Monitor orders, revenue and store activity.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-neutral-100 disabled:opacity-50"
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              href="/admin/orders"
              className="rounded-lg bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-neutral-800"
            >
              Manage orders
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-10 text-center text-sm text-neutral-500">
            Loading dashboard...
          </div>
        ) : (
          <>
            <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metricCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-neutral-200 bg-white p-6"
                >
                  <p className="text-sm font-medium text-neutral-500">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-black tabular-nums">
                    {card.value.toLocaleString()}
                  </p>
                  <p className="mt-2 text-xs text-neutral-500">
                    {card.description}
                  </p>
                </div>
              ))}
            </section>

            <section className="mb-8 rounded-xl border border-neutral-200 bg-white p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold">Revenue overview</h2>
                <p className="mt-1 text-sm text-neutral-500">
                  Revenue from paid orders only, separated by currency.
                </p>
              </div>

              {Object.keys(data?.revenue || {}).length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No paid revenue recorded yet.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Object.entries(data?.revenue || {}).map(
                    ([currency, amount]) => (
                      <div
                        key={currency}
                        className="rounded-lg bg-neutral-50 p-5"
                      >
                        <p className="text-sm font-semibold text-neutral-500">
                          {currency} revenue
                        </p>
                        <p className="mt-2 text-2xl font-black tabular-nums">
                          {formatMoney(amount, currency)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>

            <section className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 p-6">
                <div>
                  <h2 className="text-lg font-bold">Recent orders</h2>
                  <p className="mt-1 text-sm text-neutral-500">
                    Latest orders and their current statuses.
                  </p>
                </div>

                <Link
                  href="/admin/orders"
                  className="text-sm font-bold underline underline-offset-4"
                >
                  View all orders
                </Link>
              </div>

              {!data?.recentOrders.length ? (
                <p className="p-8 text-center text-sm text-neutral-500">
                  No orders have been placed yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left text-sm">
                    <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                      <tr>
                        <th className="px-6 py-4">Order</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Total</th>
                        <th className="px-6 py-4">Order status</th>
                        <th className="px-6 py-4">Payment</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-neutral-100">
                      {data.recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 font-bold">
                            <Link
                              href={`/admin/orders/${encodeURIComponent(order.id)}`}
                              className="underline underline-offset-4"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-6 py-4">{order.customerName}</td>
                          <td className="px-6 py-4 text-neutral-500">
                            {formatDate(order.placedAt)}
                          </td>
                          <td className="px-6 py-4 font-semibold">
                            {formatMoney(order.total, order.currency)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                                statusStyles[order.orderStatus] ||
                                "bg-neutral-100 text-neutral-700"
                              }`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 capitalize">
                            {order.paymentStatus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
```

## `./app/api/account/orders/[id]/route.ts`
```ts

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
```

## `./app/api/account/orders/route.ts`
```ts

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
```

## `./app/api/admin/access/route.ts`
```ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const adminId = await getAdminUserId(request);

    return NextResponse.json({
      isAdmin: Boolean(adminId),
    });
  } catch {
    return NextResponse.json(
      { isAdmin: false },
      { status: 500 }
    );
  }
}
```

## `./app/api/admin/dashboard/route.ts`
```ts
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
```

## `./app/api/admin/orders/[id]/route.ts`
```ts
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
```

## `./app/api/admin/orders/route.ts`
```ts
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
}```

## `./app/api/orders/route.ts`
```ts

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

    // Use the verified Appwrite email for authenticated customers.
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

    // Registered customers use their verified Appwrite account ID.
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
      // Guest checkout.
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
```

## `./app/cart/page.tsx`
```tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("clothing-cart");

      if (savedCart) {
        const parsed: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          const normalized: CartItem[] = parsed.map((item) => ({
            productId: String(item.productId ?? item.id ?? ""),
            name: String(item.name ?? item.productName ?? "Product"),
            price: Number(item.price ?? 0),
            image: String(item.image ?? item.img ?? ""),
            size: String(item.size ?? "Standard"),
            color: String(item.color ?? "Default"),
            quantity: Math.max(
              1,
              Math.min(8, Number(item.quantity ?? 1))
            ),
          }));

          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCart(normalized.filter((item) => item.productId));
        }
      }
    } catch (error) {
      console.error("Unable to load cart:", error);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem("clothing-cart", JSON.stringify(cart));
    }
  }, [cart, loaded]);

  const updateQuantity = (index: number, change: number) => {
    setCart((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: Math.max(
                1,
                Math.min(8, item.quantity + change)
              ),
            }
          : item
      )
    );
  };

  const removeItem = (index: number) => {
    setCart((current) => current.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const itemCount = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] flex items-center justify-center">
        <p className="text-sm tracking-widest uppercase text-gray-500">
          Loading your bag...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
      <header className="border-b border-black/10 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-black tracking-[0.2em]"
          >
            YOUR BRAND
          </Link>

          <Link
            href="/shop"
            className="text-xs uppercase tracking-[0.18em] hover:opacity-60 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-3">
              Your Shopping Bag
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Shopping Cart
            </h1>

            <p className="text-sm text-gray-500 mt-3">
              {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
            </p>
          </div>

          <ShoppingBag size={30} strokeWidth={1.2} />
        </div>

        {cart.length === 0 ? (
          <div className="bg-white border border-black/10 py-20 px-6 text-center">
            <ShoppingBag
              size={45}
              strokeWidth={1}
              className="mx-auto text-gray-400 mb-6"
            />

            <h2 className="text-2xl font-semibold mb-3">
              Your bag is empty
            </h2>

            <p className="text-sm text-gray-500 mb-8">
              Looks like you haven&apos;t added anything to your bag yet.
            </p>

            <Link
              href="/shop"
              className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 text-xs uppercase tracking-widest hover:bg-gray-800 transition"
            >
              Explore Collection
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
            <div className="space-y-5">
              {cart.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}-${index}`}
                  className="bg-white border border-black/10 p-4 md:p-6 flex gap-5"
                >
                  <Link
                    href={`/product/${encodeURIComponent(item.productId)}`}
                    className="relative w-28 h-36 md:w-40 md:h-48 shrink-0 bg-gray-100 overflow-hidden"
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 112px, 160px"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="text-gray-400" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between gap-3">
                        <div>
                          <Link
                            href={`/product/${encodeURIComponent(item.productId)}`}
                            className="font-semibold text-base md:text-lg hover:underline"
                          >
                            {item.name}
                          </Link>

                          <p className="text-sm text-gray-500 mt-2">
                            Size: {item.size}
                          </p>

                          <p className="text-sm text-gray-500 mt-1">
                            Colour: {item.color}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(index)}
                          aria-label={`Remove ${item.name}`}
                          className="text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>

                      <p className="font-semibold mt-4">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-5">
                      <div className="flex items-center border border-black/15">
                        <button
                          onClick={() => updateQuantity(index, -1)}
                          disabled={item.quantity <= 1}
                          aria-label="Decrease quantity"
                          className="p-2 hover:bg-gray-100 disabled:opacity-30"
                        >
                          <Minus size={14} />
                        </button>

                        <span className="w-9 text-center text-sm">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(index, 1)}
                          disabled={item.quantity >= 8}
                          aria-label="Increase quantity"
                          className="p-2 hover:bg-gray-100 disabled:opacity-30"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <p className="font-semibold text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-600 hover:text-black pt-3"
              >
                <ArrowLeft size={15} />
                Continue Shopping
              </Link>
            </div>

            <aside className="bg-white border border-black/10 p-6 md:p-8 h-fit">
              <h2 className="text-xl font-semibold mb-7">
                Order Summary
              </h2>

              <div className="flex justify-between text-sm mb-5">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm mb-5">
                <span className="text-gray-500">Shipping</span>
                <span className="text-gray-500">
                  Calculated at checkout
                </span>
              </div>

              <div className="border-t border-black/10 pt-5 mt-5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-xl font-semibold">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Shipping and any applicable taxes are calculated at checkout.
                </p>
              </div>

              <Link
                href="/checkout"
                className="mt-8 w-full bg-black text-white py-4 px-5 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.18em] hover:bg-gray-800 transition"
              >
                Proceed to Checkout
                <ArrowRight size={16} />
              </Link>

              <p className="text-center text-xs text-gray-400 mt-5">
                Secure checkout experience
              </p>
            </aside>
          </div>
        )}
      </section>

      <footer className="border-t border-black/10 py-8 text-center text-xs text-gray-400 tracking-widest">
        © 2026 YOUR BRAND. ALL RIGHTS RESERVED.
      </footer>
    </main>
  );
}
```

## `./app/checkout/page.tsx`
```tsx

"use client";

import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
};

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mobile-money");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [form, setForm] = useState<CheckoutForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Zimbabwe",
    postalCode: "",
  });

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("clothing-cart");

      if (savedCart) {
        const parsed: unknown = JSON.parse(savedCart);

        if (Array.isArray(parsed)) {
          const normalized: CartItem[] = parsed.map((item) => ({
            productId: String(item.productId ?? item.id ?? ""),
            name: String(item.name ?? item.productName ?? "Product"),
            price: Number(item.price ?? 0),
            image: String(item.image ?? item.img ?? ""),
            size: String(item.size ?? "Standard"),
            color: String(item.color ?? "Default"),
            quantity: Math.max(
              1,
              Math.min(8, Number(item.quantity ?? 1))
            ),
          }));

          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCart(normalized.filter((item) => item.productId));
        }
      }
    } catch (error) {
      console.error("Unable to load cart:", error);
    }

    setLoaded(true);
  }, []);

  // Load the signed-in customer's details when available.
  useEffect(() => {
    let active = true;

    account
      .get()
      .then((user) => {
        if (!active) return;

        const nameParts = (user.name || "").trim().split(/\\s+/).filter(Boolean);

        setForm((current) => ({
          ...current,
          firstName: current.firstName || nameParts[0] || "",
          lastName: current.lastName || nameParts.slice(1).join(" "),
          email: current.email || user.email || "",
        }));

        setIsAuthenticated(true);
      })
      .catch(() => {
        if (active) setIsAuthenticated(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 100 ? 0 : 5;
  const total = subtotal + shipping;

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (isAuthenticated) {
        const jwt = await account.createJWT();
        headers.Authorization = `Bearer ${jwt.jwt}`;
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          customer: form,
          paymentMethod,
          items: cart.map((item) => ({
            productId: item.productId,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Unable to place your order. Please try again."
        );
      }

      setOrderNumber(String(result.orderNumber || ""));
      localStorage.removeItem("clothing-cart");
      setSubmitted(true);
    } catch (error) {
      console.error("Checkout submission failed:", error);

      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!loaded) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8f7f4]">
        <p className="text-xs uppercase tracking-widest text-black">
          Loading checkout...
        </p>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
        <header className="bg-white border-b border-black/10 px-6 py-6">
          <Link href="/" className="text-2xl font-black tracking-[0.2em]">
            YOUR BRAND
          </Link>
        </header>

        <section className="max-w-xl mx-auto px-6 py-28 text-center">
          <ShoppingBag size={45} className="mx-auto mb-6 text-black" />

          <h1 className="text-3xl font-semibold mb-3">
            Your cart is empty
          </h1>

          <p className="text-black text-sm mb-8">
            Add some products before proceeding to checkout.
          </p>

          <Link
            href="/shop"
            className="inline-flex bg-black text-white px-8 py-4 text-xs uppercase tracking-widest"
          >
            Explore Collection
          </Link>
        </section>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f8f7f4] flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-white border border-black/10 p-10 text-center">
          <CheckCircle2
            size={55}
            strokeWidth={1.2}
            className="mx-auto mb-6"
          />

          <p className="text-xs uppercase tracking-[0.25em] text-black mb-4">
            Order received
          </p>

          <h1 className="text-3xl font-semibold mb-4">
            Thank you for your order
          </h1>

          <p className="text-sm text-black leading-7 mb-4">
            Your order has been successfully created.
          </p>

          <div className="bg-[#f8f7f4] border border-black/10 p-5 mb-6">
            <p className="text-xs uppercase tracking-widest text-black mb-2">
              Order number
            </p>
            <p className="font-semibold text-lg break-all">
              {orderNumber}
            </p>
          </div>

          <p className="text-sm text-black leading-7 mb-8">
            Your order is currently awaiting payment confirmation. No online
            payment has been collected yet.
          </p>

          <Link
            href="/shop"
            className="block text-xs uppercase tracking-widest mt-6 hover:underline"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] text-[#171717]">
      <header className="bg-white border-b border-black/10">
        <div className="max-w-7xl mx-auto px-5 md:px-10 h-20 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black tracking-[0.2em]">
            YOUR BRAND
          </Link>

          <div className="flex items-center gap-2 text-xs text-black">
            <LockKeyhole size={14} />
            Secure Checkout
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-5 md:px-10 py-12 md:py-16">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-black hover:text-black mb-10"
        >
          <ArrowLeft size={15} />
          Back to Cart
        </Link>

        <div className="mb-12">
          <p className="text-xs uppercase tracking-[0.25em] text-black mb-3">
            Almost Yours
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Checkout
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          {submitError && (
            <div
              role="alert"
              className="mb-8 border border-red-300 bg-red-50 px-5 py-4 text-sm text-red-700"
            >
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
            <div className="space-y-10">
              {/* Customer Information */}
              <section>
                <div className="flex items-center gap-4 mb-7">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                    1
                  </span>

                  <h2 className="text-xl font-semibold">
                    Contact Information
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-widest mb-2">
                      Email Address
                    </label>

                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="checkout-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-2">
                      First Name
                    </label>

                    <input
                      required
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="First name"
                      className="checkout-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-2">
                      Last Name
                    </label>

                    <input
                      required
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Last name"
                      className="checkout-input"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-widest mb-2">
                      Phone Number
                    </label>

                    <input
                      required
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+263..."
                      className="checkout-input"
                    />
                  </div>
                </div>
              </section>

              {/* Delivery */}
              <section>
                <div className="flex items-center gap-4 mb-7">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                    2
                  </span>

                  <h2 className="text-xl font-semibold">
                    Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs uppercase tracking-widest mb-2">
                      Street Address
                    </label>

                    <input
                      required
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="House number and street"
                      className="checkout-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-2">
                      City
                    </label>

                    <input
                      required
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      placeholder="e.g. Harare"
                      className="checkout-input"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-2">
                      Country
                    </label>

                    <select
                      required
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className="checkout-input"
                    >
                      <option value="Zimbabwe">Zimbabwe</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest mb-2">
                      Postal Code (Optional)
                    </label>

                    <input
                      name="postalCode"
                      value={form.postalCode}
                      onChange={handleChange}
                      placeholder="Postal code"
                      className="checkout-input"
                    />
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section>
                <div className="flex items-center gap-4 mb-7">
                  <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-sm">
                    3
                  </span>

                  <h2 className="text-xl font-semibold">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "mobile-money",
                      title: "Mobile Money",
                      description: "Mobile money payment integration",
                    },
                    {
                      id: "card",
                      title: "Debit / Credit Card",
                      description: "Card payment integration",
                    },
                    {
                      id: "bank-transfer",
                      title: "Bank Transfer",
                      description: "Pay using a bank transfer",
                    },
                    {
                      id: "cash",
                      title: "Cash on Delivery",
                      description: "Pay when your order arrives",
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-4 border p-5 cursor-pointer transition ${
                        paymentMethod === method.id
                          ? "border-black bg-white"
                          : "border-black/10 bg-white hover:border-black/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="mt-1 accent-black"
                      />

                      <div>
                        <p className="text-sm font-semibold">
                          {method.title}
                        </p>

                        <p className="text-xs text-black mt-1">
                          {method.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>
            </div>

            {/* Order Summary */}
            <aside className="h-fit bg-white border border-black/10 p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-7">
                Your Order
              </h2>

              <div className="space-y-5">
                {cart.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}-${index}`}
                    className="flex justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {item.name}
                      </p>

                      <p className="text-xs text-black mt-1">
                        {item.size} / {item.color}
                      </p>

                      <p className="text-xs text-black mt-1">
                        Quantity: {item.quantity}
                      </p>
                    </div>

                    <p className="text-sm font-medium whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/10 mt-7 pt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-black">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-black">Shipping</span>

                  <span>
                    {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="border-t border-black/10 pt-5 flex justify-between">
                  <span className="font-semibold">Total</span>

                  <span className="text-xl font-semibold">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-8 bg-black text-white py-4 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.18em] hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Order..." : "Place Order"}
                {!isSubmitting && <ArrowRight size={16} />}
              </button>

              <p className="text-xs text-black text-center mt-5 leading-6">
                Your order will be recorded. Online payment processing is
                not yet connected.
              </p>
            </aside>
          </div>
        </form>
      </section>

      <footer className="border-t border-black/10 py-8 text-center text-xs text-black tracking-widest">
        © 2026 YOUR BRAND. ALL RIGHTS RESERVED.
      </footer>

      <style jsx>{`
        .checkout-input {
          width: 100%;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.15);
          padding: 14px 15px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        .checkout-input:focus {
          border-color: black;
        }

        .checkout-input::placeholder {
          color: #a3a3a3;
        }
      `}</style>
    </main>
  );
}
```

## `./app/globals.css`
```css
@import "tailwindcss";

:root {
  --background: #ffffff;
  --foreground: #0b1e42;
  --navy: #07152e;
  --blue: #2563eb;
  --cyan: #22d3ee;
  --surface: #f1f5f9;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}

::selection {
  background: #bae6fd;
  color: #07152e;
}

button,
a {
  -webkit-tap-highlight-color: transparent;
}

button {
  cursor: pointer;
}

img {
  max-width: 100%;
}

/* VICWAV animated fashion hero */
@keyframes vicwav-scroll-up {
  from { transform: translateY(0); }
  to { transform: translateY(-50%); }
}

@keyframes vicwav-scroll-down {
  from { transform: translateY(-50%); }
  to { transform: translateY(0); }
}

@keyframes vicwav-hero-reveal {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes vicwav-glow {
  0%, 100% { opacity: 0.25; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.15); }
}

.vicwav-marquee-track {
  display: flex;
  flex-direction: column;
  will-change: transform;
}

.vicwav-marquee-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-bottom: 1rem;
}

.vicwav-scroll-up {
  animation: vicwav-scroll-up 42s linear infinite;
}

.vicwav-scroll-down {
  animation: vicwav-scroll-down 48s linear infinite;
}

.vicwav-hero-reveal {
  animation: vicwav-hero-reveal 1s ease-out both;
}

.vicwav-hero-glow {
  animation: vicwav-glow 8s ease-in-out infinite;
}

.vicwav-marquee-track img {
  display: block;
  width: 100%;
  height: 260px;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 12px;
}

@media (max-width: 767px) {
  .vicwav-marquee-track img {
    height: 190px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .vicwav-scroll-up,
  .vicwav-scroll-down,
  .vicwav-hero-reveal,
  .vicwav-hero-glow {
    animation: none !important;
  }

  .vicwav-marquee-track {
    transform: none !important;
  }
}
```

## `./app/layout.tsx`
```tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppwritePing from "@/components/AppwritePing";
import StoreNavbar from "@/components/StoreNavbar";
import StoreFooter from "@/components/StoreFooter";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "VICWAV | Modern Streetwear",
    template: "%s | VICWAV",
  },
  description:
    "Discover modern streetwear and everyday essentials at VICWAV. Shop clothing designed for confidence, comfort and style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AppwritePing />
        <StoreNavbar />
        {children}
        <StoreFooter />
      </body>
    </html>
  );
}
```

## `./app/login/page.tsx`
```tsx

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { account } from "@/lib/appwrite";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await account.createEmailPasswordSession({
        email: normalizedEmail,
        password,
      });

      window.location.href = "/account";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to log in.";

      if (
        message.toLowerCase().includes("invalid credentials") ||
        message.toLowerCase().includes("user not found")
      ) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-neutral-900">
      <div className="mx-auto grid min-h-[75vh] max-w-6xl overflow-hidden rounded-2xl border border-neutral-200 md:grid-cols-2">
        <section className="hidden bg-neutral-950 p-12 text-white md:flex md:flex-col md:justify-between">
          <Link href="/" className="text-2xl font-black tracking-[0.2em]">
            VICWAV
          </Link>

          <div>
            <p className="mb-4 text-xs font-bold tracking-[0.3em] text-neutral-400">
              WELCOME BACK
            </p>
            <h1 className="max-w-md text-5xl font-semibold leading-tight">
              Your style. Your collection. Your account.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-400">
              Sign in to continue shopping and manage your orders.
            </p>
          </div>

          <p className="text-xs text-neutral-500">
            © 2026 VICWAV. All rights reserved.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 py-12 sm:p-12">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="text-xl font-black tracking-[0.2em] md:hidden"
            >
              VICWAV
            </Link>

            <div className="mb-8 mt-8 md:mt-0">
              <p className="mb-3 text-xs font-bold tracking-[0.25em] text-neutral-500">
                CUSTOMER LOGIN
              </p>
              <h2 className="text-3xl font-semibold">Welcome back</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Enter your account details to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                  className="h-4 w-4 accent-black"
                />
                Show password
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-neutral-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-black underline underline-offset-4"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
```

## `./app/page.tsx`
```tsx

/* eslint-disable @next/next/no-html-link-for-pages */

import {
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

const products = [
  {
    name: "Classic Track Set",
    price: "$45.00",
    category: "TRACKSUITS",
    img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
    tag: "BESTSELLER",
  },
  {
    name: "Essential Hoodie",
    price: "$38.00",
    category: "HOODIES",
    img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
    tag: "NEW",
  },
  {
    name: "Urban Cargo",
    price: "$42.00",
    category: "PANTS",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
    tag: "",
  },
  {
    name: "Everyday Tee",
    price: "$22.00",
    category: "T-SHIRTS",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    tag: "POPULAR",
  },
];

const categories = [
  {
    name: "TOPS",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "BOTTOMS",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "OUTERWEAR",
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
  },
];

const heroImages = [
  [
    "photo-1523398002811-999ca8dec234",
    "photo-1551488831-00ddcb6c6bd3",
    "photo-1515886657613-9f3515b0c78f",
    "photo-1529139574466-a303027c1d8b",
  ],
  [
    "photo-1556821840-3a63f95609a7",
    "photo-1521572163474-6864f9cf17ab",
    "photo-1551028719-00167b16eac5",
    "photo-1525507119028-ed4c629a60a3",
  ],
  [
    "photo-1483985988355-763728e1935b",
    "photo-1503342217505-b0a15ec3261c",
    "photo-1529139574466-a303027c1d8b",
    "photo-1515886657613-9f3515b0c78f",
  ],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">

      {/* Animated Fashion Hero */}
      <section className="relative isolate min-h-[680px] overflow-hidden bg-[#07152e] text-white md:min-h-[780px]">

        {/* Scrolling fashion image gallery */}
        <div className="absolute inset-0 grid grid-cols-3 gap-3 overflow-hidden px-2 opacity-75 md:gap-5 md:px-5">
          {heroImages.map((column, index) => (
            <div
              key={index}
              className={`vicwav-marquee-track ${
                index === 1 ? "vicwav-scroll-down" : "vicwav-scroll-up"
              }`}
            >
              {[0, 1].map((copy) => (
                <div key={copy} className="vicwav-marquee-group">
                  {column.map((photo, photoIndex) => (
                    <div
                      key={`${copy}-${photoIndex}`}
                      className="group relative overflow-hidden rounded-xl"
                    >
                      <img
                        src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=700&q=85`}
                        alt=""
                        aria-hidden="true"
                        className="h-[260px] w-full object-cover transition duration-1000 group-hover:scale-110 md:h-[360px]"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Dark cinematic overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07152e]/95 via-[#07152e]/65 to-[#07152e]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07152e] via-transparent to-[#07152e]/30" />

        {/* Decorative light */}
        <div className="vicwav-hero-glow pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-500/30 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-400/10 blur-[110px]" />

        {/* Hero content */}
        <div className="relative mx-auto flex min-h-[680px] max-w-7xl flex-col justify-center px-6 py-24 md:min-h-[780px] md:px-12">

          <div className="max-w-4xl">
            <div className="vicwav-hero-reveal mb-7 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
              <span className="text-[10px] font-bold tracking-[0.25em] text-white/90 md:text-xs">
                THE NEW COLLECTION — 2026
              </span>
            </div>

            <h1 className="vicwav-hero-reveal text-5xl font-black leading-[0.95] tracking-[-0.055em] md:text-7xl lg:text-8xl">
              WEAR YOUR
              <br />
              <span className="bg-gradient-to-r from-white via-white to-cyan-300 bg-clip-text text-transparent">
                OWN STORY.
              </span>
            </h1>

            <p
              className="vicwav-hero-reveal mt-7 max-w-lg text-sm leading-8 text-white/75 md:text-base"
              style={{ animationDelay: "180ms" }}
            >
              Designed for individuality. Built for everyday life.
              Discover modern streetwear that moves with you and lets
              your personality speak.
            </p>

            <div
              className="vicwav-hero-reveal mt-9 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "320ms" }}
            >
              <a
                href="/shop"
                className="group inline-flex items-center gap-5 rounded-full bg-white px-7 py-4 text-xs font-bold tracking-[0.15em] text-[#07152e] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:bg-cyan-300"
              >
                SHOP COLLECTION
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
              </a>

              <a
                href="#categories"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-4 text-xs font-bold tracking-[0.15em] text-white backdrop-blur-sm transition hover:border-cyan-300 hover:bg-white/10"
              >
                EXPLORE VICWAV
                <ArrowUpRight size={16} />
              </a>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 right-6 flex items-center justify-between border-t border-white/15 pt-5 text-[9px] font-semibold tracking-[0.2em] text-white/60 md:left-12 md:right-12">
            <span>CONFIDENCE IN EVERY THREAD</span>
            <span>VICWAV — EST. 2026</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                EXPLORE
              </p>

              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                SHOP BY CATEGORY
              </h2>
            </div>

            <a
              href="/shop"
              className="hidden items-center gap-2 text-xs font-bold tracking-widest md:flex"
            >
              EXPLORE ALL <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {categories.map((category) => (
              <a
                href="/shop"
                key={category.name}
                className="group relative h-[450px] overflow-hidden bg-gray-100"
              >
                <img
                  src={category.img}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/40" />

                <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between text-white">
                  <h3 className="text-2xl font-bold tracking-wide">
                    {category.name}
                  </h3>

                  <ArrowUpRight size={24} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        id="shop"
        className="bg-[#f7f7f7] px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                CURATED FOR YOU
              </p>

              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                BESTSELLERS
              </h2>
            </div>

            <a
              href="/shop"
              className="hidden items-center gap-2 text-xs font-bold tracking-widest md:flex"
            >
              VIEW ALL <ArrowRight size={16} />
            </a>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {products.map((product) => (
              <a
                href="/shop"
                key={product.name}
                className="group block"
              >
                <div className="relative overflow-hidden bg-white">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-[280px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[420px]"
                  />

                  {product.tag && (
                    <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[10px] font-bold tracking-widest">
                      {product.tag}
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 translate-y-4 bg-white py-3 text-center text-xs font-bold tracking-widest opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    VIEW PRODUCT
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] tracking-widest text-gray-500">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-sm font-medium">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-sm font-semibold">
                    {product.price}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Mobile View All */}
          <a
            href="/shop"
            className="mt-10 flex w-full items-center justify-center gap-3 border border-black py-4 text-xs font-bold tracking-widest transition hover:bg-black hover:text-white md:hidden"
          >
            VIEW ALL PRODUCTS <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Promotional Banner */}
      <section id="about" className="relative overflow-hidden bg-black text-white">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-20 md:px-16 md:py-28">
            <p className="mb-5 text-xs tracking-[0.25em] text-gray-400">
              OUR PHILOSOPHY
            </p>

            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              NOT JUST
              <br />
              CLOTHES.
              <br />
              A STATEMENT.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-gray-400">
              Fashion should be an expression of who you are. We create
              timeless pieces that give you confidence, comfort and freedom
              to define your own style.
            </p>
          </div>
        </div>
      </section>

    </main>
  );
}
```

## `./app/product/[id]/page.tsx`
```tsx

import { Suspense } from "react";
import ProductDetails from "./ProductDetails";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default function ProductPage({
  params,
}: ProductPageProps) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p className="text-xs font-bold tracking-[0.2em]">
            LOADING PRODUCT...
          </p>
        </main>
      }
    >
      {params.then(({ id }) => (
        <ProductDetails id={id} />
      ))}
    </Suspense>
  );
}
```

## `./app/product/[id]/ProductDetails.tsx`
```tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import {
  getProductById,
  getCategories,
  type StoreProduct,
} from "@/lib/products";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

type ProductDetailsProps = {
  id: string;
};

const colorHex: Record<string, string> = {
  Black: "#171717",
  White: "#ffffff",
  Grey: "#9ca3af",
  Gray: "#9ca3af",
  Red: "#dc2626",
  Blue: "#2563eb",
  Green: "#16a34a",
  Navy: "#1e3a8a",
  Beige: "#d6c3a1",
  Brown: "#78350f",
};

export default function ProductDetails({
  id,
}: ProductDetailsProps) {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const [productData, categoryData] = await Promise.all([
          getProductById(id),
          getCategories(),
        ]);

        if (cancelled) return;

        if (!productData) {
          setProduct(null);
          return;
        }

        setProduct(productData);

        const matchingCategory = categoryData.find(
          (item) =>
            item.$id === productData.category_id ||
            item.slug === productData.category_id
        );

        setCategory(
          matchingCategory?.name || productData.category_id
        );

        const availableSizes = productData.sizes || [];
        const availableColors = productData.colors || [];

        setSelectedSize(availableSizes[0] || "One Size");
        setSelectedColor(availableColors[0] || "Default");
        setQuantity(1);
      } catch (err) {
        console.error("Unable to load product:", err);

        if (!cancelled) {
          setError("Unable to load this product. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const productImage =
    product?.image_url ||
    product?.images?.[0] ||
    "";

  const availableSizes = product?.sizes?.length
    ? product.sizes
    : ["One Size"];

  const availableColors = product?.colors?.length
    ? product.colors
    : ["Default"];

  const stock = product?.stock_quantity ?? 0;
  const maximumQuantity = Math.min(8, stock);
  const soldOut = stock <= 0;

  function addToCart() {
    if (!product || soldOut) return;

    try {
      const storedCart = localStorage.getItem("clothing-cart");

      const cart: CartItem[] = storedCart
        ? JSON.parse(storedCart).map((item: CartItem) => ({
            ...item,
            productId: String(item.productId),
          }))
        : [];

      const existingItem = cart.find(
        (item) =>
          item.productId === product.$id &&
          item.size === selectedSize &&
          item.color === selectedColor
      );

      if (existingItem) {
        if (existingItem.quantity + quantity > maximumQuantity) {
          alert(
            `Only ${stock} items are currently available in stock.`
          );
          return;
        }

        existingItem.quantity += quantity;
      } else {
        cart.push({
          productId: product.$id,
          name: product.name,
          price: product.price,
          image: productImage,
          size: selectedSize,
          color: selectedColor,
          quantity,
        });
      }

      localStorage.setItem(
        "clothing-cart",
        JSON.stringify(cart)
      );

      setAdded(true);

      window.setTimeout(() => {
        setAdded(false);
      }, 2500);
    } catch (err) {
      console.error("Unable to update cart:", err);
      alert("Unable to update your cart. Please try again.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xs font-bold tracking-[0.2em]">
          LOADING PRODUCT...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <h1 className="text-3xl font-black">
          {error ? "SOMETHING WENT WRONG" : "PRODUCT NOT FOUND"}
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          {error ||
            "The product you are looking for does not exist or is unavailable."}
        </p>

        <Link
          href="/shop"
          className="mt-7 bg-blue-700 px-7 py-4 text-xs font-bold tracking-widest text-white"
        >
          BACK TO SHOP
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Product Details */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-2 md:gap-16 md:px-10 md:py-16">

        {/* Product Image */}
        <div className="relative overflow-hidden bg-slate-100">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-[480px] w-full object-cover md:h-[720px]"
            />
          ) : (
            <div className="flex h-[480px] items-center justify-center text-sm text-gray-400 md:h-[720px]">
              No product image available
            </div>
          )}

          {product.tag && (
            <span className="absolute left-5 top-5 bg-white px-4 py-3 text-[10px] font-bold tracking-widest">
              {product.tag}
            </span>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center">

          <p className="text-xs font-medium tracking-[0.25em] text-gray-500">
            {category.toUpperCase()}
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight text-[#07152e] md:text-6xl">
            {product.name}
          </h1>

          <p className="mt-5 text-2xl font-extrabold text-blue-700">
            ${product.price.toFixed(2)}
          </p>

          {product.compare_at_price &&
            product.compare_at_price > product.price && (
              <p className="mt-1 text-sm text-gray-400 line-through">
                ${product.compare_at_price.toFixed(2)}
              </p>
            )}

          <div className="my-8 border-t border-gray-200" />

          <p className="text-sm leading-8 text-gray-600">
            {product.description}
          </p>

          {/* Colour Selection */}
          <div className="mt-9">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold tracking-widest">
                COLOUR
              </p>

              <p className="text-xs text-gray-500">
                {selectedColor}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select ${color}`}
                  aria-pressed={selectedColor === color}
                  className={`flex items-center gap-2 border px-4 py-3 text-xs ${
                    selectedColor === color
                      ? "border-blue-600"
                      : "border-gray-200 hover:border-blue-600"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-gray-300"
                    style={{
                      backgroundColor:
                        colorHex[color] || "#d1d5db",
                    }}
                  />
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mt-9">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold tracking-widest">
                SELECT SIZE
              </p>

              <span className="text-xs text-gray-500">
                Size guide coming soon
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                  className={`border py-4 text-xs font-bold ${
                    selectedSize === size
                      ? "border-blue-600 bg-[#07152e] text-white"
                      : "border-gray-200 hover:border-blue-600"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <p className="mt-6 text-xs text-gray-500">
            {soldOut
              ? "OUT OF STOCK"
              : `${stock} items available`}
          </p>

          {/* Quantity */}
          <div className="mt-5">
            <p className="mb-4 text-xs font-bold tracking-widest">
              QUANTITY
            </p>

            <div className="flex w-fit items-center border border-gray-200">

              <button
                type="button"
                onClick={() =>
                  setQuantity(Math.max(1, quantity - 1))
                }
                disabled={quantity <= 1 || soldOut}
                className="px-5 py-4 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>

              <span className="min-w-10 text-center text-sm">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.min(maximumQuantity, quantity + 1)
                  )
                }
                disabled={quantity >= maximumQuantity || soldOut}
                className="px-5 py-4 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>

            </div>

            <p className="mt-2 text-[10px] text-gray-400">
              Maximum 8 items per selection.
            </p>
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={addToCart}
            disabled={soldOut}
            className={`mt-9 flex w-full items-center justify-center gap-3 py-5 text-xs font-bold tracking-[0.2em] transition ${
              soldOut
                ? "cursor-not-allowed bg-gray-300 text-gray-600"
                : added
                  ? "bg-green-700 text-white"
                  : "bg-[#07152e] text-white hover:bg-blue-800"
            }`}
          >
            {soldOut ? (
              "SOLD OUT"
            ) : added ? (
              <>
                <Check size={18} />
                ADDED TO CART
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                ADD TO CART — ${(product.price * quantity).toFixed(2)}
              </>
            )}
          </button>

          {added && (
            <Link
              href="/cart"
              className="mt-4 text-center text-xs font-bold tracking-widest underline"
            >
              VIEW YOUR CART
            </Link>
          )}

          {/* Product Information */}
          <div className="mt-8 border-t border-gray-200 pt-6">

            <div className="flex justify-between py-3 text-xs">
              <span className="text-gray-500">PRODUCT</span>
              <span>CLOTHING. COLLECTION</span>
            </div>

            <div className="flex justify-between border-t border-gray-100 py-3 text-xs">
              <span className="text-gray-500">DELIVERY</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="flex justify-between border-t border-gray-100 py-3 text-xs">
              <span className="text-gray-500">RETURNS</span>
              <span>Return policy applies</span>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-[#07152e] px-5 py-10 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight">
            VICWAV<span className="text-cyan-400">.</span>
          </Link>
          <p className="text-xs text-slate-400">
            © 2026 VICWAV. All rights reserved.
          </p>
        </div>
      </footer>

    </main>
  );
}
```

## `./app/register/page.tsx`
```tsx

"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ID } from "appwrite";
import { account } from "@/lib/appwrite";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!name || !normalizedEmail || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await account.create({
        userId: ID.unique(),
        email: normalizedEmail,
        password,
        name,
      });

      await account.createEmailPasswordSession({
        email: normalizedEmail,
        password,
      });

      setSuccess("Your account has been created successfully. You are now logged in.");

      window.location.href = "/account";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to create your account.";

      if (message.toLowerCase().includes("already exists")) {
        setError("An account with this email already exists. Please log in.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-neutral-900">
      <div className="mx-auto grid min-h-[75vh] max-w-6xl overflow-hidden rounded-2xl border border-neutral-200 md:grid-cols-2">
        <section className="hidden bg-neutral-950 p-12 text-white md:flex md:flex-col md:justify-between">
          <Link href="/" className="text-2xl font-black tracking-[0.2em]">
            VICWAV
          </Link>

          <div>
            <p className="mb-4 text-xs font-bold tracking-[0.3em] text-neutral-400">
              YOUR STYLE STARTS HERE
            </p>
            <h1 className="max-w-md text-5xl font-semibold leading-tight">
              Discover your style. Make it yours.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-400">
              Create an account to enjoy a more personal shopping experience
              and keep track of your orders.
            </p>
          </div>

          <p className="text-xs text-neutral-500">
            © 2026 VICWAV. All rights reserved.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 py-12 sm:p-12">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="text-xl font-black tracking-[0.2em] md:hidden"
            >
              VICWAV
            </Link>

            <div className="mb-8 mt-8 md:mt-0">
              <p className="mb-3 text-xs font-bold tracking-[0.25em] text-neutral-500">
                CREATE YOUR ACCOUNT
              </p>
              <h2 className="text-3xl font-semibold">Join VICWAV</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Enter your details to get started.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full name
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Confirm password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Re-enter your password"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                  className="h-4 w-4 accent-black"
                />
                Show passwords
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-black underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
```

## `./app/shop/page.tsx`
```tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  getProducts,
  getCategories,
  type StoreProduct,
  type StoreCategory,
} from "@/lib/products";

type ShopProduct = StoreProduct & {
  category: string;
};

const defaultCategories = ["All"];

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true);
        setError("");

        const [productData, categoryData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        const categoryMap = new Map(
          categoryData.map((category: StoreCategory) => [
            category.$id,
            category.name,
          ])
        );

        const mappedProducts: ShopProduct[] = productData.map(
          (product) => ({
            ...product,
            category: categoryMap.get(product.category_id) || "Other",
          })
        );

        setProducts(mappedProducts);

        setCategories([
          "All",
          ...categoryData.map((category) => category.name),
        ]);
      } catch (err) {
        console.error("Failed to load shop:", err);
        setError(
          "We couldn't load the products. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, []);

  let filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const searchTerm = search.toLowerCase().trim();

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (sort === "low") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => a.price - b.price
    );
  }

  if (sort === "high") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => b.price - a.price
    );
  }

  if (sort === "featured") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => Number(b.is_featured) - Number(a.is_featured)
    );
  }

  function clearFilters() {
    setSelectedCategory("All");
    setSearch("");
    setSort("featured");
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* Page Heading */}
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-14 md:px-10 md:pt-20">
        <p className="mb-3 text-xs tracking-[0.25em] text-slate-500">
          OUR COLLECTION
        </p>

        <h1 className="text-4xl font-black tracking-tight text-[#07152e] md:text-7xl">
          THE SHOP.
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">
          Explore everyday essentials, streetwear and timeless pieces
          designed for your own style.
        </p>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <Search size={20} className="text-slate-500" />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 border border-slate-200 px-4 py-3 text-xs font-bold tracking-widest md:hidden"
          >
            <SlidersHorizontal size={16} />
            FILTER
          </button>

          <p className="text-xs text-slate-500">
            {loading ? "LOADING PRODUCTS..." : `${filteredProducts.length} PRODUCTS`}
          </p>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-slate-200 bg-white px-3 py-3 text-xs outline-none"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        {/* Mobile filters */}
        {mobileFilterOpen && (
          <div className="mt-5 border border-slate-200 p-5 md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-widest">
                CATEGORIES
              </h3>

              <button
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setMobileFilterOpen(false);
                  }}
                  className={`border px-4 py-3 text-xs ${
                    selectedCategory === category
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-slate-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-10 md:grid-cols-[220px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <h3 className="mb-5 text-xs font-bold tracking-widest">
              CATEGORIES
            </h3>

            <div className="space-y-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`block text-left text-sm ${
                    selectedCategory === category
                      ? "font-bold"
                      : "text-slate-500 hover:text-blue-700"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-12 border-t border-slate-200 pt-7">
              <button
                onClick={clearFilters}
                className="text-xs font-bold tracking-widest underline"
              >
                CLEAR FILTERS
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div>
            {loading ? (
              <div className="py-24 text-center">
                <p className="text-sm text-slate-500">
                  Loading our collection...
                </p>
              </div>
            ) : error ? (
              <div className="py-24 text-center">
                <h2 className="text-xl font-bold">
                  Unable to load products
                </h2>

                <p className="mt-3 text-sm text-slate-500">{error}</p>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 border border-blue-700 px-6 py-3 text-xs font-bold"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <h2 className="text-xl font-bold">
                  No products found
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  Try another search or category.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-6 border border-blue-700 px-6 py-3 text-xs font-bold"
                >
                  RESET
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    href={`/product/${product.$id}`}
                    key={product.$id}
                    className="group block"
                  >
                    <div className="relative overflow-hidden bg-slate-100">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-[260px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[400px]"
                      />

                      {product.tag && (
                        <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[10px] font-bold tracking-widest">
                          {product.tag}
                        </span>
                      )}

                      {product.stock_quantity <= 0 && (
                        <span className="absolute bottom-3 left-3 bg-[#07152e] px-3 py-2 text-[10px] font-bold tracking-widest text-white">
                          SOLD OUT
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-[10px] tracking-widest text-slate-500">
                        {product.category.toUpperCase()}
                      </p>

                      <h3 className="mt-2 text-sm font-medium">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-sm font-bold">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 border-t border-slate-200 bg-[#07152e] px-5 py-10 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight">
            CLOTHING.
          </Link>

          <p className="text-xs text-slate-500">
            © 2026 CLOTHING. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
```

## `./components/AppwritePing.tsx`
```tsx
"use client";

import { useEffect } from "react";
import { client } from "@/lib/appwrite";

export default function AppwritePing() {
  useEffect(() => {
    client.ping()
      .then(() => {
        console.log("Appwrite connection successful!");
      })
      .catch((error) => {
        console.error("Appwrite connection failed:", error);
      });
  }, []);

  return null;
}```

## `./components/StoreFooter.tsx`
```tsx

import Link from "next/link";
import { ArrowUpRight, Music2 } from "lucide-react";

const columns = [
  {
    title: "EXPLORE",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "New Arrivals", href: "/shop" },
      { label: "Bestsellers", href: "/shop" },
      { label: "Collections", href: "/shop" },
    ],
  },
  {
    title: "MY VICWAV",
    links: [
      { label: "My Account", href: "/account" },
      { label: "My Orders", href: "/account/orders" },
      { label: "Shopping Cart", href: "/cart" },
      { label: "Checkout", href: "/checkout" },
    ],
  },
  {
    title: "CUSTOMER CARE",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Information", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "FAQs", href: "/faq" },
    ],
  },
];

export default function StoreFooter() {
  return (
    <footer className="mt-auto bg-[#07152e] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-16">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-10">
          {/* Brand and social links */}
          <div className="max-w-sm">
            <Link href="/" className="text-3xl font-black tracking-tight">
              VICWAV<span className="text-cyan-400">.</span>
            </Link>

            <p className="mt-5 text-sm leading-7 text-slate-300">
              Elevate your everyday. Discover modern streetwear and
              everyday essentials designed for confidence, comfort
              and individuality.
            </p>

            <p className="mt-7 text-xs font-bold tracking-[0.2em] text-cyan-400">
              FOLLOW VICWAV
            </p>

            <div className="mt-4 flex items-center gap-3">
              <a
                href="https://www.instagram.com/vicwav/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-sm font-bold text-slate-200 transition hover:border-cyan-400 hover:bg-cyan-400 hover:text-[#07152e]"
              >
                IG
              </a>

              <a
                href="https://www.facebook.com/vicwav/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-sm font-bold text-slate-200 transition hover:border-cyan-400 hover:bg-cyan-400 hover:text-[#07152e]"
              >
                f
              </a>

              <a
                href="https://www.tiktok.com/@vicwav"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-slate-200 transition hover:border-cyan-400 hover:bg-cyan-400 hover:text-[#07152e]"
              >
                <Music2 size={18} />
              </a>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Social links are temporary placeholders.
            </p>
          </div>

          {/* Navigation columns */}
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold tracking-[0.2em] text-cyan-400">
                {column.title}
              </h3>

              <ul className="mt-6 space-y-4">
                {column.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-300 transition hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-14 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>© 2026 VICWAV. All rights reserved.</p>

          <p className="flex items-center gap-2">
            STYLE THAT MOVES WITH YOU
            <ArrowUpRight size={14} className="text-cyan-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
```

## `./components/StoreNavbar.tsx`
```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  ShoppingBag,
  UserRound,
  Package,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from "lucide-react";
import { Models } from "appwrite";
import { account } from "@/lib/appwrite";

export default function StoreNavbar() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadUser() {
      try {
        const currentUser = await account.get();

        if (!active) return;
        setUser(currentUser);

        const session = await account.createJWT();

        const response = await fetch("/api/admin/access", {
          headers: {
            Authorization: `Bearer ${session.jwt}`,
          },
          cache: "no-store",
        });

        if (!active) return;

        if (response.ok) {
          const result = await response.json();
          setIsAdmin(result.isAdmin === true);
        }
      } catch {
        if (active) {
          setUser(null);
          setIsAdmin(false);
        }
      }
    }

    loadUser();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await account.deleteSession({ sessionId: "current" });
      window.location.href = "/";
    } catch {
      setLoggingOut(false);
    }
  }

  const closeMenus = () => {
    setMenuOpen(false);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Announcement bar */}
      <div className="bg-[#07152e] px-4 py-2 text-center text-[10px] font-semibold tracking-[0.2em] text-cyan-300 sm:text-xs">
        FREE SHIPPING ON ORDERS OVER $100
      </div>

      {/* Main navigation */}
      <nav className="border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 md:px-8">
          {/* Brand */}
          <Link
            href="/"
            onClick={closeMenus}
            className="flex items-center gap-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1e42] text-lg font-black text-cyan-300">
              V
            </span>

            <span className="text-2xl font-black tracking-[0.16em] text-[#0b1e42]">
              VICWAV
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link
              href="/"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Home
            </Link>

            <Link
              href="/shop"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Shop
            </Link>

            <Link
              href="/#categories"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Collections
            </Link>

            <Link
              href="/#about"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              About
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/cart"
              aria-label="Shopping cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#0b1e42] transition hover:bg-blue-50 hover:text-blue-600"
            >
              <ShoppingBag size={21} />
            </Link>

            {/* Signed-in user */}
            {user ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 transition hover:border-blue-300 hover:bg-blue-50"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <UserRound size={19} />
                  </span>

                  <span className="max-w-[120px] text-left">
                    <span className="block truncate text-sm font-bold text-[#0b1e42]">
                      {user.name || "My Account"}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      My profile
                    </span>
                  </span>

                  <ChevronDown
                    size={15}
                    className={`text-slate-500 transition ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                    <div className="bg-[#0b1e42] p-5 text-white">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-cyan-300">
                          <UserRound size={22} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-bold">
                            {user.name || "Customer"}
                          </p>
                          <p className="truncate text-xs text-blue-200">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-white/15 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-300">
                          Account ID
                        </p>
                        <p className="mt-1 break-all text-xs text-blue-100">
                          {user.$id}
                        </p>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/account"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <UserRound size={17} />
                        My Account
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Package size={17} />
                        My Orders
                      </Link>

                      <Link
                        href="/account/settings"
                        onClick={closeMenus}
                        className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                      >
                        <Settings size={17} />
                        Settings
                      </Link>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={closeMenus}
                          className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                        >
                          <LayoutDashboard size={17} />
                          Admin Dashboard
                          <ShieldCheck size={15} className="ml-auto" />
                        </Link>
                      )}

                      <div className="my-2 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <LogOut size={17} />
                        {loggingOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-semibold text-[#0b1e42] transition hover:text-blue-600"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-[#0b1e42] px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0b1e42] transition hover:bg-blue-100 lg:hidden"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-5 py-5 shadow-xl lg:hidden">
            <div className="space-y-1">
              <Link
                href="/"
                onClick={closeMenus}
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50"
              >
                Home
              </Link>

              <Link
                href="/shop"
                onClick={closeMenus}
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50"
              >
                Shop
              </Link>

              <Link
                href="/#categories"
                onClick={closeMenus}
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50"
              >
                Collections
              </Link>

              <Link
                href="/#about"
                onClick={closeMenus}
                className="block rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50"
              >
                About
              </Link>
            </div>

            <div className="my-4 border-t border-slate-200" />

            {user ? (
              <>
                <div className="rounded-xl bg-[#0b1e42] p-4 text-white">
                  <p className="font-bold">{user.name || "Customer"}</p>
                  <p className="mt-1 break-all text-xs text-blue-200">
                    {user.$id}
                  </p>
                </div>

                <div className="mt-3 space-y-1">
                  <Link
                    href="/account"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50"
                  >
                    <UserRound size={17} />
                    My Account
                  </Link>

                  <Link
                    href="/account/orders"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50"
                  >
                    <Package size={17} />
                    My Orders
                  </Link>

                  <Link
                    href="/account/settings"
                    onClick={closeMenus}
                    className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-700 hover:bg-blue-50"
                  >
                    <Settings size={17} />
                    Settings
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={closeMenus}
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      <LayoutDashboard size={17} />
                      Admin Dashboard
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <LogOut size={17} />
                    {loggingOut ? "Signing out..." : "Sign Out"}
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  onClick={closeMenus}
                  className="rounded-xl border border-slate-300 px-4 py-3 text-center text-sm font-bold text-[#0b1e42]"
                >
                  Sign In
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenus}
                  className="rounded-xl bg-[#0b1e42] px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
```

## `./eslint.config.mjs`
```mjs
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
```

## `./lib/admin-auth.ts`
```ts
import "server-only";

import { NextRequest } from "next/server";
import { Account, Client } from "node-appwrite";

export async function getAdminUserId(
  request: NextRequest
): Promise<string | null> {
  try {
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return null;
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return null;
    }

    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    const allowedAdmins = (process.env.ADMIN_USER_IDS || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!endpoint || !projectId || allowedAdmins.length === 0) {
      return null;
    }

    const client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setJWT(token);

    const user = await new Account(client).get();

    if (!allowedAdmins.includes(user.$id)) {
      return null;
    }

    return user.$id;
  } catch {
    return null;
  }
}```

## `./lib/appwrite-admin.ts`
```ts
import "server-only";
import { Client, TablesDB } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseIdValue = process.env.APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseIdValue) {
  throw new Error("Missing server-side Appwrite environment variables.");
}

const databaseId: string = databaseIdValue;

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const tablesDB = new TablesDB(client);

export { tablesDB, databaseId };
```

## `./lib/appwrite.ts`
```ts
import { Account, Client } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

if (!endpoint || !projectId) {
  throw new Error("Missing Appwrite environment variables");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

const account = new Account(client);

export { client, account };```

## `./lib/products.ts`
```ts

import { TablesDB, Query } from "appwrite";
import { client } from "@/lib/appwrite";

const tablesDB = new TablesDB(client);

const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;

if (!databaseId) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID");
}

export type StoreProduct = {
  $id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price?: number | null;
  category_id: string;
  sku: string;
  image_url: string;
  images?: string[];
  sizes: string[];
  colors: string[];
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  tag?: string | null;
};

export type StoreCategory = {
  $id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  sort_order: number;
};

export async function getProducts(): Promise<StoreProduct[]> {
  const response = await tablesDB.listRows({
    databaseId,
    tableId: "products",
    queries: [
      Query.equal("is_active", true),
      Query.limit(100),
    ],
  });

  return response.rows as unknown as StoreProduct[];
}

export async function getCategories(): Promise<StoreCategory[]> {
  const response = await tablesDB.listRows({
    databaseId,
    tableId: "categories",
    queries: [
      Query.equal("is_active", true),
      Query.limit(100),
    ],
  });

  return (response.rows as unknown as StoreCategory[]).sort(
    (a, b) => a.sort_order - b.sort_order
  );
}

export async function getProductById(
  id: string
): Promise<StoreProduct | null> {
  try {
    const product = await tablesDB.getRow({
      databaseId,
      tableId: "products",
      rowId: id,
    });

    const storeProduct = product as unknown as StoreProduct;

    if (!storeProduct.is_active) {
      return null;
    }

    return storeProduct;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    return null;
  }
}
```

## `./next-env.d.ts`
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/types/routes.d.ts";
import "./.next/types/root-params.d.ts";

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

## `./next.config.ts`
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
```

## `./package.json`
```json
{
  "name": "clothing-shop",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.12.7",
    "@supabase/supabase-js": "^2.119.2",
    "appwrite": "^29.3.1",
    "lucide-react": "^1.80.0",
    "next": "16.4.6",
    "node-appwrite": "^32.0.0",
    "react": "19.3.0",
    "react-dom": "19.3.0"
  },
  "devDependencies": {
    "@tailwindcss/turbopack": "4.3.3",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.4.6",
    "tailwindcss": "4.3.3",
    "typescript": "^5"
  }
}
```

## `./scripts/seed-store.mjs`
```mjs

import { Client, TablesDB } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  throw new Error("Missing Appwrite environment variables.");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const db = new TablesDB(client);

const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
const colors = ["Black", "White", "Grey"];

const categories = [
  {
    id: "tracksuits",
    name: "Tracksuits",
    slug: "tracksuits",
    description: "Comfortable tracksuits and sporty streetwear essentials.",
    sort_order: 1,
  },
  {
    id: "hoodies",
    name: "Hoodies",
    slug: "hoodies",
    description: "Relaxed hoodies designed for everyday comfort.",
    sort_order: 2,
  },
  {
    id: "pants",
    name: "Pants",
    slug: "pants",
    description: "Modern trousers, cargo pants and denim essentials.",
    sort_order: 3,
  },
  {
    id: "t-shirts",
    name: "T-Shirts",
    slug: "t-shirts",
    description: "Everyday T-shirts and streetwear tops.",
    sort_order: 4,
  },
  {
    id: "jackets",
    name: "Jackets",
    slug: "jackets",
    description: "Versatile jackets and contemporary outerwear.",
    sort_order: 5,
  },
];

const products = [
  {
    id: "classic-track-set",
    name: "Classic Track Set",
    price: 45,
    category: "tracksuits",
    image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
    tag: "BESTSELLER",
    description: "A comfortable everyday tracksuit designed for effortless streetwear style. Perfect for casual outings, travelling and everyday wear.",
    sku: "VW-TRK-001",
    featured: true,
  },
  {
    id: "essential-hoodie",
    name: "Essential Hoodie",
    price: 38,
    category: "hoodies",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
    tag: "NEW",
    description: "A versatile hoodie with a relaxed fit. An everyday essential that combines comfort and contemporary streetwear style.",
    sku: "VW-HOD-002",
    featured: true,
  },
  {
    id: "urban-cargo-pants",
    name: "Urban Cargo Pants",
    price: 42,
    category: "pants",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "Modern cargo-inspired styling with a relaxed silhouette. Made for everyday comfort and versatile outfits.",
    sku: "VW-PNT-003",
    featured: false,
  },
  {
    id: "everyday-white-tee",
    name: "Everyday White Tee",
    price: 22,
    category: "t-shirts",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    tag: "POPULAR",
    description: "A clean, versatile white T-shirt that works with almost any outfit. A simple essential for your wardrobe.",
    sku: "VW-TEE-004",
    featured: true,
  },
  {
    id: "premium-black-jacket",
    name: "Premium Black Jacket",
    price: 65,
    category: "jackets",
    image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=85",
    tag: "NEW",
    description: "A statement jacket designed to elevate your everyday look. A versatile outerwear piece for modern wardrobes.",
    sku: "VW-JKT-005",
    featured: true,
  },
  {
    id: "relaxed-fit-hoodie",
    name: "Relaxed Fit Hoodie",
    price: 40,
    category: "hoodies",
    image: "https://images.unsplash.com/photo-1578681994506-b8f463449011?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "A relaxed hoodie made for casual styling, layering and everyday comfort.",
    sku: "VW-HOD-006",
    featured: false,
  },
  {
    id: "streetwear-denim",
    name: "Streetwear Denim",
    price: 48,
    category: "pants",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "A versatile denim essential that brings a modern streetwear feel to everyday outfits.",
    sku: "VW-PNT-007",
    featured: false,
  },
  {
    id: "graphic-street-tee",
    name: "Graphic Street Tee",
    price: 25,
    category: "t-shirts",
    image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=85",
    tag: "NEW",
    description: "A graphic-inspired streetwear T-shirt for adding personality to your everyday look.",
    sku: "VW-TEE-008",
    featured: true,
  },
  {
    id: "sport-track-jacket",
    name: "Sport Track Jacket",
    price: 52,
    category: "tracksuits",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "A sporty outerwear essential designed for comfortable everyday styling.",
    sku: "VW-TRK-009",
    featured: false,
  },
  {
    id: "oversized-tee",
    name: "Oversized Tee",
    price: 28,
    category: "t-shirts",
    image: "https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "An oversized everyday T-shirt with a relaxed streetwear-inspired silhouette.",
    sku: "VW-TEE-010",
    featured: false,
  },
  {
    id: "heavyweight-hoodie",
    name: "Heavyweight Hoodie",
    price: 55,
    category: "hoodies",
    image: "https://images.unsplash.com/photo-1609873814058-a5a8c5d2e7a5?auto=format&fit=crop&w=900&q=85",
    tag: "PREMIUM",
    description: "A premium-inspired heavyweight hoodie for a comfortable, relaxed everyday look.",
    sku: "VW-HOD-011",
    featured: true,
  },
  {
    id: "utility-cargo",
    name: "Utility Cargo",
    price: 50,
    category: "pants",
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85",
    tag: "",
    description: "Utility-inspired cargo trousers with a versatile design for everyday streetwear outfits.",
    sku: "VW-PNT-012",
    featured: false,
  },
];

async function getExistingRow(tableId, rowId) {
  try {
    return await db.getRow({
      databaseId,
      tableId,
      rowId,
    });
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

async function seedCategories() {
  console.log("\nSeeding categories...");

  for (const category of categories) {
    const existing = await getExistingRow("categories", category.id);

    const data = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      is_active: true,
      sort_order: category.sort_order,
    };

    if (existing) {
      await db.updateRow({
        databaseId,
        tableId: "categories",
        rowId: category.id,
        data,
      });
      console.log(`Updated category: ${category.name}`);
    } else {
      await db.createRow({
        databaseId,
        tableId: "categories",
        rowId: category.id,
        data,
      });
      console.log(`Created category: ${category.name}`);
    }
  }
}

async function seedProducts() {
  console.log("\nSeeding products...");

  for (const product of products) {
    const existing = await getExistingRow("products", product.id);

    const data = {
      name: product.name,
      slug: product.id,
      description: product.description,
      price: product.price,
      category_id: product.category,
      sku: product.sku,
      image_url: product.image,
      images: [product.image],
      sizes,
      colors,
      stock_quantity: 10,
      is_active: true,
      is_featured: product.featured,
      tag: product.tag || null,
    };

    if (existing) {
      await db.updateRow({
        databaseId,
        tableId: "products",
        rowId: product.id,
        data,
      });
      console.log(`Updated product: ${product.name}`);
    } else {
      await db.createRow({
        databaseId,
        tableId: "products",
        rowId: product.id,
        data,
      });
      console.log(`Created product: ${product.name}`);
    }
  }
}

async function main() {
  console.log("Starting VicWav catalogue seeding...");

  await seedCategories();
  await seedProducts();

  console.log("\nCatalogue seeding completed successfully!");
  console.log(`Categories: ${categories.length}`);
  console.log(`Products: ${products.length}`);
  console.log("Initial stock: 10 units per product");
}

main().catch((error) => {
  console.error("\nCatalogue seeding failed:");
  console.error(error.message);
  process.exit(1);
});
```

## `./scripts/setup-products.mjs`
```mjs

import { Client, TablesDB } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = process.env.APPWRITE_DATABASE_ID;

if (!endpoint || !projectId || !apiKey || !databaseId) {
  throw new Error("Missing Appwrite environment variables in .env.local");
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const db = new TablesDB(client);
const tableId = "products";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function ensureTable() {
  try {
    await db.getTable({ databaseId, tableId });
    console.log("Products table already exists.");
  } catch {
    await db.createTable({
      databaseId,
      tableId,
      name: "Products",
    });
    console.log("Created products table.");
  }
}

const columns = [
  { key: "name", type: "varchar", size: 150, required: true },
  { key: "slug", type: "varchar", size: 150, required: true },
  { key: "description", type: "text", required: false },
  { key: "price", type: "float", required: true },
  { key: "compare_at_price", type: "float", required: false },
  { key: "category_id", type: "varchar", size: 50, required: true },
  { key: "sku", type: "varchar", size: 64, required: true },
  { key: "image_url", type: "varchar", size: 2048, required: false },
  { key: "images", type: "varchar", size: 2048, required: false, array: true },
  { key: "sizes", type: "varchar", size: 50, required: false, array: true },
  { key: "colors", type: "varchar", size: 50, required: false, array: true },
  { key: "stock_quantity", type: "integer", required: true },
  { key: "is_active", type: "boolean", required: true },
  { key: "is_featured", type: "boolean", required: true },
  { key: "tag", type: "varchar", size: 30, required: false },
];

async function ensureColumn(column) {
  const existing = await db.listColumns({
    databaseId,
    tableId,
  });

  if (existing.columns.some((item) => item.key === column.key)) {
    console.log(`Column exists: ${column.key}`);
    return;
  }

  const common = {
    databaseId,
    tableId,
    key: column.key,
    required: column.required,
    array: column.array ?? false,
  };

  switch (column.type) {
    case "varchar":
      await db.createVarcharColumn({
        ...common,
        size: column.size,
      });
      break;
    case "text":
      await db.createTextColumn(common);
      break;
    case "float":
      await db.createFloatColumn(common);
      break;
    case "integer":
      await db.createIntegerColumn(common);
      break;
    case "boolean":
      await db.createBooleanColumn(common);
      break;
    default:
      throw new Error(`Unsupported column type: ${column.type}`);
  }

  console.log(`Created column: ${column.key}`);
}

async function waitForColumns() {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = await db.listColumns({
      databaseId,
      tableId,
    });

    const ready = columns.every((column) => {
      const found = result.columns.find(
        (item) => item.key === column.key
      );

      return found && found.status === "available";
    });

    if (ready) return;

    await wait(2000);
  }

  throw new Error("Columns are still processing. Run the script again later.");
}

const indexes = [
  {
    key: "slug_unique",
    type: "unique",
    columns: ["slug"],
    lengths: [150],
  },
  {
    key: "sku_unique",
    type: "unique",
    columns: ["sku"],
    lengths: [64],
  },
  {
    key: "category_index",
    type: "key",
    columns: ["category_id"],
  },
  {
    key: "active_index",
    type: "key",
    columns: ["is_active"],
  },
  {
    key: "featured_index",
    type: "key",
    columns: ["is_featured"],
  },
];

async function ensureIndexes() {
  for (const index of indexes) {
    const existing = await db.listIndexes({
      databaseId,
      tableId,
    });

    if (existing.indexes.some((item) => item.key === index.key)) {
      console.log(`Index exists: ${index.key}`);
      continue;
    }

    await db.createIndex({
      databaseId,
      tableId,
      ...index,
    });

    console.log(`Created index: ${index.key}`);
  }
}

async function main() {
  console.log("Starting clothing store database setup...");

  await ensureTable();

  for (const column of columns) {
    await ensureColumn(column);
  }

  console.log("Waiting for columns to become available...");
  await waitForColumns();

  await ensureIndexes();

  console.log("Products table setup completed successfully!");
}

main().catch((error) => {
  console.error("Database setup failed:", error.message);
  process.exit(1);
});
```

## `./scripts/setup-store-tables.mjs`
```mjs

import { Client, TablesDB } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const db = new TablesDB(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;

if (
  !process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  !process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ||
  !process.env.APPWRITE_API_KEY ||
  !databaseId
) {
  throw new Error("Missing Appwrite environment variables.");
}

const varchar = (key, size, required = false) => ({
  key, type: "varchar", size, required,
});

const text = (key, required = false) => ({
  key, type: "text", required,
});

const float = (key, required = false) => ({
  key, type: "float", required,
});

const integer = (key, required = false) => ({
  key, type: "integer", required,
});

const boolean = (key, required = false) => ({
  key, type: "boolean", required,
});

const datetime = (key, required = false) => ({
  key, type: "datetime", required,
});

const tables = [
  {
    id: "categories",
    name: "Categories",
    columns: [
      varchar("name", 100, true),
      varchar("slug", 120, true),
      text("description"),
      varchar("image_url", 2048),
      boolean("is_active", true),
      integer("sort_order", true),
    ],
    indexes: [
      { key: "category_slug_unique", type: "unique", columns: ["slug"] },
    ],
  },
  {
    id: "customers",
    name: "Customers",
    columns: [
      varchar("user_id", 64, true),
      varchar("full_name", 150, true),
      varchar("email", 254, true),
      varchar("phone", 30),
      varchar("address_line", 255),
      varchar("city", 100),
      varchar("country", 100),
    ],
    indexes: [
      { key: "customer_user_unique", type: "unique", columns: ["user_id"] },
      { key: "customer_email_index", type: "key", columns: ["email"] },
    ],
  },
  {
    id: "orders",
    name: "Orders",
    columns: [
      varchar("order_number", 50, true),
      varchar("customer_id", 64, true),
      float("subtotal", true),
      float("shipping_fee", true),
      float("total", true),
      varchar("currency", 10, true),
      varchar("payment_method", 50, true),
      varchar("payment_status", 30, true),
      varchar("order_status", 30, true),
      varchar("delivery_name", 150, true),
      varchar("delivery_phone", 30, true),
      varchar("delivery_address", 255, true),
      varchar("delivery_city", 100, true),
      text("customer_notes"),
      datetime("placed_at", true),
    ],
    indexes: [
      { key: "order_number_unique", type: "unique", columns: ["order_number"] },
      { key: "orders_customer_index", type: "key", columns: ["customer_id"] },
      { key: "orders_status_index", type: "key", columns: ["order_status"] },
    ],
  },
  {
    id: "order_items",
    name: "Order Items",
    columns: [
      varchar("order_id", 64, true),
      varchar("product_id", 64, true),
      varchar("product_name", 150, true),
      varchar("sku", 64, true),
      varchar("size", 50),
      varchar("color", 50),
      float("unit_price", true),
      integer("quantity", true),
      float("line_total", true),
    ],
    indexes: [
      { key: "items_order_index", type: "key", columns: ["order_id"] },
      { key: "items_product_index", type: "key", columns: ["product_id"] },
    ],
  },
];

async function ensureTable(table) {
  const result = await db.listTables({ databaseId });
  const exists = result.tables.some((item) => item.$id === table.id);

  if (!exists) {
    await db.createTable({
      databaseId,
      tableId: table.id,
      name: table.name,
    });
    console.log(`Created table: ${table.id}`);
  } else {
    console.log(`Table already exists: ${table.id}`);
  }
}

async function ensureColumn(tableId, column) {
  const result = await db.listColumns({ databaseId, tableId });

  if (result.columns.some((item) => item.key === column.key)) {
    console.log(`  Column exists: ${column.key}`);
    return;
  }

  const common = {
    databaseId,
    tableId,
    key: column.key,
    required: column.required,
  };

  switch (column.type) {
    case "varchar":
      await db.createVarcharColumn({
        ...common,
        size: column.size,
      });
      break;
    case "text":
      await db.createTextColumn(common);
      break;
    case "float":
      await db.createFloatColumn(common);
      break;
    case "integer":
      await db.createIntegerColumn(common);
      break;
    case "boolean":
      await db.createBooleanColumn(common);
      break;
    case "datetime":
      await db.createDatetimeColumn(common);
      break;
    default:
      throw new Error(`Unknown column type: ${column.type}`);
  }

  console.log(`  Created column: ${column.key}`);
}

async function waitForColumns(tableId, expectedColumns) {
  for (let attempt = 0; attempt < 60; attempt++) {
    const result = await db.listColumns({ databaseId, tableId });

    const ready = expectedColumns.every((column) => {
      const found = result.columns.find((item) => item.key === column.key);
      return found && found.status === "available";
    });

    if (ready) return;

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error(`Columns for ${tableId} did not become available.`);
}

async function ensureIndexes(tableId, indexes) {
  for (const index of indexes) {
    const result = await db.listIndexes({ databaseId, tableId });

    if (result.indexes.some((item) => item.key === index.key)) {
      console.log(`  Index exists: ${index.key}`);
      continue;
    }

    await db.createIndex({
      databaseId,
      tableId,
      ...index,
    });

    console.log(`  Created index: ${index.key}`);
  }
}

async function main() {
  console.log("Creating clothing store tables...");

  for (const table of tables) {
    console.log(`\nSetting up ${table.name}...`);

    await ensureTable(table);

    for (const column of table.columns) {
      await ensureColumn(table.id, column);
    }

    await waitForColumns(table.id, table.columns);
    await ensureIndexes(table.id, table.indexes);
  }

  console.log("\nAll four additional tables are ready!");
}

main().catch((error) => {
  console.error("\nSetup failed:", error.message);
  process.exit(1);
});
```

## `./tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    "**/*.mts"
  ],
  "exclude": ["node_modules"]
}
```

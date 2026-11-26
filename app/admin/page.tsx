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

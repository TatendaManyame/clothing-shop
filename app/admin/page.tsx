
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Loader,
  Package,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { account } from "@/lib/appwrite";
import AdminShell, { StatusBadge } from "../../components/AdminShell";

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

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboardPage() {
  const router = useRouter();

  const [greetingText, setGreetingText] = useState("Welcome");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const h = new Date().getHours();

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGreetingText(
      h < 12
        ? "Good morning"
        : h < 18
          ? "Good afternoon"
          : "Good evening"
    );
  }, []);

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
      setUpdatedAt(new Date());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load dashboard."
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

  const m = data?.metrics;

  const total = m?.totalOrders ?? 0;

  const other = Math.max(
    0,
    total -
      (m?.pendingOrders ?? 0) -
      (m?.processingOrders ?? 0) -
      (m?.completedOrders ?? 0)
  );

  const metricCards = [
    {
      label: "Total orders",
      value: total,
      description: "All orders received",
      icon: Package,
      tone: "from-[#07152e] to-[#0a2a8f] text-white",
      sub: "text-blue-200",
      iconBox: "bg-white/15 text-cyan-300",
    },
    {
      label: "Pending",
      value: m?.pendingOrders ?? 0,
      description: "Awaiting action",
      icon: Clock,
      tone: "bg-white",
      sub: "text-slate-500",
      iconBox: "bg-amber-100 text-amber-700",
    },
    {
      label: "Processing",
      value: m?.processingOrders ?? 0,
      description: "Currently being fulfilled",
      icon: Loader,
      tone: "bg-white",
      sub: "text-slate-500",
      iconBox: "bg-indigo-100 text-indigo-700",
    },
    {
      label: "Completed",
      value: m?.completedOrders ?? 0,
      description: "Successfully delivered",
      icon: CheckCircle2,
      tone: "bg-white",
      sub: "text-slate-500",
      iconBox: "bg-emerald-100 text-emerald-700",
    },
  ];

  const segments = [
    {
      label: "Pending",
      value: m?.pendingOrders ?? 0,
      cls: "bg-amber-400",
    },
    {
      label: "Processing",
      value: m?.processingOrders ?? 0,
      cls: "bg-indigo-500",
    },
    {
      label: "Completed",
      value: m?.completedOrders ?? 0,
      cls: "bg-emerald-500",
    },
    {
      label: "Other",
      value: other,
      cls: "bg-slate-300",
    },
  ];

  return (
    <AdminShell>
      {/* Heading */}
      <div className="adm-in mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.25em] text-blue-700">
            STORE MANAGEMENT
          </p>

          <h1 className="text-3xl font-black tracking-tight md:text-4xl">
            {greetingText}.
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Here&apos;s what&apos;s happening in your store
            {updatedAt && (
              <span className="text-slate-400">
                {" "}
                · updated{" "}
                {updatedAt.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading || refreshing}
            className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-xs font-bold tracking-widest transition hover:border-blue-500 hover:text-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            {refreshing ? "REFRESHING" : "REFRESH"}
          </button>

          <Link
            href="/admin/orders"
            className="flex items-center gap-2 rounded-full bg-[#07152e] px-6 py-3 text-xs font-bold tracking-widest text-white shadow-lg shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700"
          >
            MANAGE ORDERS
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-40 rounded-3xl bg-slate-200"
              />
            ))}
          </div>

          <div className="h-40 rounded-3xl bg-slate-200" />
          <div className="h-72 rounded-3xl bg-slate-200" />
        </div>
      ) : (
        <>
          {/* Metrics */}
          <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {metricCards.map(
              (
                {
                  label,
                  value,
                  description,
                  icon: Icon,
                  tone,
                  sub,
                  iconBox,
                },
                i
              ) => (
                <div
                  key={label}
                  className={`adm-in rounded-3xl border border-slate-200/80 p-6 shadow-sm ${
                    tone.startsWith("from")
                      ? `bg-gradient-to-br ${tone}`
                      : tone
                  }`}
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-semibold ${sub}`}>
                      {label}
                    </p>

                    <span
                      className={`grid h-10 w-10 place-items-center rounded-2xl ${iconBox}`}
                    >
                      <Icon size={18} />
                    </span>
                  </div>

                  <p className="mt-5 text-4xl font-black tabular-nums">
                    {value.toLocaleString()}
                  </p>

                  <p className={`mt-2 text-xs ${sub}`}>
                    {description}
                  </p>
                </div>
              )
            )}
          </section>

          {/* Pipeline and revenue */}
          <div className="mb-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            {/* Pipeline */}
            <section
              className="adm-in rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
              style={{ animationDelay: "250ms" }}
            >
              <h2 className="text-lg font-black">
                Order pipeline
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Share of all orders by stage.
              </p>

              {total === 0 ? (
                <p className="mt-6 text-sm text-slate-500">
                  No orders yet.
                </p>
              ) : (
                <>
                  <div
                    className="mt-6 flex h-4 overflow-hidden rounded-full bg-slate-100"
                    role="img"
                    aria-label="Order pipeline breakdown"
                  >
                    {segments.map((s) => (
                      <div
                        key={s.label}
                        className={`${s.cls} transition-all duration-1000`}
                        style={{
                          width: `${(s.value / total) * 100}%`,
                        }}
                      />
                    ))}
                  </div>

                  <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {segments.map((s) => (
                      <li key={s.label}>
                        <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${s.cls}`}
                          />
                          {s.label}
                        </p>

                        <p className="mt-1 text-xl font-black tabular-nums">
                          {s.value}{" "}
                          <span className="text-xs font-semibold text-slate-400">
                            {Math.round(
                              (s.value / total) * 100
                            )}
                            %
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>

            {/* Revenue */}
            <section
              className="adm-in rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
              style={{ animationDelay: "320ms" }}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-700">
                  <Wallet size={18} />
                </span>

                <div>
                  <h2 className="text-lg font-black leading-tight">
                    Revenue
                  </h2>

                  <p className="text-xs text-slate-500">
                    Paid orders only, by currency
                  </p>
                </div>
              </div>

              {Object.keys(data?.revenue || {}).length === 0 ? (
                <p className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                  No paid revenue recorded yet.
                </p>
              ) : (
                <div className="mt-6 space-y-3">
                  {Object.entries(data?.revenue || {}).map(
                    ([currency, amount]) => (
                      <div
                        key={currency}
                        className="rounded-2xl bg-gradient-to-br from-[#07152e] to-[#0a2a8f] p-5 text-white"
                      >
                        <p className="text-xs font-semibold tracking-wider text-cyan-300">
                          {currency} REVENUE
                        </p>

                        <p className="mt-2 text-3xl font-black tabular-nums">
                          {formatMoney(amount, currency)}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Recent Orders */}
          <section
            className="adm-in overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm"
            style={{ animationDelay: "400ms" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6 md:px-8">
              <div>
                <h2 className="text-lg font-black">
                  Recent orders
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Latest orders and their current statuses.
                </p>
              </div>

              <Link
                href="/admin/orders"
                className="flex items-center gap-1 text-xs font-bold tracking-widest text-blue-700 hover:underline"
              >
                VIEW ALL
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {!data?.recentOrders.length ? (
              <div className="p-12 text-center">
                <Package
                  size={30}
                  strokeWidth={1.4}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-4 text-sm font-semibold">
                  No orders yet
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  New orders will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                    <tr>
                      {[
                        "Order",
                        "Customer",
                        "Date",
                        "Total",
                        "Order status",
                        "Payment",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-6 py-4 font-bold md:first:pl-8"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {data.recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="px-6 py-4 font-bold md:pl-8">
                          <Link
                            href={`/admin/orders/${encodeURIComponent(order.id)}`}
                            className="text-blue-700 hover:underline"
                          >
                            {order.orderNumber}
                          </Link>
                        </td>

                        <td className="px-6 py-4 font-medium">
                          {order.customerName}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-500">
                          {formatDate(order.placedAt)}
                        </td>

                        <td className="px-6 py-4 font-black tabular-nums">
                          {formatMoney(order.total, order.currency)}
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={order.orderStatus} />
                        </td>

                        <td className="px-6 py-4">
                          <StatusBadge status={order.paymentStatus} />
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
    </AdminShell>
  );
}

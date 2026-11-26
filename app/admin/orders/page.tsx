"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, ChevronDown, MapPin, Package, RefreshCw, Search, X } from "lucide-react";
import { account } from "@/lib/appwrite";
import AdminShell, { StatusBadge } from "@/components/AdminShell";

type Order = {
  id: string;
  orderNumber: string;
  customer: { name: string; email: string; phone: string };
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  delivery: { name: string; phone: string; address: string; city: string };
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

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];

const selectCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-semibold capitalize outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50";

function formatDate(value: string) {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatMoney(value: number, currency: string) {
  return `${currency} ${Number(value).toFixed(2)}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [expanded, setExpanded] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  // debounce the search box so we don't hit the API on every keystroke
  useEffect(() => {
    const t = window.setTimeout(() => setSearch(searchInput), 350);
    return () => window.clearTimeout(t);
  }, [searchInput]);

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

      const response = await fetch(`/api/admin/orders?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!response.ok) throw new Error(data.error || "Unable to load orders.");

      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  }, [getToken, search, orderStatus, paymentStatus]);

  useEffect(() => {
    let active = true;
    async function initialise() {
      try {
        await account.get();
        if (active) await loadOrders();
      } catch {
        if (active) window.location.href = "/login";
      }
    }
    initialise();
    return () => {
      active = false;
    };
  }, [loadOrders]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  function showToast(message: string) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2500);
  }

  async function updateStatus(orderId: string, field: "orderStatus" | "paymentStatus", value: string) {
    setUpdatingId(orderId);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update order.");

      // update in place so the list doesn't jump
      setOrders((current) => current.map((o) => (o.id === orderId ? { ...o, [field]: value } : o)));
      showToast(`${field === "orderStatus" ? "Order" : "Payment"} status set to ${value}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update order.");
    } finally {
      setUpdatingId("");
    }
  }

  const toggle = (id: string) => setExpanded((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const hasFilters = !!(searchInput || orderStatus || paymentStatus);

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setOrderStatus("");
    setPaymentStatus("");
  }

  return (
    <AdminShell>
      <div className="adm-in mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-bold tracking-[0.25em] text-blue-700">STORE MANAGEMENT</p>
          <h1 className="text-3xl font-black tracking-tight md:text-4xl">Orders</h1>
          <p className="mt-2 text-sm text-slate-500">View customer orders and manage their order and payment statuses.</p>
        </div>
        <button onClick={loadOrders} disabled={loading} className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-3 text-xs font-bold tracking-widest transition hover:border-blue-500 hover:text-blue-700 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> REFRESH
        </button>
      </div>

      {/* filters */}
      <section className="adm-in mb-6 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm md:p-6" style={{ animationDelay: "80ms" }}>
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-slate-500">SEARCH ORDERS</span>
            <span className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
              <Search size={17} className="shrink-0 text-blue-600" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Order number, customer, email or phone"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {searchInput && (
                <button type="button" onClick={() => setSearchInput("")} aria-label="Clear search" className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                  <X size={15} />
                </button>
              )}
            </span>
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-bold tracking-wider text-slate-500">PAYMENT STATUS</span>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className={selectCls}>
              <option value="">All payments</option>
              {paymentStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
        </div>

        {/* status chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {["", ...orderStatuses].map((s) => (
            <button
              key={s || "all"}
              type="button"
              onClick={() => setOrderStatus(s)}
              aria-pressed={orderStatus === s}
              className={`rounded-full border px-4 py-2 text-xs font-bold capitalize transition ${
                orderStatus === s ? "border-[#07152e] bg-[#07152e] text-white" : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700"
              }`}
            >
              {s || "All orders"}
            </button>
          ))}
          {hasFilters && (
            <button type="button" onClick={clearFilters} className="ml-1 text-xs font-bold text-slate-500 underline-offset-4 hover:text-blue-700 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </section>

      {error && (
        <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <p className="mb-4 text-sm font-semibold text-slate-500" aria-live="polite">
        {loading ? "Loading orders..." : `${orders.length} order${orders.length === 1 ? "" : "s"} displayed`}
      </p>

      {loading && orders.length === 0 ? (
        <div className="animate-pulse space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-40 rounded-3xl bg-slate-200" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
          <Package size={34} strokeWidth={1.4} className="mx-auto text-slate-400" />
          <p className="mt-5 font-black">No orders found</p>
          <p className="mt-2 text-sm text-slate-500">Try changing your search or filters.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-6 rounded-full bg-[#07152e] px-7 py-3 text-xs font-bold tracking-widest text-white hover:bg-blue-700">
              CLEAR FILTERS
            </button>
          )}
        </div>
      ) : (
        <div className={`space-y-4 transition-opacity ${loading ? "opacity-60" : ""}`}>
          {orders.map((order, i) => {
            const open = expanded.includes(order.id);
            const busy = updatingId === order.id;
            const itemCount = order.items.reduce((n, it) => n + it.quantity, 0);

            return (
              <article key={order.id} className="adm-in overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-lg hover:shadow-slate-300/40" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
                {/* summary */}
                <div className="flex flex-wrap items-start justify-between gap-4 p-5 md:p-6">
                  <div>
                    <Link href={`/admin/orders/${encodeURIComponent(order.id)}`} className="group inline-flex items-center gap-1.5 text-lg font-black text-blue-700 hover:underline">
                      {order.orderNumber}
                      <ArrowUpRight size={15} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(order.placedAt)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge status={order.orderStatus} />
                      <StatusBadge status={order.paymentStatus} />
                    </div>
                  </div>

                  <div className="min-w-[10rem]">
                    <p className="text-sm font-bold">{order.customer.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{order.customer.email || "No email available"}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{order.customer.phone || "No phone available"}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-semibold tracking-wider text-slate-500">TOTAL</p>
                    <p className="mt-1 text-2xl font-black tabular-nums">{formatMoney(order.total, order.currency)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{itemCount} {itemCount === 1 ? "item" : "items"} · {order.paymentMethod}</p>
                  </div>
                </div>

                {/* status controls */}
                <div className="grid gap-4 border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:grid-cols-2 md:px-6">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-slate-500">ORDER STATUS</span>
                    <select value={order.orderStatus} disabled={busy} onChange={(e) => updateStatus(order.id, "orderStatus", e.target.value)} className={selectCls}>
                      {orderStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-slate-500">PAYMENT STATUS</span>
                    <select value={order.paymentStatus} disabled={busy} onChange={(e) => updateStatus(order.id, "paymentStatus", e.target.value)} className={selectCls}>
                      {paymentStatuses.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* expandable details */}
                <button type="button" onClick={() => toggle(order.id)} aria-expanded={open} className="flex w-full items-center justify-between border-t border-slate-100 px-5 py-3.5 text-xs font-bold tracking-widest text-slate-600 transition hover:bg-slate-50 hover:text-blue-700 md:px-6">
                  {open ? "HIDE DETAILS" : "ITEMS & DELIVERY"}
                  <ChevronDown size={16} className={`transition ${open ? "rotate-180" : ""}`} />
                </button>

                {open && (
                  <div className="adm-in grid gap-8 border-t border-slate-100 p-5 md:grid-cols-[1.4fr_1fr] md:p-6">
                    <div>
                      <h3 className="mb-4 text-xs font-bold tracking-wider text-slate-500">ITEMS ORDERED</h3>
                      <ul className="space-y-4">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex flex-wrap justify-between gap-3 text-sm">
                            <div>
                              <p className="font-semibold">{item.productName}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                SKU {item.sku} · Size {item.size || "N/A"} · {item.color || "N/A"} · Qty {item.quantity}
                              </p>
                            </div>
                            <p className="font-bold tabular-nums">{formatMoney(item.lineTotal, order.currency)}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="mb-4 text-xs font-bold tracking-wider text-slate-500">DELIVERY</h3>
                      <div className="flex gap-3 text-sm">
                        <MapPin size={17} className="mt-0.5 shrink-0 text-blue-600" />
                        <div>
                          <p className="font-semibold">{order.delivery.name}</p>
                          <p className="mt-1 text-slate-600">{order.delivery.phone}</p>
                          <p className="mt-1 text-slate-600">{order.delivery.address}, {order.delivery.city}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {busy && <div className="h-0.5 animate-pulse bg-gradient-to-r from-blue-500 to-cyan-400" />}
              </article>
            );
          })}
        </div>
      )}

      {/* toast */}
      <div aria-live="polite" className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>
        <div className="flex items-center gap-3 rounded-full bg-[#07152e] py-3 pl-4 pr-6 text-sm font-semibold capitalize text-white shadow-2xl">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500">
            <Check size={14} strokeWidth={3} />
          </span>
          {toast || "Updated"}
        </div>
      </div>
    </AdminShell>
  );
}
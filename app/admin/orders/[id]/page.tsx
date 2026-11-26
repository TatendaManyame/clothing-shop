"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Copy, CreditCard, Mail, MapPin, Phone, Printer, RefreshCw, StickyNote, Truck, User, X } from "lucide-react";
import { account } from "@/lib/appwrite";
import AdminShell, { StatusBadge } from "@/components/AdminShell";

type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: { name: string; email: string; phone: string };
  placedAt: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  delivery: { name: string; phone: string; address: string; city: string };
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

const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses = ["pending", "paid", "failed", "refunded"];
const progressSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

const selectCls =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3.5 text-sm font-semibold capitalize outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 disabled:opacity-50";

function Card({ title, icon: Icon, children, delay = 0 }: { title: string; icon: typeof User; children: React.ReactNode; delay?: number }) {
  return (
    <section className="adm-in rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-7" style={{ animationDelay: `${delay}ms` }}>
      <h2 className="mb-5 flex items-center gap-3 text-base font-black">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
          <Icon size={17} />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function OrderDetailsContent() {
  const params = useParams<{ id: string }>();
  const orderId = params.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState("");
  const toastTimer = useRef<number | undefined>(undefined);

  const getToken = useCallback(async () => {
    const jwt = await account.createJWT();
    return jwt.jwt;
  }, []);

  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (response.status === 403) throw new Error("Administrator access required.");
      if (!response.ok) throw new Error(data.error || "Unable to load order details.");

      setOrder(data.order);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load order details.");
    } finally {
      setLoading(false);
    }
  }, [getToken, orderId]);

  useEffect(() => {
    let active = true;
    async function initialise() {
      try {
        await account.get();
        if (active) await loadOrder();
      } catch {
        if (active) window.location.href = "/login";
      }
    }
    initialise();
    return () => {
      active = false;
    };
  }, [loadOrder]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  async function updateStatus(field: "orderStatus" | "paymentStatus", value: string) {
    if (!order) return;
    setUpdating(true);
    setError("");

    try {
      const token = await getToken();
      const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to update order.");

      setOrder((current) => (current ? { ...current, [field]: value } : current));
      setToast(`${field === "orderStatus" ? "Order" : "Payment"} status set to ${value}`);
      window.clearTimeout(toastTimer.current);
      toastTimer.current = window.setTimeout(() => setToast(""), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update order.");
    } finally {
      setUpdating(false);
    }
  }

  async function copy(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {}
  }

  const formatDate = (v: string) => {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  const formatMoney = (v: number) => `${order?.currency || "USD"} ${Number(v).toFixed(2)}`;

  if (loading && !order) {
    return (
      <AdminShell>
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-72 rounded-xl bg-slate-200" />
          <div className="h-36 rounded-3xl bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="h-96 rounded-3xl bg-slate-200" />
            <div className="h-96 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </AdminShell>
    );
  }

  if (!order) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500">
            <X size={26} />
          </div>
          <h1 className="mt-6 text-xl font-black">Unable to load order</h1>
          <p className="mt-3 text-sm text-red-600">{error || "This order could not be found."}</p>
          <Link href="/admin/orders" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#07152e] px-7 py-4 text-xs font-bold tracking-widest text-white transition hover:bg-blue-700">
            <ArrowLeft size={14} /> BACK TO ORDERS
          </Link>
        </div>
      </AdminShell>
    );
  }

  const progressIndex = progressSteps.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const waNumber = order.delivery.phone.replace(/[^\d]/g, "");

  return (
    <AdminShell>
      <Link href="/admin/orders" className="no-print mb-6 inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 transition hover:text-blue-700">
        <ArrowLeft size={15} /> BACK TO ORDERS
      </Link>

      {error && (
        <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* header */}
      <section className="adm-in mb-6 flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-xs font-bold tracking-[0.25em] text-blue-700">ORDER DETAILS</p>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight md:text-4xl">{order.orderNumber}</h1>
            <button onClick={() => copy("num", order.orderNumber)} aria-label="Copy order number" className="no-print grid h-9 w-9 place-items-center rounded-full text-slate-400 transition hover:bg-white hover:text-blue-700">
              {copied === "num" ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">Placed {formatDate(order.placedAt)}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusBadge status={order.orderStatus} />
            <StatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 sm:items-end">
          <div className="sm:text-right">
            <p className="text-[11px] font-semibold tracking-wider text-slate-500">ORDER TOTAL</p>
            <p className="mt-1 text-4xl font-black tabular-nums">{formatMoney(order.total)}</p>
          </div>
          <div className="no-print flex gap-2">
            <button onClick={loadOrder} disabled={loading || updating} className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold tracking-widest transition hover:border-blue-500 hover:text-blue-700 disabled:opacity-50">
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> REFRESH
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold tracking-widest transition hover:border-blue-500 hover:text-blue-700">
              <Printer size={13} /> PRINT
            </button>
          </div>
        </div>
      </section>

      {/* progress */}
      <section className="adm-in mb-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-8" style={{ animationDelay: "80ms" }}>
        <h2 className="mb-7 text-base font-black">Order progress</h2>

        {isCancelled ? (
          <p className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            <X size={18} /> This order has been cancelled.
          </p>
        ) : (
          <ol className="relative grid grid-cols-5">
            <div className="absolute left-[10%] right-[10%] top-4 h-0.5 bg-slate-200" aria-hidden="true" />
            <div className="absolute left-[10%] top-4 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000" style={{ width: `${Math.max(0, progressIndex) * 20}%` }} aria-hidden="true" />
            {progressSteps.map((step, index) => {
              const completed = progressIndex >= index;
              const current = progressIndex === index;
              return (
                <li key={step} className="relative flex flex-col items-center text-center" aria-current={current ? "step" : undefined}>
                  <span className={`relative grid h-8 w-8 place-items-center rounded-full text-xs font-bold ring-4 ring-white transition ${completed ? "bg-[#07152e] text-white" : "bg-slate-200 text-slate-500"}`}>
                    {completed ? <Check size={15} strokeWidth={3} /> : index + 1}
                    {current && <span className="absolute inset-0 animate-ping rounded-full bg-blue-500/40" />}
                  </span>
                  <span className={`mt-3 text-[10px] font-bold capitalize sm:text-xs ${completed ? "text-[#07152e]" : "text-slate-400"}`}>{step}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* left */}
        <div className="space-y-6">
          <Card title={`Products ordered (${itemCount})`} icon={Truck} delay={140}>
            <ul className="divide-y divide-slate-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex flex-wrap justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="font-bold">{item.productName}</p>
                    <p className="mt-1 text-xs text-slate-500">SKU {item.sku}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-full bg-slate-100 px-3 py-1">Size {item.size || "N/A"}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{item.color || "N/A"}</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{item.quantity} × {formatMoney(item.unitPrice)}</span>
                    </div>
                  </div>
                  <p className="text-lg font-black tabular-nums">{formatMoney(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Customer" icon={User} delay={200}>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-slate-500">NAME</dt>
                  <dd className="mt-1 font-semibold">{order.customer.name}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-slate-500">EMAIL</dt>
                  <dd className="mt-1 break-all">
                    {order.customer.email ? (
                      <a href={`mailto:${order.customer.email}`} className="inline-flex items-center gap-2 font-medium text-blue-700 hover:underline">
                        <Mail size={14} /> {order.customer.email}
                      </a>
                    ) : (
                      "Not available"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-slate-500">PHONE</dt>
                  <dd className="mt-1">
                    {order.customer.phone ? (
                      <a href={`tel:${order.customer.phone}`} className="inline-flex items-center gap-2 font-medium text-blue-700 hover:underline">
                        <Phone size={14} /> {order.customer.phone}
                      </a>
                    ) : (
                      "Not available"
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-slate-500">ACCOUNT ID</dt>
                  <dd className="mt-1 flex items-center gap-2 break-all text-xs text-slate-600">
                    {order.customerId}
                    <button onClick={() => copy("cid", order.customerId)} aria-label="Copy account ID" className="no-print shrink-0 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-700">
                      {copied === "cid" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  </dd>
                </div>
              </dl>
            </Card>

            <Card title="Delivery" icon={MapPin} delay={260}>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-slate-500">RECIPIENT</dt>
                  <dd className="mt-1 font-semibold">{order.delivery.name}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-slate-500">CONTACT NUMBER</dt>
                  <dd className="mt-1 flex flex-wrap items-center gap-3">
                    <a href={`tel:${order.delivery.phone}`} className="inline-flex items-center gap-2 font-medium text-blue-700 hover:underline">
                      <Phone size={14} /> {order.delivery.phone}
                    </a>
                    {waNumber && (
                      <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" className="no-print rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100">
                        WhatsApp
                      </a>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-[11px] font-bold tracking-wider text-slate-500">ADDRESS</dt>
                  <dd className="mt-1 leading-6">{order.delivery.address}, {order.delivery.city}</dd>
                </div>
              </dl>
            </Card>
          </div>

          <Card title="Customer notes" icon={StickyNote} delay={320}>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{order.customerNotes || "No additional notes."}</p>
          </Card>
        </div>

        {/* right */}
        <aside className="space-y-6 lg:sticky lg:top-8 lg:self-start">
          <section className="no-print adm-in rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm md:p-7" style={{ animationDelay: "160ms" }}>
            <h2 className="mb-5 text-base font-black">Manage order</h2>
            <div className="space-y-5">
              <label htmlFor="orderStatus" className="block">
                <span className="mb-2 block text-[11px] font-bold tracking-wider text-slate-500">ORDER STATUS</span>
                <select id="orderStatus" value={order.orderStatus} disabled={updating} onChange={(e) => updateStatus("orderStatus", e.target.value)} className={selectCls}>
                  {orderStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label htmlFor="paymentStatus" className="block">
                <span className="mb-2 block text-[11px] font-bold tracking-wider text-slate-500">PAYMENT STATUS</span>
                <select id="paymentStatus" value={order.paymentStatus} disabled={updating} onChange={(e) => updateStatus("paymentStatus", e.target.value)} className={selectCls}>
                  {paymentStatuses.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-4 h-5 text-xs font-medium text-slate-500" aria-live="polite">{updating ? "Updating order..." : ""}</p>
          </section>

          <section className="adm-in overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm" style={{ animationDelay: "220ms" }}>
            <div className="p-6 md:p-7">
              <h2 className="mb-5 flex items-center gap-3 text-base font-black">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
                  <CreditCard size={17} />
                </span>
                Payment summary
              </h2>
              <dl className="space-y-3.5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Subtotal</dt>
                  <dd className="font-semibold tabular-nums">{formatMoney(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Shipping fee</dt>
                  <dd className="font-semibold tabular-nums">{order.shippingFee ? formatMoney(order.shippingFee) : "Free"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Method</dt>
                  <dd className="font-semibold capitalize">{order.paymentMethod}</dd>
                </div>
              </dl>
            </div>
            <div className="flex items-end justify-between bg-gradient-to-br from-[#07152e] to-[#0a2a8f] p-6 text-white md:px-7">
              <span className="text-sm font-bold">Total</span>
              <span className="text-3xl font-black tabular-nums">{formatMoney(order.total)}</span>
            </div>
          </section>
        </aside>
      </div>

      {/* toast */}
      <div aria-live="polite" className={`no-print fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ${toast ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>
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

export default function AdminOrderDetailsPage() {
  return (
    <Suspense
      fallback={
        <AdminShell>
          <p className="p-8 text-center text-sm text-slate-500">Loading order details...</p>
        </AdminShell>
      }
    >
      <OrderDetailsContent />
    </Suspense>
  );
}
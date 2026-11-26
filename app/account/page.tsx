"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Models } from "appwrite";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  Copy,
  Heart,
  LogOut,
  Mail,
  MailWarning,
  Package,
  Settings,
  ShoppingBag,
  Store,
  Fingerprint,
} from "lucide-react";
import { account } from "@/lib/appwrite";
import { getCustomerCartKey } from "@/lib/cart-storage";

type CartItem = { productId: string; name: string; price: number; image: string; size: string; color: string; quantity: number };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function AccountPage() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [copied, setCopied] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishCount, setWishCount] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const currentUser = await account.get();
        if (active) {
          setUser(currentUser);

          const cartKey = getCustomerCartKey(currentUser.$id);
          const raw = localStorage.getItem(cartKey);
          const parsed = raw ? JSON.parse(raw) : [];

          if (Array.isArray(parsed)) {
            setCart(
              parsed.map((i) => ({
                productId: String(i.productId ?? i.id ?? ""),
                name: String(i.name ?? "Product"),
                price: Number(i.price ?? 0),
                image: String(i.image ?? ""),
                size: String(i.size ?? ""),
                color: String(i.color ?? ""),
                quantity: Math.max(1, Number(i.quantity ?? 1)),
              }))
            );
          }

          const w = localStorage.getItem("vicwav-wishlist");
          const wp = w ? JSON.parse(w) : [];
          if (Array.isArray(wp)) setWishCount(wp.length);
        }
      } catch {
        if (active) window.location.href = "/login";
      } finally {
        if (active) setLoading(false);
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
      setError(err instanceof Error ? err.message : "Unable to log out. Please try again.");
      setLoggingOut(false);
      setConfirmOut(false);
    }
  }

  async function copy(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {}
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f8fc]">
        <div className="h-72 animate-pulse bg-[#07152e]" />
        <div className="mx-auto -mt-16 grid max-w-6xl animate-pulse gap-5 px-5 md:grid-cols-3 md:px-10">
          <div className="h-32 rounded-3xl bg-slate-200" />
          <div className="h-32 rounded-3xl bg-slate-200" />
          <div className="h-32 rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (!user) return null;

  const name = user.name || "Customer";
  const firstName = name.split(/\s+/)[0];
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");
  const memberSince = user.registration ? new Date(user.registration).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Recently";
  const bagCount = cart.reduce((n, i) => n + i.quantity, 0);
  const bagTotal = cart.reduce((n, i) => n + i.price * i.quantity, 0);

  const actions = [
    { href: "/account/orders", icon: Package, title: "My Orders", text: "Track and review your purchases" },
    { href: "/cart", icon: ShoppingBag, title: "Shopping Bag", text: bagCount ? `${bagCount} ${bagCount === 1 ? "item" : "items"} waiting` : "Your bag is empty" },
    { href: "/account/settings", icon: Settings, title: "Settings", text: "Profile, password and preferences" },
    { href: "/shop", icon: Store, title: "Shop the Collection", text: "Discover the latest drops" },
  ];

  return (
    <main className="min-h-screen bg-[#f6f8fc] pb-20 text-[#07152e]">
      {/* ===== banner ===== */}
      <section className="relative isolate overflow-hidden bg-[#07152e] text-white">
        <div className="vwa-glow pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-600/40 blur-[110px]" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-cyan-400/15 blur-[110px]" />
        <img src="/logo-light.png" alt="" aria-hidden="true" className="pointer-events-none absolute -right-10 top-1/2 hidden h-[130%] w-auto -translate-y-1/2 opacity-[0.05] md:block" />
        <svg aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full" viewBox="0 0 1440 96" preserveAspectRatio="none">
          <path d="M0 64 C 240 20 480 100 720 64 C 960 28 1200 90 1440 48 L1440 96 L0 96 Z" fill="#f6f8fc" />
        </svg>

        <div className="relative mx-auto max-w-6xl px-5 pb-28 pt-14 md:px-10 md:pb-32 md:pt-20">
          <div className="vwa-in flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5 md:gap-7">
              <div className="relative">
                <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-2xl font-black text-white shadow-2xl shadow-blue-900/50 ring-4 ring-white/10 md:h-24 md:w-24 md:text-3xl">{initials}</span>
                {user.emailVerification && (
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-emerald-500 ring-4 ring-[#07152e]" title="Email verified">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.25em] text-cyan-300">MY ACCOUNT</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">
                  {greeting()}, {firstName}.
                </h1>
                <p className="mt-2 text-sm text-blue-100/80">Member since {memberSince}</p>
              </div>
            </div>

            <Link href="/shop" className="group inline-flex w-fit items-center gap-3 rounded-full bg-white px-7 py-4 text-xs font-bold tracking-[0.15em] text-[#07152e] shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:bg-cyan-300">
              CONTINUE SHOPPING
              <ArrowRight size={16} className="transition group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto -mt-12 max-w-6xl px-5 md:px-10">
        {/* ===== stats ===== */}
        <div className="vwa-in grid gap-4 sm:grid-cols-3" style={{ animationDelay: "120ms" }}>
          {[
            { icon: ShoppingBag, label: "Items in bag", value: bagCount, hint: bagCount ? `$${bagTotal.toFixed(2)} total` : "Nothing yet" },
            { icon: Heart, label: "Saved items", value: wishCount, hint: "Your wishlist" },
            { icon: CalendarDays, label: "Member since", value: memberSince, hint: "Thanks for being here", text: true },
          ].map(({ icon: Icon, label, value, hint, text }) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-300/20">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-slate-500">{label.toUpperCase()}</p>
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-50 text-blue-700">
                  <Icon size={18} />
                </span>
              </div>
              <p className={`mt-4 font-black tabular-nums ${text ? "text-2xl" : "text-4xl"}`}>{value}</p>
              <p className="mt-1 text-xs text-slate-500">{hint}</p>
            </div>
          ))}
        </div>

        {/* ===== quick actions ===== */}
        <div className="vwa-in mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" style={{ animationDelay: "220ms" }}>
          {actions.map(({ href, icon: Icon, title, text }) => (
            <Link key={title} href={href} className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1.5 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-900/10">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#07152e] text-cyan-300 transition duration-300 group-hover:rotate-6 group-hover:bg-blue-600 group-hover:text-white">
                <Icon size={21} />
              </span>
              <h2 className="mt-5 text-base font-black">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">{text}</p>
              <ArrowRight size={18} className="absolute right-6 top-6 -translate-x-2 text-blue-600 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
            </Link>
          ))}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-8">
            {/* ===== bag preview ===== */}
            <section className="vwa-in rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" style={{ animationDelay: "320ms" }}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black">Your bag</h2>
                {cart.length > 0 && (
                  <Link href="/cart" className="text-xs font-bold tracking-widest text-blue-700 hover:underline">
                    VIEW ALL
                  </Link>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                  <ShoppingBag size={30} strokeWidth={1.4} className="mx-auto text-slate-400" />
                  <p className="mt-4 text-sm font-semibold">Your bag is empty</p>
                  <p className="mt-1 text-xs text-slate-500">Pieces you add will appear here.</p>
                  <Link href="/shop" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#07152e] px-6 py-3 text-xs font-bold tracking-widest text-white transition hover:bg-blue-700">
                    EXPLORE COLLECTION <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-slate-100">
                    {cart.slice(0, 3).map((item) => (
                      <li key={`${item.productId}-${item.size}-${item.color}`} className="flex items-center gap-4 py-4 first:pt-0">
                        <Link href={`/product/${encodeURIComponent(item.productId)}`} className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                          {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                        </Link>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{item.name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.size} / {item.color} · Qty {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-black tabular-nums">${(item.price * item.quantity).toFixed(2)}</p>
                      </li>
                    ))}
                  </ul>
                  {cart.length > 3 && <p className="mt-2 text-xs text-slate-500">+ {cart.length - 3} more in your bag</p>}
                  <Link href="/checkout" className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#07152e] py-4 text-xs font-bold tracking-[0.18em] text-white shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-700">
                    CHECKOUT · ${bagTotal.toFixed(2)} <ArrowRight size={16} />
                  </Link>
                </>
              )}
            </section>

            {/* ===== details ===== */}
            <section className="vwa-in rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" style={{ animationDelay: "400ms" }}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black">Account details</h2>
                <Link href="/account/settings" className="text-xs font-bold tracking-widest text-blue-700 hover:underline">
                  EDIT
                </Link>
              </div>

              <dl className="divide-y divide-slate-100">
                {[
                  { key: "name", icon: BadgeCheck, label: "Full name", value: user.name || "Not provided", copyable: false },
                  { key: "email", icon: Mail, label: "Email address", value: user.email, copyable: true },
                  { key: "id", icon: Fingerprint, label: "Account ID", value: user.$id, copyable: true },
                ].map(({ key, icon: Icon, label, value, copyable }) => (
                  <div key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-slate-600">
                      <Icon size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <dt className="text-xs font-semibold tracking-wider text-slate-500">{label.toUpperCase()}</dt>
                      <dd className="mt-1 break-all text-sm font-semibold">{value}</dd>
                    </div>
                    {copyable && (
                      <button onClick={() => copy(key, value)} aria-label={`Copy ${label}`} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-blue-50 hover:text-blue-700">
                        {copied === key ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                      </button>
                    )}
                  </div>
                ))}
              </dl>
            </section>
          </div>

          {/* ===== sidebar ===== */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className={`vwa-in rounded-3xl border p-6 ${user.emailVerification ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`} style={{ animationDelay: "300ms" }}>
              <div className="flex items-start gap-4">
                <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${user.emailVerification ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {user.emailVerification ? <BadgeCheck size={21} /> : <MailWarning size={21} />}
                </span>
                <div>
                  <p className="text-sm font-black">{user.emailVerification ? "Email verified" : "Email not verified"}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {user.emailVerification ? "Your account is secure and ready for order updates." : "Verify your email to receive order confirmations and keep your account secure."}
                  </p>
                  {!user.emailVerification && (
                    <Link href="/account/settings" className="mt-3 inline-flex items-center gap-1 text-xs font-bold tracking-widest text-amber-800 hover:underline">
                      VERIFY NOW <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              </div>
            </div>

            <div className="vwa-in relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#07152e] to-[#0a2a8f] p-7 text-white" style={{ animationDelay: "380ms" }}>
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
              <p className="relative text-xs font-semibold tracking-[0.25em] text-cyan-300">VICWAV</p>
              <p className="relative mt-3 text-2xl font-black leading-tight">Be Bold.<br />Be VicWav.</p>
              <p className="relative mt-3 text-sm leading-6 text-blue-100/80">Free shipping on orders over $100.</p>
              <Link href="/shop" className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-xs font-bold tracking-widest text-[#07152e] transition hover:bg-cyan-300">
                SHOP NOW <ArrowRight size={14} />
              </Link>
            </div>

            <div className="vwa-in rounded-3xl border border-slate-200 bg-white p-6" style={{ animationDelay: "460ms" }}>
              <h2 className="text-sm font-black">Sign out</h2>
              <p className="mt-1 text-xs text-slate-500">You can sign back in anytime.</p>

              {confirmOut ? (
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex-1 rounded-full bg-red-600 py-3 text-xs font-bold tracking-widest text-white transition hover:bg-red-700 disabled:opacity-60">
                    {loggingOut ? "SIGNING OUT..." : "YES, SIGN OUT"}
                  </button>
                  <button type="button" onClick={() => setConfirmOut(false)} disabled={loggingOut} className="flex-1 rounded-full border border-slate-300 py-3 text-xs font-bold tracking-widest transition hover:bg-slate-50">
                    CANCEL
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => setConfirmOut(true)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 py-3 text-xs font-bold tracking-widest transition hover:border-red-300 hover:bg-red-50 hover:text-red-600">
                  <LogOut size={15} /> SIGN OUT
                </button>
              )}

              {error && (
                <p role="alert" className="mt-4 text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .vwa-in{opacity:0;animation:vwaIn .8s cubic-bezier(.2,.8,.2,1) forwards}
        @keyframes vwaIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        .vwa-glow{animation:vwaGlow 10s ease-in-out infinite alternate}
        @keyframes vwaGlow{to{transform:translate(70px,40px) scale(1.2)}}
        main a:focus-visible,main button:focus-visible{outline:2px solid #22d3ee;outline-offset:3px}
        @media (prefers-reduced-motion:reduce){.vwa-in{opacity:1;animation:none}.vwa-glow{animation:none}*{transition-duration:.01ms!important}}
      ` }} />
    </main>
  );
}
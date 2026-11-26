"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2, Truck, LockKeyhole, RotateCcw, Check } from "lucide-react";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

const FREE_SHIPPING = 100; // matches checkout
const MAX_QTY = 8;

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [undo, setUndo] = useState<{ item: CartItem; index: number } | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);

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
            quantity: Math.max(1, Math.min(MAX_QTY, Number(item.quantity ?? 1))),
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
    if (loaded) localStorage.setItem("clothing-cart", JSON.stringify(cart));
  }, [cart, loaded]);

  useEffect(() => () => window.clearTimeout(undoTimer.current), []);

  const updateQuantity = (index: number, change: number) =>
    setCart((current) =>
      current.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, Math.min(MAX_QTY, item.quantity + change)) } : item))
    );

  const removeItem = (index: number) => {
    const item = cart[index];
    setCart((current) => current.filter((_, i) => i !== index));
    setUndo({ item, index });
    window.clearTimeout(undoTimer.current);
    undoTimer.current = window.setTimeout(() => setUndo(null), 6000);
  };

  const undoRemove = () => {
    if (!undo) return;
    setCart((current) => {
      const next = [...current];
      next.splice(Math.min(undo.index, next.length), 0, undo.item);
      return next;
    });
    setUndo(null);
  };

  const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const itemCount = cart.reduce((t, i) => t + i.quantity, 0);
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#f6f8fc]">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5 px-5 py-16 md:px-10">
          <div className="h-10 w-56 rounded bg-slate-200" />
          <div className="h-44 rounded-3xl bg-slate-200" />
          <div className="h-44 rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#07152e]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-10">
          <Link href="/" className="text-2xl font-black tracking-tight">
            VICWAV<span className="text-cyan-500">.</span>
          </Link>
          <Link href="/shop" className="hidden items-center gap-2 text-xs font-bold tracking-widest transition hover:text-blue-700 sm:flex">
            <ArrowLeft size={15} /> CONTINUE SHOPPING
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 py-10 pb-32 md:px-10 md:py-16 lg:pb-16">
        <div className="mb-8 md:mb-10">
          <p className="mb-3 text-xs font-semibold tracking-[0.25em] text-blue-700">YOUR BAG</p>
          <h1 className="text-4xl font-black tracking-tight md:text-6xl">Shopping Cart</h1>
          <p className="mt-3 text-sm text-slate-500">
            {itemCount} {itemCount === 1 ? "item" : "items"} in your bag
          </p>
        </div>

        {cart.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-slate-400">
              <ShoppingBag size={32} strokeWidth={1.4} />
            </div>
            <h2 className="mt-7 text-2xl font-black">Your bag is empty</h2>
            <p className="mx-auto mt-3 max-w-sm text-sm text-slate-500">Pieces you add will show up here, ready for checkout.</p>
            <Link href="/shop" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#07152e] px-8 py-4 text-xs font-bold tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-blue-700">
              EXPLORE COLLECTION <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
            {/* items */}
            <div className="space-y-5">
              {/* free shipping progress */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 text-sm">
                  <span className={`grid h-9 w-9 place-items-center rounded-full ${remaining === 0 ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                    {remaining === 0 ? <Check size={17} /> : <Truck size={17} />}
                  </span>
                  <p className="font-medium">
                    {remaining === 0 ? "You've unlocked free shipping." : <>Add <strong>${remaining.toFixed(2)}</strong> more for free shipping.</>}
                  </p>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {cart.map((item, index) => (
                <article
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="vw-in flex gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-lg hover:shadow-slate-300/40 md:gap-6 md:p-5"
                >
                  <Link
                    href={`/product/${encodeURIComponent(item.productId)}`}
                    className="relative h-36 w-28 shrink-0 overflow-hidden rounded-2xl bg-slate-100 md:h-44 md:w-36"
                  >
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill sizes="(max-width: 768px) 112px, 144px" className="object-cover transition duration-500 hover:scale-105" unoptimized />
                    ) : (
                      <div className="grid h-full w-full place-items-center">
                        <ShoppingBag className="text-slate-400" />
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/product/${encodeURIComponent(item.productId)}`} className="block truncate text-base font-bold transition hover:text-blue-700 md:text-lg">
                          {item.name}
                        </Link>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                          <span className="rounded-full bg-slate-100 px-3 py-1">Size {item.size}</span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">{item.color}</span>
                        </div>
                        <p className="mt-3 text-sm text-slate-500">${item.price.toFixed(2)} each</p>
                      </div>

                      <button onClick={() => removeItem(index)} aria-label={`Remove ${item.name}`} className="h-fit rounded-full p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-slate-200">
                        <button onClick={() => updateQuantity(index, -1)} disabled={item.quantity <= 1} aria-label="Decrease quantity" className="px-4 py-3 transition hover:text-blue-700 disabled:opacity-30">
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold tabular-nums" aria-live="polite">{item.quantity}</span>
                        <button onClick={() => updateQuantity(index, 1)} disabled={item.quantity >= MAX_QTY} aria-label="Increase quantity" className="px-4 py-3 transition hover:text-blue-700 disabled:opacity-30">
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-lg font-black tabular-nums">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                </article>
              ))}

              <Link href="/shop" className="inline-flex items-center gap-2 pt-2 text-xs font-bold tracking-widest text-slate-500 transition hover:text-blue-700">
                <ArrowLeft size={15} /> CONTINUE SHOPPING
              </Link>
            </div>

            {/* summary */}
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 lg:sticky lg:top-28">
              <h2 className="mb-7 text-xl font-black">Order Summary</h2>

              <dl className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Subtotal ({itemCount})</dt>
                  <dd className="font-semibold tabular-nums">${subtotal.toFixed(2)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Shipping</dt>
                  <dd className="font-semibold">{remaining === 0 ? <span className="text-emerald-600">Free</span> : "$5.00 at checkout"}</dd>
                </div>
              </dl>

              <div className="mt-6 flex items-end justify-between border-t border-slate-100 pt-6">
                <span className="font-bold">Estimated total</span>
                <span className="text-3xl font-black tabular-nums">${(subtotal + (remaining === 0 ? 0 : 5)).toFixed(2)}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">Final total is confirmed at checkout.</p>

              <Link href="/checkout" className="vw-btn mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#07152e] py-5 text-xs font-bold tracking-[0.18em] text-white shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
                PROCEED TO CHECKOUT <ArrowRight size={16} />
              </Link>

              <ul className="mt-7 space-y-3 text-xs text-slate-500">
                <li className="flex items-center gap-3"><LockKeyhole size={15} className="text-blue-700" /> Secure checkout</li>
                <li className="flex items-center gap-3"><RotateCcw size={15} className="text-blue-700" /> Return policy applies</li>
              </ul>
            </aside>
          </div>
        )}
      </section>

      {/* mobile checkout bar */}
      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-4 border-t border-slate-200 bg-white/90 p-3 backdrop-blur-xl lg:hidden">
          <div className="pl-2">
            <p className="text-[10px] font-semibold tracking-widest text-slate-500">TOTAL</p>
            <p className="text-lg font-black tabular-nums">${subtotal.toFixed(2)}</p>
          </div>
          <Link href="/checkout" className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#07152e] py-4 text-xs font-bold tracking-[0.15em] text-white">
            CHECKOUT <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* undo toast */}
      <div aria-live="polite" className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 lg:bottom-8 ${undo ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}>
        {undo && (
          <div className="flex items-center gap-5 rounded-full bg-[#07152e] py-3 pl-6 pr-3 text-sm text-white shadow-2xl">
            <span className="max-w-[10rem] truncate">Removed {undo.item.name}</span>
            <button onClick={undoRemove} className="rounded-full bg-white px-4 py-2 text-xs font-bold tracking-widest text-[#07152e] transition hover:bg-cyan-300">UNDO</button>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 py-8 text-center text-xs tracking-widest text-slate-400">© 2026 VICWAV. ALL RIGHTS RESERVED.</footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .vw-in{animation:vwIn .5s cubic-bezier(.2,.8,.2,1) both}
        @keyframes vwIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
        .vw-btn{position:relative;overflow:hidden}
        a:focus-visible,button:focus-visible{outline:2px solid #22d3ee;outline-offset:3px}
        @media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      ` }} />
    </main>
  );
}
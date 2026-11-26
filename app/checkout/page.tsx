/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { account } from "@/lib/appwrite";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  ShoppingBag,
  Check,
  Smartphone,
  CreditCard,
  Landmark,
  Banknote,
  ChevronDown,
  Copy,
  Truck,
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

const FREE_SHIPPING = 100;

const paymentMethods = [
  { id: "mobile-money", title: "Mobile Money", description: "Mobile money payment integration", icon: Smartphone },
  { id: "card", title: "Debit / Credit Card", description: "Card payment integration", icon: CreditCard },
  { id: "bank-transfer", title: "Bank Transfer", description: "Pay using a bank transfer", icon: Landmark },
  { id: "cash", title: "Cash on Delivery", description: "Pay when your order arrives", icon: Banknote },
];

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10";

function Field({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-2 block text-xs font-bold tracking-wider text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-7 flex items-center gap-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-[#07152e] text-sm font-bold text-white">{n}</span>
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("mobile-money");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
            quantity: Math.max(1, Math.min(8, Number(item.quantity ?? 1))),
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
        // fixed: the original pattern /\\s+/ matched a literal backslash, so names never split
        const nameParts = (user.name || "").trim().split(/\s+/).filter(Boolean);
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

  const subtotal = cart.reduce((t, i) => t + i.price * i.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING ? 0 : 5;
  const total = subtotal + shipping;
  const itemCount = cart.reduce((t, i) => t + i.quantity, 0);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };

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
      if (!response.ok) throw new Error(result.error || "Unable to place your order. Please try again.");

      setOrderNumber(String(result.orderNumber || ""));
      localStorage.removeItem("clothing-cart");
      setSubmitted(true);
      window.scrollTo({ top: 0 });
    } catch (error) {
      console.error("Checkout submission failed:", error);
      setSubmitError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyOrder = async () => {
    try {
      await navigator.clipboard.writeText(orderNumber);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const Header = ({ step }: { step: 1 | 2 | 3 }) => (
    <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-10">
        <Link href="/" className="text-2xl font-black tracking-tight">
          VICWAV<span className="text-cyan-500">.</span>
        </Link>

        <ol className="hidden items-center gap-3 text-xs font-bold tracking-widest sm:flex" aria-label="Progress">
          {["CART", "CHECKOUT", "DONE"].map((l, i) => (
            <li key={l} className="flex items-center gap-3">
              <span className={`flex items-center gap-2 ${i + 1 <= step ? "text-[#07152e]" : "text-slate-300"}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] ${i + 1 < step ? "bg-emerald-500 text-white" : i + 1 === step ? "bg-[#07152e] text-white" : "bg-slate-200 text-slate-500"}`}>
                  {i + 1 < step ? <Check size={12} /> : i + 1}
                </span>
                {l}
              </span>
              {i < 2 && <span className="h-px w-8 bg-slate-300" />}
            </li>
          ))}
        </ol>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <LockKeyhole size={14} className="text-emerald-600" /> Secure checkout
        </div>
      </div>
    </header>
  );

  const Footer = () => (
    <footer className="border-t border-slate-200 py-8 text-center text-xs tracking-widest text-slate-400">© 2026 VICWAV. ALL RIGHTS RESERVED.</footer>
  );

  /* ---------- states ---------- */
  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#f6f8fc]">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5 px-5 py-16 md:px-10">
          <div className="h-10 w-56 rounded bg-slate-200" />
          <div className="h-64 rounded-3xl bg-slate-200" />
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] text-[#07152e]">
        <Header step={3} />
        <section className="mx-auto max-w-xl px-5 py-16 md:py-24">
          <div className="co-in rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-300/30 md:p-12">
            <div className="co-pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <Check size={38} strokeWidth={2.5} />
            </div>
            <p className="mt-8 text-xs font-semibold tracking-[0.25em] text-blue-700">ORDER RECEIVED</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Thank you for your order</h1>
            <p className="mt-4 text-sm leading-7 text-slate-500">Your order has been created. It is awaiting payment confirmation, and no online payment has been collected yet.</p>

            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-[10px] font-bold tracking-[0.2em] text-slate-500">ORDER NUMBER</p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <p className="break-all text-lg font-black">{orderNumber}</p>
                {orderNumber && (
                  <button onClick={copyOrder} aria-label="Copy order number" className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-blue-700">
                    {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                )}
              </div>
            </div>

            <Link href="/shop" className="mt-9 inline-flex items-center gap-3 rounded-full bg-[#07152e] px-9 py-4 text-xs font-bold tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-blue-700">
              CONTINUE SHOPPING <ArrowRight size={16} />
            </Link>
          </div>
        </section>
        <Footer />
        <Styles />
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] text-[#07152e]">
        <Header step={2} />
        <section className="mx-auto max-w-xl px-6 py-28 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-slate-100 text-slate-400">
            <ShoppingBag size={32} strokeWidth={1.4} />
          </div>
          <h1 className="mt-7 text-3xl font-black">Your cart is empty</h1>
          <p className="mt-3 text-sm text-slate-500">Add some products before proceeding to checkout.</p>
          <Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#07152e] px-8 py-4 text-xs font-bold tracking-widest text-white transition hover:bg-blue-700">
            EXPLORE COLLECTION
          </Link>
        </section>
      </main>
    );
  }

  /* ---------- order summary (shared desktop + mobile) ---------- */
  const SummaryBody = (
    <>
      <ul className="space-y-5">
        {cart.map((item) => (
          <li key={`${item.productId}-${item.size}-${item.color}`} className="flex gap-4">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {item.image && <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" unoptimized />}
              <span className="absolute -right-0 -top-0 grid h-5 min-w-5 place-items-center rounded-bl-lg bg-[#07152e] px-1 text-[10px] font-bold text-white">{item.quantity}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              <p className="mt-1 text-xs text-slate-500">{item.size} / {item.color}</p>
            </div>
            <p className="text-sm font-bold tabular-nums">${(item.price * item.quantity).toFixed(2)}</p>
          </li>
        ))}
      </ul>

      <dl className="mt-7 space-y-3.5 border-t border-slate-100 pt-6 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">Subtotal</dt>
          <dd className="font-semibold tabular-nums">${subtotal.toFixed(2)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">Shipping</dt>
          <dd className="font-semibold">{shipping === 0 ? <span className="text-emerald-600">Free</span> : `$${shipping.toFixed(2)}`}</dd>
        </div>
        {shipping > 0 && (
          <p className="flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5 text-xs text-blue-800">
            <Truck size={14} /> Add ${(FREE_SHIPPING - subtotal).toFixed(2)} more for free shipping
          </p>
        )}
        <div className="flex items-end justify-between border-t border-slate-100 pt-5">
          <dt className="font-bold">Total</dt>
          <dd className="text-3xl font-black tabular-nums">${total.toFixed(2)}</dd>
        </div>
      </dl>
    </>
  );

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#07152e]">
      <Header step={2} />

      <section className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
        <Link href="/cart" className="mb-8 inline-flex items-center gap-2 text-xs font-bold tracking-widest text-slate-500 transition hover:text-blue-700">
          <ArrowLeft size={15} /> BACK TO CART
        </Link>

        <h1 className="mb-8 text-4xl font-black tracking-tight md:mb-10 md:text-6xl">Checkout</h1>

        {/* mobile collapsible summary */}
        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:hidden">
          <button type="button" onClick={() => setSummaryOpen(!summaryOpen)} aria-expanded={summaryOpen} className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-blue-700" />
              {summaryOpen ? "Hide" : "Show"} order summary ({itemCount})
              <ChevronDown size={16} className={`transition ${summaryOpen ? "rotate-180" : ""}`} />
            </span>
            <span className="font-black tabular-nums">${total.toFixed(2)}</span>
          </button>
          {summaryOpen && <div className="border-t border-slate-100 p-5">{SummaryBody}</div>}
        </div>

        <form onSubmit={handleSubmit}>
          {submitError && (
            <div role="alert" className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {submitError}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:gap-12">
            <div className="space-y-6">
              <Step n={1} title="Contact information">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="EMAIL ADDRESS" wide>
                    <input required type="email" name="email" autoComplete="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputCls} />
                  </Field>
                  <Field label="FIRST NAME">
                    <input required name="firstName" autoComplete="given-name" value={form.firstName} onChange={handleChange} placeholder="First name" className={inputCls} />
                  </Field>
                  <Field label="LAST NAME">
                    <input required name="lastName" autoComplete="family-name" value={form.lastName} onChange={handleChange} placeholder="Last name" className={inputCls} />
                  </Field>
                  <Field label="PHONE NUMBER" wide>
                    <input required type="tel" name="phone" autoComplete="tel" inputMode="tel" value={form.phone} onChange={handleChange} placeholder="+263..." className={inputCls} />
                  </Field>
                </div>
              </Step>

              <Step n={2} title="Delivery address">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="STREET ADDRESS" wide>
                    <input required name="address" autoComplete="street-address" value={form.address} onChange={handleChange} placeholder="House number and street" className={inputCls} />
                  </Field>
                  <Field label="CITY">
                    <input required name="city" autoComplete="address-level2" value={form.city} onChange={handleChange} placeholder="e.g. Harare" className={inputCls} />
                  </Field>
                  <Field label="COUNTRY">
                    <select required name="country" autoComplete="country-name" value={form.country} onChange={handleChange} className={inputCls}>
                      <option value="Zimbabwe">Zimbabwe</option>
                      <option value="South Africa">South Africa</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>
                  <Field label="POSTAL CODE (OPTIONAL)">
                    <input name="postalCode" autoComplete="postal-code" value={form.postalCode} onChange={handleChange} placeholder="Postal code" className={inputCls} />
                  </Field>
                </div>
              </Step>

              <Step n={3} title="Payment method">
                <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                  {paymentMethods.map((m) => {
                    const on = paymentMethod === m.id;
                    const Icon = m.icon;
                    return (
                      <label
                        key={m.id}
                        className={`relative flex cursor-pointer items-start gap-4 rounded-2xl border p-5 transition ${
                          on ? "border-[#07152e] bg-blue-50/40 shadow-md shadow-blue-950/5 ring-1 ring-[#07152e]" : "border-slate-200 bg-white hover:border-slate-400"
                        }`}
                      >
                        <input type="radio" name="paymentMethod" value={m.id} checked={on} onChange={() => setPaymentMethod(m.id)} className="sr-only" />
                        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl transition ${on ? "bg-[#07152e] text-white" : "bg-slate-100 text-slate-600"}`}>
                          <Icon size={19} />
                        </span>
                        <span>
                          <span className="block text-sm font-bold">{m.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">{m.description}</span>
                        </span>
                        {on && (
                          <span className="co-pop absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full bg-[#07152e] text-white">
                            <Check size={12} />
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </Step>
            </div>

            {/* desktop summary */}
            <aside className="hidden h-fit rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:sticky lg:top-8 lg:block">
              <h2 className="mb-7 text-xl font-black">Your order</h2>
              {SummaryBody}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#07152e] py-5 text-xs font-bold tracking-[0.18em] text-white shadow-xl shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> CREATING ORDER...
                  </>
                ) : (
                  <>PLACE ORDER · ${total.toFixed(2)} <ArrowRight size={16} /></>
                )}
              </button>
              <p className="mt-5 text-center text-xs leading-6 text-slate-400">Your order will be recorded. Online payment processing is not yet connected.</p>
            </aside>
          </div>

          {/* mobile place order bar */}
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/90 p-3 backdrop-blur-xl lg:hidden">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#07152e] py-4 text-xs font-bold tracking-[0.15em] text-white disabled:opacity-60"
            >
              {isSubmitting ? "CREATING ORDER..." : <>PLACE ORDER · ${total.toFixed(2)}</>}
            </button>
          </div>
        </form>
      </section>

      <div className="pb-20 lg:pb-0">
     
        <Footer />
      </div>
      <Styles />
    </main>
  );
}

function Styles() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
        .co-in{animation:coIn .7s cubic-bezier(.2,.8,.2,1) both}
        @keyframes coIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
        .co-pop{animation:coPop .5s cubic-bezier(.3,1.8,.5,1) both}
        @keyframes coPop{from{transform:scale(.3);opacity:0}to{transform:scale(1);opacity:1}}
        a:focus-visible,button:focus-visible,input:focus-visible,select:focus-visible,label:has(input:focus-visible){outline:2px solid #22d3ee;outline-offset:3px}
        @media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
      `,
      }}
    />
  );
}
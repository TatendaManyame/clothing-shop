
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

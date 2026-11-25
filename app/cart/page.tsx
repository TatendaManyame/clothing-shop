
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

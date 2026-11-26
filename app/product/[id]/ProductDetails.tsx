"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Minus, Plus, Check, ChevronRight, Truck, RotateCcw } from "lucide-react";
import { getProductById, getCategories, type StoreProduct } from "@/lib/products";
import { getCartStorageKey, notifyCartUpdated } from "@/lib/cart-storage";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

type ProductDetailsProps = { id: string };

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

export default function ProductDetails({ id }: ProductDetailsProps) {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const [productData, categoryData] = await Promise.all([getProductById(id), getCategories()]);
        if (cancelled) return;

        if (!productData) {
          setProduct(null);
          return;
        }

        setProduct(productData);

        const match = categoryData.find((c) => c.$id === productData.category_id || c.slug === productData.category_id);
        setCategory(match?.name || productData.category_id);

        setSelectedSize(productData.sizes?.[0] || "One Size");
        setSelectedColor(productData.colors?.[0] || "Default");
        setQuantity(1);
        setActiveImage(0);
      } catch (err) {
        console.error("Unable to load product:", err);
        if (!cancelled) setError("Unable to load this product. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const gallery = Array.from(
    new Set([product?.image_url, ...(product?.images || [])].filter(Boolean) as string[])
  );
  const productImage = gallery[0] || "";

  const availableSizes = product?.sizes?.length ? product.sizes : ["One Size"];
  const availableColors = product?.colors?.length ? product.colors : ["Default"];

  const stock = product?.stock_quantity ?? 0;
  const maximumQuantity = Math.min(8, stock);
  const soldOut = stock <= 0;
  const onSale = !!product?.compare_at_price && product.compare_at_price > product.price;
  const discount = onSale ? Math.round((1 - product!.price / product!.compare_at_price!) * 100) : 0;

  async function addToCart() {
    if (!product || soldOut) return;
    setCartError("");

    try {
      const cartKey = await getCartStorageKey();
      const storedCart = localStorage.getItem(cartKey);
      const cart: CartItem[] = storedCart
        ? JSON.parse(storedCart).map((item: CartItem) => ({ ...item, productId: String(item.productId) }))
        : [];

      const existing = cart.find(
        (item) => item.productId === product.$id && item.size === selectedSize && item.color === selectedColor
      );

      if (existing) {
        if (existing.quantity + quantity > maximumQuantity) {
          setCartError(`Only ${stock} in stock, and you already have ${existing.quantity} in your cart.`);
          return;
        }
        existing.quantity += quantity;
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

      localStorage.setItem(cartKey, JSON.stringify(cart));
      notifyCartUpdated();
      setAdded(true);
      window.setTimeout(() => setAdded(false), 2500);
    } catch (err) {
      console.error("Unable to update cart:", err);
      setCartError("Unable to update your cart. Please try again.");
    }
  }

  /* ---------- loading ---------- */
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto grid max-w-6xl animate-pulse gap-10 px-5 py-12 md:grid-cols-2 md:gap-16 md:px-10">
          <div className="aspect-[4/5] rounded-3xl bg-slate-200" />
          <div className="space-y-5 py-6">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-10 w-3/4 rounded bg-slate-200" />
            <div className="h-6 w-28 rounded bg-slate-200" />
            <div className="h-24 w-full rounded bg-slate-200" />
            <div className="h-14 w-full rounded-full bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  /* ---------- error / not found ---------- */
  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-5 text-center">
        <h1 className="text-3xl font-black text-[#07152e]">{error ? "Something went wrong" : "Product not found"}</h1>
        <p className="mt-3 max-w-sm text-sm text-slate-500">
          {error || "The product you are looking for does not exist or is unavailable."}
        </p>
        <Link href="/shop" className="mt-7 rounded-full bg-[#07152e] px-8 py-4 text-xs font-bold tracking-widest text-white transition hover:bg-blue-700">
          BACK TO SHOP
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
        {/* breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-1.5 text-xs text-slate-500">
          <Link href="/shop" className="transition hover:text-blue-700">Shop</Link>
          <ChevronRight size={13} />
          <span>{category}</span>
          <ChevronRight size={13} />
          <span className="truncate font-semibold text-[#07152e]">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* ===== images ===== */}
          <div className="md:sticky md:top-8 md:self-start">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 ring-1 ring-black/5">
              {gallery.length ? (
                <img
                  key={activeImage}
                  src={gallery[activeImage]}
                  alt={product.name}
                  className="h-full w-full animate-[fadeIn_.5s_ease] object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="grid h-full place-items-center text-sm text-slate-400">No product image available</div>
              )}

              <div className="absolute left-4 top-4 flex gap-2">
                {product.tag && (
                  <span className="rounded-full bg-white px-3.5 py-2 text-[10px] font-bold tracking-widest shadow-sm">{product.tag}</span>
                )}
                {onSale && (
                  <span className="rounded-full bg-red-600 px-3.5 py-2 text-[10px] font-bold tracking-widest text-white shadow-sm">-{discount}%</span>
                )}
              </div>
            </div>

            {gallery.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-3">
                {gallery.slice(0, 5).map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActiveImage(i)}
                    aria-label={`View image ${i + 1}`}
                    aria-pressed={activeImage === i}
                    className={`aspect-square overflow-hidden rounded-xl ring-2 transition ${
                      activeImage === i ? "ring-[#07152e]" : "opacity-70 ring-transparent hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ===== info ===== */}
          <div className="flex flex-col">
            <p className="text-xs font-semibold tracking-[0.25em] text-blue-700">{category.toUpperCase()}</p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-[#07152e] md:text-5xl">{product.name}</h1>

            <div className="mt-5 flex items-baseline gap-3">
              <p className="text-3xl font-black text-[#07152e]">${product.price.toFixed(2)}</p>
              {onSale && <p className="text-base text-slate-400 line-through">${product.compare_at_price!.toFixed(2)}</p>}
            </div>

            {product.description && <p className="mt-6 text-sm leading-7 text-slate-600">{product.description}</p>}

            {/* colour */}
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold tracking-widest">
                COLOUR <span className="ml-2 font-medium tracking-normal text-slate-500">{selectedColor}</span>
              </p>
              <div className="flex flex-wrap gap-2.5">
                {availableColors.map((color) => {
                  const on = selectedColor === color;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${color}`}
                      aria-pressed={on}
                      className={`flex items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-medium transition ${
                        on ? "border-[#07152e] bg-white shadow-sm" : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full border border-slate-300" style={{ backgroundColor: colorHex[color] || "#d1d5db" }} />
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* size */}
            <div className="mt-8">
              <p className="mb-3 text-xs font-bold tracking-widest">SIZE</p>
              <div className="flex flex-wrap gap-2.5">
                {availableSizes.map((size) => {
                  const on = selectedSize === size;
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      aria-pressed={on}
                      className={`min-w-[3.5rem] rounded-xl border px-4 py-3.5 text-xs font-bold transition ${
                        on ? "border-[#07152e] bg-[#07152e] text-white" : "border-slate-200 bg-white hover:border-slate-400"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* quantity + stock */}
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <div className="flex items-center rounded-full border border-slate-200 bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || soldOut}
                  aria-label="Decrease quantity"
                  className="px-5 py-4 transition hover:text-blue-700 disabled:opacity-30"
                >
                  <Minus size={14} />
                </button>
                <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(maximumQuantity, quantity + 1))}
                  disabled={quantity >= maximumQuantity || soldOut}
                  aria-label="Increase quantity"
                  className="px-5 py-4 transition hover:text-blue-700 disabled:opacity-30"
                >
                  <Plus size={14} />
                </button>
              </div>

              <p className={`text-xs font-medium ${soldOut ? "text-red-600" : stock <= 5 ? "text-amber-600" : "text-emerald-600"}`}>
                {soldOut ? "Out of stock" : stock <= 5 ? `Only ${stock} left` : "In stock"}
              </p>
            </div>

            {/* add to cart */}
            <button
              type="button"
              onClick={addToCart}
              disabled={soldOut}
              className={`mt-8 flex w-full items-center justify-center gap-3 rounded-full py-5 text-xs font-bold tracking-[0.2em] transition duration-300 ${
                soldOut
                  ? "cursor-not-allowed bg-slate-300 text-slate-600"
                  : added
                    ? "bg-emerald-600 text-white"
                    : "bg-[#07152e] text-white shadow-xl shadow-blue-950/20 hover:-translate-y-0.5 hover:bg-blue-700"
              }`}
            >
              {soldOut ? (
                "SOLD OUT"
              ) : added ? (
                <>
                  <Check size={18} /> ADDED TO CART
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> ADD TO CART · ${(product.price * quantity).toFixed(2)}
                </>
              )}
            </button>

            <div aria-live="polite" className="min-h-[1.5rem]">
              {cartError && <p className="mt-3 text-center text-xs font-medium text-red-600">{cartError}</p>}
              {added && (
                <Link href="/cart" className="mt-3 flex items-center justify-center gap-1 text-xs font-bold tracking-widest text-blue-700 hover:underline">
                  VIEW YOUR CART <ChevronRight size={14} />
                </Link>
              )}
            </div>

            {/* info */}
            <div className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm">
              <div className="flex items-start gap-3">
                <Truck size={18} className="mt-0.5 shrink-0 text-blue-700" />
                <div>
                  <p className="font-semibold">Delivery</p>
                  <p className="text-xs text-slate-500">Calculated at checkout</p>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t border-slate-100 pt-4">
                <RotateCcw size={18} className="mt-0.5 shrink-0 text-blue-700" />
                <div>
                  <p className="font-semibold">Returns</p>
                  <p className="text-xs text-slate-500">Return policy applies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* mobile sticky buy bar */}
      {!soldOut && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 p-3 backdrop-blur-xl md:hidden">
          <button onClick={addToCart} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#07152e] py-4 text-xs font-bold tracking-[0.15em] text-white">
            {added ? <><Check size={16} /> ADDED</> : <>ADD TO CART · ${(product.price * quantity).toFixed(2)}</>}
          </button>
        </div>
      )}

      <footer className="bg-[#07152e] px-5 py-10 pb-24 text-white md:px-10 md:pb-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight">
            VICWAV<span className="text-cyan-400">.</span>
          </Link>
          <p className="text-xs text-slate-400">© 2026 VICWAV. All rights reserved.</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn{from{opacity:0}to{opacity:1}}a:focus-visible,button:focus-visible{outline:2px solid #22d3ee;outline-offset:3px}@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}` }} />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingBag,
  Minus,
  Plus,
  Check,
} from "lucide-react";
import {
  getProductById,
  getCategories,
  type StoreProduct,
} from "@/lib/products";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
};

type ProductDetailsProps = {
  id: string;
};

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

export default function ProductDetails({
  id,
}: ProductDetailsProps) {
  const [product, setProduct] = useState<StoreProduct | null>(null);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        const [productData, categoryData] = await Promise.all([
          getProductById(id),
          getCategories(),
        ]);

        if (cancelled) return;

        if (!productData) {
          setProduct(null);
          return;
        }

        setProduct(productData);

        const matchingCategory = categoryData.find(
          (item) =>
            item.$id === productData.category_id ||
            item.slug === productData.category_id
        );

        setCategory(
          matchingCategory?.name || productData.category_id
        );

        const availableSizes = productData.sizes || [];
        const availableColors = productData.colors || [];

        setSelectedSize(availableSizes[0] || "One Size");
        setSelectedColor(availableColors[0] || "Default");
        setQuantity(1);
      } catch (err) {
        console.error("Unable to load product:", err);

        if (!cancelled) {
          setError("Unable to load this product. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const productImage =
    product?.image_url ||
    product?.images?.[0] ||
    "";

  const availableSizes = product?.sizes?.length
    ? product.sizes
    : ["One Size"];

  const availableColors = product?.colors?.length
    ? product.colors
    : ["Default"];

  const stock = product?.stock_quantity ?? 0;
  const maximumQuantity = Math.min(8, stock);
  const soldOut = stock <= 0;

  function addToCart() {
    if (!product || soldOut) return;

    try {
      const storedCart = localStorage.getItem("clothing-cart");

      const cart: CartItem[] = storedCart
        ? JSON.parse(storedCart).map((item: CartItem) => ({
            ...item,
            productId: String(item.productId),
          }))
        : [];

      const existingItem = cart.find(
        (item) =>
          item.productId === product.$id &&
          item.size === selectedSize &&
          item.color === selectedColor
      );

      if (existingItem) {
        if (existingItem.quantity + quantity > maximumQuantity) {
          alert(
            `Only ${stock} items are currently available in stock.`
          );
          return;
        }

        existingItem.quantity += quantity;
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

      localStorage.setItem(
        "clothing-cart",
        JSON.stringify(cart)
      );

      setAdded(true);

      window.setTimeout(() => {
        setAdded(false);
      }, 2500);
    } catch (err) {
      console.error("Unable to update cart:", err);
      alert("Unable to update your cart. Please try again.");
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-xs font-bold tracking-[0.2em]">
          LOADING PRODUCT...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <h1 className="text-3xl font-black">
          {error ? "SOMETHING WENT WRONG" : "PRODUCT NOT FOUND"}
        </h1>

        <p className="mt-3 text-sm text-gray-500">
          {error ||
            "The product you are looking for does not exist or is unavailable."}
        </p>

        <Link
          href="/shop"
          className="mt-7 bg-black px-7 py-4 text-xs font-bold tracking-widest text-white"
        >
          BACK TO SHOP
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-black">

      {/* Announcement */}
      <div className="bg-black px-4 py-3 text-center text-xs tracking-[0.15em] text-white">
        FREE SHIPPING ON ORDERS OVER $100
      </div>

      {/* Navigation */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">

          <Link
            href="/shop"
            className="flex items-center gap-2 text-xs font-bold tracking-widest"
          >
            <ArrowLeft size={16} />
            BACK TO SHOP
          </Link>

          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            CLOTHING.
          </Link>

          <Link href="/cart" aria-label="Shopping cart">
            <ShoppingBag size={22} />
          </Link>

        </div>
      </header>

      {/* Product Details */}
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-2 md:gap-16 md:px-10 md:py-16">

        {/* Product Image */}
        <div className="relative overflow-hidden bg-gray-100">
          {productImage ? (
            <img
              src={productImage}
              alt={product.name}
              className="h-[480px] w-full object-cover md:h-[720px]"
            />
          ) : (
            <div className="flex h-[480px] items-center justify-center text-sm text-gray-400 md:h-[720px]">
              No product image available
            </div>
          )}

          {product.tag && (
            <span className="absolute left-5 top-5 bg-white px-4 py-3 text-[10px] font-bold tracking-widest">
              {product.tag}
            </span>
          )}
        </div>

        {/* Product Information */}
        <div className="flex flex-col justify-center">

          <p className="text-xs font-medium tracking-[0.25em] text-gray-500">
            {category.toUpperCase()}
          </p>

          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">
            {product.name}
          </h1>

          <p className="mt-5 text-2xl font-bold">
            ${product.price.toFixed(2)}
          </p>

          {product.compare_at_price &&
            product.compare_at_price > product.price && (
              <p className="mt-1 text-sm text-gray-400 line-through">
                ${product.compare_at_price.toFixed(2)}
              </p>
            )}

          <div className="my-8 border-t border-gray-200" />

          <p className="text-sm leading-8 text-gray-600">
            {product.description}
          </p>

          {/* Colour Selection */}
          <div className="mt-9">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold tracking-widest">
                COLOUR
              </p>

              <p className="text-xs text-gray-500">
                {selectedColor}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select ${color}`}
                  aria-pressed={selectedColor === color}
                  className={`flex items-center gap-2 border px-4 py-3 text-xs ${
                    selectedColor === color
                      ? "border-black"
                      : "border-gray-200 hover:border-black"
                  }`}
                >
                  <span
                    className="h-4 w-4 rounded-full border border-gray-300"
                    style={{
                      backgroundColor:
                        colorHex[color] || "#d1d5db",
                    }}
                  />
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mt-9">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-bold tracking-widest">
                SELECT SIZE
              </p>

              <span className="text-xs text-gray-500">
                Size guide coming soon
              </span>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  aria-pressed={selectedSize === size}
                  className={`border py-4 text-xs font-bold ${
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock */}
          <p className="mt-6 text-xs text-gray-500">
            {soldOut
              ? "OUT OF STOCK"
              : `${stock} items available`}
          </p>

          {/* Quantity */}
          <div className="mt-5">
            <p className="mb-4 text-xs font-bold tracking-widest">
              QUANTITY
            </p>

            <div className="flex w-fit items-center border border-gray-200">

              <button
                type="button"
                onClick={() =>
                  setQuantity(Math.max(1, quantity - 1))
                }
                disabled={quantity <= 1 || soldOut}
                className="px-5 py-4 disabled:opacity-30"
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>

              <span className="min-w-10 text-center text-sm">
                {quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  setQuantity(
                    Math.min(maximumQuantity, quantity + 1)
                  )
                }
                disabled={quantity >= maximumQuantity || soldOut}
                className="px-5 py-4 disabled:opacity-30"
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>

            </div>

            <p className="mt-2 text-[10px] text-gray-400">
              Maximum 8 items per selection.
            </p>
          </div>

          {/* Add to Cart */}
          <button
            type="button"
            onClick={addToCart}
            disabled={soldOut}
            className={`mt-9 flex w-full items-center justify-center gap-3 py-5 text-xs font-bold tracking-[0.2em] transition ${
              soldOut
                ? "cursor-not-allowed bg-gray-300 text-gray-600"
                : added
                  ? "bg-green-700 text-white"
                  : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {soldOut ? (
              "SOLD OUT"
            ) : added ? (
              <>
                <Check size={18} />
                ADDED TO CART
              </>
            ) : (
              <>
                <ShoppingBag size={18} />
                ADD TO CART — ${(product.price * quantity).toFixed(2)}
              </>
            )}
          </button>

          {added && (
            <Link
              href="/cart"
              className="mt-4 text-center text-xs font-bold tracking-widest underline"
            >
              VIEW YOUR CART
            </Link>
          )}

          {/* Product Information */}
          <div className="mt-8 border-t border-gray-200 pt-6">

            <div className="flex justify-between py-3 text-xs">
              <span className="text-gray-500">PRODUCT</span>
              <span>CLOTHING. COLLECTION</span>
            </div>

            <div className="flex justify-between border-t border-gray-100 py-3 text-xs">
              <span className="text-gray-500">DELIVERY</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="flex justify-between border-t border-gray-100 py-3 text-xs">
              <span className="text-gray-500">RETURNS</span>
              <span>Return policy applies</span>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black px-5 py-10 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <Link
            href="/"
            className="text-2xl font-black tracking-tight"
          >
            CLOTHING.
          </Link>

          <p className="text-xs text-gray-500">
            © 2026 CLOTHING. All rights reserved.
          </p>

        </div>
      </footer>

    </main>
  );
}

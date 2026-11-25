
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  getProducts,
  getCategories,
  type StoreProduct,
  type StoreCategory,
} from "@/lib/products";

type ShopProduct = StoreProduct & {
  category: string;
};

const defaultCategories = ["All"];

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true);
        setError("");

        const [productData, categoryData] = await Promise.all([
          getProducts(),
          getCategories(),
        ]);

        const categoryMap = new Map(
          categoryData.map((category: StoreCategory) => [
            category.$id,
            category.name,
          ])
        );

        const mappedProducts: ShopProduct[] = productData.map(
          (product) => ({
            ...product,
            category: categoryMap.get(product.category_id) || "Other",
          })
        );

        setProducts(mappedProducts);

        setCategories([
          "All",
          ...categoryData.map((category) => category.name),
        ]);
      } catch (err) {
        console.error("Failed to load shop:", err);
        setError(
          "We couldn't load the products. Please check your connection and try again."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStore();
  }, []);

  let filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    const searchTerm = search.toLowerCase().trim();

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description?.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (sort === "low") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => a.price - b.price
    );
  }

  if (sort === "high") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => b.price - a.price
    );
  }

  if (sort === "featured") {
    filteredProducts = [...filteredProducts].sort(
      (a, b) => Number(b.is_featured) - Number(a.is_featured)
    );
  }

  function clearFilters() {
    setSelectedCategory("All");
    setSearch("");
    setSort("featured");
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
          <nav className="hidden gap-8 text-xs font-medium tracking-widest md:flex">
            <Link href="/" className="hover:text-gray-500">
              HOME
            </Link>
            <Link href="/shop" className="font-bold">
              SHOP
            </Link>
            <Link href="/#about" className="hover:text-gray-500">
              ABOUT
            </Link>
          </nav>

          <Link href="/" className="text-2xl font-black tracking-tight">
            CLOTHING.
          </Link>

          <Link href="/cart" aria-label="Shopping cart">
            <ShoppingBag size={22} />
          </Link>
        </div>
      </header>

      {/* Page Heading */}
      <section className="mx-auto max-w-7xl px-5 pb-8 pt-14 md:px-10 md:pt-20">
        <p className="mb-3 text-xs tracking-[0.25em] text-gray-500">
          OUR COLLECTION
        </p>

        <h1 className="text-4xl font-black tracking-tight md:text-7xl">
          THE SHOP.
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-7 text-gray-500">
          Explore everyday essentials, streetwear and timeless pieces
          designed for your own style.
        </p>
      </section>

      {/* Search */}
      <section className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
          <Search size={20} className="text-gray-500" />

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none"
          />

          {search && (
            <button
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="flex items-center gap-2 border border-gray-200 px-4 py-3 text-xs font-bold tracking-widest md:hidden"
          >
            <SlidersHorizontal size={16} />
            FILTER
          </button>

          <p className="text-xs text-gray-500">
            {loading ? "LOADING PRODUCTS..." : `${filteredProducts.length} PRODUCTS`}
          </p>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-gray-200 bg-white px-3 py-3 text-xs outline-none"
          >
            <option value="featured">Featured</option>
            <option value="low">Price: Low to High</option>
            <option value="high">Price: High to Low</option>
          </select>
        </div>

        {/* Mobile filters */}
        {mobileFilterOpen && (
          <div className="mt-5 border border-gray-200 p-5 md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-widest">
                CATEGORIES
              </h3>

              <button
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setMobileFilterOpen(false);
                  }}
                  className={`border px-4 py-3 text-xs ${
                    selectedCategory === category
                      ? "border-black bg-black text-white"
                      : "border-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-10 md:grid-cols-[220px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden md:block">
            <h3 className="mb-5 text-xs font-bold tracking-widest">
              CATEGORIES
            </h3>

            <div className="space-y-4">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`block text-left text-sm ${
                    selectedCategory === category
                      ? "font-bold"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-12 border-t border-gray-200 pt-7">
              <button
                onClick={clearFilters}
                className="text-xs font-bold tracking-widest underline"
              >
                CLEAR FILTERS
              </button>
            </div>
          </aside>

          {/* Product Grid */}
          <div>
            {loading ? (
              <div className="py-24 text-center">
                <p className="text-sm text-gray-500">
                  Loading our collection...
                </p>
              </div>
            ) : error ? (
              <div className="py-24 text-center">
                <h2 className="text-xl font-bold">
                  Unable to load products
                </h2>

                <p className="mt-3 text-sm text-gray-500">{error}</p>

                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 border border-black px-6 py-3 text-xs font-bold"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center">
                <h2 className="text-xl font-bold">
                  No products found
                </h2>

                <p className="mt-3 text-sm text-gray-500">
                  Try another search or category.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-6 border border-black px-6 py-3 text-xs font-bold"
                >
                  RESET
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    href={`/product/${product.$id}`}
                    key={product.$id}
                    className="group block"
                  >
                    <div className="relative overflow-hidden bg-gray-100">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-[260px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[400px]"
                      />

                      {product.tag && (
                        <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[10px] font-bold tracking-widest">
                          {product.tag}
                        </span>
                      )}

                      {product.stock_quantity <= 0 && (
                        <span className="absolute bottom-3 left-3 bg-black px-3 py-2 text-[10px] font-bold tracking-widest text-white">
                          SOLD OUT
                        </span>
                      )}
                    </div>

                    <div className="mt-4">
                      <p className="text-[10px] tracking-widest text-gray-500">
                        {product.category.toUpperCase()}
                      </p>

                      <h3 className="mt-2 text-sm font-medium">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-sm font-bold">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-10 bg-black px-5 py-10 text-white md:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="text-2xl font-black tracking-tight">
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

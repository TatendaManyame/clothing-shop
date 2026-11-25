
/* eslint-disable @next/next/no-html-link-for-pages */

import {
  ArrowRight,
  Search,
  ShoppingBag,
  Menu,
  ArrowUpRight,
} from "lucide-react";

const products = [
  {
    name: "Classic Track Set",
    price: "$45.00",
    category: "TRACKSUITS",
    img: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",
    tag: "BESTSELLER",
  },
  {
    name: "Essential Hoodie",
    price: "$38.00",
    category: "HOODIES",
    img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
    tag: "NEW",
  },
  {
    name: "Urban Cargo",
    price: "$42.00",
    category: "PANTS",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
    tag: "",
  },
  {
    name: "Everyday Tee",
    price: "$22.00",
    category: "T-SHIRTS",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    tag: "POPULAR",
  },
];

const categories = [
  {
    name: "TOPS",
    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "BOTTOMS",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "OUTERWEAR",
    img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      {/* Announcement Bar */}
      <div className="bg-black px-4 py-3 text-center text-xs tracking-[0.15em] text-white">
        FREE SHIPPING ON ORDERS OVER $100
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
          {/* Mobile Menu */}
          <a
            href="/shop"
            className="flex items-center gap-3 md:hidden"
            aria-label="Open shop"
          >
            <Menu size={22} />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 text-xs font-medium tracking-[0.15em] md:flex">
            <a href="/shop" className="hover:text-gray-500">
              SHOP
            </a>

            <a href="/shop" className="hover:text-gray-500">
              COLLECTIONS
            </a>

            <a href="#about" className="hover:text-gray-500">
              ABOUT
            </a>
          </nav>

          {/* Logo */}
          <a
            href="/"
            className="text-2xl font-black tracking-[-0.08em] md:text-3xl"
          >
            CLOTHING.
          </a>

          {/* Header Actions */}
          <div className="flex items-center gap-5">
            <a href="/shop" aria-label="Search products">
              <Search size={20} strokeWidth={1.7} />
            </a>

            <a href="/cart" aria-label="Shopping bag">
              <ShoppingBag size={20} strokeWidth={1.7} />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[650px] overflow-hidden bg-gray-200 md:min-h-[750px]">
        <img
          src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=2000&q=90"
          alt="Modern streetwear collection"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />

        <div className="absolute inset-0 bg-black/35" />

        <div className="relative mx-auto flex min-h-[650px] max-w-7xl flex-col justify-end px-6 pb-20 text-white md:min-h-[750px] md:px-12 md:pb-28">
          <p className="mb-5 text-xs font-medium tracking-[0.3em]">
            THE NEW COLLECTION — 2026
          </p>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">
            WEAR YOUR
            <br />
            OWN STORY.
          </h1>

          <p className="mt-6 max-w-md text-sm leading-7 text-white/80 md:text-base">
            Designed for individuality. Built for everyday life.
            Discover the latest pieces that define your style.
          </p>

          <a
            href="/shop"
            className="mt-8 inline-flex w-fit items-center gap-4 bg-white px-7 py-4 text-xs font-bold tracking-[0.2em] text-black transition hover:bg-black hover:text-white"
          >
            SHOP COLLECTION <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                EXPLORE
              </p>

              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                SHOP BY CATEGORY
              </h2>
            </div>

            <a
              href="/shop"
              className="hidden items-center gap-2 text-xs font-bold tracking-widest md:flex"
            >
              EXPLORE ALL <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {categories.map((category) => (
              <a
                href="/shop"
                key={category.name}
                className="group relative h-[450px] overflow-hidden bg-gray-100"
              >
                <img
                  src={category.img}
                  alt={category.name}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/40" />

                <div className="absolute bottom-7 left-7 right-7 flex items-center justify-between text-white">
                  <h3 className="text-2xl font-bold tracking-wide">
                    {category.name}
                  </h3>

                  <ArrowUpRight size={24} />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section
        id="shop"
        className="bg-[#f7f7f7] px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                CURATED FOR YOU
              </p>

              <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
                BESTSELLERS
              </h2>
            </div>

            <a
              href="/shop"
              className="hidden items-center gap-2 text-xs font-bold tracking-widest md:flex"
            >
              VIEW ALL <ArrowRight size={16} />
            </a>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {products.map((product) => (
              <a
                href="/shop"
                key={product.name}
                className="group block"
              >
                <div className="relative overflow-hidden bg-white">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-[280px] w-full object-cover transition duration-500 group-hover:scale-105 md:h-[420px]"
                  />

                  {product.tag && (
                    <span className="absolute left-3 top-3 bg-white px-3 py-2 text-[10px] font-bold tracking-widest">
                      {product.tag}
                    </span>
                  )}

                  <div className="absolute bottom-3 left-3 right-3 translate-y-4 bg-white py-3 text-center text-xs font-bold tracking-widest opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    VIEW PRODUCT
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-[10px] tracking-widest text-gray-500">
                    {product.category}
                  </p>

                  <h3 className="mt-2 text-sm font-medium">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-sm font-semibold">
                    {product.price}
                  </p>
                </div>
              </a>
            ))}
          </div>

          {/* Mobile View All */}
          <a
            href="/shop"
            className="mt-10 flex w-full items-center justify-center gap-3 border border-black py-4 text-xs font-bold tracking-widest transition hover:bg-black hover:text-white md:hidden"
          >
            VIEW ALL PRODUCTS <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* Promotional Banner */}
      <section id="about" className="relative overflow-hidden bg-black text-white">
        <div className="grid md:grid-cols-2">
          <div className="flex flex-col justify-center px-6 py-20 md:px-16 md:py-28">
            <p className="mb-5 text-xs tracking-[0.25em] text-gray-400">
              OUR PHILOSOPHY
            </p>

            <h2 className="text-4xl font-black leading-tight md:text-6xl">
              NOT JUST
              <br />
              CLOTHES.
              <br />
              A STATEMENT.
            </h2>

            <p className="mt-6 max-w-md text-sm leading-7 text-gray-400">
              Fashion should be an expression of who you are. We create
              timeless pieces that give you confidence, comfort and freedom
              to define your own style.
            </p>

            <a
              href="/shop"
              className="mt-8 inline-flex w-fit items-center gap-3 border border-white px-7 py-4 text-xs font-bold tracking-widest transition hover:bg-white hover:text-black"
            >
              DISCOVER OUR COLLECTION <ArrowRight size={16} />
            </a>
          </div>

          <div className="min-h-[400px] md:min-h-[650px]">
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1500&q=85"
              alt="Fashion lifestyle"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-xs tracking-[0.25em] text-gray-500">
            STAY IN THE LOOP
          </p>

          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            GET FIRST ACCESS.
          </h2>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-gray-500">
            Sign up for our newsletter and be the first to discover
            new collections, exclusive offers and special releases.
          </p>

          <form className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email address"
              className="min-w-0 flex-1 border border-gray-300 px-5 py-4 text-sm outline-none focus:border-black"
            />

            <button
              type="button"
              className="bg-black px-8 py-4 text-xs font-bold tracking-widest text-white transition hover:bg-gray-800"
            >
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black px-5 py-14 text-white md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Brand */}
            <div>
              <h2 className="text-3xl font-black tracking-tight">
                CLOTHING.
              </h2>

              <p className="mt-4 max-w-xs text-sm leading-7 text-gray-400">
                Elevate your everyday. Explore clothing designed
                for confidence, comfort and style.
              </p>
            </div>

            {/* Shop */}
            <div>
              <h3 className="text-xs font-bold tracking-widest">
                SHOP
              </h3>

              <div className="mt-5 space-y-3 text-sm text-gray-400">
                <a href="/shop" className="block hover:text-white">
                  New Arrivals
                </a>

                <a href="/shop" className="block hover:text-white">
                  Bestsellers
                </a>

                <a href="/shop" className="block hover:text-white">
                  Collections
                </a>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-xs font-bold tracking-widest">
                SUPPORT
              </h3>

              <div className="mt-5 space-y-3 text-sm text-gray-400">
                <a href="#" className="block hover:text-white">
                  Contact Us
                </a>

                <a href="#" className="block hover:text-white">
                  Shipping
                </a>

                <a href="#" className="block hover:text-white">
                  Returns
                </a>

                <a href="#" className="block hover:text-white">
                  FAQs
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-xs font-bold tracking-widest">
                FOLLOW US
              </h3>

              <a
                href="#"
                className="mt-5 flex items-center gap-3 text-sm text-gray-400 hover:text-white"
              >
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-14 border-t border-gray-800 pt-7 text-xs text-gray-500">
            © 2026 CLOTHING. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}

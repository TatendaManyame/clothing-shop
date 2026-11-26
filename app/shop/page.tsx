
"use client";
/* eslint-disable @next/next/no-img-element */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";
import Link from "next/link";
import { Storage } from "appwrite";
import { client } from "@/lib/appwrite";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowRight,
  ArrowUpRight,
  ShoppingBag,
  RotateCcw,
  Heart,
  ChevronUp,
  Check,
} from "lucide-react";
import {
  getProducts,
  getCategories,
  type StoreProduct,
  type StoreCategory,
} from "@/lib/products";

type ShopProduct = StoreProduct & { category: string };

const PAGE_SIZE = 12;
const SORTS = [
  { v: "featured", l: "Featured" },
  { v: "low", l: "Price: Low to High" },
  { v: "high", l: "Price: High to Low" },
  { v: "az", l: "Name: A to Z" },
];

const GRID: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-3 xl:grid-cols-4",
};

/* ---------- Appwrite Storage ---------- */

const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

if (!bucketId) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_BUCKET_ID");
}

const storage = new Storage(client);

const shopHeroImage = storage
  .getFileView({
    bucketId,
    fileId: "tracksuit-black",
  })
  .toString();

/* ---------- small helpers ---------- */

function Reveal({
  children,
  delay = 0,
}: {
  children: ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("sw-in");
          io.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="sw-reveal"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function Words({ text, base = 0 }: { text: string; base?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="sw-mask">
          <span
            className="sw-word"
            style={{ animationDelay: `${base + i * 110}ms` }}
          >
            {w}&nbsp;
          </span>
        </span>
      ))}
    </>
  );
}

/* ---------- page ---------- */

export default function ShopPage() {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [cols, setCols] = useState(3);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [drawer, setDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [wish, setWish] = useState<string[]>([]);
  const [showTop, setShowTop] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  /* load data */
  const loadStore = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [productData, categoryData] = await Promise.all([
        getProducts(),
        getCategories(),
      ]);

      const map = new Map(
        categoryData.map((c: StoreCategory) => [c.$id, c.name])
      );

      setProducts(
        productData.map((p) => ({
          ...p,
          category: map.get(p.category_id) || "Other",
        }))
      );

      setCategories(categoryData.map((c) => c.name));
    } catch (err) {
      console.error("Failed to load shop:", err);
      setError(
        "We couldn't load the products. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStore();
  }, [loadStore]);

  /* wishlist persistence */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("vicwav-wishlist");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setWish(JSON.parse(raw));
    } catch {}
  }, []);

  const toggleWish = (id: string) =>
    setWish((w) => {
      const next = w.includes(id)
        ? w.filter((x) => x !== id)
        : [...w, id];

      try {
        localStorage.setItem("vicwav-wishlist", JSON.stringify(next));
      } catch {}

      return next;
    });

  /* "/" focuses search, scroll-to-top visibility, drawer scroll lock */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;

      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)
      ) {
        e.preventDefault();
        searchRef.current?.focus();
      }

      if (e.key === "Escape") setDrawer(false);
    };

    const onScroll = () => setShowTop(window.scrollY > 900);

    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [drawer]);

  /* derived data */
  const priceCeil = useMemo(
    () => Math.ceil(Math.max(0, ...products.map((p) => p.price))),
    [products]
  );

  const priceLimit = maxPrice ?? priceCeil;

  const counts = useMemo(() => {
    const m: Record<string, number> = { All: products.length };

    products.forEach(
      (p) => (m[p.category] = (m[p.category] || 0) + 1)
    );

    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    let list = products.filter((p) => {
      if (selectedCategory !== "All" && p.category !== selectedCategory)
        return false;

      if (inStockOnly && p.stock_quantity <= 0) return false;
      if (p.price > priceLimit) return false;
      if (!term) return true;

      return (
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        !!p.description?.toLowerCase().includes(term)
      );
    });

    list = [...list];

    if (sort === "low") list.sort((a, b) => a.price - b.price);
    else if (sort === "high") list.sort((a, b) => b.price - a.price);
    else if (sort === "az")
      list.sort((a, b) => a.name.localeCompare(b.name));
    else
      list.sort(
        (a, b) => Number(b.is_featured) - Number(a.is_featured)
      );

    return list;
  }, [
    products,
    selectedCategory,
    search,
    sort,
    inStockOnly,
    priceLimit,
  ]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVisible(PAGE_SIZE);
  }, [selectedCategory, search, sort, inStockOnly, maxPrice]);

  const activeFilters = [
    selectedCategory !== "All" && {
      k: "cat",
      l: selectedCategory,
      clear: () => setSelectedCategory("All"),
    },
    search.trim() && {
      k: "q",
      l: `"${search.trim()}"`,
      clear: () => setSearch(""),
    },
    maxPrice !== null &&
      maxPrice < priceCeil && {
        k: "p",
        l: `Up to $${maxPrice}`,
        clear: () => setMaxPrice(null),
      },
    inStockOnly && {
      k: "s",
      l: "In stock",
      clear: () => setInStockOnly(false),
    },
  ].filter(Boolean) as {
    k: string;
    l: string;
    clear: () => void;
  }[];

  function clearFilters() {
    setSelectedCategory("All");
    setSearch("");
    setSort("featured");
    setMaxPrice(null);
    setInStockOnly(false);
    setDrawer(false);
  }

  const heroMove = (e: MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();

    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const shown = filtered.slice(0, visible);

  /* shared filter controls (sidebar + drawer) */
  const FilterControls = (
    <div className="space-y-9">
      <div>
        <h3 className="mb-4 text-xs font-black tracking-[0.2em]">
          CATEGORY
        </h3>

        <div className="space-y-1.5">
          {["All", ...categories].map((c) => {
            const on = selectedCategory === c;

            return (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                aria-pressed={on}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm transition ${
                  on
                    ? "bg-[#07152e] font-semibold text-white shadow-lg shadow-blue-950/15"
                    : "text-slate-600 hover:bg-white hover:text-blue-700"
                }`}
              >
                {c}

                <span
                  className={`text-[11px] tabular-nums ${
                    on ? "text-cyan-300" : "text-slate-400"
                  }`}
                >
                  {counts[c] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-black tracking-[0.2em]">
            MAX PRICE
          </h3>

          <span className="text-sm font-bold tabular-nums">
            ${priceLimit}
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={priceCeil || 100}
          step={1}
          value={priceLimit}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          aria-label="Maximum price"
          className="sw-range w-full"
          style={{
            ["--p" as string]: `${
              priceCeil ? (priceLimit / priceCeil) * 100 : 100
            }%`,
          }}
        />

        <div className="mt-2 flex justify-between text-[11px] text-slate-400">
          <span>$0</span>
          <span>${priceCeil}</span>
        </div>
      </div>

      <button
        onClick={() => setInStockOnly(!inStockOnly)}
        role="switch"
        aria-checked={inStockOnly}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium transition hover:border-blue-400"
      >
        In stock only

        <span
          className={`relative h-6 w-11 rounded-full transition ${
            inStockOnly ? "bg-blue-600" : "bg-slate-300"
          }`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
              inStockOnly ? "left-6" : "left-1"
            }`}
          />
        </span>
      </button>

      <button
        onClick={clearFilters}
        className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-slate-500 transition hover:text-blue-700"
      >
        <RotateCcw size={13} /> RESET ALL
      </button>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#07152e]">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ================= HERO ================= */}
      <section
        ref={heroRef}
        onMouseMove={heroMove}
        className="relative isolate overflow-hidden bg-[#07152e] text-white"
      >
        <div className="absolute inset-0">
          <img
            src={shopHeroImage}
            alt=""
            aria-hidden="true"
            className="sw-kenburns h-full w-full object-cover opacity-40"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#07152e] via-[#07152e]/90 to-[#07152e]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07152e] via-transparent to-[#07152e]/30" />
        </div>

        <div className="sw-spot pointer-events-none absolute inset-0" />
        <div className="sw-glow pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-blue-500/25 blur-[120px]" />

        <div className="relative mx-auto flex min-h-[380px] max-w-7xl flex-col justify-center px-6 py-20 md:min-h-[440px] md:px-12">
          <div className="sw-fade mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-cyan-400" />
            <p className="text-[10px] font-bold tracking-[0.35em] text-cyan-300 md:text-xs">
              THE VICWAV COLLECTION
            </p>
          </div>

          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.055em] md:text-7xl lg:text-8xl">
            <Words text="FIND YOUR" base={150} />
            <br />

            <span className="sw-shine">
              <Words text="OWN STYLE." base={450} />
            </span>
          </h1>

          <div
            className="sw-fade mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"
            style={{ animationDelay: "900ms" }}
          >
            <a
              href="#collection"
              className="sw-btn group inline-flex items-center gap-4 rounded-full bg-white px-7 py-4 text-xs font-bold tracking-[0.15em] text-[#07152e]"
            >
              <span>EXPLORE COLLECTION</span>

              <ArrowRight
                size={16}
                className="rotate-90 transition-transform group-hover:translate-y-1"
              />
            </a>

            {!loading && !error && (
              <p className="text-xs font-medium tracking-wider text-white/60">
                {products.length} PIECES · {categories.length} CATEGORIES
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ================= STICKY TOOLBAR ================= */}
      <div
        id="collection"
        className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f6f8fc]/85 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-7xl px-5 md:px-10">
          <div className="flex items-center gap-3 py-3.5">
            <div className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-white px-5 py-3 shadow-sm transition focus-within:border-blue-400 focus-within:shadow-md focus-within:shadow-blue-500/10">
              <Search size={18} className="shrink-0 text-blue-600" />

              <input
                ref={searchRef}
                type="text"
                placeholder="Search products, categories and styles"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search products"
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              {search ? (
                <button
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                  className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X size={16} />
                </button>
              ) : (
                <kbd className="hidden rounded-md border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-400 sm:block">
                  /
                </kbd>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="hidden rounded-full border border-slate-200 bg-white px-5 py-3.5 text-xs font-semibold outline-none transition hover:border-blue-500 focus:border-blue-500 sm:block"
            >
              {SORTS.map((s) => (
                <option key={s.v} value={s.v}>
                  {s.l}
                </option>
              ))}
            </select>

            <div
              className="hidden items-center rounded-full border border-slate-200 bg-white p-1 lg:flex"
              role="group"
              aria-label="Grid size"
            >
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setCols(n)}
                  aria-pressed={cols === n}
                  aria-label={`${n} columns`}
                  className={`grid h-9 w-9 place-items-center rounded-full text-xs font-bold transition ${
                    cols === n
                      ? "bg-[#07152e] text-white"
                      : "text-slate-500 hover:text-blue-700"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={() => setDrawer(true)}
              className="relative flex items-center gap-2 rounded-full bg-[#07152e] px-5 py-3.5 text-[11px] font-bold tracking-widest text-white md:hidden"
            >
              <SlidersHorizontal size={15} />
              FILTERS

              {activeFilters.length > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-cyan-400 text-[10px] text-[#07152e]">
                  {activeFilters.length}
                </span>
              )}
            </button>
          </div>

          <div className="sw-noscroll -mx-5 flex gap-2 overflow-x-auto px-5 pb-3.5 md:hidden">
            {["All", ...categories].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                aria-pressed={selectedCategory === c}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition ${
                  selectedCategory === c
                    ? "border-[#07152e] bg-[#07152e] text-white"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-10 md:py-14">
        <div className="grid gap-10 md:grid-cols-[230px_1fr] lg:grid-cols-[250px_1fr] lg:gap-14">
          <aside className="hidden md:block">
            <div className="sticky top-28">{FilterControls}</div>
          </aside>

          <div>
            {!loading && !error && (
              <div className="mb-8 flex flex-wrap items-center gap-3">
                <p
                  className="mr-2 text-xs font-semibold tracking-wider text-slate-500"
                  aria-live="polite"
                >
                  {filtered.length}{" "}
                  {filtered.length === 1 ? "PRODUCT" : "PRODUCTS"}
                </p>

                {activeFilters.map((f) => (
                  <button
                    key={f.k}
                    onClick={f.clear}
                    className="sw-pop group flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-800 transition hover:border-blue-400"
                  >
                    {f.l}
                    <X
                      size={13}
                      className="transition group-hover:rotate-90"
                    />
                  </button>
                ))}

                {activeFilters.length > 1 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs font-bold text-slate-500 underline-offset-4 hover:text-blue-700 hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            {loading ? (
              <div className={`grid grid-cols-2 gap-4 ${GRID[cols]} md:gap-6`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div className="sw-skel aspect-[3/4] rounded-2xl" />
                    <div className="sw-skel mt-4 h-3 w-1/3 rounded" />
                    <div className="sw-skel mt-3 h-4 w-3/4 rounded" />
                    <div className="sw-skel mt-3 h-4 w-1/4 rounded" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div
                className="rounded-3xl border border-red-100 bg-white px-6 py-24 text-center shadow-sm"
                role="alert"
              >
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-red-500">
                  <ShoppingBag size={25} />
                </div>

                <h2 className="mt-6 text-xl font-black">
                  Unable to load products
                </h2>

                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-500">
                  {error}
                </p>

                <button
                  onClick={loadStore}
                  className="mt-7 rounded-full bg-[#07152e] px-7 py-4 text-xs font-bold tracking-widest text-white transition hover:bg-blue-700"
                >
                  TRY AGAIN
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white px-6 py-24 text-center shadow-sm">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-500">
                  <Search size={25} />
                </div>

                <h2 className="mt-6 text-xl font-black">
                  No products found
                </h2>

                <p className="mt-3 text-sm text-slate-500">
                  Try another search, raise the price limit or choose a
                  different category.
                </p>

                <button
                  onClick={clearFilters}
                  className="mt-7 inline-flex items-center gap-3 rounded-full bg-[#07152e] px-7 py-4 text-xs font-bold tracking-widest text-white transition hover:bg-blue-700"
                >
                  RESET FILTERS <RotateCcw size={14} />
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-2 gap-x-4 gap-y-10 ${GRID[cols]} md:gap-x-6 md:gap-y-14`}
                >
                  {shown.map((p, i) => {
                    const sold = p.stock_quantity <= 0;
                    const low = !sold && p.stock_quantity <= 5;
                    const liked = wish.includes(p.$id);

                    return (
                      <Reveal key={p.$id} delay={(i % 4) * 70}>
                        <div className="group relative">
                          <Link
                            href={`/product/${p.$id}`}
                            className="block"
                            aria-label={p.name}
                          >
                            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-black/5 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-2xl group-hover:shadow-blue-950/15">
                              <img
                                src={p.image_url}
                                alt={p.name}
                                loading="lazy"
                                className={`h-full w-full object-cover transition duration-700 ease-out group-hover:scale-110 ${
                                  sold ? "grayscale-[60%]" : ""
                                }`}
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-[#07152e]/40 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

                              {p.tag && (
                                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-black tracking-widest shadow-sm backdrop-blur-sm md:left-4 md:top-4">
                                  {p.tag}
                                </span>
                              )}

                              {sold ? (
                                <div className="absolute inset-0 grid place-items-center bg-[#07152e]/55">
                                  <span className="rounded-full border border-white/40 bg-[#07152e]/80 px-5 py-3 text-[10px] font-black tracking-[0.2em] text-white backdrop-blur-md">
                                    SOLD OUT
                                  </span>
                                </div>
                              ) : (
                                <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:inset-x-4 md:bottom-4">
                                  <div className="flex items-center justify-center gap-2 rounded-full bg-white py-3 text-[10px] font-black tracking-[0.18em] shadow-lg">
                                    VIEW PRODUCT <ArrowUpRight size={14} />
                                  </div>
                                </div>
                              )}
                            </div>
                          </Link>

                          <button
                            onClick={() => toggleWish(p.$id)}
                            aria-pressed={liked}
                            aria-label={
                              liked
                                ? "Remove from wishlist"
                                : "Save to wishlist"
                            }
                            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-sm backdrop-blur transition hover:scale-110 md:right-4 md:top-4"
                          >
                            <Heart
                              key={String(liked)}
                              size={16}
                              className={
                                liked
                                  ? "sw-pop fill-red-500 text-red-500"
                                  : "text-slate-700"
                              }
                            />
                          </button>

                          <div className="mt-4">
                            <p className="text-[9px] font-bold tracking-[0.2em] text-blue-700 md:text-[10px]">
                              {p.category.toUpperCase()}
                            </p>

                            <Link
                              href={`/product/${p.$id}`}
                              className="mt-2 block text-sm font-semibold transition-colors hover:text-blue-700 md:text-base"
                            >
                              {p.name}
                            </Link>

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <p className="text-sm font-black md:text-base">
                                ${p.price.toFixed(2)}
                              </p>

                              {low ? (
                                <span className="text-[10px] font-semibold text-amber-600">
                                  Only {p.stock_quantity} left
                                </span>
                              ) : !sold ? (
                                <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                                  <Check size={11} /> In stock
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </Reveal>
                    );
                  })}
                </div>

                <div className="mt-16 flex flex-col items-center gap-4">
                  <p className="text-xs font-medium text-slate-500">
                    Showing {shown.length} of {filtered.length}
                  </p>

                  <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-700"
                      style={{
                        width: `${
                          (shown.length / filtered.length) * 100
                        }%`,
                      }}
                    />
                  </div>

                  {visible < filtered.length && (
                    <button
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                      className="sw-btn mt-2 rounded-full border border-[#07152e] px-10 py-4 text-xs font-bold tracking-widest transition hover:text-[#07152e]"
                    >
                      <span>LOAD MORE</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`fixed inset-0 z-50 md:hidden ${
          drawer ? "" : "pointer-events-none"
        }`}
        aria-hidden={!drawer}
      >
        <div
          onClick={() => setDrawer(false)}
          className={`absolute inset-0 bg-[#07152e]/60 backdrop-blur-sm transition-opacity duration-300 ${
            drawer ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          role="dialog"
          aria-label="Filters"
          aria-modal="true"
          className={`absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-[#f6f8fc] p-6 pb-28 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] ${
            drawer ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-slate-300" />

          <div className="mb-7 flex items-center justify-between">
            <h2 className="text-lg font-black">Filters</h2>

            <button
              onClick={() => setDrawer(false)}
              aria-label="Close filters"
              className="rounded-full bg-slate-200/70 p-2"
            >
              <X size={17} />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="mb-3 text-xs font-black tracking-[0.2em]">
              SORT BY
            </h3>

            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <button
                  key={s.v}
                  onClick={() => setSort(s.v)}
                  className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                    sort === s.v
                      ? "border-[#07152e] bg-[#07152e] text-white"
                      : "border-slate-200 bg-white text-slate-600"
                  }`}
                >
                  {s.l}
                </button>
              ))}
            </div>
          </div>

          {FilterControls}

          <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-[#f6f8fc]/95 p-4 backdrop-blur">
            <button
              onClick={() => setDrawer(false)}
              className="w-full rounded-full bg-[#07152e] py-4 text-xs font-bold tracking-widest text-white"
            >
              SHOW {filtered.length}{" "}
              {filtered.length === 1 ? "PRODUCT" : "PRODUCTS"}
            </button>
          </div>
        </div>
      </div>

      {/* back to top */}
      <button
        onClick={() =>
          window.scrollTo({ top: 0, behavior: "smooth" })
        }
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#07152e] text-white shadow-2xl transition duration-300 hover:bg-blue-600 ${
          showTop && !drawer
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <ChevronUp size={20} />
      </button>
    </main>
  );
}

/* ---------- styles ---------- */

const css = `
.sw-mask{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em}
.sw-word{display:inline-block;transform:translateY(110%) rotate(4deg);animation:sw-word .9s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes sw-word{to{transform:none}}
.sw-fade{opacity:0;transform:translateY(16px);animation:sw-fade .9s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:.1s}
@keyframes sw-fade{to{opacity:1;transform:none}}

.sw-shine{background:linear-gradient(100deg,#fff 20%,#67e8f9 45%,#fff 70%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sw-shine 5s linear infinite 1.5s}
.sw-shine .sw-word{color:transparent}
@keyframes sw-shine{to{background-position:-250% 0}}

.sw-kenburns{animation:sw-ken 24s ease-in-out infinite alternate}
@keyframes sw-ken{to{transform:scale(1.12) translateX(-1.5%)}}
.sw-spot{background:radial-gradient(420px circle at var(--x,60%) var(--y,40%),rgba(103,232,249,.15),transparent 60%)}
.sw-glow{animation:sw-glow 9s ease-in-out infinite alternate}
@keyframes sw-glow{to{transform:translate(-60px,40px) scale(1.2);opacity:.7}}

.sw-btn{position:relative;overflow:hidden;isolation:isolate}
.sw-btn::before{content:"";position:absolute;inset:0;z-index:-1;background:#67e8f9;transform:translateY(101%);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.sw-btn:hover::before{transform:none}

.sw-reveal{opacity:0;transform:translateY(32px);transition:opacity .8s cubic-bezier(.2,.8,.2,1),transform .8s cubic-bezier(.2,.8,.2,1)}
.sw-reveal.sw-in{opacity:1;transform:none}

.sw-skel{background:linear-gradient(90deg,#e2e8f0 25%,#f1f5f9 50%,#e2e8f0 75%);background-size:200% 100%;animation:sw-skel 1.4s linear infinite}
@keyframes sw-skel{to{background-position:-200% 0}}

.sw-pop{animation:sw-pop .4s cubic-bezier(.3,1.8,.5,1)}
@keyframes sw-pop{from{transform:scale(.5);opacity:0}to{transform:scale(1);opacity:1}}

.sw-noscroll{scrollbar-width:none}
.sw-noscroll::-webkit-scrollbar{display:none}

.sw-range{-webkit-appearance:none;appearance:none;height:6px;border-radius:99px;outline:none;cursor:pointer;
  background:linear-gradient(90deg,#2563eb var(--p,100%),#cbd5e1 var(--p,100%))}
.sw-range::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:#07152e;border:3px solid #fff;box-shadow:0 2px 8px rgba(7,21,46,.35);transition:transform .2s}
.sw-range::-webkit-slider-thumb:hover{transform:scale(1.2)}
.sw-range::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:#07152e;border:3px solid #fff;box-shadow:0 2px 8px rgba(7,21,46,.35)}

a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #22d3ee;outline-offset:3px}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .sw-word,.sw-fade,.sw-reveal{opacity:1!important;transform:none!important}
}
`;

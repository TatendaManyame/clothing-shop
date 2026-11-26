
"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type MouseEvent,
} from "react";
import { Storage } from "appwrite";
import { client } from "@/lib/appwrite";
import {
  getProducts,
  getCategories,
  type StoreProduct,
  type StoreCategory,
} from "@/lib/products";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Plus,
  ShoppingBag,
} from "lucide-react";

/* ---------- Appwrite images ---------- */

const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

if (!bucketId) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_BUCKET_ID");
}

const storage = new Storage(client);

const img = (file: string) =>
  storage
    .getFileView({
      bucketId,
      fileId: file,
    })
    .toString();

const looks = [
  { name: "Black Piped Set", short: "Black", src: img("tracksuit-black") },
  { name: "Olive Piped Set", short: "Olive", src: img("tracksuit-olive") },
  { name: "Monochrome Set", short: "Mono", src: img("monochrome-set") },
  { name: "Ivory Piped Set", short: "Ivory", src: img("tracksuit-ivory") },
  { name: "Signature Tees", short: "Tees", src: img("tees-stack") },
  { name: "Stitched Detail", short: "Detail", src: img("embroidery-stack") },
  { name: "Ivory Hoodie", short: "Hoodie", src: img("hoodie-ivory") },
];

const categories = [
  { name: "TRACKSUITS", count: "Matching sets", img: img("tracksuit-olive") },
  { name: "HOODIES", count: "Everyday layers", img: img("hoodie-ivory") },
  { name: "T-SHIRTS", count: "Embroidered basics", img: img("tees-stack") },
];

const ticker = [
  "FREE SHIPPING OVER $75",
  "NEW DROP EVERY FRIDAY",
  "30-DAY RETURNS",
  "MADE FOR EVERYDAY",
  "WEAR YOUR OWN STORY",
];

/* ---------- helpers ---------- */

function Magnetic({
  children,
  strength = 0.3,
}: {
  children: ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const move = (e: MouseEvent<HTMLSpanElement>) => {
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();

    el.style.transform = `translate(${
      (e.clientX - r.left - r.width / 2) * strength
    }px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
  };

  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <span
      ref={ref}
      onMouseMove={move}
      onMouseLeave={reset}
      className="inline-block transition-transform duration-200 ease-out"
    >
      {children}
    </span>
  );
}

function Tilt({
  children,
  className = "",
  href = "/shop",
}: {
  children: ReactNode;
  className?: string;
  href?: string;
}) {
  const ref = useRef<HTMLAnchorElement>(null);

  const move = (e: MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;

    el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
  };

  const reset = () => {
    ref.current?.style.setProperty("--rx", "0deg");
    ref.current?.style.setProperty("--ry", "0deg");
  };

  return (
    <a
      ref={ref}
      href={href}
      onMouseMove={move}
      onMouseLeave={reset}
      className={`vw-tilt ${className}`}
    >
      {children}
    </a>
  );
}

function CountUp({
  to,
  suffix = "",
}: {
  to: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;

      io.disconnect();

      const t0 = performance.now();

      const tick = (t: number) => {
        const p = Math.min((t - t0) / 1600, 1);

        setN(Math.round(to * (1 - Math.pow(1 - p, 4))));

        if (p < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    });

    io.observe(el);

    return () => io.disconnect();
  }, [to]);

  return (
    <span ref={ref}>
      {n.toLocaleString()}
      {suffix}
    </span>
  );
}

/** Small hero card that cycles through the looks. */
function LookCard({
  start,
  className = "",
}: {
  start: number;
  className?: string;
}) {
  const [i, setI] = useState(start);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const id = setInterval(() => {
      setI((n) => (n + 1) % looks.length);
    }, 3600);

    return () => clearInterval(id);
  }, []);

  return (
    <a
      href="/shop"
      className={`block rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl shadow-black/40 backdrop-blur-xl ${className}`}
    >
      <span className="relative block aspect-[4/5] overflow-hidden rounded-2xl">
        {looks.map((l, n) => (
          <img
            key={l.src}
            src={l.src}
            alt=""
            className={`absolute inset-0 h-full w-full object-cover transition duration-1000 ${
              n === i ? "scale-100 opacity-100" : "scale-125 opacity-0"
            }`}
          />
        ))}
      </span>

      <span className="block truncate px-1 pb-1 pt-2 text-[10px] font-bold uppercase tracking-widest text-white/90">
        {looks[i].short}
      </span>
    </a>
  );
}

function Words({
  text,
  base = 0,
}: {
  text: string;
  base?: number;
}) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="vw-mask">
          <span
            className="vw-word"
            style={
              {
                "--delay": `${base + i * 110}ms`,
              } as CSSProperties
            }
          >
            {w}&nbsp;
          </span>
        </span>
      ))}
    </>
  );
}

/* ---------- page ---------- */

export default function Home() {
  const bar = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  const [cart, setCart] = useState(0);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(
    {}
  );

  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  const [attempt, setAttempt] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);

  // Products and categories from Appwrite
  useEffect(() => {
    let active = true;

    Promise.all([getProducts(), getCategories()])
      .then(([productList, categoryList]) => {
        if (!active) return;

        const categoryMap = Object.fromEntries(
          categoryList.map((category: StoreCategory) => [
            category.$id,
            category.name,
          ])
        );

        setProducts(productList);
        setCategoryNames(categoryMap);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Could not load products", err);

        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  // Scroll reveal
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("vw-in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 }
    );

    document
      .querySelectorAll("[data-reveal]:not(.vw-in)")
      .forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, [products]);

  // Progress bar and parallax
  useEffect(() => {
    const still = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const onScroll = () => {
      const h = document.documentElement;
      const scrollable = h.scrollHeight - h.clientHeight;
      const p = scrollable > 0 ? h.scrollTop / scrollable : 0;

      if (bar.current) {
        bar.current.style.transform = `scaleX(${p})`;
      }

      if (still) return;

      document.querySelectorAll<HTMLElement>("[data-speed]").forEach((el) => {
        const parent = el.parentElement;
        if (!parent) return;

        const r = parent.getBoundingClientRect();
        const offset = r.top + r.height / 2 - window.innerHeight / 2;

        const shift = Math.max(
          -40,
          Math.min(40, offset * Number(el.dataset.speed))
        );

        el.style.transform = `translateY(${shift}px)`;
      });
    };

    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const heroMove = (e: MouseEvent<HTMLElement>) => {
    const el = heroRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();

    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);

    el.style.setProperty(
      "--px",
      `${((e.clientX - r.left) / r.width) * 2 - 1}`
    );

    el.style.setProperty(
      "--py",
      `${((e.clientY - r.top) / r.height) * 2 - 1}`
    );
  };

  const heroLeave = () => {
    heroRef.current?.style.setProperty("--px", "0");
    heroRef.current?.style.setProperty("--py", "0");
  };

  const toggleLike = (id: string) => {
    setLiked((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    );
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Scroll progress */}
      <div className="fixed left-0 top-0 z-[60] h-[3px] w-full bg-transparent">
        <div
          ref={bar}
          className="h-full origin-left scale-x-0 bg-gradient-to-r from-cyan-300 via-blue-500 to-white"
        />
      </div>

      {/* Floating cart */}
      <button
        aria-label={`Cart, ${cart} items`}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-white/20 bg-[#07152e]/80 px-5 py-3 text-xs font-bold tracking-widest text-white shadow-2xl backdrop-blur-xl transition hover:scale-105"
      >
        <ShoppingBag size={16} />
        <span key={cart} className="vw-pop tabular-nums">
          {cart}
        </span>
      </button>

      {/* ================= HERO ================= */}
      <section
        ref={heroRef}
        onMouseMove={heroMove}
        onMouseLeave={heroLeave}
        className="relative isolate flex min-h-[820px] flex-col overflow-hidden bg-[#07152e] text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_40%,#1d4f86_0%,#0c2547_35%,#07152e_70%)]" />

        {/* Giant wordmark */}
        <div
          className="vw-depth pointer-events-none absolute inset-x-0 top-[8%] select-none text-center"
          style={{ "--d": "-18px" } as CSSProperties}
          aria-hidden="true"
        >
          <span className="vw-giant block text-[27vw] font-black leading-none tracking-[-0.04em]">
            VICWAV
          </span>
        </div>

        {/* Cursor spotlight */}
        <div className="vw-spot pointer-events-none absolute inset-0" />

        <div className="vicwav-hero-glow pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-500/30 blur-[100px]" />

        <div className="vw-grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />

        <div className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-6 pb-6 pt-14 md:px-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="relative z-10">
            <div className="vw-fade mb-7 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>

              <span className="text-[10px] font-bold tracking-[0.25em] text-white/90 md:text-xs">
                THE NEW COLLECTION: 2026
              </span>
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.055em] md:text-7xl xl:text-[5.75rem]">
              <Words text="WEAR YOUR" base={200} />
              <br />

              <span className="vw-shine">
                <Words text="OWN STORY." base={520} />
              </span>
            </h1>

            <p
              className="vw-fade mt-8 max-w-lg text-sm leading-8 text-white/75 md:text-base"
              style={{ animationDelay: "1000ms" }}
            >
              Designed for individuality. Built for everyday life. Modern
              streetwear that moves with you and lets your personality speak.
            </p>

            <div
              className="vw-fade mt-10 flex flex-wrap items-center gap-4"
              style={{ animationDelay: "1200ms" }}
            >
              <Magnetic>
                <a
                  href="/shop"
                  className="vw-btn group inline-flex items-center gap-5 rounded-full bg-white px-8 py-4 text-xs font-bold tracking-[0.15em] text-[#07152e] shadow-xl shadow-black/30"
                >
                  <span>SHOP COLLECTION</span>

                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </a>
              </Magnetic>

              <Magnetic>
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-xs font-bold tracking-[0.15em] text-white backdrop-blur-sm transition hover:border-cyan-300 hover:bg-white/10"
                >
                  EXPLORE VICWAV
                  <ArrowUpRight size={16} />
                </a>
              </Magnetic>
            </div>
          </div>

          {/* Pop-out stage */}
          <div className="vw-stage relative mx-auto aspect-[4/5] w-full max-w-[540px] lg:max-w-[clamp(360px,calc((100svh_-_330px)*0.8),560px)]">
            {/* Frame */}
            <div
              className="vw-depth absolute inset-x-[9%] bottom-0 top-[25%]"
              style={{ "--d": "-8px" } as CSSProperties}
            >
              <div className="vw-arch h-full w-full overflow-hidden border border-cyan-200/30">
                <div className="vw-rings absolute left-1/2 top-[42%] aspect-square w-[130%]" />
              </div>
            </div>

            {/* Contact shadow */}
            <div className="vw-shadow absolute bottom-[3%] left-1/4 h-[5%] w-1/2 rounded-[50%] bg-black/70 blur-xl" />

            {/* Hoodie - floating animation removed */}
            <div
              className="vw-depth absolute inset-x-[5%] top-[2%] z-10"
              style={{ "--d": "26px" } as CSSProperties}
            >
              <div className="vw-popout">
                <div className="vw-levitate">
                  <img
                    src={img("hoodie-cutout")}
                    alt="Ivory VICWAV hoodie"
                    width={711}
                    height={891}
                    fetchPriority="high"
                    className="h-auto w-full drop-shadow-[0_35px_35px_rgba(0,0,0,0.45)]"
                  />
                </div>
              </div>
            </div>

            <div
              className="vw-depth absolute -left-2 top-[7%] z-20 w-[24%] md:-left-6"
              style={{ "--d": "48px" } as CSSProperties}
            >
              <div className="vw-popout" style={{ animationDelay: "1100ms" }}>
                <LookCard start={0} className="vw-bob -rotate-6" />
              </div>
            </div>

            <div
              className="vw-depth absolute -right-2 bottom-[7%] z-20 w-[27%] md:-right-6"
              style={{ "--d": "62px" } as CSSProperties}
            >
              <div className="vw-popout" style={{ animationDelay: "1350ms" }}>
                <LookCard start={1} className="vw-bob vw-bob-late rotate-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Lookbook filmstrip */}
        <div className="vw-strip relative overflow-hidden py-3">
          <div className="vw-ticker flex w-max">
            {[0, 1].map((copy) => (
              <div
                key={copy}
                className="flex gap-3 pr-3"
                aria-hidden={copy === 1}
              >
                {[...looks, ...looks].map((l, i) => (
                  <a
                    key={`${l.src}-${i}`}
                    href="/shop"
                    tabIndex={copy || i >= looks.length ? -1 : 0}
                    className="group relative block h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-white/15 md:h-32 md:w-28"
                  >
                    <img
                      src={l.src}
                      alt={l.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-125"
                    />
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-6 mb-5 mt-1 flex items-center justify-between border-t border-white/15 pt-5 text-[9px] font-semibold tracking-[0.2em] text-white/60 md:mx-12">
          <span>CONFIDENCE IN EVERY THREAD</span>

          <span className="flex items-center gap-2">
            SCROLL
            <span className="vw-scrollcue block h-4 w-px bg-white/60" />
          </span>

          <span className="hidden md:inline">VICWAV, EST. 2026</span>
        </div>
      </section>

      {/* ================= TICKER ================= */}
      <div
        className="overflow-hidden border-y border-black bg-black py-4 text-white"
        aria-hidden="true"
      >
        <div className="vw-ticker flex w-max gap-12 whitespace-nowrap text-xs font-bold tracking-[0.3em]">
          {[...ticker, ...ticker, ...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-12">
              {t}
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            </span>
          ))}
        </div>
      </div>

      {/* ================= CATEGORIES ================= */}
      <section id="categories" className="px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div
            data-reveal
            className="vw-reveal mb-12 flex items-end justify-between"
          >
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                EXPLORE
              </p>

              <h2 className="text-4xl font-black tracking-tight md:text-6xl">
                SHOP BY CATEGORY
              </h2>
            </div>

            <a
              href="/shop"
              className="vw-link hidden items-center gap-2 text-xs font-bold tracking-widest md:flex"
            >
              EXPLORE ALL
              <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {categories.map((c, i) => (
              <div
                key={c.name}
                data-reveal
                className="vw-reveal"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <Tilt className="group relative block h-[480px] overflow-hidden rounded-3xl bg-gray-100">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  <div className="vw-glare absolute inset-0" />

                  <div
                    className="absolute bottom-7 left-7 right-7 flex items-end justify-between text-white"
                    style={{ transform: "translateZ(40px)" }}
                  >
                    <div>
                      <p className="mb-1 text-[10px] tracking-[0.25em] text-white/70">
                        {c.count}
                      </p>

                      <h3 className="text-3xl font-black tracking-wide">
                        {c.name}
                      </h3>
                    </div>

                    <span className="grid h-12 w-12 place-items-center rounded-full bg-white text-black transition duration-500 group-hover:rotate-45 group-hover:bg-cyan-300">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                </Tilt>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRODUCTS ================= */}
      <section
        id="shop"
        className="bg-[#f4f6fa] px-5 py-20 md:px-10 md:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div
            data-reveal
            className="vw-reveal mb-12 flex items-end justify-between"
          >
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">
                CURATED FOR YOU
              </p>

              <h2 className="text-4xl font-black tracking-tight md:text-6xl">
                BESTSELLERS
              </h2>
            </div>

            <a
              href="/shop"
              className="vw-link hidden items-center gap-2 text-xs font-bold tracking-widest md:flex"
            >
              VIEW ALL
              <ArrowRight size={16} />
            </a>
          </div>

          {status === "error" && (
            <div
              role="alert"
              className="rounded-3xl bg-white px-6 py-16 text-center"
            >
              <p className="text-sm font-semibold">
                Products could not load.
              </p>

              <button
                onClick={() => {
                  setStatus("loading");
                  setAttempt((a) => a + 1);
                }}
                className="mt-5 rounded-full bg-[#07152e] px-7 py-3 text-xs font-bold tracking-widest text-white"
              >
                TRY AGAIN
              </button>
            </div>
          )}

          {status === "ready" && products.length === 0 && (
            <p className="rounded-3xl bg-white px-6 py-16 text-center text-sm">
              The next drop is on its way. Check back soon.
            </p>
          )}

          <div
            className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6"
            aria-busy={status === "loading"}
          >
            {status === "loading" &&
              Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] animate-pulse rounded-2xl bg-white"
                />
              ))}

            {status === "ready" &&
              products.map((p, i) => (
                <div
                  key={p.$id}
                  data-reveal
                  className="vw-reveal group"
                  style={{ transitionDelay: `${(i % 3) * 100}ms` }}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white">
                    <a
                      href={`/product/${p.$id}`}
                      aria-label={`View ${p.name}`}
                      className="block aspect-[4/5]"
                    >
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-semibold tracking-widest text-slate-400">
                          VICWAV
                        </div>
                      )}
                    </a>

                    {p.tag && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-widest backdrop-blur">
                        {p.tag}
                      </span>
                    )}

                    <button
                      onClick={() => toggleLike(p.$id)}
                      aria-label={`Save ${p.name} to wishlist`}
                      aria-pressed={liked.includes(p.$id)}
                      className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110"
                    >
                      <Heart
                        size={16}
                        className={`transition ${
                          liked.includes(p.$id)
                            ? "vw-pop fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => setCart((c) => c + 1)}
                      className="absolute bottom-3 left-3 right-3 flex translate-y-6 items-center justify-center gap-2 rounded-full bg-[#07152e] py-3 text-xs font-bold tracking-widest text-white opacity-0 transition duration-300 hover:bg-blue-600 focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100"
                    >
                      <Plus size={14} />
                      ADD TO BAG
                    </button>
                  </div>

                  <div className="mt-4 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] tracking-widest text-gray-500">
                        {categoryNames[p.category_id] || "VICWAV"}
                      </p>

                      <h3 className="vw-link mt-2 inline-block text-sm font-semibold">
                        {p.name}
                      </h3>
                    </div>

                    <p className="mt-6 text-sm font-bold">
                      ${Number(p.price).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
          </div>

          <a
            href="/shop"
            className="mt-10 flex w-full items-center justify-center gap-3 rounded-full border border-black py-4 text-xs font-bold tracking-widest transition hover:bg-black hover:text-white md:hidden"
          >
            VIEW ALL PRODUCTS
            <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ================= PHILOSOPHY ================= */}
      <section
        id="about"
        className="relative overflow-hidden bg-[#050d1c] text-white"
      >
        <div className="grid md:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-center px-6 py-20 md:px-16 md:py-32">
            <p
              data-reveal
              className="vw-reveal mb-5 text-xs tracking-[0.25em] text-cyan-300/80"
            >
              OUR PHILOSOPHY
            </p>

            <h2
              data-reveal
              className="vw-reveal text-[2.5rem] font-black leading-[1] tracking-tight md:text-6xl xl:text-7xl"
              style={{ transitionDelay: "100ms" }}
            >
              NOT JUST
              <br />
              CLOTHES.
              <br />
              <span className="vw-outline">A STATEMENT.</span>
            </h2>

            <p
              data-reveal
              className="vw-reveal mt-7 max-w-md text-sm leading-7 text-gray-400"
              style={{ transitionDelay: "200ms" }}
            >
              Fashion should be an expression of who you are. We create
              timeless pieces that give you confidence, comfort and freedom to
              define your own style.
            </p>

            <div
              data-reveal
              className="vw-reveal mt-12 grid max-w-md grid-cols-[1.5fr_1fr_1fr] gap-4 border-t border-white/10 pt-8"
              style={{ transitionDelay: "300ms" }}
            >
              {[
                { n: 12000, s: "+", l: "Happy customers" },
                { n: 150, s: "+", l: "Original designs" },
                { n: 98, s: "%", l: "Would reorder" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-2xl font-black tabular-nums md:text-3xl lg:text-4xl">
                    <CountUp to={s.n} suffix={s.s} />
                  </p>

                  <p className="mt-1 text-[11px] text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Collage */}
          <div className="grid grid-cols-2 items-center gap-4 px-5 py-16 md:gap-5 md:px-10">
            <div data-speed="-0.06">
              <figure
                data-reveal
                className="vw-reveal overflow-hidden rounded-3xl"
              >
                <img
                  src={img("monochrome-set")}
                  alt="Black and white VICWAV hoodie and joggers"
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition duration-700 hover:scale-110"
                />
              </figure>
            </div>

            <div data-speed="0.06" className="space-y-4 md:space-y-5">
              <div>
                <figure
                  data-reveal
                  className="vw-reveal overflow-hidden rounded-3xl"
                >
                  <img
                    src={img("embroidery-stack")}
                    alt="VICWAV logo embroidered on ivory, olive and black fabric"
                    loading="lazy"
                    className="aspect-[4/5] w-full object-cover transition duration-700 hover:scale-110"
                  />
                </figure>
              </div>

              <div>
                <figure
                  data-reveal
                  className="vw-reveal overflow-hidden rounded-3xl"
                >
                  <img
                    src={img("tees-stack")}
                    alt="Folded VICWAV T-shirts"
                    loading="lazy"
                    className="aspect-square w-full object-cover transition duration-700 hover:scale-110"
                  />
                </figure>
              </div>
            </div>
          </div>
        </div>

        {/* Lookbook */}
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-5 pb-20 md:grid-cols-4 md:gap-5 md:px-10 md:pb-28">
          {[
            { src: img("tracksuit-black"), label: "BLACK" },
            { src: img("tracksuit-olive"), label: "OLIVE" },
            { src: img("tracksuit-ivory"), label: "IVORY" },
            { src: img("hoodie-ivory"), label: "THE HOODIE" },
          ].map((l, i) => (
            <figure
              key={l.label}
              data-reveal
              className="vw-reveal group relative overflow-hidden rounded-3xl"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <img
                src={l.src}
                alt={`VICWAV ${l.label.toLowerCase()}`}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-110"
              />

              <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1.5 text-[10px] font-bold tracking-widest backdrop-blur">
                {l.label}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="bg-white px-5 py-20 md:px-10 md:py-28">
        <div
          data-reveal
          className="vw-reveal relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#07152e] px-6 py-16 text-center text-white md:px-16"
        >
          <div className="vicwav-hero-glow pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/40 blur-[90px]" />

          <h2 className="relative text-3xl font-black tracking-tight md:text-5xl">
            GET FIRST ACCESS TO EVERY DROP
          </h2>

          <p className="relative mx-auto mt-4 max-w-md text-sm text-white/65">
            Join the list for early releases and 10% off your first order.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              placeholder="Your email"
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-sm outline-none backdrop-blur placeholder:text-white/40 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/40"
            />

            <button className="vw-btn rounded-full bg-white px-7 py-4 text-xs font-bold tracking-widest text-[#07152e]">
              <span>JOIN NOW</span>
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

/* ---------- styles ---------- */

const css = `
.vicwav-hero-glow{animation:vw-glow 9s ease-in-out infinite alternate}
@keyframes vw-glow{to{transform:translate(60px,40px) scale(1.25);opacity:.7}}

.vw-mask{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em}
.vw-word{display:inline-block;transform:translateY(110%) rotate(4deg);animation:vw-word .9s cubic-bezier(.2,.8,.2,1) var(--delay,0ms) forwards}
@keyframes vw-word{to{transform:none}}

.vw-fade{opacity:0;transform:translateY(18px);animation:vw-fade .9s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:.1s}
@keyframes vw-fade{to{opacity:1;transform:none}}

.vw-shine .vw-word{background:linear-gradient(100deg,#fff 20%,#67e8f9 45%,#fff 70%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:vw-word .9s cubic-bezier(.2,.8,.2,1) var(--delay,0ms) forwards,vw-shine 5s linear infinite 1.6s}
@keyframes vw-shine{to{background-position:-250% 0}}

.vw-spot{background:radial-gradient(420px circle at var(--x,50%) var(--y,40%),rgba(103,232,249,.16),transparent 60%)}

.vw-grain{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

.vw-depth{transform:translate3d(calc(var(--px,0) * var(--d,0px)),calc(var(--py,0) * var(--d,0px) * .6),0);transition:transform .35s ease-out}

.vw-giant{color:transparent;background:linear-gradient(to bottom,rgba(255,255,255,.14),rgba(255,255,255,.01));-webkit-background-clip:text;background-clip:text}

.vw-stage{perspective:1000px}

.vw-arch{position:relative;border-radius:3rem;background:linear-gradient(to bottom,rgba(103,232,249,.38),rgba(37,99,235,.28) 55%,rgba(103,232,249,.14));box-shadow:0 0 90px rgba(59,130,246,.35),inset 0 0 60px rgba(103,232,249,.12)}

.vw-rings{transform:translate(-50%,-50%);border-radius:50%;background:repeating-radial-gradient(circle,transparent 0 34px,rgba(255,255,255,.09) 35px 36px);animation:vw-rings 6s ease-in-out infinite alternate}
@keyframes vw-rings{to{transform:translate(-50%,-50%) scale(1.12)}}

.vw-popout{animation:vw-popout 1.3s cubic-bezier(.2,1.45,.35,1) .5s both}
@keyframes vw-popout{from{opacity:0;transform:translateY(90px) scale(.55)}60%{opacity:1}to{opacity:1;transform:none}}

/* Hoodie stays still; cursor tilt is preserved. */
.vw-levitate{
  transform:rotateY(calc(var(--px,0) * 9deg)) rotateX(calc(var(--py,0) * -5deg));
  transition:transform .35s ease-out;
}

.vw-shadow{animation:vw-shadow 5s ease-in-out infinite}
@keyframes vw-shadow{50%{transform:scale(.78);opacity:.5}}

.vw-bob{animation:vw-bob 6s ease-in-out infinite}
.vw-bob-late{animation-delay:-3s}
@keyframes vw-bob{50%{translate:0 -12px}}

.vw-strip{mask-image:linear-gradient(to right,transparent,#000 8%,#000 92%,transparent)}
.vw-strip:hover .vw-ticker{animation-play-state:paused}

.vw-scrollcue{animation:vw-cue 1.6s ease-in-out infinite;transform-origin:top}
@keyframes vw-cue{0%{transform:scaleY(0)}50%{transform:scaleY(1)}100%{transform:scaleY(0);transform-origin:bottom}}

.vw-ticker{animation:vw-ticker 38s linear infinite}
.vw-strip .vw-ticker{animation-duration:60s}
@keyframes vw-ticker{to{transform:translateX(-50%)}}

.vw-reveal{opacity:0;transform:translateY(40px);transition:opacity .9s cubic-bezier(.2,.8,.2,1),transform .9s cubic-bezier(.2,.8,.2,1)}
.vw-reveal.vw-in{opacity:1;transform:none}

.vw-tilt{transform-style:preserve-3d;transform:perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .25s ease-out}

.vw-glare{background:radial-gradient(300px circle at var(--mx,50%) var(--my,50%),rgba(255,255,255,.28),transparent 60%);opacity:0;transition:opacity .3s}
.vw-tilt:hover .vw-glare{opacity:1}

.vw-btn{position:relative;overflow:hidden;isolation:isolate}
.vw-btn::before{content:"";position:absolute;inset:0;z-index:-1;background:#67e8f9;transform:translateY(101%);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.vw-btn:hover::before{transform:none}

.vw-link{background:linear-gradient(currentColor,currentColor) 0 100%/0 1.5px no-repeat;transition:background-size .4s}
.vw-link:hover{background-size:100% 1.5px}

.vw-outline{color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.85)}

.vw-pop{display:inline-block;animation:vw-pop .45s cubic-bezier(.3,1.8,.5,1)}
@keyframes vw-pop{from{transform:scale(.4)}to{transform:scale(1)}}

a:focus-visible,button:focus-visible{outline:2px solid #22d3ee;outline-offset:3px}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .vw-word,.vw-fade,.vw-reveal,.vw-popout{opacity:1!important;transform:none!important}
  .vw-depth,.vw-levitate{transform:none!important}
}
`;

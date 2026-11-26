"use client";
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { useEffect, useRef, useState, type ReactNode, type MouseEvent } from "react";
import { ArrowRight, ArrowUpRight, Heart, Plus, ShoppingBag } from "lucide-react";

const u = (id: string, w = 900) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;

const products = [
  { name: "Classic Track Set", price: "$45.00", category: "TRACKSUITS", img: u("photo-1551488831-00ddcb6c6bd3"), tag: "BESTSELLER" },
  { name: "Essential Hoodie", price: "$38.00", category: "HOODIES", img: u("photo-1556821840-3a63f95609a7"), tag: "NEW" },
  { name: "Urban Cargo", price: "$42.00", category: "PANTS", img: u("photo-1515886657613-9f3515b0c78f"), tag: "" },
  { name: "Everyday Tee", price: "$22.00", category: "T-SHIRTS", img: u("photo-1521572163474-6864f9cf17ab"), tag: "POPULAR" },
];

const categories = [
  { name: "TOPS", count: "48 pieces", img: u("photo-1521572163474-6864f9cf17ab") },
  { name: "BOTTOMS", count: "32 pieces", img: u("photo-1515886657613-9f3515b0c78f") },
  { name: "OUTERWEAR", count: "21 pieces", img: u("photo-1551028719-00167b16eac5") },
];

const heroImages = [
  ["photo-1523398002811-999ca8dec234", "photo-1551488831-00ddcb6c6bd3", "photo-1515886657613-9f3515b0c78f", "photo-1529139574466-a303027c1d8b"],
  ["photo-1556821840-3a63f95609a7", "photo-1521572163474-6864f9cf17ab", "photo-1551028719-00167b16eac5", "photo-1525507119028-ed4c629a60a3"],
  ["photo-1483985988355-763728e1935b", "photo-1503342217505-b0a15ec3261c", "photo-1529139574466-a303027c1d8b", "photo-1515886657613-9f3515b0c78f"],
];

const ticker = ["FREE SHIPPING OVER $75", "NEW DROP EVERY FRIDAY", "30-DAY RETURNS", "MADE FOR EVERYDAY", "WEAR YOUR OWN STORY"];

/* ---------- helpers ---------- */

function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const move = (e: MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * strength}px, ${(e.clientY - r.top - r.height / 2) * strength}px)`;
  };
  const reset = () => ref.current && (ref.current.style.transform = "");
  return (
    <span ref={ref} onMouseMove={move} onMouseLeave={reset} className="inline-block transition-transform duration-200 ease-out">
      {children}
    </span>
  );
}

function Tilt({ children, className = "", href = "/shop" }: { children: ReactNode; className?: string; href?: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: MouseEvent) => {
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
    <a ref={ref} href={href} onMouseMove={move} onMouseLeave={reset} className={`vw-tilt ${className}`}>
      {children}
    </a>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
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
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
}

function Words({ text, base = 0 }: { text: string; base?: number }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="vw-mask">
          <span className="vw-word" style={{ animationDelay: `${base + i * 110}ms` }}>{w}&nbsp;</span>
        </span>
      ))}
    </>
  );
}

/* ---------- page ---------- */

export default function Home() {
  const bar = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const parallax = useRef<HTMLImageElement>(null);
  const [cart, setCart] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);

  useEffect(() => {
    // scroll reveal
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && (e.target.classList.add("vw-in"), io.unobserve(e.target))),
      { threshold: 0.15 }
    );
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));

    // progress bar + parallax
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (parallax.current) {
        const r = parallax.current.parentElement!.getBoundingClientRect();
        parallax.current.style.transform = `translateY(${(r.top - window.innerHeight / 2) * -0.12}px) scale(1.15)`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const heroMove = (e: MouseEvent) => {
    const el = heroRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - r.left}px`);
    el.style.setProperty("--y", `${e.clientY - r.top}px`);
  };

  const toggleLike = (n: string) => setLiked((l) => (l.includes(n) ? l.filter((x) => x !== n) : [...l, n]));

  return (
    <main className="min-h-screen bg-white text-black">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* scroll progress */}
      <div className="fixed left-0 top-0 z-[60] h-[3px] w-full bg-transparent">
        <div ref={bar} className="h-full origin-left scale-x-0 bg-gradient-to-r from-cyan-300 via-blue-500 to-white" />
      </div>

      {/* floating cart */}
      <button
        aria-label={`Cart, ${cart} items`}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full border border-white/20 bg-[#07152e]/80 px-5 py-3 text-xs font-bold tracking-widest text-white shadow-2xl backdrop-blur-xl transition hover:scale-105"
      >
        <ShoppingBag size={16} />
        <span key={cart} className="vw-pop tabular-nums">{cart}</span>
      </button>

      {/* ================= HERO ================= */}
      <section
        ref={heroRef}
        onMouseMove={heroMove}
        className="relative isolate min-h-[720px] overflow-hidden bg-[#07152e] text-white md:min-h-[820px]"
      >
        <div className="absolute inset-0 grid grid-cols-3 gap-3 overflow-hidden px-2 opacity-70 md:gap-5 md:px-5">
          {heroImages.map((column, index) => (
            <div key={index} className={`vicwav-marquee-track ${index === 1 ? "vicwav-scroll-down" : "vicwav-scroll-up"}`}>
              {[0, 1].map((copy) => (
                <div key={copy} className="vicwav-marquee-group">
                  {column.map((photo, i) => (
                    <div key={`${copy}-${i}`} className="group relative overflow-hidden rounded-2xl">
                      <img
                        src={u(photo, 700)}
                        alt=""
                        aria-hidden="true"
                        className="h-[260px] w-full object-cover transition duration-1000 group-hover:scale-110 md:h-[360px]"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-[#07152e]/95 via-[#07152e]/65 to-[#07152e]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07152e] via-transparent to-[#07152e]/30" />
        {/* cursor spotlight */}
        <div className="vw-spot pointer-events-none absolute inset-0" />
        <div className="vicwav-hero-glow pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-blue-500/30 blur-[100px]" />
        <div className="vw-grain pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay" />

        <div className="relative mx-auto flex min-h-[720px] max-w-7xl flex-col justify-center px-6 py-24 md:min-h-[820px] md:px-12">
          <div className="max-w-4xl">
            <div className="vw-fade mb-7 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-5 py-3 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-white/90 md:text-xs">THE NEW COLLECTION: 2026</span>
            </div>

            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.055em] md:text-7xl lg:text-[8.5rem]">
              <Words text="WEAR YOUR" base={200} />
              <br />
              <span className="vw-shine">
                <Words text="OWN STORY." base={520} />
              </span>
            </h1>

            <p className="vw-fade mt-8 max-w-lg text-sm leading-8 text-white/75 md:text-base" style={{ animationDelay: "1000ms" }}>
              Designed for individuality. Built for everyday life. Modern streetwear that moves with you and lets your personality speak.
            </p>

            <div className="vw-fade mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: "1200ms" }}>
              <Magnetic>
                <a
                  href="/shop"
                  className="vw-btn group inline-flex items-center gap-5 rounded-full bg-white px-8 py-4 text-xs font-bold tracking-[0.15em] text-[#07152e] shadow-xl shadow-black/30"
                >
                  <span>SHOP COLLECTION</span>
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 text-xs font-bold tracking-[0.15em] text-white backdrop-blur-sm transition hover:border-cyan-300 hover:bg-white/10"
                >
                  EXPLORE VICWAV <ArrowUpRight size={16} />
                </a>
              </Magnetic>
            </div>
          </div>

          {/* floating product chip */}
          <div className="vw-float absolute right-6 top-1/2 hidden w-60 -translate-y-1/2 rounded-3xl border border-white/20 bg-white/10 p-3 backdrop-blur-xl lg:block xl:right-12">
            <img src={products[0].img} alt="" className="h-52 w-full rounded-2xl object-cover" />
            <div className="flex items-center justify-between px-2 pb-1 pt-3">
              <div>
                <p className="text-[10px] tracking-widest text-white/60">TRENDING NOW</p>
                <p className="text-sm font-semibold">{products[0].name}</p>
              </div>
              <span className="text-sm font-bold">{products[0].price}</span>
            </div>
          </div>

          <div className="absolute bottom-8 left-6 right-6 flex items-center justify-between border-t border-white/15 pt-5 text-[9px] font-semibold tracking-[0.2em] text-white/60 md:left-12 md:right-12">
            <span>CONFIDENCE IN EVERY THREAD</span>
            <span className="flex items-center gap-2">
              SCROLL <span className="vw-scrollcue block h-4 w-px bg-white/60" />
            </span>
            <span className="hidden md:inline">VICWAV, EST. 2026</span>
          </div>
        </div>
      </section>

      {/* ================= TICKER ================= */}
      <div className="overflow-hidden border-y border-black bg-black py-4 text-white" aria-hidden="true">
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
          <div data-reveal className="vw-reveal mb-12 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">EXPLORE</p>
              <h2 className="text-4xl font-black tracking-tight md:text-6xl">SHOP BY CATEGORY</h2>
            </div>
            <a href="/shop" className="vw-link hidden items-center gap-2 text-xs font-bold tracking-widest md:flex">
              EXPLORE ALL <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {categories.map((c, i) => (
              <div key={c.name} data-reveal className="vw-reveal" style={{ transitionDelay: `${i * 120}ms` }}>
                <Tilt className="group relative block h-[480px] overflow-hidden rounded-3xl bg-gray-100">
                  <img src={c.img} alt={c.name} className="h-full w-full scale-105 object-cover transition duration-700 group-hover:scale-125" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="vw-glare absolute inset-0" />
                  <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between text-white" style={{ transform: "translateZ(40px)" }}>
                    <div>
                      <p className="mb-1 text-[10px] tracking-[0.25em] text-white/70">{c.count}</p>
                      <h3 className="text-3xl font-black tracking-wide">{c.name}</h3>
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
      <section id="shop" className="bg-[#f4f6fa] px-5 py-20 md:px-10 md:py-28">
        <div className="mx-auto max-w-7xl">
          <div data-reveal className="vw-reveal mb-12 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs tracking-[0.2em] text-gray-500">CURATED FOR YOU</p>
              <h2 className="text-4xl font-black tracking-tight md:text-6xl">BESTSELLERS</h2>
            </div>
            <a href="/shop" className="vw-link hidden items-center gap-2 text-xs font-bold tracking-widest md:flex">
              VIEW ALL <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {products.map((p, i) => (
              <div key={p.name} data-reveal className="vw-reveal group" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="relative overflow-hidden rounded-2xl bg-white">
                  <a href="/shop" aria-label={p.name}>
                    <img
                      src={p.img}
                      alt={p.name}
                      className="h-[280px] w-full object-cover transition duration-700 group-hover:scale-110 md:h-[430px]"
                    />
                  </a>

                  {p.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold tracking-widest backdrop-blur">
                      {p.tag}
                    </span>
                  )}

                  <button
                    onClick={() => toggleLike(p.name)}
                    aria-label="Save to wishlist"
                    aria-pressed={liked.includes(p.name)}
                    className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition hover:scale-110"
                  >
                    <Heart
                      size={16}
                      className={`transition ${liked.includes(p.name) ? "vw-pop fill-red-500 text-red-500" : ""}`}
                    />
                  </button>

                  <button
                    onClick={() => setCart((c) => c + 1)}
                    className="absolute bottom-3 left-3 right-3 flex translate-y-6 items-center justify-center gap-2 rounded-full bg-[#07152e] py-3 text-xs font-bold tracking-widest text-white opacity-0 transition duration-300 hover:bg-blue-600 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100"
                  >
                    <Plus size={14} /> ADD TO BAG
                  </button>
                </div>

                <div className="mt-4 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] tracking-widest text-gray-500">{p.category}</p>
                    <h3 className="vw-link mt-2 inline-block text-sm font-semibold">{p.name}</h3>
                  </div>
                  <p className="mt-6 text-sm font-bold">{p.price}</p>
                </div>
              </div>
            ))}
          </div>

          <a
            href="/shop"
            className="mt-10 flex w-full items-center justify-center gap-3 rounded-full border border-black py-4 text-xs font-bold tracking-widest transition hover:bg-black hover:text-white md:hidden"
          >
            VIEW ALL PRODUCTS <ArrowRight size={16} />
          </a>
        </div>
      </section>

      {/* ================= PHILOSOPHY ================= */}
      <section id="about" className="relative overflow-hidden bg-[#050d1c] text-white">
        <div className="grid md:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-center px-6 py-20 md:px-16 md:py-32">
            <p data-reveal className="vw-reveal mb-5 text-xs tracking-[0.25em] text-cyan-300/80">OUR PHILOSOPHY</p>
            <h2 data-reveal className="vw-reveal text-5xl font-black leading-[1] tracking-tight md:text-7xl" style={{ transitionDelay: "100ms" }}>
              NOT JUST
              <br />
              CLOTHES.
              <br />
              <span className="vw-outline">A STATEMENT.</span>
            </h2>
            <p data-reveal className="vw-reveal mt-7 max-w-md text-sm leading-7 text-gray-400" style={{ transitionDelay: "200ms" }}>
              Fashion should be an expression of who you are. We create timeless pieces that give you confidence, comfort and freedom to define your own style.
            </p>

            <div data-reveal className="vw-reveal mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8" style={{ transitionDelay: "300ms" }}>
              {[
                { n: 12000, s: "+", l: "Happy customers" },
                { n: 150, s: "+", l: "Original designs" },
                { n: 98, s: "%", l: "Would reorder" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="text-3xl font-black md:text-4xl"><CountUp to={s.n} suffix={s.s} /></p>
                  <p className="mt-1 text-[11px] text-gray-500">{s.l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden md:min-h-full">
            <img
              ref={parallax}
              src={u("photo-1529139574466-a303027c1d8b", 1200)}
              alt="Model wearing VICWAV streetwear"
              className="absolute inset-0 h-full w-full object-cover will-change-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050d1c] via-[#050d1c]/30 to-transparent" />
          </div>
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="bg-white px-5 py-20 md:px-10 md:py-28">
        <div
          data-reveal
          className="vw-reveal relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#07152e] px-6 py-16 text-center text-white md:px-16"
        >
          <div className="vicwav-hero-glow pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/40 blur-[90px]" />
          <h2 className="relative text-3xl font-black tracking-tight md:text-5xl">GET FIRST ACCESS TO EVERY DROP</h2>
          <p className="relative mx-auto mt-4 max-w-md text-sm text-white/65">Join the list for early releases and 10% off your first order.</p>
          <form onSubmit={(e) => e.preventDefault()} className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
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

/* ---------- styles (move to globals.css if you prefer) ---------- */

const css = `
.vicwav-marquee-track{display:flex;flex-direction:column;gap:12px;will-change:transform}
.vicwav-marquee-group{display:flex;flex-direction:column;gap:12px}
.vicwav-scroll-up{animation:vw-up 42s linear infinite}
.vicwav-scroll-down{animation:vw-down 48s linear infinite}
@keyframes vw-up{to{transform:translateY(calc(-50% - 6px))}}
@keyframes vw-down{from{transform:translateY(calc(-50% - 6px))}to{transform:translateY(0)}}
.vicwav-hero-glow{animation:vw-glow 9s ease-in-out infinite alternate}
@keyframes vw-glow{to{transform:translate(60px,40px) scale(1.25);opacity:.7}}

.vw-mask{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.08em}
.vw-word{display:inline-block;transform:translateY(110%) rotate(4deg);animation:vw-word .9s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes vw-word{to{transform:none}}
.vw-fade{opacity:0;transform:translateY(18px);animation:vw-fade .9s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:.1s}
@keyframes vw-fade{to{opacity:1;transform:none}}

.vw-shine{background:linear-gradient(100deg,#fff 20%,#67e8f9 45%,#fff 70%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:vw-shine 5s linear infinite 1.6s}
.vw-shine .vw-word{color:transparent}
@keyframes vw-shine{to{background-position:-250% 0}}

.vw-spot{background:radial-gradient(420px circle at var(--x,50%) var(--y,40%),rgba(103,232,249,.16),transparent 60%)}
.vw-grain{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.vw-float{animation:vw-float 6s ease-in-out infinite}
@keyframes vw-float{50%{transform:translateY(calc(-50% - 14px)) rotate(1.5deg)}}
.vw-scrollcue{animation:vw-cue 1.6s ease-in-out infinite;transform-origin:top}
@keyframes vw-cue{0%{transform:scaleY(0)}50%{transform:scaleY(1)}100%{transform:scaleY(0);transform-origin:bottom}}

.vw-ticker{animation:vw-ticker 38s linear infinite}
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
  .vw-word,.vw-fade,.vw-reveal{opacity:1!important;transform:none!important}
}
`;
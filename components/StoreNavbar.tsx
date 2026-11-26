"use client";
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  ShoppingBag,
  UserRound,
  Package,
  Settings,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Search,
  Truck,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";
import { Models } from "appwrite";
import { account } from "@/lib/appwrite";

const trust = [
  { icon: Truck, text: "Fast & Reliable Delivery" },
  { icon: BadgeCheck, text: "Premium Quality" },
  { icon: ShoppingBag, text: "Shop with Confidence" },
];

const shopLinks = [
  { label: "All Products", sub: "The full collection", href: "/shop" },
  { label: "Tracksuits", sub: "Matching sets and jackets", href: "/shop" },
  { label: "T-Shirts", sub: "Everyday essentials", href: "/shop" },
];

const quickSearches = ["Tracksuit", "T-Shirt", "Hoodie", "Cargo"];

export default function StoreNavbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [shopMenu, setShopMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [tick, setTick] = useState(0);

  const userRef = useRef<HTMLDivElement>(null);
  const shopRef = useRef<HTMLDivElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  /* ---------- user + admin (unchanged logic) ---------- */
  useEffect(() => {
    let active = true;
    async function loadUser() {
      try {
        const currentUser = await account.get();
        if (!active) return;
        setUser(currentUser);

        const session = await account.createJWT();
        const response = await fetch("/api/admin/access", {
          headers: { Authorization: `Bearer ${session.jwt}` },
          cache: "no-store",
        });
        if (!active) return;
        if (response.ok) {
          const result = await response.json();
          setIsAdmin(result.isAdmin === true);
        }
      } catch {
        if (active) {
          setUser(null);
          setIsAdmin(false);
        }
      }
    }
    loadUser();
    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await account.deleteSession({ sessionId: "current" });
      window.location.href = "/";
    } catch {
      setLoggingOut(false);
    }
  }

  /* ---------- cart badge ---------- */
  const readCart = useCallback(() => {
    try {
      const raw = localStorage.getItem("clothing-cart");
      const parsed = raw ? JSON.parse(raw) : [];
      setCartCount(Array.isArray(parsed) ? parsed.reduce((n: number, i: { quantity?: number }) => n + Number(i.quantity || 1), 0) : 0);
    } catch {
      setCartCount(0);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    readCart();
    const id = window.setInterval(readCart, 1500); // catches same-tab updates
    window.addEventListener("storage", readCart);
    window.addEventListener("focus", readCart);
    window.addEventListener("cart-updated", readCart);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("storage", readCart);
      window.removeEventListener("focus", readCart);
      window.removeEventListener("cart-updated", readCart);
    };
  }, [readCart, pathname]);

  // bump animation whenever the count changes
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setTick((t) => t + 1), [cartCount]);

  /* ---------- scroll, outside click, escape, scroll-lock ---------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
      if (shopRef.current && !shopRef.current.contains(e.target as Node)) setShopMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setUserMenu(false);
        setShopMenu(false);
        setSearchOpen(false);
        setMobileOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    if (searchOpen) window.setTimeout(() => searchInput.current?.focus(), 60);
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

  // close everything when the route changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUserMenu(false);
    setShopMenu(false);
    setMobileOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const closeMenus = () => {
    setUserMenu(false);
    setShopMenu(false);
    setMobileOpen(false);
  };

  function submitSearch(e?: FormEvent, term?: string) {
    e?.preventDefault();
    const q = (term ?? query).trim();
    setSearchOpen(false);
    setQuery("");
    router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
  }

  const isHome = pathname === "/";
  const isShop = pathname.startsWith("/shop") || pathname.startsWith("/product");

  const pill = (active: boolean) =>
    `relative rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
      active
        ? "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-600/30"
        : "text-[#0b1e42] hover:bg-blue-50 hover:text-blue-700"
    }`;

  const initials = (user?.name || user?.email || "V")
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* ===== trust bar ===== */}
      <div
        className={`overflow-hidden bg-gradient-to-r from-[#0a2a8f] via-[#1347d1] to-[#0a2a8f] text-white transition-all duration-500 ${
          scrolled ? "max-h-0" : "max-h-12"
        }`}
      >
        <div className="mx-auto hidden max-w-7xl items-stretch justify-around px-5 py-2.5 sm:flex">
          {trust.map(({ icon: Icon, text }, i) => (
            <div key={text} className="flex flex-1 items-center justify-center gap-2.5 text-xs font-semibold tracking-wide">
              <Icon size={16} className="text-cyan-300" />
              {text}
              {i < trust.length - 1 && <span className="ml-auto h-5 w-px bg-white/25" />}
            </div>
          ))}
        </div>
        {/* mobile: rotating message */}
        <div className="relative h-9 sm:hidden">
          {trust.map(({ icon: Icon, text }, i) => (
            <div key={text} className="vwn-rotate absolute inset-0 flex items-center justify-center gap-2 text-[11px] font-semibold tracking-wide" style={{ animationDelay: `${i * 3}s` }}>
              <Icon size={14} className="text-cyan-300" />
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ===== main nav ===== */}
      <nav className={`relative border-b bg-white/90 backdrop-blur-2xl transition-shadow duration-300 ${scrolled ? "border-slate-200 shadow-[0_10px_40px_-15px_rgba(7,21,46,0.3)]" : "border-transparent"}`}>
        {/* brand swoosh, top-right (echoes the mockup) */}
        <svg aria-hidden="true" className="pointer-events-none absolute right-0 top-0 hidden h-full w-[34%] md:block" viewBox="0 0 400 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="vwn-sw" x1="0" x2="1">
              <stop offset="0" stopColor="#2563eb" stopOpacity="0" />
              <stop offset="1" stopColor="#1d4ed8" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <path d="M120 80 C 230 78 300 40 400 10 L400 0 L 360 0 C 300 30 230 62 120 80 Z" fill="url(#vwn-sw)" />
        </svg>

        <div className={`relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 transition-all duration-300 md:px-8 ${scrolled ? "h-[68px]" : "h-[84px]"}`}>
          {/* logo */}
          <Link href="/" onClick={closeMenus} aria-label="VICWAV home" className="shrink-0">
            <img
              src="/logo.png"
              alt="VICWAV"
              width={763}
              height={423}
              className={`w-auto transition-all duration-300 ${scrolled ? "h-[46px]" : "h-[58px]"}`}
            />
          </Link>

          {/* desktop links */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <Link href="/" className={pill(isHome)} aria-current={isHome ? "page" : undefined}>
              Home
            </Link>

            <div ref={shopRef} className="relative" onMouseEnter={() => setShopMenu(true)} onMouseLeave={() => setShopMenu(false)}>
              <button type="button" onClick={() => setShopMenu(!shopMenu)} aria-expanded={shopMenu} aria-haspopup="menu" className={`${pill(isShop)} flex items-center gap-1.5`}>
                Shop
                <ChevronDown size={14} className={`transition ${shopMenu ? "rotate-180" : ""}`} />
              </button>

              <div className={`absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 transition-all duration-200 ${shopMenu ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-blue-950/15">
                  {shopLinks.map((l) => (
                    <Link key={l.label} href={l.href} onClick={closeMenus} className="group flex items-center justify-between rounded-xl px-4 py-3 transition hover:bg-blue-50">
                      <span>
                        <span className="block text-sm font-bold text-[#0b1e42]">{l.label}</span>
                        <span className="block text-xs text-slate-500">{l.sub}</span>
                      </span>
                      <ArrowRight size={15} className="-translate-x-1 text-blue-600 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link href="/#about" className={pill(false)}>
              About Us
            </Link>
            <Link href="/contact" className={pill(pathname === "/contact")}>
              Contact Us
            </Link>
          </div>

          {/* actions */}
          <div className="relative flex items-center gap-1.5 sm:gap-2">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search" className="grid h-11 w-11 place-items-center rounded-full text-[#0b1e42] transition hover:bg-blue-50 hover:text-blue-700">
              <Search size={21} />
            </button>

            {/* account */}
            {user ? (
              <div ref={userRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setUserMenu(!userMenu)}
                  aria-expanded={userMenu}
                  aria-label="Account menu"
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition hover:bg-blue-50"
                >
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blue-500 to-[#0b1e42] text-xs font-black text-white ring-2 ring-white">{initials}</span>
                  <ChevronDown size={14} className={`text-slate-500 transition ${userMenu ? "rotate-180" : ""}`} />
                </button>

                <div className={`absolute right-0 top-full w-80 pt-3 transition-all duration-200 ${userMenu ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"}`}>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-blue-950/20">
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#07152e] to-[#0a2a8f] p-5 text-white">
                      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-400/20 blur-2xl" />
                      <div className="relative flex items-center gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-sm font-black text-cyan-300 ring-1 ring-white/20">{initials}</span>
                        <div className="min-w-0">
                          <p className="truncate font-bold">{user.name || "Customer"}</p>
                          <p className="truncate text-xs text-blue-200">{user.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      {[
                        { href: "/account", icon: UserRound, label: "My Account" },
                        { href: "/account/orders", icon: Package, label: "My Orders" },
                        { href: "/account/settings", icon: Settings, label: "Settings" },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link key={href} href={href} onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
                          <Icon size={17} />
                          {label}
                        </Link>
                      ))}

                      {isAdmin && (
                        <Link href="/admin" onClick={closeMenus} className="flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50">
                          <LayoutDashboard size={17} />
                          Admin Dashboard
                          <ShieldCheck size={15} className="ml-auto" />
                        </Link>
                      )}

                      <div className="my-2 border-t border-slate-100" />

                      <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">
                        <LogOut size={17} />
                        {loggingOut ? "Signing out..." : "Sign Out"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-1 sm:flex">
                <Link href="/login" aria-label="Sign in" className="grid h-11 w-11 place-items-center rounded-full text-[#0b1e42] transition hover:bg-blue-50 hover:text-blue-700 xl:hidden">
                  <UserRound size={21} />
                </Link>
                <Link href="/login" className="hidden px-3 py-2 text-sm font-semibold text-[#0b1e42] transition hover:text-blue-700 xl:block">
                  Sign In
                </Link>
                <Link href="/register" className="hidden rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 xl:block">
                  Create Account
                </Link>
              </div>
            )}

            {/* cart */}
            <Link href="/cart" aria-label={`Shopping cart, ${cartCount} items`} className="relative grid h-11 w-11 place-items-center rounded-full text-[#0b1e42] transition hover:bg-blue-50 hover:text-blue-700">
              <ShoppingBag size={21} />
              <span
                key={tick}
                className={`vwn-pop absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-black text-white ring-2 ring-white ${cartCount ? "bg-blue-600" : "bg-slate-400"}`}
              >
                {cartCount}
              </span>
            </Link>

            <button type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} className="grid h-11 w-11 place-items-center rounded-full bg-[#0b1e42] text-white transition hover:bg-blue-700 lg:hidden">
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* brand line */}
        <div className={`h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent transition-opacity duration-300 ${scrolled ? "opacity-100" : "opacity-0"}`} />
      </nav>

      {/* ===== mobile panel ===== */}
      <div className={`fixed inset-x-0 bottom-0 top-0 z-[-1] bg-white pt-[140px] transition-all duration-500 lg:hidden ${mobileOpen ? "visible opacity-100" : "invisible opacity-0"}`}>
        <div className="h-full overflow-y-auto px-5 pb-10 pt-6">
          <form onSubmit={submitSearch} className="mb-6 flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-5 py-3.5">
            <Search size={18} className="text-blue-600" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search VICWAV" aria-label="Search" className="w-full bg-transparent text-sm outline-none" />
          </form>

          <ul className="space-y-1">
            {[
              { href: "/", label: "Home" },
              { href: "/shop", label: "Shop" },
              { href: "/#categories", label: "Collections" },
              { href: "/#about", label: "About Us" },
              { href: "/contact", label: "Contact Us" },
            ].map((l, i) => (
              <li key={l.label} className={mobileOpen ? "vwn-slide" : ""} style={{ animationDelay: `${i * 60}ms` }}>
                <Link href={l.href} onClick={closeMenus} className="flex items-center justify-between rounded-2xl px-4 py-4 text-2xl font-black tracking-tight text-[#0b1e42] transition hover:bg-blue-50">
                  {l.label}
                  <ArrowRight size={20} className="text-blue-600" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="my-6 border-t border-slate-200" />

          {user ? (
            <>
              <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#07152e] to-[#0a2a8f] p-4 text-white">
                <span className="grid h-12 w-12 place-items-center rounded-full bg-white/15 text-sm font-black text-cyan-300">{initials}</span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{user.name || "Customer"}</p>
                  <p className="truncate text-xs text-blue-200">{user.email}</p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {[
                  { href: "/account", icon: UserRound, label: "Account" },
                  { href: "/account/orders", icon: Package, label: "Orders" },
                  { href: "/account/settings", icon: Settings, label: "Settings" },
                  ...(isAdmin ? [{ href: "/admin", icon: LayoutDashboard, label: "Admin" }] : []),
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href} onClick={closeMenus} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-semibold text-[#0b1e42] transition hover:bg-blue-50">
                    <Icon size={17} className="text-blue-600" />
                    {label}
                  </Link>
                ))}
                <button type="button" onClick={handleLogout} disabled={loggingOut} className="flex items-center gap-3 rounded-2xl border border-red-100 px-4 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50">
                  <LogOut size={17} />
                  {loggingOut ? "Signing out..." : "Sign Out"}
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/login" onClick={closeMenus} className="rounded-full border border-slate-300 px-4 py-4 text-center text-sm font-bold text-[#0b1e42]">
                Sign In
              </Link>
              <Link href="/register" onClick={closeMenus} className="rounded-full bg-gradient-to-b from-blue-500 to-blue-700 px-4 py-4 text-center text-sm font-bold text-white shadow-lg shadow-blue-600/30">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ===== search overlay ===== */}
      <div className={`fixed inset-0 z-[70] transition-all duration-300 ${searchOpen ? "visible opacity-100" : "invisible opacity-0"}`} role="dialog" aria-label="Search" aria-hidden={!searchOpen}>
        <div onClick={() => setSearchOpen(false)} className="absolute inset-0 bg-[#07152e]/70 backdrop-blur-md" />
        <div className={`relative mx-auto mt-[12vh] w-[92%] max-w-2xl transition-transform duration-300 ${searchOpen ? "translate-y-0" : "-translate-y-6"}`}>
          <form onSubmit={submitSearch} className="flex items-center gap-4 rounded-3xl bg-white px-6 py-5 shadow-2xl">
            <Search size={22} className="shrink-0 text-blue-600" />
            <input ref={searchInput} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search tracksuits, t-shirts, hoodies" aria-label="Search products" className="w-full bg-transparent text-lg outline-none placeholder:text-slate-400" />
            <kbd className="hidden rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold text-slate-400 sm:block">ESC</kbd>
          </form>

          <div className="mt-4 rounded-3xl bg-white/95 p-6 shadow-2xl backdrop-blur">
            <p className="mb-3 text-[11px] font-bold tracking-[0.2em] text-slate-500">POPULAR SEARCHES</p>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((s) => (
                <button key={s} type="button" onClick={() => submitSearch(undefined, s)} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-[#0b1e42] transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700">
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .vwn-pop{animation:vwnPop .45s cubic-bezier(.3,1.8,.5,1)}
        @keyframes vwnPop{from{transform:scale(.4)}to{transform:scale(1)}}
        .vwn-rotate{opacity:0;animation:vwnRot 9s infinite}
        @keyframes vwnRot{0%{opacity:0;transform:translateY(8px)}6%,30%{opacity:1;transform:none}36%,100%{opacity:0;transform:translateY(-8px)}}
        .vwn-slide{opacity:0;animation:vwnSlide .5s cubic-bezier(.2,.8,.2,1) forwards}
        @keyframes vwnSlide{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:none}}
        header a:focus-visible,header button:focus-visible{outline:2px solid #22d3ee;outline-offset:2px}
        @media (prefers-reduced-motion:reduce){.vwn-rotate{animation:none;opacity:1}.vwn-rotate:not(:first-child){display:none}*{transition-duration:.01ms!important}}
      ` }} />
    </header>
  );
}
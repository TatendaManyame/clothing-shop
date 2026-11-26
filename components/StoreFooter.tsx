/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ArrowUpRight, Gem, Shirt, ThumbsUp, Headset, Music2, Mail, MapPin } from "lucide-react";

const perks = [
  { icon: Gem, title: "Premium Quality", text: "Fabrics built to last" },
  { icon: Shirt, title: "Trendy Designs", text: "Fresh drops all season" },
  { icon: ThumbsUp, title: "Affordable Prices", text: "Style without the stretch" },
  { icon: Headset, title: "Dedicated Support", text: "Real people, real help" },
];

const columns = [
  {
    title: "Shop",
    links: [
      { label: "Shop All", href: "/shop" },
      { label: "Tracksuits", href: "/shop" },
      { label: "T-Shirts", href: "/shop" },
      { label: "Collections", href: "/#categories" },
    ],
  },
  {
    title: "My VicWav",
    links: [
      { label: "My Account", href: "/account" },
      { label: "My Orders", href: "/account/orders" },
      { label: "Shopping Cart", href: "/cart" },
      { label: "Checkout", href: "/checkout" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Information", href: "/shipping" },
      { label: "Returns & Exchanges", href: "/returns" },
      { label: "FAQs", href: "/faq" },
    ],
  },
];

const socialCls =
  "grid h-11 w-11 place-items-center rounded-full border border-white/15 text-slate-200 transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#07152e]";

export default function StoreFooter() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-[#050d1c] text-white">
      {/* brand strip, as on the storefront banner */}
      <div className="border-b border-white/10 bg-gradient-to-r from-[#0a2a8f] via-[#1347d1] to-[#0a2a8f]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-6 px-6 py-7 md:px-10 lg:grid-cols-4">
          {perks.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className={`flex items-center gap-4 lg:px-6 ${i > 0 ? "lg:border-l lg:border-white/20" : ""}`}>
              <Icon size={30} strokeWidth={1.5} className="shrink-0 text-cyan-300" />
              <div>
                <p className="text-sm font-bold">{title}</p>
                <p className="hidden text-xs text-blue-100/80 sm:block">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* glow */}
      <div className="pointer-events-none absolute -left-40 top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-6 pb-8 pt-16 md:px-10 md:pt-20">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr] lg:gap-10">
          {/* brand */}
          <div className="max-w-sm">
            <Link href="/" aria-label="VICWAV home" className="inline-block">
              <img src="/logo-light.png" alt="VICWAV" width={763} height={423} className="h-24 w-auto" />
            </Link>

            <p className="mt-6 text-sm leading-7 text-slate-300">
              Wear the wave. Modern streetwear and everyday essentials designed for confidence, comfort and individuality.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-cyan-300" /> Harare, Zimbabwe
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-3 transition hover:text-white">
                  <Mail size={16} className="text-cyan-300" /> Get in touch
                </Link>
              </li>
            </ul>

            <div className="mt-7 flex items-center gap-3">
              <a href="https://www.instagram.com/vicwav/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialCls}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </a>
              <a href="https://www.facebook.com/vicwav/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialCls}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 4h-2.5A3.5 3.5 0 0 0 9 7.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7.8c0-.5.4-.8.9-.8H15V4z" />
                </svg>
              </a>
              <a href="https://www.tiktok.com/@vicwav" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className={socialCls}>
                <Music2 size={18} />
              </a>
            </div>
          </div>

          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title}>
              <h3 className="text-sm font-bold text-white">{column.title}</h3>
              <span className="mt-3 block h-0.5 w-8 rounded-full bg-cyan-400" />
              <ul className="mt-6 space-y-4">
                {column.links.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="group inline-flex items-center gap-1 text-sm text-slate-300 transition hover:text-white">
                      <span className="relative">
                        {item.label}
                        <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-cyan-300 transition-all duration-300 group-hover:w-full" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* giant wordmark */}
        <div aria-hidden="true" className="vwf-word mt-16 select-none overflow-hidden text-center text-[13vw] font-black leading-none tracking-[0.12em] md:mt-20 md:text-[9.5vw]">
          WEAR THE WAVE
        </div>

        <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-7 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>© 2026 VICWAV. All rights reserved.</p>
          <p className="flex items-center gap-2">
            Be Bold. Be VicWav.
            <ArrowUpRight size={14} className="text-cyan-400" />
          </p>
        </div>
      </div>

      <style>{`
        .vwf-word{color:transparent;-webkit-text-stroke:1px rgba(125,211,252,.28);background:linear-gradient(100deg,transparent 30%,rgba(103,232,249,.55) 50%,transparent 70%) 0 0/250% 100% no-repeat;-webkit-background-clip:text;background-clip:text;animation:vwfSweep 7s linear infinite}
        @keyframes vwfSweep{from{background-position:150% 0}to{background-position:-150% 0}}
        @media (prefers-reduced-motion:reduce){.vwf-word{animation:none}}
      `}</style>
    </footer>
  );
}
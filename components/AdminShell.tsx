
"use client";
/* eslint-disable @next/next/no-img-element */

import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Store,
  UserRound,
  ShieldCheck,
} from "lucide-react";

export const statusStyles: Record<string, { badge: string; dot: string }> = {
  pending: { badge: "bg-amber-50 text-amber-800 ring-amber-200", dot: "bg-amber-500" },
  confirmed: { badge: "bg-blue-50 text-blue-800 ring-blue-200", dot: "bg-blue-500" },
  processing: { badge: "bg-indigo-50 text-indigo-800 ring-indigo-200", dot: "bg-indigo-500" },
  shipped: { badge: "bg-purple-50 text-purple-800 ring-purple-200", dot: "bg-purple-500" },
  delivered: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  cancelled: { badge: "bg-red-50 text-red-800 ring-red-200", dot: "bg-red-500" },
  paid: { badge: "bg-emerald-50 text-emerald-800 ring-emerald-200", dot: "bg-emerald-500" },
  failed: { badge: "bg-red-50 text-red-800 ring-red-200", dot: "bg-red-500" },
  refunded: { badge: "bg-slate-100 text-slate-700 ring-slate-300", dot: "bg-slate-500" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusStyles[status] || {
    badge: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ring-inset ${s.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: Package, exact: false },
];

function AdminShellContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-[#07152e] lg:pl-64">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-[#07152e] text-white lg:flex">
        <div className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-blue-600/25 blur-[90px]" />

        <div className="relative px-7 pb-6 pt-8">
          <Link href="/" aria-label="VICWAV store">
            <img
              src="/logo-light.png"
              alt="VICWAV"
              width={763}
              height={423}
              className="h-16 w-auto"
            />
          </Link>

          <p className="mt-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-cyan-300">
            <ShieldCheck size={13} /> ADMINISTRATION
          </p>
        </div>

        <nav className="relative flex-1 space-y-1.5 px-4 py-4" aria-label="Admin">
          {nav.map(({ href, label, icon: Icon, exact }) => {
            const on = isActive(href, exact);

            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${
                  on
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/40"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="relative space-y-1.5 border-t border-white/10 p-4">
          <Link
            href="/shop"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Store size={17} /> View store
          </Link>

          <Link
            href="/account"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <UserRound size={17} /> My account
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07152e] text-white lg:hidden">
        <div className="flex items-center justify-between px-5 py-3">
          <Link href="/" aria-label="VICWAV store">
            <img
              src="/logo-light.png"
              alt="VICWAV"
              width={763}
              height={423}
              className="h-11 w-auto"
            />
          </Link>

          <div className="flex items-center gap-1 text-xs font-semibold">
            <Link href="/shop" className="rounded-full px-3 py-2 text-slate-300 hover:bg-white/10">
              Store
            </Link>
            <Link href="/account" className="rounded-full px-3 py-2 text-slate-300 hover:bg-white/10">
              Account
            </Link>
          </div>
        </div>

        <nav className="flex gap-2 px-5 pb-3" aria-label="Admin">
          {nav.map(({ href, label, icon: Icon, exact }) => {
            const on = isActive(href, exact);

            return (
              <Link
                key={href}
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold ${
                  on ? "bg-blue-600 text-white" : "bg-white/10 text-slate-300"
                }`}
              >
                <Icon size={15} /> {label}
              </Link>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        {children}
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .adm-in{opacity:0;animation:admIn .6s cubic-bezier(.2,.8,.2,1) forwards}
            @keyframes admIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
            .adm-focus:focus-visible,.adm-shell a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible{outline:2px solid #22d3ee;outline-offset:2px}
            @media (prefers-reduced-motion:reduce){.adm-in{opacity:1;animation:none}*{transition-duration:.01ms!important}}
            @media print{aside,header,.no-print{display:none!important}div.lg\\:pl-64{padding-left:0!important}}
          `,
        }}
      />
    </div>
  );
}

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f4f6fb] lg:pl-64" />
      }
    >
      <AdminShellContent>{children}</AdminShellContent>
    </Suspense>
  );
}

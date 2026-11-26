
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { RefreshCw } from "lucide-react";

type SiteLayoutProps = {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
};

type AccessStatus = "checking" | "allowed";

const PUBLIC_ROUTES = [
  "/",
  "/shop",
  "/product",
  "/login",
  "/register",
  "/verify",
  "/cart",
];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) =>
      pathname === route ||
      (route !== "/" && pathname.startsWith(`${route}/`))
  );
}

function requiresLogin(pathname: string) {
  return (
    pathname === "/checkout" ||
    pathname.startsWith("/checkout/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/") ||
    pathname === "/admin" ||
    pathname.startsWith("/admin/")
  );
}

export default function SiteLayout({
  children,
  navbar,
  footer,
}: SiteLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = isPublicRoute(pathname) || !requiresLogin(pathname);

  const [accessStatus, setAccessStatus] = useState<AccessStatus>(
    isPublic ? "allowed" : "checking"
  );

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      if (isPublicRoute(pathname) || !requiresLogin(pathname)) {
        setAccessStatus("allowed");
        return;
      }

      setAccessStatus("checking");

      try {
        // Authentication is required, but email verification is not.
        await account.get();

        if (active) {
          setAccessStatus("allowed");
        }
      } catch {
        if (!active) return;

        const nextPath = `${pathname}${window.location.search}`;

        router.replace(
          `/login?next=${encodeURIComponent(nextPath)}`
        );
      }
    }

    checkAccess();

    return () => {
      active = false;
    };
  }, [pathname, router]);

  // Public pages must never wait for an authentication check.
  if (!isPublic && accessStatus === "checking") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f8ff] px-6">
        <div className="w-full max-w-sm rounded-3xl border border-white bg-white p-10 text-center shadow-xl shadow-blue-900/5">
          <RefreshCw
            size={30}
            className="mx-auto animate-spin text-blue-700"
          />

          <h1 className="mt-5 text-xl font-bold text-[#10234a]">
            Checking your sign-in
          </h1>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Please wait while we securely check your account.
          </p>
        </div>
      </main>
    );
  }

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      {navbar}
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  );
}

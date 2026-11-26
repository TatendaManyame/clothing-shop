
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Models } from "appwrite";
import { account } from "@/lib/appwrite";

export default function AccountPage() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const currentUser = await account.get();

        if (active) {
          setUser(currentUser);
        }
      } catch {
        if (active) {
          window.location.href = "/login";
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await account.deleteSession({ sessionId: "current" });
      window.location.href = "/";
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to log out. Please try again."
      );
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-xs font-bold tracking-[0.2em]">
          LOADING YOUR ACCOUNT...
        </p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-neutral-50 px-5 py-12 text-neutral-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 flex items-center justify-between border-b border-neutral-200 pb-6">
          <Link href="/" className="text-2xl font-black tracking-[0.2em]">
            VICWAV
          </Link>

          <Link
            href="/shop"
            className="text-sm font-semibold underline underline-offset-4"
          >
            Continue shopping
          </Link>
        </header>

        <div className="mb-10">
          <p className="mb-3 text-xs font-bold tracking-[0.25em] text-neutral-500">
            CUSTOMER ACCOUNT
          </p>

          <h1 className="text-4xl font-semibold">
            Welcome, {user.name || "Customer"}.
          </h1>

          <p className="mt-3 text-sm text-neutral-500">
            Manage your account and enjoy your shopping experience.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <section className="rounded-xl border border-neutral-200 bg-white p-7 md:col-span-2">
            <h2 className="mb-6 text-lg font-semibold">
              Account information
            </h2>

            <div className="space-y-5">
              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Full name
                </p>
                <p className="text-sm font-medium">
                  {user.name || "Not provided"}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Email address
                </p>
                <p className="text-sm font-medium">{user.email}</p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Account ID
                </p>
                <p className="break-all text-sm font-medium">{user.$id}</p>
              </div>

              <div>
                <p className="mb-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  Email verification
                </p>
                <p className="text-sm font-medium">
                  {user.emailVerification ? "Verified" : "Not verified"}
                </p>
              </div>
            </div>
          </section>

          <aside className="rounded-xl border border-neutral-200 bg-white p-7">
            <h2 className="mb-4 text-lg font-semibold">Your account</h2>

            <p className="mb-6 text-sm leading-6 text-neutral-500">
              Your account is ready. You can continue shopping, view your
              purchases and track your orders.
            </p>

            <Link
              href="/account/orders"
              className="mb-3 block w-full rounded-lg border border-black px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-neutral-100"
            >
              MY ORDERS
            </Link>

            <Link
              href="/account/orders"
              className="mb-3 block w-full rounded-lg bg-neutral-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-700"
            >
              TRACK ORDERS
            </Link>

            <Link
              href="/shop"
              className="mb-3 block w-full rounded-lg bg-black px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              SHOP NOW
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm font-semibold transition hover:bg-neutral-100 disabled:opacity-60"
            >
              {loggingOut ? "LOGGING OUT..." : "LOG OUT"}
            </button>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-600">
                {error}
              </p>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

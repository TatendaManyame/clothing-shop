
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { account } from "@/lib/appwrite";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      await account.createEmailPasswordSession({
        email: normalizedEmail,
        password,
      });

      window.location.href = "/account";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to log in.";

      if (
        message.toLowerCase().includes("invalid credentials") ||
        message.toLowerCase().includes("user not found")
      ) {
        setError("Incorrect email or password. Please try again.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-5 py-12 text-neutral-900">
      <div className="mx-auto grid min-h-[75vh] max-w-6xl overflow-hidden rounded-2xl border border-neutral-200 md:grid-cols-2">
        <section className="hidden bg-neutral-950 p-12 text-white md:flex md:flex-col md:justify-between">
          <Link href="/" className="text-2xl font-black tracking-[0.2em]">
            VICWAV
          </Link>

          <div>
            <p className="mb-4 text-xs font-bold tracking-[0.3em] text-neutral-400">
              WELCOME BACK
            </p>
            <h1 className="max-w-md text-5xl font-semibold leading-tight">
              Your style. Your collection. Your account.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-400">
              Sign in to continue shopping and manage your orders.
            </p>
          </div>

          <p className="text-xs text-neutral-500">
            © 2026 VICWAV. All rights reserved.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 py-12 sm:p-12">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="text-xl font-black tracking-[0.2em] md:hidden"
            >
              VICWAV
            </Link>

            <div className="mb-8 mt-8 md:mt-0">
              <p className="mb-3 text-xs font-bold tracking-[0.25em] text-neutral-500">
                CUSTOMER LOGIN
              </p>
              <h2 className="text-3xl font-semibold">Welcome back</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Enter your account details to continue.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Email address
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-neutral-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                  className="h-4 w-4 accent-black"
                />
                Show password
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-neutral-600">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-black underline underline-offset-4"
              >
                Create account
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

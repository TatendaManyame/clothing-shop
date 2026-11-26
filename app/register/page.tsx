
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ID } from "appwrite";
import { account } from "@/lib/appwrite";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const name = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!name || !normalizedEmail || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await account.create({
        userId: ID.unique(),
        email: normalizedEmail,
        password,
        name,
      });

      await account.createEmailPasswordSession({
        email: normalizedEmail,
        password,
      });

      setSuccess("Your account has been created successfully. You are now logged in.");

      window.location.href = "/account";
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Unable to create your account.";

      if (message.toLowerCase().includes("already exists")) {
        setError("An account with this email already exists. Please log in.");
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
              YOUR STYLE STARTS HERE
            </p>
            <h1 className="max-w-md text-5xl font-semibold leading-tight">
              Discover your style. Make it yours.
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-neutral-400">
              Create an account to enjoy a more personal shopping experience
              and keep track of your orders.
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
                CREATE YOUR ACCOUNT
              </p>
              <h2 className="text-3xl font-semibold">Join VICWAV</h2>
              <p className="mt-2 text-sm text-neutral-500">
                Enter your details to get started.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full name
                </label>
                <input
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Your full name"
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

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
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none transition focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Confirm password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Re-enter your password"
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
                Show passwords
              </label>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              {success && (
                <div
                  role="status"
                  className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-black px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-neutral-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-black underline underline-offset-4"
              >
                Log in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

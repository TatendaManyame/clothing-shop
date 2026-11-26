
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { account } from "@/lib/appwrite";

export default function LoginPage() {
  const searchParams = useSearchParams();

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

      const requestedPath = searchParams.get("next");

      const redirectPath =
        requestedPath &&
        requestedPath.startsWith("/") &&
        !requestedPath.startsWith("//") &&
        !requestedPath.startsWith("/login") &&
        !requestedPath.startsWith("/register") &&
        !requestedPath.startsWith("/verify")
          ? requestedPath
          : "/account";

      window.location.href = redirectPath;
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
    <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-[#f5f8ff] px-4 py-12 sm:px-6 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-200/40 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(#10234a_1px,transparent_1px),linear-gradient(90deg,#10234a_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_100px_-35px_rgba(15,35,75,0.28)] lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#091a38] p-12 text-white lg:flex xl:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.45),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(6,182,212,0.22),transparent_35%)]" />

          <div className="absolute -right-28 top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 top-44 h-48 w-48 rounded-full border border-cyan-300/15" />
          <div className="absolute bottom-20 left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <Link
            href="/"
            className="relative z-10 inline-flex w-fit items-center"
          >
            <Image
              src="/logo-light.png"
              alt="VICWAV"
              width={180}
              height={55}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          <div className="relative z-10 max-w-lg">
            <h1 className="text-5xl font-bold leading-[1.12] tracking-tight xl:text-6xl">
              Make your
              <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent">
                statement.
              </span>
              Own your style.
            </h1>

            <p className="mt-7 max-w-sm text-base leading-8 text-blue-100/65">
              Your wardrobe, your favourites and your orders. Everything you
              need to stay connected to VICWAV, all in one place.
            </p>

            <div className="mt-12 flex items-center gap-4 border-t border-white/10 pt-8">
              <div className="flex -space-x-2">
                <div className="h-9 w-9 rounded-full border-2 border-[#091a38] bg-blue-400" />
                <div className="h-9 w-9 rounded-full border-2 border-[#091a38] bg-cyan-400" />
                <div className="h-9 w-9 rounded-full border-2 border-[#091a38] bg-indigo-400" />
              </div>

              <p className="text-xs leading-5 text-blue-100/60">
                Discover your next favourite look.
                <span className="block font-semibold text-white">
                  Welcome to VICWAV.
                </span>
              </p>
            </div>
          </div>

          <p className="relative z-10 text-xs text-blue-100/40">
            © 2026 VICWAV. All rights reserved.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14 xl:px-20">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-12 inline-flex items-center lg:hidden"
            >
              <Image
                src="/logo.png"
                alt="VICWAV"
                width={160}
                height={50}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>

            <div className="mb-9">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <LockKeyhole size={22} />
              </div>

              <p className="mb-3 text-xs font-bold tracking-[0.22em] text-blue-600">
                CUSTOMER ACCOUNT
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[#10234a] sm:text-4xl">
                Welcome back.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Sign in to access your account and continue where you left off.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-[#10234a]"
                >
                  Email address
                </label>

                <div className="group relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-4 text-sm text-[#10234a] outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-[#10234a]"
                >
                  Password
                </label>

                <div className="group relative">
                  <LockKeyhole
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-12 text-sm text-[#10234a] outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-5 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-blue-900/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "SIGNING IN..." : "SIGN IN TO YOUR ACCOUNT"}

                {!loading && (
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                )}
              </button>
            </form>

            <div className="my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                NEW TO VICWAV?
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <Link
              href="/register"
              className="flex w-full items-center justify-center rounded-xl border border-blue-100 bg-blue-50/50 px-5 py-4 text-sm font-bold text-blue-800 transition duration-200 hover:border-blue-200 hover:bg-blue-50"
            >
              Create your account
            </Link>

            <div className="mt-9 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} className="text-emerald-600" />
              Your account is protected with secure sign-in.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

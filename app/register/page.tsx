"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ID } from "appwrite";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
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
      // 1. Create the Appwrite account.
      await account.create({
        userId: ID.unique(),
        email: normalizedEmail,
        password,
        name,
      });

      // 2. Remove an existing session only if one is active.
      // This prevents Appwrite's active-session conflict.
      try {
        await account.get();

        await account.deleteSession({
          sessionId: "current",
        });
      } catch (sessionError) {
        // No active session: continue with registration.
        // If session deletion itself failed, stop rather than
        // attempting to create another session.
        if (
          sessionError instanceof Error &&
          sessionError.message.toLowerCase().includes("session")
        ) {
          throw sessionError;
        }
      }

      // 3. Sign in as the newly registered customer.
      await account.createEmailPasswordSession({
        email: normalizedEmail,
        password,
      });

      // 4. Send the email verification link.
      try {
        await account.createVerification({
          url: `${window.location.origin}/verify`,
        });
      } catch {
        // Account and session exist, but email sending failed.
        window.location.href = "/verify?sendError=1";
        return;
      }

      // 5. Redirect to the verification page.
      setSuccess(
        "Your account has been created. Check your email to verify your address."
      );

      window.location.href = "/verify?sent=1";
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create your account.";

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
    <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-[#f5f8ff] px-4 py-12 sm:px-6 lg:py-16">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-200/40 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(#10234a_1px,transparent_1px),linear-gradient(90deg,#10234a_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_100px_-35px_rgba(15,35,75,0.28)] lg:min-h-[760px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#091a38] p-12 text-white lg:flex xl:p-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.45),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(6,182,212,0.22),transparent_35%)]" />
          <div className="absolute -right-28 top-28 h-80 w-80 rounded-full border border-white/10" />
          <div className="absolute -right-12 top-44 h-48 w-48 rounded-full border border-cyan-300/15" />
          <div className="absolute bottom-20 left-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

          <Link href="/" className="relative z-10 inline-flex w-fit items-center">
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
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold tracking-wider text-cyan-200">
              <Sparkles size={14} />
              YOUR STYLE STARTS HERE
            </div>

            <h1 className="text-5xl font-bold leading-[1.12] tracking-tight xl:text-6xl">
              Discover your
              <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent">
                style.
              </span>
              Make it yours.
            </h1>

            <p className="mt-7 max-w-sm text-base leading-8 text-blue-100/65">
              Create your VICWAV account and enjoy a more personal shopping
              experience. Keep your favourite looks close and your orders
              organised.
            </p>

            <div className="mt-12 space-y-5 border-t border-white/10 pt-8">
              {[
                "A personalised shopping experience",
                "Easy order tracking and management",
                "Stay connected with the latest collections",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-300">
                    <CheckCircle2 size={15} />
                  </span>
                  <span className="text-sm text-blue-100/75">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-xs text-blue-100/40">
            © 2026 VICWAV. All rights reserved.
          </p>
        </section>

        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14 xl:px-20">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 inline-flex items-center lg:hidden">
              <Image
                src="/logo.png"
                alt="VICWAV"
                width={160}
                height={50}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>

            <div className="mb-8">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                <UserRound size={22} />
              </div>

              <p className="mb-3 text-xs font-bold tracking-[0.22em] text-blue-600">
                CREATE YOUR ACCOUNT
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-[#10234a] sm:text-4xl">
                Join VICWAV.
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-500">
                Create your account and discover a better way to shop.
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="mb-2 block text-sm font-semibold text-[#10234a]">
                  Full name
                </label>
                <div className="group relative">
                  <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600" />
                  <input
                    id="fullName"
                    type="text"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-4 text-sm text-[#10234a] outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-[#10234a]">
                  Email address
                </label>
                <div className="group relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600" />
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
                <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#10234a]">
                  Password
                </label>
                <div className="group relative">
                  <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-12 text-sm text-[#10234a] outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-blue-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-[#10234a]">
                  Confirm password
                </label>
                <div className="group relative">
                  <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600" />
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-4 text-sm text-[#10234a] outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(event) => setShowPassword(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-700"
                />
                Show passwords
              </label>

              {error && (
                <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              {success && (
                <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-5 py-4 text-sm font-bold tracking-wide text-white shadow-lg shadow-blue-900/20 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-900/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? "CREATING ACCOUNT..." : "CREATE YOUR ACCOUNT"}
                {!loading && (
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
                ALREADY A MEMBER?
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl border border-blue-100 bg-blue-50/50 px-5 py-4 text-sm font-bold text-blue-800 transition duration-200 hover:border-blue-200 hover:bg-blue-50"
            >
              Sign in to your account
            </Link>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} className="text-emerald-600" />
              Your information is protected with secure sign-in.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
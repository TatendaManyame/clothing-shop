"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Mail, MailCheck, ShieldCheck } from "lucide-react";
import { account } from "@/lib/appwrite";
import AuthShell from "@/components/auth-shell";

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-4 text-sm text-[#07152e] outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

const RESEND_SECONDS = 30;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;

    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function sendLink() {
    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      setError("Please enter your email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await account.createRecovery({
        email: normalized,
        url: `${window.location.origin}/reset-password`,
      });
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string } | null;
      const msg = (e?.message ?? "").toLowerCase();

      // Unknown email: act as if it worked, so we never reveal who has an account.
      if (e?.code !== 404) {
        if (e?.code === 429 || msg.includes("rate limit")) {
          setError("Too many requests. Please wait a minute and try again.");
        } else if (msg.includes("failed to fetch") || msg.includes("network")) {
          setError(
            "We can't reach the server. Check your connection and try again."
          );
        } else {
          setError(e?.message || "Unable to send the reset link.");
        }

        setLoading(false);
        return;
      }
    }

    setSent(true);
    setCooldown(RESEND_SECONDS);
    setLoading(false);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendLink();
  }

  return (
    <AuthShell
      eyebrow="NO WORRIES"
      headline={
        <>
          Locked out?
          <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent">
            We&rsquo;ve got you.
          </span>
        </>
      }
      text="Tell us your email and we'll send a secure link to choose a new password."
      points={[
        "Takes less than a minute",
        "Your orders and details stay safe",
        "The link only works for you",
      ]}
    >
      {sent ? (
        <div role="status">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <MailCheck size={26} />
          </div>

          <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-blue-600">
            LINK SENT
          </p>

          <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
            Check your email.
          </h2>

          <p className="mt-3 break-words text-sm leading-7 text-slate-500">
            If an account exists for{" "}
            <span className="font-semibold text-[#07152e]">
              {email.trim().toLowerCase()}
            </span>
            , we&rsquo;ve sent a link to reset your password. It can take a
            minute to arrive, so check your spam folder too.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={sendLink}
            disabled={loading || cooldown > 0}
            className="au-btn mt-8 flex w-full items-center justify-center rounded-full bg-[#07152e] px-5 py-4 text-xs font-bold tracking-[0.18em] text-white shadow-lg shadow-blue-950/20 transition duration-300 hover:text-[#07152e] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "SENDING..."
              : cooldown > 0
                ? `RESEND IN ${cooldown}S`
                : "RESEND LINK"}
          </button>

          <button
            type="button"
            onClick={() => {
              setSent(false);
              setError("");
            }}
            className="mt-3 flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-4 text-xs font-bold tracking-[0.18em] text-[#07152e] transition duration-200 hover:border-[#07152e] hover:bg-[#07152e] hover:text-white"
          >
            USE A DIFFERENT EMAIL
          </button>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-blue-600">
              PASSWORD HELP
            </p>

            <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
              Forgot password?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Enter the email you signed up with and we&rsquo;ll send you a
              reset link.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-xs font-bold tracking-[0.12em] text-[#07152e]"
              >
                EMAIL
              </label>

              <div className="group relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                />

                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="you@example.com"
                  required
                  className={inputCls}
                />
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="au-btn group flex w-full items-center justify-center gap-3 rounded-full bg-[#07152e] px-5 py-4 text-xs font-bold tracking-[0.18em] text-white shadow-lg shadow-blue-950/20 transition duration-300 hover:text-[#07152e] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "SENDING..." : "SEND RESET LINK"}

              {!loading && (
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              )}
            </button>
          </form>
        </>
      )}

      <Link
        href="/login"
        className="mt-8 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.18em] text-slate-500 transition hover:text-blue-700"
      >
        <ArrowLeft size={14} /> BACK TO SIGN IN
      </Link>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={15} className="text-emerald-600" />
        Reset links are secure and expire after a short time.
      </div>
    </AuthShell>
  );
}
"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LinkIcon,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { account } from "@/lib/appwrite";
import AuthShell from "@/components/auth-shell";

function strength(p: string) {
  if (p.length < 8) return 0;

  let s = 1;
  if (p.length >= 12) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p) || /[^A-Za-z0-9]/.test(p)) s++;

  return s;
}

const strengthLabel = ["Too short", "Okay", "Good", "Strong", "Very strong"];
const strengthColor = [
  "bg-slate-200",
  "bg-amber-400",
  "bg-blue-500",
  "bg-emerald-500",
  "bg-emerald-500",
];

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-12 text-sm text-[#07152e] outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

function ResetForm() {
  const searchParams = useSearchParams();

  // Appwrite adds these to the link in the recovery email.
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [done, setDone] = useState(false);

  const score = strength(password);
  const linkBroken = !userId || !secret || expired;

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!userId || !secret) return;

    setError("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await account.updateRecovery({ userId, secret, password });

      setDone(true);
      setLoading(false);

      window.setTimeout(() => {
        window.location.href = "/login?reset=1";
      }, 2500);
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string } | null;
      const msg = (e?.message ?? "").toLowerCase();

      if (
        e?.code === 401 ||
        msg.includes("expired") ||
        (msg.includes("invalid") && msg.includes("token"))
      ) {
        setExpired(true);
      } else if (e?.code === 429 || msg.includes("rate limit")) {
        setError("Too many attempts. Please wait a minute and try again.");
      } else if (msg.includes("failed to fetch") || msg.includes("network")) {
        setError(
          "We can't reach the server. Check your connection and try again."
        );
      } else {
        setError(e?.message || "Unable to reset your password.");
      }

      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="FRESH START"
      headline={
        <>
          Choose a new
          <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent">
            password.
          </span>
        </>
      }
      text="Pick something strong that you haven't used anywhere else."
      points={[
        "At least 8 characters",
        "Mix letters, numbers and symbols",
        "You'll sign in with it right after",
      ]}
    >
      {done ? (
        <div role="status">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <CheckCircle2 size={26} />
          </div>

          <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-blue-600">
            ALL DONE
          </p>

          <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
            Password updated.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Taking you to sign in with your new password.
          </p>

          <Link
            href="/login?reset=1"
            className="au-btn group mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#07152e] px-5 py-4 text-xs font-bold tracking-[0.18em] text-white shadow-lg shadow-blue-950/20 transition duration-300 hover:text-[#07152e]"
          >
            SIGN IN NOW
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      ) : linkBroken ? (
        <div role="alert">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-100">
            <LinkIcon size={26} />
          </div>

          <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-blue-600">
            LINK PROBLEM
          </p>

          <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
            This link isn&rsquo;t valid.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            It may have expired or already been used. Request a new one and
            we&rsquo;ll email it right over.
          </p>

          <Link
            href="/forgot-password"
            className="au-btn group mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-[#07152e] px-5 py-4 text-xs font-bold tracking-[0.18em] text-white shadow-lg shadow-blue-950/20 transition duration-300 hover:text-[#07152e]"
          >
            GET A NEW LINK
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-blue-600">
              RESET PASSWORD
            </p>

            <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
              New password.
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              Choose a new password for your VICWAV account.
            </p>
          </div>

          <form onSubmit={handleReset} className="space-y-5" noValidate>
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-xs font-bold tracking-[0.12em] text-[#07152e]"
              >
                NEW PASSWORD
              </label>

              <div className="group relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  className={inputCls}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {password && (
                <div className="mt-3" aria-live="polite">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((n) => (
                      <span
                        key={n}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          score >= n ? strengthColor[score] : "bg-slate-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="mt-1.5 text-[11px] font-medium text-slate-500">
                    {strengthLabel[score]}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="mb-2 block text-xs font-bold tracking-[0.12em] text-[#07152e]"
              >
                CONFIRM PASSWORD
              </label>

              <div className="group relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
                />

                <input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => {
                    setConfirm(event.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Re-enter your password"
                  required
                  className={inputCls}
                />
              </div>

              {confirm && password && (
                <p
                  className={`mt-2 text-[11px] font-medium ${
                    confirm === password ? "text-emerald-600" : "text-red-600"
                  }`}
                  aria-live="polite"
                >
                  {confirm === password
                    ? "Passwords match"
                    : "Passwords don't match yet"}
                </p>
              )}
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
              {loading ? "UPDATING..." : "UPDATE PASSWORD"}

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

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={15} className="text-emerald-600" />
        Your information is protected with secure sign-in.
      </div>
    </AuthShell>
  );
}

// useSearchParams must sit inside a Suspense boundary or `next build` fails.
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
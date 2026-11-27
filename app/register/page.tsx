"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ID } from "appwrite";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MailCheck,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import { account } from "@/lib/appwrite";
import AuthShell from "@/components/auth-shell";

/** Only allow redirects to pages on this site (never off-site, never auth pages). */
function safePath(path: string | null) {
  if (
    !path ||
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.startsWith("/\\") ||
    path.startsWith("/login") ||
    path.startsWith("/register") ||
    path.startsWith("/verify")
  ) {
    return null;
  }
  return path;
}

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
  "w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-4 text-sm text-[#07152e] outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

function RegisterForm() {
  const searchParams = useSearchParams();
  const next = safePath(searchParams.get("next"));

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exists, setExists] = useState(false);

  const score = strength(password);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setExists(false);

    const name = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!name || !normalizedEmail || !password) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      // 1. Create the account.
      await account.create({
        userId: ID.unique(),
        email: normalizedEmail,
        password,
        name,
      });

      // 2. Clear any stale session so the new one can be created.
      try {
        await account.deleteSession({ sessionId: "current" });
      } catch {}

      // 3. Sign the new customer in.
      await account.createEmailPasswordSession({
        email: normalizedEmail,
        password,
      });

      // 4. Send the one-time verification email. This only happens here,
      //    when the account is created, and never when signing in.
      const query = next ? `&next=${encodeURIComponent(next)}` : "";

      try {
        await account.createVerification({
          url: `${window.location.origin}/verify`,
        });
      } catch {
        window.location.href = `/verify?sendError=1${query}`;
        return;
      }

      window.location.href = `/verify?sent=1${query}`;
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string } | null;
      const msg = (e?.message ?? "").toLowerCase();

      if (e?.code === 409 || msg.includes("already exists")) {
        setExists(true);
        setError("An account with this email already exists.");
      } else if (e?.code === 429 || msg.includes("rate limit")) {
        setError("Too many attempts. Please wait a minute and try again.");
      } else if (msg.includes("failed to fetch") || msg.includes("network")) {
        setError(
          "We can't reach the server. Check your connection and try again."
        );
      } else {
        setError(e?.message || "Unable to create your account.");
      }

      setLoading(false);
    }
  }

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  return (
    <AuthShell
      eyebrow="YOUR STYLE STARTS HERE"
      headline={
        <>
          Discover your
          <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent">
            style.
          </span>
          Make it yours.
        </>
      }
      text="Create your VICWAV account in under a minute."
      points={[
        "Save your favourite looks",
        "Easy order tracking",
        "Early access to new collections",
      ]}
    >
      <div className="mb-8">
        <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-blue-600">
          CREATE YOUR ACCOUNT
        </p>

        <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
          Join VICWAV.
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          Just three fields and you&rsquo;re in.
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-5" noValidate>
        <div>
          <label
            htmlFor="fullName"
            className="mb-2 block text-xs font-bold tracking-[0.12em] text-[#07152e]"
          >
            FULL NAME
          </label>

          <div className="group relative">
            <UserRound
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-blue-600"
            />

            <input
              id="fullName"
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(event) => {
                setFullName(event.target.value);
                if (error) setError("");
              }}
              placeholder="Your full name"
              required
              className={inputCls}
            />
          </div>
        </div>

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

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-xs font-bold tracking-[0.12em] text-[#07152e]"
          >
            PASSWORD
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
              className={`${inputCls} pr-12`}
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

        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
          >
            {error}{" "}
            {exists && (
              <Link
                href={loginHref}
                className="font-bold underline underline-offset-4"
              >
                Sign in instead
              </Link>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="au-btn group flex w-full items-center justify-center gap-3 rounded-full bg-[#07152e] px-5 py-4 text-xs font-bold tracking-[0.18em] text-white shadow-lg shadow-blue-950/20 transition duration-300 hover:text-[#07152e] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}

          {!loading && (
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          )}
        </button>

        <p className="flex items-start gap-2 text-xs leading-5 text-slate-500">
          <MailCheck size={15} className="mt-0.5 shrink-0 text-blue-600" />
          We&rsquo;ll email you a link to confirm your address. You only need to
          do this once, when you join.
        </p>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
          ALREADY A MEMBER?
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <Link
        href={loginHref}
        className="flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-4 text-xs font-bold tracking-[0.18em] text-[#07152e] transition duration-200 hover:border-[#07152e] hover:bg-[#07152e] hover:text-white"
      >
        SIGN IN
      </Link>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={15} className="text-emerald-600" />
        Your information is protected with secure sign-in.
      </div>
    </AuthShell>
  );
}

// useSearchParams must sit inside a Suspense boundary or `next build` fails.
export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
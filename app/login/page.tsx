"use client";

import { FormEvent, Suspense, useEffect, useState } from "react";
import Link from "next/link";
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

function explain(err: unknown) {
  const e = err as { code?: number; message?: string } | null;
  const msg = (e?.message ?? "").toLowerCase();

  if (e?.code === 401 || msg.includes("invalid credentials")) {
    return "Incorrect email or password. Please try again.";
  }
  if (e?.code === 429 || msg.includes("rate limit")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (msg.includes("failed to fetch") || msg.includes("network")) {
    return "We can't reach the server. Check your connection and try again.";
  }
  return e?.message || "Unable to sign in. Please try again.";
}

const inputCls =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/70 py-4 pl-12 pr-4 text-sm text-[#07152e] outline-none transition duration-200 placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = safePath(searchParams.get("next"));
  const justReset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already signed in? Skip the form.
  useEffect(() => {
    let active = true;

    account
      .get()
      .then(() => {
        if (active) window.location.replace(next ?? "/account");
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [next]);

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
      // Clear any stale session first, otherwise Appwrite refuses to
      // create a new one ("session is active").
      try {
        await account.deleteSession({ sessionId: "current" });
      } catch {}

      // Signing in never requires a verified email. Verification is only
      // asked for once, when a new account is created.
      await account.createEmailPasswordSession({
        email: normalizedEmail,
        password,
      });

      window.location.href = next ?? "/account";
    } catch (err: unknown) {
      setError(explain(err));
      setLoading(false);
    }
  }

  const registerHref = next
    ? `/register?next=${encodeURIComponent(next)}`
    : "/register";

  return (
    <AuthShell
      eyebrow="WELCOME BACK"
      headline={
        <>
          Make your
          <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent">
            statement.
          </span>
          Own your style.
        </>
      }
      text="Your orders, your bag and your favourites, all waiting for you."
      points={[
        "Pick up right where you left off",
        "Track every order in one place",
        "First to see each new drop",
      ]}
    >
      <div className="mb-8">
        <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-blue-600">
          CUSTOMER ACCOUNT
        </p>

        <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
          Sign in.
        </h2>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          Welcome back. Enter your details to continue.
        </p>
      </div>

      {justReset && (
        <div
          role="status"
          className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700"
        >
          Password updated. Sign in with your new password.
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5" noValidate>
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
              autoComplete="username"
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
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="password"
              className="block text-xs font-bold tracking-[0.12em] text-[#07152e]"
            >
              PASSWORD
            </label>

            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-blue-700 underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

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
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError("");
              }}
              placeholder="Enter your password"
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
          {loading ? "SIGNING IN..." : "SIGN IN"}

          {!loading && (
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          )}
        </button>
      </form>

      <div className="my-7 flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-100" />
        <span className="text-[10px] font-bold tracking-[0.18em] text-slate-400">
          NEW TO VICWAV?
        </span>
        <div className="h-px flex-1 bg-slate-100" />
      </div>

      <Link
        href={registerHref}
        className="flex w-full items-center justify-center rounded-full border border-slate-200 px-5 py-4 text-xs font-bold tracking-[0.18em] text-[#07152e] transition duration-200 hover:border-[#07152e] hover:bg-[#07152e] hover:text-white"
      >
        CREATE AN ACCOUNT
      </Link>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={15} className="text-emerald-600" />
        Your account is protected with secure sign-in.
      </div>
    </AuthShell>
  );
}

// useSearchParams must sit inside a Suspense boundary or `next build` fails.
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
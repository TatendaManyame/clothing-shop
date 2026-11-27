"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  LinkIcon,
  MailCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { account } from "@/lib/appwrite";
import AuthShell from "@/components/auth-shell";

type Status =
  | "loading"
  | "verified"
  | "already"
  | "pending"
  | "invalid"
  | "signedout";

const RESEND_SECONDS = 30;

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

const primaryBtn =
  "au-btn group flex w-full items-center justify-center gap-3 rounded-full bg-[#07152e] px-5 py-4 text-xs font-bold tracking-[0.18em] text-white shadow-lg shadow-blue-950/20 transition duration-300 hover:text-[#07152e] disabled:cursor-not-allowed disabled:opacity-60";

const outlineBtn =
  "flex w-full items-center justify-center gap-3 rounded-full border border-slate-200 px-5 py-4 text-xs font-bold tracking-[0.18em] text-[#07152e] transition duration-200 hover:border-[#07152e] hover:bg-[#07152e] hover:text-white disabled:cursor-not-allowed disabled:opacity-60";

function VerifyView() {
  const searchParams = useSearchParams();

  // Appwrite adds userId and secret to the link in the verification email.
  const userId = searchParams.get("userId");
  const secret = searchParams.get("secret");
  const sentParam = searchParams.get("sent") === "1";
  const sendError = searchParams.get("sendError") === "1";
  const next = safePath(searchParams.get("next"));
  const continueHref = next ?? "/account";

  const [status, setStatus] = useState<Status>("loading");
  const [signedIn, setSignedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Guards against React Strict Mode running the effect twice. A verification
  // secret works only once, so a second call would wrongly show an error.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      // 1. Arrived from the email link: confirm the address.
      if (userId && secret) {
        try {
          await account.updateVerification({ userId, secret });
          setStatus("verified");
        } catch {
          setStatus("invalid");
        }

        try {
          await account.get();
          setSignedIn(true);
        } catch {}

        return;
      }

      // 2. Arrived without a link: find out where this person stands.
      try {
        const user = await account.get();

        setSignedIn(true);
        setEmail(user.email);

        if (user.emailVerification) {
          setStatus("already");
          return;
        }

        setStatus("pending");

        if (sendError) {
          setError(
            "Your account was created, but we couldn't send the verification email. Please try resending it."
          );
        } else if (sentParam) {
          setCooldown(RESEND_SECONDS);
        }
      } catch {
        setStatus("signedout");
      }
    })();
  }, [userId, secret, sendError, sentParam]);

  // resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;

    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function resend() {
    setResending(true);
    setError("");
    setNotice("");

    try {
      await account.createVerification({
        url: `${window.location.origin}/verify${
          next ? `?next=${encodeURIComponent(next)}` : ""
        }`,
      });

      // After a bad link the page shows the "invalid" view; move to the
      // normal waiting view now that a fresh email is on its way.
      setStatus("pending");
      setNotice("A new verification email is on its way.");
      setCooldown(RESEND_SECONDS);
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string } | null;
      const msg = (e?.message ?? "").toLowerCase();

      if (e?.code === 429 || msg.includes("rate limit")) {
        setError("Too many requests. Please wait a minute and try again.");
      } else if (e?.code === 401) {
        setStatus("signedout");
      } else if (msg.includes("failed to fetch") || msg.includes("network")) {
        setError(
          "We can't reach the server. Check your connection and try again."
        );
      } else {
        setError(e?.message || "Unable to send the verification email.");
      }
    } finally {
      setResending(false);
    }
  }

  // For people who verified in another tab or on their phone.
  async function checkAgain() {
    setChecking(true);
    setError("");
    setNotice("");

    try {
      const user = await account.get();

      if (user.emailVerification) {
        setStatus("verified");
      } else {
        setNotice(
          "Not verified yet. Open the link in the email, then try again."
        );
      }
    } catch {
      setStatus("signedout");
    } finally {
      setChecking(false);
    }
  }

  const resendLabel = resending
    ? "SENDING..."
    : cooldown > 0
      ? `RESEND IN ${cooldown}S`
      : "RESEND EMAIL";

  const alert = error && (
    <div
      role="alert"
      className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm leading-6 text-red-700"
    >
      <AlertCircle size={18} className="mt-1 shrink-0" />
      <span>{error}</span>
    </div>
  );

  const info = notice && (
    <div
      role="status"
      className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-sm leading-6 text-blue-800"
    >
      <MailCheck size={18} className="mt-1 shrink-0" />
      <span>{notice}</span>
    </div>
  );

  return (
    <AuthShell
      eyebrow="ONE QUICK STEP"
      headline={
        <>
          Confirm your
          <span className="block bg-gradient-to-r from-blue-300 via-cyan-300 to-white bg-clip-text text-transparent">
            email.
          </span>
        </>
      }
      text="We only ask once, when you join. After that you can sign in anytime."
      points={[
        "Order updates sent to the right inbox",
        "Easier account recovery",
        "Takes a few seconds",
      ]}
    >
      {status === "loading" && (
        <div role="status">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <RefreshCw size={24} className="animate-spin" />
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
            One moment.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            We&rsquo;re checking your email address.
          </p>
        </div>
      )}

      {status === "verified" && (
        <div role="status">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <CheckCircle2 size={26} />
          </div>

          <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-emerald-600">
            EMAIL VERIFIED
          </p>

          <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
            You&rsquo;re all set!
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Your email address has been confirmed. Welcome to VICWAV.
          </p>

          <Link
            href={signedIn ? continueHref : "/login"}
            className={`${primaryBtn} mt-8`}
          >
            {signedIn ? "CONTINUE" : "SIGN IN TO CONTINUE"}
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      )}

      {status === "already" && (
        <div role="status">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <ShieldCheck size={26} />
          </div>

          <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-emerald-600">
            ALREADY VERIFIED
          </p>

          <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
            You&rsquo;re verified.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Your email is already confirmed, so there&rsquo;s nothing more to
            do here.
          </p>

          <Link href={continueHref} className={`${primaryBtn} mt-8`}>
            CONTINUE
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>
      )}

      {status === "pending" && (
        <div>
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <MailCheck size={26} />
          </div>

          <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-blue-600">
            VERIFY YOUR EMAIL
          </p>

          <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
            Check your inbox.
          </h2>

          <p className="mt-3 break-words text-sm leading-7 text-slate-500">
            {sentParam || notice ? (
              <>
                We&rsquo;ve sent a verification link
                {email && (
                  <>
                    {" "}
                    to{" "}
                    <span className="font-semibold text-[#07152e]">
                      {email}
                    </span>
                  </>
                )}
                . Open the email and tap the link. Check your spam or junk
                folder if you can&rsquo;t find it.
              </>
            ) : (
              <>
                Your email hasn&rsquo;t been verified yet. Send yourself a
                verification email and tap the link inside.
              </>
            )}
          </p>

          {alert}
          {info}

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={checkAgain}
              disabled={checking}
              className={primaryBtn}
            >
              {checking ? "CHECKING..." : "I'VE VERIFIED MY EMAIL"}
              {!checking && (
                <CheckCircle2
                  size={17}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
              )}
            </button>

            <button
              type="button"
              onClick={resend}
              disabled={resending || cooldown > 0}
              className={outlineBtn}
            >
              {resendLabel}
              {!resending && cooldown <= 0 && <RefreshCw size={15} />}
            </button>
          </div>

          <Link
            href={continueHref}
            className="mt-6 flex items-center justify-center text-xs font-bold tracking-[0.18em] text-slate-500 transition hover:text-blue-700"
          >
            SKIP FOR NOW
          </Link>
        </div>
      )}

      {status === "invalid" && (
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
            It may have expired or already been used.{" "}
            {signedIn
              ? "We can send you a fresh one."
              : "Sign in and we can send you a fresh one."}
          </p>

          {alert}

          {signedIn ? (
            <button
              type="button"
              onClick={resend}
              disabled={resending}
              className={`${primaryBtn} mt-8`}
            >
              {resending ? "SENDING..." : "SEND A NEW LINK"}
              {!resending && <RefreshCw size={16} />}
            </button>
          ) : (
            <Link href="/login" className={`${primaryBtn} mt-8`}>
              SIGN IN
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
          )}
        </div>
      )}

      {status === "signedout" && (
        <div>
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
            <ShieldCheck size={26} />
          </div>

          <p className="mb-3 text-[11px] font-bold tracking-[0.25em] text-blue-600">
            VERIFY YOUR EMAIL
          </p>

          <h2 className="text-3xl font-black tracking-tight text-[#07152e] sm:text-4xl">
            Sign in first.
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Sign in to your account and we can send you a new verification
            email. If you already have a link in your inbox, just open it.
          </p>

          <Link href="/login" className={`${primaryBtn} mt-8`}>
            SIGN IN
            <ArrowRight
              size={17}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/register"
            className={`${outlineBtn} mt-3`}
          >
            CREATE AN ACCOUNT
          </Link>
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck size={15} className="text-emerald-600" />
        Your information is protected with secure sign-in.
      </div>
    </AuthShell>
  );
}

// useSearchParams must sit inside a Suspense boundary or `next build` fails.
export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyView />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { account } from "@/lib/appwrite";
import {
  CheckCircle2,
  Mail,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function VerifyPage() {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    async function verifyEmail() {
      const params = new URLSearchParams(window.location.search);

      const userId = params.get("userId");
      const secret = params.get("secret");
      const sentParam = params.get("sent");
      const sendError = params.get("sendError");

      if (sentParam === "1") {
        setSent(true);
      }

      if (sendError === "1") {
        setMessage(
          "Your account was created, but the verification email could not be sent. Please try resending it."
        );
      }

      if (!userId || !secret) {
        setLoading(false);
        return;
      }

      try {
        await account.updateVerification({
          userId,
          secret,
        });

        setVerified(true);
        setMessage("Your email address has been successfully verified.");
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "This verification link is invalid or has expired."
        );
      } finally {
        setLoading(false);
      }
    }

    verifyEmail();
  }, []);

  async function resendVerification() {
    setResending(true);
    setMessage("");

    try {
      await account.createVerification({
        url: `${window.location.origin}/verify`,
      });

      setSent(true);
      setMessage(
        "A new verification email has been sent. Please check your inbox."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to resend the verification email. Please sign in again."
      );
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="relative flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-[#f5f8ff] px-4 py-16">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-200/40 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-lg rounded-[2rem] border border-white bg-white p-8 text-center shadow-[0_30px_100px_-35px_rgba(15,35,75,0.25)] sm:p-12">
        {/* Icon */}
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
          {loading ? (
            <RefreshCw size={34} className="animate-spin" />
          ) : verified ? (
            <CheckCircle2 size={38} className="text-emerald-600" />
          ) : (
            <Mail size={36} />
          )}
        </div>

        {loading ? (
          <>
            <h1 className="text-3xl font-bold tracking-tight text-[#10234a]">
              Verifying your email
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Please wait while we confirm your email address.
            </p>
          </>
        ) : verified ? (
          <>
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-emerald-600">
              EMAIL VERIFIED
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#10234a]">
              You&apos;re all set!
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              {message}
            </p>

            <Link
              href="/account"
              className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5"
            >
              Continue to your account
              <ArrowRight size={18} />
            </Link>
          </>
        ) : (
          <>
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-blue-600">
              VICWAV ACCOUNT SECURITY
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#10234a]">
              Check your inbox.
            </h1>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              {sent
                ? "We've sent you an email verification link. Open the email and click the link to verify your account."
                : "Your email address has not been verified yet. Request a verification email to continue."}
            </p>

            {message && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-left text-sm leading-6 text-blue-800"
              >
                <AlertCircle size={18} className="mt-1 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-5 text-left">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 shrink-0 text-blue-700"
                />

                <div>
                  <p className="text-sm font-bold text-[#10234a]">
                    One quick step remaining
                  </p>

                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    Check your spam or junk folder if the email is not in your
                    inbox.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={resendVerification}
              disabled={resending}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resending ? "SENDING EMAIL..." : "RESEND VERIFICATION EMAIL"}

              {!resending && <RefreshCw size={17} />}
            </button>

            <Link
              href="/login"
              className="mt-6 inline-flex text-sm font-semibold text-blue-700 transition hover:text-cyan-700"
            >
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

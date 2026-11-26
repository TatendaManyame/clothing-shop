
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Models } from "appwrite";
import { account } from "@/lib/appwrite";

export default function AccountSettingsPage() {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAccount() {
      try {
        const currentUser = await account.get();

        if (active) {
          setUser(currentUser);
          setName(currentUser.name || "");
        }
      } catch {
        if (active) {
          window.location.href = "/login";
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAccount();

    return () => {
      active = false;
    };
  }, []);

  async function handleNameUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Please enter your full name.");
      return;
    }

    setSavingName(true);

    try {
      const updatedUser = await account.updateName({ name: trimmedName });
      setUser(updatedUser);
      setName(updatedUser.name);
      setSuccess("Your name has been updated successfully.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to update your name."
      );
    } finally {
      setSavingName(false);
    }
  }

  async function handlePasswordUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword.length < 8) {
      setError("Your new password must contain at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Your new passwords do not match.");
      return;
    }

    setChangingPassword(true);

    try {
      await account.updatePassword({
        password: newPassword,
        oldPassword: currentPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Your password has been changed successfully.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Unable to change your password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <p className="text-xs font-bold tracking-[0.2em] text-[#07152e]">
          LOADING SETTINGS...
        </p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12 text-slate-900">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10">
          <Link
            href="/account"
            className="text-sm font-semibold text-blue-700 hover:text-blue-900"
          >
            ← Back to My Account
          </Link>

          <p className="mt-8 text-xs font-bold tracking-[0.25em] text-blue-600">
            ACCOUNT PREFERENCES
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight text-[#07152e]">
            Account Settings
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Manage your personal information and account security.
          </p>
        </div>

        {success && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <div className="grid gap-7 lg:grid-cols-3">
          <div className="space-y-7 lg:col-span-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-[#07152e]">
                Personal information
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Update the name associated with your VICWAV account.
              </p>

              <form onSubmit={handleNameUpdate} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your full name"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingName}
                  className="rounded-lg bg-[#07152e] px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingName ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </form>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-[#07152e]">
                Password and security
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Choose a strong password to keep your account secure.
              </p>

              <form onSubmit={handlePasswordUpdate} className="mt-7 space-y-5">
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Current password
                  </label>

                  <input
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Enter your current password"
                  />
                </div>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold"
                  >
                    New password
                  </label>

                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Confirm new password
                  </label>

                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Confirm your new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={changingPassword}
                  className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {changingPassword ? "UPDATING..." : "CHANGE PASSWORD"}
                </button>
              </form>
            </section>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-lg font-bold text-[#07152e]">
              Account details
            </h2>

            <div className="mt-6 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email address
                </p>
                <p className="mt-2 break-all text-sm font-medium">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Account ID
                </p>
                <p className="mt-2 break-all text-xs font-medium text-slate-600">
                  {user.$id}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Email verification
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                    user.emailVerification
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {user.emailVerification ? "Verified" : "Not verified"}
                </span>
              </div>
            </div>

            <Link
              href="/account/orders"
              className="mt-8 block rounded-lg border border-slate-200 px-4 py-3 text-center text-sm font-bold text-[#07152e] transition hover:bg-slate-50"
            >
              VIEW MY ORDERS
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  MapPin,
  Music2,
  Package,
  Plus,
  RotateCcw,
  Send,
  HelpCircle,
} from "lucide-react";

/* ---------- content ---------- */

const topics = [
  "Order question",
  "Shipping & delivery",
  "Returns & exchanges",
  "Product or sizing",
  "Wholesale & collabs",
  "Something else",
];

const quickLinks = [
  {
    icon: Package,
    title: "Shipping Information",
    text: "Delivery times and costs",
    href: "/shipping",
  },
  {
    icon: RotateCcw,
    title: "Returns & Exchanges",
    text: "How to send something back",
    href: "/returns",
  },
  {
    icon: HelpCircle,
    title: "FAQs",
    text: "Quick answers to common questions",
    href: "/faq",
  },
];

const faqs = [
  {
    q: "How do I track my order?",
    a: "Sign in to your account and open My Orders to see the status of every order you've placed.",
  },
  {
    q: "Can I change or cancel an order?",
    a: "Message us as soon as you can with your order details and we'll do our best to update it before it ships.",
  },
  {
    q: "What if my item doesn't fit?",
    a: "No problem. Check our Returns & Exchanges page for the steps, or contact us and we'll help you find the right size.",
  },
  {
    q: "Do you work with creators and stores?",
    a: "Yes. Choose Wholesale & collabs in the form above and tell us a bit about yourself.",
  },
];

const socialCls =
  "grid h-11 w-11 place-items-center rounded-full border border-white/15 text-slate-200 transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:bg-cyan-300 hover:text-[#07152e]";

type Status = "idle" | "sending" | "sent" | "error";

/* ---------- send message ---------- */

/**
 * Wire this up to wherever messages should go (an Appwrite function or
 * database collection, an email service, etc.). It must throw on failure.
 */
async function sendMessage(data: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.error || "We couldn't send your message. Please try again."
    );
  }

  return result;
}

/* ---------- page ---------- */

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(topics[0]);
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState(""); // honeypot, real people leave it empty
  const [status, setStatus] = useState<Status>("idle");
  const [open, setOpen] = useState<number | null>(0);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "sending") return;

    // bots fill hidden fields; pretend it worked and drop it
    if (trap) {
      setStatus("sent");
      return;
    }

    try {
      setStatus("sending");
      await sendMessage({
        name: name.trim(),
        email: email.trim(),
        topic,
        message: message.trim(),
      });
      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
      setTopic(topics[0]);
    } catch (err) {
      console.error("Could not send message", err);
      setStatus("error");
    }
  }

  const field =
    "w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:shadow-md focus:shadow-blue-500/10";

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-[#07152e]">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ================= HERO ================= */}
      <section className="relative isolate overflow-hidden bg-[#07152e] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_75%_40%,#1d4f86_0%,#0c2547_38%,#07152e_72%)]" />

        <div
          aria-hidden="true"
          className="cu-ghost pointer-events-none absolute inset-x-0 top-[4%] select-none text-center text-[22vw] font-black leading-none tracking-[-0.04em]"
        >
          HELLO
        </div>

        <div className="cu-glow pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-blue-500/25 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-12 md:py-28">
          <div className="cu-fade mb-6 flex items-center gap-3">
            <span className="h-px w-10 bg-cyan-400" />
            <p className="text-[10px] font-bold tracking-[0.35em] text-cyan-300 md:text-xs">
              CONTACT US
            </p>
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.055em] md:text-7xl">
            LET&rsquo;S <span className="cu-shine">TALK.</span>
          </h1>

          <p
            className="cu-fade mt-7 max-w-lg text-sm leading-8 text-white/75 md:text-base"
            style={{ animationDelay: "300ms" }}
          >
            Questions about an order, sizing or working together? Send us a
            message and a real person from the VicWav team will get back to you.
          </p>
        </div>
      </section>

      {/* ================= FORM + INFO ================= */}
      <section className="mx-auto max-w-7xl px-5 py-14 md:px-10 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
          {/* form */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-10">
            {status === "sent" ? (
              <div className="py-12 text-center" role="status">
                <div className="cu-pop mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check size={28} />
                </div>

                <h2 className="mt-6 text-2xl font-black">Message sent</h2>

                <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-500">
                  Thanks for reaching out. We&rsquo;ll reply to the email you
                  gave us as soon as we can.
                </p>

                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 rounded-full border border-[#07152e] px-8 py-3.5 text-xs font-bold tracking-widest transition hover:bg-[#07152e] hover:text-white"
                >
                  SEND ANOTHER
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate={false}>
                <h2 className="text-2xl font-black tracking-tight md:text-3xl">
                  Send us a message
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  All fields are required.
                </p>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold tracking-[0.15em]">
                      NAME
                    </span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className={field}
                    />
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-[11px] font-bold tracking-[0.15em]">
                      EMAIL
                    </span>
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={field}
                    />
                  </label>
                </div>

                <div className="mt-6">
                  <span className="mb-3 block text-[11px] font-bold tracking-[0.15em]">
                    WHAT&rsquo;S IT ABOUT?
                  </span>

                  <div className="flex flex-wrap gap-2" role="group">
                    {topics.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTopic(t)}
                        aria-pressed={topic === t}
                        className={`rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
                          topic === t
                            ? "border-[#07152e] bg-[#07152e] text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-400 hover:text-blue-700"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="mt-6 block">
                  <span className="mb-2 block text-[11px] font-bold tracking-[0.15em]">
                    MESSAGE
                  </span>
                  <textarea
                    required
                    rows={6}
                    minLength={10}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us how we can help. If it's about an order, include your order number."
                    className={`${field} resize-y`}
                  />
                </label>

                {/* honeypot */}
                <div className="absolute -left-[9999px]" aria-hidden="true">
                  <label>
                    Leave this empty
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={trap}
                      onChange={(e) => setTrap(e.target.value)}
                    />
                  </label>
                </div>

                {status === "error" && (
                  <p
                    role="alert"
                    className="mt-5 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700"
                  >
                    Something went wrong and your message wasn&rsquo;t sent.
                    Please try again in a moment.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="cu-btn group mt-8 inline-flex items-center gap-4 rounded-full bg-[#07152e] px-8 py-4 text-xs font-bold tracking-[0.15em] text-white transition hover:text-[#07152e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span>
                    {status === "sending" ? "SENDING..." : "SEND MESSAGE"}
                  </span>
                  <Send
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </form>
            )}
          </div>

          {/* info */}
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-3xl bg-[#07152e] p-8 text-white md:p-10">
              <div className="cu-glow pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-500/30 blur-[90px]" />

              <h2 className="relative text-xl font-black tracking-tight">
                Find us
              </h2>

              <span className="relative mt-3 block h-0.5 w-8 rounded-full bg-cyan-400" />

              <ul className="relative mt-7 space-y-5 text-sm text-slate-300">
                <li className="flex items-start gap-4">
                  <MapPin size={18} className="mt-0.5 shrink-0 text-cyan-300" />
                  <span>
                    <span className="block font-semibold text-white">
                      Based in
                    </span>
                    Harare, Zimbabwe
                  </span>
                </li>
              </ul>

              <p className="relative mt-8 text-[11px] font-bold tracking-[0.2em] text-white/60">
                FOLLOW THE WAVE
              </p>

              <div className="relative mt-4 flex items-center gap-3">
                <a
                  href="https://www.instagram.com/vicwav/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className={socialCls}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                  </svg>
                </a>

                <a
                  href="https://www.facebook.com/vicwav/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className={socialCls}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M15 4h-2.5A3.5 3.5 0 0 0 9 7.5V10H6.5v3.5H9V21h3.5v-7.5H15l.5-3.5h-3V7.8c0-.5.4-.8.9-.8H15V4z" />
                  </svg>
                </a>

                <a
                  href="https://www.tiktok.com/@vicwav"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className={socialCls}
                >
                  <Music2 size={18} />
                </a>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              {quickLinks.map(({ icon: Icon, title, text, href }) => (
                <Link
                  key={title}
                  href={href}
                  className="group flex items-center gap-4 rounded-2xl p-4 transition hover:bg-[#f6f8fc]"
                >
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-[#07152e] group-hover:text-cyan-300">
                    <Icon size={20} />
                  </span>

                  <span className="flex-1">
                    <span className="block text-sm font-bold">{title}</span>
                    <span className="block text-xs text-slate-500">{text}</span>
                  </span>

                  <ArrowUpRight
                    size={18}
                    className="text-slate-400 transition group-hover:rotate-12 group-hover:text-blue-700"
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="mx-auto max-w-3xl px-5 pb-20 md:px-10 md:pb-28">
        <p className="mb-3 text-center text-xs tracking-[0.2em] text-slate-500">
          BEFORE YOU WRITE
        </p>

        <h2 className="text-center text-3xl font-black tracking-tight md:text-5xl">
          QUICK ANSWERS
        </h2>

        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const on = open === i;

            return (
              <div
                key={f.q}
                className={`overflow-hidden rounded-2xl border bg-white transition ${
                  on ? "border-blue-300 shadow-md shadow-blue-500/10" : "border-slate-200"
                }`}
              >
                <button
                  onClick={() => setOpen(on ? null : i)}
                  aria-expanded={on}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-sm font-bold md:text-base"
                >
                  {f.q}

                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition duration-300 ${
                      on
                        ? "rotate-45 bg-[#07152e] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Plus size={16} />
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-sm leading-7 text-slate-500">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Still stuck? Read the full{" "}
          <Link
            href="/faq"
            className="font-bold text-blue-700 underline-offset-4 hover:underline"
          >
            FAQs
          </Link>
          .
        </p>
      </section>
    </main>
  );
}

/* ---------- styles ---------- */

const css = `
.cu-fade{opacity:0;transform:translateY(16px);animation:cu-fade .9s cubic-bezier(.2,.8,.2,1) forwards;animation-delay:.1s}
@keyframes cu-fade{to{opacity:1;transform:none}}

.cu-shine{background:linear-gradient(100deg,#fff 20%,#67e8f9 45%,#fff 70%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:cu-shine 5s linear infinite}
@keyframes cu-shine{to{background-position:-250% 0}}

.cu-ghost{color:transparent;-webkit-text-stroke:1.5px rgba(125,211,252,.22);background:linear-gradient(100deg,transparent 30%,rgba(103,232,249,.4) 50%,transparent 70%) 0 0/250% 100% no-repeat;-webkit-background-clip:text;background-clip:text;animation:cu-ghost 7s linear infinite}
@keyframes cu-ghost{from{background-position:150% 0}to{background-position:-150% 0}}

.cu-glow{animation:cu-glow 9s ease-in-out infinite alternate}
@keyframes cu-glow{to{transform:translate(60px,40px) scale(1.2);opacity:.7}}

.cu-btn{position:relative;overflow:hidden;isolation:isolate}
.cu-btn::before{content:"";position:absolute;inset:0;z-index:-1;background:#67e8f9;transform:translateY(101%);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.cu-btn:hover::before{transform:none}

.cu-pop{animation:cu-pop .5s cubic-bezier(.3,1.8,.5,1)}
@keyframes cu-pop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}

a:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid #22d3ee;outline-offset:3px}

@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .cu-fade{opacity:1!important;transform:none!important}
}
`;
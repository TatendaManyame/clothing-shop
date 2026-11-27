"use client";
/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { Storage } from "appwrite";
import { CheckCircle2 } from "lucide-react";
import { client } from "@/lib/appwrite";

const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID;

if (!bucketId) {
  throw new Error("Missing NEXT_PUBLIC_APPWRITE_BUCKET_ID");
}

const hoodie = new Storage(client)
  .getFileView({ bucketId, fileId: "hoodie-cutout" })
  .toString();

export default function AuthShell({
  eyebrow,
  headline,
  text,
  points,
  children,
}: {
  eyebrow: string;
  headline: ReactNode;
  text: string;
  points: string[];
  children: ReactNode;
}) {
  return (
    <main className="relative isolate flex min-h-[calc(100vh-5rem)] items-center justify-center overflow-hidden bg-[#f5f8ff] px-4 py-8 sm:px-6 lg:py-14">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-blue-200/40 blur-[100px]" />
        <div className="absolute -right-40 bottom-0 h-[30rem] w-[30rem] rounded-full bg-cyan-200/40 blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(#10234a_1px,transparent_1px),linear-gradient(90deg,#10234a_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_100px_-35px_rgba(15,35,75,0.28)] lg:min-h-[700px] lg:grid-cols-[1.05fr_0.95fr]">
        {/* ---------- brand panel ---------- */}
        <section className="relative hidden flex-col justify-between overflow-hidden bg-[#07152e] p-12 text-white lg:flex xl:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_70%,#1d4f86_0%,#0c2547_40%,#07152e_75%)]" />
          <div className="au-glow pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-blue-500/30 blur-[100px]" />

          <div
            aria-hidden="true"
            className="au-ghost pointer-events-none absolute -left-4 top-[36%] select-none text-[9rem] font-black leading-none tracking-[-0.04em]"
          >
            VICWAV
          </div>

          {/* hoodie pop-out */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-0 right-0 w-[38%]"
          >
            <div className="au-arch absolute inset-x-[8%] bottom-0 top-[22%]" />
            <img
              src={hoodie}
              alt=""
              width={711}
              height={891}
              className="relative block h-auto w-full drop-shadow-[0_25px_30px_rgba(0,0,0,0.45)]"
            />
          </div>

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

          <div className="relative z-10 max-w-sm">
            <p className="mb-5 flex items-center gap-3 text-[10px] font-bold tracking-[0.3em] text-cyan-300">
              <span className="h-px w-8 bg-cyan-400" />
              {eyebrow}
            </p>

            <h1 className="text-4xl font-black leading-[1.02] tracking-[-0.04em] xl:text-5xl">
              {headline}
            </h1>

            <p className="mt-6 text-sm leading-7 text-blue-100/70">{text}</p>

            <ul className="mt-8 space-y-3.5">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-300/10 text-cyan-300">
                    <CheckCircle2 size={14} />
                  </span>
                  <span className="text-sm text-blue-100/80">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative z-10 text-xs text-blue-100/40">
            © 2026 VICWAV. All rights reserved.
          </p>
        </section>

        {/* ---------- form side ---------- */}
        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14 xl:px-20">
          <div className="au-in w-full max-w-md">
            <Link href="/" className="mb-9 inline-flex items-center lg:hidden">
              <Image
                src="/logo.png"
                alt="VICWAV"
                width={160}
                height={50}
                priority
                className="h-10 w-auto object-contain"
              />
            </Link>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

const css = `
.au-in{opacity:0;animation:au-in .7s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes au-in{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}

.au-ghost{color:transparent;-webkit-text-stroke:1.5px rgba(125,211,252,.2);background:linear-gradient(100deg,transparent 30%,rgba(103,232,249,.4) 50%,transparent 70%) 0 0/250% 100% no-repeat;-webkit-background-clip:text;background-clip:text;animation:au-ghost 7s linear infinite}
@keyframes au-ghost{from{background-position:150% 0}to{background-position:-150% 0}}

.au-glow{animation:au-glow 9s ease-in-out infinite alternate}
@keyframes au-glow{to{transform:translate(60px,40px) scale(1.2);opacity:.7}}

.au-arch{border-radius:2.5rem 2.5rem 0 0;border:1px solid rgba(165,243,252,.25);border-bottom:0;background:linear-gradient(to bottom,rgba(103,232,249,.35),rgba(37,99,235,.25) 60%,rgba(103,232,249,.08));box-shadow:0 0 70px rgba(59,130,246,.3)}

.au-btn{position:relative;overflow:hidden;isolation:isolate}
.au-btn::before{content:"";position:absolute;inset:0;z-index:-1;background:#67e8f9;transform:translateY(101%);transition:transform .4s cubic-bezier(.2,.8,.2,1)}
.au-btn:not(:disabled):hover::before{transform:none}

@media (prefers-reduced-motion:reduce){
  .au-in{opacity:1;animation:none}
  .au-ghost,.au-glow{animation:none}
}
`;
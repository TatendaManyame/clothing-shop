
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type SiteLayoutProps = {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
};

export default function SiteLayout({
  children,
  navbar,
  footer,
}: SiteLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-full w-full flex-1 flex-col">
      {navbar}
      <div className="flex-1">{children}</div>
      {footer}
    </div>
  );
}

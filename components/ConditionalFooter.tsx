"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@components/footer";

export function ConditionalFooter() {
  const pathname = usePathname();

  // Ocultar footer en rutas /tree
  if (pathname?.startsWith("/tree")) {
    return null;
  }

  return <Footer />;
}

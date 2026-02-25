"use client";

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createOptimizedQueryClient } from "@lib/react-query";
import { Toaster } from "sonner";

type ProvidersProps = {
  children: React.ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = React.useState(() => createOptimizedQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            background: "var(--card)",
            border: "1px solid var(--border)",
            color: "var(--text)",
          },
          className: "dark:bg-card dark:border-border dark:text-text",
        }}
      />
    </QueryClientProvider>
  );
}



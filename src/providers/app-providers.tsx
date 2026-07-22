"use client";

import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/providers/auth-provider";
import { LocaleProvider } from "@/providers/locale-provider";
import { CurrencyProvider } from "@/providers/currency-provider";
import { CompareProvider } from "@/providers/compare-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <LocaleProvider>
        <CurrencyProvider>
          <AuthProvider>
            <CompareProvider>
              {children}
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: "#0f172a",
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.1)",
                  },
                }}
              />
            </CompareProvider>
          </AuthProvider>
        </CurrencyProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

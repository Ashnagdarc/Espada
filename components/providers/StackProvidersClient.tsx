"use client";

import React, { Suspense } from "react";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackClientApp } from "../../stack/client";
import { ThemeProvider } from "./ThemeProvider";
import { CartProvider } from "../../contexts/CartContext";
import { LocaleProvider } from "../../contexts/LocaleContext";
import { ToastProvider } from "../../contexts/ToastContext";
import { CustomerAuthProvider } from "../../contexts/CustomerAuthContext";

export default function StackProvidersClient({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StackProvider app={stackClientApp}>
      <StackTheme>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <LocaleProvider>
            <CartProvider>
              <Suspense
                fallback={
                  <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                  </div>
                }
              >
                <CustomerAuthProvider>
                  <ToastProvider>{children}</ToastProvider>
                </CustomerAuthProvider>
              </Suspense>
            </CartProvider>
          </LocaleProvider>
        </ThemeProvider>
      </StackTheme>
    </StackProvider>
  );
}

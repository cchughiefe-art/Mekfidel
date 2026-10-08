"use client";

import { PageText } from "@/components/layout/page-text";
import { ContentSync } from "@/components/layout/content-sync";
import { QueryProvider } from "@/providers/query-provider";
import { ToastProvider } from "@/providers/toast-provider";
import { CartProvider } from "@/providers/cart-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSidebar } from "@/components/layout/cart-sidebar";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { usePathname } from "next/navigation";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin =
    pathname?.startsWith("/admin") || pathname?.startsWith("/auth");

  return (
    <QueryProvider>
      <CartProvider>
        <ToastProvider />
        <ContentSync />
        {!isAdmin && <Header />}
        <main className={isAdmin ? "" : "min-h-screen"}>
          {!isAdmin && <PageText placement="top" />}
          {children}
          {!isAdmin && <PageText placement="bottom" />}
        </main>
        {!isAdmin && <Footer />}
        {!isAdmin && <WhatsAppButton />}
        {!isAdmin && <CartSidebar />}
      </CartProvider>
    </QueryProvider>
  );
}

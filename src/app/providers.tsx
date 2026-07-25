'use client';

import { QueryProvider } from '@/providers/query-provider';
import { ToastProvider } from '@/providers/toast-provider';
import { CartProvider } from '@/providers/cart-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { CartSidebar } from '@/components/layout/cart-sidebar';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') || pathname?.startsWith('/auth');

  return (
    <QueryProvider>
      <CartProvider>
        <ToastProvider />
        {!isAdmin && <Header />}
        <main className={isAdmin ? '' : 'min-h-screen'}>{children}</main>
        {!isAdmin && <Footer />}
        {!isAdmin && <WhatsAppButton />}
        <CartSidebar />
      </CartProvider>
    </QueryProvider>
  );
}


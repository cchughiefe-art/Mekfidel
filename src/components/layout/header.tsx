"use client";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Modal } from "@/components/ui/modal";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useCart } from "@/providers/cart-provider";
import { useQuery } from "@tanstack/react-query";
import { safeUrl } from "@/lib/utils/safe-content";
import { useSettings } from "@/hooks/use-supabase-query";
import {
  Menu,
  X,
  ShoppingCart,
  Search,
  Smartphone,
  ArrowUpRight,
  Package,
  Phone,
} from "lucide-react";
const defaultNavigation = [
  { name: "All products", href: "/products" },
  { name: "Screen compatibility", href: "/phone-screen-compatibility" },
  { name: "Supply services", href: "/services" },
  { name: "About Mekfidel", href: "/about" },
  { name: "Journal", href: "/blog" },
  { name: "Help & FAQ", href: "/faq" },
];
type NavigationLink = { name: string; href: string; is_new_tab?: boolean };
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { data: settings } = useSettings();
  const { data: menu } = useQuery({
    queryKey: ["public-navigation"],
    queryFn: async () => {
      const response = await fetch("/api/navigation?location=header");
      if (!response.ok) throw new Error("Navigation unavailable");
      return response.json();
    },
  });
  const navigation: NavigationLink[] =
    menu === undefined
      ? defaultNavigation
      : menu.map(
          (item: { label: string; url: string; is_new_tab: boolean }) => ({
            name: item.label,
            href: safeUrl(item.url),
            is_new_tab: item.is_new_tab,
          }),
        );
  const links = (mobile = false) =>
    navigation.map((item) => (
      <Link
        key={item.href + item.name}
        href={item.href}
        onClick={() => setMenuOpen(false)}
        target={item.is_new_tab ? "_blank" : undefined}
        rel={item.is_new_tab ? "noopener noreferrer" : undefined}
        aria-current={pathname === item.href ? "page" : undefined}
        className={cn(
          mobile
            ? "block rounded-lg px-3 py-3 text-sm"
            : "whitespace-nowrap py-3.5 text-xs font-semibold",
          pathname === item.href
            ? "text-slate-950 underline decoration-lime-400 decoration-2 underline-offset-8"
            : "text-slate-500 hover:text-slate-950",
        )}
      >
        {item.name}
      </Link>
    ));
  return (
    <>
      <div className="bg-slate-950 text-slate-300">
        <div className="container-custom flex items-center justify-between gap-3 py-2.5 text-[11px]">
          <p className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-lime-300" />
            Your repair supply partner
          </p>
          <Link href="/contact" className="flex items-center gap-2 text-white">
            Talk to the team
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="container-custom flex h-20 items-center gap-2 sm:gap-5 lg:gap-10">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="Mekfidel home"
          >
            {settings?.logo ? (
              <OptimizedImage
                src={settings.logo}
                alt=""
                className="hidden h-10 w-10 rounded-xl object-contain min-[380px]:block"
              />
            ) : (
              <span className="hidden h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-lime-300 min-[380px]:flex">
                <LayersLogo />
              </span>
            )}
            <span>
              <span className="block text-xl font-extrabold tracking-tight text-slate-950">
                mekfidel<span className="text-lime-600">.</span>
              </span>
              <span className="block text-[8px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                Communication Ltd
              </span>
            </span>
          </Link>
          <form
            action="/search"
            className="hidden max-w-xl flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 md:flex"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              name="q"
              aria-label="Search parts, tools and models"
              placeholder="Search parts, tools or a phone model…"
              className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="text-xs font-semibold text-slate-500"
            >
              Search
            </button>
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/contact"
              className="mr-3 hidden items-center gap-2 text-xs font-semibold text-slate-700 lg:flex"
            >
              <Phone className="h-4 w-4" />
              Need a part?
            </Link>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search the catalogue"
              className="rounded-xl p-3 hover:bg-slate-100 md:hidden"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={openCart}
              aria-label={`Cart with ${totalItems} items`}
              className="flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-3 text-white"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="hidden text-xs font-semibold sm:inline">
                Order desk
              </span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded bg-lime-300 px-1 text-[10px] font-bold text-slate-950">
                {totalItems > 99 ? "99+" : totalItems}
              </span>
            </button>
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              className="rounded-xl p-3 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="hidden border-t border-slate-100 lg:block">
          <nav
            aria-label="Main navigation"
            className="container-custom flex items-center gap-7 overflow-x-auto"
          >
            {links()}
            <Link
              href="/contact"
              className="ml-auto whitespace-nowrap text-xs font-semibold"
            >
              Contact
              <ArrowUpRight className="ml-1 inline h-3 w-3" />
            </Link>
          </nav>
        </div>
      </header>
      <Modal
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Explore Mekfidel"
      >
        <nav aria-label="Mobile navigation">
          {links(true)}
          <Link
            href="/contact"
            className="block px-3 py-3"
            onClick={() => setMenuOpen(false)}
          >
            Contact the team
          </Link>
        </nav>
      </Modal>
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  );
}
function LayersLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
      <path
        d="m4 8 8-4 8 4-8 4-8-4Zm0 5 8 4 8-4M4 18l8 4 8-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    products: Array<{
      id: string;
      slug: string;
      name: string;
      price: number;
      images: string[];
      category?: { name: string };
    }>;
    posts: Array<{ id: string; slug: string; title: string; excerpt?: string }>;
  }>({ products: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setSearchError("");
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Search failed");
        if (!controller.signal.aborted) setResults(data);
      } catch {
        if (!controller.signal.aborted) {
          setSearchError("Search could not be loaded. Try again.");
          setResults({ products: [], posts: [] });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  const visibleResults =
    query.length >= 2 ? results : { products: [], posts: [] };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Search the website"
      size="full"
    >
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products and blog"
            placeholder="Search products and blog…"
            className="flex-1 text-lg outline-none bg-transparent"
            autoFocus
          />
          <button
            aria-label="Close search"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="max-h-96 overflow-y-auto p-4">
        {searchError && (
          <p role="alert" className="text-sm text-red-600">
            {searchError}
          </p>
        )}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}
        {!loading &&
          !searchError &&
          visibleResults.products.length === 0 &&
          visibleResults.posts.length === 0 &&
          query.length >= 2 && (
            <p className="text-center text-gray-500 py-8">
              No results found for &quot;{query}&quot;
            </p>
          )}
        {visibleResults.products.length > 0 && (
          <div className="mb-6">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Products
            </h4>
            <div className="space-y-2">
              {visibleResults.products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                    {product.images?.[0] ? (
                      <OptimizedImage
                        src={product.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      ₦{product.price?.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        {visibleResults.posts.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Blog Posts
            </h4>
            <div className="space-y-2">
              {visibleResults.posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  onClick={onClose}
                  className="block p-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <p className="font-medium text-gray-900">{post.title}</p>
                  <p className="text-sm text-gray-500">{post.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

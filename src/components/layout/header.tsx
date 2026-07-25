'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useCart } from '@/providers/cart-provider';
import { useSettings } from '@/hooks/use-supabase-query';
import { 
  Menu, X, ShoppingCart, Search, ChevronDown, 
  Smartphone, Package, Wrench, ChevronRight, Phone 
} from 'lucide-react';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Products', href: '/products' },
  { name: 'Phone Screen Compatibility', href: '/phone-screen-compatibility' },
  { name: 'Services', href: '/services' },
  { name: 'About', href: '/about' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
  { name: 'FAQ', href: '/faq' },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();
  const { data: settings } = useSettings();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <>
      {/* Top Bar */}
      <div className="hidden lg:block bg-gray-900 text-white text-sm">
        <div className="container-custom flex items-center justify-between py-2">
          <div className="flex items-center gap-6">
            <a href={`tel:${settings?.phone || '+2348000000000'}`} className="flex items-center gap-1.5 hover:text-blue-300 transition-colors">
              <Phone className="w-3.5 h-3.5" />
              {settings?.phone || '+234 800 000 0000'}
            </a>
            <span className="text-gray-500">|</span>
            <span>{settings?.business_hours || 'Mon - Sat: 8AM - 6PM'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{settings?.company_name || 'Mekfidel Communication Ltd'}</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm'
            : 'bg-white'
        )}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900 block leading-tight">Mekfidel</span>
                <span className="text-[10px] text-gray-500 block leading-tight tracking-wider uppercase">Communication</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1">
              {navigation.map(item => {
                const isActive = pathname === item.href || 
                  (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </button>

              <button
                onClick={openCart}
                className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label={`Cart with ${totalItems} items`}
              >
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            'xl:hidden overflow-hidden transition-all duration-300',
            isMobileMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="container-custom pb-4 border-t border-gray-100 pt-2">
            <nav className="space-y-1">
              {navigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all',
                      isActive
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    {item.name}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {isSearchOpen && (
        <SearchOverlay onClose={() => setIsSearchOpen(false)} />
      )}
    </>
  );
}

function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ products: any[]; posts: any[] }>({ products: [], posts: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults({ products: [], posts: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults({ products: [], posts: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white mt-20 mx-auto max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products, phone models, blog..."
              className="flex-1 text-lg outline-none bg-transparent"
              autoFocus
            />
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto p-4">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}
          {!loading && results.products.length === 0 && results.posts.length === 0 && query.length >= 2 && (
            <p className="text-center text-gray-500 py-8">No results found for &quot;{query}&quot;</p>
          )}
          {results.products.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Products</h4>
              <div className="space-y-2">
                {results.products.map((product: any) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Smartphone className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">₦{product.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {results.posts.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Blog Posts</h4>
              <div className="space-y-2">
                {results.posts.map((post: any) => (
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
      </div>
    </div>
  );
}


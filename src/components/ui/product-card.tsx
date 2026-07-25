'use client';

import { cn } from '@/lib/utils/cn';
import { formatPrice } from '@/lib/utils/format';
import { ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';
import { PlaceholderImage } from './placeholder-image';
import { Badge } from './badge';
import { Button } from './button';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onAddToCart, className }: ProductCardProps) {
  const imageUrl = product.images?.[0];
  const inStock = product.availability === 'in_stock' && product.stock > 0;

  return (
    <div
      className={cn(
        'group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden',
        'hover:shadow-xl hover:-translate-y-1 transition-all duration-300',
        className
      )}
    >
      <Link href={`/products/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage text={product.name} />
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.compare_price && product.compare_price > product.price && (
            <Badge variant="danger">Sale</Badge>
          )}
          {product.is_featured && (
            <Badge variant="info">Featured</Badge>
          )}
        </div>
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="warning" className="text-sm px-4 py-1.5">Out of Stock</Badge>
          </div>
        )}
      </Link>

      <div className="p-4 space-y-3">
        {product.brand && (
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{product.brand.name}</p>
        )}
        
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <p className="text-xs text-gray-400">{product.category.name}</p>
        )}

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <Star key={star} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="text-xs text-gray-400 ml-1">(0)</span>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div>
            <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
            {product.compare_price && product.compare_price > product.price && (
              <span className="text-sm text-gray-400 line-through ml-2">{formatPrice(product.compare_price)}</span>
            )}
          </div>
          <Button
            size="sm"
            variant={inStock ? 'primary' : 'ghost'}
            disabled={!inStock}
            onClick={(e) => {
              e.preventDefault();
              onAddToCart?.(product);
            }}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}


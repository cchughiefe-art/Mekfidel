"use client";
import { OptimizedImage } from "@/components/ui/optimized-image";

import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils/format";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { PlaceholderImage } from "./placeholder-image";
import { Badge } from "./badge";
import { Button } from "./button";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  className?: string;
}

export function ProductCard({
  product,
  onAddToCart,
  className,
}: ProductCardProps) {
  const imageUrl = product.images?.[0];
  const inStock =
    product.availability === "pre_order" ||
    (product.availability === "in_stock" && product.stock > 0);

  return (
    <div
      className={cn(
        "group flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden",
        "hover:border-slate-400 hover:shadow-lg transition-all duration-300",
        className,
      )}
    >
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-[1.1] overflow-hidden bg-gray-50"
      >
        {imageUrl ? (
          <OptimizedImage
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-5 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <PlaceholderImage text={product.name} />
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {Number(product.compare_price) > 0 &&
            Number(product.compare_price) > product.price && (
              <Badge variant="danger">Sale</Badge>
            )}
          {product.is_featured && <Badge variant="info">Featured</Badge>}
        </div>
        {product.availability === "pre_order" && (
          <Badge variant="info" className="absolute bottom-3 left-3">
            Pre-order
          </Badge>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="warning" className="text-sm px-4 py-1.5">
              Out of Stock
            </Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        {product.brand && (
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
            {product.brand.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {product.category && (
          <p className="text-xs text-gray-400">{product.category.name}</p>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
          <div>
            <span className="text-lg font-bold tracking-tight text-gray-900">
              {formatPrice(product.price)}
            </span>
            {Number(product.compare_price) > 0 &&
              Number(product.compare_price) > product.price && (
                <span className="text-sm text-gray-400 line-through ml-2">
                  {formatPrice(Number(product.compare_price))}
                </span>
              )}
          </div>
          <Button
            size="sm"
            variant={inStock ? "primary" : "ghost"}
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

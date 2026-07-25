'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils/format';
import { useCart } from '@/providers/cart-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { 
  ShoppingCart, Minus, Plus, Check, Truck, Shield, 
  RotateCcw, Clock, Star, ChevronLeft, Share2 
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const supabase = createClient();
  const { addItem, openCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: product, isLoading, error, refetch } = useQuery({
    queryKey: ['product', params.slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*)
        `)
        .eq('slug', params.slug)
        .single();
      if (error) throw error;

      // Increment view count
      try { await supabase.rpc('increment_product_views', { product_id: data.id }); } catch {}
      
      return data as Product;
    },
  });

  const { data: relatedProducts } = useQuery({
    queryKey: ['related-products', product?.category_id, product?.id],
    queryFn: async () => {
      if (!product?.category_id) return [];
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .eq('is_active', true)
        .limit(4);
      return data as Product[];
    },
    enabled: !!product?.category_id,
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center"><ErrorState onRetry={refetch} /></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Product not found</p></div>;

  const inStock = product.availability === 'in_stock' && product.stock > 0;
  const images = product.images?.length ? product.images : [];

  const handleAddToCart = () => {
    if (!inStock) {
      toast.error('This product is currently out of stock');
      return;
    }
    addItem(product, quantity);
    toast.success(`${quantity} × ${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    openCart();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="container-custom py-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <ChevronLeft className="w-3 h-3 rotate-180" />
            <Link href="/products" className="hover:text-blue-600">Products</Link>
            {product.category && (
              <>
                <ChevronLeft className="w-3 h-3 rotate-180" />
                <Link href={`/products?category=${product.category.id}`} className="hover:text-blue-600">{product.category.name}</Link>
              </>
            )}
            <ChevronLeft className="w-3 h-3 rotate-180" />
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-8 lg:py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <PlaceholderImage text={product.name} />
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-colors ${
                      selectedImage === idx ? 'border-blue-600' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {product.brand && (
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider">{product.brand.name}</p>
            )}
            
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-500">(0 reviews)</span>
              <span className="text-sm text-gray-300">|</span>
              <span className="text-sm text-gray-500">{product.views || 0} views</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3">
              <span className="text-4xl font-bold text-gray-900">{formatPrice(product.price)}</span>
              {product.compare_price && product.compare_price > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
                  <Badge variant="danger">
                    -{Math.round((1 - product.price / product.compare_price) * 100)}%
                  </Badge>
                </>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <Badge variant="success"><Check className="w-3 h-3 mr-1" /> In Stock</Badge>
              ) : (
                <Badge variant="warning">Out of Stock</Badge>
              )}
              {product.sku && <span className="text-sm text-gray-400">SKU: {product.sku}</span>}
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 font-semibold min-w-[48px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock > 0 && (
                  <span className="text-sm text-gray-400">{product.stock} available</span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="primary" size="lg" className="flex-1" onClick={handleAddToCart} disabled={!inStock}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="secondary" size="lg" className="flex-1" onClick={handleBuyNow} disabled={!inStock}>
                  Buy Now
                </Button>
                <Button variant="outline" size="lg" onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!'); }}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-600">
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specs */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="font-semibold text-gray-900 mb-3">Specifications</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500">{key}</p>
                      <p className="font-medium text-gray-900 text-sm">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warranty */}
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <span>Fast Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <span>{product.warranty || '1 Year Warranty'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                  <span>7 Days Return</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>Same Day Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(rp => (
                <Link key={rp.id} href={`/products/${rp.slug}`} className="group">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-3">
                    {rp.images?.[0] ? (
                      <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <PlaceholderImage />
                    )}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{rp.name}</h3>
                  <p className="font-bold text-gray-900 mt-1">{formatPrice(rp.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCart } from '@/providers/cart-provider';
import { formatPrice } from '@/lib/utils/format';
import { orderSchema } from '@/lib/utils/validators';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PlaceholderImage } from '@/components/ui/placeholder-image';
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, Send, Check } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { z } from 'zod';

type OrderFormData = z.infer<typeof orderSchema>;

const nigeriaStates = [
  'Lagos', 'Abuja', 'Anambra', 'Enugu', 'Rivers', 'Oyo', 'Kano', 'Kaduna',
  'Edo', 'Delta', 'Ogun', 'Ondo', 'Osun', 'Ekiti', 'Kwara', 'Niger',
  'Plateau', 'Benue', 'Cross River', 'Akwa Ibom', 'Bayelsa', 'Abia',
  'Ebonyi', 'Imo', 'Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba',
  'Yobe', 'Jigawa', 'Katsina', 'Kebbi', 'Sokoto', 'Zamfara', 'Nasarawa',
  'Kogi', 'Bayelsa',
].sort();

export default function CartPage() {
  const router = useRouter();
  const { items, totalPrice, totalItems, updateQuantity, removeItem, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
  });

  const onSubmit = async (data: OrderFormData) => {
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        ...data,
        items: items.map(item => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        total: totalPrice,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!res.ok) throw new Error('Failed to submit order');

      clearCart();
      toast.success('Order submitted successfully! We will contact you shortly.');
      router.push('/');
    } catch {
      toast.error('Failed to submit order. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-6">Looks like you haven&apos;t added anything yet.</p>
          <Link href="/products">
            <Button variant="primary" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-3">
            <div className="card p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <form id="order-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    {...register('customer_name')}
                    error={errors.customer_name?.message}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+234 800 000 0000"
                    {...register('customer_phone')}
                    error={errors.customer_phone?.message}
                  />
                </div>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  {...register('customer_email')}
                  error={errors.customer_email?.message}
                />
                
                <h2 className="text-xl font-bold text-gray-900 pt-4 border-t border-gray-100">Delivery Information</h2>
                
                <Textarea
                  label="Delivery Address"
                  placeholder="Street, building, landmark..."
                  {...register('customer_address')}
                  error={errors.customer_address?.message}
                />
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-gray-700">State</label>
                    <select
                      {...register('state')}
                      className="input-field"
                    >
                      <option value="">Select State</option>
                      {nigeriaStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
                  </div>
                  <Input
                    label="City"
                    placeholder="City/LGA"
                    {...register('city')}
                    error={errors.city?.message}
                  />
                </div>
                <Textarea
                  label="Order Notes (Optional)"
                  placeholder="Any special instructions..."
                  {...register('notes')}
                />
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="card p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary ({totalItems} item{totalItems !== 1 ? 's' : ''})
              </h2>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-4 p-3 rounded-xl bg-gray-50">
                    <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <PlaceholderImage className="rounded-xl" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm line-clamp-1">{item.product.name}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{formatPrice(item.product.price)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-1 hover:bg-gray-100" disabled={item.quantity <= 1}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-sm font-medium min-w-[20px] text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-1 hover:bg-gray-100">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.product.id)} className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-medium">To be calculated</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-6"
                type="submit"
                form="order-form"
                loading={isSubmitting}
              >
                <Send className="w-5 h-5 mr-2" />
                Submit Order
              </Button>

              <p className="text-xs text-gray-400 text-center mt-4">
                By submitting, you agree to our terms and conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


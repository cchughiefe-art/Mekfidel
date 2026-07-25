'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { loginSchema } from '@/lib/utils/validators';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Smartphone, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

type LoginData = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success('Welcome back!');
      router.push('/admin/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
          <p className="text-gray-500 mt-1">Sign in to your dashboard</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="admin@example.com"
              {...register('email')}
              error={errors.email?.message}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                {...register('password')}
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <Button variant="primary" className="w-full" size="lg" type="submit" loading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:text-blue-700">
              Forgot Password?
            </Link>
          </div>
        </div>

        <p className="text-center mt-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-blue-600">
            &larr; Back to Website
          </Link>
        </p>
      </div>
    </div>
  );
}


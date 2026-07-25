'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Smartphone, ArrowLeft, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
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
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 mt-1">Enter your email to receive a reset link</p>
        </div>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-500 mb-6">
                We have sent a password reset link to <strong>{email}</strong>
              </p>
              <Link href="/auth/login">
                <Button variant="outline">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <Button variant="primary" className="w-full" size="lg" type="submit" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          )}
        </div>

        <p className="text-center mt-8">
          <Link href="/auth/login" className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}


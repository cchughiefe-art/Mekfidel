'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
      <div className="text-center px-4">
        <div className="w-24 h-24 rounded-3xl bg-blue-50 flex items-center justify-center mx-auto mb-8">
          <Smartphone className="w-12 h-12 text-blue-600" />
        </div>
        
        <h1 className="text-8xl md:text-9xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          Oops! The page you are looking for does not exist or has been moved. 
          Let us help you find your way back.
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/">
            <Button variant="primary" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


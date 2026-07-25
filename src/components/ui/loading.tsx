'use client';

import { cn } from '@/lib/utils/cn';
import { Spinner } from './spinner';

interface LoadingProps {
  className?: string;
  text?: string;
}

export function Loading({ className, text = 'Loading...' }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-20 gap-4', className)}>
      <Spinner size="lg" />
      <p className="text-gray-500 text-sm">{text}</p>
    </div>
  );
}


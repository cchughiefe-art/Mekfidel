'use client';

import { cn } from '@/lib/utils/cn';
import { ImageIcon } from 'lucide-react';

interface PlaceholderImageProps {
  className?: string;
  text?: string;
}

export function PlaceholderImage({ className, text }: PlaceholderImageProps) {
  return (
    <div
      className={cn(
        'placeholder-image w-full aspect-square',
        className
      )}
    >
      <div className="flex flex-col items-center gap-2 text-gray-400">
        <ImageIcon className="w-10 h-10" />
        {text && <span className="text-sm">{text}</span>}
      </div>
    </div>
  );
}


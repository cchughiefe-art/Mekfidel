'use client';

import { cn } from '@/lib/utils/cn';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'Items will appear here once added.',
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        {icon || <PackageOpen className="w-10 h-10 text-gray-400" />}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 text-center max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}


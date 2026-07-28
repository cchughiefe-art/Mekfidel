'use client';

import { getIcon, type LucideIcon } from '@/lib/utils/icon-mapper';
import { Smartphone } from 'lucide-react';

interface IconRendererProps {
  library: 'lucide' | 'heroicons' | 'tabler' | 'uploaded';
  iconName: string;
  svgContent?: string; // For uploaded icons
  className?: string;
  size?: number;
  fallbackIcon?: LucideIcon;
}

export function IconRenderer({
  library,
  iconName,
  svgContent,
  className = '',
  size = 24,
  fallbackIcon: FallbackIcon,
}: IconRendererProps) {
  // Handle uploaded SVG icons
  if (library === 'uploaded' && svgContent) {
    return (
      <span
        className={`inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }

  // Handle Lucide icons
  const IconComponent = getIcon(iconName, library);
  
  if (IconComponent) {
    return <IconComponent className={className} size={size} />;
  }

  // Handle Heroicons
  if (library === 'heroicons') {
    // Return a placeholder for heroicons since we don't have the library installed
    // Users can extend this with heroicons-react if needed
    return FallbackIcon ? (
      <FallbackIcon className={className} size={size} />
    ) : null;
  }

  // Handle Tabler
  if (library === 'tabler') {
    // Return a placeholder for Tabler icons
    return FallbackIcon ? (
      <FallbackIcon className={className} size={size} />
    ) : null;
  }

  // Fallback
  return FallbackIcon ? (
    <FallbackIcon className={className} size={size} />
  ) : (
    <Smartphone className={className} size={size} />
  );
}

// Simplified version for features/cards that only uses Lucide
interface SimpleIconProps {
  name: string;
  className?: string;
  size?: number;
}

export function SimpleIcon({ name, className = '', size = 24 }: SimpleIconProps) {
  const Icon = getIcon(name, 'lucide');
  if (Icon) {
    return <Icon className={className} size={size} />;
  }
  return <Smartphone className={className} size={size} />;
}

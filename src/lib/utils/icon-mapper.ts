import {
  Smartphone,
  Wrench,
  Battery,
  Cpu,
  Watch,
  ShieldCheck,
  ShoppingCart,
  Settings,
  Package,
  Phone,
  Monitor,
  Headphones,
  Zap,
  Toolbox,
  RefreshCw,
  Truck,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Wrench,
  Battery,
  Cpu,
  Watch,
  ShieldCheck,
  ShoppingCart,
  Settings,
  Package,
  Phone,
  Monitor,
  Headphones,
  Zap,
  Toolbox,
  RefreshCw,
  Truck,
};

export function getServiceIcon(iconName: string): LucideIcon {
  return iconMap[iconName] || Smartphone;
}




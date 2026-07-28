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
  Award,
  Users,
  Clock,
  Target,
  Eye,
  Heart,
  Shield,
  Globe,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Send,
  Search,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  EyeOff,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from 'lucide-react';

// Lucide icons map
const lucideIconMap: Record<string, LucideIcon> = {
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
  Award,
  Users,
  Clock,
  Target,
  Eye,
  Heart,
  Shield,
  Globe,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Send,
  Search,
  Menu,
  X,
  Plus,
  Pencil,
  Trash2,
  EyeOff,
  GripVertical,
  ChevronLeft,
  ChevronRight,
};

// Service-specific icon getter (legacy support)
export function getServiceIcon(iconName: string): LucideIcon {
  return lucideIconMap[iconName] || Smartphone;
}

// Generic icon getter with library support
export function getIcon(
  iconName: string,
  library: 'lucide' | 'heroicons' | 'tabler' | 'uploaded' = 'lucide'
): LucideIcon | null {
  if (library === 'uploaded') return null;
  return lucideIconMap[iconName] || null;
}

// Get all available Lucide icon names for the icon picker
export function getLucideIconNames(): string[] {
  return Object.keys(lucideIconMap);
}

// Icon search function
export function searchIcons(query: string): { name: string; icon: LucideIcon }[] {
  const q = query.toLowerCase();
  return Object.entries(lucideIconMap)
    .filter(([name]) => name.toLowerCase().includes(q))
    .map(([name, icon]) => ({ name, icon }));
}

export type { LucideIcon };



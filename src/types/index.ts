export interface Product {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  slug: string;
  description: string;
  features: string[];
  specifications: Record<string, string>;
  category_id: string;
  brand_id: string;
  price: number;
  compare_price?: number;
  stock: number;
  sku: string;
  warranty: string;
  availability: 'in_stock' | 'out_of_stock' | 'pre_order';
  images: string[];
  is_featured: boolean;
  is_active: boolean;
  views: number;
  seo_title?: string;
  seo_description?: string;
  category?: Category;
  brand?: Brand;
}

export interface Category {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: string;
  order: number;
  is_active: boolean;
  products?: Product[];
}

export interface Brand {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  is_active: boolean;
  products?: Product[];
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  state: string;
  city: string;
  notes?: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  product?: Product;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';

export interface Customer {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  state?: string;
  city?: string;
  total_orders: number;
  total_spent: number;
}

export interface ScreenCompatibility {
  id: string;
  created_at: string;
  brand: string;
  model: string;
  series?: string;
  screen_code?: string;
  manufacturer_model?: string;
  compatible_with: string[];
  notes?: string;
  is_active: boolean;
}

export interface BlogPost {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  image?: string;
  category?: string;
  tags: string[];
  author: string;
  is_published: boolean;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  views: number;
}

export interface MediaFile {
  id: string;
  created_at: string;
  name: string;
  url: string;
  type: string;
  size: number;
  folder: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface SiteSettings {
  id: string;
  company_name: string;
  logo?: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  business_hours: string;
  social_media: SocialMediaLinks;
  homepage_hero_title: string;
  homepage_hero_subtitle: string;
  hero_banner?: string;
  about_text: string;
  footer_text: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  google_maps_embed?: string;
  updated_at: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  tiktok?: string;
}

export interface AnalyticsEvent {
  id: string;
  created_at: string;
  event: string;
  page: string;
  metadata?: Record<string, unknown>;
}

export interface FAQItem {
  id: string;
  created_at: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
  is_published: boolean;
}

export interface Testimonial {
  id: string;
  created_at: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  image?: string;
  is_published: boolean;
}

export interface Service {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  order_index: number;
  is_active: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'editor' | 'viewer';
  created_at: string;
}

// ============================================================
// CMS Types
// ============================================================

export interface HomepageSection {
  id: string;
  created_at: string;
  updated_at: string;
  section_key: string;
  section_type: 'hero' | 'features_grid' | 'stats' | 'cta' | 'testimonials' | 'steps' | 'promo' | 'custom';
  title?: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  image?: string;
  background_image?: string;
  icon?: string;
  color?: string;
  background_color?: string;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  feature_cards?: FeatureCard[];
}

export interface FeatureCard {
  id: string;
  created_at: string;
  updated_at: string;
  section_id: string;
  title: string;
  description?: string;
  icon_library: 'lucide' | 'heroicons' | 'tabler' | 'uploaded';
  icon_name: string;
  icon_color?: string;
  url?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Statistic {
  id: string;
  created_at: string;
  updated_at: string;
  context: 'homepage' | 'about' | 'footer' | string;
  label: string;
  value: string;
  suffix?: string;
  icon_library?: 'lucide' | 'heroicons' | 'tabler' | 'uploaded';
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
}

export type NavigationLocation = 'header' | 'footer_main' | 'footer_quick' | 'footer_categories' | 'mobile';

export interface NavigationItem {
  id: string;
  created_at: string;
  updated_at: string;
  location: NavigationLocation;
  label: string;
  url: string;
  icon_library?: 'lucide' | 'heroicons' | 'tabler' | 'uploaded';
  icon_name?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  is_new_tab: boolean;
  children?: NavigationItem[];
}

export interface FooterSection {
  id: string;
  created_at: string;
  updated_at: string;
  section_key: string;
  title?: string;
  content?: string;
  icon_library?: 'lucide' | 'heroicons' | 'tabler' | 'uploaded';
  icon_name?: string;
  links: FooterLink[];
  sort_order: number;
  is_active: boolean;
}

export interface FooterLink {
  label: string;
  url: string;
  is_new_tab?: boolean;
}

export interface SocialLink {
  id: string;
  created_at: string;
  updated_at: string;
  platform: string;
  label: string;
  icon_library: 'lucide' | 'heroicons' | 'tabler' | 'uploaded';
  icon_name?: string;
  url?: string;
  is_visible: boolean;
  sort_order: number;
}

export interface UploadedIcon {
  id: string;
  created_at: string;
  name: string;
  slug: string;
  svg_content: string;
  tags: string[];
  usage_count: number;
  width?: number;
  height?: number;
}

export interface ContentBlock {
  id: string;
  created_at: string;
  updated_at: string;
  block_key: string;
  block_type: 'text' | 'html' | 'markdown' | 'component';
  title?: string;
  content: string;
  page?: string;
  position?: string;
  sort_order: number;
  is_active: boolean;
}

export interface CompanyInfo {
  id: string;
  created_at: string;
  updated_at: string;
  info_key: string;
  info_type: 'text' | 'html' | 'number' | 'date';
  title?: string;
  content: string;
  image?: string;
  icon_library?: 'lucide' | 'heroicons' | 'tabler' | 'uploaded';
  icon_name?: string;
  sort_order: number;
  is_active: boolean;
}

export interface AboutValue {
  id: string;
  title: string;
  description: string;
  icon_library: 'lucide' | 'heroicons' | 'tabler' | 'uploaded';
  icon_name: string;
  icon_color?: string;
}

// Extended Testimonial with sorting
export interface Testimonial {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  image?: string;
  avatar?: string;
  is_published: boolean;
  is_featured: boolean;
  sort_order: number;
}

// Extended FAQ with sorting
export interface FAQ {
  id: string;
  created_at: string;
  updated_at: string;
  question: string;
  answer: string;
  category?: string;
  is_published: boolean;
  sort_order: number;
}



import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category_id: z.string().uuid('Invalid category'),
  brand_id: z.string().uuid('Invalid brand'),
  price: z.coerce.number().positive('Price must be positive'),
  compare_price: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().min(2, 'SKU is required'),
  warranty: z.string().default('No warranty'),
  availability: z.enum(['in_stock', 'out_of_stock', 'pre_order']),
  features: z.array(z.string()).default([]),
  specifications: z.record(z.string()).default({}),
  is_featured: z.boolean().default(false),
  is_active: z.boolean().default(true),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  parent_id: z.string().uuid().optional().nullable(),
  order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const brandSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

export const orderSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  customer_phone: z.string().min(8, 'Valid phone is required'),
  customer_email: z.string().email('Valid email is required'),
  customer_address: z.string().min(5, 'Address is required'),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  notes: z.string().optional(),
});

export const blogPostSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  excerpt: z.string().min(10, 'Excerpt is required'),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  author: z.string().min(2, 'Author is required'),
  is_published: z.boolean().default(false),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
});

export const siteSettingsSchema = z.object({
  company_name: z.string().min(2),
  phone: z.string().min(8),
  whatsapp: z.string().min(8),
  email: z.string().email(),
  address: z.string().min(5),
  business_hours: z.string(),
  homepage_hero_title: z.string(),
  homepage_hero_subtitle: z.string(),
  about_text: z.string(),
  footer_text: z.string(),
  seo_title: z.string(),
  seo_description: z.string(),
  seo_keywords: z.string(),
  google_maps_embed: z.string().optional(),
  social_media: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
    tiktok: z.string().optional(),
  }),
});

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(8, 'Valid phone is required'),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const compatibilitySchema = z.object({
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  series: z.string().optional(),
  screen_code: z.string().optional(),
  manufacturer_model: z.string().optional(),
  compatible_with: z.array(z.string()).default([]),
  notes: z.string().optional(),
});


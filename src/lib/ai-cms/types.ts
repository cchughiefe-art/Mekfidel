import { z } from 'zod';

const productChanges = z.object({
  name: z.string().min(1).max(160).optional(),
  description: z.string().max(5000).optional(),
  price: z.number().min(0).max(1000000000).optional(),
  compare_price: z.number().min(0).max(1000000000).nullable().optional(),
  stock: z.number().int().min(0).max(1000000).optional(),
  availability: z.enum(['in_stock', 'out_of_stock', 'pre_order']).optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  seo_title: z.string().max(180).nullable().optional(),
  seo_description: z.string().max(500).nullable().optional(),
}).refine(value => Object.keys(value).length > 0, 'At least one product field is required');

const homepageChanges = z.object({
  title: z.string().max(240).nullable().optional(),
  subtitle: z.string().max(500).nullable().optional(),
  description: z.string().max(5000).nullable().optional(),
  button_text: z.string().max(100).nullable().optional(),
  button_url: z.string().max(500).nullable().optional(),
  is_active: z.boolean().optional(),
}).refine(value => Object.keys(value).length > 0, 'At least one homepage field is required');

const companyChanges = z.object({
  title: z.string().max(240).nullable().optional(),
  content: z.string().min(1).max(10000).optional(),
  is_active: z.boolean().optional(),
}).refine(value => Object.keys(value).length > 0, 'At least one company field is required');

export const aiActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('update_product'),
    targetId: z.string().uuid(),
    targetLabel: z.string().min(1).max(200),
    changes: productChanges,
  }),
  z.object({
    type: z.literal('update_homepage_section'),
    targetId: z.string().uuid(),
    targetLabel: z.string().min(1).max(200),
    changes: homepageChanges,
  }),
  z.object({
    type: z.literal('update_company_info'),
    targetId: z.string().uuid(),
    targetLabel: z.string().min(1).max(200),
    changes: companyChanges,
  }),
  z.object({
    type: z.literal('create_category'),
    targetLabel: z.string().min(1).max(200),
    changes: z.object({
      name: z.string().min(1).max(120),
      description: z.string().max(2000).nullable().optional(),
      is_active: z.boolean().optional(),
    }),
  }),
]);

export const aiPlanSchema = z.object({
  summary: z.string().min(1).max(1000),
  answer: z.string().max(3000).optional().default(''),
  warnings: z.array(z.string().max(500)).max(10).default([]),
  actions: z.array(aiActionSchema).max(10),
});

export type AiAction = z.infer<typeof aiActionSchema>;
export type AiPlan = z.infer<typeof aiPlanSchema>;


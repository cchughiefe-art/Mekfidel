import { z } from 'zod';

export const cmsResourceSchema = z.enum([
  'products', 'categories', 'brands', 'screen_compatibility', 'blog_posts',
  'faqs', 'testimonials', 'services', 'homepage_sections', 'feature_cards',
  'statistics', 'navigation_items', 'footer_sections', 'social_links',
  'company_info', 'content_blocks', 'settings',
]);

export const aiActionSchema = z.object({
  operation: z.enum(['create', 'update', 'delete']),
  resource: cmsResourceSchema,
  targetId: z.string().uuid().optional(),
  targetLabel: z.string().min(1).max(200),
  changes: z.record(z.string(), z.unknown()).default({}),
}).superRefine((action, context) => {
  if (action.operation !== 'create' && !action.targetId) {
    context.addIssue({ code: 'custom', path: ['targetId'], message: 'Updates and deletes require an existing target ID' });
  }
  if (action.operation !== 'delete' && Object.keys(action.changes).length === 0) {
    context.addIssue({ code: 'custom', path: ['changes'], message: 'Creates and updates require changes' });
  }
});

export const aiPlanSchema = z.object({
  summary: z.string().min(1).max(1000),
  answer: z.string().max(3000).optional().default(''),
  warnings: z.array(z.string().max(500)).max(10).default([]),
  actions: z.array(aiActionSchema).max(15),
});

export type CmsResource = z.infer<typeof cmsResourceSchema>;
export type AiAction = z.infer<typeof aiActionSchema>;
export type AiPlan = z.infer<typeof aiPlanSchema>;

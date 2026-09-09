import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { aiPlanSchema, type AiAction } from './types';

const GEMINI_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    answer: { type: 'string' },
    warnings: { type: 'array', items: { type: 'string' } },
    actions: {
      type: 'array',
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['update_product', 'update_homepage_section', 'update_company_info', 'create_category'] },
          targetId: { type: 'string' },
          targetLabel: { type: 'string' },
          changes: { type: 'object' },
        },
        required: ['type', 'targetLabel', 'changes'],
      },
    },
  },
  required: ['summary', 'answer', 'warnings', 'actions'],
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
}

export async function createAiPlan(supabase: SupabaseClient, instruction: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const [products, categories, sections, companyInfo] = await Promise.all([
    supabase.from('products').select('id,name,sku,price,stock,availability,is_featured,is_active,seo_title,seo_description').order('name').limit(250),
    supabase.from('categories').select('id,name,slug,description,is_active').order('name').limit(100),
    supabase.from('homepage_sections').select('id,section_key,title,subtitle,description,button_text,button_url,is_active').order('sort_order').limit(50),
    supabase.from('company_info').select('id,info_key,title,content,is_active').order('sort_order').limit(100),
  ]);

  for (const result of [products, categories, sections, companyInfo]) {
    if (result.error) throw new Error(`Could not load CMS context: ${result.error.message}`);
  }

  const context = {
    products: products.data,
    categories: categories.data,
    homepageSections: sections.data,
    companyInfo: companyInfo.data,
  };

  const prompt = `You are the Mekfidel CMS planning assistant. Mekfidel sells phone repair tools and replacement screens.
Create a safe change preview from the administrator's instruction. Never invent IDs: use only IDs in CMS_CONTEXT. Never produce SQL, code, deletes, user/role changes, auth changes, file uploads, or fields outside the allowed actions. If the request is informational, answer it and return no actions. If a requested target is ambiguous or absent, return no action and explain what is needed in warnings.

Allowed actions and changes:
- update_product: targetId plus any of name, description, price, compare_price, stock, availability, is_featured, is_active, seo_title, seo_description.
- update_homepage_section: targetId plus any of title, subtitle, description, button_text, button_url, is_active.
- update_company_info: targetId plus any of title, content, is_active.
- create_category: no targetId; changes may contain name, description, is_active.

ADMIN_INSTRUCTION:
${instruction}

CMS_CONTEXT:
${JSON.stringify(context)}`;

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseJsonSchema: GEMINI_SCHEMA,
      },
    }),
    signal: AbortSignal.timeout(30000),
  });

  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message || `Gemini request failed (${response.status})`;
    throw new Error(message);
  }

  const text = body?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('');
  if (!text) throw new Error('Gemini returned an empty response');
  return aiPlanSchema.parse(JSON.parse(text));
}

const rollbackActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('update'),
    table: z.enum(['products', 'homepage_sections', 'company_info']),
    id: z.string().uuid(),
    values: z.record(z.string(), z.unknown()),
  }),
  z.object({
    type: z.literal('delete'),
    table: z.literal('categories'),
    id: z.string().uuid(),
  }),
]);

type RollbackAction = z.infer<typeof rollbackActionSchema>;

export async function applyActions(supabase: SupabaseClient, actions: AiAction[]) {
  const rollback: RollbackAction[] = [];

  try {
    for (const action of actions) {
      if (action.type === 'create_category') {
        const baseSlug = slugify(action.changes.name) || 'category';
        const { data: existing } = await supabase.from('categories').select('id').eq('slug', baseSlug).maybeSingle();
        const slug = existing ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}` : baseSlug;
        const { data, error } = await supabase.from('categories').insert({ ...action.changes, slug }).select('id').single();
        if (error) throw error;
        rollback.unshift({ type: 'delete', table: 'categories', id: data.id });
        continue;
      }

      const table = action.type === 'update_product'
        ? 'products'
        : action.type === 'update_homepage_section' ? 'homepage_sections' : 'company_info';
      const fields = Object.keys(action.changes);
      const { data: before, error: readError } = await supabase.from(table).select(fields.join(',')).eq('id', action.targetId).single();
      if (readError) throw readError;
      const { error } = await supabase.from(table).update(action.changes).eq('id', action.targetId);
      if (error) throw error;
      rollback.unshift({ type: 'update', table, id: action.targetId, values: before as unknown as Record<string, unknown> });
    }
    return rollback;
  } catch (error) {
    await rollbackActions(supabase, rollback);
    throw error;
  }
}

export async function rollbackActions(supabase: SupabaseClient, actions: RollbackAction[]) {
  for (const rawAction of actions) {
    const action = rollbackActionSchema.parse(rawAction);
    const result = action.type === 'delete'
      ? await supabase.from(action.table).delete().eq('id', action.id)
      : await supabase.from(action.table).update(action.values || {}).eq('id', action.id);
    if (result.error) throw result.error;
  }
}

import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { aiPlanSchema, cmsResourceSchema, type AiAction, type CmsResource } from './types';

type ResourceConfig = {
  fields: readonly string[];
  context: string;
  primaryField: string;
};

const RESOURCES: Record<CmsResource, ResourceConfig> = {
  products: { primaryField: 'name', context: 'id,name,sku,price,stock,availability,is_featured,is_active,seo_title', fields: ['name','slug','description','features','specifications','category_id','brand_id','price','compare_price','stock','sku','warranty','availability','images','is_featured','is_active','seo_title','seo_description'] },
  categories: { primaryField: 'name', context: 'id,name,slug,description,parent_id,is_active', fields: ['name','slug','description','image','parent_id','order','is_active'] },
  brands: { primaryField: 'name', context: 'id,name,slug,description,is_active', fields: ['name','slug','logo','description','is_active'] },
  screen_compatibility: { primaryField: 'model', context: 'id,brand,model,series,screen_code,manufacturer_model,compatible_with,is_active', fields: ['brand','model','series','screen_code','manufacturer_model','compatible_with','notes','is_active'] },
  blog_posts: { primaryField: 'title', context: 'id,title,slug,excerpt,category,tags,is_published,published_at', fields: ['title','slug','content','excerpt','image','category','tags','author','is_published','published_at','seo_title','seo_description'] },
  faqs: { primaryField: 'question', context: 'id,question,answer,category,sort_order,is_published', fields: ['question','answer','category','sort_order','is_published'] },
  testimonials: { primaryField: 'name', context: 'id,name,role,company,content,rating,is_published,is_featured,sort_order', fields: ['name','role','company','content','rating','image','avatar','is_published','is_featured','sort_order'] },
  services: { primaryField: 'title', context: 'id,title,description,icon,color,features,order_index,is_active', fields: ['title','description','icon','color','features','order_index','is_active'] },
  homepage_sections: { primaryField: 'section_key', context: 'id,section_key,section_type,title,subtitle,description,button_text,button_url,sort_order,is_active', fields: ['section_key','section_type','title','subtitle','description','button_text','button_url','image','background_image','icon','color','background_color','sort_order','is_active','metadata'] },
  feature_cards: { primaryField: 'title', context: 'id,section_id,title,description,icon_name,url,sort_order,is_active', fields: ['section_id','title','description','icon_library','icon_name','icon_color','url','sort_order','is_active'] },
  statistics: { primaryField: 'label', context: 'id,context,label,value,suffix,icon_name,sort_order,is_active', fields: ['context','label','value','suffix','icon_library','icon_name','sort_order','is_active'] },
  navigation_items: { primaryField: 'label', context: 'id,location,label,url,parent_id,sort_order,is_active,is_new_tab', fields: ['location','label','url','icon_library','icon_name','parent_id','sort_order','is_active','is_new_tab'] },
  footer_sections: { primaryField: 'section_key', context: 'id,section_key,title,content,links,sort_order,is_active', fields: ['section_key','title','content','icon_library','icon_name','links','sort_order','is_active'] },
  social_links: { primaryField: 'platform', context: 'id,platform,label,url,is_visible,sort_order', fields: ['platform','label','icon_library','icon_name','url','is_visible','sort_order'] },
  company_info: { primaryField: 'info_key', context: 'id,info_key,info_type,title,content,sort_order,is_active', fields: ['info_key','info_type','title','content','image','icon_library','icon_name','sort_order','is_active'] },
  content_blocks: { primaryField: 'block_key', context: 'id,block_key,block_type,title,content,page,position,sort_order,is_active', fields: ['block_key','block_type','title','content','page','position','sort_order','is_active'] },
  settings: { primaryField: 'company_name', context: 'id,company_name,phone,whatsapp,email,address,business_hours,homepage_hero_title,homepage_hero_subtitle,about_text,footer_text,seo_title,seo_description,seo_keywords', fields: ['company_name','logo','phone','whatsapp','email','address','business_hours','social_media','homepage_hero_title','homepage_hero_subtitle','hero_banner','about_text','footer_text','seo_title','seo_description','seo_keywords','google_maps_embed'] },
};

const booleanFields = new Set(['is_featured','is_active','is_published','is_visible','is_new_tab']);
const numberFields = new Set(['price','compare_price','stock','rating','sort_order','order_index','order']);
const arrayFields = new Set(['features','images','tags','compatible_with']);
const objectFields = new Set(['specifications','metadata','links','social_media']);
const uuidFields = new Set(['category_id','brand_id','parent_id','section_id']);
const uuidSchema = z.string().uuid();

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100);
}

function validateChanges(resource: CmsResource, changes: Record<string, unknown>) {
  const allowed = new Set(RESOURCES[resource].fields);
  const clean: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(changes)) {
    if (!allowed.has(field)) throw new Error(`${field} is not an approved field for ${resource}`);
    if (value === undefined) continue;
    if (value === null) { clean[field] = null; continue; }
    if (booleanFields.has(field) && typeof value !== 'boolean') throw new Error(`${field} must be true or false`);
    if (numberFields.has(field) && (typeof value !== 'number' || !Number.isFinite(value))) throw new Error(`${field} must be a valid number`);
    if (arrayFields.has(field) && (!Array.isArray(value) || value.length > 100 || value.some(item => typeof item !== 'string'))) throw new Error(`${field} must be a list of text values`);
    if (objectFields.has(field) && (typeof value !== 'object' || JSON.stringify(value).length > 20000)) throw new Error(`${field} must be a small JSON object`);
    if (!booleanFields.has(field) && !numberFields.has(field) && !arrayFields.has(field) && !objectFields.has(field) && (typeof value !== 'string' || value.length > 10000)) throw new Error(`${field} must be text`);
    if (uuidFields.has(field) && value !== null) uuidSchema.parse(value);
    clean[field] = value;
  }

  if (typeof clean.price === 'number' && clean.price < 0) throw new Error('Price cannot be negative');
  if (typeof clean.compare_price === 'number' && clean.compare_price < 0) throw new Error('Compare price cannot be negative');
  if (typeof clean.stock === 'number' && (!Number.isInteger(clean.stock) || clean.stock < 0)) throw new Error('Stock must be a non-negative whole number');
  if (typeof clean.rating === 'number' && (clean.rating < 1 || clean.rating > 5)) throw new Error('Rating must be between 1 and 5');
  if (clean.availability && !['in_stock','out_of_stock','pre_order'].includes(String(clean.availability))) throw new Error('Invalid availability');
  if (clean.location && !['header','footer_main','footer_quick','footer_categories','mobile'].includes(String(clean.location))) throw new Error('Invalid navigation location');
  return clean;
}

function normalizeRawPlan(rawPlan: Record<string, unknown>) {
  if (!Array.isArray(rawPlan.actions)) return rawPlan;
  rawPlan.actions = rawPlan.actions.map((raw: unknown) => {
    const action = raw && typeof raw === 'object' ? raw as Record<string, unknown> : {};
    const resource = cmsResourceSchema.safeParse(action.resource);
    const changes = action.changes && typeof action.changes === 'object' ? action.changes as Record<string, unknown> : {};
    if (action.operation === 'create' && resource.success && Object.keys(changes).length === 0 && typeof action.targetLabel === 'string') {
      changes[RESOURCES[resource.data].primaryField] = action.targetLabel;
    }
    return { ...action, changes };
  });
  return rawPlan;
}

export async function createAiPlan(supabase: SupabaseClient, instruction: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const entries = await Promise.all(Object.entries(RESOURCES).map(async ([resource, config]) => {
    const result = await supabase.from(resource).select(config.context).limit(resource === 'products' ? 250 : 100);
    return [resource, result] as const;
  }));
  const unavailableTables = entries.filter(([, result]) => result.error).map(([resource]) => resource);
  const unexpectedError = entries.find(([, result]) => result.error && result.error.code !== 'PGRST205' && !result.error.message.includes('schema cache'))?.[1].error;
  if (unexpectedError) throw new Error(`Could not load CMS context: ${unexpectedError.message}`);
  const context = Object.fromEntries(entries.map(([resource, result]) => [resource, result.data || []]));

  const capabilities = Object.entries(RESOURCES).map(([resource, config]) => `${resource}: ${config.fields.join(', ')}`).join('\n');
  const prompt = `You are the Mekfidel CMS administrator assistant. Mekfidel sells phone repair tools, replacement screens and spare parts. It does not sell phones and does not perform repairs.
Plan the administrator's request using only the CMS resources and fields below. You may create, update, or delete CMS content. Never invent target IDs; updates and deletes must use an exact ID from CMS_CONTEXT. Never access orders, customers, users, authentication, secrets, infrastructure, or SQL. If a target is ambiguous, missing, or unavailable, propose no action for it and explain why. Informational requests should have no actions. Every destructive action must be clearly described in warnings. Keep changes minimal and do not modify fields the administrator did not request.
The settings resource has one permanent record and may only be updated, never created or deleted.

CMS RESOURCES AND APPROVED FIELDS:
${capabilities}

UNAVAILABLE TABLES: ${unavailableTables.join(', ') || 'none'}

ADMIN INSTRUCTION:
${instruction}

CMS_CONTEXT:
${JSON.stringify(context)}

Return only valid JSON in exactly this shape:
{"summary":"short preview summary","answer":"optional informational answer","warnings":["warning"],"actions":[{"operation":"create|update|delete","resource":"approved resource name","targetId":"existing UUID for update/delete only","targetLabel":"human-readable target","changes":{"approved_field":"new value"}}]}`;

  const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.1, responseMimeType: 'application/json' } }),
    signal: AbortSignal.timeout(30000),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body?.error?.message || `Gemini request failed (${response.status})`);
  const text = body?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('');
  if (!text) throw new Error('Gemini returned an empty response');

  const plan = aiPlanSchema.parse(normalizeRawPlan(JSON.parse(text)));
  return { ...plan, actions: plan.actions.map(action => ({ ...action, changes: validateChanges(action.resource, action.changes) })) };
}

const tableSchema = cmsResourceSchema;
const rollbackActionSchema = z.discriminatedUnion('operation', [
  z.object({ operation: z.literal('update'), table: tableSchema, id: z.string().uuid(), values: z.record(z.string(), z.unknown()) }),
  z.object({ operation: z.literal('delete'), table: tableSchema, id: z.string().uuid() }),
  z.object({ operation: z.literal('insert'), table: tableSchema, values: z.record(z.string(), z.unknown()) }),
]);
type RollbackAction = z.infer<typeof rollbackActionSchema>;

async function protectReferencedDelete(supabase: SupabaseClient, action: AiAction) {
  if (!action.targetId) return;
  const references: Partial<Record<CmsResource, Array<[string, string]>>> = {
    products: [['order_items', 'product_id']],
    categories: [['products', 'category_id'], ['categories', 'parent_id']],
    brands: [['products', 'brand_id']],
    homepage_sections: [['feature_cards', 'section_id']],
    navigation_items: [['navigation_items', 'parent_id']],
  };
  for (const reference of references[action.resource] || []) {
    const { count, error } = await supabase.from(reference[0]).select('*', { count: 'exact', head: true }).eq(reference[1], action.targetId);
    if (error) throw error;
    if (count) throw new Error(`${action.targetLabel} is still used by ${count} ${reference[0]} record(s). Archive or reassign them before deleting it.`);
  }
}

export async function applyActions(supabase: SupabaseClient, actions: AiAction[]) {
  const rollback: RollbackAction[] = [];
  try {
    for (const action of actions) {
      const table = action.resource;
      if (table === 'settings' && action.operation !== 'update') {
        throw new Error('The main settings record can only be updated');
      }
      if (action.operation === 'delete') {
        await protectReferencedDelete(supabase, action);
        const { data: before, error: readError } = await supabase.from(table).select('*').eq('id', action.targetId!).single();
        if (readError) throw readError;
        const { error } = await supabase.from(table).delete().eq('id', action.targetId!);
        if (error) throw error;
        rollback.unshift({ operation: 'insert', table, values: before as unknown as Record<string, unknown> });
        continue;
      }

      const changes = validateChanges(table, action.changes);
      if (action.operation === 'create') {
        if ('slug' in Object.fromEntries(RESOURCES[table].fields.map(field => [field, true])) && !changes.slug) {
          const source = String(changes.name || changes.title || action.targetLabel);
          const base = slugify(source) || table.replaceAll('_', '-');
          const { data: existing } = await supabase.from(table).select('id').eq('slug', base).maybeSingle();
          changes.slug = existing ? `${base}-${crypto.randomUUID().slice(0, 8)}` : base;
        }
        const { data, error } = await supabase.from(table).insert(changes).select('id').single();
        if (error) throw error;
        rollback.unshift({ operation: 'delete', table, id: data.id });
        continue;
      }

      const fields = Object.keys(changes);
      const { data: before, error: readError } = await supabase.from(table).select(fields.join(',')).eq('id', action.targetId!).single();
      if (readError) throw readError;
      const { error } = await supabase.from(table).update(changes).eq('id', action.targetId!);
      if (error) throw error;
      rollback.unshift({ operation: 'update', table, id: action.targetId!, values: before as unknown as Record<string, unknown> });
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
    const result = action.operation === 'delete'
      ? await supabase.from(action.table).delete().eq('id', action.id)
      : action.operation === 'insert'
        ? await supabase.from(action.table).insert(action.values)
        : await supabase.from(action.table).update(action.values).eq('id', action.id);
    if (result.error) throw result.error;
  }
}

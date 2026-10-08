import { nullableFields } from "./nullable-fields";
import { sanitizeSvg } from "@/lib/utils/safe-svg";
import { z } from "zod";
import {
  productSchema,
  categorySchema,
  brandSchema,
  blogPostSchema,
} from "@/lib/utils/validators";
import type { CmsResource } from "./types";
import { safeUrl, googleMapsUrl } from "@/lib/utils/safe-content";

type ResourceConfig = {
  fields: readonly string[];
  context: string;
  primaryField: string;
};

export const RESOURCES: Record<CmsResource, ResourceConfig> = {
  profiles: {
    primaryField: "full_name",
    context: "id,full_name,role",
    fields: ["full_name", "role"],
  },
  media: {
    primaryField: "name",
    context: "id,name,alt,folder",
    fields: ["name", "alt", "folder"],
  },
  orders: {
    primaryField: "status",
    context: "id,status,total,created_at",
    fields: ["status", "notes"],
  },
  customers: {
    primaryField: "name",
    context: "id,name,total_orders,total_spent",
    fields: ["name", "phone", "address", "state", "city"],
  },
  uploaded_icons: {
    primaryField: "name",
    context: "id,name,slug,tags",
    fields: ["name", "slug", "tags", "svg_content", "width", "height"],
  },
  products: {
    primaryField: "name",
    context:
      "id,name,sku,price,stock,availability,is_featured,is_active,seo_title",
    fields: [
      "name",
      "slug",
      "description",
      "features",
      "specifications",
      "category_id",
      "brand_id",
      "price",
      "compare_price",
      "stock",
      "sku",
      "warranty",
      "availability",
      "images",
      "is_featured",
      "is_active",
      "seo_title",
      "seo_description",
    ],
  },
  categories: {
    primaryField: "name",
    context: "id,name,slug,description,parent_id,is_active",
    fields: [
      "name",
      "slug",
      "description",
      "image",
      "parent_id",
      "order",
      "is_active",
    ],
  },
  brands: {
    primaryField: "name",
    context: "id,name,slug,description,is_active",
    fields: ["name", "slug", "logo", "description", "is_active"],
  },
  screen_compatibility: {
    primaryField: "model",
    context:
      "id,brand,model,series,screen_code,manufacturer_model,compatible_with,is_active",
    fields: [
      "brand",
      "model",
      "series",
      "screen_code",
      "manufacturer_model",
      "compatible_with",
      "notes",
      "is_active",
    ],
  },
  blog_posts: {
    primaryField: "title",
    context: "id,title,slug,excerpt,category,tags,is_published,published_at",
    fields: [
      "title",
      "slug",
      "content",
      "excerpt",
      "image",
      "category",
      "tags",
      "author",
      "is_published",
      "published_at",
      "seo_title",
      "seo_description",
    ],
  },
  faqs: {
    primaryField: "question",
    context: "id,question,answer,category,sort_order,is_published",
    fields: ["question", "answer", "category", "sort_order", "is_published"],
  },
  testimonials: {
    primaryField: "name",
    context:
      "id,name,role,company,content,rating,is_published,is_featured,sort_order",
    fields: [
      "name",
      "role",
      "company",
      "content",
      "rating",
      "image",
      "avatar",
      "is_published",
      "is_featured",
      "sort_order",
    ],
  },
  services: {
    primaryField: "title",
    context: "id,title,description,icon,color,features,order_index,is_active",
    fields: [
      "title",
      "description",
      "icon",
      "color",
      "features",
      "order_index",
      "is_active",
    ],
  },
  homepage_sections: {
    primaryField: "section_key",
    context:
      "id,section_key,section_type,title,subtitle,description,button_text,button_url,sort_order,is_active",
    fields: [
      "section_key",
      "section_type",
      "title",
      "subtitle",
      "description",
      "button_text",
      "button_url",
      "image",
      "background_image",
      "icon",
      "color",
      "background_color",
      "sort_order",
      "is_active",
      "metadata",
    ],
  },
  feature_cards: {
    primaryField: "title",
    context:
      "id,section_id,title,description,icon_name,url,sort_order,is_active",
    fields: [
      "section_id",
      "title",
      "description",
      "icon_library",
      "icon_name",
      "icon_color",
      "url",
      "sort_order",
      "is_active",
    ],
  },
  statistics: {
    primaryField: "label",
    context:
      "id,context,label,value,suffix,icon_name,sort_order,is_active,is_verified",
    fields: [
      "context",
      "label",
      "value",
      "suffix",
      "icon_library",
      "icon_name",
      "sort_order",
      "is_active",
      "is_verified",
    ],
  },
  navigation_items: {
    primaryField: "label",
    context: "id,location,label,url,parent_id,sort_order,is_active,is_new_tab",
    fields: [
      "location",
      "label",
      "url",
      "icon_library",
      "icon_name",
      "parent_id",
      "sort_order",
      "is_active",
      "is_new_tab",
    ],
  },
  footer_sections: {
    primaryField: "section_key",
    context: "id,section_key,title,content,links,sort_order,is_active",
    fields: [
      "section_key",
      "title",
      "content",
      "icon_library",
      "icon_name",
      "links",
      "sort_order",
      "is_active",
    ],
  },
  social_links: {
    primaryField: "platform",
    context: "id,platform,label,url,is_visible,sort_order",
    fields: [
      "platform",
      "label",
      "icon_library",
      "icon_name",
      "url",
      "is_visible",
      "sort_order",
    ],
  },
  company_info: {
    primaryField: "info_key",
    context: "id,info_key,info_type,title,content,sort_order,is_active",
    fields: [
      "info_key",
      "info_type",
      "title",
      "content",
      "image",
      "icon_library",
      "icon_name",
      "sort_order",
      "is_active",
    ],
  },
  content_blocks: {
    primaryField: "block_key",
    context:
      "id,block_key,block_type,title,content,page,position,sort_order,is_active",
    fields: [
      "block_key",
      "block_type",
      "title",
      "content",
      "page",
      "position",
      "sort_order",
      "is_active",
    ],
  },
  settings: {
    primaryField: "company_name",
    context:
      "id,company_name,phone,whatsapp,email,address,business_hours,homepage_hero_title,homepage_hero_subtitle,about_text,footer_text,seo_title,seo_description,seo_keywords",
    fields: [
      "company_name",
      "logo",
      "phone",
      "whatsapp",
      "email",
      "address",
      "business_hours",
      "social_media",
      "homepage_hero_title",
      "homepage_hero_subtitle",
      "hero_banner",
      "about_text",
      "footer_text",
      "seo_title",
      "seo_description",
      "seo_keywords",
      "google_maps_embed",
    ],
  },
};

const booleanFields = new Set([
  "is_verified",
  "is_featured",
  "is_active",
  "is_published",
  "is_visible",
  "is_new_tab",
]);
const numberFields = new Set([
  "price",
  "compare_price",
  "stock",
  "rating",
  "sort_order",
  "order_index",
  "order",
  "width",
  "height",
]);
const arrayFields = new Set(["features", "images", "tags", "compatible_with"]);
const objectFields = new Set([
  "specifications",
  "metadata",
  "links",
  "social_media",
]);
const uuidFields = new Set([
  "category_id",
  "brand_id",
  "parent_id",
  "section_id",
]);
const uuidSchema = z.string().uuid();

export function validateChanges(
  resource: CmsResource,
  changes: Record<string, unknown>,
) {
  const allowed = new Set(RESOURCES[resource].fields);
  const clean: Record<string, unknown> = {};

  for (const [field, value] of Object.entries(changes)) {
    if (!allowed.has(field))
      throw new Error(`${field} is not an approved field for ${resource}`);
    if (value === undefined) continue;
    if (value === null) {
      if (field === "role") throw new Error("Team role is required");
      if (!nullableFields[resource]?.includes(field))
        throw new Error(`${field} cannot be empty`);
      clean[field] = null;
      continue;
    }

    let normalized = value;
    if (uuidFields.has(field) && value === "") {
      clean[field] = null;
      continue;
    }
    if (arrayFields.has(field) && typeof normalized === "string") {
      normalized = normalized
        .split(/[,\n]/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (
      numberFields.has(field) &&
      typeof normalized === "string" &&
      normalized.trim() !== ""
    ) {
      normalized = Number(normalized);
    }
    if (booleanFields.has(field) && typeof normalized === "string") {
      const lowerValue = normalized.toLowerCase();
      if (lowerValue === "true") normalized = true;
      if (lowerValue === "false") normalized = false;
    }
    if (objectFields.has(field) && typeof normalized === "string") {
      try {
        normalized = JSON.parse(normalized);
      } catch {
        throw new Error(`${field} must be valid JSON`);
      }
    }
    if (
      field === "published_at" &&
      typeof normalized === "string" &&
      normalized.toLowerCase() === "now"
    ) {
      normalized = new Date().toISOString();
    }

    if (booleanFields.has(field) && typeof normalized !== "boolean")
      throw new Error(`${field} must be true or false`);
    if (
      numberFields.has(field) &&
      (typeof normalized !== "number" || !Number.isFinite(normalized))
    )
      throw new Error(`${field} must be a valid number`);
    if (
      arrayFields.has(field) &&
      (!Array.isArray(normalized) ||
        normalized.length > 100 ||
        normalized.some((item) => typeof item !== "string"))
    )
      throw new Error(`${field} must be a list of text values`);
    if (
      objectFields.has(field) &&
      (typeof normalized !== "object" ||
        (Array.isArray(normalized) && field !== "links") ||
        JSON.stringify(normalized).length > 20000)
    )
      throw new Error(`${field} must be a small JSON object`);
    if (
      !booleanFields.has(field) &&
      !numberFields.has(field) &&
      !arrayFields.has(field) &&
      !objectFields.has(field) &&
      (typeof normalized !== "string" || normalized.length > 10000)
    )
      throw new Error(`${field} must be text`);
    if (uuidFields.has(field)) uuidSchema.parse(normalized);
    if (
      [
        "url",
        "button_url",
        "image",
        "avatar",
        "logo",
        "hero_banner",
        "background_image",
      ].includes(field) &&
      normalized &&
      safeUrl(normalized, "") === ""
    )
      throw new Error(`${field} must be a safe URL`);
    if (
      field === "images" &&
      Array.isArray(normalized) &&
      normalized.some((url) => safeUrl(url, "") === "")
    )
      throw new Error("Images must use safe URLs");
    if (
      field === "google_maps_embed" &&
      normalized &&
      !googleMapsUrl(normalized)
    )
      throw new Error("Use a valid Google Maps embed URL");
    if (field === "svg_content") normalized = sanitizeSvg(normalized);
    clean[field] = normalized;
  }

  if (typeof clean.price === "number" && clean.price < 0)
    throw new Error("Price cannot be negative");
  if (typeof clean.compare_price === "number" && clean.compare_price < 0)
    throw new Error("Compare price cannot be negative");
  if (
    typeof clean.stock === "number" &&
    (!Number.isInteger(clean.stock) || clean.stock < 0)
  )
    throw new Error("Stock must be a non-negative whole number");
  if (
    typeof clean.rating === "number" &&
    (clean.rating < 1 || clean.rating > 5)
  )
    throw new Error("Rating must be between 1 and 5");
  if (
    clean.availability &&
    !["in_stock", "out_of_stock", "pre_order"].includes(
      String(clean.availability),
    )
  )
    throw new Error("Invalid availability");
  if (
    clean.location &&
    ![
      "header",
      "footer_main",
      "footer_quick",
      "footer_categories",
      "mobile",
    ].includes(String(clean.location))
  )
    throw new Error("Invalid navigation location");
  if (
    resource === "orders" &&
    clean.status &&
    ![
      "pending",
      "confirmed",
      "processing",
      "ready",
      "delivered",
      "cancelled",
    ].includes(String(clean.status))
  )
    throw new Error("Invalid order status");
  if (
    resource === "profiles" &&
    clean.role &&
    !["admin", "editor", "viewer"].includes(String(clean.role))
  )
    throw new Error("Invalid team role");
  const primary = RESOURCES[resource].primaryField;
  if (
    resource !== "profiles" &&
    typeof clean[primary] === "string" &&
    !String(clean[primary]).trim()
  )
    throw new Error(`${primary.replaceAll("_", " ")} is required`);
  const schema =
    resource === "products"
      ? productSchema
      : resource === "categories"
        ? categorySchema
        : resource === "brands"
          ? brandSchema
          : resource === "blog_posts"
            ? blogPostSchema
            : null;
  if (schema) {
    const result = schema.partial().safeParse(clean);
    if (!result.success)
      throw new Error(
        result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      );
  }
  if (
    clean.icon_library &&
    !["lucide", "uploaded"].includes(String(clean.icon_library))
  )
    throw new Error("Choose Lucide or an uploaded SVG icon");
  return clean;
}

export function validateNewRecord(
  resource: CmsResource,
  changes: Record<string, unknown>,
) {
  const primary = RESOURCES[resource].primaryField;
  if (typeof changes[primary] !== "string" || !String(changes[primary]).trim())
    throw new Error(`${primary.replaceAll("_", " ")} is required`);
  const schema =
    resource === "products"
      ? productSchema
      : resource === "categories"
        ? categorySchema
        : resource === "brands"
          ? brandSchema
          : resource === "blog_posts"
            ? blogPostSchema
            : null;
  if (schema) {
    const result = schema.safeParse(changes);
    if (!result.success)
      throw new Error(
        result.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join("; "),
      );
  }
}

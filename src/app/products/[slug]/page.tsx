import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { publicClient, siteUrl } from "@/lib/supabase/public";
import Detail from "./detail-client";
const load = cache(async (slug: string) => {
  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw new Error("Could not load this page");
  if (!data) notFound();
  return data;
});
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const row = await load(slug);
  const title = row.seo_title || row.name;
  const description = row.seo_description || row.description;
  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/products/${encodeURIComponent(slug)}`,
    },
    openGraph: { title, description, images: row.images },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <Detail initialProduct={await load(slug)} />;
}

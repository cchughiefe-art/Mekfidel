import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://mekfidel.vercel.app";
export function publicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export const publicSettings = cache(async () => {
  const { data, error } = await publicClient()
    .from("settings")
    .select("*")
    .single();
  if (error) throw new Error("Could not load business settings");
  return data;
});

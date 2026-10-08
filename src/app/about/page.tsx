import Link from "next/link";
import { publicClient } from "@/lib/supabase/public";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { safeUrl } from "@/lib/utils/safe-content";
export default async function AboutPage() {
  const db = publicClient();
  const [settings, info, stats] = await Promise.all([
    db.from("settings").select("company_name,about_text").single(),
    db
      .from("company_info")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    db
      .from("statistics")
      .select("*")
      .eq("is_verified", true)
      .eq("context", "about")
      .eq("is_active", true)
      .order("sort_order"),
  ]);
  if (settings.error || info.error || stats.error)
    throw new Error("About content could not be loaded");
  const entries = (info.data || []).filter((item) =>
    [
      "about",
      "story",
      "mission",
      "vision",
      "values",
      "business_description",
    ].some((key) => item.info_key?.includes(key)),
  );
  return (
    <div className="min-h-screen">
      <section className="gradient-hero py-20">
        <div className="container-custom text-center">
          <h1 className="text-4xl font-bold text-white md:text-6xl">
            About {settings.data?.company_name || "Mekfidel"}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-blue-100">
            Phone repair tools, replacement screens and spare parts at Alaba
            International Market, Lagos.
          </p>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-custom max-w-4xl space-y-12">
          <p className="whitespace-pre-line text-lg leading-relaxed text-gray-600">
            {settings.data?.about_text ||
              "We supply repair tools, screens and spare parts. Contact our team for help identifying the right part for your phone model and confirming availability."}
          </p>
          {entries.map((item) => (
            <article key={item.id} className="space-y-4">
              {item.title && (
                <h2 className="text-2xl font-bold">{item.title}</h2>
              )}
              <p className="whitespace-pre-line leading-relaxed text-gray-600">
                {item.content}
              </p>
              {"image" in item && item.image && (
                <OptimizedImage
                  src={safeUrl(item.image, "")}
                  alt={item.title || "Mekfidel"}
                  className="max-h-96 w-full rounded-2xl object-cover"
                />
              )}
            </article>
          ))}
          {(stats.data || []).length > 0 && (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.data?.map((stat) => (
                <div
                  key={stat.id}
                  className="rounded-xl border p-5 text-center"
                >
                  <p className="text-3xl font-bold">
                    {stat.value}
                    {stat.suffix}
                  </p>
                  <p>{stat.label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            <Link href="/products" className="btn-primary">
              Browse parts and tools
            </Link>
            <Link href="/contact" className="btn-outline">
              Contact the shop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

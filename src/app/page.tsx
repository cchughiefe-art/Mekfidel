import { cloneElement } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";
import Link from "next/link";
import { publicClient } from "@/lib/supabase/public";
import { safeUrl } from "@/lib/utils/safe-content";
import { IconRenderer } from "@/components/ui/icon-renderer";
import { ServicesOverview } from "@/components/home/services-overview";
import { ProductCategories } from "@/components/home/product-categories";
import { FeaturedProducts } from "@/components/home/featured-products";
import { Testimonials } from "@/components/home/testimonials";
import { GoogleMapSection } from "@/components/home/google-map";
export const dynamic = "force-dynamic";
export default async function HomePage() {
  const db = publicClient();
  const modules: Record<
    string,
    React.ReactElement<{ title?: string; subtitle?: string }>
  > = {
    services: <ServicesOverview />,
    categories: <ProductCategories />,
    product_categories: <ProductCategories />,
    featured_products: <FeaturedProducts />,
    testimonials: <Testimonials />,
    google_map: <GoogleMapSection />,
  };
  const [sections, cards, statistics] = await Promise.all([
    db.from("homepage_sections").select("*").order("sort_order"),
    db
      .from("feature_cards")
      .select("*")
      .eq("is_active", true)
      .order("sort_order"),
    db
      .from("statistics")
      .select("*")
      .eq("is_verified", true)
      .eq("is_active", true)
      .order("sort_order"),
  ]);
  if (sections.error || cards.error || statistics.error)
    throw new Error("Homepage content could not be loaded");
  return (
    <>
      {(sections.data || [])
        .filter((section) => section.is_active)
        .map((section) => {
          if (modules[section.section_key])
            return (
              <div key={section.id}>
                {cloneElement(modules[section.section_key], {
                  title: section.title || undefined,
                  subtitle: section.subtitle || undefined,
                })}
              </div>
            );
          const hero = section.section_type === "hero";
          const features = (cards.data || []).filter(
            (card) => card.section_id === section.id,
          );
          return (
            <section
              key={section.id}
              className={
                hero ? "gradient-hero py-20 text-white" : "section-padding"
              }
              style={{
                backgroundColor: section.background_color || undefined,
                color: section.color || undefined,
              }}
            >
              <div className="container-custom">
                <div
                  className={
                    hero
                      ? "grid items-center gap-12 lg:grid-cols-2"
                      : "mx-auto max-w-4xl text-center"
                  }
                >
                  <div>
                    {section.subtitle && (
                      <p className="mb-3 text-sm font-semibold uppercase tracking-wide">
                        {section.subtitle}
                      </p>
                    )}
                    {hero ? (
                      <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                        {section.title}
                      </h1>
                    ) : (
                      <h2 className="section-title">{section.title}</h2>
                    )}
                    {section.description && (
                      <p className="mt-5 whitespace-pre-line text-lg leading-relaxed">
                        {section.description}
                      </p>
                    )}
                    {section.button_text && section.button_url && (
                      <Link
                        href={safeUrl(section.button_url)}
                        className="mt-7 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
                      >
                        {section.button_text}
                      </Link>
                    )}
                  </div>
                  {(section.image || section.background_image) && (
                    <OptimizedImage
                      src={safeUrl(
                        section.image || section.background_image,
                        "",
                      )}
                      alt={section.title || "Mekfidel"}
                      className="max-h-96 w-full rounded-2xl object-cover"
                      loading={hero ? "eager" : "lazy"}
                    />
                  )}
                </div>
                {features.length > 0 && (
                  <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((card) => (
                      <article
                        key={card.id}
                        className="rounded-2xl border bg-white p-6 text-gray-900"
                      >
                        <IconRenderer
                          library={card.icon_library || "lucide"}
                          iconName={card.icon_name || "Package"}
                          className={`mb-4 h-8 w-8 rounded-lg ${card.icon_color || "text-blue-600 bg-blue-50"}`}
                        />
                        <h3 className="text-lg font-bold">{card.title}</h3>
                        <p className="mt-2 text-gray-600">{card.description}</p>
                        {card.url && (
                          <Link
                            href={safeUrl(card.url)}
                            className="mt-3 inline-block text-blue-600"
                          >
                            Learn more
                            <span className="sr-only"> about {card.title}</span>
                          </Link>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      {(statistics.data || []).filter(
        (stat) => stat.context === "homepage" || stat.context === "home",
      ).length > 0 && (
        <section className="container-custom grid grid-cols-2 gap-5 py-10 md:grid-cols-4">
          {(statistics.data || [])
            .filter(
              (stat) => stat.context === "homepage" || stat.context === "home",
            )
            .map((stat) => (
              <div key={stat.id} className="rounded-xl border p-6 text-center">
                <p className="text-3xl font-bold">
                  {stat.value}
                  {stat.suffix}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
        </section>
      )}
      {Object.entries(modules)
        .filter(
          ([key]) =>
            key !== "product_categories" &&
            !(sections.data || []).some(
              (section) =>
                section.section_key === key ||
                (key === "categories" &&
                  section.section_key === "product_categories"),
            ),
        )
        .map(([key, module]) => (
          <div key={key}>{module}</div>
        ))}
    </>
  );
}

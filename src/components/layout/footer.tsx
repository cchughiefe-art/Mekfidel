"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useSettings } from "@/hooks/use-supabase-query";
import { safeUrl } from "@/lib/utils/safe-content";
type FooterSection = {
  id: string;
  section_key: string;
  title: string;
  content: string;
  links: Array<{
    label?: string;
    name?: string;
    url?: string;
    href?: string;
  }> | null;
};
type MenuLink = { id: string; label: string; url: string; location: string };
type SocialLink = { id: string; label: string; platform: string; url: string };
export function Footer() {
  const { data: settings } = useSettings();
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { data: sections = [] } = useQuery<FooterSection[]>({
    queryKey: ["public-footer"],
    queryFn: async () => {
      const response = await fetch("/api/footer");
      if (!response.ok) throw new Error("Footer could not be loaded");
      return response.json();
    },
  });
  const { data: social = [] } = useQuery<SocialLink[]>({
    queryKey: ["public-social"],
    queryFn: async () => {
      const response = await fetch("/api/social-links");
      if (!response.ok) throw new Error("Social links could not be loaded");
      return response.json();
    },
  });
  const { data: menus = [] } = useQuery<MenuLink[]>({
    queryKey: ["public-footer-navigation"],
    queryFn: async () => {
      const response = await fetch("/api/navigation");
      if (!response.ok) throw new Error("Footer links could not be loaded");
      return response.json();
    },
  });
  const newsletter = sections.find(
    (section) => section.section_key === "newsletter",
  );
  return (
    <footer className="bg-slate-950 text-slate-300">
      {newsletter && (
        <section className="border-b border-slate-800">
          <div className="container-custom max-w-2xl py-12 text-center">
            <h2 className="text-2xl font-bold text-white">
              {newsletter.title}
            </h2>
            <p className="my-4">
              {newsletter.content || "Get updates about products and offers."}
            </p>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                setSubmitting(true);
                setFeedback("");
                try {
                  const response = await fetch("/api/newsletter", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      email: new FormData(form).get("email"),
                      consent: true,
                    }),
                  });
                  const body = await response.json();
                  if (!response.ok)
                    throw new Error(body.error || "Could not subscribe");
                  setFeedback("Subscription saved. Thank you!");
                  form.reset();
                } catch (error) {
                  setFeedback(
                    error instanceof Error ? error.message : "Try again later.",
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                required
                type="email"
                name="email"
                maxLength={254}
                autoComplete="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white"
              />
              <button
                disabled={submitting}
                type="submit"
                className="btn-primary"
              >
                {submitting ? "Saving…" : "Subscribe"}
              </button>
            </form>
            <p className="mt-3 text-xs">
              By subscribing, you agree to receive updates.{" "}
              <Link href="/privacy" className="underline">
                Privacy policy
              </Link>
            </p>
            <p role="status" className="mt-3 text-sm">
              {feedback}
            </p>
          </div>
        </section>
      )}
      <div className="container-custom grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {sections
          .filter((section) => section.section_key !== "newsletter")
          .map((section) => (
            <section key={section.id}>
              <h2 className="mb-4 font-bold text-white">{section.title}</h2>
              {section.content && (
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {section.content}
                </p>
              )}
              {section.section_key === "company" && (
                <>
                  <p className="text-sm leading-relaxed">
                    {settings?.footer_text ||
                      "Phone repair tools, replacement screens and spare parts."}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {social
                      .filter((link) => /^https?:\/\//i.test(link.url))
                      .map((link) => (
                        <a
                          key={link.id}
                          href={safeUrl(link.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline"
                        >
                          {link.label || link.platform}
                        </a>
                      ))}
                  </div>
                </>
              )}
              {section.section_key === "contact" && (
                <address className="space-y-2 text-sm not-italic">
                  <p>{settings?.address}</p>
                  {settings?.phone && (
                    <a
                      className="block"
                      href={
                        "tel:" + String(settings.phone).replace(/[^+0-9]/g, "")
                      }
                    >
                      {settings.phone}
                    </a>
                  )}
                  {settings?.email && (
                    <a
                      className="block break-all"
                      href={"mailto:" + settings.email}
                    >
                      {settings.email}
                    </a>
                  )}
                  <p>{settings?.business_hours}</p>
                </address>
              )}
              {menus.filter(
                (item) =>
                  item.location ===
                  (
                    {
                      quick_links: "footer_quick",
                      categories: "footer_categories",
                      company: "footer_main",
                    } as Record<string, string>
                  )[section.section_key],
              ).length > 0 && (
                <ul className="mt-3 space-y-2">
                  {menus
                    .filter(
                      (item) =>
                        item.location ===
                        (
                          {
                            quick_links: "footer_quick",
                            categories: "footer_categories",
                            company: "footer_main",
                          } as Record<string, string>
                        )[section.section_key],
                    )
                    .map((item) => (
                      <li key={item.id}>
                        <Link
                          href={safeUrl(item.url)}
                          className="text-sm hover:text-white"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
              {Array.isArray(section.links) && (
                <ul className="mt-3 space-y-2">
                  {section.links.map((link, index) => (
                    <li key={index}>
                      <Link
                        href={safeUrl(link.url || link.href)}
                        className="text-sm hover:text-white"
                      >
                        {link.label || link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
      </div>
      <div className="container-custom flex flex-col gap-4 border-t border-slate-800 py-6 text-xs sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} {settings?.company_name || "Mekfidel"}
        </p>
        <nav aria-label="Policies" className="flex flex-wrap gap-5">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/return-policy">Returns</Link>
        </nav>
      </div>
    </footer>
  );
}

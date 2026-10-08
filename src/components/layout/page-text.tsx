"use client";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
export function PageText({ placement }: { placement: "top" | "bottom" }) {
  const path = usePathname();
  const page = path === "/" ? "home" : path.split("/")[1];
  const { data, error } = useQuery({
    queryKey: ["public-page-text", page],
    queryFn: async () => {
      const { data, error } = await createClient()
        .from("content_blocks")
        .select("id,title,content,position")
        .eq("page", page)
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  if (error)
    return (
      <p role="alert" className="container-custom py-4 text-sm text-gray-500">
        Additional page text could not be loaded.
      </p>
    );
  const rows = data?.filter(
    (row) => (row.position === "top" ? "top" : "bottom") === placement,
  );
  if (!rows?.length) return null;
  return (
    <section className="section-padding">
      <div className="container-custom max-w-4xl space-y-8">
        {rows.map((row) => (
          <article key={row.id}>
            {row.title && (
              <h2 className="mb-4 text-2xl font-bold">{row.title}</h2>
            )}
            <p className="whitespace-pre-line leading-relaxed text-gray-600">
              {row.content}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

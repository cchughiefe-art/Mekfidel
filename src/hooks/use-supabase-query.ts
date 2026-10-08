import { notifyContentChange } from "@/lib/utils/content-sync";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CmsResource } from "@/lib/ai-cms/types";
import toast from "react-hot-toast";

const supabase = typeof window !== "undefined" ? createClient() : null;

export function useSupabaseQuery<T>(
  key: string[],
  table: string,
  options?: {
    select?: string;
    eq?: [string, unknown];
    order?: { column: string; ascending?: boolean };
    limit?: number;
    single?: boolean;
  },
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      if (!supabase) throw new Error("Not available server-side");

      let query = supabase.from(table).select(options?.select || "*");

      if (options?.eq) {
        query = query.eq(options.eq[0], options.eq[1]);
      }
      if (options?.order) {
        query = query.order(options.order.column, {
          ascending: options.order.ascending ?? false,
        });
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.single) {
        const { data, error } = await query.single();
        if (error) throw error;
        return data as T;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as T;
    },
  });
}

export function useSupabaseDelete(table: string, _invalidateKeys: string[][]) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Not available");
      const response = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource: table as CmsResource,
          operation: "delete",
          targetId: id,
          targetLabel: table,
          changes: {},
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not delete");
    },
    onSuccess: () => {
      notifyContentChange();
      _invalidateKeys.forEach((key) =>
        queryClient.invalidateQueries({ queryKey: key }),
      );
      queryClient.invalidateQueries();
      toast.success("Deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete");
    },
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!supabase) throw new Error("Not available");
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

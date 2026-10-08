"use client";
import { notifyContentChange } from "@/lib/utils/content-sync";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import toast from "react-hot-toast";
type Change = {
  id: string;
  summary: string;
  status: string;
  created_at: string;
  provider?: string;
  canUndo: boolean;
};
export default function ChangeHistory() {
  const client = useQueryClient();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-change-history"],
    queryFn: async () => {
      const response = await fetch("/api/ai-cms");
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Could not load history");
      return result.history as Change[];
    },
  });
  const undo = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/ai-cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "rollback", requestId: id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not undo");
    },
    onSuccess: async () => {
      notifyContentChange();
      await client.invalidateQueries();
      toast.success("Change undone");
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your change history</h1>
        <p className="mt-2 text-gray-500">
          Your latest 20 manual and AI changes. Undo is available when the
          records have not changed since. Order transitions and file uploads use
          their own controls.
        </p>
      </div>
      {isLoading ? (
        <Spinner />
      ) : error ? (
        <div role="alert">
          <p>History could not be loaded.</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </div>
      ) : !data?.length ? (
        <p>No changes recorded yet.</p>
      ) : (
        <ul className="space-y-3">
          {data.map((change) => (
            <li
              key={change.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-white p-5"
            >
              <div>
                <p className="font-medium">{change.summary}</p>
                <p className="mt-1 text-sm text-gray-500">
                  {new Date(change.created_at).toLocaleString("en-NG", {
                    timeZone: "Africa/Lagos",
                  })}{" "}
                  · {change.provider || "Manual"} · {change.status}
                </p>
              </div>
              {change.status === "applied" && change.canUndo && (
                <Button
                  variant="outline"
                  disabled={undo.isPending}
                  onClick={() => {
                    if (
                      confirm(
                        "Undo this change? If another edit conflicts, nothing will be changed.",
                      )
                    )
                      undo.mutate(change.id);
                  }}
                >
                  Undo change
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

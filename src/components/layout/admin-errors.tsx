"use client";
import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
export function AdminErrors() {
  const client = useQueryClient();
  const cache = client.getQueryCache();
  const message = useSyncExternalStore(
    (listener) => cache.subscribe(listener),
    () =>
      cache
        .getAll()
        .filter(
          (query) =>
            query.getObserversCount() > 0 && query.state.status === "error",
        )
        .map((query) =>
          query.state.error instanceof Error
            ? query.state.error.message
            : "Could not load data",
        )
        .join(" · "),
    () => "",
  );
  return message ? (
    <div
      role="alert"
      className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
    >
      <p>Some information could not be loaded: {message}</p>
      <button
        className="mt-2 font-semibold underline"
        onClick={() => client.refetchQueries({ type: "active" })}
      >
        Try again
      </button>
    </div>
  ) : null;
}

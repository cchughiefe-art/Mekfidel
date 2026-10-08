"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
export function ContentSync() {
  const client = useQueryClient();
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      void client.invalidateQueries();
      router.refresh();
    };
    const storage = (event: StorageEvent) => {
      if (event.key === "mekfidel-content-revision") refresh();
    };
    window.addEventListener("mekfidel-content-change", refresh);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener("mekfidel-content-change", refresh);
      window.removeEventListener("storage", storage);
    };
  }, [client, router]);
  return null;
}

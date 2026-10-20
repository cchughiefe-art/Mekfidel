"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ArrowUpRight, ShieldCheck } from "lucide-react";
export function AdminTopbar({ role }: { role: "admin" | "editor" }) {
  const path = usePathname().split("/").filter(Boolean).slice(1);
  const label = (path[0] || "overview").replaceAll("-", " ");
  return (
    <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-5">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span>Workspace</span>
        <ChevronRight className="h-3 w-3" />
        <span className="font-semibold capitalize text-slate-700">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold capitalize text-slate-600">
          <ShieldCheck className="h-3 w-3" />
          {role} access
        </span>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 text-xs font-semibold text-slate-700 sm:flex"
        >
          View storefront
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

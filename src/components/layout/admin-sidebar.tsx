"use client";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  History,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Search,
  Settings,
  Image,
  FileText,
  UserCog,
  LogOut,
  Tags,
  Bookmark,
  Toolbox,
  Home,
  Menu,
  Share2,
  ImageIcon,
  Star,
  HelpCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import toast from "react-hot-toast";
const groups = [
  {
    name: "Start here",
    links: [
      ["Overview", "dashboard", LayoutDashboard],
      ["AI assistant", "ai-assistant", Sparkles],
      ["Change history", "history", History],
    ],
  },
  {
    name: "Shop & orders",
    links: [
      ["Products", "products", Package],
      ["Categories", "categories", Tags],
      ["Brands", "brands", Bookmark],
      ["Screen compatibility", "compatibility", Search],
      ["Orders", "orders", ShoppingCart],
      ["Customers", "customers", Users],
      ["Sales overview", "analytics", BarChart3],
    ],
  },
  {
    name: "Website content",
    links: [
      ["Homepage", "homepage", Home],
      ["About & page text", "content", FileText],
      ["Menus & links", "navigation", Menu],
      ["Footer", "footer", Share2],
      ["Services", "services", Toolbox],
      ["Blog posts", "blog", FileText],
      ["Reviews", "testimonials", Star],
      ["Questions & answers", "faqs", HelpCircle],
      ["Images & files", "media", Image],
      ["Icons", "icons", ImageIcon],
    ],
  },
  {
    name: "Administration",
    links: [
      ["Search engine settings", "seo", Search],
      ["Business settings", "settings", Settings],
      ["Team access", "users", UserCog],
    ],
  },
] as const;
export function AdminSidebar({
  role = "admin",
}: {
  role?: "admin" | "editor";
}) {
  const visibleGroups = groups
    .map((group) => ({
      ...group,
      links: group.links.filter(
        ([, path]) =>
          role === "admin" ||
          [
            "homepage",
            "navigation",
            "footer",
            "services",
            "blog",
            "testimonials",
            "faqs",
            "media",
            "icons",
            "history",
            "content",
          ].includes(path),
      ),
    }))
    .filter((group) => group.links.length);
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const logout = async () => {
    const { error } = await createClient().auth.signOut();
    if (error) {
      toast.error("Could not sign out. Try again.");
      return;
    }
    queryClient.clear();
    router.replace("/auth/login");
    router.refresh();
  };
  const navigation = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-4 pb-3 pt-4">
        <Input
          aria-label="Find a control"
          placeholder="Search products, orders…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <nav
        aria-label="Admin controls"
        className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 pb-5"
      >
        {visibleGroups.map((group) => {
          const links = group.links.filter(([label]) =>
            label.toLowerCase().includes(search.toLowerCase()),
          );
          return links.length ? (
            <div key={group.name}>
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {group.name}
              </p>
              {links.map(([label, path, Icon]) => {
                const href = "/admin/" + path;
                const active =
                  pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={path}
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "my-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      active
                        ? "bg-blue-600 text-white"
                        : "text-slate-200 hover:bg-slate-800",
                    )}
                  >
                    <Icon aria-hidden className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </div>
          ) : null;
        })}
        {search &&
          !visibleGroups.some((g) =>
            g.links.some(([label]) =>
              label.toLowerCase().includes(search.toLowerCase()),
            ),
          ) && (
            <p className="px-3 text-sm text-slate-300">
              No controls match. Try another word.
            </p>
          )}
      </nav>
      <div className="space-y-1 border-t border-slate-800 p-3">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          <ExternalLink className="h-4 w-4" />
          Preview website
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 lg:hidden">
        <Link href="/admin/dashboard" className="font-bold text-slate-900">
          Mekfidel <span className="font-normal text-slate-500">Admin</span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open admin controls"
          aria-expanded={open}
          className="rounded-lg border p-2"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-950 lg:flex">
        <Link
          href="/admin/dashboard"
          className="border-b border-slate-800 px-6 py-5 text-lg font-bold text-white"
        >
          Mekfidel{" "}
          <span className="block text-xs font-normal text-slate-400">
            Your business workspace
          </span>
        </Link>
        {navigation}
      </aside>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Admin controls"
        className="bg-slate-950 text-white"
      >
        <div className="flex h-[65dvh] flex-col">{navigation}</div>
      </Modal>
    </>
  );
}

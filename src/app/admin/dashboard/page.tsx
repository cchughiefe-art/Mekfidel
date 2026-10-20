"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, getStatusColor } from "@/lib/utils/format";
import {
  Package,
  ShoppingCart,
  Users,
  ArrowUpRight,
  Plus,
  ArrowRight,
  CircleAlert,
  Wallet,
  ScanLine,
  Sparkles,
} from "lucide-react";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
export default function AdminDashboard() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const db = createClient();
      const [summary, customers, recent, low] = await Promise.all([
        db.rpc("get_admin_statistics"),
        db.from("customers").select("id", { count: "exact", head: true }),
        db
          .from("orders")
          .select("id,customer_name,total,status,created_at")
          .order("created_at", { ascending: false })
          .limit(6),
        db
          .from("products")
          .select("id,name,sku,stock")
          .eq("is_active", true)
          .neq("availability", "pre_order")
          .lte("stock", 5)
          .order("stock")
          .limit(5),
      ]);
      if (summary.error || customers.error || recent.error || low.error)
        throw new Error("Could not load your overview");
      return {
        ...(summary.data as {
          totalRevenue: number;
          totalOrders: number;
          products: number;
          pendingOrders: number;
        }),
        customers: customers.count || 0,
        recent: recent.data || [],
        low: low.data || [],
      };
    },
  });
  if (isLoading)
    return (
      <div className="py-24">
        <Spinner size="lg" />
      </div>
    );
  if (error || !stats)
    return (
      <ErrorState
        message="Your overview could not be loaded. No figures are shown until the data is available."
        onRetry={refetch}
      />
    );
  const cards = [
    {
      label: "Delivered revenue",
      value: formatPrice(stats.totalRevenue),
      icon: Wallet,
      note: "From completed deliveries",
    },
    {
      label: "Order requests",
      value: stats.totalOrders,
      icon: ShoppingCart,
      note: `${stats.pendingOrders} awaiting confirmation`,
    },
    {
      label: "Catalogue products",
      value: stats.products,
      icon: Package,
      note: "Across your product catalogue",
    },
    {
      label: "Customer records",
      value: stats.customers,
      icon: Users,
      note: "Your customer directory",
    },
  ];
  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2 text-slate-500">BUSINESS AT A GLANCE</p>
          <h1 className="text-3xl font-semibold text-slate-950">
            Store overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Your orders, inventory and next steps in one place.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="btn-primary inline-flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add product
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, note }) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-3 text-[11px] text-slate-500">{note}</p>
          </article>
        ))}
      </div>
      {stats.pendingOrders > 0 && (
        <Link
          href="/admin/orders"
          className="flex items-center gap-4 rounded-xl border border-lime-200 bg-lime-50 p-5"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
            <CircleAlert className="h-5 w-5 text-lime-800" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              {stats.pendingOrders} order request
              {stats.pendingOrders === 1 ? "" : "s"} to review
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Review availability and customer details. Confirming an order
              reserves its stock.
            </p>
          </div>
          <ArrowRight className="ml-auto h-5 w-5 shrink-0" />
        </Link>
      )}
      <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <div>
              <h2 className="font-semibold">Recent orders</h2>
              <p className="mt-1 text-xs text-slate-500">
                The latest requests from your storefront
              </p>
            </div>
            <Link href="/admin/orders" className="text-xs font-semibold">
              View all
              <ArrowUpRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[490px] text-left text-sm">
              <thead>
                <tr className="text-slate-400">
                  <th className="px-5 py-3">Customer / reference</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((order) => (
                  <tr key={order.id} className="border-b border-slate-100">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-800">
                        {order.customer_name}
                      </p>
                      <p className="mt-1 font-mono text-[10px] text-slate-400">
                        {order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-3 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-[10px] font-semibold capitalize ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-medium">
                      {formatPrice(Number(order.total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!stats.recent.length && (
              <p className="px-5 py-14 text-center text-sm text-slate-400">
                No orders yet. New requests will appear here.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <h2 className="font-semibold">Inventory watch</h2>
            <p className="mt-1 text-xs text-slate-500">
              Active items with five units or fewer
            </p>
          </div>
          <div className="divide-y divide-slate-100 px-5">
            {stats.low.map((product) => (
              <Link
                key={product.id}
                href={`/admin/products/edit/${product.id}`}
                className="flex items-center gap-3 py-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                  <Package className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {product.name}
                  </span>
                  <span className="mt-1 block text-[10px] text-slate-400">
                    {product.sku}
                  </span>
                </span>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-semibold ${product.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}
                >
                  {product.stock} left
                </span>
              </Link>
            ))}
            {!stats.low.length && (
              <p className="py-14 text-center text-sm text-slate-400">
                No low-stock items to review.
              </p>
            )}
          </div>
        </section>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Keep your storefront fresh",
            text: "Update banners, page copy and navigation.",
            url: "/admin/homepage",
            icon: Package,
          },
          {
            title: "Your catalogue assistant",
            text: "Preview a change before you apply it.",
            url: "/admin/ai-assistant",
            icon: Sparkles,
          },
          {
            title: "Help customers find a fit",
            text: "Maintain your screen compatibility list.",
            url: "/admin/compatibility",
            icon: ScanLine,
          },
        ].map(({ title, text, url, icon: Icon }) => (
          <Link
            key={url}
            href={url}
            className="group rounded-2xl border border-slate-200 bg-white p-5"
          >
            <div className="flex justify-between">
              <Icon className="h-5 w-5 text-slate-500" />
              <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-700" />
            </div>
            <h2 className="mt-5 text-sm font-semibold">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatPrice, getStatusColor } from "@/lib/utils/format";
import { ErrorState } from "@/components/ui/error-state";
import { Spinner } from "@/components/ui/spinner";
type Analytics = {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    deliveredOrders: number;
    pendingOrders: number;
  };
  statuses: { status: string; count: number }[];
  months: { month: string; revenue: number; requests: number }[];
};
export default function AdminAnalyticsPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data, error } = await createClient().rpc(
        "get_commerce_analytics",
      );
      if (error) throw new Error("Sales overview unavailable");
      return data as Analytics;
    },
  });
  if (isLoading)
    return (
      <div className="py-24">
        <Spinner size="lg" />
      </div>
    );
  if (error || !data)
    return (
      <ErrorState
        message="Sales analytics could not be loaded. Check that the latest database migration is applied."
        onRetry={refetch}
      />
    );
  const max = Math.max(1, ...data.months.map((month) => Number(month.revenue)));
  return (
    <div className="space-y-7">
      <div>
        <p className="eyebrow text-slate-500">COMMERCE INSIGHTS</p>
        <h1 className="mt-2 text-3xl font-semibold">Sales overview</h1>
        <p className="mt-2 text-sm text-slate-500">
          Actual order activity. Revenue includes delivered orders only.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Delivered revenue",
            value: formatPrice(data.summary.totalRevenue),
          },
          { label: "All order requests", value: data.summary.totalOrders },
          { label: "Delivered orders", value: data.summary.deliveredOrders },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border bg-white p-6">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight">
              {item.value}
            </p>
          </div>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Delivered revenue by order month</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Orders placed in each month, counted at their current status. UTC
            month boundaries.
          </p>
          <div className="mt-8 space-y-5">
            {data.months.map((month) => (
              <div key={month.month}>
                <div className="mb-2 flex justify-between text-xs">
                  <span className="font-medium">
                    {new Intl.DateTimeFormat("en-NG", {
                      month: "short",
                      year: "numeric",
                      timeZone: "UTC",
                    }).format(new Date(month.month + "-01T00:00:00Z"))}
                  </span>
                  <span className="text-slate-500">
                    {formatPrice(Number(month.revenue))}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-[#547949]"
                    style={{ width: `${(Number(month.revenue) / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border bg-white p-6">
          <h2 className="font-semibold">Order pipeline</h2>
          <p className="mt-1 text-xs text-slate-500">
            Current status across all orders
          </p>
          <div className="mt-6 divide-y divide-slate-100">
            {data.statuses.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between py-4"
              >
                <span
                  className={`rounded-md px-2 py-1 text-xs capitalize ${getStatusColor(item.status)}`}
                >
                  {item.status}
                </span>
                <span className="text-lg font-semibold">{item.count}</span>
              </div>
            ))}
            {!data.statuses.length && (
              <p className="py-12 text-sm text-slate-400">
                Your pipeline will appear when orders arrive.
              </p>
            )}
          </div>
        </section>
      </div>
      <section className="overflow-x-auto rounded-2xl border bg-white p-6">
        <h2 className="mb-5 font-semibold">Monthly detail</h2>
        <table className="min-w-[400px] text-left text-sm">
          <thead>
            <tr className="text-slate-400">
              <th className="py-3">Month</th>
              <th className="py-3">Requests</th>
              <th className="py-3 text-right">Delivered revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.months.map((month) => (
              <tr key={month.month}>
                <td className="py-3">{month.month}</td>
                <td>{month.requests}</td>
                <td className="text-right">
                  {formatPrice(Number(month.revenue))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

"use client";

export const dynamic = "force-dynamic";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils/format";
import { TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";

export default function AdminAnalyticsPage() {
  const supabase = createClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_admin_statistics");
      if (error) throw new Error("Analytics could not be loaded");
      return data as {
        totalRevenue: number;
        totalOrders: number;
        products: number;
        deliveredOrders: number;
        pendingOrders: number;
      };
    },
  });

  if (isLoading)
    return (
      <p role="status" className="p-8 text-gray-500">
        Loading sales overview…
      </p>
    );
  const stats = [
    {
      title: "Delivered sales",
      value: formatPrice(data?.totalRevenue || 0),
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Total Orders",
      value: data?.totalOrders || 0,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Products",
      value: data?.products || 0,
      icon: Package,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Delivered Orders",
      value: data?.deliveredOrders || 0,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Business performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div
                className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mb-4`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-bold mb-4">
          Pending Orders: {data?.pendingOrders || 0}
        </h2>
        <p className="text-gray-500">
          Detailed analytics with charts will be available after collecting more
          data.
        </p>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils/format";
import { Package, ShoppingCart, Users, AlertCircle } from "lucide-react";

export default function AdminDashboard() {
  const supabase = createClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const counts = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("orders").select("*", { count: "exact", head: true }),
        supabase.from("customers").select("*", { count: "exact", head: true }),
        supabase
          .from("orders")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
      ]);
      if (counts.some((result) => result.error))
        throw new Error("Dashboard counts could not be loaded");
      const [products, orders, customers, pendingOrders] = counts.map(
        (result) => result.count,
      );

      const { data: recentOrders, error: queryError1 } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (queryError1) throw queryError1;

      const { data: lowStock, error: queryError2 } = await supabase
        .from("products")
        .select("*")
        .lte("stock", 5)
        .eq("is_active", true)
        .limit(5);
      if (queryError2) throw queryError2;

      return {
        productsCount: products || 0,
        ordersCount: orders || 0,
        customersCount: customers || 0,
        pendingOrders: pendingOrders || 0,
        recentOrders: recentOrders || [],
        lowStockProducts: lowStock || [],
      };
    },
  });

  if (isLoading)
    return (
      <p role="status" className="p-8 text-gray-500">
        Loading your business overview…
      </p>
    );
  const cards = [
    {
      title: "Total Products",
      value: stats?.productsCount || 0,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Orders",
      value: stats?.ordersCount || 0,
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      title: "Customers",
      value: stats?.customersCount || 0,
      icon: Users,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Pending Orders",
      value: stats?.pendingOrders || 0,
      icon: AlertCircle,
      color: "bg-yellow-50 text-yellow-600",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-slate-950 p-6 text-white sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">
          Your workspace
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
          What would you like to do?
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate-300">
          Use a quick action below, find a control in the menu, or describe a
          change to your AI assistant.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-950"
          >
            Add a product
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold"
          >
            Review orders
          </Link>
          <Link
            href="/admin/ai-assistant"
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold"
          >
            Ask your assistant
          </Link>
          <Link
            href="/admin/homepage"
            className="rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold"
          >
            Edit homepage
          </Link>
        </div>
      </section>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm text-gray-500 mt-1">{card.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6">
            {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No orders yet</p>
            ) : (
              <div className="space-y-4">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer_phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              Low Stock Alerts
            </h2>
          </div>
          <div className="p-6">
            {!stats?.lowStockProducts || stats.lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                All products have sufficient stock
              </p>
            ) : (
              <div className="space-y-4">
                {stats.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        SKU: {product.sku}
                      </p>
                    </div>
                    <span
                      className={`font-bold ${product.stock === 0 ? "text-red-600" : "text-yellow-600"}`}
                    >
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

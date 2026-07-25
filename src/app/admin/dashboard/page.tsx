'use client';

import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils/format';
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const supabase = createClient();

  const { data: stats } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [
        { count: products },
        { count: orders },
        { count: customers },
        { count: pendingOrders },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('customers').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: lowStock } = await supabase
        .from('products')
        .select('*')
        .lte('stock', 5)
        .eq('is_active', true)
        .limit(5);

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

  const cards = [
    { title: 'Total Products', value: stats?.productsCount || 0, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { title: 'Total Orders', value: stats?.ordersCount || 0, icon: ShoppingCart, color: 'bg-green-50 text-green-600' },
    { title: 'Customers', value: stats?.customersCount || 0, icon: Users, color: 'bg-purple-50 text-purple-600' },
    { title: 'Pending Orders', value: stats?.pendingOrders || 0, icon: AlertCircle, color: 'bg-yellow-50 text-yellow-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your store</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center`}>
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
                {stats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-500">{order.customer_phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(order.total)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
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
            <h2 className="text-lg font-bold text-gray-900">Low Stock Alerts</h2>
          </div>
          <div className="p-6">
            {!stats?.lowStockProducts || stats.lowStockProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">All products have sufficient stock</p>
            ) : (
              <div className="space-y-4">
                {stats.lowStockProducts.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <span className={`font-bold ${product.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
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


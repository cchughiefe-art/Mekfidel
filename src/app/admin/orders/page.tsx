'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatDateTime, getStatusColor } from '@/lib/utils/format';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Search, Eye, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import type { OrderStatus } from '@/types';

const statuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'processing',
  'ready',
  'delivered',
  'cancelled',
];

const ITEMS_PER_PAGE = 10;

export default function AdminOrdersPage() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Check authentication
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ['admin-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!session) throw new Error('Not authenticated');
      return session;
    },
  });

  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['admin-orders', search, statusFilter],
    enabled: !!session,
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*, items:order_items(*)')
        .order('created_at', { ascending: false });

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      if (search) {
        query = query.or(
          `customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%,customer_email.ilike.%${search}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Calculate pagination
  const totalPages = Math.ceil((orders?.length || 0) / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = orders?.slice(startIdx, startIdx + ITEMS_PER_PAGE) || [];

  // Use server API route for updating status
  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update status');
      }

      return response.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Status updated successfully');
      setSelectedOrder((prev: any) =>
        prev ? { ...prev, status: variables.status } : prev
      );
    },
    onError: (error: any) => {
      console.error('Status update error:', error);
      toast.error(error.message || 'Failed to update status');
    },
  });

  // Use server API route for deleting
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete order');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order deleted successfully');
      setSelectedOrder(null);
      setCurrentPage(1);
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete order');
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this order permanently?')) {
      deleteMutation.mutate(id);
    }
  };

  // Show authentication error
  if (!sessionLoading && sessionError) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-red-600 mb-4">You must be logged in to access this page.</p>
        <a href="/auth/login" className="text-blue-600 hover:text-blue-700">
          Go to Login
        </a>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 px-4">
        <p className="text-red-600">Error loading orders: {(error as any).message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">Manage customer orders</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search orders..."
            className="input-field pl-12 w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="input-field w-full sm:w-auto"
        >
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Phone</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Items</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-20">
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  </td>
                </tr>
              ) : paginatedOrders?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                paginatedOrders?.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.customer_name}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{order.customer_phone}</td>
                    <td className="px-6 py-4 text-gray-700">{order.items?.length || 0}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDateTime(order.created_at)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Order"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner />
          </div>
        ) : paginatedOrders?.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No orders found
          </div>
        ) : (
          paginatedOrders?.map((order: any) => (
            <div
              key={order.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{order.customer_name}</p>
                  <p className="text-sm text-gray-500">{order.customer_phone}</p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500">Items</p>
                  <p className="font-medium text-gray-900">{order.items?.length || 0}</p>
                </div>
                <div>
                  <p className="text-gray-500">Total</p>
                  <p className="font-medium text-gray-900">{formatPrice(order.total)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-900 text-xs">
                    {formatDateTime(order.created_at).split(' ')[0]}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="flex-1 px-3 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors active:bg-blue-800"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(order.id)}
                  className="px-3 py-3 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors active:bg-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-100 p-3 sm:p-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Page <span className="font-semibold">{currentPage}</span> of{' '}
              <span className="font-semibold">{totalPages}</span>
            </span>
          </div>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title="Order Details"
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Customer</p>
                <p className="font-medium text-gray-900">{selectedOrder.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Phone</p>
                <p className="font-medium text-gray-900">{selectedOrder.customer_phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Email</p>
                <p className="font-medium text-gray-900 break-all text-sm">{selectedOrder.customer_email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Date</p>
                <p className="font-medium text-gray-900 text-sm">{formatDateTime(selectedOrder.created_at)}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Address</p>
                <p className="font-medium text-gray-900">{selectedOrder.customer_address}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">State</p>
                <p className="font-medium text-gray-900">{selectedOrder.state}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">City</p>
                <p className="font-medium text-gray-900">{selectedOrder.city}</p>
              </div>
            </div>

            {/* Items */}
            <div className="border-t pt-4">
              <p className="font-semibold mb-3 text-gray-900">Items</p>
              <div className="space-y-2">
                {selectedOrder.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex justify-between text-sm bg-gray-50 p-3 rounded-lg"
                  >
                    <span className="text-gray-700">
                      {item.product_name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4 pt-4 border-t font-bold text-base sm:text-lg">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-600">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Notes</p>
                <p className="text-gray-700 text-sm">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Status Update */}
            <div className="border-t pt-4">
              <p className="font-semibold mb-4 text-gray-900">Update Status</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      statusMutation.mutate({ id: selectedOrder.id, status })
                    }
                    disabled={statusMutation.isPending}
                    className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      selectedOrder.status === status
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Delete Button */}
            <div className="border-t pt-4 flex gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 px-4 py-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => handleDelete(selectedOrder.id)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-3 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Order'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

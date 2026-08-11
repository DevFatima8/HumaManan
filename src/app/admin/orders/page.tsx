// src/app/admin/orders/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import AdminClient from '../AdminClient';
import { Bell, ShoppingBag, RefreshCw } from 'lucide-react';

export default function AdminOrdersPage() {
  const { ordersList, refreshData } = useStore();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const loadOrders = async () => {
    setLoading(true);
    await refreshData();
    const ordersData = ordersList || [];
    setOrders(ordersData);
    const pending = ordersData.filter((o: any) => o.status === 'Pending').length;
    setPendingCount(pending);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (ordersList) {
      setOrders(ordersList);
      const pending = ordersList.filter((o: any) => o.status === 'Pending').length;
      setPendingCount(pending);
    }
  }, [ordersList]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-10 h-10 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400 mt-4 font-serif">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      {/* Notification Badge Bar */}
      <div className="bg-gradient-to-r from-[#121212] to-[#1a1a1a] border border-[#c49a45]/30 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Bell Icon with Badge */}
          <div className="relative">
            <Bell className="w-6 h-6 text-[#c49a45]" />
            {pendingCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
                {pendingCount}
              </span>
            )}
          </div>

          <div>
            <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Pending Orders</span>
            <span className={`text-lg font-bold ml-3 ${pendingCount > 0 ? 'text-red-400' : 'text-[#c49a45]'}`}>
              {pendingCount}
            </span>
          </div>

          {pendingCount > 0 && (
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-red-400 font-mono">{pendingCount} order{pendingCount > 1 ? 's' : ''} pending</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            Total: {orders.length}
          </span>
          <button
            onClick={loadOrders}
            className="flex items-center gap-1.5 text-[#c49a45] hover:text-white transition-colors px-3 py-1.5 border border-[#c49a45]/30 rounded hover:bg-[#c49a45]/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      <AdminClient initialOrders={orders || []} />
    </div>
  );
}
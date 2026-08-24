// src/app/ad/m/in/orders/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import AdminClient from '../AdminClient';
import { Bell, ShoppingBag, RefreshCw } from 'lucide-react';

export default function AdminOrdersPage() {
  const { ordersList, refreshData } = useStore();
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    setLoading(true);
    await refreshData();
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => loadOrders());
  }, []);

  const orders = ordersList || [];
  const submittedPayments = orders.filter((o: any) => o.paymentStatus === 'submitted');
  const pendingCount = orders.filter((o: any) => o.status === 'Pending').length;

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
            {(submittedPayments.length > 0 || pendingCount > 0) && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/50">
                {submittedPayments.length || pendingCount}
              </span>
            )}
          </div>

          <div>
            <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Submitted Payment Proofs</span>
            <span className={`text-lg font-bold ml-3 ${submittedPayments.length > 0 ? 'text-amber-400' : 'text-[#c49a45]'}`}>
              {submittedPayments.length}
            </span>
          </div>

          {submittedPayments.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-amber-400 font-mono">
                {submittedPayments.length} payment proof{submittedPayments.length > 1 ? 's' : ''} awaiting verification
              </span>
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
            className="flex items-center gap-1.5 text-[#c49a45] hover:text-white transition-colors px-3 py-1.5 border border-[#c49a45]/30 rounded hover:bg-[#c49a45]/10 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Admin Payment Notifications List */}
      {submittedPayments.length > 0 && (
        <div className="space-y-2 mb-6">
          {submittedPayments.map((ord: any) => (
            <div
              key={ord.id}
              className="bg-amber-950/40 border border-amber-500/40 text-amber-200 px-4 py-3 rounded-lg text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-md animate-fade-in"
            >
              <div className="flex items-center gap-2 font-serif">
                <Bell className="w-4 h-4 text-amber-400 animate-bounce flex-shrink-0" />
                <span>
                  <strong>New payment proof submitted for Order #HM-{ord.id}</strong> ({ord.customerName} — {ord.paymentType === 'advance_30' ? '30% Advance' : '100% Full'}).
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-900/50 px-2 py-0.5 rounded border border-amber-700">
                Awaiting Verification
              </span>
            </div>
          ))}
        </div>
      )}

      <AdminClient initialOrders={orders || []} />
    </div>
  );
}
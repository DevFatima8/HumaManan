// src/app/ad/m/in/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import {
  Users,
  CircleDollarSign,
  Clock,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Package,
  Eye,
  PhoneCall,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Calendar,
  DollarSign,
  PieChart,
  BarChart3,
  Activity
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    productsList,
    ordersList,
    inspirationsList,
    refreshData,
    currency
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    stitchingOrders: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
    totalProducts: 0,
    totalInspirations: 0,
    pendingInspirations: 0,
    pkrRevenue: 0,
    usdRevenue: 0,
    averageOrderValue: 0,
    totalItemsSold: 0,
    revenueGrowth: 0,
    ordersGrowth: 0
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentInspirations, setRecentInspirations] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    await refreshData();
    calculateStats();
    setLoading(false);
  };

  const calculateStats = () => {
    const orders = ordersList || [];
    const products = productsList || [];
    const inspirations = inspirationsList || [];

    // Order stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o: any) => o.status === 'Pending').length;
    const confirmedOrders = orders.filter((o: any) => o.status === 'Confirmed').length;
    const stitchingOrders = orders.filter((o: any) => o.status === 'Stitching').length;
    const dispatchedOrders = orders.filter((o: any) => o.status === 'Dispatched').length;
    const deliveredOrders = orders.filter((o: any) => o.status === 'Delivered').length;

    // Revenue stats
    const pkrOrders = orders.filter((o: any) => o.currency === 'PKR');
    const usdOrders = orders.filter((o: any) => o.currency === 'USD');

    const pkrRevenue = pkrOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
    const usdRevenue = usdOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
    const totalRevenue = pkrRevenue + (usdRevenue * 280); // Approximate conversion for display

    // Average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Total items sold
    const totalItemsSold = orders.reduce((sum: number, o: any) => {
      const items = o.items || [];
      return sum + items.reduce((s: number, item: any) => s + item.quantity, 0);
    }, 0);

    // Inspiration stats
    const totalInspirations = inspirations.length;
    const pendingInspirations = inspirations.filter((i: any) => i.status === 'Pending').length;

    // Recent orders (last 5)
    const sortedOrders = [...orders].sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentOrders(sortedOrders.slice(0, 5));

    // Recent inspirations (last 5)
    const sortedInspirations = [...inspirations].sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setRecentInspirations(sortedInspirations.slice(0, 5));

    // Top products (by quantity sold)
    const productSales: Record<string, { name: string; quantity: number; revenue: number; image: string }> = {};
    orders.forEach((order: any) => {
      const items = order.items || [];
      items.forEach((item: any) => {
        const key = item.productId || item.name;
        if (!productSales[key]) {
          productSales[key] = {
            name: item.name,
            quantity: 0,
            revenue: 0,
            image: item.image || ''
          };
        }
        productSales[key].quantity += item.quantity;
        const itemPrice = order.currency === 'PKR' ? item.pkrPrice : item.usdPrice;
        productSales[key].revenue += itemPrice * item.quantity;
      });
    });
    const topProductsList = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    setTopProducts(topProductsList);

    // Calculate growth (mock - based on order count change)
    const lastMonthOrders = orders.filter((o: any) => {
      const date = new Date(o.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() - 1;
    }).length;
    const thisMonthOrders = orders.filter((o: any) => {
      const date = new Date(o.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth();
    }).length;

    const ordersGrowth = lastMonthOrders > 0
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100
      : thisMonthOrders > 0 ? 100 : 0;

    setStats({
      totalOrders,
      totalRevenue,
      pendingOrders,
      confirmedOrders,
      stitchingOrders,
      dispatchedOrders,
      deliveredOrders,
      totalProducts: products.length,
      totalInspirations,
      pendingInspirations,
      pkrRevenue,
      usdRevenue,
      averageOrderValue,
      totalItemsSold,
      revenueGrowth: 15, // Mock value - can be calculated from actual data
      ordersGrowth
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-10 h-10 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400 mt-4 font-serif">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">

      {/* Header */}
      <div className="bg-[#121212] text-[#f2e6d0] border border-[#c49a45]/30 rounded-lg p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#c49a45_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[9px] tracking-[0.25em] text-[#ebdcb9] uppercase block font-serif">
              ✦ Atelier Backoffice Portal ✦
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#faf9f6] tracking-wide">
              EXECUTIVE DASHBOARD
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Real-time overview of your couture business performance, orders, and client engagement.
            </p>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 border border-[#c49a45]/30 rounded text-xs text-[#ebdcb9] hover:bg-white/10 transition-colors flex items-center gap-1.5 font-semibold font-serif uppercase cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Stats Overview Grid - 6 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Orders */}
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-[#ebdcb9]/15 rounded-full text-[#c49a45]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <span className={`text-[10px] font-semibold ${stats.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center gap-0.5`}>
              {stats.ordersGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(stats.ordersGrowth).toFixed(1)}%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Total Orders</span>
            <span className="font-serif text-2xl font-bold text-neutral-800">{stats.totalOrders}</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-green-50 rounded-full text-green-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-semibold text-green-600 flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {stats.revenueGrowth.toFixed(1)}%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Total Revenue</span>
            <span className="font-serif text-2xl font-bold text-green-700">
              {formatPrice(stats.totalRevenue, currency as 'PKR' | 'USD')}
            </span>
          </div>
          <div className="mt-1 flex gap-2 text-[9px] text-neutral-400">
            <span>PKR: {formatPrice(stats.pkrRevenue, 'PKR')}</span>
            <span>•</span>
            <span>USD: {formatPrice(stats.usdRevenue, 'USD')}</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-amber-50 rounded-full text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            {stats.pendingOrders > 0 && (
              <span className="bg-red-500 text-white text-[8px] font-bold rounded-full px-2 py-0.5 animate-pulse">
                {stats.pendingOrders}
              </span>
            )}
          </div>
          <div className="mt-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Pending Orders</span>
            <span className="font-serif text-2xl font-bold text-amber-700">{stats.pendingOrders}</span>
          </div>
          <div className="mt-1 text-[9px] text-neutral-400">
            Need call verification
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-purple-50 rounded-full text-purple-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Products</span>
            <span className="font-serif text-2xl font-bold text-purple-700">{stats.totalProducts}</span>
          </div>
          <div className="mt-1 text-[9px] text-neutral-400">
            In catalog
          </div>
        </div>

        {/* Inspirations */}
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-blue-50 rounded-full text-blue-600">
              <Sparkles className="w-5 h-5" />
            </div>
            {stats.pendingInspirations > 0 && (
              <span className="bg-amber-500 text-white text-[8px] font-bold rounded-full px-2 py-0.5 animate-pulse">
                {stats.pendingInspirations}
              </span>
            )}
          </div>
          <div className="mt-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Inspirations</span>
            <span className="font-serif text-2xl font-bold text-blue-700">{stats.totalInspirations}</span>
          </div>
          <div className="mt-1 text-[9px] text-neutral-400">
            {stats.pendingInspirations} pending review
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="p-2.5 bg-indigo-50 rounded-full text-indigo-600">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Avg. Order Value</span>
            <span className="font-serif text-xl font-bold text-indigo-700">
              {formatPrice(stats.averageOrderValue, currency as 'PKR' | 'USD')}
            </span>
          </div>
          <div className="mt-1 text-[9px] text-neutral-400">
            {stats.totalItemsSold} items sold
          </div>
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-6 shadow-sm">
          <h3 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2 border-b border-[#ebdcb9]/20 pb-3">
            <PieChart className="w-5 h-5 text-[#c49a45]" />
            <span>Order Status Breakdown</span>
          </h3>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Pending
              </span>
              <span className="text-sm font-semibold text-neutral-800">{stats.pendingOrders}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalOrders > 0 ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Confirmed
              </span>
              <span className="text-sm font-semibold text-neutral-800">{stats.confirmedOrders}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalOrders > 0 ? (stats.confirmedOrders / stats.totalOrders) * 100 : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                Stitching
              </span>
              <span className="text-sm font-semibold text-neutral-800">{stats.stitchingOrders}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalOrders > 0 ? (stats.stitchingOrders / stats.totalOrders) * 100 : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Dispatched
              </span>
              <span className="text-sm font-semibold text-neutral-800">{stats.dispatchedOrders}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalOrders > 0 ? (stats.dispatchedOrders / stats.totalOrders) * 100 : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                Delivered
              </span>
              <span className="text-sm font-semibold text-neutral-800">{stats.deliveredOrders}</span>
            </div>
            <div className="w-full bg-neutral-100 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${stats.totalOrders > 0 ? (stats.deliveredOrders / stats.totalOrders) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-6 shadow-sm">
            <h3 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2 border-b border-[#ebdcb9]/20 pb-3">
              <Activity className="w-5 h-5 text-[#c49a45]" />
              <span>Quick Actions</span>
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link
                href="/ad/m/in/orders"
                className="bg-[#faf9f6] border border-[#ebdcb9]/40 rounded-lg p-3 text-center hover:border-[#c49a45] transition-all group"
              >
                <ShoppingBag className="w-6 h-6 text-[#c49a45] mx-auto mb-1" />
                <span className="text-[10px] font-serif font-semibold text-neutral-700 block">View Orders</span>
                <span className="text-[8px] text-neutral-400">{stats.totalOrders} orders</span>
              </Link>
              <Link
                href="/ad/m/in/products"
                className="bg-[#faf9f6] border border-[#ebdcb9]/40 rounded-lg p-3 text-center hover:border-[#c49a45] transition-all group"
              >
                <Package className="w-6 h-6 text-[#c49a45] mx-auto mb-1" />
                <span className="text-[10px] font-serif font-semibold text-neutral-700 block">Products</span>
                <span className="text-[8px] text-neutral-400">{stats.totalProducts} items</span>
              </Link>
              <Link
                href="/ad/m/in/inspirations"
                className="bg-[#faf9f6] border border-[#ebdcb9]/40 rounded-lg p-3 text-center hover:border-[#c49a45] transition-all group"
              >
                <Sparkles className="w-6 h-6 text-[#c49a45] mx-auto mb-1" />
                <span className="text-[10px] font-serif font-semibold text-neutral-700 block">Inspirations</span>
                <span className="text-[8px] text-neutral-400">{stats.pendingInspirations} pending</span>
              </Link>
              <Link
                href="/ad/m/in/discounts"
                className="bg-[#faf9f6] border border-[#ebdcb9]/40 rounded-lg p-3 text-center hover:border-[#c49a45] transition-all group"
              >
                <CircleDollarSign className="w-6 h-6 text-[#c49a45] mx-auto mb-1" />
                <span className="text-[10px] font-serif font-semibold text-neutral-700 block">Discounts</span>
                <span className="text-[8px] text-neutral-400">Manage campaigns</span>
              </Link>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-6 shadow-sm">
            <h3 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2 border-b border-[#ebdcb9]/20 pb-3">
              <TrendingUp className="w-5 h-5 text-[#c49a45]" />
              <span>Top Selling Products</span>
            </h3>
            <div className="mt-4 space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-xs text-neutral-400 text-center py-4">No products sold yet</p>
              ) : (
                topProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-10 h-14 rounded overflow-hidden bg-neutral-100 border border-[#ebdcb9]/30 flex-shrink-0">
                      <img
                        src={product.image || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-neutral-800 truncate">{product.name}</p>
                      <div className="flex justify-between text-[10px] text-neutral-400">
                        <span>{product.quantity} units sold</span>
                        <span>{formatPrice(product.revenue, currency as 'PKR' | 'USD')}</span>
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-[#c49a45]">#{index + 1}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#ebdcb9]/20 pb-3">
            <h3 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#c49a45]" />
              <span>Recent Orders</span>
            </h3>
            <Link href="/ad/m/in/orders" className="text-[10px] text-[#c49a45] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">No orders placed yet</p>
            ) : (
              recentOrders.map((order) => {
                const statusColors: Record<string, string> = {
                  'Pending': 'bg-amber-100 text-amber-700',
                  'Confirmed': 'bg-blue-100 text-blue-700',
                  'Stitching': 'bg-purple-100 text-purple-700',
                  'Dispatched': 'bg-indigo-100 text-indigo-700',
                  'Delivered': 'bg-green-100 text-green-700'
                };
                return (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#c49a45]" />
                      <div>
                        <p className="text-xs font-semibold text-neutral-800">#{order.id} - {order.customerName}</p>
                        <p className="text-[9px] text-neutral-400">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-[#c49a45]">
                        {formatPrice(order.totalAmount, order.currency as 'PKR' | 'USD')}
                      </span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold ${statusColors[order.status] || 'bg-neutral-100 text-neutral-700'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Inspirations */}
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-[#ebdcb9]/20 pb-3">
            <h3 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c49a45]" />
              <span>Recent Inspirations</span>
            </h3>
            <Link href="/ad/m/in/inspirations" className="text-[10px] text-[#c49a45] hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
            {recentInspirations.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-8">No inspirations submitted yet</p>
            ) : (
              recentInspirations.map((inspiration) => {
                const statusColors: Record<string, string> = {
                  'Pending': 'bg-amber-100 text-amber-700',
                  'Viewed': 'bg-blue-100 text-blue-700',
                  'Contacted': 'bg-purple-100 text-purple-700',
                  'Completed': 'bg-green-100 text-green-700'
                };
                const statusDots: Record<string, string> = {
                  'Pending': 'bg-amber-500 animate-pulse',
                  'Viewed': 'bg-blue-500',
                  'Contacted': 'bg-purple-500',
                  'Completed': 'bg-green-500'
                };
                return (
                  <div key={inspiration._id} className="flex items-center justify-between py-2 border-b border-neutral-50 last:border-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0">
                        {inspiration.images && inspiration.images.length > 0 ? (
                          <div className="w-10 h-12 rounded overflow-hidden bg-neutral-100 border border-[#ebdcb9]/30">
                            <img
                              src={inspiration.images[0]}
                              alt={inspiration.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-12 rounded bg-neutral-100 flex items-center justify-center border border-[#ebdcb9]/30">
                            <Sparkles className="w-4 h-4 text-neutral-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-neutral-800 truncate">{inspiration.name}</p>
                        <p className="text-[9px] text-neutral-400 truncate">
                          {inspiration.phone} • {new Date(inspiration.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDots[inspiration.status] || 'bg-neutral-400'}`} />
                      <span className={`text-[8px] px-1.5 py-0.5 rounded font-semibold ${statusColors[inspiration.status] || 'bg-neutral-100 text-neutral-700'}`}>
                        {inspiration.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Empty State for No Data */}
      {stats.totalOrders === 0 && stats.totalProducts === 0 && stats.totalInspirations === 0 && (
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-16 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-[#ebdcb9]/20 flex items-center justify-center mx-auto">
            <Activity className="w-10 h-10 text-[#c49a45] opacity-40" />
          </div>
          <h3 className="font-serif text-xl text-neutral-700">Welcome to Your Dashboard</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Start by adding products to your catalog. Once clients place orders and submit inspirations, all data will appear here automatically.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              href="/ad/m/in/products"
              className="px-6 py-2.5 bg-[#c49a45] hover:bg-[#121212] text-white text-xs uppercase tracking-widest font-serif font-bold transition-all rounded shadow-md"
            >
              Add First Product
            </Link>
            <Link
              href="/"
              className="px-6 py-2.5 border border-[#c49a45] text-[#c49a45] hover:bg-[#c49a45] hover:text-white text-xs uppercase tracking-widest font-serif font-bold transition-all rounded"
            >
              View Storefront
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
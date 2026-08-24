"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import {
  ShoppingBag,
  Search,
  Trash2,
  ArrowRight,
  Sparkles,
  PackageCheck,
  CheckCircle,
  Clock,
  PhoneCall,
  X,
  Filter,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchSuccessMsg, setSearchSuccessMsg] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Deletion modal state
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load orders from local storage and optionally sync with API if phone is stored
  const loadOrders = async () => {
    setLoading(true);
    let myOrders: any[] = [];
    
    // 1. Get saved personal orders
    const savedMyOrdersStr = localStorage.getItem('humamanan_my_orders');
    if (savedMyOrdersStr) {
      try {
        myOrders = JSON.parse(savedMyOrdersStr);
      } catch (e) {
        console.error('Error parsing humamanan_my_orders:', e);
      }
    }

    // 2. Get all local fallback orders if my_orders is empty
    if (myOrders.length === 0) {
      const savedOrdersStr = localStorage.getItem('humamanan_orders');
      if (savedOrdersStr) {
        try {
          const allOrders = JSON.parse(savedOrdersStr);
          if (Array.isArray(allOrders) && allOrders.length > 0) {
            myOrders = allOrders;
            localStorage.setItem('humamanan_my_orders', JSON.stringify(myOrders));
          }
        } catch (e) {
          console.error('Error parsing humamanan_orders:', e);
        }
      }
    }

    // 3. If a phone number was saved previously, fetch latest status from backend
    const savedPhone = localStorage.getItem('humamanan_user_phone');
    if (savedPhone) {
      try {
        const res = await fetch(`/api/orders?phone=${encodeURIComponent(savedPhone)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
          const fetchedOrders = data.orders;
          // Merge fetched API orders into myOrders avoiding duplicates
          const merged = [...fetchedOrders];
          myOrders.forEach(localOrd => {
            if (!merged.some(m => String(m.id) === String(localOrd.id))) {
              merged.push(localOrd);
            }
          });
          myOrders = merged;
          localStorage.setItem('humamanan_my_orders', JSON.stringify(myOrders));
        }
      } catch (e) {
        console.error('Error auto-syncing orders by phone:', e);
      }
    }

    setOrders(myOrders);
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Handle explicit search by Order ID or Phone number
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setSearchError('');
    setSearchSuccessMsg('');

    try {
      // Clean up query if user entered #HM-123 -> 123
      const cleanId = query.replace(/^#?HM-/i, '').trim();
      const isIdQuery = !isNaN(Number(cleanId)) && cleanId.length < 10;

      let fetchUrl = '';
      if (isIdQuery) {
        fetchUrl = `/api/orders?id=${encodeURIComponent(cleanId)}`;
      } else {
        fetchUrl = `/api/orders?phone=${encodeURIComponent(query)}`;
      }

      const res = await fetch(fetchUrl);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No matching orders found.');
      }

      const foundOrders: any[] = data.orders || (data.order ? [data.order] : []);

      if (foundOrders.length === 0) {
        setSearchError(`No order found matching "${query}". Please verify your Order Reference (#HM-xxx) or Phone Number.`);
      } else {
        // Save phone to local storage if search was by phone
        if (!isIdQuery) {
          localStorage.setItem('humamanan_user_phone', query);
        }

        // Merge with existing state & local storage
        const currentMyOrdersStr = localStorage.getItem('humamanan_my_orders') || '[]';
        let currentMyOrders: any[] = [];
        try { currentMyOrders = JSON.parse(currentMyOrdersStr); } catch (e) {}

        const merged = [...foundOrders];
        currentMyOrders.forEach(co => {
          if (!merged.some(m => String(m.id) === String(co.id))) {
            merged.push(co);
          }
        });

        localStorage.setItem('humamanan_my_orders', JSON.stringify(merged));
        setOrders(merged);
        setSearchSuccessMsg(`Found ${foundOrders.length} order${foundOrders.length > 1 ? 's' : ''} matching "${query}". Saved to your history.`);
      }
    } catch (err: any) {
      setSearchError(err.message || 'Error looking up order. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  // Delete order from device history
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);

    try {
      // Delete locally
      const updated = orders.filter(o => String(o.id) !== String(orderToDelete.id));
      localStorage.setItem('humamanan_my_orders', JSON.stringify(updated));

      const savedAllOrdersStr = localStorage.getItem('humamanan_orders');
      if (savedAllOrdersStr) {
        try {
          let allLocal = JSON.parse(savedAllOrdersStr);
          allLocal = allLocal.filter((o: any) => String(o.id) !== String(orderToDelete.id));
          localStorage.setItem('humamanan_orders', JSON.stringify(allLocal));
        } catch (e) {}
      }

      // Try API delete
      try {
        await fetch(`/api/orders?id=${encodeURIComponent(orderToDelete.id)}`, { method: 'DELETE' });
      } catch (e) {
        console.error('API delete warning:', e);
      }

      setOrders(updated);
      setSearchSuccessMsg(`Order #HM-${orderToDelete.id} removed from your history.`);
      setTimeout(() => setSearchSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
    }
  };

  // Filter orders by status if selected
  const filteredOrders = filterStatus === 'ALL'
    ? orders
    : orders.filter(o => (o.status || '').toUpperCase() === filterStatus.toUpperCase());

  return (
    <div className="bg-[#faf9f6] min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Page Header */}
        <div className="bg-white border border-[#ebdcb9] rounded-xl p-8 sm:p-10 text-center space-y-4 shadow-xs relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ebdcb9]/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-16 h-16 rounded-full bg-[#ebdcb9]/20 border border-[#c49a45]/30 flex items-center justify-center mx-auto text-[#c49a45]">
            <PackageCheck className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] tracking-[0.3em] text-[#c49a45] uppercase font-serif block font-semibold">
              ✦ Atelier Couture Tracking ✦
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#121212] tracking-wide font-light uppercase">
              Order History & Tracking
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed font-light">
              Track the live progress of your bridal bookings, formal maxis, and luxury couture suits crafted at HUMA MANAN atelier.
            </p>
          </div>
        </div>

        {/* Search & Lookup Section */}
        <div className="bg-white border border-[#ebdcb9]/70 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h2 className="font-serif text-base font-bold text-[#121212] tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4 text-[#c49a45]" />
                <span>Find Your Order</span>
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5 font-sans">
                Search by Order Reference (#HM-xxx) or Phone Number used during checkout
              </p>
            </div>
            
            <button
              onClick={loadOrders}
              className="text-xs text-[#c49a45] hover:text-[#121212] font-serif flex items-center gap-1.5 self-start md:self-auto transition-colors cursor-pointer"
              title="Refresh order history"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh History</span>
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order # (e.g. 1024 or #HM-1024) or Phone Number (+92300...)"
                className="w-full pl-4 pr-10 py-3 bg-[#faf9f6] border border-[#ebdcb9] rounded-lg text-xs text-[#121212] placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#c49a45] transition-all font-mono"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={searching || !searchQuery.trim()}
              className="px-6 py-3 bg-[#121212] hover:bg-[#c49a45] text-white text-xs uppercase font-serif font-bold tracking-widest rounded-lg shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Lookup Order</span>
                </>
              )}
            </button>
          </form>

          {/* Search Feedback Notifications */}
          {searchError && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2.5 font-sans animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{searchError}</span>
            </div>
          )}

          {searchSuccessMsg && (
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center gap-2.5 font-sans animate-fade-in">
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <span>{searchSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Orders Header & Filter Tabs */}
        {orders.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-[#121212] tracking-wide">
                Your Saved Bookings
              </h3>
              <span className="bg-[#ebdcb9]/40 border border-[#c49a45]/30 text-[#856423] text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full">
                {filteredOrders.length} Order{filteredOrders.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2 text-xs font-serif">
              <Filter className="w-3.5 h-3.5 text-[#c49a45]" />
              <span className="text-neutral-500">Filter Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-[#ebdcb9] rounded-md px-3 py-1.5 text-xs text-[#121212] focus:outline-none focus:ring-1 focus:ring-[#c49a45] cursor-pointer font-sans"
              >
                <option value="ALL">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Stitching">Stitching</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {loading ? (
          <div className="bg-white border border-[#ebdcb9]/40 rounded-xl p-16 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-neutral-400 font-serif tracking-widest uppercase">Fetching your luxury couture history...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#ebdcb9] rounded-xl p-12 text-center space-y-6 shadow-xs">
            <div className="w-20 h-20 rounded-full bg-[#faf9f6] border border-[#ebdcb9] flex items-center justify-center mx-auto text-neutral-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-xl text-[#121212]">No Order History Found</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                You have not placed any dress bookings on this browser yet. Use the search bar above to look up an order using your Order Reference or Phone Number.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#c49a45] hover:bg-[#121212] text-white text-xs uppercase tracking-widest font-serif font-bold transition-all rounded shadow-md"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Orders Cards List */
          <div className="space-y-6">
            {filteredOrders.map((ord: any) => {
              const orderTotal = Number(ord.orderTotal || ord.totalAmount || 0);
              const payableAmt = ord.payableAmount !== undefined && ord.payableAmount !== null
                ? Number(ord.payableAmount)
                : (ord.paymentType === 'advance_30' ? Math.round(orderTotal * 0.3 * 100) / 100 : orderTotal);
              const remainingAmt = ord.remainingAmount !== undefined && ord.remainingAmount !== null
                ? Number(ord.remainingAmount)
                : (ord.paymentType === 'advance_30' ? Math.round((orderTotal - payableAmt) * 100) / 100 : 0);
              const payStatus = ord.paymentStatus || 'pending';
              const itemsList = Array.isArray(ord.items) ? ord.items : [];

              return (
                <div
                  key={ord.id}
                  className="bg-white border border-[#ebdcb9] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 space-y-0"
                >
                  {/* Card Header Bar */}
                  <div className="bg-[#faf9f6] border-b border-[#ebdcb9]/60 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-serif text-base font-bold text-[#121212] tracking-wider">
                          Order #HM-{ord.id}
                        </span>

                        {/* Status Badge */}
                        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest font-serif border ${
                          ord.status === 'Pending' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          ord.status === 'Confirmed' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          ord.status === 'Stitching' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                          ord.status === 'Dispatched' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                          'bg-green-50 text-green-800 border-green-200'
                        }`}>
                          ● {ord.status || 'Pending'}
                        </span>

                        {/* Payment Verification Status Badge */}
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-serif font-semibold border ${
                          payStatus === 'verified' ? 'bg-green-100 text-green-800 border-green-300' :
                          payStatus === 'submitted' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                          payStatus === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {payStatus === 'verified' ? 'Payment Verified' :
                           payStatus === 'submitted' ? 'Proof Submitted' :
                           payStatus === 'rejected' ? 'Proof Rejected' :
                           'Payment Pending'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-neutral-400 font-mono mt-1 flex-wrap">
                        <span>Booked on: {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'}</span>
                        <span>•</span>
                        <span>Recipient: <strong className="text-neutral-700">{ord.customerName}</strong></span>
                        <span>•</span>
                        <span>Phone: <strong className="text-neutral-700">{ord.customerPhone}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link
                        href={`/checkout/success?id=${ord.id}`}
                        className="px-4 py-2 bg-[#121212] hover:bg-[#c49a45] text-white text-xs font-serif uppercase tracking-wider rounded transition-all flex items-center gap-1.5 font-semibold"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => setOrderToDelete(ord)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-neutral-200 hover:border-red-200 rounded transition-colors cursor-pointer"
                        title="Remove order from history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Card Content Details Body */}
                  <div className="p-4 sm:p-6 space-y-5">

                    {/* Financial Summary Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-3.5 bg-[#faf9f6] rounded-lg border border-neutral-200/70 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">Grand Total</span>
                        <span className="font-bold text-[#121212] font-serif text-sm">
                          {formatPrice(orderTotal, ord.currency as 'PKR' | 'USD')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">Payment Scheme</span>
                        <span className="font-bold text-[#c49a45] font-serif">
                          {ord.paymentType === 'advance_30' ? '30% Advance' : '100% Full Payment'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">Paid / Submitted</span>
                        <span className="font-bold text-green-700">
                          {formatPrice(payableAmt, ord.currency as 'PKR' | 'USD')}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase block">Remaining Balance</span>
                        <span className="font-bold text-neutral-700">
                          {formatPrice(remainingAmt, ord.currency as 'PKR' | 'USD')}
                        </span>
                      </div>
                    </div>

                    {/* Rejection Notification Callout if Rejected */}
                    {payStatus === 'rejected' && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-center justify-between gap-3 font-serif">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span>Payment proof was rejected. Please re-submit your transfer receipt.</span>
                        </div>
                        <Link
                          href={`/checkout/success?id=${ord.id}`}
                          className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap"
                        >
                          Re-upload Proof
                        </Link>
                      </div>
                    )}

                    {/* Booked Items List */}
                    {itemsList.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-serif text-xs uppercase tracking-widest text-neutral-400 font-bold">
                          Booked Couture Garments ({itemsList.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {itemsList.map((item: any, idx: number) => {
                            const itemPrice = ord.currency === 'PKR' ? item.pkrPrice : item.usdPrice;
                            return (
                              <div key={idx} className="flex gap-3 items-center p-2.5 bg-white border border-neutral-100 rounded-lg shadow-2xs">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-12 h-16 object-cover object-top rounded border border-neutral-200 flex-shrink-0 bg-neutral-900"
                                  />
                                ) : (
                                  <div className="w-12 h-16 bg-neutral-100 rounded border flex items-center justify-center text-neutral-400 flex-shrink-0">
                                    <ShoppingBag className="w-5 h-5" />
                                  </div>
                                )}

                                <div className="flex-1 min-w-0">
                                  <h5 className="font-serif text-xs font-bold text-neutral-900 truncate">
                                    {item.name}
                                  </h5>
                                  <div className="text-[11px] text-neutral-500 font-mono mt-0.5">
                                    Size: <span className="font-semibold text-neutral-800">{item.size}</span> • Qty: <span className="font-semibold text-neutral-800">{item.quantity}</span>
                                  </div>
                                  <div className="text-xs font-serif text-[#c49a45] font-bold mt-1">
                                    {formatPrice(itemPrice * item.quantity, ord.currency as 'PKR' | 'USD')}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-[#ebdcb9] rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5 relative">
              <button
                onClick={() => !isDeleting && setOrderToDelete(null)}
                disabled={isDeleting}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-full border border-red-100 flex-shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-900">
                    Remove Order #HM-{orderToDelete.id}?
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Are you sure you want to delete this order reference from your device history?
                  </p>
                </div>
              </div>

              <div className="bg-[#faf9f6] border border-neutral-200/80 rounded-lg p-3.5 space-y-1 text-xs text-neutral-700 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Order Reference:</span>
                  <span className="font-bold text-neutral-900">#HM-{orderToDelete.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total Amount:</span>
                  <span className="font-bold text-[#c49a45]">
                    {formatPrice(orderToDelete.totalAmount, orderToDelete.currency as 'PKR' | 'USD')}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setOrderToDelete(null)}
                  className="px-4 py-2 border border-neutral-300 rounded text-xs font-serif font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={confirmDeleteOrder}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-serif font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Order</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

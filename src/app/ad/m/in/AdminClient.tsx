// src/app/ad/m/in/AdminClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import { useStore } from '@/context/StoreContext';
import {
  Users,
  CircleDollarSign,
  Clock,
  Award,
  Check,
  RefreshCw,
  Scissors,
  Phone,
  Mail,
  MapPin,
  Trash2,
  AlertTriangle,
  X
} from 'lucide-react';

interface OrderItem {
  productId: string;
  name: string;
  pkrPrice: number;
  usdPrice: number;
  size: string;
  quantity: number;
  image: string;
}

interface Order {
  id: number | string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  country: string;
  postalCode: string;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
  paymentType?: 'advance_30' | 'full_100';
  orderTotal?: number;
  payableAmount?: number;
  remainingAmount?: number;
  paymentStatus?: 'pending' | 'submitted' | 'verified' | 'rejected';
  paymentScreenshot?: string;
  paymentSubmittedAt?: string | null;
  paymentVerifiedAt?: string | null;
  paymentRejectedAt?: string | null;
  paymentRejectionReason?: string | null;
  uploadSource?: 'web' | 'mobile_qr';
  status: string;
  items: OrderItem[];
  notes: string | null;
  createdAt: string;
}

interface AdminClientProps {
  initialOrders: Order[];
}

export default function AdminClient({ initialOrders = [] }: AdminClientProps) {
  const { deleteOrder } = useStore();
  const [ordersList, setOrdersList] = useState<Order[]>(initialOrders || []);
  const [updatingId, setUpdatingId] = useState<number | string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Payment Verification Modals & State
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<Order | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>('');
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);

  useEffect(() => {
    setOrdersList(initialOrders || []);
  }, [initialOrders]);

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      await deleteOrder(orderToDelete.id);
      const updated = ordersList.filter(o => String(o.id) !== String(orderToDelete.id));
      setOrdersList(updated);
      setSuccessMessage(`Order #HM-${orderToDelete.id} has been deleted successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
    }
  };

  const handleVerifyPayment = async (orderId: number | string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, action: 'verify' }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to verify payment');
      }

      const updated = ordersList.map(o => {
        if (String(o.id) === String(orderId)) {
          return {
            ...o,
            paymentStatus: 'verified' as const,
            paymentVerifiedAt: new Date().toISOString(),
            status: 'Confirmed',
          };
        }
        return o;
      });

      setOrdersList(updated);
      localStorage.setItem('humamanan_orders', JSON.stringify(updated));
      setSuccessMessage(`Payment for Order #HM-${orderId} verified successfully!`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error verifying payment:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConfirmRejectPayment = async () => {
    if (!rejectingOrder || !rejectionReasonInput.trim()) return;
    setIsVerifyingPayment(true);

    try {
      const res = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: rejectingOrder.id,
          action: 'reject',
          rejectionReason: rejectionReasonInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject payment');
      }

      const updated = ordersList.map(o => {
        if (String(o.id) === String(rejectingOrder.id)) {
          return {
            ...o,
            paymentStatus: 'rejected' as const,
            paymentRejectedAt: new Date().toISOString(),
            paymentRejectionReason: rejectionReasonInput.trim(),
            status: 'Payment Rejected',
          };
        }
        return o;
      });

      setOrdersList(updated);
      localStorage.setItem('humamanan_orders', JSON.stringify(updated));
      setSuccessMessage(`Payment proof for Order #HM-${rejectingOrder.id} rejected.`);
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err: any) {
      console.error('Error rejecting payment:', err);
    } finally {
      setIsVerifyingPayment(false);
      setRejectingOrder(null);
      setRejectionReasonInput('');
    }
  };

  const handleStatusChange = async (orderId: number | string, newStatus: string) => {
    setUpdatingId(orderId);
    setSuccessMessage('');

    try {
      await fetch('/api/orders/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus })
      });
    } catch (err) {
      console.error('Failed API order status update:', err);
    }

    const updatedOrders = ordersList.map(ord => {
      if (String(ord.id) === String(orderId)) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });

    setOrdersList(updatedOrders);
    localStorage.setItem('humamanan_orders', JSON.stringify(updatedOrders));

    setSuccessMessage(`Order #HM-${orderId} status successfully updated to "${newStatus}"!`);
    setUpdatingId(null);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const totalBookingsCount = ordersList?.length || 0;

  const pkrVolume = (ordersList || [])
    .filter(o => o.currency === 'PKR')
    .reduce((sum, o) => sum + (o.orderTotal || o.totalAmount), 0);

  const usdVolume = (ordersList || [])
    .filter(o => o.currency === 'USD')
    .reduce((sum, o) => sum + (o.orderTotal || o.totalAmount), 0);

  const pendingValidationCount = (ordersList || []).filter(o => o.paymentStatus === 'submitted').length;

  return (
    <div className="space-y-10 animate-fade-in">

      {/* Top Banner */}
      <div className="bg-[#121212] text-[#f2e6d0] border border-[#c49a45]/30 rounded p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#c49a45_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[9px] tracking-[0.25em] text-[#ebdcb9] uppercase block font-serif">
              ✦ Atelier Backoffice Portal ✦
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl tracking-wide text-[#faf9f6]">
              CLIENT ORDERS & PIPELINE MANAGER
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Track luxury couture bookings, verify bank transfers, inspect screenshots, and control order workflows.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 border border-[#c49a45]/30 rounded text-xs text-[#ebdcb9] hover:bg-white/10 transition-colors flex items-center gap-1.5 font-semibold font-serif uppercase cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reload Pipeline</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Analytics Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-[#ebdcb9]/15 rounded-full text-[#c49a45]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Total Client Bookings</span>
            <span className="font-serif text-2xl font-bold text-neutral-800">{totalBookingsCount}</span>
          </div>
        </div>

        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-[#ebdcb9]/15 rounded-full text-[#c49a45]">
            <CircleDollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">PKR Booking Value</span>
            <span className="font-serif text-xl font-bold text-[#c49a45]">
              {formatPrice(pkrVolume, 'PKR')}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-[#ebdcb9]/15 rounded-full text-[#c49a45]">
            <CircleDollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">USD Booking Value</span>
            <span className="font-serif text-xl font-bold text-[#c49a45]">
              {formatPrice(usdVolume, 'USD')}
            </span>
          </div>
        </div>

        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-5 flex items-center gap-4 shadow-xs">
          <div className="p-3 bg-amber-50 rounded-full text-amber-600">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Awaiting Verification</span>
            <span className="font-serif text-2xl font-bold text-amber-700">{pendingValidationCount}</span>
          </div>
        </div>

      </div>

      {/* Orders List */}
      {!ordersList || ordersList.length === 0 ? (
        <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-16 text-center space-y-4">
          <Clock className="w-12 h-12 text-[#c49a45] mx-auto opacity-40" />
          <h3 className="font-serif text-lg text-neutral-700">No client bookings have been recorded yet.</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Once a client adds a dress, selects their currency, and finishes checkout, their booking will instantly record here.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-[#c49a45] hover:bg-[#121212] text-white text-xs uppercase tracking-widest font-serif font-bold transition-all rounded shadow-md"
            >
              Simulate Customer Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="font-serif text-lg tracking-wider text-neutral-800">
            Chronological Order Queue ({ordersList.length} Active Bookings)
          </h2>

          <div className="space-y-6">
            {ordersList.map((order) => {
              const orderTotal = Number(order.orderTotal || order.totalAmount || 0);
              const payableAmt = order.payableAmount !== undefined && order.payableAmount !== null
                ? Number(order.payableAmount)
                : (order.paymentType === 'advance_30' ? Math.round(orderTotal * 0.3 * 100) / 100 : orderTotal);
              const remainingAmt = order.remainingAmount !== undefined && order.remainingAmount !== null
                ? Number(order.remainingAmount)
                : (order.paymentType === 'advance_30' ? Math.round((orderTotal - payableAmt) * 100) / 100 : 0);
              const payStatus = order.paymentStatus || 'pending';

              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#ebdcb9]/40 rounded-lg shadow-xs overflow-hidden"
                >
                  {/* Order Top Bar Info with Status Badge */}
                  <div className="bg-[#faf9f6] border-b border-[#ebdcb9]/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-light">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-serif text-sm font-bold text-neutral-800">
                          Order Reference: #HM-{order.id}
                        </span>

                        {/* Payment Status Pill */}
                        <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider font-mono ${
                          payStatus === 'verified' ? 'bg-green-100 text-green-800 border border-green-300' :
                          payStatus === 'submitted' ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse' :
                          payStatus === 'rejected' ? 'bg-red-100 text-red-800 border border-red-300' :
                          'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          Payment: {payStatus}
                        </span>
                      </div>

                      <span className="text-[11px] text-neutral-400 block">
                        Placed: {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                        {order.paymentSubmittedAt && (
                          <span className="ml-2 text-neutral-500 font-mono">
                            • Proof Submitted: {new Date(order.paymentSubmittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Status Dot */}
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${order.status === 'Pending' ? 'bg-amber-500 animate-pulse' :
                            order.status === 'Confirmed' ? 'bg-blue-500' :
                              order.status === 'Stitching' ? 'bg-purple-500' :
                                order.status === 'Dispatched' ? 'bg-indigo-500' :
                                  order.status === 'Payment Rejected' ? 'bg-red-500' :
                                  'bg-green-500'
                          }`} />
                        <span className="text-[10px] uppercase font-semibold text-neutral-400">Pipeline:</span>
                      </div>

                      {/* Status Select dropdown */}
                      <div className="relative">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-serif uppercase tracking-wider font-bold py-1 px-3 pr-8 rounded border focus:outline-none cursor-pointer ${order.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                              order.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                order.status === 'Stitching' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                                  order.status === 'Dispatched' ? 'bg-indigo-50 text-indigo-700 border-indigo-300' :
                                    order.status === 'Payment Rejected' ? 'bg-red-50 text-red-700 border-red-300' :
                                    'bg-green-50 text-green-700 border-green-300'
                            }`}
                        >
                          <option value="Pending">🔴 Pending Call Verify</option>
                          <option value="Confirmed">🟢 Confirmed (Ready to Stitch)</option>
                          <option value="Stitching">🟣 Master Stitching</option>
                          <option value="Dispatched">🔵 Dispatched Transit</option>
                          <option value="Delivered">✅ Delivered & Paid</option>
                          <option value="Payment Rejected">❌ Payment Rejected</option>
                        </select>
                        {updatingId === order.id && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="w-3 h-3 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {/* Delete Trash Button */}
                      <button
                        type="button"
                        onClick={() => setOrderToDelete(order)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-neutral-200 hover:border-red-300 rounded transition-all cursor-pointer flex items-center justify-center"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main details body */}
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Customer Information Card */}
                    <div className="lg:col-span-4 space-y-4 border-r border-[#ebdcb9]/20 pr-4">
                      <h4 className="font-serif text-xs uppercase tracking-widest text-[#c49a45] font-bold">
                        Client Coordinates
                      </h4>

                      <ul className="space-y-2.5 text-xs text-neutral-600">
                        <li className="flex items-center gap-2">
                          <span className="font-bold text-neutral-800 text-[13px]">{order.customerName}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-neutral-400" />
                          <a href={`tel:${order.customerPhone}`} className="hover:underline font-mono text-neutral-800 font-semibold">
                            {order.customerPhone}
                          </a>
                        </li>
                        <li className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="truncate">{order.customerEmail}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-neutral-400 mt-0.5 flex-shrink-0" />
                          <span>
                            {order.customerAddress}, <br />
                            {order.city}, {order.country} {order.postalCode !== 'N/A' && `(${order.postalCode})`}
                          </span>
                        </li>
                      </ul>

                      {order.notes && (
                        <div className="bg-[#ebdcb9]/15 border border-[#c49a45]/30 rounded p-3 text-[11px] text-[#856423] space-y-1">
                          <div className="flex items-center gap-1 font-bold font-serif">
                            <Scissors className="w-3.5 h-3.5 text-[#c49a45]" />
                            <span>Custom Client Notes / Sizes</span>
                          </div>
                          <p className="italic">&quot;{order.notes}&quot;</p>
                        </div>
                      )}
                    </div>

                    {/* Items Ordered List */}
                    <div className="lg:col-span-4 space-y-3.5">
                      <h4 className="font-serif text-xs uppercase tracking-widest text-[#121212] font-bold">
                        Couture Garments Booked
                      </h4>

                      <div className="space-y-3">
                        {order.items && order.items.map((item: OrderItem, idx: number) => {
                          const itemPrice = order.currency === 'PKR' ? item.pkrPrice : item.usdPrice;
                          const productId = item.productId || 'N/A';
                          return (
                            <div key={idx} className="flex gap-3 items-center pb-2.5 border-b border-neutral-100 last:border-0 last:pb-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-9 h-12 object-cover object-top rounded border border-[#ebdcb9]/30"
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs text-neutral-800 font-serif font-bold truncate">{item.name}</h5>
                                <p className="text-[10px] text-neutral-400 uppercase font-mono">
                                  ID: {productId} • Qty: {item.quantity}
                                </p>
                                <span className="text-[9px] bg-neutral-100 text-neutral-700 px-1 rounded font-semibold">
                                  Fitted Size: {item.size.split(' (')[0]}
                                </span>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <span className="text-xs font-mono font-bold text-neutral-800">
                                  {formatPrice(itemPrice * item.quantity, order.currency as 'PKR' | 'USD')}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment Information & Admin Action Panel */}
                    <div className="lg:col-span-4 bg-neutral-50 p-4 rounded-lg flex flex-col justify-between border border-neutral-200/80 space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-baseline border-b border-neutral-200 pb-2">
                          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Payment Details</span>
                          <span className="text-[10px] font-mono text-neutral-700 font-bold uppercase">{order.paymentMethod || 'Bank Transfer'}</span>
                        </div>

                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Order Total:</span>
                            <span className="font-bold text-neutral-800">{formatPrice(orderTotal, order.currency as 'PKR' | 'USD')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-400">Payment Option:</span>
                            <span className="font-bold text-[#c49a45] font-serif">
                              {order.paymentType === 'advance_30' ? '30% Advance' : '100% Full Payment'}
                            </span>
                          </div>
                          <div className="flex justify-between text-green-700 font-bold">
                            <span>Payable Amount:</span>
                            <span>{formatPrice(payableAmt, order.currency as 'PKR' | 'USD')}</span>
                          </div>
                          <div className="flex justify-between text-neutral-500">
                            <span>Remaining Amount:</span>
                            <span>{formatPrice(remainingAmt, order.currency as 'PKR' | 'USD')}</span>
                          </div>
                        </div>

                        {/* Payment Screenshot Thumbnail & Lightbox Button */}
                        {order.paymentScreenshot ? (
                          <div className="mt-3 pt-2 border-t border-neutral-200 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold block">
                                Uploaded Payment Proof
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider font-mono ${
                                order.uploadSource === 'mobile_qr'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}>
                                Source: {order.uploadSource === 'mobile_qr' ? 'Mobile QR' : 'Web'}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 bg-white p-2 rounded border border-neutral-200">
                              <img
                                src={order.paymentScreenshot}
                                alt="Payment Proof Thumbnail"
                                className="w-12 h-12 object-cover rounded border border-neutral-300 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setPreviewScreenshotUrl(order.paymentScreenshot || null)}
                              />
                              <div>
                                <button
                                  type="button"
                                  onClick={() => setPreviewScreenshotUrl(order.paymentScreenshot || null)}
                                  className="text-xs text-[#c49a45] hover:underline font-serif font-bold cursor-pointer block"
                                >
                                  View Payment Screenshot
                                </button>
                                <span className="text-[9px] text-neutral-400 font-mono block">
                                  Click to enlarge & inspect
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-[10px] text-neutral-400 italic">
                            No payment screenshot attached.
                          </div>
                        )}

                        {/* Rejection Reason Display */}
                        {order.paymentStatus === 'rejected' && order.paymentRejectionReason && (
                          <div className="p-2 bg-red-50 border border-red-200 text-red-700 text-[10px] rounded italic">
                            Rejection Reason: &quot;{order.paymentRejectionReason}&quot;
                          </div>
                        )}
                      </div>

                      {/* Admin Payment Verification Action Buttons */}
                      <div className="border-t border-neutral-200 pt-3 space-y-2">
                        <span className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider block">
                          Payment Verification Actions:
                        </span>

                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            disabled={updatingId === order.id || payStatus === 'verified'}
                            onClick={() => handleVerifyPayment(order.id)}
                            className="py-2 px-3 bg-green-700 hover:bg-green-800 text-white rounded text-[11px] font-serif font-bold uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{payStatus === 'verified' ? 'Verified' : 'Verify'}</span>
                          </button>

                          <button
                            type="button"
                            disabled={updatingId === order.id || payStatus === 'rejected'}
                            onClick={() => {
                              setRejectingOrder(order);
                              setRejectionReasonInput('');
                            }}
                            className="py-2 px-3 bg-red-700 hover:bg-red-800 text-white rounded text-[11px] font-serif font-bold uppercase tracking-wider shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>{payStatus === 'rejected' ? 'Rejected' : 'Reject'}</span>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Screenshot Modal */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-[#ebdcb9] rounded-lg shadow-2xl max-w-3xl w-full p-6 relative space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
              <h3 className="font-serif text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                <span className="text-[#c49a45]">✦</span> Payment Screenshot Proof Lightbox
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewScreenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#c49a45] hover:underline font-serif font-bold"
                >
                  Open Original Image
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewScreenshotUrl(null)}
                  className="text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-center justify-center bg-neutral-900 rounded p-2 border border-neutral-800 min-h-[300px]">
              <img
                src={previewScreenshotUrl}
                alt="Payment Screenshot Full Preview"
                className="max-w-full max-h-[70vh] object-contain rounded shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* Admin Reject Payment Modal */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#ebdcb9] rounded-lg shadow-2xl max-w-md w-full p-6 relative space-y-5">
            <button
              onClick={() => !isVerifyingPayment && setRejectingOrder(null)}
              disabled={isVerifyingPayment}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-full border border-red-100 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Reject Payment for #HM-{rejectingOrder.id}?
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Please enter the reason for rejecting this payment proof. The customer will be able to see this reason on their order tracking page and upload a new screenshot.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g. Unreadable receipt / Transaction ID mismatch / Invalid transfer amount"
                rows={3}
                className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-red-500 text-neutral-800"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isVerifyingPayment}
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 border border-neutral-300 rounded text-xs font-serif font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isVerifyingPayment || !rejectionReasonInput.trim()}
                onClick={handleConfirmRejectPayment}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-serif font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isVerifyingPayment ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Submit Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#ebdcb9] rounded-lg shadow-2xl max-w-md w-full p-6 relative space-y-5">
            {/* Close button */}
            <button
              onClick={() => !isDeleting && setOrderToDelete(null)}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header icon + text */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-full border border-red-100 flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Delete Order #HM-{orderToDelete.id}?
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Are you sure you want to delete this client order? This action is permanent and cannot be undone.
                </p>
              </div>
            </div>

            {/* Order Info Summary */}
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-md p-3.5 space-y-1.5 text-xs text-neutral-700 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500">Client:</span>
                <span className="font-bold text-neutral-800">{orderToDelete.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Phone:</span>
                <span className="font-semibold text-neutral-800">{orderToDelete.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Amount:</span>
                <span className="font-bold text-[#c49a45]">
                  {formatPrice(orderToDelete.totalAmount, orderToDelete.currency as 'PKR' | 'USD')}
                </span>
              </div>
            </div>

            {/* Modal Action Buttons */}
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
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Order</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
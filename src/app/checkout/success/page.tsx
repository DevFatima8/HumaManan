"use client";

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/utils/format';
import {
  Sparkles,
  CheckCircle,
  PhoneCall,
  Calendar,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Trash2,
  X
} from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = use(searchParams);
  const orderIdStr = resolvedSearchParams.id || '';

  const [order, setOrder] = useState<any>(null);
  const [myOrdersHistory, setMyOrdersHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [newScreenshot, setNewScreenshot] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);
  const [resubmitError, setResubmitError] = useState('');
  const [resubmitSuccess, setResubmitSuccess] = useState('');

  const handleResubmitFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setResubmitError('Invalid file format. Please upload a JPG, JPEG, PNG, or WEBP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResubmitError('File size must be less than 10MB.');
      return;
    }

    setResubmitError('');
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      setNewScreenshot(data.url);
    } catch (err: any) {
      setResubmitError(err.message || 'Failed to upload screenshot.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResubmitPayment = async () => {
    if (!newScreenshot) {
      setResubmitError('Please select and upload a new payment screenshot first.');
      return;
    }

    setIsSubmittingProof(true);
    setResubmitError('');

    try {
      const res = await fetch('/api/orders/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          paymentScreenshot: newScreenshot,
          customerPhone: order.customerPhone,
          customerEmail: order.customerEmail,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit payment proof.');
      }

      const updatedOrder = {
        ...order,
        paymentScreenshot: newScreenshot,
        paymentStatus: 'submitted',
        paymentRejectionReason: null,
        status: 'Pending',
      };
      setOrder(updatedOrder);

      setResubmitSuccess('New payment proof submitted successfully! Our team will verify it shortly.');
      setNewScreenshot('');
      setTimeout(() => setResubmitSuccess(''), 5000);
    } catch (err: any) {
      setResubmitError(err.message || 'Error submitting payment proof.');
    } finally {
      setIsSubmittingProof(false);
    }
  };

  const confirmDeleteMyOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    try {
      try {
        await fetch(`/api/orders?id=${encodeURIComponent(orderToDelete.id)}`, { method: 'DELETE' });
      } catch (e) {
        console.error('API delete error:', e);
      }

      const myOrdersStr = localStorage.getItem('humamanan_my_orders') || '[]';
      let myOrders = JSON.parse(myOrdersStr);
      myOrders = myOrders.filter((o: any) => String(o.id) !== String(orderToDelete.id));
      localStorage.setItem('humamanan_my_orders', JSON.stringify(myOrders));

      const ordersStr = localStorage.getItem('humamanan_orders') || '[]';
      let orders = JSON.parse(ordersStr);
      orders = orders.filter((o: any) => String(o.id) !== String(orderToDelete.id));
      localStorage.setItem('humamanan_orders', JSON.stringify(orders));

      setMyOrdersHistory(myOrders);

      if (String(orderToDelete.id) === String(order?.id)) {
        if (myOrders.length > 0) {
          setOrder(myOrders[0]);
        } else {
          setOrder(null);
        }
      }

      setSuccessMsg(`Order #HM-${orderToDelete.id} removed from history.`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to delete order:', err);
    } finally {
      setIsDeleting(false);
      setOrderToDelete(null);
    }
  };

  useEffect(() => {
    async function loadOrderData() {
      setLoading(true);

      // Load user's local order history
      let localMyOrders: any[] = [];
      const savedMyOrdersStr = localStorage.getItem('humamanan_my_orders');
      if (savedMyOrdersStr) {
        try { localMyOrders = JSON.parse(savedMyOrdersStr); } catch (e) { console.error(e); }
      }

      let allLocalOrders: any[] = [];
      const savedOrdersStr = localStorage.getItem('humamanan_orders');
      if (savedOrdersStr) {
        try { allLocalOrders = JSON.parse(savedOrdersStr); } catch (e) { console.error(e); }
      }

      // Match requested order ID
      let matched = null;
      if (orderIdStr) {
        matched = localMyOrders.find((o: any) => String(o.id) === String(orderIdStr) || String(o._id) === String(orderIdStr))
          || allLocalOrders.find((o: any) => String(o.id) === String(orderIdStr) || String(o._id) === String(orderIdStr));

        if (!matched) {
          try {
            const res = await fetch(`/api/orders?id=${encodeURIComponent(orderIdStr)}`);
            const data = await res.json();
            if (data.success && (data.order || (data.orders && data.orders.length > 0))) {
              matched = data.order || data.orders[0];
            }
          } catch (err) {
            console.error("Failed to fetch order from API:", err);
          }
        }
      }

      if (!matched && localMyOrders.length > 0) {
        matched = localMyOrders[0];
      }

      if (matched) {
        setOrder(matched);
        if (!localMyOrders.some((o: any) => String(o.id) === String(matched.id))) {
          localMyOrders.unshift(matched);
          localStorage.setItem('humamanan_my_orders', JSON.stringify(localMyOrders));
        }
      }

      const userPhone = localStorage.getItem('humamanan_user_phone');
      if (userPhone) {
        try {
          const res = await fetch(`/api/orders?phone=${encodeURIComponent(userPhone)}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.orders) && data.orders.length > 0) {
            const merged = [...data.orders];
            localMyOrders.forEach(lo => {
              if (!merged.some(m => String(m.id) === String(lo.id))) {
                merged.push(lo);
              }
            });
            localMyOrders = merged;
          }
        } catch (e) {
          console.error("Failed to fetch order history by phone:", e);
        }
      }

      setMyOrdersHistory(localMyOrders);
      setLoading(false);
    }

    loadOrderData();
  }, [orderIdStr]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <div className="w-10 h-10 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400 mt-4 font-serif">Loading your luxury order confirmation...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl">Order Not Found</h1>
        <p className="text-xs text-neutral-500">Could not retrieve order verification details. Please contact support or place a new order.</p>
        <Link href="/" className="inline-block px-6 py-2.5 bg-[#c49a45] text-white text-xs uppercase tracking-widest font-serif rounded">
          Return to Home
        </Link>
      </div>
    );
  }

  // Payment calculation values
  const orderTotal = Number(order.orderTotal || order.totalAmount || 0);
  const payableAmt = order.payableAmount !== undefined && order.payableAmount !== null
    ? Number(order.payableAmount)
    : (order.paymentType === 'advance_30' ? Math.round(orderTotal * 0.3 * 100) / 100 : orderTotal);
  const remainingAmt = order.remainingAmount !== undefined && order.remainingAmount !== null
    ? Number(order.remainingAmount)
    : (order.paymentType === 'advance_30' ? Math.round((orderTotal - payableAmt) * 100) / 100 : 0);
  const payStatus = order.paymentStatus || 'pending';

  return (
    <div className="bg-[#faf9f6] min-h-screen py-16 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Breathtaking Confirmation Announcement Card */}
        <div className="bg-white border border-[#ebdcb9] rounded-lg p-8 sm:p-12 text-center space-y-5 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ebdcb9]/10 rounded-full blur-3xl" />

          <div className="w-20 h-20 rounded-full bg-[#ebdcb9]/20 border border-[#c49a45]/30 flex items-center justify-center mx-auto text-[#c49a45]">
            <Sparkles className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.3em] text-[#c49a45] uppercase block font-serif">
              ✦ Order Booked & Confirmed ✦
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl text-[#121212] tracking-wide font-light">
              MUBARAK! SHADI KI TAYARI SHURU
            </h1>
            <p className="text-xs text-neutral-400 font-mono">
              Your huma manan Couture Order Reference is: <strong className="text-neutral-800">#HM-{order.id}</strong>
            </p>
          </div>

          <div className="w-24 h-[1px] bg-[#ebdcb9] mx-auto" />

          <p className="text-xs sm:text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed font-light">
            Thank you, <strong className="text-neutral-800 font-semibold">{order.customerName}</strong>. Your royal dress booking has been successfully saved. An automated confirmation receipt has been dispatched.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <div className="bg-[#ebdcb9]/20 text-[#856423] font-serif font-semibold text-xs py-2 px-4 rounded border border-[#c49a45]/20 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-[#c49a45]" />
              <span>Verification Call Incoming within 24 Hours</span>
            </div>
            <div className="bg-neutral-100 text-neutral-700 font-serif text-xs py-2 px-4 rounded border border-neutral-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#c49a45]" />
              <span>Standard Transit: 15-20 Days</span>
            </div>
          </div>
        </div>

        {/* Payment Verification Callout Banner */}
        <div className="bg-white border border-[#ebdcb9] rounded-lg p-6 space-y-4 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-100 pb-4">
            <div>
              <h3 className="font-serif text-sm font-bold text-neutral-900 tracking-wider flex items-center gap-2">
                <span>Payment Verification Status</span>
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                Method: {order.paymentMethod || 'Bank Transfer'}
              </p>
            </div>

            {/* Visual Payment Status Pill */}
            <span className={`px-4 py-1.5 rounded-full text-xs font-serif font-bold tracking-wider uppercase flex items-center gap-2 ${
              payStatus === 'verified'
                ? 'bg-green-100 text-green-800 border border-green-300'
                : payStatus === 'submitted'
                ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                : payStatus === 'rejected'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                payStatus === 'verified' ? 'bg-green-600' :
                payStatus === 'submitted' ? 'bg-blue-600 animate-ping' :
                payStatus === 'rejected' ? 'bg-red-600' : 'bg-amber-600'
              }`} />
              {payStatus === 'verified' && 'Verified'}
              {payStatus === 'submitted' && 'Payment Submitted'}
              {payStatus === 'rejected' && 'Rejected'}
              {payStatus === 'pending' && 'Pending Proof'}
            </span>
          </div>

          {/* Payment Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono bg-[#faf9f6] p-4 rounded border border-neutral-200/80">
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Order Total</span>
              <span className="font-bold text-neutral-900">{formatPrice(orderTotal, order.currency as 'PKR' | 'USD')}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Payment Type</span>
              <span className="font-bold text-[#c49a45] font-serif">
                {order.paymentType === 'advance_30' ? '30% Advance' : '100% Full Payment'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Amount Submitted / Paid</span>
              <span className="font-bold text-green-700">{formatPrice(payableAmt, order.currency as 'PKR' | 'USD')}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 block uppercase">Remaining Amount</span>
              <span className="font-bold text-neutral-700">{formatPrice(remainingAmt, order.currency as 'PKR' | 'USD')}</span>
            </div>
          </div>

          {/* Rejection Handling & Resubmission Uploader */}
          {payStatus === 'rejected' && (
            <div className="p-5 bg-red-50/90 border border-red-200 rounded-md space-y-4 text-xs">
              <div className="space-y-1">
                <span className="font-serif font-bold text-red-800 text-sm flex items-center gap-2">
                  ⚠️ Payment Proof Rejected by Admin
                </span>
                {order.paymentRejectionReason && (
                  <div className="p-3 bg-white border border-red-200 rounded text-red-700 font-sans italic">
                    Reason: &quot;{order.paymentRejectionReason}&quot;
                  </div>
                )}
                <p className="text-neutral-600 pt-1 leading-relaxed">
                  Please double check your bank transfer receipt and upload a fresh, clear screenshot below to re-submit for verification.
                </p>
              </div>

              {/* Success Notification */}
              {resubmitSuccess && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{resubmitSuccess}</span>
                </div>
              )}

              {/* Error Notification */}
              {resubmitError && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded font-medium">
                  ✦ {resubmitError}
                </div>
              )}

              {/* Resubmit Uploader Controls */}
              <div className="bg-white p-4 rounded border border-red-200 space-y-3">
                <label className="block text-[11px] font-semibold text-neutral-700 uppercase">
                  Upload New Payment Screenshot
                </label>

                {!newScreenshot ? (
                  <div>
                    <input
                      type="file"
                      id="resubmitInput"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleResubmitFileUpload}
                      disabled={isUploading || isSubmittingProof}
                      className="hidden"
                    />
                    <label
                      htmlFor="resubmitInput"
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#c49a45] hover:bg-[#121212] text-white rounded text-xs font-serif font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      {isUploading ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Uploading Image...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Select Screenshot</span>
                        </>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <img src={newScreenshot} alt="New Proof Preview" className="w-16 h-16 object-cover rounded border border-neutral-300" />
                      <div>
                        <span className="text-xs text-green-700 font-semibold block">New Screenshot Uploaded</span>
                        <button
                          type="button"
                          onClick={() => setNewScreenshot('')}
                          className="text-[11px] text-red-600 underline font-serif hover:text-red-800"
                        >
                          Change Screenshot
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleResubmitPayment}
                      disabled={isSubmittingProof}
                      className="px-6 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded text-xs font-serif font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingProof ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <span>Re-submit Payment Proof</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submitted / Awaiting Verification Alert */}
          {payStatus === 'submitted' && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded text-xs text-blue-900 font-serif leading-relaxed">
              ✦ <strong>Payment Received:</strong> Your payment proof has been successfully submitted and is currently being verified by our finance department. We will confirm your order within a few hours.
            </div>
          )}
        </div>

        {/* Next Steps Timeline */}
        <div className="space-y-6">
          <h2 className="font-serif text-lg tracking-widest text-[#121212] uppercase text-center">
            What Happens Next — Couture Process Timeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">

            {/* Step 1 */}
            <div className="bg-white border border-neutral-100 rounded p-5 relative space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-[#121212] text-white flex items-center justify-center font-serif font-bold text-xs">
                01
              </div>
              <h3 className="font-serif text-xs uppercase tracking-widest text-neutral-800 font-bold">Booking Done</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Your order is safely in our queue. A designated designer has started drafting your product fabric specifications.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-[#ebdcb9] rounded p-5 relative space-y-2.5 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-[#c49a45] text-white flex items-center justify-center font-serif font-bold text-xs animate-bounce">
                02
              </div>
              <h3 className="font-serif text-xs uppercase tracking-widest text-[#c49a45] font-bold">Call Verification</h3>
              <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">
                Our team will call or WhatsApp you to verify your chosen size, recipient details, and delivery date.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-neutral-100 rounded p-5 relative space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-serif font-bold text-xs">
                03
              </div>
              <h3 className="font-serif text-xs uppercase tracking-widest text-neutral-800 font-bold">Craft Phase</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Master karigars set up the embroidery frame. All details are meticulously handcrafted onto the pure raw silk or tissue.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white border border-neutral-100 rounded p-5 relative space-y-2.5">
              <div className="w-8 h-8 rounded-full bg-neutral-200 text-neutral-700 flex items-center justify-center font-serif font-bold text-xs">
                04
              </div>
              <h3 className="font-serif text-xs uppercase tracking-widest text-neutral-800 font-bold">Atelier Dispatch</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Your luxury parcel goes through inspection, is sealed in a muslin garment bag, and dispatched via express courier.
              </p>
            </div>

          </div>
        </div>

        {/* Order Breakdown and Customer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Client Details */}
          <div className="bg-white border border-neutral-100 rounded-lg p-6 space-y-4">
            <h3 className="font-serif text-sm tracking-widest uppercase text-[#121212] border-b border-neutral-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#c49a45]" />
              <span>Shipping & Delivery Details</span>
            </h3>

            <div className="space-y-2 text-xs text-neutral-600 font-sans font-light">
              <p><strong className="text-neutral-800">Recipient Name:</strong> {order.customerName}</p>
              <p><strong className="text-neutral-800">Email Address:</strong> {order.customerEmail}</p>
              <p><strong className="text-neutral-800">Phone / WhatsApp:</strong> <span className="font-mono text-neutral-800 font-semibold">{order.customerPhone}</span></p>
              <p><strong className="text-neutral-800">Delivery Address:</strong> {order.customerAddress}</p>
              <p><strong className="text-neutral-800">City / Country:</strong> {order.city}, {order.country}</p>
              <p><strong className="text-neutral-800">Postal / Zip Code:</strong> {order.postalCode}</p>
              {order.notes && (
                <div className="mt-4 p-3 bg-neutral-50 rounded border border-neutral-200 text-[11px] italic">
                  <strong>Special Note:</strong> &quot;{order.notes}&quot;
                </div>
              )}
            </div>
          </div>

          {/* Item Breakdown */}
          <div className="bg-white border border-neutral-100 rounded-lg p-6 space-y-4">
            <h3 className="font-serif text-sm tracking-widest uppercase text-[#121212] border-b border-neutral-100 pb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#c49a45]" />
              <span>Booked Dress Breakdown</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {(order.items as any[]).map((item, idx) => {
                const itemPrice = order.currency === 'PKR' ? item.pkrPrice : item.usdPrice;
                return (
                  <div key={idx} className="flex gap-3 items-start pb-2 border-b border-neutral-100 last:border-0 last:pb-0">
                    <img src={item.image} alt={item.name} className="w-10 h-14 object-cover object-top rounded border border-neutral-200 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs font-semibold text-neutral-800 line-clamp-1">{item.name}</h4>
                      <p className="text-[10px] text-neutral-400 font-mono">Size: {item.size}</p>
                      <div className="flex justify-between items-baseline text-[11px] text-neutral-500 mt-1 font-mono">
                        <span>Qty: {item.quantity}</span>
                        <span>{formatPrice(itemPrice * item.quantity, order.currency as 'PKR' | 'USD')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Footer */}
            <div className="border-t border-neutral-100 pt-3 flex justify-between items-baseline">
              <span className="text-xs text-neutral-500 uppercase tracking-widest">Grand Total Amount</span>
              <span className="font-serif text-lg font-bold text-[#c49a45]">
                {formatPrice(order.totalAmount, order.currency as 'PKR' | 'USD')}
              </span>
            </div>

            <div className="p-2 bg-[#ebdcb9]/20 text-[#856423] text-[9px] rounded font-serif text-center uppercase tracking-widest">
              Payment Method: {order.paymentMethod || 'Direct Bank Transfer'} ({order.paymentType === 'advance_30' ? '30% Advance' : '100% Full Payment'})
            </div>
          </div>

        </div>

        {/* My Order History Section (Private to this user) */}
        {myOrdersHistory.length > 0 && (
          <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wider flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[#c49a45]" />
                  <span>My Booking & Order History</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Saved bookings associated with your device & contact profile
                </p>
              </div>
              <span className="text-xs bg-[#ebdcb9]/30 text-[#856423] px-3 py-1 rounded-full font-mono font-semibold">
                {myOrdersHistory.length} Total Booking{myOrdersHistory.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {myOrdersHistory.map((ord: any) => {
                const isCurrent = String(ord.id) === String(order.id);
                return (
                  <div
                    key={ord.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-[#c49a45] bg-[#ebdcb9]/10'
                        : 'border-neutral-200 bg-neutral-50/50 hover:border-neutral-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-bold text-neutral-800">
                            Reference: #HM-{ord.id}
                          </span>
                          {isCurrent && (
                            <span className="bg-[#c49a45] text-white text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-serif font-bold">
                              Viewing Now
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400 font-mono block mt-0.5">
                          Date: {new Date(ord.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                          ord.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                          ord.status === 'Confirmed' ? 'bg-blue-100 text-blue-800' :
                          ord.status === 'Stitching' ? 'bg-purple-100 text-purple-800' :
                          ord.status === 'Dispatched' ? 'bg-indigo-100 text-indigo-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {ord.status}
                        </span>
                        <span className="font-serif text-sm font-bold text-[#c49a45]">
                          {formatPrice(ord.totalAmount, ord.currency as 'PKR' | 'USD')}
                        </span>
                        {!isCurrent && (
                          <Link
                            href={`/checkout/success?id=${ord.id}`}
                            className="text-xs text-[#c49a45] hover:underline font-semibold flex items-center gap-0.5"
                          >
                            View Details
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => setOrderToDelete(ord)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-neutral-200 hover:border-red-300 rounded transition-all cursor-pointer flex items-center justify-center"
                          title="Delete order from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {ord.items && ord.items.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-neutral-200/60 flex items-center gap-3 overflow-x-auto">
                        {ord.items.map((it: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 flex-shrink-0 bg-white p-1.5 rounded border border-neutral-200">
                            {it.image && (
                              <img src={it.image} alt={it.name} className="w-6 h-8 object-cover rounded border border-neutral-100" />
                            )}
                            <div className="text-[10px]">
                              <p className="font-serif font-bold text-neutral-800 truncate max-w-[120px]">{it.name}</p>
                              <p className="text-neutral-400 font-mono">Qty: {it.quantity} • Size: {it.size}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Back Actions */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#121212] hover:bg-[#c49a45] text-white text-xs uppercase tracking-[0.25em] font-serif font-bold transition-all duration-300 rounded shadow-md"
          >
            <span>Continue to Collections</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Delete Order Modal */}
        {orderToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white border border-[#ebdcb9] rounded-lg shadow-2xl max-w-md w-full p-6 relative space-y-5">
              <button
                onClick={() => !isDeleting && setOrderToDelete(null)}
                disabled={isDeleting}
                className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-full border border-red-100 flex-shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-neutral-900">
                    Delete Order #HM-{orderToDelete.id}?
                  </h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    Are you sure you want to remove this booking from your history?
                  </p>
                </div>
              </div>

              <div className="bg-neutral-50 border border-neutral-200/80 rounded-md p-3.5 space-y-1 text-xs text-neutral-700 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Order Ref:</span>
                  <span className="font-bold text-neutral-800">#HM-{orderToDelete.id}</span>
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
                  onClick={confirmDeleteMyOrder}
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
                      <span>Delete Order</span>
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

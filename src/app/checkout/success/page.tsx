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
  ArrowRight
} from 'lucide-react';

interface SuccessPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = use(searchParams);
  const orderIdStr = resolvedSearchParams.id;
  const orderId = orderIdStr ? parseInt(orderIdStr, 10) : NaN;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    queueMicrotask(() => {
      if (!isNaN(orderId)) {
        const savedOrdersStr = localStorage.getItem('humamanan_orders') || '[]';
        try {
          const savedOrders = JSON.parse(savedOrdersStr);
          const matched = savedOrders.find((o: any) => o.id === orderId);
          if (matched) {
            setOrder(matched);
          }
        } catch (e) {
          console.error("Failed to parse orders from localStorage", e);
        }
      }
      setLoading(false);
    });
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center">
        <div className="w-10 h-10 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-neutral-400 mt-4 font-serif">Loading your luxury order confirmation...</p>
      </div>
    );
  }

  if (isNaN(orderId) || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto text-red-600">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl">Order Not Found</h1>
        <p className="text-xs text-neutral-500">Could not retrieve order verification details. Please contact support.</p>
        <Link href="/" className="inline-block px-6 py-2.5 bg-[#c49a45] text-white text-xs uppercase tracking-widest font-serif rounded">
          Return to Home
        </Link>
      </div>
    );
  }

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
              <h3 className="font-serif text-xs uppercase tracking-widest text-neutral-800 font-bold">COD Dispatch</h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Your luxury parcel goes through inspection, is sealed in a muslin garment bag, and delivered with Cash on Delivery free shipping.
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
              Payment Method: Cash On Delivery (COD)
            </div>
          </div>

        </div>

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

      </div>
    </div>
  );
}

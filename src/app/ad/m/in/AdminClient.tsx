// src/app/ad/m/in/AdminClient.tsx
"use client";

import React, { useState } from 'react';
import { formatPrice } from '@/utils/format';
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
  MapPin
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
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  country: string;
  postalCode: string;
  totalAmount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  items: OrderItem[];
  notes: string | null;
  createdAt: string;
}

interface AdminClientProps {
  initialOrders: Order[];
}

export default function AdminClient({ initialOrders = [] }: AdminClientProps) {
  const [ordersList, setOrdersList] = useState<Order[]>(initialOrders || []);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleStatusChange = (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    setSuccessMessage('');

    setTimeout(() => {
      const updatedOrders = ordersList.map(ord => {
        if (ord.id === orderId) {
          return { ...ord, status: newStatus };
        }
        return ord;
      });

      setOrdersList(updatedOrders);
      localStorage.setItem('humamanan_orders', JSON.stringify(updatedOrders));

      setSuccessMessage(`Order #HM-${orderId} status successfully updated to "${newStatus}"!`);
      setUpdatingId(null);
      setTimeout(() => setSuccessMessage(''), 4000);
    }, 500);
  };

  const totalBookingsCount = ordersList?.length || 0;

  const pkrVolume = (ordersList || [])
    .filter(o => o.currency === 'PKR')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const usdVolume = (ordersList || [])
    .filter(o => o.currency === 'USD')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingValidationCount = (ordersList || []).filter(o => o.status === 'Pending').length;

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
              Track premium bridal inquiries, standard sizes, custom measurements, and Cash on Delivery logistics.
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
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Pending Call Verification</span>
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
            Once a client adds a dress, selects their currency, and finishes checkout, their Cash on Delivery booking will instantly record here.
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="inline-block px-6 py-2.5 bg-[#c49a45] hover:bg-[#121212] text-white text-xs uppercase tracking-widest font-serif font-bold transition-all rounded shadow-md"
            >
              Simulate Customer Shopping
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <h2 className="font-serif text-lg tracking-wider text-neutral-800">
            Chronological Order Queue ({ordersList.length} Active Bookings)
          </h2>

          <div className="space-y-6">
            {ordersList.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#ebdcb9]/40 rounded-lg shadow-xs overflow-hidden"
              >
                {/* Order Top Bar Info with Status Badge */}
                <div className="bg-[#faf9f6] border-b border-[#ebdcb9]/30 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-light">
                  <div className="space-y-1">
                    <span className="font-serif text-sm font-bold text-neutral-800">
                      Order Reference: #HM-{order.id}
                    </span>
                    <span className="text-[11px] text-neutral-400 block">
                      Placed on: {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status Dot */}
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${order.status === 'Pending' ? 'bg-amber-500 animate-pulse' :
                          order.status === 'Confirmed' ? 'bg-blue-500' :
                            order.status === 'Stitching' ? 'bg-purple-500' :
                              order.status === 'Dispatched' ? 'bg-indigo-500' :
                                'bg-green-500'
                        }`} />
                      <span className="text-[10px] uppercase font-semibold text-neutral-400">Status:</span>
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
                                  'bg-green-50 text-green-700 border-green-300'
                          }`}
                      >
                        <option value="Pending">🔴 Pending Call Verify</option>
                        <option value="Confirmed">🟢 Confirmed (Ready to Stitch)</option>
                        <option value="Stitching">🟣 Master Stitching</option>
                        <option value="Dispatched">🔵 Dispatched (COD Transit)</option>
                        <option value="Delivered">✅ Delivered & Paid</option>
                      </select>
                      {updatingId === order.id && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
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
                        <p className="italic">"{order.notes}"</p>
                      </div>
                    )}
                  </div>

                  {/* Items Ordered List */}
                  <div className="lg:col-span-5 space-y-3.5">
                    <h4 className="font-serif text-xs uppercase tracking-widest text-[#121212] font-bold">
                      Couture Ordered Garments
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
                                Product ID: {productId} • Qty: {item.quantity}
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

                  {/* Total Booking Summary */}
                  <div className="lg:col-span-3 bg-neutral-50 p-4 rounded-lg flex flex-col justify-between border border-neutral-100">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-neutral-400 uppercase tracking-widest block font-semibold">Booked Amount</span>
                      <span className="font-serif text-2xl font-bold text-[#c49a45] block leading-none">
                        {formatPrice(order.totalAmount, order.currency as 'PKR' | 'USD')}
                      </span>
                      <span className="text-[9px] text-neutral-500 uppercase tracking-widest font-mono block">
                        Payment: CASH ON DELIVERY
                      </span>
                    </div>

                    <div className="border-t border-neutral-200 pt-3 text-[10px] text-neutral-400 leading-normal">
                      <p className="font-bold text-[#121212] mb-0.5">Quick Action Panel:</p>
                      <p>To verify this order manually, copy customer phone <strong>{order.customerPhone}</strong> and call directly or initiate WhatsApp dialog.</p>
                    </div>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
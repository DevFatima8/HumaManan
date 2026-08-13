// src/app/checkout/page.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/utils/format';
import {
  ShieldCheck,
  Truck,
  PhoneCall,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Clock,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, currency, getCartTotal, clearCart } = useStore();

  // Shipping form fields
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Pakistan');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');

  // Sizing verification checkbox
  const [sizingConfirmed, setSizingVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const subtotal = getCartTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (cart.length === 0) {
      setErrorMessage('Your shopping bag is empty. Please add a dress before checking out.');
      return;
    }

    if (!sizingConfirmed) {
      setErrorMessage('Please confirm that you understand our master-consultation sizing procedure.');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !city || !country) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Convert productId to string
      const orderItems = cart.map(item => ({
        productId: String(item.id),  // Convert to string
        name: item.name,
        pkrPrice: item.pkrPrice,
        usdPrice: item.usdPrice,
        size: item.size,
        quantity: item.quantity,
        image: item.image
      }));

      const totalAmount = subtotal;
      const orderCurrency = currency;

      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        city,
        country,
        postalCode: postalCode || 'N/A',
        totalAmount,
        currency: orderCurrency,
        items: orderItems,
        notes: notes || 'N/A'
      };

      // Save order to database via API
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to place the order.');
      }

      // Save to localStorage as backup
      const existingOrdersStr = localStorage.getItem('humamanan_orders') || '[]';
      const existingOrders = JSON.parse(existingOrdersStr);

      const newOrder = {
        id: orderData.orderId || Math.floor(1000 + Math.random() * 9000),
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        city,
        country,
        postalCode: postalCode || 'N/A',
        totalAmount,
        currency: orderCurrency,
        items: orderItems,
        notes: notes || null,
        paymentMethod: 'COD',
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      existingOrders.unshift(newOrder);
      localStorage.setItem('humamanan_orders', JSON.stringify(existingOrders));

      // Save to user specific my orders history
      try {
        const myOrdersStr = localStorage.getItem('humamanan_my_orders') || '[]';
        const myOrders = JSON.parse(myOrdersStr);
        myOrders.unshift(newOrder);
        localStorage.setItem('humamanan_my_orders', JSON.stringify(myOrders));
      } catch (e) {
        localStorage.setItem('humamanan_my_orders', JSON.stringify([newOrder]));
      }

      localStorage.setItem('humamanan_user_phone', customerPhone);
      localStorage.setItem('humamanan_user_email', customerEmail);

      // Success! Clear cart and redirect
      clearCart();
      setSuccessMessage('Order placed successfully! Redirecting...');

      setTimeout(() => {
        router.push(`/checkout/success?id=${newOrder.id}`);
      }, 1500);

    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMessage(err.message || 'An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#ebdcb9]/30 flex items-center justify-center mx-auto text-[#c49a45]">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl text-neutral-800 font-bold">Your Shopping Bag is Empty</h1>
        <p className="text-xs text-neutral-500 max-w-md mx-auto">
          We offer Pakistani handcrafted couture in standard as well as made-to-measure custom fittings with worldwide delivery.
        </p>
        <Link
          href="/"
          className="inline-block px-8 py-3 bg-[#c49a45] hover:bg-black text-white text-xs uppercase tracking-[0.2em] font-serif font-bold transition-all rounded shadow-md"
        >
          Explore Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-[10px] tracking-[0.3em] text-[#c49a45] uppercase block font-serif">
          Atelier Checkout Portal
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl text-[#121212] tracking-wide mt-1">
          Couture Booking & Order
        </h1>
        <div className="w-16 h-[1px] bg-[#ebdcb9] mx-auto my-3" />
        <p className="text-xs text-neutral-400 font-light">
          Verify your items and enter details to book. Free express shipping + Cash on Delivery verification.
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 text-sm font-semibold rounded flex items-center gap-2 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

        {/* LEFT: Shipping Form (7 columns) */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-[#ebdcb9]/40 p-6 sm:p-8 rounded shadow-xs">

            {/* Form Section 1: Contact */}
            <div className="space-y-4">
              <div className="flex justify-between items-baseline border-b border-neutral-100 pb-2">
                <h2 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2">
                  <span className="text-[#c49a45]">01.</span> Contact Information
                </h2>
                <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded font-mono">Secure Order</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ayesha Malik"
                    className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#c49a45] text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="ayesha@example.com"
                    className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#c49a45] text-neutral-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                  Phone / WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +92 300 1234567"
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#c49a45] text-neutral-800"
                />
                <p className="text-[10px] text-[#856423] font-serif mt-1">
                  ✦ Highly Critical: Our designer will contact you on this number to confirm size.
                </p>
              </div>
            </div>

            {/* Form Section 2: Delivery Details */}
            <div className="space-y-4">
              <h2 className="font-serif text-base tracking-widest text-[#121212] uppercase border-b border-neutral-100 pb-2 flex items-center gap-2">
                <span className="text-[#c49a45]">02.</span> Delivery Address
              </h2>

              <div>
                <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Apartment, building suite, street address"
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#c49a45] text-neutral-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore"
                    className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#c49a45] text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#c49a45] text-neutral-800 h-[34px]"
                  >
                    <option value="Pakistan">Pakistan</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                    Postal Code / Zip
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 54000"
                    className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#c49a45] text-neutral-800"
                  />
                </div>
              </div>
            </div>

            {/* Form Section 3: Sizing and Custom Notes */}
            <div className="space-y-4">
              <h2 className="font-serif text-base tracking-widest text-[#121212] uppercase border-b border-neutral-100 pb-2 flex items-center gap-2">
                <span className="text-[#c49a45]">03.</span> Special Atelier Instructions
              </h2>

              <div>
                <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                  Special Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter custom height, sleeve preference, lining requests, or any extra delivery instruction here."
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded p-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#c49a45] text-neutral-800"
                  rows={3}
                />
              </div>

              {/* Sizing confirmation checkbox */}
              <div className="p-3 bg-[#ebdcb9]/15 border border-[#c49a45]/30 rounded flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="sizingVerify"
                  checked={sizingConfirmed}
                  onChange={(e) => setSizingVerified(e.target.checked)}
                  className="mt-0.5 rounded border-[#c49a45] text-[#c49a45] focus:ring-[#c49a45] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="sizingVerify" className="text-[11px] text-[#3a3528] leading-relaxed cursor-pointer select-none">
                  <strong>I confirm that I want huma manan standard/custom sizing.</strong> I understand that a Master Designer will reach out to me via phone/WhatsApp to confirm my perfect sleeve, neck, length, and body fits before stitching.
                </label>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium">
                ✦ {errorMessage}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-[#c49a45] hover:bg-[#121212] text-white hover:text-[#f2e6d0] text-center text-xs tracking-[0.2em] font-serif uppercase font-bold transition-all duration-300 rounded shadow-md border border-[#c49a45] hover:border-[#121212] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <span>CONFIRM & PLACE COD ORDER</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-neutral-400">
              No immediate online payment needed. Pay in cash when your designer parcel is delivered.
            </p>
          </form>
        </div>

        {/* RIGHT: Order Summary (5 columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121212] text-[#f2e6d0] border border-[#c49a45]/30 rounded p-6 sm:p-8 shadow-md space-y-6">
            <h2 className="font-serif text-base tracking-widest text-[#faf9f6] uppercase border-b border-[#c49a45]/20 pb-2">
              Atelier Order Summary
            </h2>

            {/* Items */}
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {cart.map((item) => {
                const itemPrice = currency === 'PKR' ? item.pkrPrice : item.usdPrice;
                return (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 items-start pb-4 border-b border-[#c49a45]/15">
                    <div className="w-14 h-20 bg-neutral-900 overflow-hidden rounded flex-shrink-0 border border-[#c49a45]/20">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-xs text-[#faf9f6] leading-tight line-clamp-1">{item.name}</h4>
                      <p className="text-[9px] text-neutral-400 font-mono mt-0.5">SKU: {item.sku}</p>
                      <p className="text-[10px] text-[#ebdcb9] mt-1 font-medium">
                        Size: <span className="font-mono text-white bg-white/10 px-1 py-0.5 rounded">{item.size.split(' (')[0]}</span>
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-neutral-400">Qty: {item.quantity}</span>
                        <span className="text-xs font-semibold text-[#ebdcb9] font-mono">
                          {formatPrice(itemPrice * item.quantity, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pricing list */}
            <div className="space-y-2 border-b border-[#c49a45]/15 pb-4 text-xs font-light">
              <div className="flex justify-between">
                <span className="text-neutral-300 font-semibold">Couture Subtotal</span>
                <span className="font-mono">{formatPrice(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Secure Express Delivery</span>
                <span className="text-[#ebdcb9] uppercase tracking-wider font-semibold">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Custom Tailoring Consultation</span>
                <span className="text-[#ebdcb9] uppercase tracking-wider font-semibold">Free</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-300">Payment Option</span>
                <span className="text-neutral-300">Cash on Delivery (COD)</span>
              </div>
            </div>

            {/* Final Grand Total */}
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-serif text-[#faf9f6] font-semibold text-sm">Grand Total</span>
              <div className="text-right">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#c49a45] block">
                  {formatPrice(subtotal, currency)}
                </span>
                <span className="text-[9px] text-neutral-400 font-mono">
                  Payable at your doorstep
                </span>
              </div>
            </div>
          </div>

          {/* Support Card */}
          <div className="border border-[#ebdcb9] bg-[#faf9f6] p-5 rounded space-y-3.5 text-xs text-neutral-600">
            <div className="flex items-center gap-2 text-[#3a3528] font-bold uppercase tracking-wider">
              <PhoneCall className="w-4 h-4 text-[#c49a45]" />
              <span>Need Assistance?</span>
            </div>
            <p className="font-light leading-relaxed text-[11px]">
              If you have any questions or would prefer to book directly on WhatsApp, feel free to tap our dedicated couture support lines.
            </p>
            <div className="flex flex-col gap-1.5 font-mono text-[11px] text-neutral-700">
              <span>✦ WhatsApp: <strong>+92 313 5793337</strong></span>
              <span>✦ Email: <strong>concierge@humamanan.com</strong></span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
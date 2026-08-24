// src/app/checkout/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
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
  Loader2,
  QrCode,
  Smartphone,
  Laptop
} from 'lucide-react';
import Link from 'next/link';
import QRCodeDisplay from '@/components/QRCodeDisplay';

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

  // Sizing verification & payment state
  const [sizingConfirmed, setSizingVerified] = useState(false);
  const paymentMethod = 'Bank Transfer';
  const [paymentType, setPaymentType] = useState<'advance_30' | 'full_100'>('advance_30');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [uploadSource, setUploadSource] = useState<'web' | 'mobile_qr'>('web');
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // QR Code Mobile Upload State
  const [uploadTab, setUploadTab] = useState<'device' | 'qr'>('device');
  const [qrToken, setQrToken] = useState<string>('');
  const [qrMobileUrl, setQrMobileUrl] = useState<string>('');
  const [isGeneratingQr, setIsGeneratingQr] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const subtotal = getCartTotal();

  // Automatic calculation based on order total
  const payableAmount = paymentType === 'advance_30'
    ? Math.round(subtotal * 0.30 * 100) / 100
    : subtotal;

  const remainingAmount = paymentType === 'advance_30'
    ? Math.round((subtotal - payableAmount) * 100) / 100
    : 0;

  // Generate QR payment session token when switching to QR tab or changing payment option
  const createQrSession = async () => {
    setIsGeneratingQr(true);
    try {
      const res = await fetch('/api/payment-session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalAmount: subtotal,
          payableAmount,
          paymentType,
          currency,
        }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        setQrToken(data.token);
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        setQrMobileUrl(`${origin}/mobile-payment-upload/${data.token}`);
      }
    } catch (err) {
      console.error('Error generating QR session token:', err);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  useEffect(() => {
    if (uploadTab === 'qr') {
      createQrSession();
    }
  }, [uploadTab, paymentType]);

  // Real-time Polling for QR Mobile Upload Completion
  useEffect(() => {
    let intervalId: any = null;

    if (uploadTab === 'qr' && qrToken && !paymentScreenshot) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment-session/${qrToken}`);
          const data = await res.json();
          if (data.success && data.session && data.session.screenshotUrl) {
            setPaymentScreenshot(data.session.screenshotUrl);
            setUploadSource('mobile_qr');
            clearInterval(intervalId);
          }
        } catch (err) {
          console.error('Error polling QR session status:', err);
        }
      }, 2500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [uploadTab, qrToken, paymentScreenshot]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Invalid file format. Please upload JPG, PNG, or WEBP image.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be less than 10MB.');
        return;
      }

      setIsUploadingScreenshot(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to upload screenshot');
        }

        setPaymentScreenshot(data.url);
        setUploadSource('web');
      } catch (err: any) {
        setErrorMessage(err.message || 'Error uploading file.');
      } finally {
        setIsUploadingScreenshot(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (cart.length === 0) {
      setErrorMessage('Your shopping bag is empty. Please add a dress before checking out.');
      return;
    }

    if (!sizingConfirmed) {
      setErrorMessage('Please confirm that you understand our master-consultation sizing procedure.');
      return;
    }

    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !city || !country) {
      setErrorMessage('Please fill in all required contact and shipping fields.');
      return;
    }

    if (!paymentScreenshot) {
      setErrorMessage('Please upload your bank transfer payment screenshot to submit your order.');
      return;
    }

    setIsLoading(true);

    try {
      const orderItems = cart.map(item => ({
        productId: String(item.id),
        name: item.name,
        pkrPrice: item.pkrPrice,
        usdPrice: item.usdPrice,
        size: item.size,
        quantity: item.quantity,
        image: item.image
      }));

      const payload = {
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        city,
        country,
        postalCode: postalCode || 'N/A',
        totalAmount: subtotal,
        currency: currency,
        items: orderItems,
        notes: notes || 'N/A',
        paymentMethod,
        paymentType,
        paymentScreenshot,
        uploadSource,
        paymentSessionToken: qrToken || null
      };

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

      const newOrder = {
        id: orderData.orderId || Math.floor(1000 + Math.random() * 9000),
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        city,
        country,
        postalCode: postalCode || 'N/A',
        totalAmount: subtotal,
        currency: currency,
        items: orderItems,
        notes: notes || null,
        paymentMethod,
        paymentType,
        orderTotal: subtotal,
        payableAmount,
        remainingAmount,
        paymentStatus: paymentMethod === 'Bank Transfer' ? 'submitted' : 'pending',
        paymentScreenshot,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      const existingOrdersStr = localStorage.getItem('humamanan_orders') || '[]';
      const existingOrders = JSON.parse(existingOrdersStr);
      existingOrders.unshift(newOrder);
      localStorage.setItem('humamanan_orders', JSON.stringify(existingOrders));

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

      clearCart();
      setSuccessMessage('Order & Payment Proof submitted successfully! Redirecting...');

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
          Verify your items and select your payment option to finalize your luxury booking.
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

            {/* Form Section 3: Special Instructions */}
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

            {/* Form Section 4: Bank Transfer / Payment Selection */}
            <div className="space-y-6">
              <h2 className="font-serif text-base tracking-widest text-[#121212] uppercase border-b border-neutral-100 pb-2 flex items-center gap-2">
                <span className="text-[#c49a45]">04.</span> Direct Bank Transfer Payment
              </h2>

              {/* Bank Transfer Details & Options */}
              <div className="space-y-6 border border-[#ebdcb9] rounded-lg p-5 bg-[#faf9f6]">

                  {/* Payment Type Radio Selection */}
                  <div className="space-y-2">
                    <label className="block text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                      Select Payment Option <span className="text-red-500">*</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`p-3.5 border rounded-md cursor-pointer transition-all flex items-center gap-3 ${
                          paymentType === 'advance_30'
                            ? 'border-[#c49a45] bg-white ring-1 ring-[#c49a45]'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value="advance_30"
                          checked={paymentType === 'advance_30'}
                          onChange={() => setPaymentType('advance_30')}
                          className="text-[#c49a45] focus:ring-[#c49a45] w-4 h-4"
                        />
                        <div>
                          <span className="block text-xs font-serif font-bold text-neutral-800">30% Advance Payment</span>
                          <span className="block text-[10px] text-[#c49a45] font-mono font-semibold">
                            Pay Now: {formatPrice(Math.round(subtotal * 0.3), currency)}
                          </span>
                        </div>
                      </label>

                      <label
                        className={`p-3.5 border rounded-md cursor-pointer transition-all flex items-center gap-3 ${
                          paymentType === 'full_100'
                            ? 'border-[#c49a45] bg-white ring-1 ring-[#c49a45]'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentType"
                          value="full_100"
                          checked={paymentType === 'full_100'}
                          onChange={() => setPaymentType('full_100')}
                          className="text-[#c49a45] focus:ring-[#c49a45] w-4 h-4"
                        />
                        <div>
                          <span className="block text-xs font-serif font-bold text-neutral-800">100% Full Payment</span>
                          <span className="block text-[10px] text-[#c49a45] font-mono font-semibold">
                            Pay Now: {formatPrice(subtotal, currency)}
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Real-time Financial Breakdown */}
                  <div className="bg-[#121212] text-[#f2e6d0] p-4 rounded-md space-y-2 border border-[#c49a45]/30">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Order Total:</span>
                      <span className="font-mono font-semibold text-white">{formatPrice(subtotal, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-neutral-400">Selected Option:</span>
                      <span className="font-serif text-[#ebdcb9] font-bold">
                        {paymentType === 'advance_30' ? '30% Advance Payment' : '100% Full Payment'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-[#c49a45]/20 font-bold">
                      <span className="text-white font-serif">Amount To Pay Now:</span>
                      <span className="font-serif text-[#c49a45] text-base">{formatPrice(payableAmount, currency)}</span>
                    </div>
                    {paymentType === 'advance_30' && (
                      <div className="flex justify-between items-center text-xs text-amber-300 pt-1 font-mono">
                        <span>Remaining Amount:</span>
                        <span>{formatPrice(remainingAmount, currency)}</span>
                      </div>
                    )}
                  </div>

                  {/* Bank Alfalah Instructions */}
                  <div className="bg-white border border-[#ebdcb9] rounded-md p-4 space-y-3">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <h4 className="font-serif text-xs font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#c49a45]" />
                        Bank Transfer Instructions
                      </h4>
                      <span className="text-[10px] bg-[#ebdcb9]/30 text-[#856423] px-2 py-0.5 rounded font-mono font-bold">
                        Bank Alfalah
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono text-neutral-700">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Bank Name</span>
                        <span className="font-bold text-neutral-800">Bank Alfalah</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Account Title</span>
                        <span className="font-bold text-neutral-800">HUMA MANAN</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Account Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#c49a45]">02691010686214</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('02691010686214', 'acc')}
                            className="text-[9px] bg-neutral-100 hover:bg-[#ebdcb9]/40 text-neutral-600 px-1.5 py-0.5 rounded font-sans cursor-pointer transition-colors"
                          >
                            {copiedField === 'acc' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">IBAN</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#c49a45] text-[11px] truncate">PK33ALFH0269001010686214</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard('PK33ALFH0269001010686214', 'iban')}
                            className="text-[9px] bg-neutral-100 hover:bg-[#ebdcb9]/40 text-neutral-600 px-1.5 py-0.5 rounded font-sans cursor-pointer transition-colors"
                          >
                            {copiedField === 'iban' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">SWIFT Code</span>
                        <span className="font-bold text-neutral-800">ALFHPKKAXXX</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase">Branch Code / Name</span>
                        <span className="font-bold text-neutral-800">0269 — KUTCHERY ROAD GUJRAT</span>
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50/80 border border-amber-200 rounded text-[11px] text-amber-900 leading-relaxed font-serif">
                      ✦ <strong>Instruction:</strong> Please transfer the exact payable amount (<strong>{formatPrice(payableAmount, currency)}</strong>) to the above bank account and upload your payment screenshot below.
                    </div>
                  </div>

                  {/* Payment Screenshot Upload Section with Option 1 (Device) and Option 2 (Mobile QR) */}
                  <div className="space-y-3">
                    <label className="block text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                      Payment Screenshot Proof <span className="text-red-500">*</span>
                    </label>

                    {!paymentScreenshot ? (
                      <div className="bg-white border border-[#ebdcb9] rounded-lg p-4 space-y-4 shadow-xs">
                        {/* Option Tabs Header */}
                        <div className="grid grid-cols-2 gap-2 bg-[#faf9f6] p-1 rounded-md border border-[#ebdcb9]/40">
                          <button
                            type="button"
                            onClick={() => setUploadTab('device')}
                            className={`py-2 px-3 rounded text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              uploadTab === 'device'
                                ? 'bg-white text-neutral-800 shadow-xs border border-[#c49a45]/30'
                                : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            <Laptop className="w-3.5 h-3.5 text-[#c49a45]" />
                            <span>1. Upload From This Device</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setUploadTab('qr')}
                            className={`py-2 px-3 rounded text-xs font-serif font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              uploadTab === 'qr'
                                ? 'bg-white text-neutral-800 shadow-xs border border-[#c49a45]/30'
                                : 'text-neutral-500 hover:text-neutral-800'
                            }`}
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#c49a45]" />
                            <span>2. Scan QR from Mobile</span>
                          </button>
                        </div>

                        {/* Option 1: File Upload From Device */}
                        {uploadTab === 'device' && (
                          <div className="border-2 border-dashed border-[#ebdcb9] hover:border-[#c49a45] rounded-lg p-6 text-center bg-white transition-colors">
                            <input
                              type="file"
                              id="paymentScreenshotInput"
                              accept="image/jpeg,image/png,image/webp,image/jpg"
                              onChange={handleFileUpload}
                              disabled={isUploadingScreenshot}
                              className="hidden"
                            />
                            <label htmlFor="paymentScreenshotInput" className="cursor-pointer block space-y-2">
                              <div className="w-12 h-12 rounded-full bg-[#ebdcb9]/30 text-[#c49a45] flex items-center justify-center mx-auto">
                                {isUploadingScreenshot ? (
                                  <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                  <Sparkles className="w-6 h-6" />
                                )}
                              </div>
                              <div>
                                <span className="text-xs font-serif font-bold text-[#c49a45] hover:underline block">
                                  {isUploadingScreenshot ? 'Uploading Screenshot...' : 'Click to Upload Payment Screenshot'}
                                </span>
                                <span className="text-[10px] text-neutral-400 block mt-0.5">
                                  Supports JPG, JPEG, PNG, WEBP (Max 10MB)
                                </span>
                              </div>
                            </label>
                          </div>
                        )}

                        {/* Option 2: Scan QR Code from Mobile */}
                        {uploadTab === 'qr' && (
                          <div className="p-4 border border-[#ebdcb9] bg-[#faf9f6] rounded-lg text-center space-y-3 animate-fade-in">
                            <div className="flex items-center justify-center gap-1.5 text-xs font-serif font-bold text-neutral-800 uppercase tracking-wider">
                              <Smartphone className="w-4 h-4 text-[#c49a45]" />
                              <span>Mobile QR Upload Session</span>
                            </div>

                            {isGeneratingQr ? (
                              <div className="py-8 space-y-2">
                                <Loader2 className="w-6 h-6 text-[#c49a45] animate-spin mx-auto" />
                                <span className="text-xs text-neutral-500 font-serif">Generating Secure QR Code...</span>
                              </div>
                            ) : qrMobileUrl ? (
                              <div className="space-y-3">
                                <QRCodeDisplay value={qrMobileUrl} size={170} />

                                <div className="space-y-1 max-w-sm mx-auto">
                                  <p className="text-xs font-serif text-neutral-800 font-semibold">
                                    Scan this QR code with your mobile phone to upload your payment screenshot.
                                  </p>
                                  <p className="text-[11px] text-[#c49a45] font-serif font-medium flex items-center justify-center gap-1">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>After uploading from your phone, the screenshot will automatically appear here.</span>
                                  </p>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border border-green-200 rounded-lg p-3 flex items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded border border-neutral-200 overflow-hidden bg-neutral-900 flex-shrink-0">
                            <img src={paymentScreenshot} alt="Payment Proof Preview" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-green-700 flex items-center gap-1 font-serif">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              Screenshot Uploaded Successfully
                            </span>
                            <span className="text-[10px] text-neutral-500 font-mono block mt-0.5">
                              Upload Source: <span className="uppercase font-bold text-neutral-800">{uploadSource === 'mobile_qr' ? 'Mobile QR' : 'Web Device'}</span>
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setPaymentScreenshot('');
                            if (uploadTab === 'qr') createQrSession();
                          }}
                          className="text-xs text-red-600 hover:text-red-800 underline font-serif cursor-pointer"
                        >
                          Remove / Change
                        </button>
                      </div>
                    )}
                  </div>

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
              disabled={isLoading || isUploadingScreenshot}
              className="w-full py-4 bg-[#c49a45] hover:bg-[#121212] text-white hover:text-[#f2e6d0] text-center text-xs tracking-[0.2em] font-serif uppercase font-bold transition-all duration-300 rounded shadow-md border border-[#c49a45] hover:border-[#121212] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Order & Payment Proof...</span>
                </>
              ) : (
                <>
                  <span>SUBMIT PAYMENT & PLACE ORDER</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-neutral-400">
              Your order will be verified by our team once the bank transfer receipt is received.
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
                <span className="text-neutral-300">Payment Option</span>
                <span className="text-[#ebdcb9] font-serif font-bold">
                  {paymentType === 'advance_30' ? 'Bank Transfer (30% Advance)' : 'Bank Transfer (Full Payment)'}
                </span>
              </div>
              {paymentType === 'advance_30' && (
                <div className="flex justify-between text-amber-300 font-mono">
                  <span>Remaining Balance</span>
                  <span>{formatPrice(remainingAmount, currency)}</span>
                </div>
              )}
            </div>

            {/* Final Grand Total */}
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-serif text-[#faf9f6] font-semibold text-sm">Amount Payable Now</span>
              <div className="text-right">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#c49a45] block">
                  {formatPrice(payableAmount, currency)}
                </span>
                <span className="text-[9px] text-neutral-400 font-mono">
                  Via Direct Bank Transfer
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
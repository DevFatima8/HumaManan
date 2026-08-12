// src/app/ad/m/in/discounts/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/utils/format';
import { Percent, Plus, Trash2, Check, Sparkles, Tag } from 'lucide-react';

export default function AdminDiscountsPage() {
  const { productsList, discountsList, addDiscount, deleteDiscount } = useStore();

  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [percent, setPercent] = useState<number>(10);
  const [notification, setNotification] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  // Set default product when products load
  useEffect(() => {
    if (productsList.length > 0 && !selectedProductId) {
      const firstProduct = productsList[0];
      queueMicrotask(() => {
        setSelectedProductId(String(firstProduct.id || firstProduct._id || ''));
      });
    }
  }, [productsList, selectedProductId]);

  const showNotification = (msg: string, isError: boolean = false) => {
    setNotification(msg);
    setNotificationType(isError ? 'error' : 'success');
    setTimeout(() => {
      setNotification('');
      setNotificationType('success');
    }, 4000);
  };

  const handleApplyDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      showNotification('Please select a product first.', true);
      return;
    }

    const prod = productsList.find(p => String(p.id || p._id) === selectedProductId);
    if (!prod) {
      showNotification('Product not found.', true);
      return;
    }

    try {
      await addDiscount(selectedProductId, percent);
      showNotification(`Applied a ${percent}% discount on "${prod.name}" successfully!`);
    } catch (error) {
      showNotification('Failed to apply discount. Please try again.', true);
    }
  };

  // Helper to get product display ID
  const getProductId = (product: any) => {
    return String(product._id || product.id || '');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in">

      {/* Top Banner */}
      <div className="bg-[#121212] text-[#f2e6d0] border border-[#c49a45]/30 rounded p-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#c49a45_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <span className="text-[9px] tracking-[0.25em] text-[#ebdcb9] uppercase block font-serif">
          ✦ Atelier Backoffice Portal ✦
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-[#faf9f6] tracking-wide mt-1">
          COUTURE PROMOTIONS & DISCOUNT MANAGER
        </h1>
        <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
          Apply stateful discounts to active items. The discounted prices will calculate automatically in client checkouts, cart sliders, and product pages.
        </p>
      </div>

      {notification && (
        <div className={`p-4 border text-xs font-semibold rounded flex items-center gap-2 animate-bounce ${notificationType === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
          }`}>
          <Check className={`w-4 h-4 ${notificationType === 'success' ? 'text-green-600' : 'text-red-600'}`} />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT: Apply Discount Form (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-[#ebdcb9]/40 p-6 rounded shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#c49a45]" />
              <span>Apply New Discount</span>
            </h2>
          </div>

          <form onSubmit={handleApplyDiscount} className="space-y-4">
            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                Select Product to Discount
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none h-[34px]"
                required
              >
                <option value="">-- Select a garment --</option>
                {productsList.map((p: any) => {
                  const productId = getProductId(p);
                  return (
                    <option key={productId} value={productId}>
                      {p.name} ({p.sku})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                Discount Percent (%)
              </label>
              <input
                type="number"
                min="1"
                max="95"
                required
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-2.5 py-1.5 text-xs text-neutral-800 focus:outline-none"
                placeholder="e.g. 15 for 15% off"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#121212] hover:bg-[#c49a45] text-white text-xs uppercase tracking-[0.2em] font-serif font-bold transition-all rounded shadow-md cursor-pointer"
            >
              APPLY CAMPAIGN DISCOUNT
            </button>
          </form>
        </div>

        {/* RIGHT: Active Discounts List (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-[#ebdcb9]/40 p-6 rounded shadow-xs space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2">
              <Percent className="w-5 h-5 text-[#c49a45]" />
              <span>Active Promotions ({discountsList.length})</span>
            </h2>
          </div>

          <div className="space-y-4">
            {discountsList.length === 0 ? (
              <div className="p-12 text-center text-xs text-neutral-400 font-mono">
                No campaign discounts are active at the moment.
              </div>
            ) : (
              discountsList.map((disc: any) => {
                const prod = productsList.find((p: any) => String(p._id || p.id) === String(disc.productId));
                if (!prod) return null;

                const origPkr = prod.pkrPrice;
                const origUsd = prod.usdPrice;

                const discPkr = Math.round(origPkr * (1 - disc.discountPercent / 100));
                const discUsd = Math.round(origUsd * (1 - disc.discountPercent / 100));

                return (
                  <div key={disc._id || disc.id} className="p-4 border border-[#ebdcb9]/30 rounded-lg flex justify-between items-center bg-[#faf9f6]/40 hover:border-[#c49a45]/40 transition-all">
                    <div className="flex gap-3 items-center">
                      <div className="w-10 h-20 rounded overflow-hidden border border-[#ebdcb9]/30">
                        <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <div className="space-y-1">
                        <span className="font-serif text-xs font-bold text-neutral-800 block">{prod.name}</span>
                        <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                          <span className="bg-[#ebdcb9]/40 text-[#856423] font-bold px-1.5 py-0.5 rounded">
                            {disc.discountPercent}% OFF
                          </span>
                          <span className="text-neutral-400 font-mono">SKU: {prod.sku}</span>
                        </div>

                        <div className="text-[11px] space-y-0.5 pt-1">
                          <p className="text-neutral-400">
                            PKR: <span className="line-through">{formatPrice(origPkr, 'PKR')}</span> &gt; <span className="text-[#c49a45] font-bold font-mono">{formatPrice(discPkr, 'PKR')}</span>
                          </p>
                          <p className="text-neutral-400">
                            USD: <span className="line-through">{formatPrice(origUsd, 'USD')}</span> &gt; <span className="text-neutral-700 font-bold font-mono">{formatPrice(discUsd, 'USD')}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await deleteDiscount(disc.productId);
                          showNotification(`Removed campaign discount on "${prod.name}".`);
                        } catch (error) {
                          showNotification('Failed to remove discount.', true);
                        }
                      }}
                      className="p-2 text-neutral-400 hover:text-red-600 transition-colors"
                      title="Remove Discount"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
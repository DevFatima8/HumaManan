"use client";

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/utils/format';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function CartSidebar() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    currency, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal 
  } = useStore();

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close cart on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsCartOpen(false);
      }
    }
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = getCartTotal();

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar Panel */}
      <div 
        ref={sidebarRef}
        className="relative w-full max-w-md bg-[#faf9f6] h-full shadow-2xl flex flex-col z-[101] border-l border-[#ebdcb9]/40"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#ebdcb9]/40 flex justify-between items-center bg-[#121212] text-[#f2e6d0]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#c49a45]" />
            <h2 className="font-serif text-lg tracking-widest uppercase">Shopping Bag</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-white hover:text-[#c49a45] transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart items list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-4 py-12">
              <div className="w-16 h-16 rounded-full bg-[#ebdcb9]/20 flex items-center justify-center text-[#c49a45]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <p className="font-serif text-lg text-[#3a3528]">Your shopping bag is empty</p>
                <p className="text-xs text-neutral-500 mt-1">Discover our exclusive luxury collections to begin</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-6 py-2.5 bg-[#c49a45] hover:bg-[#a37e33] text-white text-xs uppercase tracking-widest font-semibold transition-all duration-300 rounded shadow-md"
              >
                Browse Collections
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const itemPrice = currency === 'PKR' ? item.pkrPrice : item.usdPrice;
              return (
                <div key={`${item.id}-${item.size}`} className="flex gap-4 pb-6 border-b border-neutral-100 items-start">
                  {/* Image */}
                  <div className="w-20 h-28 bg-neutral-100 overflow-hidden rounded relative border border-[#ebdcb9]/30 flex-shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="font-serif text-sm text-[#121212] font-semibold leading-tight line-clamp-2">
                        {item.name}
                      </h4>
                      <button 
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-neutral-400 hover:text-red-600 transition-colors flex-shrink-0 p-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-[10px] text-neutral-500 uppercase tracking-wider mt-1">SKU: {item.sku}</p>
                    <p className="text-xs text-[#c49a45] mt-1 font-medium">Size: <span className="font-semibold text-[#121212]">{item.size}</span></p>
                    
                    {/* Size Custom Note Notice */}
                    {item.size === 'Custom' && (
                      <span className="text-[9px] bg-[#ebdcb9]/30 text-[#856423] px-1.5 py-0.5 rounded font-mono mt-1 inline-block">
                        Made-to-Measure
                      </span>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#ebdcb9]/60 rounded overflow-hidden bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                          className="px-2 py-1 text-[#3a3528] hover:bg-[#faf9f6] transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs text-[#121212] font-semibold">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                          className="px-2 py-1 text-[#3a3528] hover:bg-[#faf9f6] transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-xs font-semibold text-[#121212]">
                          {formatPrice(itemPrice * item.quantity, currency)}
                        </span>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-neutral-400">
                            {formatPrice(itemPrice, currency)} each
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t border-[#ebdcb9]/50 bg-white p-6 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#3a3528] tracking-wider uppercase text-xs">Total Items</span>
                <span className="font-semibold text-neutral-800">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="font-serif text-[#121212] font-semibold text-base">Estimated Total</span>
                <span className="font-serif text-lg sm:text-xl font-bold text-[#c49a45]">
                  {formatPrice(subtotal, currency)}
                </span>
              </div>
              <div className="flex gap-2 text-[10px] text-neutral-400 font-serif pt-1">
                <span>✦ Prices converted instantly to <strong>{currency}</strong></span>
                <span>✦ Custom fittings included</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <Link 
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="block w-full py-3.5 bg-[#c49a45] hover:bg-[#121212] text-[#faf9f6] hover:text-[#f2e6d0] text-center text-xs tracking-[0.2em] font-serif uppercase font-semibold transition-all duration-300 rounded shadow-md border border-[#c49a45] hover:border-[#121212]"
              >
                Proceed to COD Checkout
              </Link>
              
              <button 
                onClick={() => setIsCartOpen(false)}
                className="w-full text-center py-2 text-xs text-neutral-500 hover:text-[#c49a45] transition-colors tracking-widest uppercase font-semibold cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

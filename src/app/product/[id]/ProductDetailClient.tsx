// src/app/product/[id]/ProductDetailClient.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/utils/format';
import {
  Check,
  Plus,
  Minus,
  ShoppingBag,
  Truck,
  ChevronDown,
  Tag
} from 'lucide-react';

interface ProductDetailClientProps {
  product: any; // Using any to handle both MongoDB and local product types
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { currency, setCurrency, addToCart, discountsList } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'craft' | 'fabric' | 'shipping'>('craft');

  // Initialize selectedImage with product's first image when product loads
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  // If no product, return null
  if (!product) {
    return null;
  }

  const handleCurrencyChange = (newCurr: 'PKR' | 'USD') => {
    setCurrency(newCurr);
  };

  // Get product ID (handle both _id and id)
  const productId = product._id || product.id;

  // Find discount - convert to string for comparison
  const discountInfo = discountsList.find(d => {
    const dProductId = d.productId || d.id;
    return String(dProductId) === String(productId);
  });

  const pkrOriginal = product.pkrPrice;
  const usdOriginal = product.usdPrice;

  const pkrPrice = discountInfo ? Math.round(pkrOriginal * (1 - discountInfo.discountPercent / 100)) : pkrOriginal;
  const usdPrice = discountInfo ? Math.round(usdOriginal * (1 - discountInfo.discountPercent / 100)) : usdOriginal;

  const handleAddToBag = () => {
    addToCart({
      id: productId,
      name: product.name,
      sku: product.sku,
      pkrPrice: pkrOriginal,
      usdPrice: usdOriginal,
      image: product.images[0],
      size: selectedSize,
      quantity: quantity
    });
  };

  const activePrice = currency === 'PKR' ? pkrPrice : usdPrice;
  const activeOriginalPrice = currency === 'PKR' ? pkrOriginal : usdOriginal;

  const images = product?.images || [];
  const mainImage = selectedImage || (images.length > 0 ? images[0] : '');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-4 pb-20 animate-fade-in">

      {/* LEFT: Image Gallery Panel */}
      <div className="lg:col-span-7 space-y-5">

        {/* Large Main Display */}
        <div className="relative aspect-[1/2] w-full overflow-hidden rounded bg-neutral-100 border border-[#ebdcb9]/40 shadow-sm group">
          {mainImage ? (
            <img
              src={mainImage}
              alt={product.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-101"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-500 text-sm">
              No Image Available
            </div>
          )}
          {discountInfo && (
            <span className="absolute top-4 left-4 z-10 bg-red-600 border border-red-400 text-white font-serif uppercase tracking-widest text-xs px-3.5 py-1.5 rounded flex items-center gap-1 font-bold shadow-lg">
              <Tag className="w-3.5 h-3.5" />
              <span>{discountInfo.discountPercent}% OFF CAMPAIGN</span>
            </span>
          )}
          <span className="absolute bottom-4 right-4 bg-[#121212]/80 backdrop-blur-md text-white text-[9px] tracking-widest uppercase px-3 py-1.5 rounded font-mono">
            Atelier Original Photography
          </span>
        </div>

        {/* Thumbnails Grid */}
        {images.length > 1 && (
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono mb-2 text-center sm:text-left">
              ✦ Collection Gallery ({images.length} High-Res Angles)
            </p>

            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {images.map((imgUrl: string, idx: number) => {
                const isSelected = selectedImage === imgUrl;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`aspect-[1/2] relative rounded overflow-hidden border bg-neutral-50 transition-all duration-300 cursor-pointer ${isSelected
                      ? 'border-[#c49a45] ring-2 ring-[#c49a45]/20 scale-102'
                      : 'border-[#ebdcb9]/30 hover:border-[#c49a45]'
                      }`}
                    aria-label={`View dress angle ${idx + 1}`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} - Angle ${idx + 1}`}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Product Details & Configurator */}
      <div className="lg:col-span-5 space-y-8 flex flex-col justify-between">
        <div className="space-y-6">

          {/* Header Metadata */}
          <div className="space-y-2">
            <span className="text-xs font-serif italic text-[#c49a45] tracking-widest uppercase block">
              ✦ Huma Manan Couture Masterpiece
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-[#121212] tracking-wide leading-tight font-bold">
              {product.name}
            </h1>
            <div className="text-xs text-neutral-400 font-mono tracking-wider pt-1 border-b border-neutral-100 pb-3 space-y-1">
              <div>Category: {product.category} &gt; {product.subcategory}</div>
              <div className="flex justify-between">
                <span>SKU: {product.sku}</span>
                <span>Craft: 100% Handcrafted</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-light font-sans">
            {product.description}
          </p>

          {/* CURRENCY SELECTOR & PRICE DISPLAY */}
          <div className="p-4 sm:p-5 bg-gradient-to-br from-[#faf9f6] to-[#ebdcb9]/15 border border-[#ebdcb9] rounded space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono block mb-1">
                  Selected Price Currency
                </span>
                <div className="relative inline-block w-48">
                  <select
                    value={currency}
                    onChange={(e) => handleCurrencyChange(e.target.value as 'PKR' | 'USD')}
                    className="w-full bg-white border border-[#ebdcb9] text-[#121212] px-3.5 py-2 pr-10 text-xs tracking-widest uppercase font-serif font-bold rounded shadow-xs focus:outline-none focus:ring-1 focus:ring-[#c49a45] cursor-pointer font-semibold"
                  >
                    <option value="PKR">Pakistani Rupees (PKR)</option>
                    <option value="USD">US Dollars (USD)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono block">
                  Atelier Price
                </span>
                <div className="flex items-center gap-2 justify-start sm:justify-end">
                  <span className="font-serif text-2xl sm:text-3xl font-extrabold text-[#c49a45] block">
                    {formatPrice(activePrice, currency)}
                  </span>
                  {discountInfo && (
                    <span className="text-sm text-neutral-400 line-through font-mono">
                      {formatPrice(activeOriginalPrice, currency)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#ebdcb9]/30 text-[10px] text-[#856423] font-serif justify-between">
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-[#c49a45]" />
                <span>Dual pricing converted correctly</span>
              </span>
              <span className="font-bold underline">
                {currency === 'PKR' ? `~ $${usdPrice} USD` : `~ Rs. ${pkrPrice.toLocaleString()} PKR`}
              </span>
            </div>
          </div>

          {/* SIZES SELECTOR */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#3a3528] uppercase tracking-wider font-semibold">Select Standard Size Fit</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {product.sizes && product.sizes.map((size: string) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-3 text-xs tracking-wider rounded font-semibold transition-all duration-200 cursor-pointer ${isSelected
                      ? 'bg-[#121212] text-white ring-2 ring-[#c49a45]'
                      : 'bg-white border border-[#ebdcb9]/50 text-neutral-700 hover:border-[#c49a45] hover:text-[#c49a45]'
                      }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* QUANTITY & ADD TO BAG */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-4 items-center">
              <div className="flex items-center border border-[#ebdcb9] rounded bg-white h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-[#3a3528] hover:bg-neutral-50 transition-colors h-full flex items-center"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-5 text-sm text-[#121212] font-bold h-full flex items-center justify-center min-w-[40px]">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-[#3a3528] hover:bg-neutral-50 transition-colors h-full flex items-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleAddToBag}
                className="flex-1 bg-[#c49a45] hover:bg-[#121212] hover:text-[#f2e6d0] text-white py-3 px-6 rounded h-12 text-xs uppercase tracking-[0.2em] font-serif font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer border border-[#c49a45] hover:border-[#121212]"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Bag</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-neutral-400 font-serif">
              ✦ standard designer fits ✦ cash on delivery options
            </p>
          </div>

        </div>

        {/* Collapsible Tabs */}
        <div className="border-t border-[#ebdcb9]/40 pt-6">
          <div className="flex border-b border-[#ebdcb9]/30 text-xs">
            <button
              onClick={() => setActiveTab('craft')}
              className={`pb-2.5 px-2 uppercase tracking-widest font-serif font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'craft' ? 'border-[#c49a45] text-[#c49a45]' : 'border-transparent text-neutral-400'
                }`}
            >
              Artisan Craft
            </button>
            <button
              onClick={() => setActiveTab('fabric')}
              className={`pb-2.5 px-2 uppercase tracking-widest font-serif font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'fabric' ? 'border-[#c49a45] text-[#c49a45]' : 'border-transparent text-neutral-400'
                }`}
            >
              Fabric & Care
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`pb-2.5 px-2 uppercase tracking-widest font-serif font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'shipping' ? 'border-[#c49a45] text-[#c49a45]' : 'border-transparent text-neutral-400'
                }`}
            >
              COD & Delivery
            </button>
          </div>

          <div className="py-4 text-xs leading-relaxed text-neutral-600 space-y-2 font-sans font-light">
            {activeTab === 'craft' && (
              <div>
                <p className="font-semibold text-neutral-800 mb-1">Hand-Embellishing Specifications:</p>
                <p>{product.embroidery || "Exquisite hand embroidery executed with tilla wire, gold nakshi thread, and micro-pearls."}</p>
                <p className="mt-2 text-[#856423] font-serif">Each HUMA MANAN dress takes our certified karigars roughly 4 to 12 weeks of meticulous focus to prepare.</p>
              </div>
            )}

            {activeTab === 'fabric' && (
              <div>
                <p><strong className="text-neutral-800">Composition:</strong> {product.fabric}</p>
                <p className="mt-1"><strong className="text-neutral-800">Care Instruction:</strong> {product.care}</p>
                <p className="mt-2 text-neutral-500 font-light">Recommended storage is flat, wrapped in protective acid-free muslin paper to prevent tilla oxidation.</p>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-neutral-800 font-semibold">
                  <Truck className="w-3.5 h-3.5 text-[#c49a45]" />
                  <span>Complimentary Shipping & Delivery Policy</span>
                </p>
                <p><strong>Pakistan Clients:</strong> Free shipping with Cash on Delivery (COD) available nationwide. Expected delivery within 15-20 business days.</p>
                <p><strong>International Clients:</strong> Express shipping via DHL. Expected delivery time is 4-6 weeks.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
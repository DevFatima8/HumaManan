// src/components/ProductGrid.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/utils/format';
import { Eye, Scissors, Tag } from 'lucide-react';
import { Product } from '@/data/products';

interface ProductGridProps {
  initialProducts: Product[];
}

export default function ProductGrid({ initialProducts }: ProductGridProps) {
  const { currency, discountsList } = useStore();

  // Categorization States
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('All');
  const [hoveredProductId, setHoveredProductId] = useState<string | number | null>(null);

  // Derive unique values
  const categories = ['All', 'Women', 'Kids', 'Men'];

  const subcategories = ['All', ...Array.from(new Set(
    initialProducts
      .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
      .map(p => p.subcategory)
  ))];

  // Reset sub-level filter if primary level changes
  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setSelectedSubcategory('All');
  };

  // Filter products
  const filteredProducts = initialProducts.filter(product => {
    const matchCat = selectedCategory === 'All' || product.category === selectedCategory;
    const matchSub = selectedSubcategory === 'All' || product.subcategory === selectedSubcategory;
    return matchCat && matchSub;
  });

  // Helper to get product ID as string
  const getProductId = (product: any): string => {
    return String(product._id || product.id);
  };

  return (
    <section id="featured-collections" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-3 animate-fade-in">
        <span className="text-xs uppercase tracking-[0.3em] text-[#c49a45] font-serif font-semibold block">
          ✦ Selected Designer Masterpieces ✦
        </span>
        <h2 className="font-serif text-3xl sm:text-5xl text-[#121212] tracking-[0.1em] font-light">
          THE HUMA MANAN COUTURE
        </h2>
        <div className="w-24 h-[1px] bg-[#ebdcb9] mx-auto my-4" />
        <p className="text-xs text-neutral-500 tracking-wider uppercase leading-relaxed max-w-xl mx-auto">
          Explore our pristine categories and premium handcrafted traditional silhouettes.
        </p>
      </div>

      {/* FILTER COMPONENT */}
      <div className="bg-[#faf9f6] border border-[#ebdcb9] rounded-lg p-6 mb-12 space-y-6 shadow-xs animate-fade-in">

        <div className="space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-[#c49a45] font-mono block">Category</span>
          <div className="flex flex-wrap gap-2.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-2 rounded text-xs uppercase tracking-[0.2em] font-serif font-semibold transition-all duration-300 cursor-pointer ${selectedCategory === cat
                  ? 'bg-[#121212] text-[#f2e6d0] border border-[#121212] scale-102 font-bold'
                  : 'bg-white text-neutral-600 border border-[#ebdcb9]/60 hover:border-[#c49a45] hover:text-[#c49a45]'
                  }`}
              >
                {cat === 'All' ? 'All Collections' : cat}
              </button>
            ))}
          </div>
        </div>

        {subcategories.length > 1 && (
          <div className="space-y-2 pt-2 border-t border-dashed border-[#ebdcb9]/40">
            <span className="text-[10px] uppercase tracking-widest text-[#c49a45] font-mono block">Subcategory</span>
            <div className="flex flex-wrap gap-2">
              {subcategories.map((subcat) => (
                <button
                  key={subcat}
                  onClick={() => setSelectedSubcategory(subcat)}
                  className={`px-3 py-1.5 rounded text-[11px] uppercase tracking-[0.15em] transition-all duration-300 cursor-pointer ${selectedSubcategory === subcat
                    ? 'bg-[#c49a45] text-white font-bold'
                    : 'bg-white text-neutral-500 border border-[#ebdcb9]/40 hover:text-[#121212]'
                    }`}
                >
                  {subcat === 'All' ? 'All Styles' : subcat}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Catalog Active Filter Summary */}
      <div className="flex justify-between items-center text-xs text-neutral-500 mb-8 border-b border-neutral-100 pb-3 font-mono">
        <div>
          Showing <span className="font-bold text-[#121212]">{filteredProducts.length}</span> Handcrafted Outfits
        </div>
        <div className="flex gap-2">
          {selectedCategory !== 'All' && <span className="bg-[#ebdcb9]/30 text-[#856423] px-2 py-0.5 rounded text-[10px]">{selectedCategory}</span>}
          {selectedSubcategory !== 'All' && <span className="bg-[#ebdcb9]/30 text-[#856423] px-2 py-0.5 rounded text-[10px]">{selectedSubcategory}</span>}
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {filteredProducts.map((product) => {
          const productId = getProductId(product);
          const isHovered = hoveredProductId === productId;

          // Original Prices
          const pkrOriginal = product.pkrPrice;
          const usdOriginal = product.usdPrice;

          // Check if there is an active discount - convert both to string for comparison
          const discountInfo = discountsList.find(d => {
            const dProductId = d.productId || d.id;
            return String(dProductId) === String(productId);
          });

          // Calculate discounted prices
          const pkrPrice = discountInfo ? Math.round(pkrOriginal * (1 - discountInfo.discountPercent / 100)) : pkrOriginal;
          const usdPrice = discountInfo ? Math.round(usdOriginal * (1 - discountInfo.discountPercent / 100)) : usdOriginal;

          const displayPrice = currency === 'PKR' ? pkrPrice : usdPrice;
          const displayOriginalPrice = currency === 'PKR' ? pkrOriginal : usdOriginal;

          const mainImage = product.images[0];
          const hoverImage = product.images[1] || product.images[0];

          return (
            <div
              key={productId}
              className="group flex flex-col h-full bg-[#faf9f6] animate-fade-in"
              onMouseEnter={() => setHoveredProductId(productId)}
              onMouseLeave={() => setHoveredProductId(null)}
            >
              {/* Product Image Container */}
              <div className="relative aspect-[1/2] overflow-hidden rounded bg-neutral-100 border border-[#ebdcb9]/40 shadow-xs mb-5">

                {discountInfo ? (
                  <span className="absolute top-4 left-4 z-10 bg-red-600 border border-red-400 text-white font-serif uppercase tracking-widest text-[9px] px-2.5 py-1 rounded flex items-center gap-1 font-bold shadow">
                    <Tag className="w-3 h-3" />
                    <span>{discountInfo.discountPercent}% OFF</span>
                  </span>
                ) : product.isFeatured ? (
                  <span className="absolute top-4 left-4 z-10 bg-[#121212]/90 border border-[#c49a45]/40 text-[#ebdcb9] font-serif uppercase tracking-widest text-[9px] px-2.5 py-1 rounded">
                    Featured Craft
                  </span>
                ) : null}

                <span className="absolute top-4 right-4 z-10 bg-[#c49a45] text-white tracking-widest text-[8px] uppercase px-2.5 py-1 rounded font-medium font-mono">
                  {product.subcategory}
                </span>

                <Link href={`/product/${productId}`} className="block w-full h-full relative cursor-pointer">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className={`w-full h-full object-cover object-top transition-all duration-1000 ease-out ${isHovered ? 'opacity-0 scale-102 blur-xs' : 'opacity-100 scale-100'
                      }`}
                  />
                  <img
                    src={hoverImage}
                    alt={`${product.name} embroidery close view`}
                    className={`absolute inset-0 w-full h-full object-cover object-top transition-all duration-1000 ease-out ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
                      }`}
                  />
                </Link>

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-[85%] bg-[#121212]/95 backdrop-blur-md border border-[#c49a45]/30 text-[#f2e6d0] text-[10px] uppercase tracking-widest py-3 px-4 text-center rounded opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex justify-between items-center">
                  <Link href={`/product/${productId}`} className="flex items-center gap-1.5 hover:text-white font-serif tracking-wider w-full justify-center">
                    <Eye className="w-3.5 h-3.5 text-[#c49a45]" />
                    <span>View Full Dress & 10 Images</span>
                  </Link>
                </div>
              </div>

              {/* Product Metadata */}
              <div className="flex-1 flex flex-col justify-between px-1">
                <div>
                  <div className="flex justify-between items-baseline gap-2 text-[9px] text-neutral-400 font-mono uppercase tracking-widest mb-1 font-semibold">
                    <span>{product.category} ✦ {product.subcategory}</span>
                    <span>{product.sku}</span>
                  </div>

                  <Link href={`/product/${productId}`} className="group-hover:text-[#c49a45] transition-colors cursor-pointer block">
                    <h3 className="font-serif text-base text-[#121212] font-bold tracking-wide leading-snug">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-neutral-500 line-clamp-2 mt-2 leading-relaxed font-light">
                    {product.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#ebdcb9]/20 flex justify-between items-center font-sans">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-base font-bold text-[#c49a45]">
                        {formatPrice(displayPrice, currency)}
                      </span>
                      {discountInfo && (
                        <span className="text-[11px] text-neutral-400 line-through">
                          {formatPrice(displayOriginalPrice, currency)}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      {currency === 'PKR' ? `~ $${usdPrice} USD` : `~ Rs. ${pkrPrice.toLocaleString()} PKR`}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[10px] text-neutral-600 bg-[#ebdcb9]/20 px-2.5 py-1 rounded">
                    <Scissors className="w-3 h-3 text-[#c49a45]" />
                    <span>XS - XL</span>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </section>
  );
}
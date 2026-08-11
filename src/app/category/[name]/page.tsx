// app/category/[name]/page.tsx
"use client";

import React, { use } from 'react';
import { useStore } from '@/context/StoreContext';
import ProductGrid from '@/components/ProductGrid';
import Link from 'next/link';
import { ArrowLeft, Users, Baby, UsersRound } from 'lucide-react';

interface CategoryPageProps {
  params: Promise<{ name: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = use(params);
  const rawCategoryName = decodeURIComponent(resolvedParams.name);

  const { productsList } = useStore();

  const categoryProducts = productsList.filter(
    p => p.category.toLowerCase() === rawCategoryName.toLowerCase()
  );

  // Get subcategories for this category
  const subcategories = [...new Set(categoryProducts.map(p => p.subcategory))];

  let title = `${rawCategoryName}`;
  let desc = `Explore our premium ${rawCategoryName} collection.`;
  let icon = null;

  if (rawCategoryName === 'Women') {
    title = "Women's Luxury Collection";
    desc = 'Discover our exquisite range of lehengas, maxis, pishwas, formal wear, and ready-to-wear ensembles. Each piece is handcrafted with traditional zardozi and tilla embroidery.';
    icon = <Users className="w-6 h-6 text-[#c49a45]" />;
  } else if (rawCategoryName === 'Kids') {
    title = "Kids Premium Collection";
    desc = 'Adorable and elegant outfits for your little ones. From beautiful frocks to mini lehengas and traditional wear, perfect for weddings and family celebrations.';
    icon = <Baby className="w-6 h-6 text-[#c49a45]" />;
  } else if (rawCategoryName === 'Men') {
    title = "Men's Luxury Collection";
    desc = 'Premium sherwanis, shalwar kameez, and groom wear crafted with attention to detail. Perfect for weddings, formal events, and traditional gatherings.';
    icon = <UsersRound className="w-6 h-6 text-[#c49a45]" />;
  }

  return (
    <div className="bg-[#faf9f6] min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">

        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#3a3528] hover:text-[#c49a45] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Collections</span>
          </Link>
        </div>

        <div className="bg-[#121212] text-[#f2e6d0] border border-[#c49a45]/30 rounded p-8 sm:p-12 text-center space-y-4 mb-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#c49a45_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="flex items-center justify-center gap-3">
            {icon}
            <span className="text-[10px] tracking-[0.3em] text-[#ebdcb9] uppercase block font-serif">
              Atelier Huma Manan Couture
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-wide font-light">
            {title.toUpperCase()}
          </h1>
          <p className="text-xs text-neutral-300 tracking-wider max-w-2xl mx-auto leading-relaxed font-light">
            {desc}
          </p>

          {/* Subcategory Chips */}
          {subcategories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 pt-4">
              {subcategories.map((sub) => (
                <span key={sub} className="text-[10px] border border-[#c49a45]/40 text-[#ebdcb9] px-3 py-1 rounded-full bg-[#c49a45]/5">
                  {sub}
                </span>
              ))}
            </div>
          )}

          <div className="inline-block text-[9px] border border-[#c49a45]/40 text-[#ebdcb9] px-3 py-1 rounded tracking-[0.2em] uppercase bg-[#c49a45]/5">
            {categoryProducts.length} Couture Masterpieces Available
          </div>
        </div>

        {categoryProducts.length === 0 ? (
          <div className="py-24 text-center bg-white border border-neutral-100 rounded">
            <p className="font-serif text-lg text-neutral-600">No items available in this category currently.</p>
            <p className="text-xs text-neutral-400 mt-1">Our master artisans are hard at work designing new luxury outfits.</p>
            <Link
              href="/"
              className="mt-6 inline-block px-6 py-3 bg-[#c49a45] hover:bg-black text-white text-xs uppercase tracking-widest font-semibold transition-all rounded"
            >
              Browse All Collections
            </Link>
          </div>
        ) : (
          <ProductGrid initialProducts={categoryProducts} />
        )}

      </div>
    </div>
  );
}
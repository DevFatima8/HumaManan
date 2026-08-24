// src/app/page.tsx
"use client";

import React, { useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import ProductSlider from '@/components/ProductSlider';
import Link from 'next/link';
import { Sparkles, Landmark, Users, Baby, UsersRound } from 'lucide-react';

export default function HomePage() {
  const { productsList, refreshData } = useStore();

  // Refresh data on mount
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <div className="bg-[#faf9f6] min-h-screen">
      {/* Hero Banner */}
      <Hero />

      {/* Product Slider - Shows all products */}
      <ProductSlider products={productsList} />

      {/* Category Spotlight Tiles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Women */}
          <div className="relative h-96 group overflow-hidden rounded shadow-sm border border-[#ebdcb9]/40">
            <img
              src="https://images.pexels.com/photos/30167012/pexels-photo-30167012.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=600"
              alt="Women's Collection"
              className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-4 border border-[#c49a45]/20 pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="text-[9px] tracking-[0.25em] text-[#ebdcb9] uppercase font-mono font-bold">The Luxury Edit</span>
              <h3 className="font-serif text-xl tracking-wider text-white font-semibold flex items-center gap-2">
                <Users className="w-5 h-5" /> WOMEN
              </h3>
              <p className="text-[11px] text-neutral-300 font-light leading-relaxed line-clamp-2">
                Lehengas • Maxis • Pishwas • Formal • Ready to Wear
              </p>
              <Link
                href="/category/Women"
                className="inline-block text-[11px] uppercase tracking-widest text-[#ebdcb9] hover:text-white font-serif font-bold pt-1 border-b border-[#c49a45]"
              >
                View Collection ✦
              </Link>
            </div>
          </div>

          {/* Kids */}
          <div className="relative h-96 group overflow-hidden rounded shadow-sm border border-[#ebdcb9]/40">
            <img
              src="kids.jpeg"
              alt="Kids Collection"
              className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-4 border border-[#c49a45]/20 pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="text-[9px] tracking-[0.25em] text-[#ebdcb9] uppercase font-mono font-bold">Little Royals</span>
              <h3 className="font-serif text-xl tracking-wider text-white font-semibold flex items-center gap-2">
                <Baby className="w-5 h-5" /> KIDS
              </h3>
              <p className="text-[11px] text-neutral-300 font-light leading-relaxed line-clamp-2">
                Frocks • Lehengas • Dresses • Traditional Wear
              </p>
              <Link
                href="/category/Kids"
                className="inline-block text-[11px] uppercase tracking-widest text-[#ebdcb9] hover:text-white font-serif font-bold pt-1 border-b border-[#c49a45]"
              >
                View Collection ✦
              </Link>
            </div>
          </div>

          {/* Men */}
          <div className="relative h-96 group overflow-hidden rounded shadow-sm border border-[#ebdcb9]/40">
            <img
              src="men.webp"
              alt="Men's Collection"
              className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute inset-4 border border-[#c49a45]/20 pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <span className="text-[9px] tracking-[0.25em] text-[#ebdcb9] uppercase font-mono font-bold">The Groom Collection</span>
              <h3 className="font-serif text-xl tracking-wider text-white font-semibold flex items-center gap-2">
                <UsersRound className="w-5 h-5" /> MEN
              </h3>
              <p className="text-[11px] text-neutral-300 font-light leading-relaxed line-clamp-2">
                Sherwanis • Shalwar Kameez • Groom Wear
              </p>
              <Link
                href="/category/Men"
                className="inline-block text-[11px] uppercase tracking-widest text-[#ebdcb9] hover:text-white font-serif font-bold pt-1 border-b border-[#c49a45]"
              >
                View Collection ✦
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* All Products Grid */}
      <ProductGrid initialProducts={productsList} />

      {/* Artisan Heritage Section */}
      <section className="bg-[#121212] text-[#f2e6d0] py-24 px-4 sm:px-6 lg:px-8 border-t border-[#c49a45]/25 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#c49a45_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-6xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#ebdcb9]/15 border border-[#ebdcb9]/30 px-3.5 py-1 rounded-full">
              <Landmark className="w-3.5 h-3.5 text-[#ebdcb9]" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#ebdcb9] font-semibold">Our Legacy & Artistry</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#faf9f6] tracking-[0.1em] font-light leading-tight">
              4,000 Hours of <br />
              <span className="font-serif italic font-extralight text-[#ebdcb9] tracking-normal">Dedicated Hand Craftsmanship</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light font-sans">
              At the HUMA MANAN Atelier, we hold high the ancient traditions of subcontinental bridal craftsmanship. Every single motif is drawn by hand, transferred onto premium fabrics over large embroidery frames (Addas), and intricately sewn using authentic metallic wires (Tilla), raw gemstones, glass beads, and micro-pearls.
            </p>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light font-sans">
              Just like the luxury archives of Kanwal Malik and Faiza Saqlain, we ensure each panel of your lehenga or maxi falls with royal flare. There are no compromises on fabric quality—we use 100% pure raw silk, custom tissue silk, and hand-woven organza sourced from local master weavers.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-[#ebdcb9]/15">
              <div>
                <span className="block font-serif text-xl sm:text-2xl text-[#c49a45] font-bold">100+</span>
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest block mt-1">Master Karigars</span>
              </div>
              <div>
                <span className="block font-serif text-xl sm:text-2xl text-[#c49a45] font-bold">30+</span>
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest block mt-1">Global Cities</span>
              </div>
              <div>
                <span className="block font-serif text-xl sm:text-2xl text-[#c49a45] font-bold">100%</span>
                <span className="text-[9px] text-neutral-400 uppercase tracking-widest block mt-1">Pure Silk & Net</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-4 border border-[#ebdcb9]/30 -translate-x-4 translate-y-4 rounded z-0" />
            <div className="relative aspect-[2/3] bg-neutral-900 rounded overflow-hidden shadow-2xl z-10 border border-[#ebdcb9]/40">
              <img
                src="https://images.pexels.com/photos/8497817/pexels-photo-8497817.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800"
                alt="Intricate embroidery craft"
                className="w-full h-full object-cover object-top opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white text-center">
                <span className="font-serif italic text-xs text-[#ebdcb9]">&quot;Heritage lives on in details that breathe romance.&quot;</span>
                <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-400 mt-1">— Atelier Huma Manan</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
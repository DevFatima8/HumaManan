"use client";

import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <div className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with elegant slow zoom animation */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/38781253/pexels-photo-38781253.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1600&w=1200"
          alt="HUMA MANAN Bridal Couture"
          className="w-full h-full object-cover opacity-65 scale-105 animate-subtle-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      </div>

      {/* Decorative Gold Frame Border */}
      <div className="absolute inset-4 sm:inset-6 border border-[#c49a45]/30 z-10 pointer-events-none flex flex-col justify-between p-4">
        <div className="flex justify-between text-[#ebdcb9]/60 text-[9px] tracking-[0.3em] uppercase font-mono">
          <span>HUMA MANAN © 2026</span>
          <span>ATELIER COUTURE</span>
        </div>
        <div className="flex justify-between text-[#ebdcb9]/60 text-[9px] tracking-[0.3em] uppercase font-mono">
          <span>HANDMADE IN PAKISTAN</span>
          <span>SHIPPING WORLDWIDE</span>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 text-center max-w-4xl px-6 space-y-6">
        <div className="inline-flex items-center gap-2 bg-[#ebdcb9]/15 border border-[#ebdcb9]/30 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#ebdcb9]" />
          <span className="text-[10px] text-[#f2e6d0] uppercase tracking-[0.25em] font-medium">
            The Royal Bridal Edit &apos;26
          </span>
        </div>

        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl text-white tracking-[0.15em] font-light leading-tight">
          NUR-E-HARAM <br />
          <span className="font-serif italic font-extralight text-[#ebdcb9] tracking-normal">Bridal Collection</span>
        </h1>

        <p className="text-xs sm:text-sm text-neutral-200 tracking-widest max-w-xl mx-auto leading-relaxed font-light uppercase">
          An opulent legacy of handwoven silk, premium tissue, and crystalline zardozi embroidery. Designed for the unforgettable modern bride.
        </p>

        <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="#featured-collections"
            className="w-full sm:w-auto px-8 py-3.5 bg-[#c49a45] hover:bg-white text-white hover:text-black text-xs uppercase tracking-[0.2em] font-serif font-bold transition-all duration-300 rounded shadow-lg border border-[#c49a45] hover:border-white flex items-center justify-center gap-2"
          >
            <span>Explore Collection</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/category/Ready to Wear"
            className="w-full sm:w-auto px-8 py-3.5 bg-transparent hover:bg-white/10 text-[#f2e6d0] hover:text-white text-xs uppercase tracking-[0.2em] font-serif font-semibold transition-all duration-300 rounded border border-[#ebdcb9]/40 flex items-center justify-center"
          >
            Shop Ready To Wear
          </Link>
        </div>
      </div>

      {/* Elegant Scroll Down Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1">
        <span className="text-[#ebdcb9]/60 text-[9px] uppercase tracking-[0.3em] font-mono">Scroll</span>
        <div className="w-1 h-8 bg-gradient-to-b from-[#ebdcb9] to-transparent animate-bounce rounded-full" />
      </div>
    </div>
  );
}

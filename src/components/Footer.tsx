"use client";

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Sparkles, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-[#e6dfd3] border-t border-[#c49a45]/30">

      {/* Upper Luxury Trust Banners */}
      <div className="border-b border-[#c49a45]/20 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-full bg-[#c49a45]/10 text-[#c49a45] border border-[#c49a45]/20 flex-shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs uppercase tracking-widest text-[#f2e6d0] font-semibold">100% Handcrafted Couture</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Elaborate zardozi, tilla & dabka work by certified master karigars.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-full bg-[#c49a45]/10 text-[#c49a45] border border-[#c49a45]/20 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs uppercase tracking-widest text-[#f2e6d0] font-semibold">Global Delivery</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Secure worldwide shipping to USA, UK, UAE & Europe via DHL.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-full bg-[#c49a45]/10 text-[#c49a45] border border-[#c49a45]/20 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs uppercase tracking-widest text-[#f2e6d0] font-semibold">Cash on Delivery</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">COD checkout option available for immediate delivery within Pakistan.</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-full bg-[#c49a45]/10 text-[#c49a45] border border-[#c49a45]/20 flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-serif text-xs uppercase tracking-widest text-[#f2e6d0] font-semibold">Original Photography</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">Stunning, uncropped and uncompressed high-fashion catalogs.</p>
            </div>
          </div>

        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">

          {/* Brand Bio */}
          <div className="space-y-4">
            <h3 className="font-serif text-xl tracking-[0.2em] text-[#faf9f6]">HUMA/MANAN</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Inspired by the pure essence of timeless heritage. HUMA MANAN craft houses the most intricate bridal wear, formal maxis, and luxury sarees, designed with unmatched hand embellishments of traditional subcontinental karigari.
            </p>
            <div className="pt-2 text-xs text-[#c49a45] font-serif tracking-widest">
              LAHORE • ISLAMABAD • DUBAI • NEW YORK
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm tracking-widest uppercase text-[#faf9f6] border-b border-[#c49a45]/20 pb-2 mb-4">
              Browse Collections
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link href="/category/Bridal" className="text-neutral-400 hover:text-[#c49a45] transition-colors">
                  Bridal Collection
                </Link>
              </li>
              <li>
                <Link href="/category/Formal" className="text-neutral-400 hover:text-[#c49a45] transition-colors">
                  Formal wear
                </Link>
              </li>
              <li>
                <Link href="/category/Ready to Wear" className="text-neutral-400 hover:text-[#c49a45] transition-colors">
                  Ready to Wear
                </Link>
              </li>
              <li>
                <Link href="/ad/m/in" className="text-neutral-400 hover:text-[#c49a45] transition-colors">
                  Client Order Tracking Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Garment Care */}
          <div>
            <h4 className="font-serif text-sm tracking-widest uppercase text-[#faf9f6] border-b border-[#c49a45]/20 pb-2 mb-4">
              Care & Service
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400">
              <li>
                <span className="text-[#c49a45]">✦ Professional Dry Cleaning Only</span>
              </li>
              <li>
                <span>Always store heavily-worked outfits in breathable muslin bags. Avoid direct contact with perfume sprays or moist air.</span>
              </li>
            </ul>
          </div>

          {/* Atelier Contact Details */}
          <div>
            <h4 className="font-serif text-sm tracking-widest uppercase text-[#faf9f6] border-b border-[#c49a45]/20 pb-2 mb-4">
              The Atelier
            </h4>
            <ul className="space-y-3.5 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#c49a45] flex-shrink-0" />
                <span className="text-neutral-400">
                  92-C, DHA Phase 5, Lahore, Pakistan <br />
                  <span className="text-[10px] text-neutral-500">(By Appointment Only)</span>
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#c49a45] flex-shrink-0" />
                <span className="text-neutral-400">+92 300 011 2233</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#c49a45] flex-shrink-0" />
                <span className="text-neutral-400">contact@humamanan.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#c49a45]/15 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500 gap-4">
          <p>© {new Date().getFullYear()} HUMA MANAN Couture. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/ad/m/in" className="hover:text-white transition-colors">Management Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

// src/app/product/[id]/page.tsx (Alternative - with useMemo)
"use client";

import React, { use, useEffect, useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ProductDetailClient from './ProductDetailClient';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = use(params);
  const productId = resolvedParams.id;

  const { productsList } = useStore();
  const [loading, setLoading] = useState(true);

  // Use useMemo to find product - only recalculates when productsList or productId changes
  const product = useMemo(() => {
    return productsList.find((p: any) => {
      const pId = p._id || p.id;
      return String(pId) === productId;
    }) || null;
  }, [productsList, productId]);

  // Set loading to false once product is found or productsList is loaded
  useEffect(() => {
    if (productsList.length > 0 || product !== null) {
      queueMicrotask(() => setLoading(false));
    }
  }, [productsList, product]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-[#faf9f6] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#c49a45] animate-spin mx-auto" />
          <p className="text-xs text-neutral-400 mt-4">Loading masterpiece...</p>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!product) {
    return (
      <div className="bg-[#faf9f6] min-h-screen py-24 text-center px-4">
        <div className="max-w-md mx-auto">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔍</span>
          </div>
          <h2 className="font-serif text-2xl text-[#121212]">Masterpiece Not Found</h2>
          <p className="text-sm text-neutral-400 mt-2">
            The requested outfit has been archived or does not exist in our collection.
          </p>
          <p className="text-xs text-neutral-400 mt-1">
            Product ID: {productId}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block px-6 py-3 bg-[#c49a45] hover:bg-[#121212] text-white text-xs uppercase tracking-widest font-serif font-bold transition-all rounded"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f6] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#3a3528] hover:text-[#c49a45] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Collections</span>
          </Link>

          <div className="text-xs text-neutral-400 font-mono">
            Atelier Huma Manan / {product.category}s / {product.sku}
          </div>
        </div>

        {/* Product Detail Client */}
        <ProductDetailClient product={product} />

      </div>
    </div>
  );
}
// src/components/ProductSlider.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductSliderProps {
    products: any[];
}

export default function ProductSlider({ products }: ProductSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Filter products with images
    const validProducts = products.filter(p => p.images && p.images.length > 0);

    // Group products by category for alternating pattern
    const getAlternatingProducts = () => {
        const women = validProducts.filter(p => p.category === 'Women');
        const kids = validProducts.filter(p => p.category === 'Kids');
        const men = validProducts.filter(p => p.category === 'Men');

        const maxLength = Math.max(women.length, kids.length, men.length);
        const result: any[] = [];

        for (let i = 0; i < maxLength; i++) {
            if (women[i]) result.push(women[i]);
            if (kids[i]) result.push(kids[i]);
            if (men[i]) result.push(men[i]);
        }

        return result;
    };

    const sliderProducts = getAlternatingProducts();

    // Auto-slide every 4 seconds
    useEffect(() => {
        if (sliderProducts.length === 0) return;

        const interval = setInterval(() => {
            if (!isTransitioning) {
                setCurrentIndex((prev) => (prev + 1) % sliderProducts.length);
            }
        }, 4000);

        return () => clearInterval(interval);
    }, [sliderProducts.length, isTransitioning]);

    const goToPrevious = () => {
        if (isTransitioning) return;
        setCurrentIndex((prev) => (prev - 1 + sliderProducts.length) % sliderProducts.length);
    };

    const goToNext = () => {
        if (isTransitioning) return;
        setCurrentIndex((prev) => (prev + 1) % sliderProducts.length);
    };

    const goToSlide = (index: number) => {
        if (isTransitioning || index === currentIndex) return;
        setCurrentIndex(index);
    };

    // Handle transition state
    const handleTransitionStart = () => {
        setIsTransitioning(true);
    };

    const handleTransitionEnd = () => {
        setIsTransitioning(false);
    };

    // If no products
    if (sliderProducts.length === 0) {
        return (
            <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="bg-[#121212] rounded-lg p-8 sm:p-12 text-center border border-[#c49a45]/30">
                    <p className="text-[#f2e6d0] font-serif text-base sm:text-lg">No products available</p>
                    <p className="text-neutral-400 text-xs sm:text-sm mt-2">Add products from admin panel</p>
                </div>
            </section>
        );
    }

    const currentProduct = sliderProducts[currentIndex];
    const productId = currentProduct._id || currentProduct.id;

    // Get category color
    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Women': return 'bg-pink-500/90 border-pink-300';
            case 'Kids': return 'bg-blue-500/90 border-blue-300';
            case 'Men': return 'bg-emerald-500/90 border-emerald-300';
            default: return 'bg-neutral-500/90 border-neutral-300';
        }
    };

    const getCategoryDotColor = (category: string) => {
        switch (category) {
            case 'Women': return 'bg-pink-400';
            case 'Kids': return 'bg-blue-400';
            case 'Men': return 'bg-emerald-400';
            default: return 'bg-neutral-400';
        }
    };

    return (
        <section className="py-4 sm:py-6 md:py-8 w-full max-w-full mx-auto overflow-hidden">
            {/* Header with Title - Responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 sm:mb-4 px-3 sm:px-4 md:px-6 lg:px-8">
                <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-[#121212] tracking-wide">
                    <span className="text-[#c49a45]">✦</span> Featured Collection
                </h2>
                <div className="text-[10px] sm:text-xs text-neutral-400 font-mono">
                    {sliderProducts.length} items • Auto-slide
                </div>
            </div>

            {/* Main Slider - Full Screen Style Like Clothing Brands */}
            <div className="relative w-full bg-[#0a0a0a] overflow-hidden">
                {/* Fixed Height Image Container - Prevents layout shift across image transitions */}
                <div className="relative w-full h-[170vh] sm:h-[150vh] md:h-[170vh] lg:h-[160vh] xl:h-[170vh] bg-neutral-900 overflow-hidden">

                    {/* Slide Wrapper with Transition */}
                    <div
                        className="relative w-full h-full transition-opacity duration-700 ease-in-out"
                        onTransitionStart={handleTransitionStart}
                        onTransitionEnd={handleTransitionEnd}
                    >
                        {/* Main Image - Full width, full height with object-cover */}
                        <Link
                            href={`/product/${productId}`}
                            className="block w-full h-full cursor-pointer"
                        >
                            <img
                                src={currentProduct.images[0]}
                                alt={currentProduct.name}
                                className="w-full h-full object-cover object-center bg-[#0a0a0a]"
                            />
                        </Link>

                        {/* Category Badge - Top Left - Responsive */}
                        <div className={`absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-[8px] sm:text-[9px] md:text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border shadow-lg ${getCategoryColor(currentProduct.category)} text-white`}>
                            {currentProduct.category}
                        </div>

                        {/* Slide Counter - Top Right - Responsive */}
                        <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-black/70 backdrop-blur-sm text-white text-[8px] sm:text-[9px] md:text-[10px] px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full font-mono border border-white/10">
                            {currentIndex + 1} / {sliderProducts.length}
                        </div>

                        {/* Product Info Overlay - Bottom with Gradient - Responsive */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
                            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 max-w-7xl mx-auto">
                                <div className="w-full sm:w-auto">
                                    <h3 className="text-white font-serif text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold leading-tight">
                                        {currentProduct.name}
                                    </h3>
                                    <p className="text-neutral-300 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">
                                        {currentProduct.subcategory} • {currentProduct.sku}
                                    </p>
                                    <p className="text-neutral-400 text-[8px] sm:text-[10px] md:text-xs mt-0.5 sm:mt-1 max-w-xl line-clamp-1 sm:line-clamp-2 hidden xs:block">
                                        {currentProduct.description}
                                    </p>
                                </div>
                                <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                                    <span className="text-[#c49a45] font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
                                        Rs. {currentProduct.pkrPrice.toLocaleString()}
                                    </span>
                                    <p className="text-neutral-400 text-[8px] sm:text-[9px] md:text-[10px]">PKR</p>
                                    <span className="text-neutral-500 text-[7px] sm:text-[8px] md:text-[9px]">
                                        ~${currentProduct.usdPrice} USD
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Auto-slide Indicator - Bottom Right - Responsive */}
                        <div className="absolute bottom-16 sm:bottom-20 md:bottom-24 right-2 sm:right-3 md:right-4 bg-black/50 backdrop-blur-sm text-white text-[7px] sm:text-[8px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full font-mono flex items-center gap-1 sm:gap-1.5">
                            <span className="inline-block w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400 animate-pulse" />
                            Auto-slide
                        </div>
                    </div>

                    {/* Navigation Arrows - Responsive */}
                    {sliderProducts.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-1 sm:left-2 md:left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full transition-all z-10 hover:scale-110 border border-white/20 backdrop-blur-sm"
                                aria-label="Previous slide"
                                disabled={isTransitioning}
                            >
                                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                            </button>
                            <button
                                onClick={goToNext}
                                className="absolute right-1 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 sm:p-2 md:p-2.5 lg:p-3 rounded-full transition-all z-10 hover:scale-110 border border-white/20 backdrop-blur-sm"
                                aria-label="Next slide"
                                disabled={isTransitioning}
                            >
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                            </button>
                        </>
                    )}

                    {/* Dots Indicator - Bottom Center - Responsive */}
                    {sliderProducts.length > 1 && (
                        <div className="absolute bottom-14 sm:bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
                            {sliderProducts.slice(0, 15).map((p, idx) => {
                                const isActive = idx === currentIndex;
                                const dotColor = getCategoryDotColor(p.category);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => goToSlide(idx)}
                                        className={`transition-all duration-300 ${isActive
                                            ? `w-4 sm:w-5 md:w-6 lg:w-8 h-1.5 sm:h-2 rounded-full ${dotColor} shadow-lg shadow-${dotColor}/30`
                                            : `w-1.5 sm:w-2 md:w-2.5 h-1.5 sm:h-2 rounded-full ${dotColor}/30 hover:${dotColor}/60`
                                            }`}
                                        aria-label={`Go to slide ${idx + 1}`}
                                        disabled={isTransitioning}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Thumbnail Preview Strip - Always Visible - Responsive */}
                {sliderProducts.length > 3 && (
                    <div className="bg-[#121212]/95 backdrop-blur-sm border-t border-[#c49a45]/20 py-1.5 sm:py-2 md:py-2.5 lg:py-3 px-2 sm:px-3 md:px-4 overflow-x-auto no-scrollbar">
                        <div className="flex gap-1.5 sm:gap-2 md:gap-2.5 lg:gap-3 max-w-7xl mx-auto">
                            {sliderProducts.map((p, idx) => {
                                const isActive = idx === currentIndex;
                                const categoryColor = p.category === 'Women' ? 'ring-pink-400' :
                                    p.category === 'Kids' ? 'ring-blue-400' :
                                        'ring-emerald-400';

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => goToSlide(idx)}
                                        className={`relative flex-shrink-0 w-12 sm:w-14 md:w-16 lg:w-20 xl:w-24 aspect-[3/4] rounded overflow-hidden transition-all duration-300 cursor-pointer
                                            ${isActive
                                                ? `ring-1 sm:ring-2 ${categoryColor} scale-105 shadow-lg shadow-${categoryColor}/20`
                                                : 'opacity-40 sm:opacity-50 hover:opacity-80 sm:hover:opacity-100 hover:scale-102'
                                            }`}
                                        disabled={isTransitioning}
                                    >
                                        <img
                                            src={p.images[0]}
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {/* Category color bar at bottom */}
                                        <div className={`absolute bottom-0 left-0 right-0 h-0.5 sm:h-1 ${p.category === 'Women' ? 'bg-pink-400' :
                                            p.category === 'Kids' ? 'bg-blue-400' :
                                                'bg-emerald-400'
                                            }`} />
                                        {/* Active indicator overlay */}
                                        {isActive && (
                                            <div className="absolute inset-0 ring-1 sm:ring-2 ring-[#c49a45] ring-inset" />
                                        )}
                                        {/* Product name on hover - hidden on mobile */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center p-1">
                                            <span className="text-white text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] font-serif text-center line-clamp-2">
                                                {p.name}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Category Order Indicator - Responsive */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 mt-3 sm:mt-4 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-widest font-mono px-3 sm:px-4">
                <span className="flex items-center gap-1 sm:gap-1.5 text-pink-400">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-pink-400" />
                    Women
                </span>
                <span className="text-neutral-600">→</span>
                <span className="flex items-center gap-1 sm:gap-1.5 text-blue-400">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400" />
                    Kids
                </span>
                <span className="text-neutral-600">→</span>
                <span className="flex items-center gap-1 sm:gap-1.5 text-emerald-400">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
                    Men
                </span>
                <span className="text-neutral-500 text-[6px] sm:text-[7px] md:text-[8px] ml-0.5 sm:ml-1">(alternating)</span>
            </div>
        </section>
    );
}
// src/components/Navbar.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import {
  ShoppingBag,
  Menu,
  X,
  Globe,
  Check,
  Layers,
  Sparkles,
  Users,
  Baby,
  UsersRound,
  ChevronDown,
  Home,
  Tag,
  ShoppingBasket
} from 'lucide-react';

export default function Navbar() {
  const {
    currency,
    setCurrency,
    cart,
    setIsCartOpen,
    ordersList,
    pendingInspirationsCount,
    inspirationsList
  } = useStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const totalCartItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get pending orders count
  useEffect(() => {
    if (ordersList) {
      const pending = ordersList.filter((o: any) => o.status === 'Pending').length;
      setPendingOrdersCount(pending);
    }
  }, [ordersList]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Women', href: '/category/Women', icon: Users },
    { name: 'Kids', href: '/category/Kids', icon: Baby },
    { name: 'Men', href: '/category/Men', icon: UsersRound },
    { name: 'Inspiration', href: '/inspiration', icon: Sparkles },
  ];

  // ============================================
  // ADMIN NAVBAR WITH HAMBURGER MENU (FIXED)
  // ============================================
  if (pathname.startsWith('/admin')) {
    return (
      <header className="sticky top-0 z-50 bg-[#121212] border-b border-[#c49a45]/30 text-[#f2e6d0] shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">

            {/* Left: Branding */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/admin/orders" className="flex flex-col">
                <span className="font-serif text-base sm:text-lg tracking-[0.25em] text-white font-bold leading-none">
                  HUMA/MANAN
                </span>
                <span className="font-serif text-[7px] sm:text-[8px] md:text-[9px] tracking-[0.3em] text-[#c49a45] uppercase">
                  Executive Suite
                </span>
              </Link>
              <span className="hidden xs:inline bg-[#c49a45]/15 border border-[#c49a45]/30 text-[#ebdcb9] px-1.5 sm:px-2.5 py-0.5 rounded text-[8px] sm:text-[10px] font-mono tracking-widest uppercase">
                Admin
              </span>
            </div>

            {/* Center: Desktop Navigation */}
            <nav className="hidden lg:flex space-x-3 xl:space-x-6 text-[10px] sm:text-xs font-semibold tracking-widest uppercase font-serif items-center">
              <Link
                href="/admin/orders"
                className={`hover:text-white transition-colors py-1 flex items-center gap-1.5 ${pathname === '/admin/orders' || pathname === '/admin'
                  ? 'text-[#c49a45] border-b-2 border-[#c49a45]'
                  : 'text-neutral-300'
                  }`}
              >
                Orders
                {pendingOrdersCount > 0 && (
                  <span className="bg-red-500 text-white text-[8px] sm:text-[9px] font-bold rounded-full px-1.5 sm:px-2 py-0.5 min-w-[16px] sm:min-w-[18px] text-center animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>
              <Link
                href="/admin/products"
                className={`hover:text-white transition-colors py-1 ${pathname === '/admin/products'
                  ? 'text-[#c49a45] border-b-2 border-[#c49a45]'
                  : 'text-neutral-300'
                  }`}
              >
                Products
              </Link>
              <Link
                href="/admin/discounts"
                className={`hover:text-white transition-colors py-1 ${pathname === '/admin/discounts'
                  ? 'text-[#c49a45] border-b-2 border-[#c49a45]'
                  : 'text-neutral-300'
                  }`}
              >
                Discounts
              </Link>
              <Link
                href="/admin/inspirations"
                className={`hover:text-white transition-colors py-1 flex items-center gap-1.5 ${pathname === '/admin/inspirations'
                  ? 'text-[#c49a45] border-b-2 border-[#c49a45]'
                  : 'text-neutral-300'
                  }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Inspirations
                {pendingInspirationsCount > 0 && (
                  <span className="bg-amber-500 text-white text-[8px] sm:text-[9px] font-bold rounded-full px-1.5 sm:px-2 py-0.5 min-w-[16px] sm:min-w-[18px] text-center animate-pulse">
                    {pendingInspirationsCount}
                  </span>
                )}
              </Link>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Hamburger Menu Button for Admin */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden text-[#ebdcb9] hover:text-white transition-colors p-1.5"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>

              {/* Back to Store Button */}
              <Link
                href="/"
                className="text-[9px] sm:text-xs uppercase font-serif tracking-[0.15em] border border-[#c49a45]/40 hover:bg-[#c49a45] hover:text-white text-[#ebdcb9] px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded transition-all duration-300 whitespace-nowrap"
              >
                <span className="hidden xs:inline">Back to Store</span>
                <span className="xs:hidden">Store</span>
              </Link>
            </div>

          </div>
        </div>

        {/* Mobile Admin Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#1a1a1a] border-t border-[#c49a45]/20 py-3 px-4 sm:px-6 animate-fade-in">
            <nav className="flex flex-col space-y-1 text-sm font-semibold tracking-widest uppercase font-serif">
              <Link
                href="/admin/orders"
                className={`flex items-center justify-between px-3 py-3 rounded transition-colors ${pathname === '/admin/orders' || pathname === '/admin'
                  ? 'bg-[#c49a45]/20 text-[#c49a45]'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <ShoppingBasket className="w-4 h-4" />
                  Orders
                </span>
                {pendingOrdersCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center animate-pulse">
                    {pendingOrdersCount}
                  </span>
                )}
              </Link>

              <Link
                href="/admin/products"
                className={`flex items-center gap-3 px-3 py-3 rounded transition-colors ${pathname === '/admin/products'
                  ? 'bg-[#c49a45]/20 text-[#c49a45]'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Layers className="w-4 h-4" />
                Products
              </Link>

              <Link
                href="/admin/discounts"
                className={`flex items-center gap-3 px-3 py-3 rounded transition-colors ${pathname === '/admin/discounts'
                  ? 'bg-[#c49a45]/20 text-[#c49a45]'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Tag className="w-4 h-4" />
                Discounts
              </Link>

              <Link
                href="/admin/inspirations"
                className={`flex items-center justify-between px-3 py-3 rounded transition-colors ${pathname === '/admin/inspirations'
                  ? 'bg-[#c49a45]/20 text-[#c49a45]'
                  : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                  }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4" />
                  Inspirations
                </span>
                {pendingInspirationsCount > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center animate-pulse">
                    {pendingInspirationsCount}
                  </span>
                )}
              </Link>

              {/* Divider */}
              <div className="border-t border-[#c49a45]/20 my-2" />

              {/* Back to Store in Mobile */}
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-3 rounded text-neutral-400 hover:bg-white/5 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-xs">← Back to Store</span>
              </Link>
            </nav>
          </div>
        )}
      </header>
    );
  }

  // ============================================
  // STANDARD CLIENT NAVBAR (FIXED RESPONSIVE)
  // ============================================
  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
      ? 'bg-[#faf9f6]/98 backdrop-blur-md shadow-md'
      : 'bg-[#faf9f6]/95 backdrop-blur-sm'
      } border-b border-[#ebdcb9]/40`}>

      {/* Top Announcement Bar - Hidden on mobile */}
      <div className="hidden sm:block bg-[#121212] text-[#f2e6d0] text-[10px] sm:text-[11px] tracking-[0.2em] uppercase py-1.5 sm:py-2.5 px-4 text-center font-serif">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="hidden lg:inline font-sans font-light">Complimentary Worldwide Shipping on Orders Above $1,000</span>
          <span className="mx-auto font-serif italic text-[9px] sm:text-[11px]">Handcrafted Traditional Couture</span>
          <div className="relative hidden md:flex items-center gap-2">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[10px] sm:text-[11px]"
            >
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#ebdcb9]" />
              <span>{currency}</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>

            {currencyDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 bg-black border border-[#ebdcb9]/30 text-white rounded shadow-lg py-1 z-50 w-24 sm:w-28 animate-fade-in">
                <button
                  onClick={() => { setCurrency('PKR'); setCurrencyDropdownOpen(false); }}
                  className="w-full text-left px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span>PKR (Rs.)</span>
                  {currency === 'PKR' && <Check className="w-3 h-3 text-[#ebdcb9]" />}
                </button>
                <button
                  onClick={() => { setCurrency('USD'); setCurrencyDropdownOpen(false); }}
                  className="w-full text-left px-2 sm:px-3 py-1.5 text-[10px] sm:text-xs hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span>USD ($)</span>
                  {currency === 'USD' && <Check className="w-3 h-3 text-[#ebdcb9]" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-18 lg:h-22">

          {/* Mobile Menu Button - Left side */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-[#3a3528] hover:text-[#c49a45] transition-colors p-1.5"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <nav className="hidden md:flex space-x-3 lg:space-x-6 xl:space-x-8 text-[10px] lg:text-xs font-medium tracking-[0.15em] uppercase text-[#3a3528]">
            {navLinks.slice(0, 4).map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`hover:text-[#c49a45] transition-colors relative py-1 flex items-center gap-1 ${isActive ? 'text-[#c49a45] font-semibold border-b border-[#c49a45]' : ''
                    }`}
                >
                  {Icon && <Icon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Brand Logo - Centered */}
          <div className="flex-1 flex justify-center md:flex-initial">
            <Link href="/" className="flex flex-col items-center">
              <span className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-[0.2em] sm:tracking-[0.3em] font-light text-[#121212] select-none hover:opacity-90 transition-opacity">
                HUMA/MANAN
              </span>
              <span className="font-serif text-[6px] sm:text-[7px] md:text-[8px] lg:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] text-[#c49a45] uppercase -mt-0.5 sm:-mt-1 font-semibold">
                Luxury Couture
              </span>
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 md:space-x-3 lg:space-x-4">

            {/* Desktop Right Nav - Hidden on mobile/tablet */}
            <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 xl:space-x-5 text-[10px] lg:text-xs font-medium tracking-[0.15em] uppercase text-[#3a3528]">
              {navLinks.slice(4).map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`hover:text-[#c49a45] transition-colors flex items-center gap-1 ${isActive ? 'text-[#c49a45] font-semibold' : ''
                      }`}
                  >
                    {Icon && <Icon className="w-3 h-3 lg:w-3.5 lg:h-3.5" />}
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Currency Swapper */}
            <div className="md:hidden relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="text-[10px] sm:text-xs font-semibold border border-[#ebdcb9] px-1.5 sm:px-2 py-1 rounded text-[#3a3528] flex items-center gap-0.5"
              >
                <Globe className="w-3 h-3" />
                <span>{currency}</span>
                <ChevronDown className="w-2.5 h-2.5" />
              </button>
              {currencyDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-[#ebdcb9] text-[#121212] rounded shadow-xl py-1 z-50 w-24 animate-fade-in">
                  <button
                    onClick={() => { setCurrency('PKR'); setCurrencyDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-[10px] sm:text-xs hover:bg-[#faf9f6] flex items-center justify-between"
                  >
                    <span>PKR</span>
                    {currency === 'PKR' && <Check className="w-3 h-3 text-[#c49a45]" />}
                  </button>
                  <button
                    onClick={() => { setCurrency('USD'); setCurrencyDropdownOpen(false); }}
                    className="w-full text-left px-3 py-1.5 text-[10px] sm:text-xs hover:bg-[#faf9f6] flex items-center justify-between"
                  >
                    <span>USD</span>
                    {currency === 'USD' && <Check className="w-3 h-3 text-[#c49a45]" />}
                  </button>
                </div>
              )}
            </div>

            {/* Shopping Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 text-[#3a3528] hover:text-[#c49a45] transition-colors cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5.5 lg:h-5.5" />
              {totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#c49a45] text-white text-[8px] sm:text-[9px] lg:text-[10px] font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border border-[#faf9f6]">
                  {totalCartItems > 9 ? '9+' : totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation - For all mobile/tablet devices */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf9f6] border-t border-[#ebdcb9]/40 py-3 px-4 sm:px-6 shadow-lg transition-transform duration-300 animate-fade-in max-h-[80vh] overflow-y-auto">
          <nav className="flex flex-col space-y-0.5 text-sm tracking-widest uppercase font-medium text-[#3a3528]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-2.5 px-3 rounded transition-colors flex items-center gap-3 ${isActive
                    ? 'bg-[#ebdcb9]/30 text-[#c49a45] font-semibold'
                    : 'hover:bg-neutral-100 hover:text-[#c49a45]'
                    }`}
                >
                  {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                  {link.name}
                </Link>
              );
            })}

            {/* Divider */}
            <div className="border-t border-neutral-200 my-2" />

            {/* Console Gateway Link */}
            <Link
              href="/admin/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded text-neutral-500 hover:bg-neutral-100 hover:text-black flex items-center gap-3 transition-colors"
            >
              <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Console Gateway</span>
              {pendingOrdersCount > 0 && (
                <span className="bg-red-500 text-white text-[8px] font-bold rounded-full px-1.5 py-0.5 min-w-[16px] text-center animate-pulse">
                  {pendingOrdersCount}
                </span>
              )}
            </Link>

            {/* Mobile Currency Section */}
            <div className="mt-2 pt-2 border-t border-neutral-200 px-3 py-2">
              <div className="flex items-center gap-3 text-[10px] text-neutral-500">
                <span className="font-semibold">Currency:</span>
                <button
                  onClick={() => { setCurrency('PKR'); setCurrencyDropdownOpen(false); }}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${currency === 'PKR'
                    ? 'bg-[#c49a45] text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                    }`}
                >
                  PKR
                </button>
                <button
                  onClick={() => { setCurrency('USD'); setCurrencyDropdownOpen(false); }}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${currency === 'USD'
                    ? 'bg-[#c49a45] text-white'
                    : 'bg-neutral-100 hover:bg-neutral-200'
                    }`}
                >
                  USD
                </button>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
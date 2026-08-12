// src/components/admin/AdminHeader.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
  User,
  LogOut,
  Settings,
  ChevronDown
} from 'lucide-react';
import AdminProfileModal from './AdminProfileModal';
import { AdminProfileData } from './ConfirmEditModal';

export default function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [adminData, setAdminData] = useState<AdminProfileData>({
    image: '',
    name: 'Huma & Manan Admin',
    phone: '',
    email: 'admin@humamanan.com',
    pass: '',
    address: '',
  });

  const fetchAdminInfo = async () => {
    try {
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      if (res.ok && data.success && data.admin) {
        setAdminData(data.admin);
      }
    } catch (err) {
      console.warn('Could not load header admin profile info:', err);
    }
  };

  useEffect(() => {
    // Only run on admin subpages (skip login page)
    if (pathname !== '/ad/m/in/login') {
      queueMicrotask(() => fetchAdminInfo());
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_user_email');
    router.push('/ad/m/in/login');
  };

  if (pathname === '/ad/m/in/login') {
    return null;
  }

  const navLinks = [
    { href: '/ad/m/in', label: 'Overview', icon: LayoutDashboard },
    { href: '/ad/m/in/products', label: 'Products', icon: Package },
    { href: '/ad/m/in/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/ad/m/in/inspirations', label: 'Inspirations', icon: Sparkles },
    { href: '/ad/m/in/discounts', label: 'Discounts', icon: Tag },
    { href: '/ad/m/in/profile', label: 'Profile', icon: User },
  ];

  return (
    <>
      <header className="bg-[#121212] border-b border-[#c49a45]/30 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Left: Atelier Brand & Title */}
            <div className="flex items-center gap-4">
              <Link href="/ad/m/in" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-full bg-[#c49a45]/20 border border-[#c49a45]/40 flex items-center justify-center text-[#c49a45] group-hover:scale-105 transition-transform">
                  <span className="font-serif text-sm font-bold tracking-tighter">HM</span>
                </div>
                <div>
                  <h1 className="font-serif text-sm sm:text-base tracking-[0.2em] text-white font-bold uppercase">
                    HUMA / MANAN
                  </h1>
                  <p className="text-[9px] tracking-[0.25em] text-[#c49a45] uppercase font-serif">
                    Executive Suite Portal
                  </p>
                </div>
              </Link>
            </div>

            {/* Center: Navigation Bar Links */}
            <nav className="hidden md:flex items-center gap-1 bg-[#1a1a1a] p-1.5 rounded-full border border-[#c49a45]/20">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-serif tracking-wider uppercase transition-all duration-300 ${
                      isActive
                        ? 'bg-[#c49a45] text-white font-bold shadow-md'
                        : 'text-neutral-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: Admin Profile Chip & Actions */}
            <div className="flex items-center gap-3">
              {/* Profile Pill */}
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-[#1a1a1a] border border-[#c49a45]/30 hover:border-[#c49a45] transition-all group"
                title="Edit Admin Profile"
              >
                {/* Admin Avatar */}
                <div className="w-8 h-8 rounded-full border border-[#c49a45] overflow-hidden bg-neutral-900 flex items-center justify-center shrink-0">
                  {adminData.image ? (
                    <img src={adminData.image} alt={adminData.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-[#c49a45]" />
                  )}
                </div>

                {/* Info Text */}
                <div className="hidden sm:block text-left">
                  <span className="block text-[11px] font-serif font-bold text-white leading-tight group-hover:text-[#c49a45] transition-colors">
                    {adminData.name}
                  </span>
                  <span className="block text-[9px] text-[#c49a45] font-serif leading-tight">
                    Admin Profile
                  </span>
                </div>

                <Settings className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#c49a45] transition-colors ml-1" />
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-red-950/30 border border-red-500/30 text-red-300 hover:bg-red-900/50 hover:text-white transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Tabs */}
          <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2.5 border-t border-[#c49a45]/20 scrollbar-none">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-serif tracking-wider uppercase whitespace-nowrap ${
                    isActive
                      ? 'bg-[#c49a45] text-white font-bold'
                      : 'text-neutral-300 bg-[#1a1a1a]'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Admin Profile Modal */}
      <AdminProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdated={(updated) => setAdminData(updated)}
      />
    </>
  );
}

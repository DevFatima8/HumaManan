"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem('admin_authenticated', 'true');
        localStorage.setItem('admin_user_email', email.trim().toLowerCase());
        router.push('/ad/m/in');
      } else {
        setError(data.error || 'Invalid Executive Credentials. Access Denied.');
      }
    } catch (err: any) {
      setError(err?.message || 'Connection error. Unable to authenticate credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="bg-[#121212] border border-[#c49a45]/30 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-[#c49a45]/15 border border-[#c49a45]/40 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-[#c49a45]" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl tracking-[0.25em] text-white font-bold uppercase">
              HUMA / MANAN
            </h1>
            <p className="font-serif text-[10px] sm:text-xs tracking-[0.3em] text-[#c49a45] uppercase mt-1">
              Executive Atelier Suite
            </p>
            <div className="w-12 h-0.5 bg-[#c49a45]/40 mx-auto mt-4" />
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-serif uppercase tracking-widest text-[#ebdcb9] mb-2">
                Executive Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c49a45]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@humamanan.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#c49a45]/30 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c49a45] focus:ring-1 focus:ring-[#c49a45] transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-serif uppercase tracking-widest text-[#ebdcb9] mb-2">
                Authorization Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c49a45]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-[#1a1a1a] border border-[#c49a45]/30 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c49a45] focus:ring-1 focus:ring-[#c49a45] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-[#c49a45] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#c49a45] hover:bg-[#b08738] text-white text-xs uppercase tracking-[0.2em] font-serif font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 mt-6"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Authenticate Access</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer link back to store */}
          <div className="mt-8 pt-6 border-t border-[#c49a45]/15 text-center">
            <Link
              href="/"
              className="text-[10px] uppercase font-serif tracking-widest text-neutral-400 hover:text-[#c49a45] transition-colors"
            >
              ← Return to Main Storefront
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check local storage for admin auth status
    const authStatus = localStorage.getItem('admin_authenticated');
    const isLoginPage = pathname === '/ad/m/in/login';

    if (authStatus === 'true') {
      if (isLoginPage) {
        // Already logged in, redirect away from login page to dashboard
        router.replace('/ad/m/in');
      } else {
        setIsAuthorized(true);
      }
      setIsChecking(false);
    } else {
      if (isLoginPage) {
        setIsAuthorized(false);
        setIsChecking(false);
      } else {
        // Not logged in and trying to access protected route -> redirect to login
        setIsAuthorized(false);
        router.replace('/ad/m/in/login');
      }
    }
  }, [pathname, router]);

  // If on login page and not authenticated, render login page children
  if (pathname === '/ad/m/in/login') {
    return <>{children}</>;
  }

  // Show loading spinner while checking auth status or redirecting
  if (isChecking || !isAuthorized) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-[#f2e6d0] px-4">
        <div className="p-8 rounded-xl bg-[#121212] border border-[#c49a45]/30 shadow-2xl flex flex-col items-center max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-[#c49a45]/20 border border-[#c49a45]/40 flex items-center justify-center mb-4 animate-pulse">
            <Lock className="w-6 h-6 text-[#c49a45]" />
          </div>
          <h2 className="font-serif text-lg tracking-[0.2em] text-white uppercase mb-1">
            HUMA / MANAN
          </h2>
          <p className="text-[10px] uppercase font-serif tracking-widest text-[#c49a45] mb-4">
            Executive Suite Verification
          </p>
          <div className="w-6 h-6 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-neutral-400 font-light">Authenticating access privileges...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

import React from 'react';
import AdminGuard from './AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f7f5f0] min-h-screen">
      {/* Decorative Golden Status Bar */}
      <div className="bg-[#c49a45] h-1.5 w-full" />
      <AdminGuard>
        <div className="py-6">{children}</div>
      </AdminGuard>
    </div>
  );
}

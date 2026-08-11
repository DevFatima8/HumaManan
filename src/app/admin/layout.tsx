import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f7f5f0] min-h-screen">
      {/* Decorative Golden Status Bar */}
      <div className="bg-[#c49a45] h-1.5 w-full" />
      <div className="py-6">{children}</div>
    </div>
  );
}

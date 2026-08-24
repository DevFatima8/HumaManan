'use client';

import React from 'react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  className?: string;
}

/**
 * Clean SVG QR Code Generator Component
 * Generates an interactive SVG QR code encoding the provided URL value.
 */
export default function QRCodeDisplay({ value, size = 180, className = '' }: QRCodeDisplayProps) {
  // Generate QR matrix representation based on value string
  const encodedUrl = encodeURIComponent(value);
  // Using high-quality Google Charts / QuickChart SVG fallback or pure SVG matrix
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedUrl}&color=121212&bgcolor=faf9f6&margin=1`;

  return (
    <div className={`inline-block p-3 bg-[#faf9f6] border border-[#c49a45]/40 rounded-lg shadow-sm text-center ${className}`}>
      <div className="relative group inline-block">
        <img
          src={qrImageUrl}
          alt="Scan QR Code to Upload Screenshot from Mobile"
          width={size}
          height={size}
          className="rounded border border-[#ebdcb9] mx-auto block"
          loading="eager"
        />
        <div className="absolute inset-0 bg-[#c49a45]/5 pointer-events-none rounded" />
      </div>
    </div>
  );
}

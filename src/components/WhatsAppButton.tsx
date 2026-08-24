// src/components/WhatsAppButton.tsx
"use client";

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';

interface WhatsAppButtonProps {
    phoneNumber?: string;
    message?: string;
    position?: 'bottom-right' | 'bottom-left';
    size?: 'sm' | 'md' | 'lg';
}

export default function WhatsAppButton({
    phoneNumber = '+923135793337',
    message = 'Assalam-o-Alaikum! I have a question about HUMA MANAN Couture.',
    position = 'bottom-right',
    size = 'md',
}: WhatsAppButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    // Hide button on admin routes
    const isVisible = !pathname?.startsWith('/ad/m/in');

    const handleWhatsAppClick = () => {
        const encodedMessage = encodeURIComponent(message);
        const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
        window.open(url, '_blank');
        setIsOpen(false);
    };

    if (!isVisible) return null;

    const sizeClasses = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-14 h-14 text-base',
        lg: 'w-16 h-16 text-lg',
    };

    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
    };

    return (
        <div className={`fixed z-50 ${positionClasses[position]} animate-fade-in`}>
            {/* Tooltip / Message Bubble */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 bg-white rounded-2xl shadow-2xl border border-[#ebdcb9]/60 p-5 w-72 mb-2 animate-fade-in">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="font-serif text-sm font-bold text-[#121212]">Chat with Us</h4>
                            <p className="text-[10px] text-neutral-500">We typically reply within minutes</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-neutral-400 hover:text-neutral-700 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 bg-[#ebdcb9]/10 rounded-xl p-3 mb-4 border border-[#ebdcb9]/30">
                        <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center flex-shrink-0">
                            <MessageCircle className="w-5 h-5 text-[#25D366]" />
                        </div>
                        <div>
                            <p className="text-xs font-medium text-[#121212]">HUMA MANAN Concierge</p>
                            <p className="text-[10px] text-neutral-500">Available 10 AM - 10 PM</p>
                        </div>
                    </div>

                    <button
                        onClick={handleWhatsAppClick}
                        className="w-full py-3 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs font-serif uppercase tracking-widest font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>Start Chat on WhatsApp</span>
                    </button>

                    <p className="text-[9px] text-neutral-400 text-center mt-2">
                        We speak English, Urdu, and Punjabi
                    </p>
                </div>
            )}

            {/* Main Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
          ${sizeClasses[size]}
          rounded-full shadow-2xl flex items-center justify-center
          bg-[#25D366] hover:bg-[#1ebe5a]
          text-white transition-all duration-300
          hover:scale-110 hover:rotate-3
          border-2 border-white/20
          relative group
        `}
                aria-label="Chat on WhatsApp"
            >
                <MessageCircle className="w-6 h-6" />
                {/* Pulse ring animation */}
                <span className="absolute inset-0 rounded-full animate-ping bg-[#25D366]/40 opacity-75" />
                <span className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-pulse" />
            </button>
        </div>
    );
}
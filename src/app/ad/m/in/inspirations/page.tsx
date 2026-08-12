// src/app/ad/m/in/inspirations/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import {
    Sparkles,
    Check,
    Phone,
    Clock,
    Eye,
    Trash2,
    Download,
    Image as ImageIcon,
    X,
    ChevronLeft,
    ChevronRight,
    RefreshCw
} from 'lucide-react';

export default function AdminInspirationsPage() {
    const { inspirationsList, fetchInspirations, updateInspirationStatus, deleteInspiration } = useStore();
    const [loading, setLoading] = useState(true);
    const [selectedImages, setSelectedImages] = useState<string[] | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

    const loadData = useCallback(async () => {
        setLoading(true);
        await fetchInspirations();
        setLoading(false);
    }, [fetchInspirations]);

    useEffect(() => {
        queueMicrotask(() => loadData());
    }, [loadData]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-300';
            case 'Viewed': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'Contacted': return 'bg-purple-100 text-purple-700 border-purple-300';
            case 'Completed': return 'bg-green-100 text-green-700 border-green-300';
            default: return 'bg-neutral-100 text-neutral-700 border-neutral-300';
        }
    };

    const getStatusDot = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-500 animate-pulse';
            case 'Viewed': return 'bg-blue-500';
            case 'Contacted': return 'bg-purple-500';
            case 'Completed': return 'bg-green-500';
            default: return 'bg-neutral-500';
        }
    };

    const openImageGallery = (images: string[], index: number = 0) => {
        if (!images || images.length === 0) return;
        setSelectedImages(images);
        setSelectedImageIndex(index);
    };

    const closeImageGallery = () => {
        setSelectedImages(null);
        setSelectedImageIndex(0);
    };

    const navigateImage = (direction: 'prev' | 'next') => {
        if (!selectedImages) return;
        const newIndex = direction === 'next'
            ? (selectedImageIndex + 1) % selectedImages.length
            : (selectedImageIndex - 1 + selectedImages.length) % selectedImages.length;
        setSelectedImageIndex(newIndex);
    };

    // Download image function - Fixed for base64
    const downloadImage = async (imageUrl: string, index: number) => {
        try {
            let urlToDownload = imageUrl;

            // If it's base64, create a blob from it
            if (imageUrl.startsWith('data:image')) {
                console.log('Downloading base64 image...');
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `inspiration-image-${index + 1}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                return;
            }

            // For Cloudinary URLs
            console.log('Downloading Cloudinary image:', imageUrl);
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error('Failed to fetch image');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `inspiration-image-${index + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            // Fallback: Open in new tab
            window.open(imageUrl, '_blank');
        }
    };

    // Download all images
    const downloadAllImages = async (images: string[], name: string) => {
        for (let i = 0; i < images.length; i++) {
            await downloadImage(images[i], i);
        }
    };

    // Handle image error
    const handleImageError = (imageUrl: string) => {
        setImageErrors(prev => ({ ...prev, [imageUrl]: true }));
        console.warn('Image failed to load:', imageUrl);
    };

    // Check if image is valid
    const isValidImage = (url: string) => {
        return url && (url.startsWith('http') || url.startsWith('data:image'));
    };

    const pendingCount = inspirationsList.filter(i => i.status === 'Pending').length;

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="w-10 h-10 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-neutral-400 mt-4 font-serif">Loading inspirations...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-in">

            {/* Header */}
            <div className="bg-[#121212] text-[#f2e6d0] border border-[#c49a45]/30 rounded-lg p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#c49a45_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <span className="text-[9px] tracking-[0.25em] text-[#ebdcb9] uppercase block font-serif">
                            ✦ Atelier Backoffice Portal ✦
                        </span>
                        <h1 className="font-serif text-2xl sm:text-3xl text-[#faf9f6] tracking-wide">
                            CLIENT INSPIRATIONS
                        </h1>
                        <p className="text-xs text-neutral-400 mt-1">
                            Track all client moodboard submissions, design requests, and inspiration references.
                        </p>
                    </div>
                    <button
                        onClick={loadData}
                        className="px-4 py-2 border border-[#c49a45]/30 rounded text-xs text-[#ebdcb9] hover:bg-white/10 transition-colors flex items-center gap-1.5 font-semibold font-serif uppercase cursor-pointer"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-[#ebdcb9]/15 rounded-full text-[#c49a45]">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Total Submissions</span>
                        <span className="font-serif text-xl font-bold text-neutral-800">{inspirationsList.length}</span>
                    </div>
                </div>

                <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-amber-50 rounded-full text-amber-600">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Pending Review</span>
                        <span className="font-serif text-xl font-bold text-amber-700">{pendingCount}</span>
                    </div>
                </div>

                <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-blue-50 rounded-full text-blue-600">
                        <Eye className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Viewed</span>
                        <span className="font-serif text-xl font-bold text-blue-700">
                            {inspirationsList.filter(i => i.status === 'Viewed').length}
                        </span>
                    </div>
                </div>

                <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-4 flex items-center gap-4">
                    <div className="p-2.5 bg-green-50 rounded-full text-green-600">
                        <Check className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">Contacted</span>
                        <span className="font-serif text-xl font-bold text-green-700">
                            {inspirationsList.filter(i => i.status === 'Contacted' || i.status === 'Completed').length}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#ebdcb9]/40 pb-6">
                <div>
                    <h1 className="font-serif text-2xl text-neutral-800 tracking-wider uppercase font-bold flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-[#c49a45]" />
                        Client Inspiration Moodboards
                    </h1>
                    <p className="text-xs text-neutral-500 mt-1 font-serif">
                        Review custom design requests, uploaded moodboards, and client preferences
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-[#ebdcb9]/20 px-3 py-1.5 rounded-full border border-[#c49a45]/30">
                    <span className="text-xs font-serif text-neutral-700 font-medium">
                        Total Submissions: <strong className="text-[#c49a45] font-bold">{inspirationsList.length}</strong>
                    </span>
                </div>
            </div>

            {inspirationsList.length === 0 ? (
                <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-16 text-center space-y-4">
                    <Sparkles className="w-12 h-12 text-[#c49a45] mx-auto opacity-40" />
                    <h3 className="font-serif text-lg text-neutral-700">No inspiration submissions yet</h3>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        When clients submit their moodboards and design requests from the inspiration page, they&apos;ll appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {inspirationsList.map((inspiration) => {
                        const validImages = inspiration.images?.filter((img: string) => isValidImage(img)) || [];
                        const hasValidImages = validImages.length > 0;

                        return (
                            <div
                                key={inspiration._id}
                                className={`bg-white border rounded-lg shadow-xs overflow-hidden transition-all ${inspiration.status === 'Pending' ? 'border-amber-200 bg-amber-50/30' : 'border-[#ebdcb9]/40'
                                    }`}
                            >
                                <div className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="font-serif text-base font-bold text-neutral-800">
                                                    {inspiration.name}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1.5 ${getStatusColor(inspiration.status)}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(inspiration.status)}`} />
                                                    {inspiration.status}
                                                </span>
                                            </div>

                                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-neutral-500">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3.5 h-3.5" />
                                                    <a href={`tel:${inspiration.phone}`} className="hover:text-[#c49a45] font-mono">
                                                        {inspiration.phone}
                                                    </a>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {new Date(inspiration.createdAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <ImageIcon className="w-3.5 h-3.5" />
                                                    {validImages.length} image{validImages.length !== 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            {inspiration.message && (
                                                <div className="mt-3 p-3 bg-neutral-50 rounded border border-neutral-200 text-xs text-neutral-600 italic max-w-2xl">
                                                    &quot;{inspiration.message}&quot;
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                                            <select
                                                value={inspiration.status}
                                                onChange={async (e) => {
                                                    await updateInspirationStatus(inspiration._id, e.target.value);
                                                }}
                                                className={`text-xs font-serif uppercase tracking-wider font-bold py-1 px-2 pr-6 rounded border focus:outline-none cursor-pointer ${getStatusColor(inspiration.status)}`}
                                            >
                                                <option value="Pending">🔴 Pending</option>
                                                <option value="Viewed">👁️ Viewed</option>
                                                <option value="Contacted">📞 Contacted</option>
                                                <option value="Completed">✅ Completed</option>
                                            </select>

                                            {/* Download All Button */}
                                            {hasValidImages && (
                                                <button
                                                    onClick={() => downloadAllImages(validImages, inspiration.name)}
                                                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-1.5"
                                                    title="Download all images"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Download All
                                                </button>
                                            )}

                                            {/* Delete Button */}
                                            <button
                                                onClick={async () => {
                                                    if (confirm(`Delete inspiration from ${inspiration.name}?`)) {
                                                        await deleteInspiration(inspiration._id);
                                                    }
                                                }}
                                                className="p-2 text-neutral-400 hover:text-red-600 transition-colors border border-neutral-200 rounded hover:border-red-300"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Images Grid */}
                                    {hasValidImages && (
                                        <div className="mt-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                                                    Reference Images ({validImages.length})
                                                </h4>
                                                <button
                                                    onClick={() => openImageGallery(validImages, 0)}
                                                    className="text-xs text-[#c49a45] hover:underline flex items-center gap-1"
                                                >
                                                    <Eye className="w-3.5 h-3.5" />
                                                    View All
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                {validImages.map((img: string, idx: number) => {
                                                    const hasError = imageErrors[img];
                                                    return (
                                                        <div key={idx} className="group relative">
                                                            <div
                                                                className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-[#ebdcb9]/30 shadow-sm bg-neutral-100 cursor-pointer hover:border-[#c49a45] transition-all"
                                                                onClick={() => openImageGallery(validImages, idx)}
                                                            >
                                                                {!hasError ? (
                                                                    <img
                                                                        src={img}
                                                                        alt={`Reference ${idx + 1}`}
                                                                        className="w-full h-full object-cover"
                                                                        loading="lazy"
                                                                        onError={() => handleImageError(img)}
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-500 text-xs">
                                                                        <div className="text-center">
                                                                            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-30" />
                                                                            <span>Image not available</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                {/* Overlay on hover */}
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </div>
                                                            </div>

                                                            {/* Download button on each image */}
                                                            {!hasError && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        downloadImage(img, idx);
                                                                    }}
                                                                    className="absolute top-1 right-1 p-1.5 bg-white/90 hover:bg-white rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title="Download image"
                                                                >
                                                                    <Download className="w-3.5 h-3.5 text-neutral-600 hover:text-[#c49a45]" />
                                                                </button>
                                                            )}

                                                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">
                                                                {idx + 1}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Show message if no valid images */}
                                    {!hasValidImages && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-600 text-xs">
                                            <strong>⚠️ Images not available:</strong> The uploaded images could not be loaded. Please ask the client to resubmit with valid images.
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Image Gallery Modal */}
            {selectedImages && selectedImages.length > 0 && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
                    onClick={closeImageGallery}
                >
                    <div className="relative max-w-6xl max-h-[90vh] w-full">
                        {/* Top Bar */}
                        <div className="absolute -top-14 left-0 right-0 flex justify-between items-center text-white">
                            <div className="text-xs font-mono text-white/60">
                                {selectedImageIndex + 1} / {selectedImages.length}
                            </div>
                            <div className="flex items-center gap-3">
                                {/* Download Current Image */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        downloadImage(selectedImages[selectedImageIndex], selectedImageIndex);
                                    }}
                                    className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                                <button
                                    onClick={closeImageGallery}
                                    className="text-white/70 hover:text-white transition-colors flex items-center gap-1.5 text-sm"
                                >
                                    <X className="w-5 h-5" />
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Main Image */}
                        <div className="w-full h-full flex items-center justify-center">
                            {selectedImages[selectedImageIndex] ? (
                                <img
                                    src={selectedImages[selectedImageIndex]}
                                    alt={`Inspiration reference ${selectedImageIndex + 1}`}
                                    className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                                    loading="lazy"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-image.jpg';
                                        console.warn('Gallery image failed to load');
                                    }}
                                />
                            ) : (
                                <div className="text-white text-center">
                                    <ImageIcon className="w-16 h-16 mx-auto mb-2 opacity-30" />
                                    <p>Image not available</p>
                                </div>
                            )}
                        </div>

                        {/* Navigation Buttons */}
                        {selectedImages.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 sm:p-3 rounded-full transition-colors backdrop-blur-sm border border-white/20"
                                >
                                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 sm:p-3 rounded-full transition-colors backdrop-blur-sm border border-white/20"
                                >
                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </>
                        )}

                        {/* Thumbnail Navigation */}
                        {selectedImages.length > 1 && (
                            <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-full overflow-x-auto px-4 py-2 no-scrollbar">
                                {selectedImages.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); setSelectedImageIndex(idx); }}
                                        className={`w-12 h-16 rounded overflow-hidden border-2 transition-all flex-shrink-0 ${idx === selectedImageIndex ? 'border-[#c49a45] scale-110' : 'border-white/20 hover:border-white/50'
                                            }`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
}
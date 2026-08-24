// src/app/inspiration/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Sparkles, Check, PhoneCall, Loader2, X, UploadCloud, Image as ImageIcon, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

export default function InspirationPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
  const [myInspirationsHistory, setMyInspirationsHistory] = useState<any[]>([]);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState<string[] | null>(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [inspirationToDelete, setInspirationToDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  const confirmDeleteMyInspiration = async () => {
    if (!inspirationToDelete) return;
    setIsDeleting(true);
    try {
      const idToDelete = inspirationToDelete._id || inspirationToDelete.id;
      try {
        await fetch(`/api/inspiration?id=${encodeURIComponent(idToDelete)}`, { method: 'DELETE' });
      } catch (e) {
        console.error('API delete error:', e);
      }

      const myInspStr = localStorage.getItem('humamanan_my_inspirations') || '[]';
      let myInsp = JSON.parse(myInspStr);
      myInsp = myInsp.filter((i: any) => String(i._id || i.id) !== String(idToDelete));
      localStorage.setItem('humamanan_my_inspirations', JSON.stringify(myInsp));

      setMyInspirationsHistory(myInsp);
      setDeleteSuccessMsg('Inspiration submission removed from history.');
      setTimeout(() => setDeleteSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to delete inspiration:', err);
    } finally {
      setIsDeleting(false);
      setInspirationToDelete(null);
    }
  };

  const loadMyInspirations = useCallback(async () => {
    let localItems: any[] = [];
    const saved = localStorage.getItem('humamanan_my_inspirations');
    if (saved) {
      try { localItems = JSON.parse(saved); } catch (e) { console.error(e); }
    }

    const savedPhone = localStorage.getItem('humamanan_user_phone') || phone;
    if (savedPhone) {
      try {
        const res = await fetch(`/api/inspiration?phone=${encodeURIComponent(savedPhone)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.inspirations)) {
          const merged = [...data.inspirations];
          localItems.forEach(item => {
            if (!merged.some(m => String(m._id || m.id) === String(item._id || item.id))) {
              merged.push(item);
            }
          });
          localItems = merged;
        }
      } catch (e) {
        console.error("Failed to fetch my inspirations from API:", e);
      }
    }

    setMyInspirationsHistory(localItems);
  }, [phone]);

  useEffect(() => {
    loadMyInspirations();
  }, [loadMyInspirations]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 10) {
      setError(`Maximum 10 images allowed. You can add ${10 - images.length} more.`);
      e.target.value = '';
      return;
    }

    setUploadLoading(true);
    setError('');

    const uploadPromises = Array.from(files).map(async (file) => {
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is not an image file`);
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${file.name} is larger than 10MB`);
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok && data.success && data.url) {
          return data.url;
        } else {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });
        }
      } catch (err) {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      setImages(prev => [...prev, ...uploadedUrls]);
      setError('');
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload images. Please try again.');
    } finally {
      setUploadLoading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one reference image.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
        images: images,
      };

      const response = await fetch('/api/inspiration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inspiration');
      }

      const newInsp = data.inspiration || {
        _id: `insp_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        message: message.trim(),
        images: images,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      try {
        const myInspStr = localStorage.getItem('humamanan_my_inspirations') || '[]';
        const myInsp = JSON.parse(myInspStr);
        myInsp.unshift(newInsp);
        localStorage.setItem('humamanan_my_inspirations', JSON.stringify(myInsp));
      } catch (e) {
        localStorage.setItem('humamanan_my_inspirations', JSON.stringify([newInsp]));
      }

      localStorage.setItem('humamanan_user_phone', phone.trim());
      localStorage.setItem('humamanan_user_name', name.trim());

      setSubmitted(true);
      loadMyInspirations();

    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-screen py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12 animate-fade-in">

        {/* Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#c49a45] font-serif font-bold block">
            ✦ Huma Manan Inspiration Studio ✦
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl text-[#121212] tracking-wide leading-tight font-light">
            YOUR DESIGN INSPIRATION
          </h1>
          <div className="w-16 h-[1px] bg-[#ebdcb9] mx-auto my-3" />
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl mx-auto leading-relaxed font-light">
            Share your dream outfit vision with us. Upload up to <strong>10 reference images</strong> and our design team will bring your vision to life.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center border-b border-[#ebdcb9]">
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`py-3 px-6 text-xs uppercase tracking-widest font-serif font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'form'
                ? 'border-[#c49a45] text-[#c49a45]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Submit Design Inspiration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-6 text-xs uppercase tracking-widest font-serif font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-[#c49a45] text-[#c49a45]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <span>My Inspiration History</span>
            {myInspirationsHistory.length > 0 && (
              <span className="bg-[#c49a45] text-white text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
                {myInspirationsHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Success Message */}
        {submitted && activeTab === 'form' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-serif text-xl font-bold text-green-800">Inspiration Received! ✨</h3>
            <p className="text-sm text-green-700 max-w-md mx-auto">
              Thank you, <strong>{name}</strong>! Our design team will review your inspiration and contact you within 24 hours.
            </p>
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-md mx-auto">
                {images.map((img, idx) => (
                  <div key={idx} className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-green-200 shadow-md">
                    <img
                      src={img}
                      alt={`Reference ${idx + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('history')}
                className="px-6 py-2.5 bg-[#c49a45] hover:bg-[#121212] text-white rounded text-xs uppercase tracking-widest font-serif font-bold transition-colors"
              >
                View My Inspiration History
              </button>
              <Link
                href="/"
                className="px-6 py-2.5 border border-green-600 text-green-700 hover:bg-green-50 rounded text-xs uppercase tracking-widest font-serif font-bold transition-colors"
              >
                Return to Boutique
              </Link>
            </div>
          </div>
        )}

        {/* Form Tab */}
        {activeTab === 'form' && !submitted && (
          <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-4 sm:p-6 md:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium">
                  ✦ {error}
                </div>
              )}

              {/* Name and Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mahira Khan"
                    className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#c49a45] focus:outline-none text-neutral-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                    WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +92 321 0000000"
                    className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded px-3 py-2 text-xs focus:ring-1 focus:ring-[#c49a45] focus:outline-none text-neutral-800"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-1 font-semibold">
                  Design Description or Questions
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your dream outfit: color, fabric, embroidery style, occasion, etc."
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9] rounded p-2.5 text-xs focus:ring-1 focus:ring-[#c49a45] focus:outline-none text-neutral-800"
                  rows={4}
                />
              </div>

              {/* Image Upload - Multiple */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                    Reference Images <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    {images.length}/10 uploaded
                  </span>
                </div>

                {/* Upload Zone */}
                <div className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center space-y-3 transition-colors ${images.length >= 10 ? 'border-red-300 bg-red-50/50' : 'border-[#ebdcb9] hover:border-[#c49a45]'
                  }`}>
                  {images.length >= 10 ? (
                    <div>
                      <div className="flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-red-500" />
                        </div>
                      </div>
                      <p className="text-xs font-bold text-red-600 mt-2">Maximum 10 images reached</p>
                      <p className="text-[10px] text-neutral-400">Remove some images to add more</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#ebdcb9]/20 flex items-center justify-center">
                          <UploadCloud className="w-6 h-6 text-[#c49a45]" />
                        </div>
                      </div>
                      <p className="text-xs font-serif font-bold text-[#121212] mt-2">
                        Upload Reference Images
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {10 - images.length} images remaining • JPG, PNG, WEBP up to 10MB each
                      </p>
                    </div>
                  )}

                  {uploadLoading && (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#c49a45]" />
                      <span className="text-xs text-neutral-500">Uploading images...</span>
                    </div>
                  )}

                  {images.length < 10 && (
                    <div className="relative inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={uploadLoading}
                      />
                      <span className={`inline-block px-4 sm:px-6 py-2 bg-[#121212] hover:bg-[#c49a45] text-white text-[10px] uppercase tracking-widest font-serif font-semibold rounded transition-colors ${uploadLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}>
                        {uploadLoading ? 'Uploading...' : 'Select Images'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Image Preview Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-[#c49a45]/30 shadow-sm bg-neutral-100">
                          <img
                            src={img}
                            alt={`Reference ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">
                            {idx + 1}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || images.length === 0}
                className="w-full py-3.5 bg-[#121212] hover:bg-[#c49a45] text-white text-center text-xs tracking-[0.2em] font-serif uppercase font-bold transition-all rounded shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  `Submit ${images.length} Reference Image${images.length > 1 ? 's' : ''}`
                )}
              </button>

              <p className="text-[9px] text-center text-neutral-400">
                By submitting, you agree to our design consultation terms. We&apos;ll contact you within 24 hours.
              </p>
            </form>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-100 pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-800 tracking-wider flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#c49a45]" />
                  <span>My Submitted Inspiration History</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Reference moodboards submitted from this device / phone number
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setSubmitted(false); setActiveTab('form'); }}
                className="px-4 py-2 bg-[#c49a45] hover:bg-[#121212] text-white rounded text-xs font-serif uppercase tracking-widest font-bold transition-colors cursor-pointer"
              >
                + Submit New Moodboard
              </button>
            </div>

            {myInspirationsHistory.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <ImageIcon className="w-12 h-12 text-[#c49a45]/40 mx-auto" />
                <h4 className="font-serif text-base text-neutral-700 font-bold">No inspirations submitted yet</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  When you submit reference images for custom design consultation, your history will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => { setSubmitted(false); setActiveTab('form'); }}
                  className="inline-block px-6 py-2.5 bg-[#121212] hover:bg-[#c49a45] text-white text-xs uppercase tracking-widest font-serif font-bold rounded transition-colors cursor-pointer mt-2"
                >
                  Submit Reference Images Now
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {myInspirationsHistory.map((item: any, idx: number) => {
                  const itemImages = item.images || [];
                  const statusColor = item.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    item.status === 'Viewed' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    item.status === 'Contacted' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    'bg-green-100 text-green-800 border-green-200';

                  return (
                    <div key={item._id || item.id || idx} className="bg-neutral-50/60 border border-[#ebdcb9]/40 rounded-lg p-5 space-y-4 shadow-2xs">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-neutral-200/60 pb-3">
                        <div>
                          <span className="font-serif text-sm font-bold text-neutral-800">
                            Submission by {item.name}
                          </span>
                          <span className="text-[11px] text-neutral-400 font-mono block mt-0.5">
                            Date: {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-neutral-400 uppercase font-mono">Status:</span>
                          <span className={`px-3 py-0.5 rounded-full text-xs font-serif uppercase tracking-wider font-bold border ${statusColor}`}>
                            {item.status || 'Pending'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setInspirationToDelete(item)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 border border-neutral-200 hover:border-red-300 rounded transition-all cursor-pointer flex items-center justify-center ml-2"
                            title="Delete inspiration from history"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.message && (
                        <div className="p-3 bg-white rounded border border-neutral-200 text-xs text-neutral-700 italic">
                          &quot;{item.message}&quot;
                        </div>
                      )}

                      {itemImages.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold block">
                            Uploaded Reference Images ({itemImages.length})
                          </span>
                          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
                            {itemImages.map((imgUrl: string, imgIdx: number) => (
                              <div
                                key={imgIdx}
                                onClick={() => { setSelectedGalleryImages(itemImages); setSelectedGalleryIndex(imgIdx); }}
                                className="aspect-[3/4] rounded border border-neutral-300 overflow-hidden bg-neutral-200 cursor-pointer hover:border-[#c49a45] transition-all group relative shadow-2xs"
                              >
                                <img src={imgUrl} alt={`Reference ${imgIdx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                  <Sparkles className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#ebdcb9]/20 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-[#c49a45]" />
            </div>
            <h4 className="font-serif text-xs font-bold text-[#121212]">Custom Design</h4>
            <p className="text-[10px] text-neutral-500 mt-1">We&apos;ll create a unique piece based on your vision</p>
          </div>

          <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#ebdcb9]/20 flex items-center justify-center mx-auto mb-2">
              <PhoneCall className="w-5 h-5 text-[#c49a45]" />
            </div>
            <h4 className="font-serif text-xs font-bold text-[#121212]">Consultation Call</h4>
            <p className="text-[10px] text-neutral-500 mt-1">Our expert will contact you within 24 hours</p>
          </div>

          <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#ebdcb9]/20 flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="w-5 h-5 text-[#c49a45]" />
            </div>
            <h4 className="font-serif text-xs font-bold text-[#121212]">Up to 10 Images</h4>
            <p className="text-[10px] text-neutral-500 mt-1">Upload multiple reference images for better understanding</p>
          </div>
        </div>

      </div>

      {/* Image Lightbox Modal */}
      {selectedGalleryImages && selectedGalleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedGalleryImages(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            <button
              onClick={() => setSelectedGalleryImages(null)}
              className="absolute -top-10 right-0 text-white/80 hover:text-white flex items-center gap-1 text-xs uppercase font-serif tracking-widest cursor-pointer"
            >
              <X className="w-5 h-5" />
              <span>Close</span>
            </button>

            <div className="w-full h-full flex items-center justify-center">
              <img
                src={selectedGalleryImages[selectedGalleryIndex]}
                alt={`Inspiration reference ${selectedGalleryIndex + 1}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
              />
            </div>

            {selectedGalleryImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGalleryIndex(prev => (prev - 1 + selectedGalleryImages.length) % selectedGalleryImages.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors backdrop-blur-xs cursor-pointer"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedGalleryIndex(prev => (prev + 1) % selectedGalleryImages.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors backdrop-blur-xs cursor-pointer"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Delete Inspiration Confirmation Modal */}
      {inspirationToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-[#ebdcb9] rounded-lg shadow-2xl max-w-md w-full p-6 relative space-y-5">
            <button
              onClick={() => !isDeleting && setInspirationToDelete(null)}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 p-1 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-full border border-red-100 flex-shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-neutral-900">
                  Delete Inspiration?
                </h3>
                <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                  Are you sure you want to remove this reference moodboard from your history?
                </p>
              </div>
            </div>

            <div className="bg-neutral-50 border border-neutral-200/80 rounded-md p-3.5 space-y-1 text-xs text-neutral-700 font-mono">
              <div className="flex justify-between">
                <span className="text-neutral-500">Client Name:</span>
                <span className="font-bold text-neutral-800">{inspirationToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Reference Images:</span>
                <span className="font-bold text-[#c49a45]">
                  {inspirationToDelete.images?.length || 0} image(s)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setInspirationToDelete(null)}
                className="px-4 py-2 border border-neutral-300 rounded text-xs font-serif font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDeleteMyInspiration}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-serif font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Inspiration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
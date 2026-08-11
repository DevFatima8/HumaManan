// src/app/inspiration/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Check, PhoneCall, Loader2, X, UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function InspirationPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check if adding these files would exceed 10
    if (images.length + files.length > 10) {
      setError(`Maximum 10 images allowed. You can add ${10 - images.length} more.`);
      e.target.value = '';
      return;
    }

    setUploadLoading(true);
    setError('');

    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate each file
      if (!file.type.startsWith('image/')) {
        throw new Error(`${file.name} is not an image file`);
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`${file.name} is larger than 10MB`);
      }

      try {
        // Upload via API route
        const formData = new FormData();
        formData.append('file', file);

        console.log(`Uploading ${file.name} to Cloudinary...`);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        console.log('Upload response:', data);

        if (response.ok && data.success && data.url) {
          console.log('Upload successful:', data.url);
          return data.url;
        } else {
          // If API upload fails, try base64 as fallback
          console.warn('API upload failed, using base64 fallback');
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
          });
        }
      } catch (err) {
        console.error('Upload error:', err);
        // Fallback: Convert to base64
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
      console.log(`Successfully uploaded ${uploadedUrls.length} images`);
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

      console.log('Submitting inspiration with', images.length, 'images');
      console.log('First image type:', images[0]?.substring(0, 50));

      const response = await fetch('/api/inspiration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('Server response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit inspiration');
      }

      // Also send to Formspree as backup
      try {
        await fetch('https://formspree.io/f/xjkgnpwy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            subject: `Boutique Inspiration Moodboard from ${name}`,
            name: name,
            phone: phone,
            message: message,
            images: images.map(img =>
              img.startsWith('http') ? img : 'base64-image'
            ).join(', ')
          })
        });
        console.log('Formspree notification sent');
      } catch (e) {
        console.warn("Formspree submit warning:", e);
      }

      setSubmitted(true);

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

        {/* Success Message */}
        {submitted && (
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
            <Link
              href="/"
              className="inline-block px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs uppercase tracking-widest font-serif font-bold transition-colors"
            >
              Return to Boutique
            </Link>
          </div>
        )}

        {/* Form - Only show if not submitted */}
        {!submitted && (
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
                              // If image fails to load, show placeholder
                              (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
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
                className="w-full py-3.5 bg-[#121212] hover:bg-[#c49a45] text-white text-center text-xs tracking-[0.2em] font-serif uppercase font-bold transition-all rounded shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                By submitting, you agree to our design consultation terms. We'll contact you within 24 hours.
              </p>
            </form>
          </div>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#ebdcb9]/40 rounded-lg p-4 text-center">
            <div className="w-10 h-10 rounded-full bg-[#ebdcb9]/20 flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-5 h-5 text-[#c49a45]" />
            </div>
            <h4 className="font-serif text-xs font-bold text-[#121212]">Custom Design</h4>
            <p className="text-[10px] text-neutral-500 mt-1">We'll create a unique piece based on your vision</p>
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
    </div>
  );
}
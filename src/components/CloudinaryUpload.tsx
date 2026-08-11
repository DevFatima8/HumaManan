// src/components/CloudinaryUpload.tsx
"use client";

import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';

interface CloudinaryUploadProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export default function CloudinaryUpload({
  onUploadSuccess,
  label = "Upload Inspiration Image"
}: CloudinaryUploadProps) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPG, PNG, WEBP, GIF)');
      e.target.value = '';
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      e.target.value = '';
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      // First try: Upload via our own API route (more reliable)
      const formData = new FormData();
      formData.append('file', file);

      const apiResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const apiData = await apiResponse.json();

      if (apiResponse.ok && apiData.success && apiData.url) {
        setImageUrl(apiData.url);
        onUploadSuccess(apiData.url);
        setUploadProgress(100);
        e.target.value = '';
        setLoading(false);
        return;
      }

      // Second try: Direct Cloudinary upload (if API route fails)
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'demo';
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'ml_default';

      const cloudFormData = new FormData();
      cloudFormData.append('file', file);
      cloudFormData.append('upload_preset', uploadPreset);

      const cloudResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: cloudFormData,
        }
      );

      if (!cloudResponse.ok) {
        const errorText = await cloudResponse.text();
        console.error('Cloudinary error response:', errorText);
        throw new Error(`Cloudinary upload failed: ${cloudResponse.status}`);
      }

      const cloudData = await cloudResponse.json();

      if (!cloudData.secure_url) {
        throw new Error('No secure URL returned from Cloudinary');
      }

      setImageUrl(cloudData.secure_url);
      onUploadSuccess(cloudData.secure_url);
      setUploadProgress(100);

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image. Please try again.');

      // Final fallback: Read as base64 (client-side only)
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const base64Url = reader.result as string;
          setImageUrl(base64Url);
          onUploadSuccess(base64Url);
          setError('');
          setUploadProgress(100);
        };
        reader.onerror = () => {
          setError('Failed to read file. Please try again.');
        };
        reader.readAsDataURL(file);
      } catch (readErr) {
        setError('Failed to process image. Please try another file.');
      }
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const removeImage = () => {
    setImageUrl('');
    setError('');
    setUploadProgress(0);
  };

  return (
    <div className="border-2 border-dashed border-[#ebdcb9] rounded-lg p-4 sm:p-5 bg-[#faf9f6] text-center space-y-3 transition-colors hover:border-[#c49a45]">
      <div className="flex flex-col items-center justify-center">
        {imageUrl ? (
          <div className="space-y-2 w-full">
            <div className="relative aspect-[3/4] w-24 sm:w-28 md:w-32 mx-auto rounded overflow-hidden border-2 border-[#c49a45] shadow-md group">
              <img
                src={imageUrl}
                alt="Uploaded Inspiration"
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                type="button"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-green-600 font-serif flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Image uploaded successfully</span>
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#ebdcb9]/20 flex items-center justify-center mx-auto">
              <UploadCloud className="w-6 h-6 sm:w-7 sm:h-7 text-[#c49a45]" />
            </div>
            <div className="text-xs">
              <p className="font-serif font-bold text-[#121212]">{label}</p>
              <p className="text-[9px] sm:text-[10px] text-neutral-400">Supports JPG, PNG, WEBP, GIF up to 10MB</p>
            </div>
          </div>
        )}

        {/* Loading Progress */}
        {loading && (
          <div className="w-full max-w-xs mx-auto">
            <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-[#c49a45] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-[9px] text-neutral-400 mt-1">Uploading... {uploadProgress}%</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="w-full p-2 sm:p-2.5 bg-red-50 border border-red-200 rounded text-red-700 text-[10px] sm:text-[11px] flex items-start gap-1.5 text-left">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="relative inline-block">
        <input
          type="file"
          accept="image/*"
          id="cloudinary-file-input"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          disabled={loading || !!imageUrl}
        />
        <span className={`inline-block px-4 sm:px-6 py-2 sm:py-2.5 bg-[#121212] hover:bg-[#c49a45] text-white text-[10px] sm:text-[11px] uppercase tracking-widest font-serif font-semibold rounded shadow-xs transition-colors ${(loading || imageUrl) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02]'
          }`}>
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Uploading...
            </span>
          ) : imageUrl ? (
            'Uploaded ✓'
          ) : (
            'Choose Image'
          )}
        </span>
      </div>
    </div>
  );
}
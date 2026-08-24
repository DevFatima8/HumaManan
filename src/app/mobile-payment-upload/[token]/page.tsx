'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Camera, Image as ImageIcon, CheckCircle, AlertCircle, Loader2, ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

interface MobileUploadPageProps {
  params: Promise<{ token: string }>;
}

export default function MobilePaymentUploadPage({ params }: MobileUploadPageProps) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;

  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(true);
  const [sessionError, setSessionError] = useState<string>('');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);

  // Fetch session details on mount
  useEffect(() => {
    async function loadSession() {
      setIsLoadingSession(true);
      try {
        const res = await fetch(`/api/payment-session/${token}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Invalid or expired payment link.');
        }

        setSession(data.session);

        if (data.session.screenshotUrl && data.session.status === 'uploaded') {
          setPreviewUrl(data.session.screenshotUrl);
          setUploadSuccess(true);
        }
      } catch (err: any) {
        setSessionError(err.message || 'Payment session not found.');
      } finally {
        setIsLoadingSession(false);
      }
    }

    if (token) {
      loadSession();
    }
  }, [token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

      if (!validTypes.includes(file.type)) {
        setUploadError('Invalid format. Please select a JPG, PNG, or WEBP photo.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setUploadError('File size is too large. Max limit is 10MB.');
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a payment receipt screenshot first.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch(`/api/payment-session/${token}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload screenshot.');
      }

      setUploadSuccess(true);
      setPreviewUrl(data.url);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload receipt. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatPrice = (amount: number, curr: string) => {
    return curr === 'PKR'
      ? `Rs. ${amount.toLocaleString('en-PK')}`
      : `$${amount.toLocaleString('en-US')}`;
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] text-neutral-800 flex flex-col font-sans pb-12">
      {/* Header Bar */}
      <header className="bg-[#121212] text-[#f2e6d0] py-4 px-5 border-b border-[#c49a45]/30 sticky top-0 z-30 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg tracking-[0.2em] font-bold text-[#faf9f6]">
              HUMA MANAN
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#c49a45] font-serif border border-[#c49a45]/40 px-1.5 py-0.5 rounded">
              Payment Portal
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
            <Lock className="w-3 h-3 text-[#c49a45]" />
            <span>Secure 256-Bit</span>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto w-full p-4 sm:p-6 space-y-6 flex-1">
        {/* Loading State */}
        {isLoadingSession && (
          <div className="bg-white border border-[#ebdcb9]/60 rounded-xl p-10 text-center space-y-3 shadow-xs">
            <Loader2 className="w-8 h-8 text-[#c49a45] animate-spin mx-auto" />
            <p className="font-serif text-xs uppercase tracking-wider text-neutral-600">
              Validating Mobile Payment Link...
            </p>
          </div>
        )}

        {/* Error / Expired State */}
        {!isLoadingSession && (sessionError || (session && session.isExpired)) && (
          <div className="bg-white border border-red-200 rounded-xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-neutral-800 uppercase tracking-wider">
                Payment Link Expired or Invalid
              </h2>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                {sessionError || 'This QR upload link has expired. Please refresh the QR code on your desktop screen to generate a new link.'}
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-5 py-2.5 bg-[#121212] text-[#f2e6d0] text-xs font-serif uppercase tracking-widest rounded"
              >
                Return to Storefront
              </Link>
            </div>
          </div>
        )}

        {/* Main Upload Card */}
        {!isLoadingSession && session && !sessionError && !session.isExpired && (
          <div className="space-y-6 animate-fade-in">
            {/* Order Payment Summary Card */}
            <div className="bg-white border border-[#ebdcb9] rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-semibold block">
                    Couture Order Payment
                  </span>
                  <h3 className="font-serif text-sm font-bold text-neutral-800">
                    {session.paymentType === 'advance_30' ? '30% Advance Payment' : '100% Full Payment'}
                  </h3>
                </div>

                <span className="px-2.5 py-1 bg-[#ebdcb9]/20 text-[#856423] text-[10px] font-mono font-bold rounded uppercase">
                  {session.currency}
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs text-neutral-500 font-medium">Payable Amount Now:</span>
                <span className="font-serif text-xl font-bold text-[#c49a45]">
                  {formatPrice(session.payableAmount, session.currency)}
                </span>
              </div>

              {session.paymentType === 'advance_30' && (
                <p className="text-[10px] text-neutral-400 italic">
                  Remaining balance of {formatPrice(session.totalAmount - session.payableAmount, session.currency)} will be settled upon stitching completion.
                </p>
              )}
            </div>

            {/* Success Confirmation State */}
            {uploadSuccess ? (
              <div className="bg-white border border-green-200 rounded-xl p-6 text-center space-y-4 shadow-sm animate-fade-in">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto border border-green-100">
                  <CheckCircle className="w-7 h-7 text-green-600" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-serif text-base font-bold text-neutral-800 uppercase tracking-wider">
                    Payment Screenshot Uploaded!
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed max-w-xs mx-auto">
                    Your payment receipt has been linked to your order session. You may now return to your desktop screen to finalize your order.
                  </p>
                </div>

                {previewUrl && (
                  <div className="pt-2 border-t border-neutral-100">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block mb-2">
                      Uploaded Screenshot Preview
                    </span>
                    <img
                      src={previewUrl}
                      alt="Uploaded Screenshot Proof"
                      className="max-h-48 rounded border border-neutral-200 mx-auto object-contain shadow-xs bg-neutral-900"
                    />
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUploadSuccess(false);
                      setSelectedFile(null);
                    }}
                    className="text-xs text-[#c49a45] hover:underline font-serif font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Upload a Different Photo
                  </button>
                </div>
              </div>
            ) : (
              /* Upload Form */
              <form onSubmit={handleUploadSubmit} className="bg-white border border-[#ebdcb9] rounded-xl p-5 space-y-5 shadow-sm">
                <div className="space-y-1">
                  <h3 className="font-serif text-sm font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#c49a45]" />
                    <span>Upload Bank Receipt Screenshot</span>
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Select a payment screenshot from your photo gallery.
                  </p>
                </div>

                {/* Mobile Image Selector Buttons */}
                <div className="space-y-3">
                  <label className="block w-full cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="w-full py-3 px-4 border border-dashed border-[#c49a45]/60 hover:border-[#c49a45] bg-[#faf9f6] hover:bg-[#ebdcb9]/10 rounded-lg text-center transition-all space-y-1">
                      <div className="flex items-center justify-center gap-2 text-xs font-serif font-bold text-neutral-800 uppercase tracking-wider">
                        <ImageIcon className="w-4 h-4 text-[#c49a45]" />
                        <span>Choose Screenshot from Gallery</span>
                      </div>
                      <p className="text-[10px] text-neutral-400">
                        Supports JPG, PNG, WEBP up to 10MB
                      </p>
                    </div>
                  </label>
                </div>

                {/* Error Banner */}
                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* Client Side Image Preview */}
                {previewUrl && (
                  <div className="space-y-2 border-t border-neutral-100 pt-3">
                    <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold block">
                      Receipt Preview Before Uploading:
                    </span>
                    <div className="relative rounded overflow-hidden border border-neutral-200 bg-neutral-900 flex items-center justify-center p-1">
                      <img
                        src={previewUrl}
                        alt="Payment Receipt Preview"
                        className="max-h-56 object-contain rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Upload Action Button */}
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="w-full py-3.5 bg-[#c49a45] hover:bg-[#121212] text-white text-center text-xs tracking-[0.2em] font-serif uppercase font-bold transition-all rounded shadow-md border border-[#c49a45] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading to Order...</span>
                    </>
                  ) : (
                    <span>Upload Screenshot</span>
                  )}
                </button>
              </form>
            )}

            {/* Trust Footer */}
            <div className="text-center space-y-1 pt-2">
              <div className="flex items-center justify-center gap-1 text-[10px] text-neutral-400">
                <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
                <span>Encrypted & Linked to Session #{token.substring(0, 10)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

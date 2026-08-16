// src/app/ad/m/in/profile/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  Camera,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Building
} from 'lucide-react';
import CloudinaryUpload from '@/components/CloudinaryUpload';
import ConfirmEditModal, { AdminProfileData } from '@/components/admin/ConfirmEditModal';

export default function AdminProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Original fetched data from DB
  const [currentAdmin, setCurrentAdmin] = useState<AdminProfileData>({
    image: '',
    name: 'Huma & Manan Executive Admin',
    phone: '+92 300 1234567',
    email: 'admin@humamanan.com',
    pass: 'AHM@@123',
    address: 'Lahore, Gujrat, Pakistan',
  });

  // Editable form state
  const [formData, setFormData] = useState<AdminProfileData>({ ...currentAdmin });
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fetchAdminProfile = async () => {
    setLoading(true);
    setNotification(null);
    try {
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      if (res.ok && data.success && data.admin) {
        setCurrentAdmin(data.admin);
        setFormData(data.admin);
      }
    } catch (err) {
      console.error('Failed to fetch admin profile from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    queueMicrotask(() => fetchAdminProfile());
  }, []);

  const handleInputChange = (field: keyof AdminProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUploaded = (url: string) => {
    handleInputChange('image', url);
    setNotification({ type: 'success', message: 'New avatar image uploaded successfully!' });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.pass.trim()) {
      setNotification({ type: 'error', message: 'Name, Email, and Password are required fields.' });
      return;
    }
    setShowConfirmModal(true);
  };

  const handleExecuteSave = async () => {
    setSaving(true);
    setNotification(null);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok && data.success && data.admin) {
        setCurrentAdmin(data.admin);
        setFormData(data.admin);

        // Update email in local storage for session compatibility
        localStorage.setItem('admin_user_email', data.admin.email);

        setNotification({
          type: 'success',
          message: 'Admin Profile fields & image updated in Database successfully!',
        });

        setShowConfirmModal(false);
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Failed to update admin profile in database.',
        });
        setShowConfirmModal(false);
      }
    } catch (err: any) {
      console.error('Error updating admin profile:', err);
      setNotification({
        type: 'error',
        message: 'Network error: Unable to connect to server database.',
      });
      setShowConfirmModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-[#121212] border border-[#c49a45]/30 rounded-2xl p-6 sm:p-8 text-[#f2e6d0] shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#c49a45_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full border-2 border-[#c49a45] overflow-hidden bg-neutral-900 shadow-2xl flex items-center justify-center shrink-0 mx-auto sm:mx-0">
              {formData.image ? (
                <img src={formData.image} alt={formData.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[#c49a45]" />
              )}
            </div>
            <div>
              <span className="text-[9px] tracking-[0.25em] text-[#c49a45] uppercase block font-serif">
                Executive Atelier Account
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl text-white font-bold tracking-wide">
                {formData.name || 'Admin Profile'}
              </h1>
              <p className="text-xs text-neutral-400 font-light mt-1 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-3.5 h-3.5 text-[#c49a45]" />
                <span>{formData.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#1a1a1a] px-4 py-2 rounded-full border border-[#c49a45]/30">
            <ShieldCheck className="w-4 h-4 text-[#c49a45]" />
            <span className="text-[10px] uppercase font-serif tracking-widest text-[#ebdcb9]">
              Verified Super Admin
            </span>
          </div>
        </div>
      </div>

      {/* Main Profile Form Card */}
      <div className="bg-[#121212] border border-[#c49a45]/30 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="border-b border-[#c49a45]/20 pb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-white tracking-wider uppercase flex items-center gap-2">
            <User className="w-5 h-5 text-[#c49a45]" />
            <span>Update Executive Profile Fields</span>
          </h2>
          <span className="text-[10px] text-[#c49a45] uppercase font-serif tracking-widest">
            Database Synced
          </span>
        </div>

        {/* Notification alert */}
        {notification && (
          <div
            className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${notification.type === 'success'
                ? 'bg-green-950/40 border-green-500/40 text-green-200'
                : 'bg-red-950/40 border-red-500/40 text-red-200'
              }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
            <span className="font-serif text-xs">{notification.message}</span>
          </div>
        )}

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-neutral-400 text-xs font-serif tracking-widest uppercase">
              Loading Profile from Database...
            </p>
          </div>
        ) : (
          <form onSubmit={handleOpenConfirm} className="space-y-6 text-xs">
            {/* 1. Admin Image Field */}
            <div className="bg-[#1a1a1a] border border-[#c49a45]/20 rounded-xl p-5 space-y-4">
              <label className="block text-[11px] font-serif uppercase tracking-widest text-[#ebdcb9] font-bold">
                1. Profile Image / Avatar (image)
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full border-2 border-[#c49a45] overflow-hidden bg-neutral-900 shadow-xl flex items-center justify-center shrink-0">
                  {formData.image ? (
                    <img src={formData.image} alt={formData.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-[#c49a45]" />
                  )}
                </div>

                <div className="flex-1 space-y-3 w-full">
                  <div className="flex flex-wrap gap-2">
                    <div className="flex-1 min-w-[200px]">
                      <CloudinaryUpload
                        onUploadSuccess={handleImageUploaded}
                        label="Upload Avatar Photo"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="px-3 py-2 bg-[#262626] border border-neutral-700 rounded-lg text-neutral-300 hover:text-[#c49a45] hover:border-[#c49a45]/50 transition-colors text-[10px] font-serif uppercase"
                    >
                      {showUrlInput ? 'Hide URL Input' : 'Direct Image URL'}
                    </button>
                  </div>

                  {showUrlInput && (
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => handleInputChange('image', e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-3.5 py-2.5 bg-[#141414] border border-[#c49a45]/30 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c49a45]"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* 2. Grid Fields: Name, Phone, Email, Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-serif uppercase tracking-widest text-[#ebdcb9] mb-2 font-medium">
                  2. Admin Name (name) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c49a45]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#c49a45]/30 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c49a45]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-serif uppercase tracking-widest text-[#ebdcb9] mb-2 font-medium">
                  3. Phone Number (phone)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c49a45]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#c49a45]/30 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c49a45]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-serif uppercase tracking-widest text-[#ebdcb9] mb-2 font-medium">
                  4. Email Address (email) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c49a45]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="admin@humamanan.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#c49a45]/30 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c49a45]"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-serif uppercase tracking-widest text-[#ebdcb9] mb-2 font-medium">
                  5. Password (pass) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#c49a45]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.pass}
                    onChange={(e) => handleInputChange('pass', e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#1a1a1a] border border-[#c49a45]/30 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c49a45]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-[#c49a45] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Address Field */}
            <div>
              <label className="block text-[11px] font-serif uppercase tracking-widest text-[#ebdcb9] mb-2 font-medium">
                6. Atelier Address (address)
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-[#c49a45]">
                  <MapPin className="w-4 h-4" />
                </div>
                <textarea
                  rows={3}
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Atelier Address..."
                  className="w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#c49a45]/30 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#c49a45] resize-none"
                />
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-neutral-800 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...currentAdmin })}
                className="px-4 py-3 rounded-lg border border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-800 text-xs font-serif uppercase tracking-wider transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Fields</span>
              </button>

              <button
                type="submit"
                className="px-8 py-3.5 bg-[#c49a45] hover:bg-[#b08738] text-white text-xs uppercase tracking-[0.2em] font-serif font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmEditModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleExecuteSave}
        isLoading={saving}
        currentData={currentAdmin}
        newData={formData}
      />
    </div>
  );
}

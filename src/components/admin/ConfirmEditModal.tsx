// src/components/admin/ConfirmEditModal.tsx
"use client";

import React from 'react';
import { AlertTriangle, Check, X, ShieldAlert, Image as ImageIcon, User, Phone, Mail, Lock, MapPin, ArrowRight } from 'lucide-react';

export interface AdminProfileData {
  image: string;
  name: string;
  phone: string;
  email: string;
  pass: string;
  address: string;
}

interface ConfirmEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  currentData: AdminProfileData;
  newData: AdminProfileData;
}

export default function ConfirmEditModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  currentData,
  newData,
}: ConfirmEditModalProps) {
  if (!isOpen) return null;

  const isImageChanged = currentData.image !== newData.image;
  const isNameChanged = currentData.name !== newData.name;
  const isPhoneChanged = currentData.phone !== newData.phone;
  const isEmailChanged = currentData.email !== newData.email;
  const isPassChanged = currentData.pass !== newData.pass;
  const isAddressChanged = currentData.address !== newData.address;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141414] border border-[#c49a45]/40 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-[#1a1a1a] border-b border-[#c49a45]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#c49a45]/20 border border-[#c49a45]/50 flex items-center justify-center text-[#c49a45]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-white tracking-wide uppercase">
                Confirm Profile Update
              </h3>
              <p className="text-[11px] text-[#c49a45] font-serif tracking-wider uppercase">
                Database Modification Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          <div className="bg-[#c49a45]/10 border border-[#c49a45]/30 rounded-xl p-3.5 flex items-start gap-3 text-[#ebdcb9]">
            <AlertTriangle className="w-5 h-5 text-[#c49a45] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              You are about to save changes to the Admin profile in the database. Please review the updated fields including your profile image below.
            </p>
          </div>

          {/* Profile Image Preview Comparison */}
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-[#c49a45] font-serif uppercase tracking-widest text-[11px] font-semibold">
              <ImageIcon className="w-4 h-4" />
              <span>Profile Image Update</span>
              {isImageChanged && (
                <span className="ml-auto text-[9px] px-2 py-0.5 rounded bg-[#c49a45]/20 text-[#ebdcb9] border border-[#c49a45]/40 uppercase">
                  Modified
                </span>
              )}
            </div>

            <div className="flex items-center justify-around gap-4 pt-1">
              {/* Previous Image */}
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-full border-2 border-neutral-700 overflow-hidden bg-neutral-900 mx-auto">
                  {currentData.image ? (
                    <img src={currentData.image} alt="Current Admin" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-neutral-400 block font-serif uppercase">Previous Image</span>
              </div>

              <ArrowRight className="w-5 h-5 text-[#c49a45] shrink-0" />

              {/* New Image */}
              <div className="text-center space-y-1">
                <div className="w-16 h-16 rounded-full border-2 border-[#c49a45] overflow-hidden bg-neutral-900 mx-auto ring-4 ring-[#c49a45]/20">
                  {newData.image ? (
                    <img src={newData.image} alt="New Admin Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#c49a45]">
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-[#ebdcb9] block font-serif uppercase font-semibold">New Image</span>
              </div>
            </div>
          </div>

          {/* Fields Changes Overview Table */}
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-xl overflow-hidden divide-y divide-neutral-800">
            {/* Name */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <User className="w-3.5 h-3.5 text-[#c49a45]" />
                <span className="font-serif uppercase">Name:</span>
              </div>
              <div className="text-right">
                <span className={`font-medium ${isNameChanged ? 'text-[#c49a45] font-semibold' : 'text-white'}`}>
                  {newData.name}
                </span>
                {isNameChanged && <span className="block text-[9px] text-neutral-500 line-through">{currentData.name}</span>}
              </div>
            </div>

            {/* Phone */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <Phone className="w-3.5 h-3.5 text-[#c49a45]" />
                <span className="font-serif uppercase">Phone:</span>
              </div>
              <div className="text-right">
                <span className={`font-medium ${isPhoneChanged ? 'text-[#c49a45] font-semibold' : 'text-white'}`}>
                  {newData.phone || '(Not specified)'}
                </span>
                {isPhoneChanged && <span className="block text-[9px] text-neutral-500 line-through">{currentData.phone || 'None'}</span>}
              </div>
            </div>

            {/* Email */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <Mail className="w-3.5 h-3.5 text-[#c49a45]" />
                <span className="font-serif uppercase">Email:</span>
              </div>
              <div className="text-right">
                <span className={`font-medium ${isEmailChanged ? 'text-[#c49a45] font-semibold' : 'text-white'}`}>
                  {newData.email}
                </span>
                {isEmailChanged && <span className="block text-[9px] text-neutral-500 line-through">{currentData.email}</span>}
              </div>
            </div>

            {/* Password */}
            <div className="p-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <Lock className="w-3.5 h-3.5 text-[#c49a45]" />
                <span className="font-serif uppercase">Password:</span>
              </div>
              <div className="text-right">
                {isPassChanged ? (
                  <span className="text-[#c49a45] font-semibold bg-[#c49a45]/20 px-2 py-0.5 rounded text-[10px]">
                    Password Modified (••••••••)
                  </span>
                ) : (
                  <span className="text-neutral-400">Unchanged</span>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="p-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-neutral-400 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#c49a45]" />
                <span className="font-serif uppercase">Address:</span>
              </div>
              <div className="text-right max-w-[220px]">
                <span className={`font-medium block leading-tight ${isAddressChanged ? 'text-[#c49a45] font-semibold' : 'text-white'}`}>
                  {newData.address || '(Not specified)'}
                </span>
                {isAddressChanged && <span className="block text-[9px] text-neutral-500 line-through mt-0.5">{currentData.address || 'None'}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#1a1a1a] border-t border-[#c49a45]/20 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-lg border border-neutral-700 text-neutral-300 hover:bg-neutral-800 text-xs font-serif uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            Cancel / Edit
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg bg-[#c49a45] hover:bg-[#b08738] text-white text-xs font-serif font-bold uppercase tracking-widest shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Confirm & Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

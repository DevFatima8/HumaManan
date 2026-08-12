// src/app/ad/m/in/products/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useStore } from '@/context/StoreContext';
import { formatPrice } from '@/utils/format';
import { Plus, Trash2, Edit2, Check, UploadCloud, RefreshCw, X, Image as ImageIcon } from 'lucide-react';

export default function AdminProductsPage() {
  const { productsList, addProduct, updateProduct, deleteProduct, refreshData } = useStore();

  // Create Product Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'Women' | 'Kids' | 'Men'>('Women');
  const [subcategory, setSubcategory] = useState('');
  const [pkrPrice, setPkrPrice] = useState(250000);
  const [usdPrice, setUsdPrice] = useState(899);
  const [fabric, setFabric] = useState('Pure Raw Silk');
  const [care, setCare] = useState('Dry Clean Only');
  const [embroidery, setEmbroidery] = useState('Antique Tilla work with Swarovski Crystals');
  const [sku, setSku] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isFeatured, setIsFeatured] = useState(false);

  const [notification, setNotification] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get subcategories based on category
  const getSubcategories = (cat: string) => {
    if (cat === 'Women') {
      return ['Lehnga', 'Maxi', 'Pishwas', 'Formal', 'Ready to Wear'];
    } else if (cat === 'Kids') {
      return ['Frocks', 'Lehengas', 'Dresses', 'Traditional Wear'];
    } else if (cat === 'Men') {
      return ['Sherwani', 'Shalwar Kameez', 'Groom Wear'];
    }
    return [];
  };

  const showNotification = (msg: string, isError = false) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Handle Cloudinary Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 10) {
      showNotification('Maximum 10 images allowed!', true);
      return;
    }

    setUploading(true);
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      if (data.success) {
        setImages(prev => [...prev, data.url]);
        showNotification('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showNotification('Failed to upload image', true);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showNotification('Please enter product name', true);
      return;
    }
    if (!sku.trim()) {
      showNotification('Please enter SKU', true);
      return;
    }
    if (images.length === 0) {
      showNotification('Please upload at least 1 image', true);
      return;
    }
    if (images.length > 10) {
      showNotification('Maximum 10 images allowed', true);
      return;
    }

    setLoading(true);
    try {
      await addProduct({
        name: name.trim(),
        description: description.trim(),
        category,
        subcategory,
        gender: category,
        pkrPrice: Number(pkrPrice),
        usdPrice: Number(usdPrice),
        images,
        isFeatured,
        fabric: fabric.trim(),
        care: care.trim(),
        embroidery: embroidery.trim(),
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        sku: sku.trim(),
        discountPercent: discountPercent > 0 ? discountPercent : undefined,
      });

      setName('');
      setDescription('');
      setPkrPrice(250000);
      setUsdPrice(899);
      setFabric('Pure Raw Silk');
      setCare('Dry Clean Only');
      setEmbroidery('Antique Tilla work with Swarovski Crystals');
      setSku('');
      setImages([]);
      setDiscountPercent(0);
      setIsFeatured(false);
      showNotification(`✅ "${name}" successfully created!`);
    } catch (error: any) {
      showNotification(error.message || 'Failed to create product', true);
    } finally {
      setLoading(false);
    }
  };

  // Edit Mode States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [editUrlInput, setEditUrlInput] = useState('');
  const [editUploading, setEditUploading] = useState(false);

  const startEditing = (p: any) => {
    const productId = p._id || p.id; // Handle both MongoDB _id and regular id
    setEditingId(productId);
    setEditData({
      id: productId,
      name: p.name || '',
      sku: p.sku || '',
      description: p.description || '',
      category: p.category || 'Women',
      subcategory: p.subcategory || '',
      gender: p.gender || p.category || 'Women',
      pkrPrice: p.pkrPrice || 0,
      usdPrice: p.usdPrice || 0,
      fabric: p.fabric || '',
      care: p.care || '',
      embroidery: p.embroidery || '',
      isFeatured: Boolean(p.isFeatured),
      discountPercent: p.discountPercent || 0,
      images: Array.isArray(p.images) ? [...p.images] : [],
      sizes: Array.isArray(p.sizes) ? [...p.sizes] : ['XS', 'S', 'M', 'L', 'XL'],
    });
    setEditUrlInput('');
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentImages = editData.images || [];
    if (currentImages.length + files.length > 10) {
      showNotification('Maximum 10 images allowed!', true);
      return;
    }

    setEditUploading(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('file', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      if (data.success && data.url) {
        setEditData((prev: any) => ({
          ...prev,
          images: [...(prev.images || []), data.url],
        }));
        showNotification('Image uploaded and added to product!');
      }
    } catch (error) {
      console.error('Edit upload error:', error);
      showNotification('Failed to upload image', true);
    } finally {
      setEditUploading(false);
      e.target.value = '';
    }
  };

  const removeEditImage = (index: number) => {
    setEditData((prev: any) => ({
      ...prev,
      images: (prev.images || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    if (!editData.name?.trim()) {
      showNotification('Please enter product name', true);
      return;
    }
    if (!editData.sku?.trim()) {
      showNotification('Please enter SKU', true);
      return;
    }
    if (!editData.images || editData.images.length === 0) {
      showNotification('Product must have at least 1 image', true);
      return;
    }

    setLoading(true);
    try {
      await updateProduct({
        id: editingId,
        ...editData,
        pkrPrice: Number(editData.pkrPrice),
        usdPrice: Number(editData.usdPrice),
        discountPercent: Number(editData.discountPercent || 0),
      });
      setEditingId(null);
      showNotification(`✅ "${editData.name}" updated successfully!`);
    } catch (error: any) {
      showNotification(error.message || 'Failed to update product', true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      showNotification(`🗑️ "${name}" deleted successfully!`);
    } catch (error) {
      showNotification('Failed to delete product', true);
    }
  };

  // Get unique key for each product
  const getProductKey = (product: any) => {
    return product._id || product.id || `product-${Math.random()}`;
  };

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
              PRODUCT CATALOG MANAGER
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Create, edit, and manage products. Max 10 images per product. MongoDB + Cloudinary integrated.
            </p>
          </div>
          <button
            onClick={refreshData}
            className="px-4 py-2 border border-[#c49a45]/30 rounded text-xs text-[#ebdcb9] hover:bg-white/10 transition-colors flex items-center gap-1.5 font-semibold font-serif uppercase cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded text-xs font-semibold flex items-center gap-2 animate-fade-in ${notification.includes('✅') ? 'bg-green-50 border border-green-200 text-green-800' :
            notification.includes('🗑️') ? 'bg-red-50 border border-red-200 text-red-800' :
              'bg-yellow-50 border border-yellow-200 text-yellow-800'
          }`}>
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* LEFT: Add Product Form (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-[#ebdcb9]/40 rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3">
            <h2 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#c49a45]" />
              <span>Add New Product</span>
            </h2>
          </div>

          <form onSubmit={handleCreateProduct} className="space-y-4">

            {/* Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Royal Sherwani"
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  SKU Reference *
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. HM-MN-SH-01"
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                Description *
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product in detail..."
                className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                rows={3}
              />
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  Category *
                </label>
                <select
                  required
                  value={category}
                  onChange={(e) => {
                    const newCat = e.target.value as 'Women' | 'Kids' | 'Men';
                    setCategory(newCat);
                    const subs = getSubcategories(newCat);
                    if (subs.length > 0) setSubcategory(subs[0]);
                  }}
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                >
                  <option value="Women">Women</option>
                  <option value="Kids">Kids</option>
                  <option value="Men">Men</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  Subcategory *
                </label>
                <select
                  required
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                >
                  {getSubcategories(category).map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  PKR Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={pkrPrice}
                  onChange={(e) => setPkrPrice(Number(e.target.value))}
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  USD Price *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={usdPrice}
                  onChange={(e) => setUsdPrice(Number(e.target.value))}
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                />
              </div>
            </div>

            {/* Fabric, Care, Embroidery */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  Fabric
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={(e) => setFabric(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  Care
                </label>
                <input
                  type="text"
                  value={care}
                  onChange={(e) => setCare(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                />
              </div>
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  Embroidery
                </label>
                <input
                  type="text"
                  value={embroidery}
                  onChange={(e) => setEmbroidery(e.target.value)}
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                />
              </div>
            </div>

            {/* Discount & Featured */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-widest font-semibold mb-1">
                  Discount % (Optional)
                </label>
                <input
                  type="number"
                  min="0"
                  max="95"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  placeholder="e.g. 15"
                  className="w-full bg-[#faf9f6] border border-[#ebdcb9]/50 rounded px-3 py-2 text-sm text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#c49a45]"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-neutral-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-[#c49a45] text-[#c49a45] focus:ring-[#c49a45]"
                  />
                  <span className="text-[10px] uppercase tracking-widest font-semibold">Featured Product</span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-3 border-t border-[#ebdcb9]/20 pt-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
                  Product Images ({images.length}/10) *
                </label>
                <span className="text-[9px] text-neutral-400">Max 10 images</span>
              </div>

              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploading || images.length >= 10}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`border-2 border-dashed border-[#ebdcb9] rounded-lg p-6 text-center transition-colors ${images.length >= 10 ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#c49a45]'
                  }`}>
                  <UploadCloud className="w-8 h-8 text-[#c49a45] mx-auto mb-2" />
                  <p className="text-xs text-neutral-500">
                    {uploading ? 'Uploading...' : 'Click to upload images'}
                  </p>
                  <p className="text-[10px] text-neutral-400">JPG, PNG, WebP supported</p>
                </div>
              </div>

              {/* Image Preview Grid */}
              {images.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded overflow-hidden border border-[#ebdcb9]/30 group">
                      <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[8px] px-1.5 py-0.5 rounded">
                        {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="w-full py-3 bg-[#c49a45] hover:bg-[#121212] text-white hover:text-[#ebdcb9] text-xs uppercase tracking-[0.2em] font-serif font-bold transition-all rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Creating...</span>
                </div>
              ) : (
                'Publish Product'
              )}
            </button>
          </form>
        </div>

        {/* RIGHT: Product List (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-[#ebdcb9]/40 rounded-lg p-6 shadow-sm space-y-6">
          <div className="border-b border-neutral-100 pb-3 flex justify-between items-center">
            <h2 className="font-serif text-base tracking-widest text-[#121212] uppercase flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#c49a45]" />
              <span>Product List ({productsList.length})</span>
            </h2>
            <span className="text-[10px] text-neutral-400">Newest first</span>
          </div>

          {productsList.length === 0 ? (
            <div className="py-16 text-center text-neutral-400">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-sm font-serif">No products yet</p>
              <p className="text-xs">Create your first product using the form</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {productsList.map((product: any, idx: number) => {
                // Get unique key - use _id from MongoDB or id from local data
                const productKey = product._id || product.id || `product-${idx}`;
                const isEditing = editingId === productKey;

                return (
                  <div
                    key={productKey}
                    className={`p-4 border rounded-lg transition-all ${isEditing ? 'border-[#c49a45] bg-[#ebdcb9]/5' : 'border-[#ebdcb9]/30 hover:border-neutral-300'
                      }`}
                  >
                    {isEditing ? (
                      /* EDIT FORM */
                      <form onSubmit={handleSaveEdit} className="space-y-3 bg-white p-3 rounded border border-[#c49a45]/40 shadow-sm">
                        <div className="flex items-center justify-between border-b pb-2 mb-1">
                          <h3 className="text-xs font-serif font-bold text-[#121212] uppercase tracking-wider">
                            Editing Product: {editData.name || 'Untitled'}
                          </h3>
                          <span className="text-[9px] font-mono bg-[#c49a45]/15 text-[#c49a45] px-1.5 py-0.5 rounded uppercase font-bold">
                            {editData.sku}
                          </span>
                        </div>

                        {/* Images Editing Section */}
                        <div className="bg-neutral-50 p-2.5 rounded border border-neutral-200 space-y-2">
                          <label className="text-[9px] uppercase text-neutral-600 font-bold block">
                            Product Images (Max 10) *
                          </label>

                          <div className="flex flex-wrap gap-2">
                            {(editData.images || []).map((imgUrl: string, idx: number) => (
                              <div key={idx} className="relative w-14 h-16 rounded overflow-hidden border border-[#ebdcb9] bg-white group flex-shrink-0">
                                <img src={imgUrl} alt={`Product thumbnail ${idx}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeEditImage(idx)}
                                  className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5 hover:bg-red-700 transition-colors"
                                  title="Remove Image"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}

                            {(editData.images || []).length < 10 && (
                              <label className="w-14 h-16 rounded border-2 border-dashed border-[#c49a45]/50 flex flex-col items-center justify-center cursor-pointer hover:border-[#c49a45] transition-colors bg-white flex-shrink-0">
                                {editUploading ? (
                                  <div className="w-4 h-4 border-2 border-[#c49a45] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <>
                                    <UploadCloud className="w-4 h-4 text-[#c49a45]" />
                                    <span className="text-[8px] font-serif text-[#c49a45] font-bold mt-0.5">+ Image</span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleEditImageUpload}
                                  className="hidden"
                                />
                              </label>
                            )}
                          </div>

                          <div className="flex gap-2 items-center pt-1">
                            <input
                              type="url"
                              value={editUrlInput}
                              onChange={(e) => setEditUrlInput(e.target.value)}
                              placeholder="Paste image URL..."
                              className="flex-1 bg-white border border-neutral-300 rounded px-2 py-1 text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editUrlInput.trim()) {
                                  setEditData((prev: any) => ({
                                    ...prev,
                                    images: [...(prev.images || []), editUrlInput.trim()],
                                  }));
                                  setEditUrlInput('');
                                }
                              }}
                              className="px-2.5 py-1 bg-[#121212] text-[#ebdcb9] hover:text-white text-[10px] rounded font-serif uppercase font-bold"
                            >
                              Add URL
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Name *</label>
                            <input
                              type="text"
                              required
                              value={editData.name || ''}
                              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">SKU *</label>
                            <input
                              type="text"
                              required
                              value={editData.sku || ''}
                              onChange={(e) => setEditData({ ...editData, sku: e.target.value })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Description</label>
                          <textarea
                            value={editData.description || ''}
                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                            className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            rows={2}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Category</label>
                            <select
                              value={editData.category || 'Women'}
                              onChange={(e) => setEditData({ ...editData, category: e.target.value, gender: e.target.value })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            >
                              <option value="Women">Women</option>
                              <option value="Kids">Kids</option>
                              <option value="Men">Men</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Subcategory</label>
                            <input
                              type="text"
                              value={editData.subcategory || ''}
                              onChange={(e) => setEditData({ ...editData, subcategory: e.target.value })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Fabric</label>
                            <input
                              type="text"
                              value={editData.fabric || ''}
                              onChange={(e) => setEditData({ ...editData, fabric: e.target.value })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Care</label>
                            <input
                              type="text"
                              value={editData.care || ''}
                              onChange={(e) => setEditData({ ...editData, care: e.target.value })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Embroidery</label>
                            <input
                              type="text"
                              value={editData.embroidery || ''}
                              onChange={(e) => setEditData({ ...editData, embroidery: e.target.value })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">PKR Price</label>
                            <input
                              type="number"
                              value={editData.pkrPrice || 0}
                              onChange={(e) => setEditData({ ...editData, pkrPrice: Number(e.target.value) })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">USD Price</label>
                            <input
                              type="number"
                              value={editData.usdPrice || 0}
                              onChange={(e) => setEditData({ ...editData, usdPrice: Number(e.target.value) })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[9px] uppercase text-neutral-500 font-bold block mb-0.5">Discount %</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={editData.discountPercent || 0}
                              onChange={(e) => setEditData({ ...editData, discountPercent: Number(e.target.value) })}
                              className="w-full bg-white border border-neutral-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                          <label className="flex items-center gap-1.5 text-[10px] text-neutral-700 font-medium">
                            <input
                              type="checkbox"
                              checked={Boolean(editData.isFeatured)}
                              onChange={(e) => setEditData({ ...editData, isFeatured: e.target.checked })}
                              className="w-3.5 h-3.5 text-[#c49a45]"
                            />
                            Featured Product
                          </label>
                        </div>

                        <div className="flex gap-2 justify-end pt-2 border-t border-neutral-200">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-3 py-1.5 text-[10px] uppercase font-serif tracking-widest text-neutral-600 hover:text-black border border-neutral-300 rounded"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 text-[10px] uppercase font-serif tracking-widest bg-[#c49a45] text-white rounded font-bold hover:bg-[#a37e33] shadow"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* READ VIEW */
                      <div className="flex gap-4 items-start justify-between">
                        <div className="flex gap-3 items-start flex-1 min-w-0">
                          {/* Thumbnail */}
                          <div className="w-14 h-20 rounded overflow-hidden bg-neutral-100 border border-[#ebdcb9]/40 flex-shrink-0">
                            <img
                              src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
                              alt={product.name}
                              className="w-full h-full object-cover object-top"
                            />
                          </div>

                          {/* Details */}
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-serif font-bold text-xs text-neutral-800 truncate">{product.name}</span>
                              <span className="text-[9px] font-mono bg-neutral-100 text-neutral-500 px-1 rounded flex-shrink-0">{product.sku}</span>
                              {product.isFeatured && (
                                <span className="text-[8px] bg-[#c49a45] text-white px-1.5 py-0.5 rounded uppercase font-bold flex-shrink-0">Featured</span>
                              )}
                              {product.discountPercent > 0 && (
                                <span className="text-[8px] bg-red-500 text-white px-1.5 py-0.5 rounded uppercase font-bold flex-shrink-0">
                                  -{product.discountPercent}%
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-neutral-400 uppercase font-mono">
                              {product.category} &gt; {product.subcategory}
                            </p>
                            <p className="text-[10px] text-neutral-500 line-clamp-1">{product.description}</p>

                            <div className="flex gap-3 text-xs pt-0.5">
                              <span className="text-[#c49a45] font-bold">{formatPrice(product.pkrPrice, 'PKR')}</span>
                              <span className="text-neutral-600 font-bold">{formatPrice(product.usdPrice, 'USD')}</span>
                              <span className="text-[9px] text-neutral-400">{product.images?.length || 0} images</span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => startEditing(product)}
                            className="p-1.5 text-neutral-500 hover:text-[#c49a45] hover:bg-neutral-50 rounded transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(productKey, product.name)}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
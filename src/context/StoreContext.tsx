// context/StoreContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product as ProductType } from '@/data/products';

// Re-export Product type from products.ts
export type Product = ProductType;

export interface CartItem {
  id: number;
  name: string;
  sku: string;
  pkrPrice: number;
  usdPrice: number;
  image: string;
  size: string;
  quantity: number;
  currencySelected: 'PKR' | 'USD';
}

export interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  city: string;
  country: string;
  postalCode: string;
  totalAmount: number;
  currency: 'PKR' | 'USD';
  paymentMethod: string;
  status: string;
  items: any[];
  notes: string;
  createdAt: string;
}

export interface Discount {
  id: string;
  productId: string;
  discountPercent: number;
}

export interface Inspiration {
  _id: string;
  name: string;
  phone: string;
  message: string;
  images: string[];  // Changed from imageUrl to images array
  status: 'Pending' | 'Viewed' | 'Contacted' | 'Completed';
  createdAt: string;
  updatedAt: string;
}

interface StoreContextType {
  currency: 'PKR' | 'USD';
  setCurrency: (currency: 'PKR' | 'USD') => void;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'currencySelected'>) => void;
  removeFromCart: (id: number, size: string) => void;
  updateQuantity: (id: number, size: string, qty: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  getCartTotal: () => number;

  productsList: Product[];
  setProductsList: (products: Product[]) => void;
  addProduct: (product: any) => Promise<void>;
  updateProduct: (product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  ordersList: Order[];
  addOrder: (order: Omit<Order, 'id'>) => number;
  updateOrderStatus: (orderId: number, status: string) => void;

  discountsList: Discount[];
  addDiscount: (productId: string, percent: number) => Promise<void>;
  deleteDiscount: (productId: string) => Promise<void>;

  inspirationsList: Inspiration[];
  fetchInspirations: () => Promise<void>;
  updateInspirationStatus: (id: string, status: string) => Promise<void>;
  deleteInspiration: (id: string) => Promise<void>;
  pendingInspirationsCount: number;

  refreshData: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<'PKR' | 'USD'>('PKR');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [discountsList, setDiscountsList] = useState<Discount[]>([]);
  const [inspirationsList, setInspirationsList] = useState<Inspiration[]>([]);
  const [pendingInspirationsCount, setPendingInspirationsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch products from MongoDB
  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        // Map MongoDB _id to id for consistency
        const products = data.products.map((p: any) => ({
          ...p,
          id: p._id, // Set id from _id
          _id: p._id, // Keep _id as well
        }));
        setProductsList(products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Fetch discounts from MongoDB
  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/discounts');
      const data = await response.json();
      if (data.success) {
        setDiscountsList(data.discounts);
      }
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  // Fetch inspirations from MongoDB
  const fetchInspirations = async () => {
    try {
      const response = await fetch('/api/inspiration');
      const data = await response.json();
      if (data.success) {
        setInspirationsList(data.inspirations);
        const pending = data.inspirations.filter((i: Inspiration) => i.status === 'Pending').length;
        setPendingInspirationsCount(pending);
      }
    } catch (error) {
      console.error('Error fetching inspirations:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchProducts(), fetchDiscounts(), fetchInspirations()]);
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => {
      refreshData();

      const savedCurrency = localStorage.getItem('humamanan_currency') as 'PKR' | 'USD';
      if (savedCurrency === 'PKR' || savedCurrency === 'USD') {
        setCurrencyState(savedCurrency);
      }

      const savedCart = localStorage.getItem('humamanan_cart');
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } catch (e) { console.error(e); }
      }

      const savedOrders = localStorage.getItem('humamanan_orders');
      if (savedOrders) {
        try { setOrdersList(JSON.parse(savedOrders)); } catch (e) { console.error(e); }
      }
    });
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('humamanan_cart', JSON.stringify(newCart));
  };

  const setCurrency = (curr: 'PKR' | 'USD') => {
    setCurrencyState(curr);
    localStorage.setItem('humamanan_currency', curr);
    const updatedCart = cart.map(item => ({ ...item, currencySelected: curr }));
    saveCart(updatedCart);
  };

  const addToCart = (newItem: Omit<CartItem, 'currencySelected'>) => {
    const existingIndex = cart.findIndex(
      item => item.id === newItem.id && item.size === newItem.size
    );
    let newCart = [...cart];
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += newItem.quantity;
    } else {
      newCart.push({ ...newItem, currencySelected: currency });
    }
    saveCart(newCart);
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, size: string) => {
    const newCart = cart.filter(item => !(item.id === id && item.size === size));
    saveCart(newCart);
  };

  const updateQuantity = (id: number, size: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id, size);
      return;
    }
    const newCart = cart.map(item => {
      if (item.id === id && item.size === size) {
        return { ...item, quantity: qty };
      }
      return item;
    });
    saveCart(newCart);
  };

  const clearCart = () => { saveCart([]); };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      let pkr = item.pkrPrice;
      let usd = item.usdPrice;

      const disc = discountsList.find(d => d.productId === item.id.toString());
      if (disc) {
        pkr = Math.round(pkr * (1 - disc.discountPercent / 100));
        usd = Math.round(usd * (1 - disc.discountPercent / 100));
      }
      const price = currency === 'PKR' ? pkr : usd;
      return total + (price * item.quantity);
    }, 0);
  };

  // PRODUCT CRUD with MongoDB
  const addProduct = async (productData: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = async (productData: any) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await refreshData();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  // DISCOUNTS CRUD with MongoDB
  const addDiscount = async (productId: string, percent: number) => {
    try {
      const response = await fetch('/api/discounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, discountPercent: percent }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchDiscounts();
      }
    } catch (error) {
      console.error('Error adding discount:', error);
      throw error;
    }
  };

  const deleteDiscount = async (productId: string) => {
    try {
      const response = await fetch(`/api/discounts?productId=${productId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await fetchDiscounts();
      }
    } catch (error) {
      console.error('Error deleting discount:', error);
      throw error;
    }
  };

  // INSPIRATIONS CRUD with MongoDB
  const updateInspirationStatus = async (id: string, status: string) => {
    try {
      const response = await fetch('/api/inspiration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json();
      if (data.success) {
        await fetchInspirations();
      }
    } catch (error) {
      console.error('Error updating inspiration:', error);
      throw error;
    }
  };

  const deleteInspiration = async (id: string) => {
    try {
      const response = await fetch(`/api/inspiration?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        await fetchInspirations();
      }
    } catch (error) {
      console.error('Error deleting inspiration:', error);
      throw error;
    }
  };

  // ORDERS (keep localStorage for now, can migrate to MongoDB later)
  const addOrder = (orderData: Omit<Order, 'id'>) => {
    const nextId = ordersList.length > 0 ? Math.max(...ordersList.map(o => o.id)) + 1 : 1001;
    const finalOrder: Order = { id: nextId, ...orderData };
    const updated = [finalOrder, ...ordersList];
    setOrdersList(updated);
    localStorage.setItem('humamanan_orders', JSON.stringify(updated));
    return nextId;
  };

  const updateOrderStatus = (orderId: number, status: string) => {
    const updated = ordersList.map(o => o.id === orderId ? { ...o, status } : o);
    setOrdersList(updated);
    localStorage.setItem('humamanan_orders', JSON.stringify(updated));
  };

  return (
    <StoreContext.Provider value={{
      currency,
      setCurrency,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      getCartTotal,

      productsList,
      setProductsList,
      addProduct,
      updateProduct,
      deleteProduct,

      ordersList,
      addOrder,
      updateOrderStatus,

      discountsList,
      addDiscount,
      deleteDiscount,

      inspirationsList,
      fetchInspirations,
      updateInspirationStatus,
      deleteInspiration,
      pendingInspirationsCount,

      refreshData,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
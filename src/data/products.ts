// src/data/products.ts
export interface Product {
  id: number | string;  // Allow both number and string
  _id?: string;         // Optional MongoDB _id
  name: string;
  description: string;
  category: 'Women' | 'Kids' | 'Men';
  subcategory: string;
  pkrPrice: number;
  usdPrice: number;
  images: string[];
  isFeatured: boolean;
  fabric: string;
  care: string;
  embroidery: string;
  sizes: string[];
  sku: string;
  gender: 'Women' | 'Kids' | 'Men';
  discountPercent?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
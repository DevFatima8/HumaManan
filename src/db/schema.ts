import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Products Table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // 'Lehenga', 'Maxi', 'Saree', 'Anarkali', 'Kurta'
  pkrPrice: integer('pkr_price').notNull(), // Price in PKR
  usdPrice: integer('usd_price').notNull(), // Price in USD
  images: jsonb('images').$type<string[]>().notNull(), // Array of up to 10 image URLs
  isFeatured: boolean('is_featured').default(false).notNull(),
  fabric: text('fabric').notNull(), // e.g., 'Pure Raw Silk', 'Organza', 'French Net'
  care: text('care').default('Dry Clean Only').notNull(), // Care instructions
  embroidery: text('embroidery'), // e.g., 'Hand embellishment with dabka, naqshi, tilla, and sequins'
  sizes: jsonb('sizes').$type<string[]>().default(['XS', 'S', 'M', 'L', 'XL', 'Custom']).notNull(), // Supported sizes
  sku: text('sku').unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders Table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  customerName: text('customer_name').notNull(),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerAddress: text('customer_address').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull(),
  postalCode: text('postal_code').notNull(),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').notNull(), // 'PKR' or 'USD'
  paymentMethod: text('payment_method').default('COD').notNull(), // Cash on Delivery (COD)
  status: text('status').default('Pending').notNull(), // 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered'
  items: jsonb('items').$type<{
    productId: number;
    name: string;
    pkrPrice: number;
    usdPrice: number;
    size: string;
    quantity: number;
    image: string;
  }[]>().notNull(), // JSON list of ordered items
  notes: text('notes'), // Custom instructions (e.g. measurements for Custom size)
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

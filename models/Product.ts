// models/Product.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IProduct {
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
    createdAt: Date;
    updatedAt: Date;
}

// Custom validator for images array
function arrayLimit(val: string[]) {
    return val.length <= 10;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: { type: String, enum: ['Women', 'Kids', 'Men'], required: true },
        subcategory: { type: String, required: true },
        pkrPrice: { type: Number, required: true },
        usdPrice: { type: Number, required: true },
        images: {
            type: [String],
            required: true,
            validate: [arrayLimit, 'Maximum 10 images allowed'],
            default: []
        },
        isFeatured: { type: Boolean, default: false },
        fabric: { type: String, required: true },
        care: { type: String, required: true },
        embroidery: { type: String, required: true },
        sizes: {
            type: [String],
            default: ['XS', 'S', 'M', 'L', 'XL']
        },
        sku: { type: String, required: true, unique: true },
        gender: { type: String, enum: ['Women', 'Kids', 'Men'], required: true },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
ProductSchema.index({ category: 1 });
ProductSchema.index({ sku: 1 }, { unique: true });
ProductSchema.index({ createdAt: -1 });

export const Product = models.Product || model<IProduct>('Product', ProductSchema);
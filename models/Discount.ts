// models/Discount.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IDiscount {
    productId: mongoose.Types.ObjectId;
    discountPercent: number;
    createdAt: Date;
    updatedAt: Date;
}

const DiscountSchema = new Schema<IDiscount>(
    {
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        discountPercent: {
            type: Number,
            required: true,
            min: 1,
            max: 95
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

// Index for faster lookups
DiscountSchema.index({ productId: 1 }, { unique: true });

export const Discount = models.Discount || model<IDiscount>('Discount', DiscountSchema);
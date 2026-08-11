// src/models/Order.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IOrder {
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
    items: {
        productId: string;  // Changed from number to string
        name: string;
        pkrPrice: number;
        usdPrice: number;
        size: string;
        quantity: number;
        image: string;
    }[];
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrderItemSchema = new Schema({
    productId: { type: String, required: true },  // Changed to String
    name: { type: String, required: true },
    pkrPrice: { type: Number, required: true },
    usdPrice: { type: Number, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String, required: true },
});

const OrderSchema = new Schema<IOrder>(
    {
        customerName: { type: String, required: true },
        customerEmail: { type: String, required: true },
        customerPhone: { type: String, required: true },
        customerAddress: { type: String, required: true },
        city: { type: String, required: true },
        country: { type: String, required: true },
        postalCode: { type: String, required: true },
        totalAmount: { type: Number, required: true },
        currency: { type: String, enum: ['PKR', 'USD'], required: true },
        paymentMethod: { type: String, default: 'COD' },
        status: { type: String, default: 'Pending' },
        items: {
            type: [OrderItemSchema],
            required: true,
            default: []
        },
        notes: { type: String, default: '' },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
    }
);

export const Order = models.Order || model<IOrder>('Order', OrderSchema);
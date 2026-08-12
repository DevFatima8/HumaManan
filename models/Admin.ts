// models/Admin.ts
import mongoose, { Schema, model, models } from 'mongoose';

export interface IAdmin {
    _id?: string;
    image: string;
    name: string;
    phone: string;
    email: string;
    pass: string;
    address: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const AdminSchema = new Schema<IAdmin>(
    {
        image: { type: String, default: '' },
        name: { type: String, required: true, default: 'Huma & Manan Admin' },
        phone: { type: String, default: '+92 300 1234567' },
        email: { type: String, required: true, unique: true },
        pass: { type: String, required: true },
        address: { type: String, default: 'Atelier 14, MM Alam Road, Gulberg III, Lahore, Pakistan' },
    },
    {
        timestamps: true,
    }
);

// Index for fast email lookup
AdminSchema.index({ email: 1 }, { unique: true });

export const Admin = models.Admin || model<IAdmin>('Admin', AdminSchema);

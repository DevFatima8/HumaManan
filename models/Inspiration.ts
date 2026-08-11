// models/Inspiration.ts
import mongoose, { Schema, models } from 'mongoose';

const InspirationSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
    },
    message: {
        type: String,
        default: '',
        trim: true,
    },
    images: {
        type: [String],
        default: [],
        validate: {
            validator: function (v: string[]) {
                return v.length <= 10;
            },
            message: 'Maximum 10 images allowed'
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Viewed', 'Contacted', 'Completed'],
        default: 'Pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Check if model already exists
const Inspiration = models.Inspiration || mongoose.model('Inspiration', InspirationSchema);

export { Inspiration };
// app/api/discounts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from 'lib/mongodb';
import { Discount } from 'models/Discount';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await connectToDatabase();
        const discounts = await Discount.find({}).lean();
        return NextResponse.json({ success: true, discounts });
    } catch (error) {
        console.error('Error fetching discounts:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch discounts' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const { productId, discountPercent } = await request.json();

        if (!productId || !discountPercent) {
            return NextResponse.json(
                { success: false, error: 'Product ID and discount percent are required' },
                { status: 400 }
            );
        }

        const existingDiscount = await Discount.findOne({ productId });
        if (existingDiscount) {
            existingDiscount.discountPercent = Number(discountPercent);
            existingDiscount.updatedAt = new Date();
            await existingDiscount.save();
            return NextResponse.json({ success: true, discount: existingDiscount });
        }

        const discount = await Discount.create({
            productId: new mongoose.Types.ObjectId(productId),
            discountPercent: Number(discountPercent),
        });

        return NextResponse.json({ success: true, discount }, { status: 201 });
    } catch (error) {
        console.error('Error creating discount:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create discount' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        await Discount.findOneAndDelete({ productId });
        return NextResponse.json({
            success: true,
            message: 'Discount deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting discount:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete discount' },
            { status: 500 }
        );
    }
}
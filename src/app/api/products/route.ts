// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from 'lib/mongodb';
import { Product } from 'models/Product';
import { Discount } from 'models/Discount';

// GET - Fetch all products (sorted by createdAt descending)
export async function GET() {
    try {
        await connectToDatabase();
        const products = await Product.find({})
            .sort({ createdAt: -1 })
            .lean();

        // Fetch discounts for products
        const discounts = await Discount.find({});
        const discountMap = discounts.reduce((acc, d) => {
            acc[d.productId.toString()] = d.discountPercent;
            return acc;
        }, {} as Record<string, number>);

        // Combine products with discounts
        const productsWithDiscounts = products.map(p => ({
            ...p,
            discountPercent: discountMap[p._id.toString()] || 0,
        }));

        return NextResponse.json({ success: true, products: productsWithDiscounts });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 }
        );
    }
}

// POST - Create new product
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();

        const {
            name,
            description,
            category,
            subcategory,
            pkrPrice,
            usdPrice,
            images,
            isFeatured,
            fabric,
            care,
            embroidery,
            sizes,
            sku,
            gender,
            discountPercent,
        } = body;

        // Validate
        if (!name || !description || !category || !subcategory || !pkrPrice || !usdPrice || !images || !sku || !gender) {
            return NextResponse.json(
                { success: false, error: 'All required fields must be filled' },
                { status: 400 }
            );
        }

        if (images.length > 10) {
            return NextResponse.json(
                { success: false, error: 'Maximum 10 images allowed' },
                { status: 400 }
            );
        }

        // Check if SKU already exists
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) {
            return NextResponse.json(
                { success: false, error: 'SKU already exists' },
                { status: 400 }
            );
        }

        // Create product
        const product = await Product.create({
            name,
            description,
            category,
            subcategory,
            pkrPrice: Number(pkrPrice),
            usdPrice: Number(usdPrice),
            images,
            isFeatured: isFeatured || false,
            fabric,
            care,
            embroidery,
            sizes: sizes || ['XS', 'S', 'M', 'L', 'XL'],
            sku,
            gender,
        });

        // If discount is provided, create discount
        if (discountPercent && discountPercent > 0) {
            await Discount.create({
                productId: product._id,
                discountPercent: Number(discountPercent),
            });
        }

        return NextResponse.json({
            success: true,
            product,
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create product' },
            { status: 500 }
        );
    }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true }
        );

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            product,
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update product' },
            { status: 500 }
        );
    }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const product = await Product.findByIdAndDelete(id);
        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Product not found' },
                { status: 404 }
            );
        }

        // Delete associated discount
        await Discount.findOneAndDelete({ productId: id });

        return NextResponse.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete product' },
            { status: 500 }
        );
    }
}
// src/app/api/inspiration/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from 'lib/mongodb';
import { Inspiration } from 'models/Inspiration';

// GET - Fetch all inspirations
export async function GET() {
    try {
        await connectToDatabase();
        const inspirations = await Inspiration.find({})
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            inspirations
        });
    } catch (error) {
        console.error('Error fetching inspirations:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch inspirations' },
            { status: 500 }
        );
    }
}

// POST - Create new inspiration
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();

        console.log('Received inspiration data:', {
            name: body.name,
            phone: body.phone,
            imagesCount: body.images?.length || 0,
            hasMessage: !!body.message
        });

        const { name, phone, message, images } = body;

        // Validation
        if (!name || !phone) {
            return NextResponse.json(
                { success: false, error: 'Name and phone are required' },
                { status: 400 }
            );
        }

        // Validate images
        if (!images || images.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Please upload at least one image' },
                { status: 400 }
            );
        }

        // Validate images count
        if (images.length > 10) {
            return NextResponse.json(
                { success: false, error: 'Maximum 10 images allowed' },
                { status: 400 }
            );
        }

        // Filter valid image URLs (Cloudinary URLs or base64)
        const validImages = images.filter((img: string) => {
            // Accept both Cloudinary URLs and base64 (with size check for base64)
            if (img.startsWith('http')) {
                return true; // Cloudinary URL
            }
            if (img.startsWith('data:image')) {
                // Check base64 size (rough estimate)
                const base64Size = img.length * 0.75; // approximate bytes
                if (base64Size > 5 * 1024 * 1024) { // 5MB max for base64
                    console.warn('Base64 image too large:', base64Size);
                    return false;
                }
                return true;
            }
            return false;
        });

        if (validImages.length === 0) {
            return NextResponse.json(
                { success: false, error: 'No valid images found. Please upload images again.' },
                { status: 400 }
            );
        }

        console.log(`Saving ${validImages.length} valid images for inspiration`);

        const inspiration = await Inspiration.create({
            name: name.trim(),
            phone: phone.trim(),
            message: message || '',
            images: validImages,
            status: 'Pending',
        });

        console.log('Inspiration created successfully:', inspiration._id);

        return NextResponse.json({
            success: true,
            inspiration,
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating inspiration:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create inspiration' },
            { status: 500 }
        );
    }
}

// PUT - Update inspiration status
export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();
        const body = await request.json();
        const { id, status } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: 'ID and status are required' },
                { status: 400 }
            );
        }

        const inspiration = await Inspiration.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!inspiration) {
            return NextResponse.json(
                { success: false, error: 'Inspiration not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            inspiration,
        });
    } catch (error) {
        console.error('Error updating inspiration:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update inspiration' },
            { status: 500 }
        );
    }
}

// DELETE - Delete inspiration
export async function DELETE(request: NextRequest) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID is required' },
                { status: 400 }
            );
        }

        const result = await Inspiration.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json(
                { success: false, error: 'Inspiration not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Inspiration deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting inspiration:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete inspiration' },
            { status: 500 }
        );
    }
}
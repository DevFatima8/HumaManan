// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Disable body parsing for this route
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({
                success: false,
                error: 'No file uploaded'
            }, { status: 400 });
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({
                success: false,
                error: 'Invalid file type. Please upload JPG, PNG, WEBP, or GIF.'
            }, { status: 400 });
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({
                success: false,
                error: 'File size must be less than 10MB'
            }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        console.log('Uploading to Cloudinary...');

        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: 'humamanan/inspirations',
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' },
                        { width: 1200, crop: 'limit' }
                    ],
                },
                (error, result) => {
                    if (error) {
                        console.error('Cloudinary upload error:', error);
                        reject(error);
                    } else {
                        console.log('Cloudinary upload success:', result?.secure_url);
                        resolve(result);
                    }
                }
            ).end(buffer);
        });

        return NextResponse.json({
            success: true,
            url: (result as any).secure_url,
            public_id: (result as any).public_id,
        });

    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Upload failed. Please try again.'
            },
            { status: 500 }
        );
    }
}
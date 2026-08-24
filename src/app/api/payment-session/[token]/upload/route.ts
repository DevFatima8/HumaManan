import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from 'lib/mysql';
import { v2 as cloudinary } from 'cloudinary';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;
    const token = resolvedParams.token;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token is required' }, { status: 400 });
    }

    await initDatabase();

    // Verify token session exists and is active
    const [rows]: any = await pool.query('SELECT * FROM payment_sessions WHERE id = ?', [token]);
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired payment upload link.' },
        { status: 404 }
      );
    }

    const session = rows[0];
    const now = new Date();
    if (now > new Date(session.expires_at) || session.status === 'expired') {
      return NextResponse.json(
        { success: false, error: 'This QR upload link has expired. Please refresh the QR code on your desktop screen.' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No screenshot file provided.' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file format. Please upload JPG, PNG, or WEBP image.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 10MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'humamanan/payment_proofs',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 1600, crop: 'limit' }
          ],
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const secureUrl = uploadResult.secure_url;

    // Update payment session record
    await pool.query(
      `UPDATE payment_sessions 
       SET screenshot_url = ?, status = 'uploaded', upload_source = 'mobile_qr' 
       WHERE id = ?`,
      [secureUrl, token]
    );

    // If order_id exists on session, update orders table record as well
    if (session.order_id) {
      await pool.query(
        `UPDATE orders 
         SET payment_screenshot = ?, 
             payment_status = 'submitted', 
             upload_source = 'mobile_qr', 
             payment_submitted_at = NOW(), 
             payment_rejection_reason = NULL,
             status = 'Pending',
             updated_at = NOW() 
         WHERE id = ?`,
        [secureUrl, session.order_id]
      );
    }

    return NextResponse.json({
      success: true,
      url: secureUrl,
      message: 'Payment screenshot uploaded successfully!',
    });
  } catch (error: any) {
    console.error('Error in mobile payment screenshot upload API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server upload error. Please try again.' },
      { status: 500 }
    );
  }
}

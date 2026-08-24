import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from 'lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentScreenshot, customerPhone, customerEmail } = body;

    if (!orderId || !paymentScreenshot) {
      return NextResponse.json(
        { success: false, error: 'Order ID and payment screenshot are required.' },
        { status: 400 }
      );
    }

    await initDatabase();

    // Verify order exists
    const [rows]: any = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Order not found.' },
        { status: 404 }
      );
    }

    const order = rows[0];

    // Optional ownership check by phone or email if provided
    if (customerPhone && order.customer_phone !== customerPhone) {
      // allow if email matches
      if (customerEmail && order.customer_email !== customerEmail) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized to update this order.' },
          { status: 403 }
        );
      }
    }

    await pool.query(
      `UPDATE orders 
       SET payment_screenshot = ?, 
           payment_status = 'submitted', 
           payment_submitted_at = NOW(), 
           payment_rejection_reason = NULL,
           status = 'Pending',
           updated_at = NOW() 
       WHERE id = ?`,
      [paymentScreenshot, orderId]
    );

    return NextResponse.json({
      success: true,
      message: 'Payment proof submitted successfully! Our team will verify it shortly.'
    });
  } catch (error: any) {
    console.error('Error submitting payment proof:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit payment proof.' },
      { status: 500 }
    );
  }
}

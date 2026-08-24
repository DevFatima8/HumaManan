import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from 'lib/mysql';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action, rejectionReason } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { success: false, error: 'Order ID and action are required' },
        { status: 400 }
      );
    }

    await initDatabase();

    if (action === 'verify') {
      await pool.query(
        `UPDATE orders 
         SET payment_status = 'verified', 
             payment_verified_at = NOW(), 
             status = 'Confirmed', 
             updated_at = NOW() 
         WHERE id = ?`,
        [orderId]
      );

      return NextResponse.json({
        success: true,
        message: `Order #${orderId} payment verified successfully!`
      });
    } else if (action === 'reject') {
      if (!rejectionReason || !rejectionReason.trim()) {
        return NextResponse.json(
          { success: false, error: 'Rejection reason is required' },
          { status: 400 }
        );
      }

      await pool.query(
        `UPDATE orders 
         SET payment_status = 'rejected', 
             payment_rejected_at = NOW(), 
             payment_rejection_reason = ?, 
             status = 'Payment Rejected', 
             updated_at = NOW() 
         WHERE id = ?`,
        [rejectionReason.trim(), orderId]
      );

      return NextResponse.json({
        success: true,
        message: `Order #${orderId} payment rejected.`
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Must be "verify" or "reject"' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error in payment verification API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error verifying payment' },
      { status: 500 }
    );
  }
}

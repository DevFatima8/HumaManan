import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from 'lib/mysql';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { totalAmount, payableAmount, paymentType = 'advance_30', currency = 'PKR', orderId = null } = body;

    await initDatabase();

    // Generate cryptographically secure 32-char token
    const token = `ps_${crypto.randomBytes(16).toString('hex')}`;
    
    // Set 30 minute expiration
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await pool.query(
      `INSERT INTO payment_sessions 
       (id, order_id, total_amount, payable_amount, payment_type, currency, status, upload_source, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', 'mobile_qr', ?)`,
      [
        token,
        orderId || null,
        Number(totalAmount || 0),
        Number(payableAmount || 0),
        paymentType,
        currency,
        expiresAt,
      ]
    );

    return NextResponse.json({
      success: true,
      token,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error: any) {
    console.error('Error creating payment session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment session' },
      { status: 500 }
    );
  }
}

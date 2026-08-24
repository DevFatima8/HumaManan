import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from 'lib/mysql';

export async function GET(
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

    const [rows]: any = await pool.query('SELECT * FROM payment_sessions WHERE id = ?', [token]);
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Payment session not found or link is invalid.' },
        { status: 404 }
      );
    }

    const session = rows[0];
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    const isExpired = now > expiresAt;

    if (isExpired && session.status === 'pending') {
      await pool.query("UPDATE payment_sessions SET status = 'expired' WHERE id = ?", [token]);
      session.status = 'expired';
    }

    return NextResponse.json({
      success: true,
      session: {
        token: session.id,
        orderId: session.order_id,
        totalAmount: Number(session.total_amount),
        payableAmount: Number(session.payable_amount),
        paymentType: session.payment_type,
        currency: session.currency,
        screenshotUrl: session.screenshot_url,
        status: session.status,
        uploadSource: session.upload_source,
        isExpired: isExpired || session.status === 'expired',
        expiresAt: session.expires_at,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payment session:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}

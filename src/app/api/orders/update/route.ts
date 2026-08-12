import { NextResponse } from 'next/server';
import pool, { initDatabase } from 'lib/mysql';

export async function POST(request: Request) {
  try {
    const { orderId, newStatus } = await request.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    await initDatabase();
    await pool.query('UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?', [newStatus, orderId]);

    return NextResponse.json({ success: true, updatedStatus: newStatus });
  } catch (error: any) {
    console.error('Error updating order status in MySQL:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating order status.' },
      { status: 500 }
    );
  }
}

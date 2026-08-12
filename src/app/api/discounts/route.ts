import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from 'lib/mysql';

export async function GET() {
  try {
    await initDatabase();
    const [rows]: any = await pool.query('SELECT * FROM discounts');
    const discounts = rows.map((r: any) => ({
      _id: String(r.id),
      productId: r.product_id,
      discountPercent: Number(r.discount_percent),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }));
    return NextResponse.json({ success: true, discounts });
  } catch (error: any) {
    console.error('Error fetching discounts from MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch discounts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    const { productId, discountPercent } = await request.json();

    if (!productId || !discountPercent) {
      return NextResponse.json(
        { success: false, error: 'Product ID and discount percent are required' },
        { status: 400 }
      );
    }

    await pool.query(
      `INSERT INTO discounts (product_id, discount_percent) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE discount_percent = VALUES(discount_percent), updated_at = NOW()`,
      [String(productId), Number(discountPercent)]
    );

    const [rows]: any = await pool.query('SELECT * FROM discounts WHERE product_id = ?', [String(productId)]);
    const discount = {
      _id: String(rows[0].id),
      productId: rows[0].product_id,
      discountPercent: Number(rows[0].discount_percent),
      createdAt: rows[0].created_at,
      updatedAt: rows[0].updated_at,
    };

    return NextResponse.json({ success: true, discount }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating discount in MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create discount' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM discounts WHERE product_id = ?', [productId]);
    return NextResponse.json({
      success: true,
      message: 'Discount deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting discount from MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete discount' },
      { status: 500 }
    );
  }
}
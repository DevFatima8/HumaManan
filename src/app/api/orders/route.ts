import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase, safeJsonParse } from 'lib/mysql';

function formatOrderRow(row: any) {
  return {
    _id: row.id,
    id: row.id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    city: row.city,
    country: row.country,
    postalCode: row.postal_code,
    totalAmount: Number(row.total_amount),
    currency: row.currency,
    paymentMethod: row.payment_method,
    status: row.status,
    items: safeJsonParse(row.items, []),
    notes: row.notes || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET - Fetch all orders (with optional id or phone filter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const phone = searchParams.get('phone');

    await initDatabase();

    let query = 'SELECT * FROM orders';
    const params: any[] = [];

    if (id) {
      query += ' WHERE id = ?';
      params.push(id);
    } else if (phone) {
      query += ' WHERE customer_phone = ?';
      params.push(phone);
    }

    query += ' ORDER BY created_at DESC';

    const [rows]: any = await pool.query(query, params);
    const orders = rows.map(formatOrderRow);

    return NextResponse.json({
      success: true,
      orders,
      order: orders.length > 0 ? orders[0] : null
    });
  } catch (error: any) {
    console.error('Error fetching orders from MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create order
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      city,
      country,
      postalCode,
      totalAmount,
      currency,
      items,
      notes
    } = body;

    // Server-side validation
    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !city || !country || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Please fill in all required shipping and contact fields.' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.name || !item.pkrPrice || !item.usdPrice || !item.size || !item.quantity) {
        return NextResponse.json(
          { error: 'Invalid item data. Please check all fields.' },
          { status: 400 }
        );
      }
    }

    await initDatabase();

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await pool.query(
      `INSERT INTO orders 
      (id, customer_name, customer_email, customer_phone, customer_address, city, country, postal_code, total_amount, currency, payment_method, status, items, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        city,
        country,
        postalCode || 'N/A',
        Number(totalAmount),
        currency || 'PKR',
        'COD',
        'Pending',
        JSON.stringify(items),
        notes || '',
      ]
    );

    console.log('Order created in MySQL:', orderId);

    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: 'Order placed successfully!'
    });

  } catch (error: any) {
    console.error('Error creating order in MySQL:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while placing your luxury order.' },
      { status: 500 }
    );
  }
}

// DELETE - Delete order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Order ID is required' },
        { status: 400 }
      );
    }

    await initDatabase();
    await pool.query('DELETE FROM orders WHERE id = ?', [id]);

    return NextResponse.json({ success: true, message: 'Order deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting order in MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete order' },
      { status: 500 }
    );
  }
}
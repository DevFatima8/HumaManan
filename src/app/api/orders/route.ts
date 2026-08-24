import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase, safeJsonParse } from 'lib/mysql';

function formatOrderRow(row: any) {
  const orderTotal = Number(row.order_total || row.total_amount || 0);
  const payableAmount = row.payable_amount !== undefined && row.payable_amount !== null
    ? Number(row.payable_amount)
    : (row.payment_type === 'advance_30' ? Math.round(orderTotal * 0.3 * 100) / 100 : orderTotal);
  const remainingAmount = row.remaining_amount !== undefined && row.remaining_amount !== null
    ? Number(row.remaining_amount)
    : (row.payment_type === 'advance_30' ? Math.round((orderTotal - payableAmount) * 100) / 100 : 0);

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
    totalAmount: orderTotal,
    currency: row.currency,
    paymentMethod: row.payment_method || 'Bank Transfer',
    paymentType: row.payment_type || 'full_100',
    orderTotal: orderTotal,
    payableAmount: payableAmount,
    remainingAmount: remainingAmount,
    paymentStatus: row.payment_status || 'pending',
    paymentScreenshot: row.payment_screenshot || '',
    paymentSubmittedAt: row.payment_submitted_at,
    paymentVerifiedAt: row.payment_verified_at,
    paymentRejectedAt: row.payment_rejected_at,
    paymentRejectionReason: row.payment_rejection_reason || '',
    uploadSource: row.upload_source || 'web',
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
      currency = 'PKR',
      items,
      notes,
      paymentMethod = 'Bank Transfer',
      paymentType = 'full_100',
      paymentScreenshot = '',
      uploadSource = 'web',
      paymentSessionToken = null,
    } = body;

    // Server-side validation
    if (!customerName || !customerEmail || !customerPhone || !customerAddress || !city || !country || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Please fill in all required shipping and contact fields.' },
        { status: 400 }
      );
    }

    // Require payment screenshot if Bank Transfer selected
    if (paymentMethod === 'Bank Transfer' && !paymentScreenshot) {
      return NextResponse.json(
        { error: 'Please upload your payment screenshot to complete bank transfer booking.' },
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

    // Server-side calculation of amounts (do not trust frontend inputs)
    const calculatedTotal = items.reduce((sum: number, item: any) => {
      const price = currency === 'USD' ? Number(item.usdPrice) : Number(item.pkrPrice);
      return sum + (price * Number(item.quantity));
    }, 0);

    const finalTotal = calculatedTotal > 0 ? calculatedTotal : Number(body.totalAmount || 0);

    let calculatedPayable = finalTotal;
    let calculatedRemaining = 0;

    if (paymentMethod === 'Bank Transfer' && paymentType === 'advance_30') {
      calculatedPayable = Math.round(finalTotal * 0.30 * 100) / 100;
      calculatedRemaining = Math.round((finalTotal - calculatedPayable) * 100) / 100;
    } else if (paymentMethod === 'Bank Transfer' && paymentType === 'full_100') {
      calculatedPayable = finalTotal;
      calculatedRemaining = 0;
    } else {
      calculatedPayable = finalTotal;
      calculatedRemaining = 0;
    }

    const initialPaymentStatus = paymentMethod === 'Bank Transfer'
      ? (paymentScreenshot ? 'submitted' : 'pending')
      : 'pending';

    const submittedAt = paymentScreenshot ? new Date() : null;

    await initDatabase();

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await pool.query(
      `INSERT INTO orders 
      (id, customer_name, customer_email, customer_phone, customer_address, city, country, postal_code, total_amount, currency, payment_method, payment_type, order_total, payable_amount, remaining_amount, payment_status, payment_screenshot, payment_submitted_at, upload_source, status, items, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        city,
        country,
        postalCode || 'N/A',
        finalTotal,
        currency || 'PKR',
        paymentMethod,
        paymentType,
        finalTotal,
        calculatedPayable,
        calculatedRemaining,
        initialPaymentStatus,
        paymentScreenshot,
        submittedAt,
        uploadSource || 'web',
        'Pending',
        JSON.stringify(items),
        notes || '',
      ]
    );

    if (paymentSessionToken) {
      await pool.query(
        "UPDATE payment_sessions SET status = 'completed', order_id = ? WHERE id = ?",
        [orderId, paymentSessionToken]
      );
    }

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
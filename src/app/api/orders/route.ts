// src/app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from 'lib/mongodb';
import { Order } from 'models/Order';

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

    // Connect to MongoDB
    await connectToDatabase();

    // Create order in MongoDB
    const order = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      city,
      country,
      postalCode: postalCode || 'N/A',
      totalAmount: Number(totalAmount),
      currency: currency || 'PKR',
      paymentMethod: 'COD',
      status: 'Pending',
      items: items.map((item: any) => ({
        ...item,
        productId: String(item.productId) // Ensure string
      })),
      notes: notes || '',
    });

    console.log('Order created successfully:', order._id);

    return NextResponse.json({
      success: true,
      orderId: order._id,
      message: 'Order placed successfully!'
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while placing your luxury order.' },
      { status: 500 }
    );
  }
}
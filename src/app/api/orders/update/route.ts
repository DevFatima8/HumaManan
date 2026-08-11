import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { orderId, newStatus } = await request.json();

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Success response - state is kept safe entirely in client-side localStorage
    return NextResponse.json({ success: true, updatedStatus: newStatus });
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while updating order status.' },
      { status: 500 }
    );
  }
}

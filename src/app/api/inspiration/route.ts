import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase, safeJsonParse } from 'lib/mysql';

function formatInspirationRow(row: any) {
  return {
    _id: row.id,
    id: row.id,
    name: row.name,
    phone: row.phone,
    message: row.message || '',
    images: safeJsonParse(row.images, []),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET - Fetch all inspirations
export async function GET() {
  try {
    await initDatabase();
    const [rows]: any = await pool.query('SELECT * FROM inspirations ORDER BY created_at DESC');
    const inspirations = rows.map(formatInspirationRow);

    return NextResponse.json({
      success: true,
      inspirations
    });
  } catch (error: any) {
    console.error('Error fetching inspirations from MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch inspirations' },
      { status: 500 }
    );
  }
}

// POST - Create new inspiration
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    const body = await request.json();

    const { name, phone, message, images } = body;

    // Validation
    if (!name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone are required' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please upload at least one image' },
        { status: 400 }
      );
    }

    if (images.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    const id = `insp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await pool.query(
      `INSERT INTO inspirations (id, name, phone, message, images, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        phone.trim(),
        message || '',
        JSON.stringify(images),
        'Pending'
      ]
    );

    const [rows]: any = await pool.query('SELECT * FROM inspirations WHERE id = ?', [id]);
    const inspiration = formatInspirationRow(rows[0]);

    return NextResponse.json({
      success: true,
      inspiration,
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating inspiration in MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create inspiration' },
      { status: 500 }
    );
  }
}

// PUT - Update inspiration status
export async function PUT(request: NextRequest) {
  try {
    await initDatabase();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'ID and status are required' },
        { status: 400 }
      );
    }

    await pool.query('UPDATE inspirations SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    const [rows]: any = await pool.query('SELECT * FROM inspirations WHERE id = ?', [id]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Inspiration not found' },
        { status: 404 }
      );
    }

    const inspiration = formatInspirationRow(rows[0]);
    return NextResponse.json({
      success: true,
      inspiration,
    });
  } catch (error: any) {
    console.error('Error updating inspiration in MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update inspiration' },
      { status: 500 }
    );
  }
}

// DELETE - Delete inspiration
export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID is required' },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query('DELETE FROM inspirations WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Inspiration not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Inspiration deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting inspiration from MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete inspiration' },
      { status: 500 }
    );
  }
}
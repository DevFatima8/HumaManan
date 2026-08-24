import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase } from 'lib/mysql';
import { connectToDatabase } from 'lib/mongodb';
import { Admin } from 'models/Admin';

const DEFAULT_ADMIN = {
  image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
  name: 'Huma & Manan Executive Admin',
  phone: '+92 300 1234567',
  email: 'admin@humamanan.com',
  pass: 'AHM@@123',
  address: 'Lahore, Gujrat, Pakistan'
};

// Helper to format MySQL admin row
function formatAdminRow(row: any) {
  return {
    id: row.id,
    image: row.image || DEFAULT_ADMIN.image,
    name: row.name || DEFAULT_ADMIN.name,
    phone: row.phone || DEFAULT_ADMIN.phone,
    email: row.email || DEFAULT_ADMIN.email,
    pass: row.pass || DEFAULT_ADMIN.pass,
    address: row.address || DEFAULT_ADMIN.address,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET - Fetch current admin details from DB
export async function GET() {
  try {
    // 1. Try MySQL Database
    try {
      await initDatabase();
      const [rows]: any = await pool.query('SELECT * FROM admin ORDER BY id ASC LIMIT 1');
      if (rows && rows.length > 0) {
        return NextResponse.json({ success: true, admin: formatAdminRow(rows[0]) });
      }

      // Seed default admin in MySQL if empty
      await pool.query(
        `INSERT INTO admin (image, name, phone, email, pass, address) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          DEFAULT_ADMIN.image,
          DEFAULT_ADMIN.name,
          DEFAULT_ADMIN.phone,
          DEFAULT_ADMIN.email,
          DEFAULT_ADMIN.pass,
          DEFAULT_ADMIN.address,
        ]
      );
      const [newRows]: any = await pool.query('SELECT * FROM admin ORDER BY id ASC LIMIT 1');
      if (newRows && newRows.length > 0) {
        return NextResponse.json({ success: true, admin: formatAdminRow(newRows[0]) });
      }
    } catch (mysqlErr) {
      console.warn('MySQL admin fetch warning:', mysqlErr);
    }

    // 2. Fallback / Sync with MongoDB
    try {
      await connectToDatabase();
      let mongoAdmin = await Admin.findOne({});
      if (!mongoAdmin) {
        mongoAdmin = await Admin.create(DEFAULT_ADMIN);
      }
      return NextResponse.json({
        success: true,
        admin: {
          id: mongoAdmin._id.toString(),
          image: mongoAdmin.image || DEFAULT_ADMIN.image,
          name: mongoAdmin.name,
          phone: mongoAdmin.phone,
          email: mongoAdmin.email,
          pass: mongoAdmin.pass,
          address: mongoAdmin.address,
        }
      });
    } catch (mongoErr) {
      console.warn('MongoDB admin fetch warning:', mongoErr);
    }

    // Default fallback
    return NextResponse.json({ success: true, admin: DEFAULT_ADMIN });
  } catch (error: any) {
    console.error('Error fetching admin profile:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to fetch admin profile' }, { status: 500 });
  }
}

// PUT - Update admin profile in DB
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, name, phone, email, pass, address } = body;

    if (!name || !email || !pass) {
      return NextResponse.json(
        { success: false, error: 'Name, Email, and Password are required fields.' },
        { status: 400 }
      );
    }

    const updatedData = {
      image: image || DEFAULT_ADMIN.image,
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      email: email.trim().toLowerCase(),
      pass: pass.trim(),
      address: address ? address.trim() : '',
    };

    let updatedAdmin: any = null;

    // 1. Update in MySQL Database
    try {
      await initDatabase();
      const [rows]: any = await pool.query('SELECT id FROM admin ORDER BY id ASC LIMIT 1');

      if (rows && rows.length > 0) {
        const adminId = rows[0].id;
        await pool.query(
          `UPDATE admin SET image = ?, name = ?, phone = ?, email = ?, pass = ?, address = ? WHERE id = ?`,
          [
            updatedData.image,
            updatedData.name,
            updatedData.phone,
            updatedData.email,
            updatedData.pass,
            updatedData.address,
            adminId,
          ]
        );
      } else {
        await pool.query(
          `INSERT INTO admin (image, name, phone, email, pass, address) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            updatedData.image,
            updatedData.name,
            updatedData.phone,
            updatedData.email,
            updatedData.pass,
            updatedData.address,
          ]
        );
      }

      const [updatedRows]: any = await pool.query('SELECT * FROM admin ORDER BY id ASC LIMIT 1');
      if (updatedRows && updatedRows.length > 0) {
        updatedAdmin = formatAdminRow(updatedRows[0]);
      }
    } catch (mysqlErr) {
      console.error('Failed to update MySQL admin table:', mysqlErr);
    }

    // 2. Sync / Update in MongoDB
    try {
      await connectToDatabase();
      const mongoAdmin = await Admin.findOneAndUpdate(
        {},
        { $set: updatedData },
        { new: true, upsert: true }
      );

      if (!updatedAdmin && mongoAdmin) {
        updatedAdmin = {
          id: mongoAdmin._id.toString(),
          image: mongoAdmin.image,
          name: mongoAdmin.name,
          phone: mongoAdmin.phone,
          email: mongoAdmin.email,
          pass: mongoAdmin.pass,
          address: mongoAdmin.address,
        };
      }
    } catch (mongoErr) {
      console.warn('MongoDB sync warning:', mongoErr);
    }

    // Return response
    const finalAdmin = updatedAdmin || updatedData;
    return NextResponse.json({
      success: true,
      message: 'Admin profile updated successfully in database',
      admin: finalAdmin,
    });
  } catch (error: any) {
    console.error('Error updating admin profile:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update admin profile' },
      { status: 500 }
    );
  }
}

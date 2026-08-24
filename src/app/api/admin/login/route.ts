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

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and Password are required.' },
        { status: 400 }
      );
    }

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    let adminFound: any = null;

    // 1. Initialize MySQL & check admin table
    try {
      await initDatabase();

      // Check if admin table has any records. If completely empty, seed default admin record first.
      const [countRows]: any = await pool.query('SELECT COUNT(*) as cnt FROM admin');
      if (!countRows || countRows[0].cnt === 0) {
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
      }

      // Query database for matching email
      const [rows]: any = await pool.query(
        'SELECT * FROM admin WHERE LOWER(email) = ? LIMIT 1',
        [inputEmail]
      );

      if (rows && rows.length > 0) {
        adminFound = {
          email: rows[0].email,
          pass: rows[0].pass,
          name: rows[0].name,
          image: rows[0].image,
        };
      }
    } catch (mysqlErr) {
      console.warn('MySQL login lookup warning:', mysqlErr);
    }

    // 2. Fallback check against MongoDB if not found in MySQL
    if (!adminFound) {
      try {
        await connectToDatabase();

        const countMongo = await Admin.countDocuments({});
        if (countMongo === 0) {
          await Admin.create(DEFAULT_ADMIN);
        }

        const mongoAdmin = await Admin.findOne({ email: inputEmail });
        if (mongoAdmin) {
          adminFound = {
            email: mongoAdmin.email,
            pass: mongoAdmin.pass,
            name: mongoAdmin.name,
            image: mongoAdmin.image,
          };
        }
      } catch (mongoErr) {
        console.warn('MongoDB login lookup warning:', mongoErr);
      }
    }

    // 3. Strict authentication check against database record
    if (!adminFound) {
      // User email does not match any record in database
      return NextResponse.json(
        { success: false, error: 'Invalid Executive Credentials. Access Denied.' },
        { status: 401 }
      );
    }

    // Compare EXACT password stored in database
    if (adminFound.pass !== inputPass) {
      return NextResponse.json(
        { success: false, error: 'Invalid Executive Credentials. Password does not match.' },
        { status: 401 }
      );
    }

    // Password matches database record exactly!
    return NextResponse.json({
      success: true,
      message: 'Admin authenticated successfully.',
      admin: {
        email: adminFound.email,
        name: adminFound.name,
        image: adminFound.image,
      }
    });

  } catch (error: any) {
    console.error('Error during admin login authentication:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication server error' },
      { status: 500 }
    );
  }
}

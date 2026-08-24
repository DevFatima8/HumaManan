import mysql from 'mysql2/promise';

// Global mysql connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '194.59.164.13',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'u543868211_manan',
  password: process.env.MYSQL_PASSWORD || 'HM@@12hm',
  database: process.env.MYSQL_DATABASE || 'u543868211_huma',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 20000,
});

let isInitialized = false;

// Initialize tables if they do not exist
export async function initDatabase() {
  if (isInitialized) return;

  try {
    const connection = await pool.getConnection();

    // 1. Products table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(64) PRIMARY KEY,
        sku VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        subcategory VARCHAR(100) NOT NULL,
        pkr_price DECIMAL(10,2) NOT NULL,
        usd_price DECIMAL(10,2) NOT NULL,
        images JSON NOT NULL,
        sizes JSON NOT NULL,
        is_featured TINYINT(1) DEFAULT 0,
        fabric VARCHAR(255) NOT NULL,
        care TEXT NOT NULL,
        embroidery VARCHAR(255) NOT NULL,
        gender VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Discounts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS discounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(64) NOT NULL UNIQUE,
        discount_percent INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. Orders table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(100) NOT NULL,
        customer_address TEXT NOT NULL,
        city VARCHAR(100) NOT NULL,
        country VARCHAR(100) NOT NULL,
        postal_code VARCHAR(50) DEFAULT 'N/A',
        total_amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'PKR',
        payment_method VARCHAR(50) DEFAULT 'Bank Transfer',
        payment_type VARCHAR(20) DEFAULT 'full_100',
        order_total DECIMAL(10,2) DEFAULT 0.00,
        payable_amount DECIMAL(10,2) DEFAULT 0.00,
        remaining_amount DECIMAL(10,2) DEFAULT 0.00,
        payment_status VARCHAR(50) DEFAULT 'pending',
        payment_screenshot VARCHAR(500) DEFAULT '',
        payment_submitted_at DATETIME NULL,
        payment_verified_at DATETIME NULL,
        payment_rejected_at DATETIME NULL,
        payment_rejection_reason TEXT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        items JSON NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure all payment columns exist on orders table if table already existed
    const paymentColumns = [
      { name: 'payment_type', type: "VARCHAR(20) DEFAULT 'full_100'" },
      { name: 'order_total', type: 'DECIMAL(10,2) DEFAULT 0.00' },
      { name: 'payable_amount', type: 'DECIMAL(10,2) DEFAULT 0.00' },
      { name: 'remaining_amount', type: 'DECIMAL(10,2) DEFAULT 0.00' },
      { name: 'payment_status', type: "VARCHAR(50) DEFAULT 'pending'" },
      { name: 'payment_screenshot', type: "VARCHAR(500) DEFAULT ''" },
      { name: 'payment_submitted_at', type: 'DATETIME NULL' },
      { name: 'payment_verified_at', type: 'DATETIME NULL' },
      { name: 'payment_rejected_at', type: 'DATETIME NULL' },
      { name: 'payment_rejection_reason', type: 'TEXT NULL' },
      { name: 'upload_source', type: "VARCHAR(20) DEFAULT 'web'" },
    ];

    for (const col of paymentColumns) {
      try {
        await connection.query(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}`);
      } catch (err: any) {
        if (err.code !== 'ER_DUP_FIELDNAME') {
          console.warn(`Migration note for ${col.name}:`, err.message);
        }
      }
    }

    // 4. Payment Sessions Table (for QR code mobile upload)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payment_sessions (
        id VARCHAR(64) PRIMARY KEY,
        order_id VARCHAR(64) NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        payable_amount DECIMAL(10,2) NOT NULL,
        payment_type VARCHAR(20) DEFAULT 'advance_30',
        currency VARCHAR(10) DEFAULT 'PKR',
        screenshot_url VARCHAR(500) DEFAULT '',
        status VARCHAR(20) DEFAULT 'pending',
        upload_source VARCHAR(20) DEFAULT 'mobile_qr',
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Inspirations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS inspirations (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        message TEXT,
        images JSON NOT NULL,
        status VARCHAR(50) DEFAULT 'Pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Admin table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image VARCHAR(500) DEFAULT '',
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) DEFAULT '',
        email VARCHAR(255) NOT NULL UNIQUE,
        pass VARCHAR(255) NOT NULL,
        address TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    connection.release();
    isInitialized = true;
    console.log('✅ Hostinger MySQL Database & Tables Initialized Successfully');
  } catch (error) {
    console.error('❌ Failed to initialize MySQL Database:', error);
    throw error;
  }
}

// Safely parse JSON strings or objects
export function safeJsonParse(data: any, fallback: any = []) {
  if (!data) return fallback;
  if (typeof data === 'object') return data;
  try {
    return JSON.parse(data);
  } catch {
    return fallback;
  }
}

export default pool;

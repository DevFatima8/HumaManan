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
        payment_method VARCHAR(50) DEFAULT 'COD',
        status VARCHAR(50) DEFAULT 'Pending',
        items JSON NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

import { NextRequest, NextResponse } from 'next/server';
import pool, { initDatabase, safeJsonParse } from 'lib/mysql';

// Helper to format product object for frontend compatibility
function formatProductRow(row: any) {
  return {
    _id: row.id,
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory,
    pkrPrice: Number(row.pkr_price),
    usdPrice: Number(row.usd_price),
    images: safeJsonParse(row.images, []),
    sizes: safeJsonParse(row.sizes, ['XS', 'S', 'M', 'L', 'XL']),
    isFeatured: Boolean(row.is_featured),
    fabric: row.fabric,
    care: row.care,
    embroidery: row.embroidery,
    gender: row.gender,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET - Fetch all products
export async function GET() {
  try {
    await initDatabase();
    const [productRows]: any = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    const [discountRows]: any = await pool.query('SELECT * FROM discounts');

    const discountMap = discountRows.reduce((acc: any, d: any) => {
      acc[d.product_id] = Number(d.discount_percent);
      return acc;
    }, {});

    const productsWithDiscounts = productRows.map((p: any) => {
      const formatted = formatProductRow(p);
      return {
        ...formatted,
        discountPercent: discountMap[formatted._id] || 0,
      };
    });

    return NextResponse.json({ success: true, products: productsWithDiscounts });
  } catch (error: any) {
    console.error('Error fetching products from MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create product
export async function POST(request: NextRequest) {
  try {
    await initDatabase();
    const body = await request.json();

    const {
      name,
      description,
      category,
      subcategory,
      pkrPrice,
      usdPrice,
      images,
      isFeatured,
      fabric,
      care,
      embroidery,
      sizes,
      sku,
      gender,
      discountPercent,
    } = body;

    if (!name || !description || !category || !subcategory || !pkrPrice || !usdPrice || !images || !sku || !gender) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled' },
        { status: 400 }
      );
    }

    if (images.length > 10) {
      return NextResponse.json(
        { success: false, error: 'Maximum 10 images allowed' },
        { status: 400 }
      );
    }

    // Check SKU uniqueness
    const [existing]: any = await pool.query('SELECT id FROM products WHERE sku = ?', [sku]);
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, error: 'SKU already exists' },
        { status: 400 }
      );
    }

    const id = `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const productSizes = sizes || ['XS', 'S', 'M', 'L', 'XL'];

    await pool.query(
      `INSERT INTO products 
      (id, sku, name, description, category, subcategory, pkr_price, usd_price, images, sizes, is_featured, fabric, care, embroidery, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        sku,
        name,
        description,
        category,
        subcategory,
        Number(pkrPrice),
        Number(usdPrice),
        JSON.stringify(images),
        JSON.stringify(productSizes),
        isFeatured ? 1 : 0,
        fabric,
        care,
        embroidery,
        gender,
      ]
    );

    if (discountPercent && Number(discountPercent) > 0) {
      await pool.query(
        `INSERT INTO discounts (product_id, discount_percent) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE discount_percent = VALUES(discount_percent)`,
        [id, Number(discountPercent)]
      );
    }

    const [createdRows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    const product = formatProductRow(createdRows[0]);

    return NextResponse.json(
      {
        success: true,
        product: {
          ...product,
          discountPercent: discountPercent ? Number(discountPercent) : 0,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating product in MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    await initDatabase();
    const body = await request.json();
    const { id, discountPercent, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const values: any[] = [];

    if (updateData.name !== undefined) { updates.push('name = ?'); values.push(updateData.name); }
    if (updateData.description !== undefined) { updates.push('description = ?'); values.push(updateData.description); }
    if (updateData.category !== undefined) { updates.push('category = ?'); values.push(updateData.category); }
    if (updateData.subcategory !== undefined) { updates.push('subcategory = ?'); values.push(updateData.subcategory); }
    if (updateData.pkrPrice !== undefined) { updates.push('pkr_price = ?'); values.push(Number(updateData.pkrPrice)); }
    if (updateData.usdPrice !== undefined) { updates.push('usd_price = ?'); values.push(Number(updateData.usdPrice)); }
    if (updateData.images !== undefined) { updates.push('images = ?'); values.push(JSON.stringify(updateData.images)); }
    if (updateData.sizes !== undefined) { updates.push('sizes = ?'); values.push(JSON.stringify(updateData.sizes)); }
    if (updateData.isFeatured !== undefined) { updates.push('is_featured = ?'); values.push(updateData.isFeatured ? 1 : 0); }
    if (updateData.fabric !== undefined) { updates.push('fabric = ?'); values.push(updateData.fabric); }
    if (updateData.care !== undefined) { updates.push('care = ?'); values.push(updateData.care); }
    if (updateData.embroidery !== undefined) { updates.push('embroidery = ?'); values.push(updateData.embroidery); }
    if (updateData.sku !== undefined) { updates.push('sku = ?'); values.push(updateData.sku); }
    if (updateData.gender !== undefined) { updates.push('gender = ?'); values.push(updateData.gender); }

    updates.push('updated_at = NOW()');

    if (updates.length > 1) {
      values.push(id);
      await pool.query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    if (discountPercent !== undefined) {
      if (Number(discountPercent) > 0) {
        await pool.query(
          `INSERT INTO discounts (product_id, discount_percent) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE discount_percent = VALUES(discount_percent)`,
          [id, Number(discountPercent)]
        );
      } else {
        await pool.query('DELETE FROM discounts WHERE product_id = ?', [id]);
      }
    }

    const [updatedRows]: any = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = formatProductRow(updatedRows[0]);
    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    console.error('Error updating product in MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    await initDatabase();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const [result]: any = await pool.query('DELETE FROM products WHERE id = ?', [id]);
    await pool.query('DELETE FROM discounts WHERE product_id = ?', [id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product from MySQL:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
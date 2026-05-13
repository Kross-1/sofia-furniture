import { sql } from '@vercel/postgres';

export async function getProducts() {
  try {
    const { rows } = await sql`SELECT * FROM products ORDER BY id`;
    return rows;
  } catch (e) {
    console.error('Error fetching products:', e);
    return [];
  }
}

export async function addProduct(product) {
  try {
    const { rows } = await sql`
      INSERT INTO products (name, category, price, image, material, description)
      VALUES (${product.name}, ${product.category}, ${product.price || 0}, ${product.image || ''}, ${product.material || ''}, ${product.description || ''})
      RETURNING *`;
    return rows[0];
  } catch (e) {
    console.error('Error adding product:', e);
    throw e;
  }
}

export async function updateProductDB(id, updates) {
  try {
    const { rows } = await sql`
      UPDATE products SET 
        name = COALESCE(${updates.name}, name),
        category = COALESCE(${updates.category}, category),
        price = COALESCE(${updates.price}, price),
        image = COALESCE(${updates.image}, image),
        material = COALESCE(${updates.material}, material),
        description = COALESCE(${updates.description}, description),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *`;
    return rows[0];
  } catch (e) {
    console.error('Error updating product:', e);
    throw e;
  }
}

export async function deleteProductDB(id) {
  try {
    await sql`DELETE FROM products WHERE id = ${id}`;
  } catch (e) {
    console.error('Error deleting product:', e);
    throw e;
  }
}
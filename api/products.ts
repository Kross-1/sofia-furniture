import { sql } from '@vercel/postgres';

export async function GET(request) {
  try {
    const { rows } = await sql`SELECT * FROM products ORDER BY id`;
    return Response.json(rows);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { rows } = await sql`
      INSERT INTO products (name, category, price, image, material, description)
      VALUES (${body.name}, ${body.category}, ${body.price || 0}, ${body.image || ''}, ${body.material || ''}, ${body.description || ''})
      RETURNING *`;
    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { rows } = await sql`
      UPDATE products SET 
        name = COALESCE(${body.name}, name),
        category = COALESCE(${body.category}, category),
        price = COALESCE(${body.price}, price),
        image = COALESCE(${body.image}, image),
        material = COALESCE(${body.material}, material),
        description = COALESCE(${body.description}, description),
        updated_at = NOW()
      WHERE id = ${body.id}
      RETURNING *`;
    return Response.json(rows[0]);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await sql`DELETE FROM products WHERE id = ${id}`;
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
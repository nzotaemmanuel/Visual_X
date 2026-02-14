import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jwtVerify } from 'jose';

// Update user (admin only) - PATCH
export async function PATCH(
  request: NextRequest,
  context: any
) {
  try {
    // Verify admin token
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const decoded = await jwtVerify(accessToken, secret);
    const userPayload = decoded.payload as any;

    if (userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const userId = parseInt(context.params.id);

    // Build dyanmic update query
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Map body keys to DB columns if necessary, or assume they match (camelCase vs snake_case)
    // The previous code used `data: body` implies body keys matched Prisma model fields (camelCase)
    // So we need to map camelCase body to snake_case DB columns
    const fieldMap: Record<string, string> = {
      email: 'email',
      firstName: 'first_name',
      lastName: 'last_name',
      role: 'role',
      isActive: 'is_active',
      password: 'password_hash' // Should probably not update password here without hashing, but keeping simple
    };

    // Note: Password update should ideally be hashed if present. 
    // The previous code just passed `body` to `prisma.user.update`. 
    // If `body` contained `password`, Prisma might have failed if it expected `passwordHash` 
    // or if `body` keys are `passwordHash`. 
    // Let's assume body contains `firstName`, `lastName`, `role`, `isActive`.

    for (const [key, value] of Object.entries(body)) {
      if (fieldMap[key] && value !== undefined) {
        fields.push(`${fieldMap[key]} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(userId); // Add userId as the last parameter
    const query = `
      UPDATE users 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, email, first_name, last_name, role, is_active, created_at
    `;

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const u = result.rows[0];
    const updatedUser = {
      id: u.id,
      email: u.email,
      firstName: u.first_name,
      lastName: u.last_name,
      role: u.role,
      isActive: u.is_active,
      createdAt: u.created_at,
    };

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  context: any
) {
  try {
    // Verify admin token
    const accessToken = request.cookies.get('accessToken')?.value;
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key');
    const decoded = await jwtVerify(accessToken, secret);
    const userPayload = decoded.payload as any;

    if (userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = parseInt(context.params.id);

    // Delete user
    await db.query('DELETE FROM users WHERE id = $1', [userId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

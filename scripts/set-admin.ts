import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const targetEmails = [
    'nzotaemmanuel16@gmail.com',
    'emmanuel.nzota@laspa.lagos.gov.ng',
    'emmanuel.nzota@laspa.gov.ng',
  ];

  // Try by known emails first
  let user = null;
  for (const e of targetEmails) {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [e]);
    user = result.rows[0];
    if (user) break;
  }

  // Fallback: search by name
  if (!user) {
    const result = await pool.query('SELECT * FROM users WHERE first_name = $1 AND last_name = $2', ['Emmanuel', 'Nzota']);
    user = result.rows[0];
  }

  if (!user) {
    console.error('Could not find user Emmanuel Nzota. No changes made.');
    process.exit(1);
  }

  // Update role to ADMIN
  const updateResult = await pool.query(
    'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    ['ADMIN', user.id]
  );
  const updated = updateResult.rows[0];

  console.log(`Updated user ${updated.email ?? `${updated.first_name} ${updated.last_name}`} to role: ${updated.role}`);
}

main().catch(async (e) => {
  console.error('Error updating user role:', e);
  process.exit(1);
}).finally(() => {
  pool.end();
});

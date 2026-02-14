import { Pool, PoolClient } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

export const db = {
    query: (text: string, params?: unknown[]) => pool.query(text, params),
};

// Helper for single result
export const dbQuerySingle = async (text: string, params?: unknown[]) => {
    const result = await pool.query(text, params);
    return result.rows[0];
};

// Helper for transaction
export const dbTransaction = async <T>(callback: (client: PoolClient) => Promise<T>): Promise<T> => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

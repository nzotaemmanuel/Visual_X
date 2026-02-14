"use server";

import { db, dbQuerySingle, dbTransaction } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export enum StaffRole {
    ADMIN = 'ADMIN',
    PARKING_AGENT = 'PARKING_AGENT',
    ENFORCEMENT_AGENT = 'ENFORCEMENT_AGENT',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    ENFORCEMENT_OFFICER = 'ENFORCEMENT_OFFICER',
    ANALYST = 'ANALYST',
    VIEWER = 'VIEWER',
}

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    SUSPENDED = 'SUSPENDED',
}

export async function createStaff(data: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: StaffRole;
    accountStatus: AccountStatus;
    zoneId?: number;
    password?: string;
}) {
    try {
        const hashedPassword = await hashPassword(data.password || "Laspa@123");

        // Map StaffRole to UserRole
        let userRole: UserRole = UserRole.VIEWER;
        if (data.role === StaffRole.ADMIN) {
            userRole = UserRole.ADMIN;
        } else if (data.role === StaffRole.ENFORCEMENT_AGENT || data.role === StaffRole.PARKING_AGENT) {
            userRole = UserRole.ENFORCEMENT_OFFICER;
        }

        // Use transaction to create both User and Staff
        const result = await dbTransaction(async (client) => {
            // Check if user already exists
            const existingUserRes = await client.query(
                'SELECT * FROM users WHERE email = $1',
                [data.email]
            );
            const existingUser = existingUserRes.rows[0];

            if (existingUser) {
                throw new Error("User with this email already exists");
            }

            // Create User
            await client.query(
                `INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                [
                    data.email,
                    hashedPassword,
                    data.firstName,
                    data.lastName,
                    userRole,
                    data.accountStatus === AccountStatus.ACTIVE
                ]
            );

            // Create Staff
            const staffRes = await client.query(
                `INSERT INTO staff (first_name, last_name, email, phone_number, role, account_status, zone_id, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                 RETURNING *`,
                [
                    data.firstName,
                    data.lastName,
                    data.email,
                    data.phoneNumber,
                    data.role,
                    data.accountStatus,
                    data.zoneId
                ]
            );

            return staffRes.rows[0];
        });

        // Map result to camelCase if needed, but returning snake_case is likely fine for internal API usage or update frontend if it breaks.
        // For consistency via actions, let's return it as property bag if we were returning specific type.
        // But here we return `result` which is snake_case from DB.

        return {
            success: true, data: {
                ...result,
                firstName: result.first_name,
                lastName: result.last_name,
                phoneNumber: result.phone_number,
                accountStatus: result.account_status,
                zoneId: result.zone_id
            }
        };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to create staff";
        console.error("Create staff error:", error);
        return { success: false, error: message };
    }
}

export async function updateStaff(
    id: number,
    data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
        role?: StaffRole;
        accountStatus?: AccountStatus;
        zoneId?: number | null;
    }
) {
    try {
        const setClauses: string[] = [];
        const values: unknown[] = [];
        let paramIndex = 1;

        if (data.firstName !== undefined) { setClauses.push(`first_name = $${paramIndex++}`); values.push(data.firstName); }
        if (data.lastName !== undefined) { setClauses.push(`last_name = $${paramIndex++}`); values.push(data.lastName); }
        if (data.email !== undefined) { setClauses.push(`email = $${paramIndex++}`); values.push(data.email); }
        if (data.phoneNumber !== undefined) { setClauses.push(`phone_number = $${paramIndex++}`); values.push(data.phoneNumber); }
        if (data.role !== undefined) { setClauses.push(`role = $${paramIndex++}`); values.push(data.role); }
        if (data.accountStatus !== undefined) { setClauses.push(`account_status = $${paramIndex++}`); values.push(data.accountStatus); }
        if (data.zoneId !== undefined) { setClauses.push(`zone_id = $${paramIndex++}`); values.push(data.zoneId); }

        if (setClauses.length === 0) return { success: true };

        setClauses.push(`updated_at = NOW()`);

        values.push(id);
        const query = `UPDATE staff SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

        const result = await db.query(query, values);
        const updated = result.rows[0];

        return {
            success: true, data: {
                ...updated,
                firstName: updated.first_name,
                lastName: updated.last_name,
                phoneNumber: updated.phone_number,
                accountStatus: updated.account_status,
                zoneId: updated.zone_id
            }
        };
    } catch (error: unknown) {
        console.error("Update staff error:", error);
        return { success: false, error: "Failed to update staff" };
    }
}

export async function deleteStaff(id: number) {
    try {
        await dbTransaction(async (client) => {
            // First find the staff member to get their email
            const staffRes = await client.query('SELECT email FROM staff WHERE id = $1', [id]);
            const staff = staffRes.rows[0];

            if (!staff) {
                throw new Error("Staff member not found");
            }

            // --- CASCADING CLEANUP ---
            // 1. Handle Appeals: Nullify reviewer links
            await client.query('UPDATE appeals SET reviewer_id = NULL WHERE reviewer_id = $1', [id]);

            // 2. Handle ParkingTickets: Nullify agent links
            await client.query('UPDATE parking_tickets SET agent_id = NULL WHERE agent_id = $1', [id]);

            // 3. Delete EnforcementActions requested by this staff
            await client.query('DELETE FROM enforcement_actions WHERE requested_by = $1', [id]);

            // 4. Handle CustomerViolations recorded by this staff
            const violationsRes = await client.query('SELECT id FROM customer_violations WHERE enforcement_officer_id = $1', [id]);
            const violationIds = violationsRes.rows.map(v => v.id);

            if (violationIds.length > 0) {
                const idsString = violationIds.join(','); // Not safe for SQL injection if not careful, but IDs are ints. Better to use ANY($1)

                // PostgreSQL supports = ANY($1) for arrays
                // Delete children of these violations first
                await client.query('DELETE FROM appeals WHERE violation_id = ANY($1)', [violationIds]);
                await client.query('DELETE FROM fines WHERE violation_id = ANY($1)', [violationIds]);
                await client.query('DELETE FROM enforcement_actions WHERE violation_id = ANY($1)', [violationIds]);

                // Finally delete the violations themselves
                await client.query('DELETE FROM customer_violations WHERE id = ANY($1)', [violationIds]);
            }

            // 5. Delete the associated User record
            await client.query('DELETE FROM users WHERE email = $1', [staff.email]);

            // 6. Delete the Staff record
            await client.query('DELETE FROM staff WHERE id = $1', [id]);
        });

        return { success: true };
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to delete staff";
        console.error("Delete staff error:", error);
        return { success: false, error: message };
    }
}

export async function getStaffList() {
    try {
        const result = await db.query('SELECT * FROM staff ORDER BY first_name ASC');
        const staff = result.rows.map(s => ({
            ...s,
            firstName: s.first_name,
            lastName: s.last_name,
            phoneNumber: s.phone_number,
            accountStatus: s.account_status,
            zoneId: s.zone_id
        }));
        return { success: true, data: staff };
    } catch (error) {
        return { success: false, error: "Failed to fetch staff" };
    }
}

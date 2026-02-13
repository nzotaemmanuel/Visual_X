"use server";

import { prisma } from "@/lib/db";
import { StaffRole, AccountStatus, UserRole } from "@prisma/client";
import { hashPassword } from "@/lib/auth";

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
        const result = await prisma.$transaction(async (tx) => {
            // Check if user already exists
            const existingUser = await tx.user.findUnique({
                where: { email: data.email }
            });

            if (existingUser) {
                // If user exists, maybe update role? Or just skip user creation?
                // For now, let's assume we proceed to create Staff only if User exists, 
                // but usually this implies a conflict.
                // However, user requested "Admin can create users". 
                // If email exists, we effectively link existing user to new staff profile.
                // But let's error to be safe as per standard registration flows.
                throw new Error("User with this email already exists");
            }

            // Create User
            await tx.user.create({
                data: {
                    email: data.email,
                    passwordHash: hashedPassword,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    role: userRole,
                    isActive: data.accountStatus === AccountStatus.ACTIVE,
                }
            });

            // Create Staff
            const staff = await tx.staff.create({
                data: {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    email: data.email,
                    phoneNumber: data.phoneNumber,
                    role: data.role,
                    accountStatus: data.accountStatus,
                    zoneId: data.zoneId,
                }
            });

            return staff;
        });

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Create staff error:", error);
        return { success: false, error: error.message || "Failed to create staff" };
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
        const updated = await prisma.staff.update({
            where: { id },
            data,
        });
        return { success: true, data: updated };
    } catch (error) {
        return { success: false, error: "Failed to update staff" };
    }
}

export async function deleteStaff(id: number) {
    try {
        await prisma.$transaction(async (tx) => {
            // First find the staff member to get their email
            const staff = await tx.staff.findUnique({
                where: { id },
                select: { email: true }
            });

            if (!staff) {
                throw new Error("Staff member not found");
            }

            // --- CASCADING CLEANUP ---
            // 1. Handle Appeals: Nullify reviewer links
            await tx.appeal.updateMany({
                where: { reviewerId: id },
                data: { reviewerId: null }
            });

            // 2. Handle ParkingTickets: Nullify agent links
            await tx.parkingTicket.updateMany({
                where: { agentId: id },
                data: { agentId: null }
            });

            // 3. Delete EnforcementActions requested by this staff
            await tx.enforcementAction.deleteMany({
                where: { requestedBy: id }
            });

            // 4. Handle CustomerViolations recorded by this staff
            const violations = await tx.customerViolation.findMany({
                where: { enforcementOfficerId: id },
                select: { id: true }
            });

            const violationIds = violations.map(v => v.id);

            if (violationIds.length > 0) {
                // Delete children of these violations first
                await tx.appeal.deleteMany({
                    where: { violationId: { in: violationIds } }
                });

                await tx.fine.deleteMany({
                    where: { violationId: { in: violationIds } }
                });

                await tx.enforcementAction.deleteMany({
                    where: { violationId: { in: violationIds } }
                });

                // Finally delete the violations themselves
                await tx.customerViolation.deleteMany({
                    where: { id: { in: violationIds } }
                });
            }

            // 5. Delete the associated User record
            await tx.user.deleteMany({
                where: { email: staff.email }
            });

            // 6. Delete the Staff record
            await tx.staff.delete({
                where: { id },
            });
        });

        return { success: true };
    } catch (error: any) {
        console.error("Delete staff error:", error);
        return { success: false, error: error.message || "Failed to delete staff" };
    }
}

export async function getStaffList() {
    try {
        const staff = await prisma.staff.findMany({
            orderBy: { firstName: "asc" },
        });
        return { success: true, data: staff };
    } catch (error) {
        return { success: false, error: "Failed to fetch staff" };
    }
}

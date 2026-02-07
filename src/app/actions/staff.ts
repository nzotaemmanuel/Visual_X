"use server";

import { prisma } from "@/lib/db";
import { StaffRole, AccountStatus } from "@prisma/client";

export async function updateStaff(
    id: number,
    data: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: string;
        role?: StaffRole;
        accountStatus?: AccountStatus;
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
        await prisma.staff.delete({
            where: { id },
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete staff" };
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

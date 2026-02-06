"use server";

import { prisma } from "@/lib/db";

export async function getZones() {
    try {
        const zones = await prisma.parkingZone.findMany({
            orderBy: {
                zoneName: 'asc'
            }
        });
        return zones;
    } catch (error: any) {
        console.error("Failed to fetch zones:", {
            message: error.message,
            code: error.code,
            meta: error.meta
        });
        return [];
    }
}

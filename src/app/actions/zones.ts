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
    } catch (error) {
        console.error("Failed to fetch zones:", error);
        return [];
    }
}

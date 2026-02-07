export interface Zone {
    id: string;
    zoneCode: string;
    zoneName: string;
}

export const ZONES: Zone[] = [
    { id: "1", zoneCode: 'IKJ111', zoneName: 'Ikeja' },
    { id: "2", zoneCode: 'AGE112', zoneName: 'Agege' },
    { id: "3", zoneCode: 'ALI113', zoneName: 'Alimosho' },
    { id: "4", zoneCode: 'LAS114', zoneName: 'Lagos Island' },
    { id: "5", zoneCode: 'LMN115', zoneName: 'Lagos Mainland' },
    { id: "6", zoneCode: 'MSN116', zoneName: 'Mushin' },
    { id: "7", zoneCode: 'OSS118', zoneName: 'Oshodi-Isolo' },
    { id: "8", zoneCode: 'APA119', zoneName: 'Apapa' },
    { id: "9", zoneCode: 'SUR120', zoneName: 'Surulere' },
    { id: "10", zoneCode: 'EOS121', zoneName: 'Eti-Osa' },
    { id: "11", zoneCode: 'VIB122', zoneName: 'Victoria Island' },
    { id: "12", zoneCode: 'IKD112', zoneName: 'Ikorodu' },
    { id: "13", zoneCode: 'AJI123', zoneName: 'Ajeromi-Ifelodun' },
    { id: "14", zoneCode: 'AMO124', zoneName: 'Amuwo-Odofin' },
    { id: "15", zoneCode: 'BAD125', zoneName: 'Badagry' },
    { id: "16", zoneCode: 'EPE126', zoneName: 'Epe' },
    { id: "17", zoneCode: 'IBL127', zoneName: 'Ibeju-Lekki' },
    { id: "18", zoneCode: 'IFA128', zoneName: 'Ifako-Ijaiye' },
    { id: "19", zoneCode: 'KOS129', zoneName: 'Kosofe' },
    { id: "20", zoneCode: 'OJO130', zoneName: 'Ojo' },
    { id: "21", zoneCode: 'SHO131', zoneName: 'Shomolu' },
];

/**
 * Deterministic pseudo-random number generator to prevent hydration mismatch
 */
const seededRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const generateTransactions = (selectedZoneId: string, zones: Zone[]) => {
    const relevantZones = selectedZoneId === "all" ? zones : zones.filter(z => z.id === selectedZoneId);

    return Array.from({ length: 12 }).map((_, i) => {
        const zone = relevantZones[i % relevantZones.length];
        const seedValue = parseInt(zone.id) * 100 + i;
        const amount = Math.floor(seededRandom(seedValue) * 15000) + 500;

        return {
            id: `TX-${99200 + i}`,
            zone: zone.zoneName,
            amount: `₦ ${amount.toLocaleString()}`,
            channel: ["Mobile App", "POS", "Web", "SMS"][Math.floor(seededRandom(seedValue + 1) * 4)],
            status: seededRandom(seedValue + 2) > 0.1 ? "Success" : "Pending",
            time: `${(i + 1) * 2} mins ago`
        };
    });
};

export const generateEnforcementActions = (selectedZoneId: string, zones: Zone[]) => {
    const relevantZones = selectedZoneId === "all" ? zones : zones.filter(z => z.id === selectedZoneId);

    return Array.from({ length: 10 }).map((_, i) => {
        const zone = relevantZones[i % relevantZones.length];
        const seedValue = parseInt(zone.id) * 200 + i;
        const actionIndex = Math.floor(seededRandom(seedValue) * 3);
        const statusIndex = Math.floor(seededRandom(seedValue + 1) * 4);

        return {
            id: `ACT-${880 + i}`,
            vehicle: `LAG ${100 + i} ${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(66 + (i % 26))}`,
            action: ["CLAMPED", "TOWED", "FINED"][actionIndex],
            zone: zone.zoneName,
            officer: ["O. Adebayo", "J. Mensah", "A. Williams", "T. Balogun"][Math.floor(seededRandom(seedValue + 2) * 4)],
            time: `${(i + 1) * 5} mins ago`,
            status: ["Active", "Impounded", "Paid", "Appeal Pending"][statusIndex]
        };
    });
};

export const generateUsers = (selectedZoneId: string, zones: Zone[]) => {
    const relevantZones = selectedZoneId === "all" ? zones : zones.filter(z => z.id === selectedZoneId);

    return Array.from({ length: 15 }).map((_, i) => {
        const zone = relevantZones[i % relevantZones.length];
        const seedValue = parseInt(zone.id) * 300 + i;
        const roles = ["Enforcement Lead", "Field Agent", "Zone Manager"];
        const names = ["Amaka Okafor", "Tunde Ednut", "Sola Sobowale", "Bisi Alimi", "Chidi Mokeme"];

        return {
            id: `USR-${100 + i}`,
            name: names[i % names.length] + ` ${i}`,
            role: roles[i % roles.length],
            status: seededRandom(seedValue) > 0.3 ? "Active" : "In Field",
            lastActive: `${i + 1} hrs ago`,
            zone: zone.zoneName,
            rating: 4 + seededRandom(seedValue + 1),
        };
    });
};

export const generateVehicles = (selectedZoneId: string, zones: Zone[]) => {
    const relevantZones = selectedZoneId === "all" ? zones : zones.filter(z => z.id === selectedZoneId);

    return Array.from({ length: 20 }).map((_, i) => {
        const zone = relevantZones[i % relevantZones.length];
        const seedValue = parseInt(zone.id) * 400 + i;
        const brands = ["Toyota Corolla", "Mercedes Sprinter", "Honda Civic", "Lexus LX570"];
        const statusIndex = Math.floor(seededRandom(seedValue) * 3);

        return {
            id: `VEH-${900 + i}`,
            plate: `LAG ${200 + i} ${String.fromCharCode(70 + (i % 20))}${String.fromCharCode(71 + (i % 20))}`,
            owner: ["Private", "Commercial", "Gov"][Math.floor(seededRandom(seedValue + 1) * 3)],
            brand: brands[i % brands.length],
            status: ["Parked", "Moving", "Violating"][statusIndex],
            zone: zone.zoneName,
            sessions: Math.floor(seededRandom(seedValue + 2) * 200),
        };
    });
};

export const generateTopZones = (zones: Zone[]) => {
    return [...zones]
        .map((zone) => {
            const seedValue = parseInt(zone.id);
            const revenueValue = 1.5 + (Math.sin(seedValue) * 1.5); // Deterministic
            const occupancyValue = 70 + (Math.cos(seedValue) * 25);
            return {
                id: zone.id,
                name: zone.zoneName,
                revenue: `₦ ${revenueValue.toFixed(1)}M`,
                revenueRaw: revenueValue,
                occupancy: `${Math.floor(occupancyValue)}%`,
                trend: seedValue % 3 === 0 ? "down" : "up" as "up" | "down",
                progress: Math.floor(occupancyValue),
            };
        })
        .sort((a, b) => b.revenueRaw - a.revenueRaw)
        .slice(0, 4);
};

"use client";

import { useState, useMemo } from "react";
import { RevenueChart } from "./RevenueChart";
import { ZoneFilter } from "./ZoneFilter";
import { KPISection } from "./KPISection";
import { useSearch } from "@/lib/SearchContext";

interface Zone {
    id: string;
    zoneCode: string;
    zoneName: string;
}

interface RevenueContainerProps {
    zones: Zone[];
}

export function RevenueContainer({ zones }: RevenueContainerProps) {
    const [selectedZone, setSelectedZone] = useState("all");
    const { searchQuery } = useSearch();

    const filteredZones = useMemo(() => {
        if (!searchQuery) return zones;
        return zones.filter(z =>
            z.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            z.zoneCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [zones, searchQuery]);

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-primary">
                        Revenue Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Detailed financial performance tracking and collection gaps.
                    </p>
                </div>

                <ZoneFilter
                    zones={filteredZones}
                    selectedZone={selectedZone}
                    onZoneChange={setSelectedZone}
                />
            </div>

            {/* Revenue Focused KPIs */}
            <KPISection selectedZone={selectedZone} />

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1">
                <RevenueChart selectedZone={selectedZone} />

                <div className="bg-surface border border-border p-12 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">💰</span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-foreground">Collection Gap Analysis</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                        Comparing projected vs. actual revenue for
                        <span className="font-bold text-primary ml-1">
                            {selectedZone === "all"
                                ? (searchQuery ? `Filtered: ${searchQuery}` : "All Zones")
                                : zones.find(z => z.id === selectedZone)?.zoneName}
                        </span>.
                    </p>
                </div>
            </div>
        </div>
    );
}

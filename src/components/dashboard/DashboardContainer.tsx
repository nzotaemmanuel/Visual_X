"use client";

import { useState } from "react";
import { KPISection } from "./KPISection";
import { RevenueChart } from "./RevenueChart";
import { RecentActivity } from "./RecentActivity";
import { ZoneFilter } from "./ZoneFilter";

interface Zone {
    id: string;
    zoneCode: string;
    zoneName: string;
}

interface DashboardContainerProps {
    zones: Zone[];
}

export function DashboardContainer({ zones }: DashboardContainerProps) {
    const [selectedZone, setSelectedZone] = useState("all");

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-primary">
                        Executive Overview
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time monitoring of Lagos State parking operations.
                    </p>
                </div>

                <ZoneFilter
                    zones={zones}
                    selectedZone={selectedZone}
                    onZoneChange={setSelectedZone}
                />
            </div>

            {/* KPI Grid */}
            <KPISection selectedZone={selectedZone} />

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-7">
                <div className="lg:col-span-4">
                    <RevenueChart selectedZone={selectedZone} />
                </div>
                <div className="lg:col-span-3">
                    <RecentActivity />
                </div>
            </div>

            {/* Zone Map Stub */}
            <div className="grid gap-6 grid-cols-1">
                <div className="bg-surface border border-border p-6 h-[300px] flex items-center justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-muted/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="text-center z-10">
                        <h3 className="text-lg font-heading font-bold text-muted-foreground">Geographic Heatmap Module</h3>
                        <p className="text-xs text-muted-foreground mt-2">Initialize Mapbox Integration</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { KPISection } from "./KPISection";
import { RevenueChart } from "./RevenueChart";
import { RecentActivity } from "./RecentActivity";
import { ZoneFilter } from "./ZoneFilter";
import { Map as MapIcon } from "lucide-react";

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

            {/* Zone Map Section */}
            <div className="grid gap-6 grid-cols-1">
                <div className="bg-surface border border-border p-6 h-[400px] flex flex-col relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4 z-10">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-foreground">Operational Heatmap</h3>
                            <p className="text-sm text-muted-foreground">Real-time occupancy density across Lagos</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-success" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Low</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-warning" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Med</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-danger" />
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">High</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 border border-border/50 bg-muted/30 relative flex items-center justify-center">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_40%,_var(--color-primary)_0%,_transparent_50%),radial-gradient(circle_at_70%_60%,_var(--color-secondary)_0%,_transparent_50%)]" />
                        <div className="text-center z-10">
                            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 mb-3">
                                <MapIcon className="h-6 w-6 text-primary" />
                            </div>
                            <h4 className="text-md font-bold text-foreground">Mapbox Integration Pending</h4>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                Spatial analytics will be initialized upon API key configuration.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

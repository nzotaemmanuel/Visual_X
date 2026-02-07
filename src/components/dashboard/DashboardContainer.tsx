"use client";

import { useState } from "react";
import { KPISection } from "./KPISection";
import { RevenueChart } from "./RevenueChart";
import { RecentActivity } from "./RecentActivity";
import { ZoneFilter } from "./ZoneFilter";
import { TopZones } from "./TopZones";
import { Map as MapIcon, Maximize2, RefreshCcw } from "lucide-react";

interface Zone {
    id: string;
    zoneCode: string;
    zoneName: string;
}

interface RecentActivityItem {
    id: string;
    type: "violation" | "payment" | "alert";
    message: string;
    time: string;
}

interface DashboardContainerProps {
    zones: Zone[];
    recentOperations?: RecentActivityItem[];
}

export function DashboardContainer({ zones, recentOperations = [] }: DashboardContainerProps) {
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
            <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    <RevenueChart selectedZone={selectedZone} />
                </div>
                <div className="lg:col-span-4">
                    <TopZones zones={zones} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8">
                    {/* Zone Map Section */}
                    <div className="bg-surface border border-border flex flex-col h-[450px] relative overflow-hidden group">
                        <div className="p-6 border-b border-border bg-muted/20 z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-heading font-bold text-foreground">Operational Heatmap</h3>
                                    <p className="text-sm text-muted-foreground">Real-time occupancy density across Lagos</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="hidden md:flex items-center gap-2">
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
                                    <div className="flex items-center gap-1 border-l border-border pl-4">
                                        <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Full Screen">
                                            <Maximize2 className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                        <button className="p-1.5 hover:bg-muted rounded transition-colors" title="Refresh">
                                            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 relative flex items-center justify-center bg-muted/30">
                            {/* Abstract Map Grid Visual */}
                            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
                                <div className="absolute inset-0" style={{
                                    backgroundImage: 'radial-gradient(circle at 2px 2px, var(--color-border) 1px, transparent 0)',
                                    backgroundSize: '24px 24px'
                                }} />
                                {/* Glow Points */}
                                <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-success/20 blur-3xl rounded-full" />
                                <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-danger/20 blur-3xl rounded-full" />
                                <div className="absolute bottom-1/4 left-1/2 w-40 h-40 bg-warning/20 blur-3xl rounded-full" />
                                <div className="absolute top-2/3 left-1/4 w-36 h-36 bg-primary/20 blur-3xl rounded-full" />
                            </div>

                            <div className="text-center z-10 px-6">
                                <div className="inline-flex items-center justify-center p-4 rounded-full bg-primary/10 mb-4 border border-primary/20 shadow-lg shadow-primary/5">
                                    <MapIcon className="h-8 w-8 text-primary" />
                                </div>
                                <h4 className="text-xl font-heading font-bold text-foreground">Mapbox Engine Standby</h4>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2 leading-relaxed">
                                    Spatial analytics will be initialized upon API key configuration.
                                    High-fidelity PostGIS layers are ready for rendering.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-3">
                                    <span className="px-3 py-1 bg-surface border border-border rounded-full text-[10px] uppercase font-bold text-muted-foreground">21 Zones Active</span>
                                    <span className="px-3 py-1 bg-surface border border-border rounded-full text-[10px] uppercase font-bold text-muted-foreground">Live IoT Feed Ready</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <RecentActivity activities={recentOperations} />
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useMemo } from "react";
import { ZoneFilter } from "./ZoneFilter";
import { OccupancyGauge } from "./OccupancyGauge";
import { useSearch } from "@/lib/SearchContext";
import { Map, Zap, Users, ShieldAlert, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Zone {
    id: string;
    zoneCode: string;
    zoneName: string;
}

interface OperationsContainerProps {
    zones: Zone[];
}

export function OperationsContainer({ zones }: OperationsContainerProps) {
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
                        Operations & Occupancy
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Real-time bay utilization and field officer deployment.
                    </p>
                </div>

                <ZoneFilter
                    zones={filteredZones}
                    selectedZone={selectedZone}
                    onZoneChange={setSelectedZone}
                />
            </div>

            {/* Top Operational Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <OccupancyGauge
                    label="On-Street Occupancy"
                    value={selectedZone === "all" ? 4250 : 210}
                    total={selectedZone === "all" ? 5000 : 250}
                />

                <div className="bg-surface border border-border p-6 flex flex-col justify-between group">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-2 bg-secondary/10 text-secondary rounded-lg">
                                <Zap className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-bold text-success uppercase tracking-widest">Live Updates</span>
                        </div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Peak Hour Surge</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-heading font-bold text-foreground">1.4x</span>
                            <span className="text-[10px] font-bold text-danger uppercase">Demand High</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                            Current demand in <span className="text-foreground font-bold">{selectedZone === 'all' ? 'Lagos' : zones.find(z => z.id === selectedZone)?.zoneName}</span> is exceeding supply by 40% in core blocks.
                        </p>
                    </div>
                    <button className="w-full mt-6 py-2 text-xs font-bold bg-muted hover:bg-muted/80 text-foreground transition-colors uppercase tracking-widest">
                        View Demand Heatmap
                    </button>
                </div>

                <div className="bg-surface border border-border p-6 flex flex-col justify-between group">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                <Users className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Staffing</span>
                        </div>
                        <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Field Coverage</h4>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-heading font-bold text-foreground">158</span>
                            <span className="text-[10px] font-bold text-success uppercase">Officers Active</span>
                        </div>
                        <div className="mt-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold">Patrol Coverage</span>
                                <span className="text-xs font-bold text-foreground">92%</span>
                            </div>
                            <div className="h-1 w-full bg-muted rounded-full">
                                <div className="h-full bg-success w-[92%] rounded-full" />
                            </div>
                        </div>
                    </div>
                    <button className="w-full mt-6 py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-colors uppercase tracking-widest border border-primary/20">
                        Officer Directory
                    </button>
                </div>
            </div>

            {/* Detailed Grid */}
            <div className="grid gap-6 lg:grid-cols-12">
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Activity Feed Placeholder */}
                    <div className="bg-surface border border-border">
                        <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                            <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                                <Map className="h-5 w-5 text-primary" />
                                Zone Operational Status
                            </h3>
                            <div className="flex gap-2">
                                <span className="px-2 py-0.5 bg-success/10 text-[10px] font-bold text-success uppercase rounded">18 Optimal</span>
                                <span className="px-2 py-0.5 bg-danger/10 text-[10px] font-bold text-danger uppercase rounded">3 Critical</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-muted/30 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Zone</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Utilization</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Tickets</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Compliance</th>
                                        <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {(selectedZone === "all" ? zones : zones.filter(z => z.id === selectedZone)).map((z) => {
                                        const utilization = 60 + (parseInt(z.id) * 37) % 35; // Dynamic but deterministic
                                        const compliance = utilization > 90 ? "Low" : "High";
                                        const tickets = (parseInt(z.id) * 12) + 40;

                                        return (
                                            <tr key={z.id} className="hover:bg-muted/10 transition-colors group cursor-pointer">
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-foreground">{z.zoneName}</span>
                                                        <span className="text-[10px] text-muted-foreground uppercase">{z.zoneCode}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-1 bg-muted rounded-full overflow-hidden hidden sm:block">
                                                            <div
                                                                className={cn(
                                                                    "h-full",
                                                                    utilization > 90 ? "bg-danger" : "bg-primary"
                                                                )}
                                                                style={{ width: `${utilization}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-foreground">{utilization}%</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-foreground">{tickets}</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn(
                                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                        compliance === "Low" ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                                                    )}>
                                                        {compliance}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button className="p-1 hover:bg-muted rounded transition-colors">
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4">
                    {/* Operational Alerts */}
                    <div className="bg-surface border border-border h-full flex flex-col">
                        <div className="p-6 border-b border-border bg-danger/5">
                            <h3 className="text-lg font-heading font-bold text-danger flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" />
                                Operational Alerts
                            </h3>
                        </div>
                        <div className="flex-1 p-6 space-y-6">
                            {[
                                { title: "Over-stay detected", zone: "Ikeja - Bay 042", time: "Just now", severity: "high" },
                                { title: "Enforcement required", zone: "Victoria Island", time: "12 mins ago", severity: "high" },
                                { title: "Sensor malfunction", zone: "Lagos Island", time: "1 hr ago", severity: "low" },
                            ].map((alert, i) => (
                                <div key={i} className="flex gap-4 group cursor-pointer">
                                    <div className={cn(
                                        "w-1 h-10 rounded-full",
                                        alert.severity === "high" ? "bg-danger" : "bg-warning"
                                    )} />
                                    <div>
                                        <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{alert.title}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{alert.zone}</p>
                                        <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 mt-auto border-t border-border bg-muted/10">
                            <button className="w-full py-2 text-[10px] font-bold text-danger hover:bg-danger/5 transition-colors uppercase tracking-widest">
                                Dismiss All Warnings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ZoneRank {
    id: string;
    name: string;
    revenue: string;
    occupancy: string;
    trend: "up" | "down";
    progress: number;
}

interface Zone {
    id: number;
    zoneCode: string;
    zoneName: string;
}

interface TopZonesProps {
    zones: Zone[];
}

export function TopZones({ zones }: TopZonesProps) {
    const [topZones, setTopZones] = useState<ZoneRank[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchTopZones = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/top-zones');
                const data = await response.json();
                setTopZones(data);
            } catch (error) {
                console.error('Failed to fetch top zones:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopZones();
    }, []);

    return (
        <div className="bg-surface border border-border flex flex-col h-full overflow-hidden group">
            <div className="p-6 border-b border-border bg-muted/20">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-warning" />
                            Top Performing Zones
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Ranking based on revenue and occupancy.
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                    {topZones.map((zone, index) => (
                        <div key={zone.id} className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border",
                                        index === 0 ? "bg-warning/20 border-warning text-warning" :
                                            index === 1 ? "bg-muted border-border text-muted-foreground" :
                                                "bg-transparent border-border text-muted-foreground"
                                    )}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">{zone.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                            {zone.revenue} Collected
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-1 justify-end">
                                        <span className="text-xs font-bold text-foreground">{zone.occupancy}</span>
                                        {zone.trend === "up" ? (
                                            <TrendingUp className="h-3 w-3 text-success" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-danger" />
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Occupancy</p>
                                </div>
                            </div>
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out",
                                        index === 0 ? "bg-warning" : "bg-primary"
                                    )}
                                    style={{ width: `${zone.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-4 bg-muted/10 border-t border-border mt-auto">
                <button
                    onClick={async () => {
                        try {
                            const res = await fetch('/api/reports/top-zones');
                            if (!res.ok) throw new Error('Failed to download');
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'top-zones.csv';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                        } catch (err) {
                            console.error('Export failed', err);
                        }
                    }}
                    className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-colors rounded"
                >
                    View Full Leaderboard
                </button>
            </div>
        </div>
    );
}

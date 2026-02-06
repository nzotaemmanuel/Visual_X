"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Zone {
    id: string;
    zoneCode: string;
    zoneName: string;
}

interface ZoneFilterProps {
    zones: Zone[];
    selectedZone: string;
    onZoneChange: (zoneId: string) => void;
}

export function ZoneFilter({ zones, selectedZone, onZoneChange }: ZoneFilterProps) {
    return (
        <div className="flex items-center gap-2">
            <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                    <MapPin className="h-4 w-4" />
                </div>
                <select
                    value={selectedZone}
                    onChange={(e) => onZoneChange(e.target.value)}
                    className={cn(
                        "h-10 w-[200px] appearance-none bg-surface border border-border pl-10 pr-10 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all cursor-pointer hover:bg-muted/30"
                    )}
                >
                    <option value="all">All Zones</option>
                    {zones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                            {zone.zoneName} ({zone.zoneCode})
                        </option>
                    ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors">
                    <ChevronDown className="h-4 w-4" />
                </div>
            </div>

            <div className="hidden sm:flex h-10 items-center px-4 bg-primary/5 border border-primary/10 text-[10px] uppercase tracking-wider font-bold text-primary whitespace-nowrap">
                Live Ops
            </div>
        </div>
    );
}

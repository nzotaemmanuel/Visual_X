"use client";

import { useState, useMemo, useEffect } from "react";
import { RevenueKPIs } from "./RevenueKPIs";
import { RevenueDistribution } from "./RevenueDistribution";
import { RevenueChart } from "./RevenueChart";
import { ZoneFilter } from "./ZoneFilter";
import { useSearch } from "@/lib/SearchContext";
import { Clock, Download, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

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
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const filteredZones = useMemo(() => {
        if (!searchQuery) return zones;
        return zones.filter(z =>
            z.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            z.zoneCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [zones, searchQuery]);

    useEffect(() => {
        const fetchTransactions = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedZone !== 'all') {
                    params.append('zoneId', selectedZone);
                }
                const response = await fetch(`/api/transactions?${params}`);
                const data = await response.json();
                setTransactions(data);
            } catch (error) {
                console.error('Failed to fetch transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, [selectedZone]);

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

                <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-surface border border-border text-xs font-bold text-muted-foreground hover:border-primary/50 transition-colors uppercase tracking-wider">
                        <Download className="h-4 w-4" />
                        Export Report
                    </button>
                    <ZoneFilter
                        zones={filteredZones}
                        selectedZone={selectedZone}
                        onZoneChange={setSelectedZone}
                    />
                </div>
            </div>

            {/* Revenue KPIs */}
            <RevenueKPIs selectedZone={selectedZone} />

            {/* Main Content Grid */}
            <div className="grid gap-6 grid-cols-1">
                <RevenueChart selectedZone={selectedZone} />

                <RevenueDistribution />

                {/* Recent Collections Feed */}
                <div className="bg-surface border border-border">
                    <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                Recent Collection Pulse
                            </h3>
                            <p className="text-sm text-muted-foreground">Live stream of financial transactions.</p>
                        </div>
                        <button className="p-2 hover:bg-muted rounded transition-colors">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transaction ID</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Zone/Bay</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Channel</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {transactions.map((row) => (
                                    <tr key={row.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-6 py-4 text-xs font-bold text-foreground">{row.id}</td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground underline decoration-primary/20 hover:decoration-primary transition-colors cursor-pointer">{row.zone}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-foreground">{row.amount}</td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">{row.channel}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                row.status === "Success" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                            )}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-muted-foreground">{row.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-muted/10 border-t border-border flex justify-center">
                        <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                            Load Full Transaction History
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import { ZoneFilter } from "./ZoneFilter";
import { useSearch } from "@/lib/SearchContext";
import {
    ShieldAlert,
    Gavel,
    Truck,
    Lock,
    FileText,
    Download,
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Filter,
    ChevronRight
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { cn } from "@/lib/utils";

interface Zone {
    id: string;
    zoneCode: string;
    zoneName: string;
}

interface EnforcementContainerProps {
    zones: Zone[];
}

const VIOLATION_TYPES = [
    { name: "Overstay", value: 450, color: "#991b1b" },
    { name: "Unauthorized", value: 280, color: "#dc2626" },
    { name: "Double Parking", value: 150, color: "#ef4444" },
    { name: "Wrong Zone", value: 120, color: "#f87171" },
];

export function EnforcementContainer({ zones }: EnforcementContainerProps) {
    const [selectedZone, setSelectedZone] = useState("all");
    const { searchQuery } = useSearch();
    const [enforcementActions, setEnforcementActions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const filteredZones = useMemo(() => {
        if (!searchQuery) return zones;
        return zones.filter(z =>
            z.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            z.zoneCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [zones, searchQuery]);

    useEffect(() => {
        const fetchActions = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedZone !== 'all') {
                    params.append('zoneId', selectedZone);
                }
                const response = await fetch(`/api/enforcement-actions?${params}`);
                const data = await response.json();
                setEnforcementActions(data);
            } catch (error) {
                console.error('Failed to fetch enforcement actions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchActions();
    }, [selectedZone]);

    const stats = [
        { label: "Total Violations", value: "1,245", trend: "+12%", icon: ShieldAlert, color: "danger" },
        { label: "Active Clamps", value: "84", trend: "-5%", icon: Lock, color: "warning" },
        { label: "Tow Operations", value: "32", trend: "+8%", icon: Truck, color: "primary" },
    ];

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-primary">
                        Enforcement & Compliance
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitoring violations, clamps, and towing operations.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="hidden md:flex items-center gap-2 px-3 py-2 bg-surface border border-border text-xs font-bold text-muted-foreground hover:border-primary/50 transition-colors uppercase tracking-wider">
                        <Download className="h-4 w-4" />
                        Compliance Report
                    </button>
                    <ZoneFilter
                        zones={filteredZones}
                        selectedZone={selectedZone}
                        onZoneChange={setSelectedZone}
                    />
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface border border-border p-6 flex items-center justify-between group cursor-default">
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-heading font-bold text-foreground">{stat.value}</h3>
                            <p className={cn(
                                "text-[10px] font-bold mt-1",
                                stat.trend.startsWith('+') ? "text-danger" : "text-success"
                            )}>
                                {stat.trend} <span className="text-muted-foreground/60">vs last week</span>
                            </p>
                        </div>
                        <div className={cn(
                            "p-3 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity",
                            stat.color === 'danger' ? "bg-danger/10 text-danger" :
                                stat.color === 'warning' ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"
                        )}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
                {/* Violation Distribution */}
                <div className="lg:col-span-4 bg-surface border border-border flex flex-col">
                    <div className="p-6 border-b border-border bg-muted/20">
                        <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-warning" />
                            Violation Breakdown
                        </h3>
                    </div>
                    <div className="flex-1 p-6 flex flex-col">
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={VIOLATION_TYPES}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {VIOLATION_TYPES.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-6 space-y-3">
                            {VIOLATION_TYPES.map((type) => (
                                <div key={type.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color }} />
                                        <span className="text-xs font-bold text-muted-foreground uppercase">{type.name}</span>
                                    </div>
                                    <span className="text-xs font-bold text-foreground">{type.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Enforcement Actions */}
                <div className="lg:col-span-8 bg-surface border border-border">
                    <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
                        <h3 className="text-lg font-heading font-bold text-foreground flex items-center gap-2">
                            <Gavel className="h-5 w-5 text-primary" />
                            Recent Enforcement Actions
                        </h3>
                        <button className="p-2 hover:bg-muted rounded transition-colors">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">ID</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vehicle</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Action</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Zone</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Officer</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {enforcementActions.map((action) => (
                                    <tr key={action.id} className="hover:bg-muted/10 transition-colors group cursor-default text-xs">
                                        <td className="px-6 py-4 font-bold text-foreground">{action.id}</td>
                                        <td className="px-6 py-4 font-bold text-foreground">{action.vehicle}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "font-bold",
                                                action.action === "CLAMPED" ? "text-warning" :
                                                    action.action === "TOWED" ? "text-danger" : "text-primary"
                                            )}>
                                                {action.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{action.zone}</td>
                                        <td className="px-6 py-4 text-muted-foreground font-medium">{action.officer}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                    action.status === "Paid" ? "bg-success/10 text-success" :
                                                        action.status === "Impounded" ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {action.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-muted/10 border-t border-border flex justify-center">
                        <button className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline">
                            View Full Enforcement Log
                        </button>
                    </div>
                </div>
            </div>

            {/* Appeals and Compliance Alerts */}
            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-surface border border-border p-6 flex flex-col gap-6">
                    <div className="flex items-center justify-between ">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            Open Appeals Status
                        </h3>
                        <span className="text-xs font-bold text-primary">24 Active</span>
                    </div>
                    <div className="space-y-4">
                        {[
                            { title: "Zone Mismatch Claim", user: "Ade A.", status: "Under Review" },
                            { title: "Faulty Meter Report", user: "Chidi O.", status: "Escalated" },
                            { title: "Technical Glitch", user: "Bisi T.", status: "Pending Evidence" },
                        ].map((appeal, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-muted/20 border border-border/50">
                                <div>
                                    <p className="text-xs font-bold text-foreground">{appeal.title}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase mt-1">By {appeal.user}</p>
                                </div>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{appeal.status}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-surface border border-border p-6 flex flex-col gap-6 bg-primary/[0.02]">
                    <div className="flex items-center justify-between ">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-success" />
                            Compliance Incentives
                        </h3>
                    </div>
                    <div className="p-4 bg-white/50 border border-dashed border-primary/30 rounded flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                            <TrendingUp className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-foreground">Compliance rate is up 4%</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Suggested reward for Surulere zone officers: &quot;Team Excellence Badge&quot;.</p>
                        </div>
                    </div>
                    <button className="w-full py-2 text-xs font-bold text-primary hover:bg-primary/5 transition-colors uppercase tracking-widest border border-primary/20">
                        Manage Reward tiers
                    </button>
                </div>
            </div>
        </div>
    );
}

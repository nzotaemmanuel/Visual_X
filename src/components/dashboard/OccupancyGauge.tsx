"use client";

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Car, Clock } from "lucide-react";

interface OccupancyGaugeProps {
    value: number;
    label: string;
    total: number;
}

export function OccupancyGauge({ value, label, total }: OccupancyGaugeProps) {
    const percentage = Math.round((value / total) * 100);
    const data = [
        { name: "Occupied", value: value },
        { name: "Available", value: total - value },
    ];

    const getColor = (pct: number) => {
        if (pct > 90) return "#991b1b"; // Danger
        if (pct > 75) return "#92400e"; // Warning
        return "#064e3b"; // Success
    };

    return (
        <div className="bg-surface border border-border p-6 flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-4 opacity-5">
                <Activity className="h-12 w-12 text-primary" />
            </div>

            <div className="mb-4 text-center">
                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{label}</h3>
                <p className="text-[10px] text-muted-foreground mt-1">Real-time utilization rate</p>
            </div>

            <div className="relative h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="100%"
                            startAngle={180}
                            endAngle={0}
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={0}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell fill={getColor(percentage)} />
                            <Cell fill="var(--color-muted)" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
                    <span className="text-4xl font-heading font-bold text-foreground">{percentage}%</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">Capacity</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full mt-6 pt-6 border-t border-border">
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Car className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Occupied</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{value.toLocaleString()}</span>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Bays</span>
                    </div>
                    <span className="text-lg font-bold text-foreground">{total.toLocaleString()}</span>
                </div>
            </div>

            <div className="mt-6 w-full">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase mb-2">
                    <span className="text-muted-foreground">Efficiency Trend</span>
                    <span className="text-success">+2.4% vs last hr</span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[65%] rounded-full" />
                </div>
            </div>
        </div>
    );
}

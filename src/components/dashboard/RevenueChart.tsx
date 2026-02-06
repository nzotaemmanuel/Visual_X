"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { MOCK_DASHBOARD_DATA } from "@/lib/constants";

export function RevenueChart({ selectedZone }: { selectedZone: string }) {
    // Simulated data shift for selected zone
    const chartData = selectedZone === "all"
        ? MOCK_DASHBOARD_DATA.revenueChart
        : MOCK_DASHBOARD_DATA.revenueChart.map(item => ({
            ...item,
            revenue: Math.floor(item.revenue * (0.3 + Math.random() * 0.4)) // Scale down for specific zone
        }));

    return (
        <div className="bg-surface border border-border p-6 h-[400px]">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-heading font-bold text-foreground">Revenue Collection</h3>
                        <p className="text-sm text-muted-foreground">Operational collection performance (Today)</p>
                    </div>
                    {selectedZone !== "all" ? (
                        <div className="flex items-center gap-2">
                            <div className="px-2 py-1 bg-success/10 text-[10px] font-bold text-success uppercase tracking-tighter rounded">
                                Zone Performance High
                            </div>
                            <div className="px-2 py-1 bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tighter rounded">
                                Filtered
                            </div>
                        </div>
                    ) : (
                        <div className="px-2 py-1 bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-tighter rounded">
                            Aggregate State
                        </div>
                    )}
                </div>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#064e3b" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#064e3b" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="time"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#64748b' }}
                            tickFormatter={(value) => `₦${(value / 1000000).toFixed(1)}M`}
                            dx={-10}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: 'none',
                                borderRadius: '0px',
                                color: '#fff'
                            }}
                            itemStyle={{ color: '#fff' }}
                            // @ts-expect-error: Recharts Tooltip formatter types can be restrictive
                            formatter={(value: number) => [`₦${value.toLocaleString()}`, "Revenue"] as [string, string]}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#064e3b"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

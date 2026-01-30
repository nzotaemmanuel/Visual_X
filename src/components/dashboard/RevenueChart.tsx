"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { MOCK_DASHBOARD_DATA } from "@/lib/constants";

export function RevenueChart() {
    return (
        <div className="bg-surface border border-border p-6 h-[400px]">
            <div className="mb-6">
                <h3 className="text-lg font-heading font-bold text-foreground">Revenue Trend</h3>
                <p className="text-sm text-muted-foreground">Real-time collection data (Today)</p>
            </div>

            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_DASHBOARD_DATA.revenueChart}>
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
                            // @ts-ignore
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

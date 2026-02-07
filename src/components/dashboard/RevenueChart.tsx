import { useState, useEffect } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { MOCK_DASHBOARD_DATA } from "@/lib/constants";

export function RevenueChart({ selectedZone }: { selectedZone: string }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // Simulated data shift for selected zone
    const chartData = !mounted || selectedZone === "all"
        ? MOCK_DASHBOARD_DATA.revenueChart
        : MOCK_DASHBOARD_DATA.revenueChart.map((item, i) => {
            const seed = parseInt(selectedZone) * 10 + i;
            const deterministicFactor = 0.3 + (Math.sin(seed) * 0.2 + 0.2); // Deterministic shift
            return {
                ...item,
                actual: Math.floor(item.actual * deterministicFactor),
                target: Math.floor(item.target * deterministicFactor)
            };
        });

    return (
            <div className="bg-surface border border-border p-6 h-[400px]">
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-heading font-bold text-foreground">Revenue Collection</h3>
                            <p className="text-sm text-muted-foreground">Operational collection performance (Today)</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Actual</span>
                            </div>
                            <div className="flex items-center gap-1.5 mr-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30 border border-muted-foreground/50" />
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Target</span>
                            </div>
                            {selectedZone !== "all" ? (
                                <div className="px-2 py-1 bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-tighter rounded">
                                    Filtered
                                </div>
                            ) : (
                                <div className="px-2 py-1 bg-muted text-[10px] font-bold text-muted-foreground uppercase tracking-tighter rounded">
                                    Aggregate
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#064e3b" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#064e3b" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.05} />
                                    <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
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
                                itemStyle={{ color: '#fff', fontSize: '12px' }}
                                labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}
                                // @ts-expect-error: Recharts Tooltip formatter types can be restrictive
                                formatter={(value: number) => [`₦${value.toLocaleString()}`] as [string]}
                            />
                            <Area
                                type="monotone"
                                dataKey="target"
                                stroke="#64748b"
                                strokeWidth={1.5}
                                strokeDasharray="5 5"
                                fillOpacity={1}
                                fill="url(#colorTarget)"
                                name="Target Revenue"
                            />
                            <Area
                                type="monotone"
                                dataKey="actual"
                                stroke="#064e3b"
                                strokeWidth={2.5}
                                fillOpacity={1}
                                fill="url(#colorActual)"
                                name="Actual Collection"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        );
    }

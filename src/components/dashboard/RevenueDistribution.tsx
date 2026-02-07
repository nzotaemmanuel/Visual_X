"use client";

import { Wallet, CreditCard, Banknote, Phone, Globe, Smartphone, MessageSquare, Terminal } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const CHANNEL_DATA = [
    { name: "Web", value: 4500000, color: "#064e3b" },
    { name: "Mobile App", value: 3800000, color: "#0d9488" },
    { name: "SMS", value: 1200000, color: "#0891b2" },
    { name: "POS", value: 2950000, color: "#0369a1" },
];

const PAYMENT_DATA = [
    { name: "Card", value: 5200000, icon: CreditCard },
    { name: "Wallet", value: 4100000, icon: Wallet },
    { name: "Cash", value: 2150000, icon: Banknote },
    { name: "Airtime", value: 1000000, icon: Phone },
];

export function RevenueDistribution() {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Revenue by Channel */}
            <div className="bg-surface border border-border p-6 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-lg font-heading font-bold text-foreground">Revenue by Channel</h3>
                    <p className="text-sm text-muted-foreground">Distribution across booking platforms.</p>
                </div>
                <div className="h-[250px] w-full mt-auto">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={CHANNEL_DATA} layout="vertical" margin={{ left: -20, right: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 'bold' }}
                                width={100}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0px' }}
                                itemStyle={{ color: '#fff' }}
                                // @ts-expect-error: Recharts Tooltip formatter types can be restrictive
                                formatter={(value: number) => `₦${(value / 1000000).toFixed(2)}M`}
                            />
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                                {CHANNEL_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-6 pt-6 border-t border-border">
                    {CHANNEL_DATA.map((item) => (
                        <div key={item.name} className="flex flex-col">
                            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.name}</span>
                            <span className="text-sm font-bold text-foreground">₦ {(item.value / 1000000).toFixed(1)}M</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Revenue by Payment Method */}
            <div className="bg-surface border border-border p-6 flex flex-col">
                <div className="mb-6">
                    <h3 className="text-lg font-heading font-bold text-foreground">Payment Methods</h3>
                    <p className="text-sm text-muted-foreground">How citizens are paying for parking.</p>
                </div>
                <div className="h-[250px] w-full mt-auto flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={PAYMENT_DATA}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {PAYMENT_DATA.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={index === 0 ? "#064e3b" : index === 1 ? "#0d9488" : index === 2 ? "#0891b2" : "#64748b"}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '0px' }}
                                itemStyle={{ color: '#fff' }}
                                // @ts-expect-error: Recharts Tooltip formatter types can be restrictive
                                formatter={(value: number) => `₦${(value / 1000000).toFixed(2)}M`}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute flex flex-col items-center justify-center pt-2">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Total</span>
                        <span className="text-lg font-bold text-foreground tracking-tighter">₦ 12.4M</span>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
                    {PAYMENT_DATA.map((item, index) => (
                        <div key={item.name} className="flex items-center gap-3">
                            <item.icon className={cn(
                                "h-4 w-4",
                                index === 0 ? "text-[#064e3b]" : index === 1 ? "text-[#0d9488]" : index === 2 ? "text-[#0891b2]" : "text-[#64748b]"
                            )} />
                            <div className="flex flex-col">
                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{item.name}</span>
                                <span className="text-sm font-bold text-foreground">{((item.value / 12450000) * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

"use client";

import { TrendingUp, TrendingDown, Target, AlertCircle, Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface RevenueKPIProps {
    label: string;
    value: string;
    description: string;
    trend: string;
    trendValue: string;
    icon: any;
    color: string;
}

const REVENUE_KPIS: RevenueKPIProps[] = [
    {
        label: "Total Revenue Collected",
        value: "₦ 12,450,000",
        description: "Aggregate revenue from all sources",
        trend: "up",
        trendValue: "+15.2%",
        icon: Target,
        color: "primary",
    },
    {
        label: "Collection Rate",
        value: "82.4%",
        description: "Paid vs. Issued fine ratio",
        trend: "up",
        trendValue: "+1.5%",
        icon: Percent,
        color: "success",
    },
    {
        label: "Outstanding (Fines)",
        value: "₦ 4.8M",
        description: "Uncollected revenue from penalties",
        trend: "down",
        trendValue: "-2.1%",
        icon: AlertCircle,
        color: "danger",
    },
];

export function RevenueKPIs({ selectedZone }: { selectedZone: string }) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            {REVENUE_KPIS.map((kpi) => {
                const Icon = kpi.icon;
                const isPositive = kpi.trend === "up";
                const isGood = kpi.label.includes("Outstanding") ? !isPositive : isPositive;

                // Simple simulated shift
                const displayValue = selectedZone === "all"
                    ? kpi.value
                    : kpi.label.includes("%")
                        ? `${(Math.random() * 10 + 75).toFixed(1)}%`
                        : kpi.label.includes("M")
                            ? `₦ ${(Math.random() * 0.5 + 0.1).toFixed(1)}M`
                            : `₦ ${(Math.floor(Math.random() * 500) + 800).toLocaleString()}`;

                return (
                    <div key={kpi.label} className="bg-surface border border-border p-6 relative overflow-hidden group hover:border-primary/50 transition-colors">
                        <div className={cn(
                            "absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity",
                            kpi.color === "primary" ? "text-primary" : kpi.color === "success" ? "text-success" : "text-danger"
                        )}>
                            <Icon className="h-16 w-16" />
                        </div>

                        <div className="flex items-center gap-3 mb-4">
                            <div className={cn(
                                "p-2 rounded-lg",
                                kpi.color === "primary" ? "bg-primary/10 text-primary" : kpi.color === "success" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                            )}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{kpi.label}</span>
                        </div>

                        <div className="flex items-baseline gap-1">
                            {displayValue.includes("₦") ? (
                                <>
                                    <span className="text-xl font-bold text-muted-foreground/70 mr-0.5">₦</span>
                                    <h3 className="text-2xl lg:text-3xl font-heading font-bold text-foreground">
                                        {displayValue.replace("₦", "").trim()}
                                    </h3>
                                </>
                            ) : (
                                <h3 className="text-3xl font-heading font-bold text-foreground">{displayValue}</h3>
                            )}
                            <div className={cn(
                                "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ml-2",
                                isGood ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                            )}>
                                {isPositive ? <TrendingUp className="h-2.5 w-2.5 mr-0.5" /> : <TrendingDown className="h-2.5 w-2.5 mr-0.5" />}
                                {kpi.trendValue}
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">{kpi.description}</p>
                    </div>
                );
            })}
        </div>
    );
}

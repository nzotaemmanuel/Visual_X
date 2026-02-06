import { ArrowUpRight, ArrowDownRight, Wallet, Activity, ShieldCheck, AlertOctagon, TrendingUp } from "lucide-react";
import { MOCK_DASHBOARD_DATA } from "@/lib/constants";
import { cn } from "@/lib/utils";

const IconMap = {
    Wallet,
    Activity,
    ShieldCheck,
    AlertOctagon,
    TrendingUp,
};

export function KPISection({ selectedZone }: { selectedZone: string }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {MOCK_DASHBOARD_DATA.kpis.map((kpi, index) => {
                const Icon = IconMap[kpi.icon as keyof typeof IconMap];
                const isPositive = kpi.trend === "up";
                const isGood = (kpi.icon === "AlertOctagon") ? !isPositive : isPositive;

                // Simple simulated shift for selected zone
                const displayValue = selectedZone === "all"
                    ? kpi.value
                    : kpi.label.includes("Collection") || kpi.label.includes("Recovery")
                        ? `₦ ${(Math.floor(Math.random() * 500000) + 100000).toLocaleString()}`
                        : kpi.label.includes("%") || kpi.label.includes("Rating")
                            ? `${(Math.random() * 20 + 70).toFixed(1)}%`
                            : (Math.random() * 50 + 10).toFixed(0);

                return (
                    <div
                        key={`${kpi.label}-${selectedZone}`}
                        className="group relative overflow-hidden bg-surface border border-border p-4 hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
                    >
                        {/* Contextual Color Strip */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1",
                            index === 0 ? "bg-primary" :
                                index === 1 ? "bg-secondary" :
                                    index === 2 ? "bg-success" : "bg-danger"
                        )} />

                        <div className="flex items-center justify-between pb-2">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                {kpi.label}
                            </span>
                            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>

                        <div className="flex items-baseline space-x-2">
                            <span className="text-2xl font-bold font-heading tabular-nums text-foreground animate-in fade-in slide-in-from-left-2 duration-500">
                                {displayValue}
                            </span>
                        </div>

                        <div className="mt-2 flex items-center text-xs">
                            <span className={cn(
                                "flex items-center font-medium",
                                isGood ? "text-success" : "text-danger"
                            )}>
                                {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                                {kpi.change}
                            </span>
                            <span className="ml-2 text-muted-foreground">vs. yesterday</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

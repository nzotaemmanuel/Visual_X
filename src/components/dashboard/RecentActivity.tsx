"use client";

import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { useMemo } from "react";

interface RecentActivityItem {
    id: string;
    type: "violation" | "payment" | "alert";
    message: string;
    time: string;
}

interface RecentActivityProps {
    activities?: RecentActivityItem[];
    searchQuery?: string;
}

export function RecentActivity({ activities = [], searchQuery = "" }: RecentActivityProps) {
    const filteredActivity = useMemo(() => {
        if (!searchQuery) return activities;
        return activities.filter(activity =>
            activity.message.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [activities, searchQuery]);

    return (
        <div className="bg-surface border border-border p-6 h-full min-h-[400px]">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-heading font-bold text-foreground">Live Operations Feed</h3>
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
            </div>

            <div className="space-y-6">
                {filteredActivity.length > 0 ? (
                    filteredActivity.map((activity, index) => {
                        let Icon = Info;
                        let iconColor = "text-blue-500";

                        if (activity.type === "violation") {
                            Icon = AlertTriangle;
                            iconColor = "text-danger";
                        } else if (activity.type === "payment") {
                            Icon = CheckCircle2;
                            iconColor = "text-success";
                        } else if (activity.type === "alert") {
                            Icon = AlertTriangle;
                            iconColor = "text-warning";
                        }

                        return (
                            <div
                                key={activity.id}
                                className="flex gap-4 group animate-in slide-in-from-right-4 duration-500 fill-mode-backwards"
                                style={{ animationDelay: `${index * 150}ms` }}
                            >
                                <div className="relative mt-1">
                                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-none border border-border bg-background group-hover:border-primary transition-colors", iconColor)}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    {index !== filteredActivity.length - 1 && (
                                        <div className="absolute top-8 left-1/2 -ml-px h-full w-px bg-border group-hover:bg-primary/20 transition-colors" />
                                    )}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none text-foreground">
                                        {activity.message}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.time}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">No operations found matching &quot;{searchQuery}&quot;</p>
                    </div>
                )}
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
    children: React.ReactNode;
}

import { SearchProvider } from "@/lib/SearchContext";

export function DashboardShell({ children }: DashboardShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <SearchProvider>
            <div className="min-h-screen bg-background flex">
                <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
                <div className={cn(
                    "flex-1 flex flex-col transition-all duration-300",
                    isCollapsed ? "pl-20" : "pl-20 lg:pl-64"
                )}>
                    <Header />
                    <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden">
                        {children}
                    </main>
                </div>
            </div>
        </SearchProvider>
    );
}

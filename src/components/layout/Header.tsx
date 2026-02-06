"use client";

import { Bell, Menu } from "lucide-react";
import { MOCK_USER } from "@/lib/constants";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { GlobalSearch } from "./GlobalSearch";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    const isHome = pathname === "/";

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-surface/80 px-6 backdrop-blur-sm transition-all">
            <div className="flex items-center gap-4">
                <button className="lg:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground">
                    <Menu className="h-6 w-6" />
                </button>
                {/* Global Search - Hidden on Executive Overview as per user request */}
                {!isHome && <GlobalSearch />}
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggle />
                {/* Notifications */}
                <button className="relative flex h-9 w-9 items-center justify-center rounded-none border border-border bg-surface text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
                    </span>
                </button>

                {/* User Profile */}
                <div className="flex items-center gap-3 border-l border-border pl-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium leading-none text-foreground">
                            {MOCK_USER.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {MOCK_USER.role}
                        </p>
                    </div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-none bg-primary text-primary-foreground font-medium text-sm">
                        {MOCK_USER.initials}
                    </div>
                </div>
            </div>
        </header>
    );
}

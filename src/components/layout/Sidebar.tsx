"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import NextImage from "next/image";
import { LucideIcon } from "lucide-react";

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-20 flex-col items-center border-r border-border bg-surface py-6 transition-all duration-300 hover:w-64 hover:shadow-xl lg:w-64">
            {/* Logo Area */}
            <div className="flex w-full items-center justify-center px-4 mb-8 lg:justify-start">
                <div className="relative h-10 w-10 shrink-0">
                    <NextImage
                        src="/logo.png"
                        alt="LASPA Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <div className="hidden ml-3 lg:block">
                    <h1 className="text-lg font-heading font-bold tracking-tight text-primary leading-none">
                        LASPA
                    </h1>
                    <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                        Command Center
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex w-full flex-col gap-2 px-2">
                {NAV_ITEMS.map((item) => (
                    <NavItem
                        key={item.href}
                        href={item.href}
                        icon={item.icon}
                        title={item.title}
                        isActive={pathname === item.href}
                    />
                ))}
            </nav>

            {/* Footer / Status */}
            <div className="mt-auto w-full px-4 pb-4">
                <div className="flex items-center gap-3 overflow-hidden rounded-none border border-border bg-muted/30 p-2">
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse shrink-0" />
                    <span className="hidden whitespace-nowrap text-xs font-medium text-muted-foreground lg:block">
                        System Operational
                    </span>
                </div>
            </div>
        </aside>
    );
}

interface NavItemProps {
    href: string;
    icon: LucideIcon;
    title: string;
    isActive: boolean;
}

function NavItem({ href, icon: Icon, title, isActive }: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex h-10 w-full items-center justify-center rounded-none px-3 text-sm font-medium transition-colors hover:bg-muted/50 lg:justify-start",
                isActive
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
            )}
        >
            <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
            <span
                className={cn(
                    "hidden ml-3 whitespace-nowrap lg:block transition-opacity duration-200"
                )}
            >
                {title}
            </span>
        </Link>
    );
}

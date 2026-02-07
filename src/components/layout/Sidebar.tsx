"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import NextImage from "next/image";
import { LucideIcon, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/lib/authContext";

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <aside className={cn(
            "fixed left-0 top-0 z-40 h-screen flex-col items-center border-r border-border bg-surface py-6 transition-all duration-300",
            isCollapsed ? "w-20" : "w-20 lg:w-64"
        )}>
            {/* Collapse Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-20 z-50 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground shadow-sm hover:text-primary transition-colors hidden lg:flex"
            >
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>

            {/* Logo Area */}
            <div className={cn(
                "flex w-full items-center px-4 mb-8 transition-all duration-300",
                isCollapsed ? "justify-center" : "justify-center lg:justify-start"
            )}>
                <div className="relative h-10 w-10 shrink-0">
                    <NextImage
                        src="/logo.png"
                        alt="LASPA Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                {!isCollapsed && (
                    <div className="hidden ml-3 lg:block animate-in fade-in duration-500">
                        <h1 className="text-lg font-heading font-bold tracking-tight text-primary leading-none">
                            LASPA
                        </h1>
                        <p className="text-[10px] text-muted-foreground tracking-widest uppercase">
                            Command Center
                        </p>
                    </div>
                )}
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
                        isCollapsed={isCollapsed}
                    />
                ))}
            </nav>

            {/* Footer / Status */}
            <div className="mt-auto w-full px-4 pb-4 space-y-4">
                {/* User Info */}
                {user && (
                    <div className={cn(
                        "flex items-center gap-3 overflow-hidden rounded-lg border border-border bg-muted/30 p-3 transition-all duration-300",
                        isCollapsed ? "justify-center" : "justify-start"
                    )}>
                        <div className="h-10 w-10 rounded-full bg-primary/20 text-primary font-semibold text-sm flex items-center justify-center shrink-0 flex-none">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        {!isCollapsed && (
                            <div className="hidden flex-1 lg:block min-w-0">
                                <p className="text-xs font-semibold text-foreground truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-[10px] text-muted-foreground truncate capitalize">
                                    {user.role.replace(/_/g, ' ')}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Logout Button */}
                <button
                    onClick={logout}
                    className={cn(
                        "flex items-center gap-3 w-full h-10 rounded-none px-3 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted/50",
                        isCollapsed ? "justify-center" : "justify-center lg:justify-start"
                    )}
                    title={isCollapsed ? "Logout" : undefined}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!isCollapsed && (
                        <span className="hidden ml-3 whitespace-nowrap lg:block">
                            Logout
                        </span>
                    )}
                </button>

                {/* System Status */}
                <div className={cn(
                    "flex items-center gap-3 overflow-hidden rounded-none border border-border bg-muted/30 p-2 transition-all duration-300",
                    isCollapsed ? "justify-center" : "justify-center lg:justify-start"
                )}>
                    <div className="h-2 w-2 rounded-full bg-success animate-pulse shrink-0" />
                    {!isCollapsed && (
                        <span className="hidden whitespace-nowrap text-xs font-medium text-muted-foreground lg:block animate-in fade-in duration-500">
                            System Operational
                        </span>
                    )}
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
    isCollapsed: boolean;
}

function NavItem({ href, icon: Icon, title, isActive, isCollapsed }: NavItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex h-10 w-full items-center justify-center rounded-none px-3 text-sm font-medium transition-colors hover:bg-muted/50 transition-all duration-300",
                !isCollapsed && "lg:justify-start",
                isActive
                    ? "bg-primary/10 text-primary border-r-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
            )}
            title={isCollapsed ? title : undefined}
        >
            <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive && "text-primary")} />
            {!isCollapsed && (
                <span
                    className={cn(
                        "hidden ml-3 whitespace-nowrap lg:block transition-all duration-300 animate-in fade-in slide-in-from-left-2"
                    )}
                >
                    {title}
                </span>
            )}
        </Link>
    );
}

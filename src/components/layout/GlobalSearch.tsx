"use client";

import { Search, X } from "lucide-react";
import { useSearch } from "@/lib/SearchContext";

export function GlobalSearch() {
    const { searchQuery, setSearchQuery } = useSearch();

    return (
        <div className="relative hidden md:block group">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter data on this page..."
                className="h-9 w-64 rounded-none border border-border bg-background pl-9 pr-9 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 lg:w-96 transition-all"
            />
            {searchQuery && (
                <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 p-0.5 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}

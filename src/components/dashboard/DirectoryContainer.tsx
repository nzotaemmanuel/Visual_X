"use client";

import { useState, useMemo } from "react";
import { ZoneFilter } from "./ZoneFilter";
import { useSearch } from "@/lib/SearchContext";
import {
    Users,
    Car,
    Search,
    Filter,
    UserPlus,
    ShieldCheck,
    MapPin,
    Calendar,
    ChevronRight,
    MoreHorizontal,
    Star,
    LayoutGrid,
    List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { generateUsers, generateVehicles } from "@/lib/mockData";

interface Zone {
    id: string;
    zoneCode: string;
    zoneName: string;
}

interface DirectoryContainerProps {
    zones: Zone[];
    initialMode?: "users" | "vehicles";
}

export function DirectoryContainer({ zones, initialMode = "users" }: DirectoryContainerProps) {
    const [mode, setMode] = useState<"users" | "vehicles">(initialMode);
    const [view, setView] = useState<"grid" | "list">("list");
    const [selectedZone, setSelectedZone] = useState("all");
    const { searchQuery } = useSearch();

    const filteredZones = useMemo(() => {
        if (!searchQuery) return zones;
        return zones.filter(z =>
            z.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            z.zoneCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [zones, searchQuery]);

    const allUsers = useMemo(() => generateUsers(selectedZone, zones), [selectedZone, zones]);
    const allVehicles = useMemo(() => generateVehicles(selectedZone, zones), [selectedZone, zones]);

    const filteredUsers = useMemo(() => {
        return allUsers.filter(u =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allUsers, searchQuery]);

    const filteredVehicles = useMemo(() => {
        return allVehicles.filter(v =>
            v.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.brand.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allVehicles, searchQuery]);

    return (
        <div className="flex flex-col gap-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-primary">
                        {mode === "users" ? "User Directory" : "Vehicle Ecosystem"}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {mode === "users"
                            ? "Manage Lagos State parking authorities and staff."
                            : "Track registered vehicles and parking history."}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-muted p-1 rounded-sm">
                    <button
                        onClick={() => setMode("users")}
                        className={cn(
                            "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                            mode === "users" ? "bg-surface shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setMode("vehicles")}
                        className={cn(
                            "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                            mode === "vehicles" ? "bg-surface shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Vehicles
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder={`Search ${mode}...`}
                            className="bg-surface border border-border pl-10 pr-4 py-2 text-xs w-[250px] outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>
                    <ZoneFilter
                        zones={filteredZones}
                        selectedZone={selectedZone}
                        onZoneChange={setSelectedZone}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 border-r border-border pr-4 mr-2">
                        <button
                            onClick={() => setView("grid")}
                            className={cn("p-1.5 rounded", view === "grid" ? "bg-muted text-primary" : "text-muted-foreground")}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setView("list")}
                            className={cn("p-1.5 rounded", view === "list" ? "bg-muted text-primary" : "text-muted-foreground")}
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary/90 transition-colors">
                        <UserPlus className="h-4 w-4" />
                        Add New {mode === "users" ? "Staff" : "Record"}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {mode === "users" ? (
                /* Users Content */
                view === "list" ? (
                    <div className="bg-surface border border-border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Employee</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assigned Zone</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-muted/10 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                                                    {user.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground">{user.name}</span>
                                                    <span className="text-[10px] text-muted-foreground italic">{user.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-3 w-3 text-primary/60" />
                                                <span className="text-xs text-muted-foreground">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">{user.zone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                user.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                            )}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-xs font-bold text-foreground">{user.rating.toFixed(1)}</span>
                                                <Star className="h-3 w-3 fill-warning text-warning" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredUsers.map((user) => (
                            <div key={user.id} className="bg-surface border border-border p-6 group hover:border-primary/50 transition-colors relative">
                                <div className="absolute top-4 right-4">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                        user.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                    )}>
                                        {user.status}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xl mb-4 border border-primary/10">
                                        {user.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">{user.name}</h3>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">{user.role}</p>

                                    <div className="w-full h-px bg-border my-4" />

                                    <div className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                                        <div className="flex flex-col items-start gap-1">
                                            <span>Zone</span>
                                            <span className="text-foreground">{user.zone}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span>Rating</span>
                                            <div className="flex items-center gap-1 text-foreground">
                                                {user.rating.toFixed(1)} <Star className="h-2 w-2 fill-warning text-warning" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                /* Vehicles Content */
                view === "list" ? (
                    <div className="bg-surface border border-border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vehicle Plate</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Commercial/Owner</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Zone</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Sessions</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredVehicles.map((veh) => (
                                    <tr key={veh.id} className="hover:bg-muted/10 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-extrabold text-foreground tracking-widest bg-muted px-2 py-1 rounded-sm border border-border inline-block w-fit">
                                                    {veh.plate}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground mt-1 uppercase font-bold">{veh.brand}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-muted-foreground font-medium">{veh.owner}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">{veh.zone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs font-bold text-foreground">{veh.sessions}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-end">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                    veh.status === "Parked" ? "bg-primary/10 text-primary" :
                                                        veh.status === "Violating" ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground"
                                                )}>
                                                    {veh.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredVehicles.map((veh) => (
                            <div key={veh.id} className="bg-surface border border-border p-4 group hover:border-primary/50 transition-colors flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-foreground tracking-widest bg-muted px-2 py-1 rounded-sm border border-border">
                                        {veh.plate}
                                    </span>
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                                        veh.status === "Parked" ? "bg-primary/10 text-primary" :
                                            veh.status === "Violating" ? "bg-danger/10 text-danger" : "bg-muted text-muted-foreground"
                                    )}>
                                        {veh.status}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground tracking-tight">{veh.brand}</h4>
                                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{veh.owner} Account</p>
                                </div>
                                <div className="h-px bg-border w-full" />
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold">
                                    <span>{veh.zone}</span>
                                    <span>{veh.sessions} Runs</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {/* Pagination/Status Footer */}
            <div className="flex items-center justify-between px-6 py-4 bg-surface border border-border -mt-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Showing {mode === "users" ? filteredUsers.length : filteredVehicles.length} results
                </p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-muted text-[10px] font-bold uppercase hover:bg-muted/80 transition-colors">Prev</button>
                    <button className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase hover:bg-primary/90 transition-colors">Next</button>
                </div>
            </div>
        </div>
    );
}

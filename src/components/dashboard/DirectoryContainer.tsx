"use client";

import { useState, useMemo, useEffect } from "react";
import { ZoneFilter } from "./ZoneFilter";
import { StaffModal } from "./StaffModal";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
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
    List,
    Edit,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
// import { Staff } from "@prisma/client";

interface Staff {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: string;
    accountStatus: string;
    createdAt: Date;
    updatedAt: Date;
    // Optional properties for UI/Mock compatibility
    passwordHash?: string;
    isActive?: boolean;
    lastActiveAt?: Date | null;
    name?: string;
    zone?: string;
    status?: string;
    rating?: number;
}

interface Zone {
    id: string;
    zoneCode: string;
    zoneName: string;
}

interface DisplayStaff extends Staff {
    // UI display properties
    displayName?: string;
}

interface DirectoryContainerProps {
    zones: Zone[];
    initialMode?: "staff" | "vehicles";
    staffData?: Staff[];
}

export function DirectoryContainer({ zones, initialMode = "staff", staffData = [] }: DirectoryContainerProps) {
    const [mode, setMode] = useState<"staff" | "vehicles">(initialMode);
    const [view, setView] = useState<"grid" | "list">("list");
    const [selectedZone, setSelectedZone] = useState("all");
    const { searchQuery } = useSearch();
    const [editingStaff, setEditingStaff] = useState<DisplayStaff | null>(null);
    const [deletingStaff, setDeletingStaff] = useState<DisplayStaff | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [allVehicles, setAllVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const filteredZones = useMemo(() => {
        if (!searchQuery) return zones;
        return zones.filter(z =>
            z.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            z.zoneCode.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [zones, searchQuery]);

    // Transform database staff data to display format
    const displayStaffList = useMemo(() => {
        return staffData.map(staff => ({
            ...staff,
            displayName: `${staff.firstName} ${staff.lastName}`
        }));
    }, [staffData]);

    useEffect(() => {
        const fetchVehicles = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedZone !== 'all') {
                    params.append('zoneId', selectedZone);
                }
                const response = await fetch(`/api/vehicles?${params}`);
                const data = await response.json();
                setAllVehicles(data);
            } catch (error) {
                console.error('Failed to fetch vehicles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVehicles();
    }, [selectedZone]);

    const filteredStaff = useMemo(() => {
        return displayStaffList.filter(staff =>
            staff.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            staff.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [displayStaffList, searchQuery]);

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
                        {mode === "staff" ? "Staff Directory" : "Vehicle Ecosystem"}
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        {mode === "staff"
                            ? "Manage parking agents, enforcement officers, and administrators."
                            : "Track registered vehicles and parking history."}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-muted p-1 rounded-sm">
                    <button
                        onClick={() => setMode("staff")}
                        className={cn(
                            "px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
                            mode === "staff" ? "bg-surface shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Staff
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
                        Add New {mode === "staff" ? "Staff" : "Record"}
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            {mode === "staff" ? (
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
                                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredStaff.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-muted/10 transition-colors group cursor-pointer">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                                                    {staff.displayName?.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-foreground">{staff.displayName}</span>
                                                    <span className="text-[10px] text-muted-foreground italic">{staff.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="h-3 w-3 text-primary/60" />
                                                <span className="text-xs text-muted-foreground">{staff.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">{staff.phoneNumber}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                                staff.accountStatus === "ACTIVE" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                            )}>
                                                {staff.accountStatus === "ACTIVE" ? "Active" : "Suspended"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <span className="text-xs font-bold text-foreground">Staff</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => setEditingStaff(staff)}
                                                    className="p-1 hover:bg-primary/10 text-primary rounded transition-colors"
                                                    title="Edit staff"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingStaff(staff)}
                                                    className="p-1 hover:bg-danger/10 text-danger rounded transition-colors"
                                                    title="Delete staff"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredStaff.map((staff) => (
                            <div key={staff.id} className="bg-surface border border-border p-6 group hover:border-primary/50 transition-colors relative">
                                <div className="absolute top-4 right-4">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                                        staff.accountStatus === "ACTIVE" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                    )}>
                                        {staff.accountStatus === "ACTIVE" ? "Active" : "Suspended"}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center">
                                    <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center text-primary font-bold text-xl mb-4 border border-primary/10">
                                        {staff.displayName?.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <h3 className="text-sm font-bold text-foreground">{staff.displayName}</h3>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">{staff.role}</p>

                                    <div className="w-full h-px bg-border my-4" />

                                    <div className="w-full flex items-center justify-between text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">
                                        <div className="flex flex-col items-start gap-1">
                                            <span>Email</span>
                                            <span className="text-foreground text-[9px] normal-case lowercase">{staff.email}</span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span>Phone</span>
                                            <span className="text-foreground text-[9px]">{staff.phoneNumber}</span>
                                        </div>
                                    </div>

                                    <div className="w-full h-px bg-border my-4" />

                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setEditingStaff(staff)}
                                            className="flex-1 px-3 py-2 bg-primary/10 text-primary text-xs font-bold rounded hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Edit className="h-3 w-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setDeletingStaff(staff)}
                                            className="flex-1 px-3 py-2 bg-danger/10 text-danger text-xs font-bold rounded hover:bg-danger/20 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Trash2 className="h-3 w-3" />
                                            Remove
                                        </button>
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
                    Showing {mode === "staff" ? filteredStaff.length : filteredVehicles.length} results
                </p>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-muted text-[10px] font-bold uppercase hover:bg-muted/80 transition-colors">Prev</button>
                    <button className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase hover:bg-primary/90 transition-colors">Next</button>
                </div>
            </div>

            {/* Modals */}
            {editingStaff && (
                <StaffModal
                    staff={editingStaff as any}
                    isOpen={!!editingStaff}
                    onClose={() => setEditingStaff(null)}
                    onSave={() => setRefreshKey(prev => prev + 1)}
                />
            )}

            {deletingStaff && (
                <DeleteConfirmDialog
                    staffId={deletingStaff.id}
                    staffName={deletingStaff.displayName || `${deletingStaff.firstName} ${deletingStaff.lastName}`}
                    isOpen={!!deletingStaff}
                    onClose={() => setDeletingStaff(null)}
                    onConfirm={() => setRefreshKey(prev => prev + 1)}
                />
            )}
        </div>
    );
}

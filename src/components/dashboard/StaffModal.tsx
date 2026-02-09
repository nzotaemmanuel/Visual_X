"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateStaff } from "@/app/actions/staff";
export enum StaffRole {
    ADMIN = "ADMIN",
    PARKING_AGENT = "PARKING_AGENT",
    ENFORCEMENT_AGENT = "ENFORCEMENT_AGENT",
}

export enum AccountStatus {
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
}

interface Staff {
    id?: number | string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    role?: StaffRole;
    accountStatus?: AccountStatus;
    // Mock data properties
    name?: string;
    zone?: string;
    status?: string;
    rating?: number;
}

interface StaffModalProps {
    staff?: Staff | null;
    isOpen: boolean;
    onClose: () => void;
    onSave?: () => void;
}

export function StaffModal({ staff, isOpen, onClose, onSave }: StaffModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<Staff>>(
        staff || {
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            role: StaffRole.PARKING_AGENT,
            accountStatus: AccountStatus.ACTIVE,
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (!staff?.id) {
                setError("Staff ID is required");
                return;
            }

            const numericId = typeof staff.id === 'string' ? parseInt(staff.id) : staff.id;
            const result = await updateStaff(numericId, formData);

            if (result.success) {
                onSave?.();
                onClose();
            } else {
                setError(result.error || "Failed to update staff");
            }
        } catch (err) {
            setError("An error occurred while updating staff");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-lg shadow-lg w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-bold text-foreground">
                        {staff ? "Edit Staff" : "Add New Staff"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-muted rounded transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName || ""}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm focus:outline-none focus:border-primary"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-muted border border-border rounded text-sm focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber || ""}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-muted border border-border rounded text-sm focus:outline-none focus:border-primary"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                                Role
                            </label>
                            <select
                                name="role"
                                value={formData.role || StaffRole.PARKING_AGENT}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm focus:outline-none focus:border-primary"
                            >
                                <option value={StaffRole.ADMIN}>Admin</option>
                                <option value={StaffRole.PARKING_AGENT}>Parking Agent</option>
                                <option value={StaffRole.ENFORCEMENT_AGENT}>Enforcement Agent</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase mb-2">
                                Status
                            </label>
                            <select
                                name="accountStatus"
                                value={formData.accountStatus || AccountStatus.ACTIVE}
                                onChange={handleChange}
                                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm focus:outline-none focus:border-primary"
                            >
                                <option value={AccountStatus.ACTIVE}>Active</option>
                                <option value={AccountStatus.SUSPENDED}>Suspended</option>
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-border text-foreground rounded font-bold text-sm hover:bg-muted transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={cn(
                                "flex-1 px-4 py-2 bg-primary text-white rounded font-bold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

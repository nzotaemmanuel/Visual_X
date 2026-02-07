"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { deleteStaff } from "@/app/actions/staff";

interface DeleteConfirmDialogProps {
    staffId: string | number;
    staffName: string;
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
}

export function DeleteConfirmDialog({
    staffId,
    staffName,
    isOpen,
    onClose,
    onConfirm,
}: DeleteConfirmDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setError(null);
        setIsLoading(true);

        try {
            const numericId = typeof staffId === 'string' ? parseInt(staffId) : staffId;
            const result = await deleteStaff(numericId);

            if (result.success) {
                onConfirm?.();
                onClose();
            } else {
                setError(result.error || "Failed to delete staff");
            }
        } catch (err) {
            setError("An error occurred while deleting staff");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-surface border border-border rounded-lg shadow-lg w-full max-w-sm mx-4">
                {/* Content */}
                <div className="p-6">
                    <h2 className="text-lg font-bold text-foreground mb-2">
                        Delete Staff Member?
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Are you sure you want to remove <span className="font-semibold text-foreground">{staffName}</span> from the system? This action cannot be undone.
                    </p>

                    {error && (
                        <div className="p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className={cn(
                                "flex-1 px-4 py-2 border border-border text-foreground rounded font-bold text-sm hover:bg-muted transition-colors",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isLoading}
                            className={cn(
                                "flex-1 px-4 py-2 bg-danger text-white rounded font-bold text-sm hover:bg-danger/90 transition-colors flex items-center justify-center gap-2",
                                isLoading && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {isLoading ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

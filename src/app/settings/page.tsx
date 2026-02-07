import { DashboardShell } from "@/components/layout/DashboardShell";
import Link from "next/link";
import { Users, Settings } from "lucide-react";

export default function SettingsPage() {
    return (
        <DashboardShell>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-primary">
                        System Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Configure dashboard preferences and API integrations.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* User Management Card */}
                    <Link href="/settings/users">
                        <div className="bg-surface border border-border p-6 rounded-lg hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer h-full flex flex-col items-center justify-center text-center">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Users className="text-primary" size={32} />
                            </div>
                            <h3 className="text-xl font-heading font-bold text-foreground">User Management</h3>
                            <p className="text-muted-foreground max-w-md mt-2">
                                Manage system users, roles, and permissions.
                            </p>
                        </div>
                    </Link>

                    {/* Configuration Card */}
                    <div className="bg-surface border border-border p-6 rounded-lg flex flex-col items-center justify-center text-center">
                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                            <Settings className="text-primary" size={32} />
                        </div>
                        <h3 className="text-xl font-heading font-bold text-foreground">Configuration</h3>
                        <p className="text-muted-foreground max-w-md mt-2">
                            Global system parameters and webhooks configuration.
                        </p>
                    </div>
                </div>
            </div>
        </DashboardShell>
    );
}

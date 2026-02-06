import { DashboardShell } from "@/components/layout/DashboardShell";

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

                <div className="bg-surface border border-border p-12 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">⚙️</span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-foreground">Configuration Module</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                        Global system parameters and webhooks configuration.
                    </p>
                </div>
            </div>
        </DashboardShell>
    );
}

import { DashboardShell } from "@/components/layout/DashboardShell";

export default function EnforcementPage() {
    return (
        <DashboardShell>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-primary">
                        Enforcement & Compliance
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Monitoring violations, clamps, and towing operations.
                    </p>
                </div>

                <div className="bg-surface border border-border p-12 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">🛡️</span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-foreground">Enforcement Feed Initializing</h3>
                    <p className="text-muted-foreground max-w-md mt-2">
                        Aggregating field officer reports and violation data.
                    </p>
                </div>
            </div>
        </DashboardShell>
    );
}

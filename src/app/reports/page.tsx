"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useState } from "react";
import { Download } from "lucide-react";

function ReportsControls() {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const download = async (url: string, filename: string) => {
        setLoading(true);
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Export failed');
            const blob = await res.blob();
            const u = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = u;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(u);
        } catch (err) {
            console.error(err);
            alert('Export failed — check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const exportTopZones = () => download('/api/reports/top-zones', 'top-zones.csv');

    const exportTransactions = () => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('zoneId', 'all');
        download(`/api/reports/transactions?${params.toString()}`, 'transactions.csv');
    };

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="bg-surface border border-border p-6">
                <h3 className="text-lg font-heading font-bold mb-2">Top Zones Leaderboard</h3>
                <p className="text-sm text-muted-foreground mb-4">Download the full leaderboard of zones with revenue and occupancy.</p>
                <button onClick={exportTopZones} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-bold text-xs rounded hover:bg-primary/90 transition-colors disabled:opacity-50">
                    <Download className="h-4 w-4" />
                    {loading ? 'Preparing…' : 'Download Top Zones (CSV)'}
                </button>
            </div>

            <div className="bg-surface border border-border p-6">
                <h3 className="text-lg font-heading font-bold mb-2">Transactions Export</h3>
                <p className="text-sm text-muted-foreground mb-4">Export the full transaction history. Use the date fields to restrict the export.</p>
                <div className="flex flex-col gap-6 mb-6">
                    {/* Row 1: Date Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">From</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full h-10 px-3 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">To</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full h-10 px-3 bg-background border border-border rounded text-sm focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    {/* Row 2: Action Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-start">
                        <button
                            onClick={exportTransactions}
                            disabled={loading}
                            className="h-10 px-4 bg-primary text-primary-foreground font-bold text-xs rounded hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full whitespace-nowrap"
                        >
                            <Download className="h-4 w-4" />
                            {loading ? 'Processing...' : 'Download Transactions (CSV)'}
                        </button>

                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="h-10 px-4 border border-red-200 bg-background hover:bg-red-50 text-red-600 text-xs font-bold uppercase tracking-wider rounded transition-colors w-full sm:w-auto"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ReportsPage() {
    return (
        <DashboardShell>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-3xl font-heading font-bold tracking-tight text-primary">Reports & Exports</h1>
                    <p className="text-muted-foreground mt-1">Generate and download operational reports.</p>
                </div>

                <ReportsControls />

                <div className="bg-surface border border-border p-12 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">📄</span>
                    </div>
                    <h3 className="text-xl font-heading font-bold text-foreground">Reporting Engine Offline</h3>
                    <p className="text-muted-foreground max-w-md mt-2">Additional export formats (PDF, Excel) and scheduled reports will be available soon.</p>
                </div>
            </div>
        </DashboardShell>
    );
}

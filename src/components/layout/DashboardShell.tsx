import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardShellProps {
    children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
    return (
        <div className="min-h-screen bg-background flex">
            <Sidebar />
            <div className="flex-1 flex flex-col pl-20 lg:pl-64 transition-all duration-300">
                <Header />
                <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}

import {
    LayoutDashboard,
    BarChart3,
    Map,
    AlertTriangle,
    Users,
    Settings,
    FileText,
    Car
} from "lucide-react";

export const NAV_ITEMS = [
    {
        title: "Executive Overview",
        href: "/",
        icon: LayoutDashboard,
        variant: "default",
    },
    {
        title: "Revenue Analytics",
        href: "/revenue",
        icon: BarChart3,
        variant: "ghost",
    },
    {
        title: "Operations Map",
        href: "/map",
        icon: Map,
        variant: "ghost",
    },
    {
        title: "Enforcement",
        href: "/enforcement",
        icon: AlertTriangle,
        variant: "ghost",
    },
    {
        title: "Vehicle Analytics",
        href: "/vehicles",
        icon: Car,
        variant: "ghost",
    },
    {
        title: "Reports",
        href: "/reports",
        icon: FileText,
        variant: "ghost",
    },
    {
        title: "Staff Management",
        href: "/staff",
        icon: Users,
        variant: "ghost",
    },
    {
        title: "Settings",
        href: "/settings",
        icon: Settings,
        variant: "ghost",
    },
];

export const MOCK_STAFF = {
    name: "Emmanuel Nzota",
    role: "Director of Operations",
    avatar: "/avatars/emmanuel.jpg", // Placeholder
    initials: "EN",
};

export const MOCK_DASHBOARD_DATA = {
    kpis: [
        {
            label: "Total Collection",
            value: "₦ 12,450,000",
            change: "+15.2%",
            trend: "up",
            icon: "Wallet",
        },
        {
            label: "Avg. Occupancy",
            value: "84.2%",
            change: "+3.1%",
            trend: "up",
            icon: "Activity",
        },
        {
            label: "Compliance Rating",
            value: "91.8%",
            change: "-0.5%",
            trend: "down",
            icon: "ShieldCheck",
        },
        {
            label: "Recovery Potential",
            value: "₦ 2,840,000",
            change: "+11.4%",
            trend: "up",
            icon: "TrendingUp",
        },
    ],
    revenueChart: [
        { time: "06:00", actual: 150000, target: 200000 },
        { time: "08:00", actual: 450000, target: 500000 },
        { time: "10:00", actual: 1200000, target: 1100000 },
        { time: "12:00", actual: 3800000, target: 3500000 },
        { time: "14:00", actual: 4100000, target: 4000000 },
        { time: "16:00", actual: 3900000, target: 3800000 },
        { time: "18:00", actual: 2800000, target: 3000000 },
        { time: "20:00", actual: 1200000, target: 1500000 },
    ],
    recentActivity: [
        {
            id: 1,
            type: "violation",
            message: "Overstay detected: Plate KJA-101-AA at Mr DotMan Bay",
            time: "2 mins ago",
        },
        {
            id: 2,
            type: "payment",
            message: "New Ticket: 2h session for Plate LND-202-XY",
            time: "5 mins ago",
        },
        {
            id: 3,
            type: "alert",
            message: "Zone IKEJA reached 92% occupancy threshold",
            time: "12 mins ago",
        },
        {
            id: 4,
            type: "payment",
            message: "Fine Paid: Violation VIO-88291 resolved",
            time: "15 mins ago",
        },
    ],
};

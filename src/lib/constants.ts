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
        title: "User Management",
        href: "/users",
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

export const MOCK_USER = {
    name: "Emmanuel Adebayo",
    role: "Director of Operations",
    avatar: "/avatars/emmanuel.jpg", // Placeholder
    initials: "EA",
};

export const MOCK_DASHBOARD_DATA = {
    kpis: [
        {
            label: "Total Revenue (Today)",
            value: "₦ 4,250,000",
            change: "+12.5%",
            trend: "up",
            icon: "Wallet",
        },
        {
            label: "Utilization Rate",
            value: "78%",
            change: "+5.2%",
            trend: "up",
            icon: "Activity",
        },
        {
            label: "Compliance Rate",
            value: "92%",
            change: "-1.1%",
            trend: "down",
            icon: "ShieldCheck",
        },
        {
            label: "Active Violations",
            value: "142",
            change: "+8",
            trend: "up", // Actually bad, but number went up
            icon: "AlertOctagon",
        },
    ],
    revenueChart: [
        { time: "06:00", revenue: 150000 },
        { time: "08:00", revenue: 450000 },
        { time: "10:00", revenue: 1200000 },
        { time: "12:00", revenue: 3800000 },
        { time: "14:00", revenue: 4100000 },
        { time: "16:00", revenue: 3900000 },
        { time: "18:00", revenue: 2800000 },
        { time: "20:00", revenue: 1200000 },
    ],
    recentActivity: [
        {
            id: 1,
            type: "violation",
            message: "Illegal Parking detected at Zone A (Ikeja)",
            time: "2 mins ago",
        },
        {
            id: 2,
            type: "payment",
            message: "Payment received for Plate LAG-552-XY",
            time: "5 mins ago",
        },
        {
            id: 3,
            type: "alert",
            message: "Zone C (Victoria Island) reached 95% capacity",
            time: "12 mins ago",
        },
        {
            id: 4,
            type: "payment",
            message: "Payment received for Plate ABC-123-DE",
            time: "15 mins ago",
        },
    ],
};

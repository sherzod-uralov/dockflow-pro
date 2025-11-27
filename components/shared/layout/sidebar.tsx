"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Files,
    Settings,
    LogOut,
    X,
    ChevronDown,
    Home,
    DockIcon,
    Book,
    Layers,
    LucideLogs,
    Building,
    FileText,
    FolderOpen,
    LayoutTemplate,
    Workflow,
    ClipboardList,
    Users,
    Shield,
    Key,
    User,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Cookie from "js-cookie";
import { useLogoutMutation } from "@/features/login/hook/login.hook";
import { usePermission } from "@/providers/permission-provider";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

interface SubItem {
    label: string;
    href: string;
    permission?: string;
}

interface MenuItem {
    icon: any;
    label: string;
    href?: string;
    permission?: string;
    subItems?: SubItem[];
}

const menuItems: MenuItem[] = [
    {
        icon: Home,
        label: "Asosiy",
        href: "/dashboard",
    },
    {
        icon: FileText,
        label: "Hujjatlar",
        href: "/dashboard/document",
        permission: "document:list",
    },
    {
        icon: FolderOpen,
        label: "Hujjat Turlari",
        href: "/dashboard/document-type",
        permission: "document-type:list",
    },
    {
        icon: LayoutTemplate,
        label: "Hujjat Andozalari",
        href: "/dashboard/document-template",
        permission: "document-template:list",
    },
    {
        icon: Book,
        label: "Jurnallar",
        href: "/dashboard/journal",
        permission: "journal:list",
    },
    {
        icon: Workflow,
        label: "Hujjat aylanmasi",
        permission: "workflow:list",
        subItems: [
            {
                label: "Hujjat aylanmasi",
                href: "/dashboard/workflow",
                permission: "workflow:list",
            },
            {
                label: "Hujjat aylanmasi andozalari",
                href: "/dashboard/workflow-template",
                permission: "workflow:list",
            },
        ],
    },
    {
        icon: Building,
        label: "Bo'limlar",
        href: "/dashboard/department",
        permission: "department:list",
    },
    {
        icon: ClipboardList,
        label: "Audit jurnallar",
        href: "/dashboard/audit-log",
        permission: "admin:view_audit_logs",
    },
    {
        icon: Settings,
        label: "Tizim Boshqaruvi",
        subItems: [
            {
                label: "Foydalanuvchilar",
                href: "/dashboard/admin/users",
                permission: "user:list",
            },
            {
                label: "Rollar",
                href: "/dashboard/admin/roles",
                permission: "role:list",
            },
            {
                label: "Ruxsatlar",
                href: "/dashboard/admin/permissions",
                permission: "permission:list",
            },
        ],
    },
    {
        icon: User,
        label: "Sozlamalar",
        subItems: [
            {
                label: "Profil",
                href: "/dashboard/setting/profile"
            },
        ],
    },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const router = useRouter();
    const pathname: any = usePathname();
    const logOutMutation = useLogoutMutation();
    const { hasPermission } = usePermission();

    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [closingMenu, setClosingMenu] = useState<string | null>(null);

    const filteredMenuItems = useMemo(() => {
        return menuItems
            .map((item) => {
                if (!item.permission && !item.subItems) return item;

                if (item.permission && !hasPermission(item.permission)) return null;

                if (item.subItems) {
                    const filteredSubItems = item.subItems.filter((sub) => {
                        if (!sub.permission) return true;
                        return hasPermission(sub.permission);
                    });

                    if (filteredSubItems.length === 0) return null;

                    return { ...item, subItems: filteredSubItems };
                }

                return item;
            })
            .filter((item): item is MenuItem => item !== null);
    }, [hasPermission]);

    useEffect(() => {
        // Avtomatik ochish: joriy pathga mos keladigan menyuni ochish
        filteredMenuItems.forEach((item) => {
            if (item.subItems?.some((sub) => pathname.startsWith(sub.href))) {
                setOpenMenu(item.label);
            }
        });
    }, [pathname, filteredMenuItems]);

    const toggleMenu = (label: string) => {
        if (openMenu === label) {
            setClosingMenu(label);
            setTimeout(() => {
                setOpenMenu(null);
                setClosingMenu(null);
            }, 200);
        } else {
            if (openMenu) {
                setClosingMenu(openMenu);
                setTimeout(() => {
                    setOpenMenu(label);
                    setClosingMenu(null);
                }, 150);
            } else {
                setOpenMenu(label);
            }
        }
    };

    const handleItemClick = (href?: string) => {
        if (href) {
            router.push(href);
            onClose();
        }
    };

    const handleLogout = () => {
        logOutMutation.mutate();
        Cookie.remove("accessToken");
        router.push("/login");
    };

    const isMenuOpen = (label: string) => openMenu === label && !closingMenu;
    const isMenuClosing = (label: string) => closingMenu === label;

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
                    onClick={onClose}
                />
            )}
            <div
                className={cn(
                    "fixed lg:static overflow-y-auto overflow-x-hidden inset-y-0 left-0 z-50 w-64 bg-card border-r border-sidebar-border transform transition-all duration-300 ease-in-out lg:translate-x-0 flex flex-col",
                    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-3.5 border-b border-sidebar-border bg-card/95 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                            <Files className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-sidebar-foreground">
                                DockFlow
                            </h2>
                            <p className="text-xs text-muted-foreground">Pro</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent transition-colors duration-200"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 p-4 space-y-1">
                    {filteredMenuItems.map((item) => (
                        <div key={item.label} className="relative">
                            {item.subItems ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        onClick={() => toggleMenu(item.label)}
                                        className={cn(
                                            "flex w-full items-center justify-between px-3 py-3 rounded-xl text-left transition-all duration-200",
                                            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-sidebar-accent",
                                            isMenuOpen(item.label) &&
                                            "bg-sidebar-accent text-sidebar-accent-foreground",
                                        )}
                                    >
                                        <div className="flex items-center text-sm font-medium">
                                            <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                                            <span className="truncate">{item.label}</span>
                                        </div>
                                        <ChevronDown
                                            className={cn(
                                                "w-4 h-4 flex-shrink-0 transition-transform duration-300",
                                                isMenuOpen(item.label) && "rotate-180",
                                                isMenuClosing(item.label) && "rotate-0",
                                            )}
                                        />
                                    </Button>

                                    {/* Submenu with animation */}
                                    <div
                                        className={cn(
                                            "ml-4 mt-1 space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
                                            isMenuOpen(item.label)
                                                ? "max-h-96 opacity-100"
                                                : "max-h-0 opacity-0",
                                            isMenuClosing(item.label) && "max-h-0 opacity-0",
                                        )}
                                    >
                                        {item.subItems.map((sub) => (
                                            <Button
                                                key={sub.href}
                                                variant="ghost"
                                                onClick={() => handleItemClick(sub.href)}
                                                className={cn(
                                                    "w-full justify-start text-left h-9 px-4 text-sm rounded-lg transition-all duration-200",
                                                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                                    "focus:outline-none focus:ring-2 focus:ring-primary/20",
                                                    pathname === sub.href
                                                        ? "bg-primary text-white hover:bg-primary hover:text-white shadow-md"
                                                        : "",
                                                )}
                                            >
                                                <span className="truncate">{sub.label}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <Button
                                    variant="ghost"
                                    onClick={() => handleItemClick(item.href)}
                                    className={cn(
                                        "w-full justify-start text-left relative rounded-xl h-11 px-4 transition-all duration-200",
                                        "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                                        "focus:outline-none focus:ring-2 focus:ring-primary/20",
                                        pathname === item.href
                                            ? "bg-primary text-white hover:bg-primary hover:text-white shadow-md before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-white before:rounded-r-full"
                                            : "",
                                    )}
                                >
                                    <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span className="truncate font-medium">{item.label}</span>
                                </Button>
                            )}
                        </div>
                    ))}
                </nav>

                {/* Footer - Logout */}
                <div className="p-4 border-t border-sidebar-border bg-card/95 backdrop-blur-sm">
                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className={cn(
                            "w-full justify-start text-left rounded-xl h-11 px-4 transition-all duration-200",
                            "text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground",
                            "focus:outline-none focus:ring-2 focus:ring-destructive/20",
                        )}
                    >
                        <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
                        <span className="font-medium">Tizimdan Chiqish</span>
                    </Button>
                </div>
            </div>
        </>
    );
}
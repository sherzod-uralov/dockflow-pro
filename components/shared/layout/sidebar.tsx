"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Files,
  FolderOpen,
  Upload,
  Download,
  Trash2,
  Settings,
  Users,
  BarChart3,
  LogOut,
  X,
  ChevronDown,
  Home,
  DockIcon,
  UserCog,
  Book,
  BookTemplateIcon,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Cookie from "js-cookie";
import { useLogoutMutation } from "@/features/login/hook/login.hook";
interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  icon: any;
  label: string;
  href?: string;
  subItems?: { label: string; href: string }[];
}
const menuItems: MenuItem[] = [
  { icon: Home, label: "Statistika", href: "/dashboard" },
  { icon: DockIcon, label: "Xujjat turini", href: "/dashboard/document-type" },
  { icon: Home, label: "Bo'limlar", href: "/dashboard/deportament" },
  { icon: Book, label: "Jurnallar", href: "/dashboard/journal" },
  { icon: DockIcon, label: "Hujjatlar", href: "/dashboard/document" },
  {
    icon: DockIcon,
    label: "Hujjat Andozalari ",
    href: "/dashboard/document-template",
  },
  {
    icon: Settings,
    label: "Boshqaruv",
    subItems: [
      { label: "Foydalanuvchilar", href: "/dashboard/admin/users" },
      { label: "Rollar", href: "/dashboard/admin/roles" },
      { label: "Ruxsatlar", href: "/dashboard/admin/permissions" },
    ],
  },
  {
    icon: Settings,
    label: "Sozlamalar",
    subItems: [
      { label: "Profil", href: "/dashboard/setting/profile" },
      { label: "Shablonlar", href: "/dashboard/document-template" },
      { label: "Tizim sozalamari", href: "/dashboard/setting/system-setting" },
    ],
  },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname: any = usePathname();
  const logOutMutation = useLogoutMutation();

  const [openMenus, setOpenMenus] = useState<string[]>([]);

  useEffect(() => {
    menuItems.forEach((item) => {
      if (item.subItems?.some((sub) => pathname.startsWith(sub.href))) {
        setOpenMenus((prev) =>
          prev.includes(item.label) ? prev : [...prev, item.label],
        );
      }
    });
  }, [pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label],
    );
  };

  const handleLogout = () => {
    logOutMutation.mutate();
    Cookie.remove("accessToken");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between p-6 border-sidebar-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
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
            className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.subItems ? (
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={cn(
                    "flex w-full items-center justify-between px-4 py-2 rounded-xl text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    openMenus.includes(item.label) &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      openMenus.includes(item.label) && "rotate-180",
                    )}
                  />
                </button>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => router.push(item.href!)}
                  className={cn(
                    "w-full justify-start text-left relative rounded-xl h-11 px-4",
                    pathname === item.href
                      ? "bg-primary text-white hover:bg-primary hover:text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-white before:rounded-r-full"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Button>
              )}

              {/* Subitems */}
              {item.subItems && openMenus.includes(item.label) && (
                <div className="ml-6 mt-1 space-y-1">
                  {item.subItems.map((sub) => (
                    <Button
                      key={sub.href}
                      variant="ghost"
                      onClick={() => router.push(sub.href)}
                      className={cn(
                        "w-full justify-start text-left h-9 px-4 text-sm rounded-lg",
                        pathname === sub.href
                          ? "bg-primary-dark text-white hover:bg-primary hover:text-white before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-white before:rounded-r-full"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {sub.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div
          onClick={handleLogout}
          className="p-4 border-t border-sidebar-border"
        >
          <Button
            variant="ghost"
            className="w-full justify-start text-left rounded-xl h-11 px-4 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Tizimdan Chiqish
          </Button>
        </div>
      </div>
    </>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, Search, Bell, Settings, User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { data, isLoading } = useGetProfileQuery();
  const router = useRouter();

  if (isLoading || !data) {
    return (
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div>Loading...</div>
        </div>
      </header>
    );
  }

  const fullName = data.fullname;
  const email = `username: ${data.username}`;
  const initials = "AD";

  const handleProfileClick = () => {
    router.push("/setting/profile");
  };

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden text-foreground hover:bg-accent"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <div className="relative w-96 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="tizimli qidiruv"
              className="pl-10 bg-input border-border rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="relative text-foreground hover:bg-accent rounded-xl"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-primary-foreground rounded-full"></span>
            </span>
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-xl">
                <Avatar className="h-9 w-9">
                  {data.avatarUrl && (
                    <AvatarImage src={data.avatarUrl} alt="User" />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-xl bg-background"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{fullName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="rounded-lg  group hover:bg-accent cursor-pointer"
                onClick={handleProfileClick}
              >
                <User className="mr-2 group-hover:text-white h-4 w-4" />
                <span className="group-hover:text-white">Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg  group hover:bg-accent cursor-pointer">
                <Settings className="mr-2 group-hover:text-white h-4 w-4" />
                <span className="group-hover:text-white">Tizimni Sozlash</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="rounded-lg  group hover:bg-accent cursor-pointer">
                <LogOut className="mr-2 group-hover:text-white h-4 w-4" />
                <span className="group-hover:text-white">Tizimdan Chiqish</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

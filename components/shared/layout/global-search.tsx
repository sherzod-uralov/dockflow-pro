import React, { useState, useEffect, useRef } from "react";
import { Search, FileText, User, ArrowRight, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Static pages data
const staticPages = [
  { id: 1, title: "Statistika", path: "/dashboard", icon: "📊" },
  {
    id: 2,
    title: "Xujjat turini",
    path: "/dashboard/document-type",
    icon: "📁",
  },
  { id: 3, title: "Bo'limlar", path: "/dashboard/deportament", icon: "🏢" },
  { id: 4, title: "Jurnallar", path: "/dashboard/journal", icon: "📖" },
  { id: 5, title: "Hujjatlar", path: "/dashboard/document", icon: "📄" },
  {
    id: 6,
    title: "Hujjat Andozalari",
    path: "/dashboard/document-template",
    icon: "📋",
  },
  {
    id: 7,
    title: "Foydalanuvchilar",
    path: "/dashboard/admin/users",
    icon: "👥",
  },
  { id: 8, title: "Rollar", path: "/dashboard/admin/roles", icon: "🎭" },
  {
    id: 9,
    title: "Ruxsatlar",
    path: "/dashboard/admin/permissions",
    icon: "🔐",
  },
  { id: 10, title: "Profil", path: "/dashboard/setting/profile", icon: "👤" },
  {
    id: 11,
    title: "Tizim sozlamalari",
    path: "/dashboard/setting/system-setting",
    icon: "⚙️",
  },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch users when searching
  const { data: usersData, isLoading } = useGetUserQuery({
    pageNumber: 1,
    pageSize: 5,
    search: debouncedQuery,
  });

  // Filter static pages
  const filteredPages = staticPages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const users = usersData?.data || [];
  const totalResults = filteredPages.length + users.length;

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K to open search
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }

      // Escape to close
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }

      // Navigate with arrow keys
      if (isOpen && totalResults > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveIndex((prev) => (prev + 1) % totalResults);
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveIndex((prev) => (prev - 1 + totalResults) % totalResults);
        }
        if (e.key === "Enter") {
          e.preventDefault();
          handleSelect(activeIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, totalResults, activeIndex]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  const handleSelect = (index: number) => {
    if (index < filteredPages.length) {
      // Navigate to static page
      const page = filteredPages[index];
      router.push(page.path);
    } else {
      // Navigate to user
      const userIndex = index - filteredPages.length;
      const user = users[userIndex];
      router.push(`/dashboard/admin/users?userId=${user.id}`);
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-96 max-w-sm" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          ref={inputRef}
          placeholder="Tizimli qidiruv... (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-20 bg-input border-border rounded-xl"
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {searchQuery && (
            <button
              onClick={handleClear}
              className="p-1 hover:bg-muted rounded-md transition-colors"
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-xl shadow-xl z-50 max-h-[500px] overflow-hidden flex flex-col">
          {searchQuery.length === 0 ? (
            // Empty state
            <div className="p-8 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground">
                Qidiruv uchun yozing...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sahifalar va foydalanuvchilarni qidiring
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto">
              {/* Loading State */}
              {isLoading && debouncedQuery !== searchQuery && (
                <div className="p-4 flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Qidirilmoqda...</span>
                </div>
              )}

              {/* Static Pages Section */}
              {filteredPages.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Sahifalar
                  </div>
                  {filteredPages.map((page, idx) => (
                    <button
                      key={page.id}
                      onClick={() => handleSelect(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        activeIndex === idx
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                        {page.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            activeIndex === idx
                              ? "text-primary-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {page.title}
                        </p>
                        <p
                          className={`text-xs truncate ${
                            activeIndex === idx
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {page.path}
                        </p>
                      </div>
                      <ArrowRight
                        className={`w-4 h-4 flex-shrink-0 ${
                          activeIndex === idx
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Users Section */}
              {users.length > 0 && (
                <div className="p-2 border-t border-border">
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Foydalanuvchilar
                  </div>
                  {users.map((user, idx) => {
                    const globalIdx = filteredPages.length + idx;
                    return (
                      <button
                        key={user.id}
                        onClick={() => handleSelect(globalIdx)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          activeIndex === globalIdx
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={user.avatarUrl}
                            alt={user.username}
                          />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs">
                            {user.username
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium truncate ${
                              activeIndex === globalIdx
                                ? "text-primary-foreground"
                                : "text-foreground"
                            }`}
                          >
                            {user.fullname}
                          </p>
                          <p
                            className={`text-xs truncate ${
                              activeIndex === globalIdx
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            @{user.username}
                          </p>
                        </div>
                        <User
                          className={`w-4 h-4 flex-shrink-0 ${
                            activeIndex === globalIdx
                              ? "text-primary-foreground"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* No Results */}
              {!isLoading &&
                filteredPages.length === 0 &&
                users.length === 0 && (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-foreground">
                      Hech narsa topilmadi
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      "{searchQuery}" bo'yicha natija yo'q
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* Footer */}
          {totalResults > 0 && (
            <div className="border-t border-border p-2 bg-muted/30">
              <div className="flex items-center justify-between px-3 py-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">
                      ↑
                    </kbd>
                    <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">
                      ↓
                    </kbd>
                    <span>tanlash</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-background border border-border rounded text-[10px]">
                      ↵
                    </kbd>
                    <span>ochish</span>
                  </span>
                </div>
                <span>{totalResults} natija</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

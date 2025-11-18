"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Tab {
  value: string;
  label: string;
  badge?: number;
  badgeColor?: string;
}

interface ListItem {
  id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  [key: string]: any;
}

interface ActionButton {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
}

interface SplitLayoutWithTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onTabChange?: (value: string) => void;
  headerTitle?: string;
  onCreateNew?: () => void;
  createButtonLabel?: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  data?: ListItem[];
  isLoading?: boolean;
  selectedItem?: ListItem | null;
  onItemClick: (item: ListItem) => void;
  pageNumber: number;
  pageSize: number;
  totalCount?: number;
  onPageChange: (page: number) => void;
  rightPanelContent?: ReactNode;
  selectedItemActions?: ActionButton[];
  additionalActions?: ReactNode;
  renderListItem?: (item: ListItem, isSelected: boolean) => ReactNode;
  renderEmptyState?: (tabValue: string) => ReactNode;
  leftPanelWidth?: string;
}

export const SplitLayoutWithTabs = ({
  tabs,
  defaultTab,
  onTabChange,
  onCreateNew,
  createButtonLabel = "+ Yangi",
  searchPlaceholder = "Qidirish...",
  searchValue,
  onSearchChange,
  data = [],
  isLoading = false,
  selectedItem,
  onItemClick,
  pageNumber,
  pageSize,
  totalCount = 0,
  onPageChange,
  rightPanelContent,
  selectedItemActions = [],
  additionalActions,
  renderListItem,
  renderEmptyState,
  leftPanelWidth = "500px",
}: SplitLayoutWithTabsProps) => {
  const defaultRenderListItem = (item: ListItem, isSelected: boolean) => (
    <div
      key={item.id}
      onClick={() => onItemClick(item)}
      className={cn(
        "border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-400",
        isSelected ? "border-blue-500 bg-blue-50" : "bg-card",
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">{item.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {item.description || "Ma'lumot yo'q"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {item.status && (
          <Badge variant="default" className="text-xs">
            {item.status}
          </Badge>
        )}
        {item.priority && (
          <Badge variant="outline" className="text-xs">
            {item.priority}
          </Badge>
        )}
      </div>
    </div>
  );

  const defaultRenderEmptyState = () => (
    <div className="flex items-center justify-center h-full text-center py-8 text-muted-foreground">
      Ma'lumotlar mavjud emas
    </div>
  );

  const effectiveDefaultTab = defaultTab || tabs[0]?.value || "";

  return (
    <Tabs
      defaultValue={effectiveDefaultTab}
      onValueChange={onTabChange}
      className="flex-1 flex flex-col h-[calc(100vh-120px)]"
    >
      <div className="bg-card border-b">
        <div className="flex items-center justify-between px-6">
          <TabsList className="bg-transparent border-0 h-auto p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-4 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-600 gap-2"
              >
                {tab.label}
                {tab.badge !== undefined && (
                  <Badge
                    className={cn(
                      "text-white rounded-full h-5 w-5 flex items-center justify-center p-0 text-xs",
                      tab.badgeColor || "bg-purple-500",
                    )}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {onCreateNew && (
            <Button onClick={onCreateNew} className="my-2">
              {createButtonLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className="border-r flex flex-col bg-card"
          style={{ width: leftPanelWidth }}
        >
          <div className="px-4 py-3 bg-card border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {tabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="m-0 flex-1 overflow-y-auto"
            >
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Yuklanmoqda...</div>
                </div>
              ) : data.length > 0 ? (
                <div className="p-4 space-y-3">
                  {data.map((item) =>
                    renderListItem
                      ? renderListItem(item, selectedItem?.id === item.id)
                      : defaultRenderListItem(
                          item,
                          selectedItem?.id === item.id,
                        ),
                  )}
                </div>
              ) : renderEmptyState ? (
                renderEmptyState(tab.value)
              ) : (
                defaultRenderEmptyState()
              )}
            </TabsContent>
          ))}

          <div className="border-t p-3 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div>Sahifadagi elementlar: {pageSize}</div>
              <div>
                {totalCount} / {totalCount}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(pageNumber - 1)}
                  disabled={pageNumber === 1}
                >
                  &lt;
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(pageNumber + 1)}
                  disabled={pageNumber * pageSize >= totalCount}
                >
                  &gt;
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {selectedItem ? (
            <>
              <div className="px-6 py-3 bg-card border-b flex items-center gap-2">
                {selectedItemActions.map((action, index) => (
                  <Button
                    key={index}
                    variant={action.variant || "outline"}
                    size="sm"
                    className="gap-2 hover:text-text-on-dark"
                    onClick={action.onClick}
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}

                {additionalActions && (
                  <div className="ml-auto flex gap-2">{additionalActions}</div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-card rounded-lg shadow-sm p-6 mx-auto">
                  {rightPanelContent}
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <FileEdit className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg font-medium">Element tanlanmagan</p>
                <p className="text-sm mt-2">
                  Tafsilotlarini ko&apos;rish uchun chap tomondagi
                  ro&apos;yxatdan element tanlang
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Tabs>
  );
};

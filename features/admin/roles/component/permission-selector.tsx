"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import {
  getAllPermissions,
  Permission,
} from "../../permissions/type/permission.type";

interface PermissionSelectorProps {
  permissions: getAllPermissions | undefined;
  selectedPermissions: string[];
  onPermissionChange: (permissionIds: string[]) => void;
}

const PermissionSelector = ({
  permissions,
  selectedPermissions,
  onPermissionChange,
}: PermissionSelectorProps) => {
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const permissionData = permissions?.data || [];

  const filteredPermissions = permissionData
    .map((moduleData) => ({
      ...moduleData,
      permissions: moduleData.permissions.filter(
        (permission: Permission) =>
          permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          permission.key.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    }))
    .filter((moduleData) => moduleData.permissions.length > 0);

  const toggleModule = (moduleName: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleName)
        ? prev.filter((name) => name !== moduleName)
        : [...prev, moduleName],
    );
  };

  const handlePermissionToggle = (permissionId: string) => {
    const newSelections = selectedPermissions.includes(permissionId)
      ? selectedPermissions.filter((id) => id !== permissionId)
      : [...selectedPermissions, permissionId];

    onPermissionChange(newSelections);
  };

  const handleModuleToggle = (moduleData: any) => {
    const modulePermissionIds = moduleData.permissions
      .filter((p: Permission) => p.id)
      .map((p: Permission) => p.id!);
    const selectedInModule = modulePermissionIds.filter((id: string) =>
      selectedPermissions.includes(id),
    ).length;

    let newSelections: string[];
    if (selectedInModule === modulePermissionIds.length) {
      newSelections = selectedPermissions.filter(
        (id) => !modulePermissionIds.includes(id),
      );
    } else {
      const otherPermissions = selectedPermissions.filter(
        (id) => !modulePermissionIds.includes(id),
      );
      newSelections = [...otherPermissions, ...modulePermissionIds];
    }

    onPermissionChange(newSelections);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-9"
          size={1}
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          Tanlangan:
          <Badge variant="secondary" className="text-text-on-dark ml-1">
            {selectedPermissions.length}
          </Badge>
        </span>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPermissionChange([])}
            className="h-7 hover:text-text-on-dark px-2 text-xs"
          >
            Tozalash
          </Button>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredPermissions.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            Hech qanday ruxsat topilmadi
          </div>
        ) : (
          filteredPermissions.map((moduleData) => {
            const isExpanded = expandedModules.includes(moduleData.module);
            const modulePermissionIds = moduleData.permissions
              .filter((p: Permission) => p.id)
              .map((p: Permission) => p.id!);
            const selectedInModule = modulePermissionIds.filter((id: string) =>
              selectedPermissions.includes(id),
            ).length;

            return (
              <div key={moduleData.module} className="border rounded-lg">
                <div className="flex items-center justify-between p-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleModule(moduleData.module)}
                      className="p-0.5 hover:bg-muted rounded"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>
                    <Checkbox
                      checked={selectedInModule === modulePermissionIds.length}
                      onCheckedChange={() => handleModuleToggle(moduleData)}
                      className="h-3.5 w-3.5 border-primary"
                    />
                    <span className="font-medium text-sm capitalize">
                      {moduleData.module}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {selectedInModule}/{modulePermissionIds.length}
                  </Badge>
                </div>
                {isExpanded && (
                  <div className="p-3 pt-0 space-y-2">
                    {moduleData.permissions
                      .filter((permission: Permission) => permission.id)
                      .map((permission: Permission) => (
                        <div
                          key={permission.id}
                          className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded"
                        >
                          <Checkbox
                            checked={selectedPermissions.includes(
                              permission.id!,
                            )}
                            onCheckedChange={() =>
                              handlePermissionToggle(permission.id!)
                            }
                            className="h-3.5 w-3.5 border-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {permission.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {permission.key}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PermissionSelector;

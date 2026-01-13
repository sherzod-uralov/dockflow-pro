"use client";

import {
  NavLink,
  Box,
  Group,
  Text,
  ScrollArea,
  Collapse,
  Badge,
  ActionIcon,
  Loader,
  Tooltip,
} from "@mantine/core";
import {
  IconLogout,
  IconChevronRight,
  IconHome,
  IconBook,
  IconBuilding,
  IconFileText,
  IconFolderOpen,
  IconTemplate,
  IconArrowsExchange,
  IconClipboardList,
  IconSettings,
  IconUser,
  IconPlus,
  IconLayoutKanban,
} from "@tabler/icons-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Cookie from "js-cookie";
import { useLogoutMutation } from "@/features/login/hook/login.hook";
import { usePermission } from "@/providers/permission-provider";
import { useNotificationContext } from "@/context/notification.provider";
import Image from "next/image";
import { useGetAllProjects } from "@/features/project/hook/project.hook";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import ProjectForm from "@/features/project/component/project.form";
import { ProjectGetResponse } from "@/features/project/type/project.type";

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
  icon: React.ComponentType<any>;
  label: string;
  href?: string;
  permission?: string;
  subItems?: SubItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: IconHome,
    label: "Bosh sahifa",
    href: "/dashboard",
  },
  {
    icon: IconFileText,
    label: "Hujjatlar",
    href: "/dashboard/document",
    permission: "document:list",
  },
  {
    icon: IconFolderOpen,
    label: "Hujjat turlari",
    href: "/dashboard/document-type",
    permission: "document-type:list",
  },
  {
    icon: IconTemplate,
    label: "Andozalar",
    href: "/dashboard/document-template",
    permission: "document-template:list",
  },
  {
    icon: IconBook,
    label: "Jurnallar",
    href: "/dashboard/journal",
    permission: "journal:list",
  },
  {
    icon: IconArrowsExchange,
    label: "Hujjat aylanmasi",
    permission: "workflow:list",
    subItems: [
      {
        label: "Jarayonlar",
        href: "/dashboard/workflow",
        permission: "workflow:list",
      },
      {
        label: "Shablonlar",
        href: "/dashboard/workflow-template",
        permission: "workflow:list",
      },
      {
        label: "Taqvim",
        href: "/dashboard/workflow-calendar",
      },
    ],
  },
  {
    icon: IconBuilding,
    label: "Bo'limlar",
    href: "/dashboard/department",
    permission: "department:list",
  },
  {
    icon: IconClipboardList,
    label: "Audit jurnali",
    href: "/dashboard/audit-log",
    permission: "admin:view_audit_logs",
  },
  {
    icon: IconSettings,
    label: "Boshqaruv",
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
    icon: IconUser,
    label: "Sozlamalar",
    subItems: [
      {
        label: "Profil",
        href: "/dashboard/setting/profile",
      },
    ],
  },
];

interface SidebarBodyProps {
  filteredMenuItems: MenuItem[];
  openMenu: string | null;
  toggleMenu: (label: string) => void;
  isActive: (href?: string) => boolean;
  handleItemClick: (href?: string) => void;
  handleLogout: () => void;
  activeWorkflowsCount: number;
  projects: ProjectGetResponse[];
  isProjectsLoading: boolean;
  onCreateProject: () => void;
}

const SidebarBody = ({
  filteredMenuItems,
  openMenu,
  toggleMenu,
  isActive,
  handleItemClick,
  handleLogout,
  activeWorkflowsCount,
  projects,
  isProjectsLoading,
  onCreateProject,
}: SidebarBodyProps) => {
  return (
    <Box
      h="100%"
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#1e3a5f",
      }}
    >
      {/* Header */}
      <Box
        px="md"
        py="sm"
        style={{
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
            <Image
              alt="university logo"
              width={120}
              height={120}
              src="/university_logo.svg"
              className="relative z-10 drop-shadow-2xl"
              priority
            />
          </div>
        </div>
      </Box>

      {/* Navigation */}
      <ScrollArea flex={1} px="xs" py="sm" scrollbarSize={4}>
        {/* Regular menu items */}
        {filteredMenuItems.map((item) => (
          <Box key={item.label} mb={2}>
            {item.subItems ? (
              <>
                <NavLink
                  label={
                    <Group justify="space-between" wrap="nowrap">
                      <Text size="sm" c="rgba(255,255,255,0.9)">
                        {item.label}
                      </Text>
                      {item.label === "Hujjat aylanmasi" && activeWorkflowsCount > 0 && (
                        <Badge
                          size="xs"
                          circle
                          color="red"
                          style={{ width: 18, height: 18, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          {activeWorkflowsCount > 99 ? '99+' : activeWorkflowsCount}
                        </Badge>
                      )}
                    </Group>
                  }
                  leftSection={
                    <item.icon
                      size={18}
                      stroke={1.5}
                      color="rgba(255,255,255,0.7)"
                    />
                  }
                  rightSection={
                    <IconChevronRight
                      size={14}
                      color="rgba(255,255,255,0.5)"
                      style={{
                        transform:
                          openMenu === item.label
                            ? "rotate(90deg)"
                            : "rotate(0deg)",
                        transition: "transform 150ms ease",
                      }}
                    />
                  }
                  onClick={() => toggleMenu(item.label)}
                  active={openMenu === item.label}
                  variant="subtle"
                  styles={{
                    root: {
                      borderRadius: 4,
                      backgroundColor:
                        openMenu === item.label
                          ? "rgba(255,255,255,0.1)"
                          : "transparent",
                      "&:hover": {
                        backgroundColor: "rgba(255,255,255,0.08)",
                      },
                    },
                  }}
                />
                <Collapse in={openMenu === item.label}>
                  <Box
                    ml="md"
                    mt={4}
                    pl="xs"
                    style={{
                      borderLeft: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    {item.subItems.map((sub) => (
                      <NavLink
                        key={sub.href}
                        label={
                          <Group justify="space-between" wrap="nowrap">
                            <Text
                              size="sm"
                              c={
                                isActive(sub.href)
                                  ? "white"
                                  : "rgba(255,255,255,0.75)"
                              }
                            >
                              {sub.label}
                            </Text>
                            {sub.label === "Jarayonlar" && activeWorkflowsCount > 0 && (
                              <Badge
                                size="xs"
                                circle
                                color="red"
                                style={{ width: 18, height: 18, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                {activeWorkflowsCount > 99 ? '99+' : activeWorkflowsCount}
                              </Badge>
                            )}
                          </Group>
                        }
                        onClick={() => handleItemClick(sub.href)}
                        active={isActive(sub.href)}
                        variant="subtle"
                        styles={{
                          root: {
                            borderRadius: 4,
                            backgroundColor: isActive(sub.href)
                              ? "rgba(255,255,255,0.15)"
                              : "transparent",
                            "&:hover": {
                              backgroundColor: "rgba(255,255,255,0.08)",
                            },
                          },
                        }}
                      />
                    ))}
                  </Box>
                </Collapse>
              </>
            ) : (
              <NavLink
                label={
                  <Text
                    size="sm"
                    c={isActive(item.href) ? "white" : "rgba(255,255,255,0.9)"}
                    fw={isActive(item.href) ? 500 : 400}
                  >
                    {item.label}
                  </Text>
                }
                leftSection={
                  <item.icon
                    size={18}
                    stroke={1.5}
                    color={
                      isActive(item.href) ? "white" : "rgba(255,255,255,0.7)"
                    }
                  />
                }
                onClick={() => handleItemClick(item.href)}
                active={isActive(item.href)}
                variant="subtle"
                styles={{
                  root: {
                    borderRadius: 4,
                    backgroundColor: isActive(item.href)
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.08)",
                    },
                  },
                }}
              />
            )}
          </Box>
        ))}

        {/* Vazifalar boshqaruvi - Dynamic Projects Menu */}
        <Box mb={2}>
          <NavLink
            label={
              <Group justify="space-between" wrap="nowrap" style={{ width: "100%" }}>
                <Text size="sm" c="rgba(255,255,255,0.9)">
                  Vazifalar
                </Text>
                <Tooltip label="Yangi loyiha" position="right" withArrow>
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCreateProject();
                    }}
                    style={{
                      color: "rgba(255,255,255,0.7)",
                    }}
                  >
                    <IconPlus size={14} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            }
            leftSection={
              <IconLayoutKanban
                size={18}
                stroke={1.5}
                color="rgba(255,255,255,0.7)"
              />
            }
            rightSection={
              <IconChevronRight
                size={14}
                color="rgba(255,255,255,0.5)"
                style={{
                  transform:
                    openMenu === "Vazifalar boshqaruvi"
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              />
            }
            onClick={() => toggleMenu("Vazifalar boshqaruvi")}
            active={openMenu === "Vazifalar boshqaruvi"}
            variant="subtle"
            styles={{
              root: {
                borderRadius: 4,
                backgroundColor:
                  openMenu === "Vazifalar boshqaruvi"
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.08)",
                },
              },
            }}
          />
          <Collapse in={openMenu === "Vazifalar boshqaruvi"}>
            <Box
              ml="md"
              mt={4}
              pl="xs"
              style={{
                borderLeft: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {/* Barcha vazifalar link */}
              <NavLink
                label={
                  <Text
                    size="sm"
                    c={isActive("/dashboard/task") ? "white" : "rgba(255,255,255,0.75)"}
                  >
                    Barcha vazifalar
                  </Text>
                }
                onClick={() => handleItemClick("/dashboard/task")}
                active={isActive("/dashboard/task")}
                variant="subtle"
                styles={{
                  root: {
                    borderRadius: 4,
                    backgroundColor: isActive("/dashboard/task")
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.08)",
                    },
                  },
                }}
              />

              {/* Barcha loyihalar link */}
              <NavLink
                label={
                  <Text
                    size="sm"
                    c={isActive("/dashboard/project") && !isActive("/dashboard/project/") ? "white" : "rgba(255,255,255,0.75)"}
                  >
                    Barcha loyihalar
                  </Text>
                }
                onClick={() => handleItemClick("/dashboard/project")}
                active={isActive("/dashboard/project") && window.location.pathname === "/dashboard/project"}
                variant="subtle"
                styles={{
                  root: {
                    borderRadius: 4,
                    backgroundColor: isActive("/dashboard/project") && window.location.pathname === "/dashboard/project"
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.08)",
                    },
                  },
                }}
              />

              {/* Divider */}
              <Box
                my="xs"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              />

              {/* Dynamic Projects */}
              {isProjectsLoading ? (
                <Box py="xs" style={{ display: "flex", justifyContent: "center" }}>
                  <Loader size="xs" color="rgba(255,255,255,0.5)" />
                </Box>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <NavLink
                    key={project.id}
                    label={
                      <Group gap="xs" wrap="nowrap">
                        <Box
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: project.color || "#3498db",
                            flexShrink: 0,
                          }}
                        />
                        <Text
                          size="sm"
                          c={
                            isActive(`/dashboard/project/${project.id}/tasks`)
                              ? "white"
                              : "rgba(255,255,255,0.75)"
                          }
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {project.key} - {project.name}
                        </Text>
                      </Group>
                    }
                    onClick={() => handleItemClick(`/dashboard/project/${project.id}/tasks`)}
                    active={isActive(`/dashboard/project/${project.id}/tasks`)}
                    variant="subtle"
                    styles={{
                      root: {
                        borderRadius: 4,
                        backgroundColor: isActive(`/dashboard/project/${project.id}/tasks`)
                          ? "rgba(255,255,255,0.15)"
                          : "transparent",
                        "&:hover": {
                          backgroundColor: "rgba(255,255,255,0.08)",
                        },
                      },
                    }}
                  />
                ))
              ) : (
                <Text size="xs" c="rgba(255,255,255,0.5)" ta="center" py="xs">
                  Loyihalar mavjud emas
                </Text>
              )}
            </Box>
          </Collapse>
        </Box>
      </ScrollArea>

      {/* Footer */}
      <Box
        px="xs"
        py="sm"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <NavLink
          label={
            <Text size="sm" c="rgba(255,255,255,0.9)">
              Chiqish
            </Text>
          }
          leftSection={
            <IconLogout size={18} stroke={1.5} color="rgba(255,255,255,0.7)" />
          }
          onClick={handleLogout}
          variant="subtle"
          styles={{
            root: {
              borderRadius: 4,
              transition: "background-color 0.2s ease",
            },
            label: {
              color: "rgba(255,255,255,0.9)",
            },
          }}
        />
      </Box>
    </Box>
  );
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const logOutMutation = useLogoutMutation();
  const { hasPermission } = usePermission();
  const { activeWorkflowsCount } = useNotificationContext();
  const createProjectModal = useModal();

  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Fetch projects for sidebar
  const { data: projectsData, isLoading: isProjectsLoading } = useGetAllProjects({
    pageNumber: 1,
    pageSize: 100,
  });

  const projects = projectsData?.data || [];

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
    // Auto-open menu based on current path
    filteredMenuItems.forEach((item) => {
      if (item.subItems?.some((sub) => pathname?.startsWith(sub.href))) {
        setOpenMenu(item.label);
      }
    });

    // Auto-open Vazifalar boshqaruvi if on project or task pages
    if (pathname?.startsWith("/dashboard/project") || pathname?.startsWith("/dashboard/task")) {
      setOpenMenu("Vazifalar boshqaruvi");
    }
  }, [pathname, filteredMenuItems]);

  const toggleMenu = (label: string) => {
    setOpenMenu((prev) => (prev === label ? null : label));
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

  const isActive = (href?: string) => {
    if (!href || !pathname) return false;
    if (href === "/dashboard") return pathname === href;
    if (pathname === href) return true;
    return pathname.startsWith(href + "/") || pathname === href;
  };

  const handleCreateProject = () => {
    createProjectModal.openModal();
  };

  const sidebarProps = {
    filteredMenuItems,
    openMenu,
    toggleMenu,
    isActive,
    handleItemClick,
    handleLogout,
    activeWorkflowsCount,
    projects,
    isProjectsLoading,
    onCreateProject: handleCreateProject,
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <Box
          pos="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0,0,0,0.5)"
          style={{ zIndex: 100 }}
          onClick={onClose}
          hiddenFrom="lg"
        />
      )}

      {/* Mobile Sidebar */}
      <Box
        pos="fixed"
        top={0}
        left={0}
        h="100vh"
        w={260}
        style={{
          zIndex: 101,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 200ms ease",
        }}
        hiddenFrom="lg"
      >
        <SidebarBody {...sidebarProps} />
      </Box>

      {/* Desktop Sidebar */}
      <Box
        w={260}
        h="100vh"
        style={{ flexShrink: 0 }}
        visibleFrom="lg"
        data-tour="sidebar"
      >
        <SidebarBody {...sidebarProps} />
      </Box>

      {/* Create Project Modal */}
      <CustomModal
        size="xl"
        closeOnOverlayClick={false}
        title="Yangi loyiha"
        description="Yangi loyiha yaratish uchun maydonlarni to'ldiring"
        isOpen={createProjectModal.isOpen}
        onClose={createProjectModal.closeModal}
      >
        <ProjectForm modal={createProjectModal} mode="create" />
      </CustomModal>
    </>
  );
}

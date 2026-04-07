"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TextInput,
  Paper,
  Box,
  Text,
  Group,
  ActionIcon,
  Loader,
  Avatar,
  Kbd,
  ScrollArea,
  Divider,
  UnstyledButton,
} from "@mantine/core";
import {
  IconSearch,
  IconArrowRight,
  IconX,
  IconUsers,
  IconKey,
  IconFileText,
  IconFile,
  IconBook,
  IconBuilding,
  IconCategory,
  IconUser,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useGetRoles } from "@/features/admin/roles/hook/role.hook";
import { useGetAllPermissions } from "@/features/admin/permissions/hook/permission.hook";
import { usePermission } from "@/providers/permission-provider";
import { useGetAllDocumentTemplates } from "@/features/document-template/hook/document-template.hook";
import { useGetAllDocuments } from "@/features/document/hook/document.hook";
import { useGetAllJournals } from "@/features/journal/hook/journal.hook";
import { useGetAllDepartments } from "@/features/department/hook/department.hook";
import { useGetAllDocumentTypes } from "@/features/document-type/hook/document-type.hook";

const staticPages = [
  { id: 1, title: "Bosh sahifa", path: "/dashboard" },
  { id: 2, title: "Hujjat turlari", path: "/dashboard/document-type" },
  { id: 3, title: "Bo'limlar", path: "/dashboard/department" },
  { id: 4, title: "Jurnallar", path: "/dashboard/journal" },
  { id: 5, title: "Hujjatlar", path: "/dashboard/document" },
  { id: 6, title: "Andozalar", path: "/dashboard/document-template" },
  { id: 7, title: "Foydalanuvchilar", path: "/dashboard/admin/users" },
  { id: 8, title: "Rollar", path: "/dashboard/admin/roles" },
  { id: 9, title: "Ruxsatlar", path: "/dashboard/admin/permissions" },
  { id: 10, title: "Profil", path: "/dashboard/setting/profile" },
];

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: usersData, isLoading: usersLoading } = useGetUserQuery({
    pageNumber: 1,
    pageSize: 5,
    search: debouncedQuery,
  });

  const { data: rolesData, isLoading: rolesLoading } = useGetRoles({
    pageSize: 5,
    pageNumber: 1,
    search: debouncedQuery,
  });

  const { hasPermission } = usePermission();
  const canSearchPermissions = hasPermission("permission:list");

  const { data: permissionsData, isLoading: permissionsLoading } = useGetAllPermissions(
    {
      pageSize: 5,
      pageNumber: 1,
      search: debouncedQuery,
    },
    { enabled: canSearchPermissions },
  );

  const { data: documentTemplatesData, isLoading: documentTemplatesLoading } = useGetAllDocumentTemplates({
    pageSize: 5,
    pageNumber: 1,
    search: debouncedQuery,
  });

  const { data: documentsData, isLoading: documentsLoading } = useGetAllDocuments({
    pageSize: 5,
    pageNumber: 1,
    search: debouncedQuery,
  });

  const { data: journalsData, isLoading: journalsLoading } = useGetAllJournals({
    pageSize: 5,
    pageNumber: 1,
    search: debouncedQuery,
  });

  const { data: departmentsData, isLoading: departmentsLoading } = useGetAllDepartments({
    pageSize: 5,
    pageNumber: 1,
    search: debouncedQuery,
  });

  const { data: documentTypesData, isLoading: documentTypesLoading } = useGetAllDocumentTypes({
    pageSize: 5,
    pageNumber: 1,
    search: debouncedQuery,
  });

  const filteredPages = staticPages.filter((page) =>
    page.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const users = usersData?.data || [];
  const roles = rolesData?.data || [];
  const permissions = permissionsData?.data
    ? permissionsData.data.flatMap((item: any) =>
        item.permissions.map((perm: any) => ({ ...perm, module: item.module }))
      )
    : [];
  const documentTemplates = documentTemplatesData?.data || [];
  const documents = documentsData?.data || [];
  const journals = journalsData?.data || [];
  const departments = departmentsData?.data || [];
  const documentTypes = documentTypesData?.data || [];

  const totalResults =
    filteredPages.length + roles.length + permissions.length + users.length +
    documentTemplates.length + documents.length + journals.length +
    departments.length + documentTypes.length;

  const anyLoading =
    usersLoading || rolesLoading || permissionsLoading || documentTemplatesLoading ||
    documentsLoading || journalsLoading || departmentsLoading || documentTypesLoading;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchQuery("");
      }
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [searchQuery]);

  const handleSelect = (index: number) => {
    if (index < filteredPages.length) {
      router.push(filteredPages[index].path);
    } else {
      const pagesOffset = filteredPages.length;
      const rolesOffset = pagesOffset + roles.length;
      const permissionsOffset = rolesOffset + permissions.length;
      const documentTemplatesOffset = permissionsOffset + documentTemplates.length;
      const documentsOffset = documentTemplatesOffset + documents.length;
      const journalsOffset = documentsOffset + journals.length;
      const departmentsOffset = journalsOffset + departments.length;
      const documentTypesOffset = departmentsOffset + documentTypes.length;

      if (index < rolesOffset) {
        router.push(`/dashboard/admin/roles?roleId=${roles[index - pagesOffset].id}`);
      } else if (index < permissionsOffset) {
        router.push(`/dashboard/admin/permissions?permissionId=${permissions[index - rolesOffset].id}`);
      } else if (index < documentTemplatesOffset) {
        router.push(`/dashboard/document-template?templateId=${documentTemplates[index - permissionsOffset].id}`);
      } else if (index < documentsOffset) {
        router.push(`/dashboard/document?documentId=${documents[index - documentTemplatesOffset].id}`);
      } else if (index < journalsOffset) {
        router.push(`/dashboard/journal?journalId=${journals[index - documentsOffset].id}`);
      } else if (index < departmentsOffset) {
        router.push(`/dashboard/department?departmentId=${departments[index - journalsOffset].id}`);
      } else if (index < documentTypesOffset) {
        router.push(`/dashboard/document-type?documentTypeId=${documentTypes[index - departmentsOffset].id}`);
      } else {
        router.push(`/dashboard/admin/users?userId=${users[index - documentTypesOffset].id}`);
      }
    }
    setIsOpen(false);
    setSearchQuery("");
  };

  const SearchItem = ({
    icon,
    title,
    subtitle,
    index,
    avatar,
  }: {
    icon?: React.ReactNode;
    title: string;
    subtitle?: string;
    index: number;
    avatar?: React.ReactNode;
  }) => (
    <UnstyledButton
      onClick={() => handleSelect(index)}
      w="100%"
      px="sm"
      py={8}
      style={{
        borderRadius: 4,
        backgroundColor: activeIndex === index ? "#1e3a5f" : "transparent",
        color: activeIndex === index ? "white" : "inherit",
      }}
    >
      <Group gap="sm" wrap="nowrap">
        {avatar || (
          <Box
            w={28}
            h={28}
            style={{
              borderRadius: 4,
              backgroundColor: activeIndex === index ? "rgba(255,255,255,0.2)" : "#f1f3f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        )}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text size="sm" truncate>
            {title}
          </Text>
          {subtitle && (
            <Text size="xs" c={activeIndex === index ? "white" : "dimmed"} truncate opacity={0.7}>
              {subtitle}
            </Text>
          )}
        </Box>
        <IconArrowRight size={14} opacity={0.4} />
      </Group>
    </UnstyledButton>
  );

  return (
    <Box pos="relative" w={320} maw="100%" ref={searchRef}>
      <TextInput
        ref={inputRef}
        placeholder="Qidirish..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        leftSection={<IconSearch size={16} stroke={1.5} />}
        rightSection={
          <Group gap={4}>
            {searchQuery && (
              <ActionIcon
                size="xs"
                variant="subtle"
                color="gray"
                onClick={() => {
                  setSearchQuery("");
                  inputRef.current?.focus();
                }}
              >
                <IconX size={12} />
              </ActionIcon>
            )}
            <Kbd size="xs" style={{ fontSize: 10 }}>
              Ctrl+K
            </Kbd>
          </Group>
        }
        rightSectionWidth={searchQuery ? 80 : 60}
        radius="sm"
        size="sm"
        styles={{
          input: {
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
            "&:focus": {
              borderColor: "#1e3a5f",
            },
          },
        }}
      />

      {isOpen && (
        <Paper
          shadow="md"
          radius="sm"
          pos="absolute"
          top="100%"
          left={0}
          right={0}
          mt={4}
          style={{
            zIndex: 100,
            maxHeight: 400,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            border: "1px solid #e9ecef",
          }}
        >
          {searchQuery.length === 0 ? (
            <Box p="lg" ta="center">
              <IconSearch size={32} color="#adb5bd" style={{ margin: "0 auto" }} />
              <Text size="sm" c="dimmed" mt="xs">
                Qidirish uchun yozing
              </Text>
            </Box>
          ) : (
            <ScrollArea style={{ flex: 1 }}>
              {anyLoading && debouncedQuery === searchQuery && (
                <Group justify="center" p="sm" gap="xs">
                  <Loader size="xs" color="#1e3a5f" />
                  <Text size="xs" c="dimmed">
                    Qidirilmoqda...
                  </Text>
                </Group>
              )}

              {filteredPages.length > 0 && (
                <Box p="xs">
                  <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="sm" mb={4}>
                    Sahifalar
                  </Text>
                  {filteredPages.map((page, idx) => (
                    <SearchItem
                      key={page.id}
                      icon={<IconFileText size={14} color="#868e96" />}
                      title={page.title}
                      subtitle={page.path}
                      index={idx}
                    />
                  ))}
                </Box>
              )}

              {roles.length > 0 && (
                <Box p="xs">
                  <Divider mb="xs" />
                  <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="sm" mb={4}>
                    Rollar
                  </Text>
                  {roles.map((role, idx) => (
                    <SearchItem
                      key={role.id}
                      icon={<IconUsers size={14} color="#868e96" />}
                      title={role.name}
                      subtitle={role.description || "-"}
                      index={filteredPages.length + idx}
                    />
                  ))}
                </Box>
              )}

              {permissions.length > 0 && (
                <Box p="xs">
                  <Divider mb="xs" />
                  <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="sm" mb={4}>
                    Ruxsatlar
                  </Text>
                  {permissions.map((perm, idx) => (
                    <SearchItem
                      key={perm.id}
                      icon={<IconKey size={14} color="#868e96" />}
                      title={perm.name}
                      subtitle={perm.module}
                      index={filteredPages.length + roles.length + idx}
                    />
                  ))}
                </Box>
              )}

              {documentTemplates.length > 0 && (
                <Box p="xs">
                  <Divider mb="xs" />
                  <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="sm" mb={4}>
                    Andozalar
                  </Text>
                  {documentTemplates.map((t, idx) => (
                    <SearchItem
                      key={t.id}
                      icon={<IconFileText size={14} color="#868e96" />}
                      title={t.name}
                      subtitle={t.description || "-"}
                      index={filteredPages.length + roles.length + permissions.length + idx}
                    />
                  ))}
                </Box>
              )}

              {documents.length > 0 && (
                <Box p="xs">
                  <Divider mb="xs" />
                  <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="sm" mb={4}>
                    Hujjatlar
                  </Text>
                  {documents.map((doc, idx) => (
                    <SearchItem
                      key={doc.id}
                      icon={<IconFile size={14} color="#868e96" />}
                      title={doc.title}
                      subtitle={doc.documentNumber || "-"}
                      index={filteredPages.length + roles.length + permissions.length + documentTemplates.length + idx}
                    />
                  ))}
                </Box>
              )}

              {journals.length > 0 && (
                <Box p="xs">
                  <Divider mb="xs" />
                  <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="sm" mb={4}>
                    Jurnallar
                  </Text>
                  {journals.map((j, idx) => (
                    <SearchItem
                      key={j.id}
                      icon={<IconBook size={14} color="#868e96" />}
                      title={j.name}
                      subtitle={j.prefix}
                      index={filteredPages.length + roles.length + permissions.length + documentTemplates.length + documents.length + idx}
                    />
                  ))}
                </Box>
              )}

              {departments.length > 0 && (
                <Box p="xs">
                  <Divider mb="xs" />
                  <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="sm" mb={4}>
                    Bo'limlar
                  </Text>
                  {departments.map((d, idx) => (
                    <SearchItem
                      key={d.id}
                      icon={<IconBuilding size={14} color="#868e96" />}
                      title={d.name}
                      subtitle={d.description || "-"}
                      index={filteredPages.length + roles.length + permissions.length + documentTemplates.length + documents.length + journals.length + idx}
                    />
                  ))}
                </Box>
              )}

              {documentTypes.length > 0 && (
                <Box p="xs">
                  <Divider mb="xs" />
                  <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="sm" mb={4}>
                    Hujjat turlari
                  </Text>
                  {documentTypes.map((dt, idx) => (
                    <SearchItem
                      key={dt.id}
                      icon={<IconCategory size={14} color="#868e96" />}
                      title={dt.name}
                      subtitle={dt.description || "-"}
                      index={filteredPages.length + roles.length + permissions.length + documentTemplates.length + documents.length + journals.length + departments.length + idx}
                    />
                  ))}
                </Box>
              )}

              {users.length > 0 && (
                <Box p="xs">
                  <Divider mb="xs" />
                  <Text size="xs" fw={500} c="dimmed" tt="uppercase" px="sm" mb={4}>
                    Foydalanuvchilar
                  </Text>
                  {users.map((user, idx) => {
                    const globalIdx = filteredPages.length + roles.length + permissions.length + documentTemplates.length + documents.length + journals.length + departments.length + documentTypes.length + idx;
                    return (
                      <SearchItem
                        key={user.id}
                        avatar={
                          <Avatar size={28} radius="sm" src={user.avatarUrl} color="blue" style={{ backgroundColor: "#1e3a5f" }}>
                            <Text size="xs" c="white">
                              {user.username.slice(0, 2).toUpperCase()}
                            </Text>
                          </Avatar>
                        }
                        title={user.fullname}
                        subtitle={`@${user.username}`}
                        index={globalIdx}
                      />
                    );
                  })}
                </Box>
              )}

              {!anyLoading && debouncedQuery === searchQuery && totalResults === 0 && (
                <Box p="lg" ta="center">
                  <IconSearch size={32} color="#adb5bd" style={{ margin: "0 auto" }} />
                  <Text size="sm" fw={500} mt="xs">
                    Topilmadi
                  </Text>
                  <Text size="xs" c="dimmed">
                    "{searchQuery}" bo'yicha natija yo'q
                  </Text>
                </Box>
              )}
            </ScrollArea>
          )}

          {totalResults > 0 && (
            <Box
              px="sm"
              py="xs"
              style={{
                borderTop: "1px solid #e9ecef",
                backgroundColor: "#f8f9fa",
              }}
            >
              <Group justify="space-between">
                <Group gap="xs">
                  <Kbd size="xs">↑↓</Kbd>
                  <Text size="xs" c="dimmed">
                    tanlash
                  </Text>
                  <Kbd size="xs">↵</Kbd>
                  <Text size="xs" c="dimmed">
                    ochish
                  </Text>
                </Group>
                <Text size="xs" c="dimmed">
                  {totalResults} natija
                </Text>
              </Group>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
}

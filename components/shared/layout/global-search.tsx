"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Modal,
  TextInput,
  Box,
  Text,
  Group,
  Loader,
  Avatar,
  Kbd,
  ScrollArea,
  Badge,
  UnstyledButton,
  Stack,
  Center,
} from "@mantine/core";
import {
  IconSearch,
  IconArrowRight,
  IconFileText,
  IconFile,
  IconBook,
  IconBuilding,
  IconUser,
  IconLayoutKanban,
  IconArrowsExchange,
  IconCheckbox,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";

type SearchType = "all" | "document" | "task" | "project" | "workflow" | "user" | "journal";

interface SearchResultMeta {
  documentNumber?: string;
  status?: string;
  createdBy?: string;
  documentType?: string;
  journal?: string;
  taskNumber?: number;
  priority?: string;
  completed?: boolean;
  project?: string;
  projectKey?: string;
  username?: string;
  avatarUrl?: string;
  department?: string;
  role?: string;
  [key: string]: any;
}

interface SearchResult {
  type: string;
  id: string;
  title: string;
  description?: string;
  score: number;
  meta: SearchResultMeta;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  facets: {
    byType: Record<string, number>;
  };
}

const useGlobalSearch = (q: string, type: SearchType, page: number) => {
  return useQuery<SearchResponse>({
    queryKey: ["global-search", q, type, page],
    queryFn: async () => {
      const { data } = await axiosInstance.get(endpoints.search.query, {
        params: { q, type, page, limit: 20 },
      });
      return data;
    },
    enabled: q.length >= 2,
    keepPreviousData: true,
  });
};

const TYPE_TABS: { value: SearchType; label: string }[] = [
  { value: "all", label: "Barchasi" },
  { value: "document", label: "Hujjatlar" },
  { value: "task", label: "Vazifalar" },
  { value: "project", label: "Loyihalar" },
  { value: "workflow", label: "Jarayonlar" },
  { value: "user", label: "Foydalanuvchilar" },
  { value: "journal", label: "Jurnallar" },
];

const TYPE_ICONS: Record<string, React.ReactNode> = {
  document: <IconFileText size={16} color="#3498db" />,
  task: <IconCheckbox size={16} color="#2ecc71" />,
  project: <IconLayoutKanban size={16} color="#f39c12" />,
  workflow: <IconArrowsExchange size={16} color="#9b59b6" />,
  user: <IconUser size={16} color="#1e3a5f" />,
  journal: <IconBook size={16} color="#e74c3c" />,
};

const TYPE_ROUTES: Record<string, (item: SearchResult) => string> = {
  document: (item) => `/dashboard/document/${item.id}`,
  task: (item) => `/dashboard/project/${item.meta.project ? "" : ""}task/${item.id}`,
  project: (item) => `/dashboard/project/${item.id}/tasks`,
  workflow: (item) => `/dashboard/workflow/${item.id}`,
  user: (item) => `/dashboard/admin/users?userId=${item.id}`,
  journal: (item) => `/dashboard/journal/${item.id}`,
};

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "gray",
  PENDING: "yellow",
  IN_REVIEW: "blue",
  APPROVED: "green",
  REJECTED: "red",
  PUBLISHED: "teal",
  ARCHIVED: "gray",
  ACTIVE: "green",
  COMPLETED: "teal",
  CANCELLED: "red",
  PLANNING: "blue",
  ON_HOLD: "yellow",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "gray",
  MEDIUM: "blue",
  HIGH: "orange",
  URGENT: "red",
  CRITICAL: "red",
};

function ResultItem({
  item,
  isActive,
  onClick,
}: {
  item: SearchResult;
  isActive: boolean;
  onClick: () => void;
}) {
  const icon = TYPE_ICONS[item.type] || <IconFile size={16} color="#868e96" />;

  return (
    <UnstyledButton
      onClick={onClick}
      w="100%"
      px="md"
      py="sm"
      style={{
        borderRadius: 6,
        backgroundColor: isActive ? "#1e3a5f" : "transparent",
        color: isActive ? "white" : "inherit",
        transition: "background-color 100ms ease",
      }}
    >
      <Group gap="sm" wrap="nowrap" align="flex-start">
        {item.type === "user" && item.meta.avatarUrl ? (
          <Avatar size={36} radius="sm" src={item.meta.avatarUrl}>
            {item.title.slice(0, 2).toUpperCase()}
          </Avatar>
        ) : (
          <Box
            w={36}
            h={36}
            style={{
              borderRadius: 6,
              backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "#f1f3f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        )}
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Group gap="xs" wrap="nowrap">
            <Text size="sm" fw={500} truncate style={{ flex: 1 }}>
              {item.title}
            </Text>
            {item.meta.status && (
              <Badge
                size="xs"
                variant="light"
                color={STATUS_COLORS[item.meta.status] || "gray"}
                style={{ flexShrink: 0 }}
              >
                {item.meta.status}
              </Badge>
            )}
            {item.meta.priority && (
              <Badge
                size="xs"
                variant="light"
                color={PRIORITY_COLORS[item.meta.priority] || "gray"}
                style={{ flexShrink: 0 }}
              >
                {item.meta.priority}
              </Badge>
            )}
          </Group>
          {item.description && (
            <Text
              size="xs"
              c={isActive ? "rgba(255,255,255,0.7)" : "dimmed"}
              truncate
              mt={2}
            >
              {item.description}
            </Text>
          )}
          <Group gap="xs" mt={4}>
            {item.meta.documentNumber && (
              <Text size="xs" c={isActive ? "rgba(255,255,255,0.6)" : "dimmed"}>
                {item.meta.documentNumber}
              </Text>
            )}
            {item.meta.taskNumber && (
              <Text size="xs" c={isActive ? "rgba(255,255,255,0.6)" : "dimmed"}>
                #{item.meta.taskNumber}
              </Text>
            )}
            {item.meta.projectKey && (
              <Text size="xs" c={isActive ? "rgba(255,255,255,0.6)" : "dimmed"}>
                {item.meta.projectKey}
              </Text>
            )}
            {item.meta.department && (
              <Text size="xs" c={isActive ? "rgba(255,255,255,0.6)" : "dimmed"}>
                {item.meta.department}
              </Text>
            )}
            {item.meta.createdBy && (
              <Text size="xs" c={isActive ? "rgba(255,255,255,0.6)" : "dimmed"}>
                {item.meta.createdBy}
              </Text>
            )}
          </Group>
        </Box>
        <IconArrowRight
          size={14}
          style={{ opacity: 0.4, flexShrink: 0, marginTop: 4 }}
        />
      </Group>
    </UnstyledButton>
  );
}

export function GlobalSearch() {
  const [opened, setOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeType, setActiveType] = useState<SearchType>("all");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data, isLoading, isFetching } = useGlobalSearch(debouncedQuery, activeType, 1);
  const results = data?.results || [];
  const total = data?.total || 0;
  const facets = data?.facets?.byType || {};

  // Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpened(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Arrow navigation
  useEffect(() => {
    if (!opened) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
      if (e.key === "Enter" && results[activeIndex]) {
        e.preventDefault();
        handleSelect(results[activeIndex]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [opened, results, activeIndex]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery, activeType]);

  useEffect(() => {
    if (opened) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [opened]);

  const handleClose = useCallback(() => {
    setOpened(false);
    setQuery("");
    setActiveType("all");
    setActiveIndex(0);
  }, []);

  const handleSelect = useCallback(
    (item: SearchResult) => {
      const getRoute = TYPE_ROUTES[item.type];
      if (getRoute) {
        router.push(getRoute(item));
      }
      handleClose();
    },
    [router, handleClose]
  );

  const handleTypeChange = useCallback((type: SearchType) => {
    setActiveType(type);
    setActiveIndex(0);
  }, []);

  return (
    <>
      {/* Trigger */}
      <UnstyledButton
        onClick={() => setOpened(true)}
        px="sm"
        py={6}
        style={{
          borderRadius: 6,
          backgroundColor: "#f8f9fa",
          border: "1px solid #e9ecef",
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: 280,
        }}
      >
        <IconSearch size={16} color="#868e96" />
        <Text size="sm" c="dimmed" style={{ flex: 1 }}>
          Qidirish...
        </Text>
        <Kbd size="xs" style={{ fontSize: 10 }}>
          Ctrl+K
        </Kbd>
      </UnstyledButton>

      {/* Modal */}
      <Modal
        opened={opened}
        onClose={handleClose}
        size={640}
        padding={0}
        radius="md"
        withCloseButton={false}
        styles={{
          body: { padding: 0 },
          content: { overflow: "hidden" },
        }}
        overlayProps={{ blur: 2, opacity: 0.3 }}
      >
        {/* Search Input */}
        <Box px="md" pt="md" pb="sm">
          <TextInput
            ref={inputRef}
            placeholder="Hujjat, vazifa, loyiha, foydalanuvchi qidiring..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leftSection={
              isLoading || isFetching ? (
                <Loader size={16} color="#1e3a5f" />
              ) : (
                <IconSearch size={16} />
              )
            }
            size="md"
            radius="sm"
            styles={{
              input: {
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                "&:focus": { borderColor: "#1e3a5f" },
              },
            }}
          />
        </Box>

        {/* Type Tabs */}
        {query.length >= 2 && (
          <Box px="md" pb="sm">
            <ScrollArea type="never">
              <Group gap={6} wrap="nowrap">
                {TYPE_TABS.map((tab) => {
                  const count = tab.value === "all" ? total : (facets[tab.value] || 0);
                  return (
                    <UnstyledButton
                      key={tab.value}
                      onClick={() => handleTypeChange(tab.value)}
                      px="sm"
                      py={4}
                      style={{
                        borderRadius: 4,
                        backgroundColor:
                          activeType === tab.value ? "#1e3a5f" : "#f1f3f5",
                        color: activeType === tab.value ? "white" : "#495057",
                        whiteSpace: "nowrap",
                        fontSize: 13,
                        fontWeight: 500,
                        transition: "all 100ms ease",
                      }}
                    >
                      {tab.label}
                      {count > 0 && (
                        <Badge
                          size="xs"
                          variant="filled"
                          ml={6}
                          style={{
                            backgroundColor:
                              activeType === tab.value
                                ? "rgba(255,255,255,0.25)"
                                : "#dee2e6",
                            color:
                              activeType === tab.value ? "white" : "#495057",
                          }}
                        >
                          {count}
                        </Badge>
                      )}
                    </UnstyledButton>
                  );
                })}
              </Group>
            </ScrollArea>
          </Box>
        )}

        <Box style={{ borderTop: "1px solid #e9ecef" }}>
          {/* Results */}
          {query.length < 2 ? (
            <Center py={60}>
              <Stack align="center" gap="xs">
                <IconSearch size={40} color="#dee2e6" />
                <Text size="sm" c="dimmed">
                  Kamida 2 belgi kiriting
                </Text>
                <Group gap={4}>
                  <Kbd size="xs">↑↓</Kbd>
                  <Text size="xs" c="dimmed">tanlash</Text>
                  <Kbd size="xs">↵</Kbd>
                  <Text size="xs" c="dimmed">ochish</Text>
                  <Kbd size="xs">Esc</Kbd>
                  <Text size="xs" c="dimmed">yopish</Text>
                </Group>
              </Stack>
            </Center>
          ) : results.length === 0 && !isLoading ? (
            <Center py={60}>
              <Stack align="center" gap="xs">
                <IconSearch size={40} color="#dee2e6" />
                <Text size="sm" fw={500}>
                  Natija topilmadi
                </Text>
                <Text size="xs" c="dimmed">
                  "{query}" bo'yicha hech narsa topilmadi
                </Text>
              </Stack>
            </Center>
          ) : (
            <ScrollArea.Autosize mah={400} type="scroll">
              <Box p="xs">
                {results.map((item, idx) => (
                  <ResultItem
                    key={`${item.type}-${item.id}`}
                    item={item}
                    isActive={activeIndex === idx}
                    onClick={() => handleSelect(item)}
                  />
                ))}
              </Box>
            </ScrollArea.Autosize>
          )}
        </Box>

        {/* Footer */}
        {results.length > 0 && (
          <Box
            px="md"
            py="xs"
            style={{
              borderTop: "1px solid #e9ecef",
              backgroundColor: "#f8f9fa",
            }}
          >
            <Group justify="space-between">
              <Group gap="xs">
                <Kbd size="xs">↑↓</Kbd>
                <Text size="xs" c="dimmed">tanlash</Text>
                <Kbd size="xs">↵</Kbd>
                <Text size="xs" c="dimmed">ochish</Text>
              </Group>
              <Text size="xs" c="dimmed">
                {total} natija topildi
              </Text>
            </Group>
          </Box>
        )}
      </Modal>
    </>
  );
}

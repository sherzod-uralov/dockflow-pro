"use client";

import { useState } from "react";
import {
  Tabs,
  Stack,
  TextInput,
  Avatar,
  Group,
  Text,
  ScrollArea,
  Box,
  Button,
  Checkbox,
  Loader,
  Center,
} from "@mantine/core";
import { IconUser, IconUsers, IconSearch } from "@tabler/icons-react";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useCreateDirectChat, useCreateGroupChat } from "../hook/chat.hook";

interface Props {
  onClose: () => void;
  onSuccess: (chatId: string) => void;
}

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);

export const NewChatModal = ({ onClose, onSuccess }: Props) => {
  const [tab, setTab] = useState<string>("direct");
  const [search, setSearch] = useState("");
  const [groupTitle, setGroupTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: usersData, isLoading } = useGetUserQuery({ pageNumber: 1, pageSize: 100 });
  const createDirect = useCreateDirectChat();
  const createGroup = useCreateGroupChat();

  const users = (usersData?.data || []).filter((u) =>
    u.fullname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartDirect = (userId: string) => {
    createDirect.mutate({ userId }, {
      onSuccess: (data: any) => {
        onSuccess(data.id);
        onClose();
      },
    });
  };

  const handleCreateGroup = () => {
    if (!groupTitle.trim() || selectedIds.length === 0) return;
    createGroup.mutate(
      { title: groupTitle.trim(), memberIds: selectedIds },
      {
        onSuccess: (data) => {
          onSuccess(data.id);
          onClose();
        },
      }
    );
  };

  return (
    <Tabs value={tab} onChange={(v) => setTab(v || "direct")}>
      <Tabs.List mb="md">
        <Tabs.Tab value="direct" leftSection={<IconUser size={16} />}>
          Shaxsiy
        </Tabs.Tab>
        <Tabs.Tab value="group" leftSection={<IconUsers size={16} />}>
          Guruh
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="direct">
        <Stack gap="sm">
          <TextInput
            placeholder="Foydalanuvchi qidirish..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
          />
          <ScrollArea h={300}>
            {isLoading ? (
              <Center py="xl">
                <Loader size="sm" />
              </Center>
            ) : (
              <Stack gap={4}>
                {users.map((user) => (
                  <Group
                    key={user.id}
                    p="xs"
                    gap="sm"
                    style={{
                      cursor: "pointer",
                      borderRadius: 6,
                      backgroundColor: "transparent",
                    }}
                    onClick={() => handleStartDirect(user.id)}
                  >
                    <Avatar size="sm" radius="xl" src={user.avatarUrl}>
                      {getInitials(user.fullname)}
                    </Avatar>
                    <Box>
                      <Text size="sm" fw={500}>
                        {user.fullname}
                      </Text>
                      <Text size="xs" c="dimmed">
                        @{user.username}
                      </Text>
                    </Box>
                  </Group>
                ))}
              </Stack>
            )}
          </ScrollArea>
        </Stack>
      </Tabs.Panel>

      <Tabs.Panel value="group">
        <Stack gap="sm">
          <TextInput
            label="Guruh nomi"
            placeholder="Marketing jamoasi"
            value={groupTitle}
            onChange={(e) => setGroupTitle(e.target.value)}
            size="sm"
            withAsterisk
          />
          <TextInput
            placeholder="A'zolar qidirish..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
          />
          <Text size="xs" c="dimmed">
            Tanlangan: {selectedIds.length}
          </Text>
          <ScrollArea h={250}>
            <Stack gap={4}>
              {users.map((user) => {
                const checked = selectedIds.includes(user.id);
                return (
                  <Group
                    key={user.id}
                    p="xs"
                    gap="sm"
                    style={{
                      cursor: "pointer",
                      borderRadius: 6,
                      backgroundColor: checked ? "#e7f5ff" : "transparent",
                    }}
                    onClick={() =>
                      setSelectedIds((prev) =>
                        checked ? prev.filter((id) => id !== user.id) : [...prev, user.id]
                      )
                    }
                  >
                    <Checkbox checked={checked} onChange={() => {}} size="xs" />
                    <Avatar size="sm" radius="xl" src={user.avatarUrl}>
                      {getInitials(user.fullname)}
                    </Avatar>
                    <Text size="sm">{user.fullname}</Text>
                  </Group>
                );
              })}
            </Stack>
          </ScrollArea>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={onClose} size="sm">
              Bekor
            </Button>
            <Button
              size="sm"
              onClick={handleCreateGroup}
              disabled={!groupTitle.trim() || selectedIds.length === 0}
              loading={createGroup.isLoading}
              style={{ backgroundColor: "#1e3a5f" }}
            >
              Yaratish
            </Button>
          </Group>
        </Stack>
      </Tabs.Panel>
    </Tabs>
  );
};

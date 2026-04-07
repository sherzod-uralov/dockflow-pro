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
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconUser,
  IconUsers,
  IconSearch,
  IconMessage,
  IconPhone,
} from "@tabler/icons-react";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { useCreateDirectChat, useCreateGroupChat } from "../hook/chat.hook";
import { useChatCall } from "../hook/use-chat-call";

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
  const [callingUserId, setCallingUserId] = useState<string | null>(null);

  const { data: usersData, isLoading } = useGetUserQuery({ pageNumber: 1, pageSize: 100 });
  const createDirect = useCreateDirectChat();
  const createGroup = useCreateGroupChat();
  const { startCall } = useChatCall();

  const users = (usersData?.data || []).filter((u) =>
    u.fullname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleStartDirect = (userId: string) => {
    createDirect.mutate(
      { userId },
      {
        onSuccess: (data: any) => {
          onSuccess(data.id);
          onClose();
        },
      }
    );
  };

  const handleStartCall = async (user: any) => {
    setCallingUserId(user.id);
    try {
      // Create or get direct chat first
      const chat = await new Promise<any>((resolve, reject) => {
        createDirect.mutate(
          { userId: user.id },
          { onSuccess: resolve, onError: reject }
        );
      });

      // Start audio call
      await startCall({
        chatId: chat.id,
        targetUserId: user.id,
        peerName: user.fullname,
        peerAvatar: user.avatarUrl,
      });

      onSuccess(chat.id);
      onClose();
    } catch (err) {
      console.error("Call start error:", err);
    } finally {
      setCallingUserId(null);
    }
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
          <ScrollArea h={350}>
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
                    justify="space-between"
                    style={{
                      borderRadius: 6,
                      border: "1px solid #e9ecef",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Group gap="sm" style={{ flex: 1, minWidth: 0 }}>
                      <Avatar size="sm" radius="xl" src={user.avatarUrl}>
                        {getInitials(user.fullname)}
                      </Avatar>
                      <Box style={{ minWidth: 0 }}>
                        <Text size="sm" fw={500} lineClamp={1}>
                          {user.fullname}
                        </Text>
                        <Text size="xs" c="dimmed" lineClamp={1}>
                          @{user.username}
                        </Text>
                      </Box>
                    </Group>
                    <Group gap={4}>
                      <Tooltip label="Yozish">
                        <ActionIcon
                          variant="light"
                          color="blue"
                          size="md"
                          radius="sm"
                          onClick={() => handleStartDirect(user.id)}
                          loading={createDirect.isLoading && callingUserId !== user.id}
                        >
                          <IconMessage size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label="Audio qo'ng'iroq">
                        <ActionIcon
                          variant="light"
                          color="green"
                          size="md"
                          radius="sm"
                          onClick={() => handleStartCall(user)}
                          loading={callingUserId === user.id}
                        >
                          <IconPhone size={16} />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
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

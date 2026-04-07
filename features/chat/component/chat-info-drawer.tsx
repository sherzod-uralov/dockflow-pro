"use client";

import { useState } from "react";
import {
  Drawer,
  Stack,
  Avatar,
  Text,
  Group,
  Box,
  Divider,
  ActionIcon,
  Menu,
  Badge,
  Button,
  TextInput,
  ScrollArea,
  Center,
  Loader,
  Checkbox,
  Tabs,
} from "@mantine/core";
import {
  IconUsers,
  IconCrown,
  IconShieldCheck,
  IconUser,
  IconDots,
  IconTrash,
  IconLogout,
  IconUserPlus,
  IconSearch,
  IconArrowLeft,
} from "@tabler/icons-react";
import {
  useGetChatDetail,
  useAddChatMembers,
  useRemoveChatMember,
  useLeaveChat,
  useChangeMemberRole,
  useDeleteChat,
} from "../hook/chat.hook";
import { ChatMemberRole } from "../type/chat.type";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";

interface Props {
  opened: boolean;
  onClose: () => void;
  chatId: string;
  currentUserId: string;
  onChatDeleted?: () => void;
}

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);

const ROLE_LABELS: Record<ChatMemberRole, { label: string; color: string }> = {
  OWNER: { label: "Egasi", color: "yellow" },
  ADMIN: { label: "Admin", color: "blue" },
  MEMBER: { label: "A'zo", color: "gray" },
};

export const ChatInfoDrawer = ({ opened, onClose, chatId, currentUserId, onChatDeleted }: Props) => {
  const [view, setView] = useState<"info" | "addMembers">("info");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const { data: chat, isLoading } = useGetChatDetail(chatId, opened);
  const { data: usersData } = useGetUserQuery({ pageNumber: 1, pageSize: 100 });
  const addMembers = useAddChatMembers();
  const removeMember = useRemoveChatMember();
  const leaveChat = useLeaveChat();
  const changeRole = useChangeMemberRole();
  const deleteChat = useDeleteChat();

  const isGroup = chat?.type === "GROUP";
  const myRole = chat?.myRole;
  const canManage = myRole === "OWNER" || myRole === "ADMIN";

  const memberIds = new Set(chat?.members?.map((m) => m.userId) || []);
  const availableUsers = (usersData?.data || []).filter(
    (u) => !memberIds.has(u.id) && u.fullname?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddMembers = () => {
    if (selectedIds.length === 0) return;
    addMembers.mutate(
      { chatId, userIds: selectedIds },
      {
        onSuccess: () => {
          setSelectedIds([]);
          setSearch("");
          setView("info");
        },
      }
    );
  };

  const handleRemoveMember = (userId: string) => {
    if (!confirm("A'zoni guruhdan chiqarishni xohlaysizmi?")) return;
    removeMember.mutate({ chatId, userId });
  };

  const handleChangeRole = (userId: string, role: ChatMemberRole) => {
    changeRole.mutate({ chatId, userId, role });
  };

  const handleLeave = () => {
    if (!confirm("Suhbatdan chiqishni xohlaysizmi?")) return;
    leaveChat.mutate(chatId, {
      onSuccess: () => {
        onClose();
        onChatDeleted?.();
      },
    });
  };

  const handleDelete = () => {
    if (!confirm("Suhbatni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.")) return;
    deleteChat.mutate(chatId, {
      onSuccess: () => {
        onClose();
        onChatDeleted?.();
      },
    });
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      title={view === "addMembers" ? (
        <Group gap={4}>
          <ActionIcon variant="subtle" size="sm" onClick={() => setView("info")}>
            <IconArrowLeft size={16} />
          </ActionIcon>
          <Text fw={600}>A'zo qo'shish</Text>
        </Group>
      ) : (isGroup ? "Guruh ma'lumotlari" : "Suhbat ma'lumotlari")}
      position="right"
      size="md"
      padding="md"
    >
      {isLoading || !chat ? (
        <Center py="xl">
          <Loader size="sm" color="#1e3a5f" />
        </Center>
      ) : view === "addMembers" ? (
        <Stack gap="sm">
          <TextInput
            placeholder="Foydalanuvchi qidirish..."
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="sm"
          />
          <Text size="xs" c="dimmed">Tanlangan: {selectedIds.length}</Text>
          <ScrollArea h={400}>
            <Stack gap={4}>
              {availableUsers.map((user) => {
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
                    <Box>
                      <Text size="sm" fw={500}>{user.fullname}</Text>
                      <Text size="xs" c="dimmed">@{user.username}</Text>
                    </Box>
                  </Group>
                );
              })}
            </Stack>
          </ScrollArea>
          <Group justify="flex-end" gap="xs">
            <Button variant="default" size="sm" onClick={() => setView("info")}>
              Bekor
            </Button>
            <Button
              size="sm"
              onClick={handleAddMembers}
              disabled={selectedIds.length === 0}
              loading={addMembers.isLoading}
              style={{ backgroundColor: "#1e3a5f" }}
            >
              Qo'shish
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack gap="md">
          {/* Header */}
          <Stack align="center" gap="xs">
            <Avatar
              size={80}
              radius="50%"
              src={chat.avatarUrl || chat.peer?.avatarUrl}
              style={{ backgroundColor: isGroup ? "#fff3e0" : "#e7f5ff" }}
            >
              {isGroup ? <IconUsers size={32} color="#f39c12" /> : getInitials(chat.title)}
            </Avatar>
            <Text size="lg" fw={600} c="#212529" ta="center">
              {chat.title}
            </Text>
            {chat.description && (
              <Text size="sm" c="dimmed" ta="center">{chat.description}</Text>
            )}
            {isGroup && (
              <Text size="xs" c="dimmed">{chat.membersCount} a'zo</Text>
            )}
          </Stack>

          {isGroup && (
            <>
              <Divider />

              {/* Members */}
              <Box>
                <Group justify="space-between" mb="xs">
                  <Text size="xs" fw={600} c="#868e96" tt="uppercase">
                    A'zolar ({chat.members?.length || 0})
                  </Text>
                  {canManage && (
                    <ActionIcon variant="subtle" size="sm" onClick={() => setView("addMembers")}>
                      <IconUserPlus size={16} />
                    </ActionIcon>
                  )}
                </Group>
                <ScrollArea h={300}>
                  <Stack gap={4}>
                    {chat.members?.map((member) => {
                      const roleConfig = ROLE_LABELS[member.role];
                      const isMe = member.userId === currentUserId;
                      const isOwner = member.role === "OWNER";
                      return (
                        <Group
                          key={member.userId}
                          p="xs"
                          gap="sm"
                          justify="space-between"
                          style={{ borderRadius: 6 }}
                        >
                          <Group gap="sm">
                            <Avatar size="sm" radius="xl" src={member.user.avatarUrl}>
                              {getInitials(member.user.fullname)}
                            </Avatar>
                            <Box>
                              <Group gap={4}>
                                <Text size="sm" fw={500}>
                                  {member.user.fullname}
                                </Text>
                                {isMe && (
                                  <Text size="xs" c="dimmed">(Siz)</Text>
                                )}
                              </Group>
                              <Text size="xs" c="dimmed">@{member.user.username}</Text>
                            </Box>
                          </Group>
                          <Group gap={4}>
                            <Badge
                              size="xs"
                              variant="light"
                              color={roleConfig.color}
                              leftSection={
                                isOwner ? (
                                  <IconCrown size={10} />
                                ) : member.role === "ADMIN" ? (
                                  <IconShieldCheck size={10} />
                                ) : (
                                  <IconUser size={10} />
                                )
                              }
                            >
                              {roleConfig.label}
                            </Badge>
                            {canManage && !isOwner && !isMe && (
                              <Menu shadow="md" width={160} position="bottom-end" withinPortal>
                                <Menu.Target>
                                  <ActionIcon variant="subtle" size="xs" color="gray">
                                    <IconDots size={14} />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  {member.role === "MEMBER" ? (
                                    <Menu.Item
                                      leftSection={<IconShieldCheck size={14} />}
                                      onClick={() => handleChangeRole(member.userId, "ADMIN")}
                                    >
                                      Admin qilish
                                    </Menu.Item>
                                  ) : (
                                    <Menu.Item
                                      leftSection={<IconUser size={14} />}
                                      onClick={() => handleChangeRole(member.userId, "MEMBER")}
                                    >
                                      Oddiy a'zo qilish
                                    </Menu.Item>
                                  )}
                                  <Menu.Item
                                    leftSection={<IconTrash size={14} />}
                                    color="red"
                                    onClick={() => handleRemoveMember(member.userId)}
                                  >
                                    Chiqarish
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            )}
                          </Group>
                        </Group>
                      );
                    })}
                  </Stack>
                </ScrollArea>
              </Box>
            </>
          )}

          <Divider />

          {/* Actions */}
          <Stack gap="xs">
            {isGroup && myRole !== "OWNER" && (
              <Button
                variant="light"
                color="red"
                leftSection={<IconLogout size={16} />}
                onClick={handleLeave}
                loading={leaveChat.isLoading}
              >
                Suhbatdan chiqish
              </Button>
            )}
            {(myRole === "OWNER" || !isGroup) && (
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={handleDelete}
                loading={deleteChat.isLoading}
              >
                Suhbatni o'chirish
              </Button>
            )}
          </Stack>
        </Stack>
      )}
    </Drawer>
  );
};

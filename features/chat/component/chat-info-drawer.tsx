"use client";

import { useState, useEffect } from "react";
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
  IconWorld,
  IconLock,
  IconCopy,
  IconRefresh,
  IconCheck,
} from "@tabler/icons-react";
import {
  useGetChatDetail,
  useAddChatMembers,
  useRemoveChatMember,
  useLeaveChat,
  useChangeMemberRole,
  useDeleteChat,
  useSetChatVisibility,
  useSetChatPermissions,
  useRegenerateInvite,
} from "../hook/chat.hook";
import { ChatMemberRole, ChatVisibility } from "../type/chat.type";
import { useGetUserQuery } from "@/features/admin/admin-users/hook/user.hook";
import { Switch, SegmentedControl, CopyButton } from "@mantine/core";

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
  const setVisibility = useSetChatVisibility();
  const setPermissions = useSetChatPermissions();
  const regenInvite = useRegenerateInvite();
  const [usernameInput, setUsernameInput] = useState("");

  const isGroup = chat?.type === "GROUP";
  const myRole = chat?.myRole;
  const canManage = myRole === "OWNER" || myRole === "ADMIN";
  const isOwner = myRole === "OWNER";

  // Sync username input when chat loads
  useEffect(() => {
    if (chat?.username !== undefined && chat?.username !== null) {
      setUsernameInput(chat.username || "");
    }
  }, [chat?.username]);

  const handleVisibilityChange = (visibility: ChatVisibility) => {
    if (!chat) return;
    if (visibility === "PUBLIC" && !usernameInput.trim()) {
      alert("Public uchun username kerak");
      return;
    }
    setVisibility.mutate({
      id: chat.id,
      payload:
        visibility === "PUBLIC"
          ? { visibility, username: usernameInput.trim() }
          : { visibility },
    });
  };

  const handlePermissionToggle = (key: "allowMemberInvite" | "allowMemberSendMedia" | "allowMemberPin", value: boolean) => {
    if (!chat) return;
    setPermissions.mutate({ id: chat.id, payload: { [key]: value } });
  };

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

          {/* Group visibility — faqat owner */}
          {isGroup && isOwner && (
            <>
              <Divider />
              <Box>
                <Text size="xs" fw={600} c="#868e96" tt="uppercase" mb="xs">
                  Guruh turi
                </Text>
                <SegmentedControl
                  fullWidth
                  data={[
                    { label: (<Group gap={4} justify="center"><IconLock size={14} /><Text size="xs">Maxfiy</Text></Group>) as any, value: "PRIVATE" },
                    { label: (<Group gap={4} justify="center"><IconWorld size={14} /><Text size="xs">Public</Text></Group>) as any, value: "PUBLIC" },
                  ]}
                  value={chat.visibility || "PRIVATE"}
                  onChange={(v) => handleVisibilityChange(v as ChatVisibility)}
                />

                {chat.visibility === "PUBLIC" && (
                  <Box mt="sm">
                    <TextInput
                      label="Username"
                      placeholder="masalan: it_dept"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())}
                      size="sm"
                      leftSection={<Text size="sm" c="dimmed">@</Text>}
                    />
                    <Button
                      size="xs"
                      mt={6}
                      variant="light"
                      onClick={() => handleVisibilityChange("PUBLIC")}
                      disabled={!usernameInput.trim() || usernameInput === chat.username}
                      loading={setVisibility.isLoading}
                    >
                      Saqlash
                    </Button>
                  </Box>
                )}

                {chat.visibility === "PRIVATE" && chat.inviteCode && (
                  <Box mt="sm">
                    <Text size="xs" c="dimmed" mb={4}>
                      Taklif kodi
                    </Text>
                    <Group gap="xs">
                      <TextInput
                        value={chat.inviteCode}
                        readOnly
                        size="xs"
                        style={{ flex: 1 }}
                        styles={{ input: { fontFamily: "monospace" } }}
                      />
                      <CopyButton value={chat.inviteCode}>
                        {({ copied, copy }) => (
                          <ActionIcon variant="light" onClick={copy}>
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                          </ActionIcon>
                        )}
                      </CopyButton>
                      <ActionIcon
                        variant="light"
                        onClick={() => regenInvite.mutate(chat.id)}
                        loading={regenInvite.isLoading}
                      >
                        <IconRefresh size={14} />
                      </ActionIcon>
                    </Group>
                  </Box>
                )}
              </Box>

              {/* Permissions */}
              <Box>
                <Text size="xs" fw={600} c="#868e96" tt="uppercase" mb="xs">
                  A'zolar ruxsatlari
                </Text>
                <Stack gap="xs">
                  <Switch
                    label="A'zo qo'shishi mumkin"
                    checked={!!chat.allowMemberInvite}
                    onChange={(e) => handlePermissionToggle("allowMemberInvite", e.currentTarget.checked)}
                    color="#1e3a5f"
                  />
                  <Switch
                    label="Media yuborish"
                    checked={!!chat.allowMemberSendMedia}
                    onChange={(e) => handlePermissionToggle("allowMemberSendMedia", e.currentTarget.checked)}
                    color="#1e3a5f"
                  />
                  <Switch
                    label="Pin qilish"
                    checked={!!chat.allowMemberPin}
                    onChange={(e) => handlePermissionToggle("allowMemberPin", e.currentTarget.checked)}
                    color="#1e3a5f"
                  />
                </Stack>
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

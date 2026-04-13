"use client";

import { useState } from "react";
import {
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
import { IconSearch, IconUsers, IconArrowForwardUp } from "@tabler/icons-react";
import { useGetChatList } from "../hook/chat.hook";
import { chatService } from "../service/chat.service";
import { showError, showSuccess } from "@/utils/show-error";
import { colors } from "@/lib/colors";

interface Props {
  messageId: string;
  onClose: () => void;
}

const getInitials = (name?: string) =>
  (name || "?").split(" ").map((n) => n[0]).filter(Boolean).join("").toUpperCase().slice(0, 2);

export const ForwardModal = ({ messageId, onClose }: Props) => {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isForwarding, setIsForwarding] = useState(false);

  const { data, isLoading } = useGetChatList({ limit: 100 });
  const chats = (data?.chats || []).filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleForward = async () => {
    if (selectedIds.length === 0) return;
    setIsForwarding(true);
    try {
      await chatService.forwardMessage(messageId, selectedIds);
      showSuccess(`${selectedIds.length} ta suhbatga yuborildi`);
      onClose();
    } catch (err) {
      showError(err);
    } finally {
      setIsForwarding(false);
    }
  };

  return (
    <Stack gap="sm">
      <TextInput
        placeholder="Suhbat qidirish..."
        leftSection={<IconSearch size={14} />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="sm"
      />
      <Text size="xs" c="dimmed">
        Tanlangan: {selectedIds.length}
      </Text>
      <ScrollArea h={350}>
        {isLoading ? (
          <Center py="xl">
            <Loader size="sm" />
          </Center>
        ) : (
          <Stack gap={4}>
            {chats.map((chat) => {
              const checked = selectedIds.includes(chat.id);
              const isGroup = chat.type === "GROUP";
              return (
                <Group
                  key={chat.id}
                  p="xs"
                  gap="sm"
                  style={{
                    cursor: "pointer",
                    borderRadius: 6,
                    backgroundColor: checked ? colors.primaryLight : "transparent",
                  }}
                  onClick={() =>
                    setSelectedIds((prev) =>
                      checked ? prev.filter((id) => id !== chat.id) : [...prev, chat.id]
                    )
                  }
                >
                  <Checkbox checked={checked} onChange={() => {}} size="xs" />
                  <Avatar
                    size="sm"
                    radius="xl"
                    src={chat.avatarUrl || chat.peer?.avatarUrl}
                    style={{ backgroundColor: isGroup ? colors.warningBg : colors.primaryLight }}
                  >
                    {isGroup ? <IconUsers size={14} color=colors.warning /> : getInitials(chat.title)}
                  </Avatar>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {chat.title}
                  </Text>
                </Group>
              );
            })}
          </Stack>
        )}
      </ScrollArea>
      <Group justify="flex-end" gap="xs">
        <Button variant="default" onClick={onClose} size="sm">
          Bekor
        </Button>
        <Button
          size="sm"
          onClick={handleForward}
          disabled={selectedIds.length === 0}
          loading={isForwarding}
          leftSection={<IconArrowForwardUp size={14} />}
          style={{ backgroundColor: colors.primary }}
        >
          Yuborish
        </Button>
      </Group>
    </Stack>
  );
};

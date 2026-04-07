"use client";

import { useState } from "react";
import {
  Box,
  Group,
  Text,
  ActionIcon,
  TextInput,
  ScrollArea,
  Stack,
  Center,
  Loader,
  Button,
} from "@mantine/core";
import { IconSearch, IconPlus, IconMessageCircle } from "@tabler/icons-react";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import { useGetChatList } from "../hook/chat.hook";
import { useChatSocket } from "../hook/use-chat-socket";
import { ChatListItemView } from "../component/chat-list-item";
import { ChatConversation } from "../component/chat-conversation";
import { NewChatModal } from "../component/new-chat-modal";

const ChatPage = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 300);
  const newChatModal = useModal();

  // Initialize chat socket once
  useChatSocket();

  const { data: user } = useGetProfileQuery();
  const { data: chatListData, isLoading } = useGetChatList({
    search: debouncedSearch || undefined,
    limit: 50,
  });

  const chats = chatListData?.chats || [];

  return (
    <Box
      style={{
        display: "flex",
        height: "calc(100vh - 120px)",
        backgroundColor: "#fff",
        border: "1px solid #e9ecef",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      {/* Left: Chat list */}
      <Box
        style={{
          width: 320,
          minWidth: 320,
          borderRight: "1px solid #e9ecef",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <Box p="sm" style={{ borderBottom: "1px solid #e9ecef" }}>
          <Group justify="space-between" mb="sm">
            <Text size="lg" fw={600} c="#212529">
              Suhbatlar
            </Text>
            <ActionIcon
              size="md"
              radius="sm"
              onClick={newChatModal.openModal}
              style={{ backgroundColor: "#1e3a5f", color: "#fff" }}
            >
              <IconPlus size={18} />
            </ActionIcon>
          </Group>
          <TextInput
            placeholder="Qidirish..."
            leftSection={<IconSearch size={14} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="sm"
            radius="sm"
            styles={{
              input: { backgroundColor: "#f8f9fa", border: "1px solid #e9ecef" },
            }}
          />
        </Box>

        {/* Chat list */}
        <ScrollArea style={{ flex: 1 }}>
          {isLoading ? (
            <Center py="xl">
              <Loader size="sm" color="#1e3a5f" />
            </Center>
          ) : chats.length === 0 ? (
            <Center py="xl">
              <Stack align="center" gap="sm">
                <Box
                  p={16}
                  style={{ backgroundColor: "#f1f3f5", borderRadius: 12 }}
                >
                  <IconMessageCircle size={32} color="#868e96" stroke={1.5} />
                </Box>
                <Text size="sm" c="dimmed" ta="center">
                  Hali suhbatlar yo'q
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  onClick={newChatModal.openModal}
                >
                  Yangi suhbat
                </Button>
              </Stack>
            </Center>
          ) : (
            <Stack gap={0}>
              {chats.map((chat) => (
                <ChatListItemView
                  key={chat.id}
                  chat={chat}
                  isActive={chat.id === activeChatId}
                  onClick={() => setActiveChatId(chat.id)}
                />
              ))}
            </Stack>
          )}
        </ScrollArea>
      </Box>

      {/* Right: Conversation */}
      <Box style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {activeChatId && user?.id ? (
          <ChatConversation chatId={activeChatId} currentUserId={user.id} />
        ) : (
          <Center style={{ height: "100%" }}>
            <Stack align="center" gap="md">
              <Box
                p={20}
                style={{ backgroundColor: "#f1f3f5", borderRadius: 16 }}
              >
                <IconMessageCircle size={48} color="#868e96" stroke={1.5} />
              </Box>
              <Text size="lg" fw={500} c="#495057">
                Suhbatni tanlang
              </Text>
              <Text size="sm" c="dimmed" ta="center">
                Chap tomondagi ro'yxatdan suhbat tanlang
                <br />
                yoki yangi suhbat boshlang
              </Text>
            </Stack>
          </Center>
        )}
      </Box>

      {/* New chat modal */}
      <CustomModal
        isOpen={newChatModal.isOpen}
        onClose={newChatModal.closeModal}
        title="Yangi suhbat"
        description="Shaxsiy yoki guruh suhbat yarating"
        size="md"
      >
        <NewChatModal
          onClose={newChatModal.closeModal}
          onSuccess={(chatId) => setActiveChatId(chatId)}
        />
      </CustomModal>
    </Box>
  );
};

export default ChatPage;

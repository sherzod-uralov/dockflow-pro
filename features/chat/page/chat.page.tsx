"use client";

import { useState, useMemo } from "react";
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
  Tabs,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconSearch,
  IconPlus,
  IconMessageCircle,
  IconArchive,
  IconArchiveOff,
  IconArrowLeft,
} from "@tabler/icons-react";
import { CustomModal, useModal } from "@/components/shared/ui/custom-modal";
import { useDebounce } from "@/hooks/use-debaunce";
import { useGetProfileQuery } from "@/features/login/hook/login.hook";
import { useGetChatList } from "../hook/chat.hook";
import { useChatSocket } from "../hook/use-chat-socket";
import { ChatListItemView } from "../component/chat-list-item";
import { ChatConversation } from "../component/chat-conversation";
import { NewChatModal } from "../component/new-chat-modal";
import { ChatSearchModal } from "../component/chat-search-modal";

const ChatPage = () => {
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "archived">("all");
  const [searchQuery, debouncedSearch, setSearchQuery] = useDebounce("", 300);
  const newChatModal = useModal();
  const searchModal = useModal();

  const isMobile = useMediaQuery("(max-width: 768px)");

  useChatSocket();

  const { data: user } = useGetProfileQuery();
  const { data: chatListData, isLoading } = useGetChatList({
    search: debouncedSearch || undefined,
    limit: 100,
  });

  const allChats = chatListData?.chats || [];
  const filteredChats = useMemo(() => {
    return tab === "archived"
      ? allChats.filter((c) => c.isArchived)
      : allChats.filter((c) => !c.isArchived);
  }, [allChats, tab]);

  const archivedCount = allChats.filter((c) => c.isArchived).length;

  const handleSearchSelect = (chatId: string) => {
    setActiveChatId(chatId);
    searchModal.closeModal();
  };

  // ─── Mobile: faqat bitta panel ko'rinadi ─────────────────
  const showListOnMobile = isMobile && !activeChatId;
  const showConversationOnMobile = isMobile && activeChatId;

  const listPanel = (
    <Box
      style={{
        width: isMobile ? "100%" : 320,
        minWidth: isMobile ? "100%" : 320,
        borderRight: isMobile ? "none" : "1px solid #e9ecef",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <Box p="sm" style={{ borderBottom: "1px solid #e9ecef" }}>
        <Group justify="space-between" mb="sm">
          <Text size="lg" fw={600} c="#212529">
            Suhbatlar
          </Text>
          <Group gap={4}>
            <Tooltip label="Qidirish">
              <ActionIcon
                size="md"
                variant="subtle"
                color="gray"
                onClick={searchModal.openModal}
              >
                <IconSearch size={18} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Yangi suhbat">
              <ActionIcon
                size="md"
                radius="sm"
                onClick={newChatModal.openModal}
                style={{ backgroundColor: "#1e3a5f", color: "#fff" }}
              >
                <IconPlus size={18} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
        <TextInput
          placeholder="Suhbatlarni qidirish..."
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

      {/* Tabs */}
      <Tabs value={tab} onChange={(v) => setTab((v as "all" | "archived") || "all")}>
        <Tabs.List grow>
          <Tabs.Tab value="all" leftSection={<IconMessageCircle size={14} />}>
            Faol
          </Tabs.Tab>
          <Tabs.Tab
            value="archived"
            leftSection={<IconArchive size={14} />}
            rightSection={archivedCount > 0 ? <Text size="xs" c="dimmed">{archivedCount}</Text> : null}
          >
            Arxiv
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>

      {/* Chat list */}
      <ScrollArea style={{ flex: 1 }}>
        {isLoading ? (
          <Center py="xl">
            <Loader size="sm" color="#1e3a5f" />
          </Center>
        ) : filteredChats.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Box p={16} style={{ backgroundColor: "#f1f3f5", borderRadius: 12 }}>
                {tab === "archived" ? (
                  <IconArchiveOff size={32} color="#868e96" stroke={1.5} />
                ) : (
                  <IconMessageCircle size={32} color="#868e96" stroke={1.5} />
                )}
              </Box>
              <Text size="sm" c="dimmed" ta="center">
                {tab === "archived" ? "Arxivda hech narsa yo'q" : "Hali suhbatlar yo'q"}
              </Text>
              {tab === "all" && (
                <Button size="xs" variant="light" onClick={newChatModal.openModal}>
                  Yangi suhbat
                </Button>
              )}
            </Stack>
          </Center>
        ) : (
          <Stack gap={0}>
            {filteredChats.map((chat) => (
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
  );

  const conversationPanel = (
    <Box style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100%" }}>
      {activeChatId && user?.id ? (
        <ChatConversation
          chatId={activeChatId}
          currentUserId={user.id}
          onChatDeleted={() => setActiveChatId(null)}
          onBack={isMobile ? () => setActiveChatId(null) : undefined}
        />
      ) : (
        <Center style={{ height: "100%" }}>
          <Stack align="center" gap="md">
            <Box p={20} style={{ backgroundColor: "#f1f3f5", borderRadius: 16 }}>
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
  );

  return (
    <Box
      style={{
        display: "flex",
        height: isMobile ? "calc(100vh - 80px)" : "calc(100vh - 120px)",
        backgroundColor: "#fff",
        border: isMobile ? "none" : "1px solid #e9ecef",
        borderRadius: isMobile ? 0 : 8,
        overflow: "hidden",
      }}
    >
      {isMobile ? (
        showListOnMobile ? listPanel : conversationPanel
      ) : (
        <>
          {listPanel}
          {conversationPanel}
        </>
      )}

      {/* Modals */}
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

      <CustomModal
        isOpen={searchModal.isOpen}
        onClose={searchModal.closeModal}
        title="Xabarlarni qidirish"
        description="Barcha suhbatlardan qidirish"
        size="md"
      >
        <ChatSearchModal onSelect={handleSearchSelect} />
      </CustomModal>

      <style jsx global>{`
        .chat-list-item:hover {
          background-color: #f8f9fa !important;
        }
        .chat-list-item:active {
          transform: scale(0.99);
        }
      `}</style>
    </Box>
  );
};

export default ChatPage;

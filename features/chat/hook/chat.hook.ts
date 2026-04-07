import { useMutation, useQuery, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
import { chatService } from "../service/chat.service";
import {
  CreateDirectChatPayload,
  CreateGroupChatPayload,
  SendTextMessagePayload,
  UpdateChatPayload,
  ChatMemberRole,
  ChatSettings,
} from "../type/chat.type";

const CHAT_LIST_KEY = ["chat-list"];
const chatDetailKey = (id: string) => ["chat-detail", id];
const chatMessagesKey = (id: string) => ["chat-messages", id];

export const useGetChatList = (params?: { search?: string; limit?: number }) =>
  useQuery({
    queryKey: [...CHAT_LIST_KEY, params],
    queryFn: () => chatService.list(params),
    keepPreviousData: true,
  });

export const useGetChatDetail = (id: string | null, enabled = true) =>
  useQuery({
    queryKey: chatDetailKey(id || ""),
    queryFn: () => chatService.detail(id!),
    enabled: !!id && enabled,
  });

export const useGetChatMessages = (id: string | null, enabled = true) =>
  useQuery({
    queryKey: chatMessagesKey(id || ""),
    queryFn: () => chatService.getMessages(id!, { limit: 50 }),
    enabled: !!id && enabled,
  });

export const useCreateDirectChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDirectChatPayload) => chatService.createDirect(payload),
    onSuccess: () => qc.invalidateQueries(CHAT_LIST_KEY),
    onError: showError,
  });
};

export const useCreateGroupChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupChatPayload) => chatService.createGroup(payload),
    onSuccess: () => {
      qc.invalidateQueries(CHAT_LIST_KEY);
      showSuccess("Guruh yaratildi");
    },
    onError: showError,
  });
};

export const useUpdateChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChatPayload }) =>
      chatService.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries(chatDetailKey(id));
      qc.invalidateQueries(CHAT_LIST_KEY);
    },
    onError: showError,
  });
};

export const useDeleteChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatService.delete(id),
    onSuccess: () => qc.invalidateQueries(CHAT_LIST_KEY),
    onError: showError,
  });
};

export const useSendTextMessage = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SendTextMessagePayload }) =>
      chatService.sendText(id, payload),
    // Cache socket eventi orqali yangilanadi (use-chat-socket.ts)
    onError: showError,
  });
};

export const useSendMediaMessage = () => {
  return useMutation({
    mutationFn: ({
      id,
      file,
      extras,
    }: {
      id: string;
      file: File;
      extras?: { content?: string; replyToId?: string; duration?: number };
    }) => chatService.sendMedia(id, file, extras),
    // Cache socket eventi orqali yangilanadi
    onError: showError,
  });
};

export const useEditMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, content }: { messageId: string; content: string }) =>
      chatService.editMessage(messageId, content),
    onSuccess: (msg) => qc.invalidateQueries(chatMessagesKey(msg.chatId)),
    onError: showError,
  });
};

export const useDeleteMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId }: { messageId: string; chatId: string }) =>
      chatService.deleteMessage(messageId),
    onSuccess: (_, { chatId }) => qc.invalidateQueries(chatMessagesKey(chatId)),
    onError: showError,
  });
};

export const useAddReaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string; chatId: string }) =>
      chatService.addReaction(messageId, emoji),
    onSuccess: (_, { chatId }) => qc.invalidateQueries(chatMessagesKey(chatId)),
    onError: showError,
  });
};

export const useRemoveReaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string; chatId: string }) =>
      chatService.removeReaction(messageId, emoji),
    onSuccess: (_, { chatId }) => qc.invalidateQueries(chatMessagesKey(chatId)),
    onError: showError,
  });
};

export const useMarkChatRead = () => {
  return useMutation({
    mutationFn: ({ id, upToMessageId }: { id: string; upToMessageId?: string }) =>
      chatService.markRead(id, upToMessageId),
  });
};

export const useChatSettings = () =>
  useQuery({
    queryKey: ["chat-settings"],
    queryFn: () => chatService.getSettings(),
  });

export const useUpdateChatSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<ChatSettings>) => chatService.updateSettings(payload),
    onSuccess: () => {
      qc.invalidateQueries(["chat-settings"]);
      showSuccess("Sozlamalar saqlandi");
    },
    onError: showError,
  });
};

export const useChangeMemberRole = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      chatId,
      userId,
      role,
    }: {
      chatId: string;
      userId: string;
      role: ChatMemberRole;
    }) => chatService.changeMemberRole(chatId, userId, role),
    onSuccess: (_, { chatId }) => qc.invalidateQueries(chatDetailKey(chatId)),
    onError: showError,
  });
};

export const useAddChatMembers = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, userIds }: { chatId: string; userIds: string[] }) =>
      chatService.addMembers(chatId, userIds),
    onSuccess: (_, { chatId }) => qc.invalidateQueries(chatDetailKey(chatId)),
    onError: showError,
  });
};

export const useRemoveChatMember = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chatId, userId }: { chatId: string; userId: string }) =>
      chatService.removeMember(chatId, userId),
    onSuccess: (_, { chatId }) => qc.invalidateQueries(chatDetailKey(chatId)),
    onError: showError,
  });
};

export const useMuteChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, mutedUntil }: { id: string; mutedUntil: string | null }) =>
      chatService.muteChat(id, mutedUntil),
    onSuccess: () => qc.invalidateQueries(CHAT_LIST_KEY),
    onError: showError,
  });
};

export const usePinChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => chatService.pinChat(id, pinned),
    onSuccess: () => qc.invalidateQueries(CHAT_LIST_KEY),
    onError: showError,
  });
};

export const useArchiveChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      chatService.archiveChat(id, archived),
    onSuccess: () => qc.invalidateQueries(CHAT_LIST_KEY),
    onError: showError,
  });
};

export const useGetMessageReads = (messageId: string | null, enabled = true) =>
  useQuery({
    queryKey: ["chat-message-reads", messageId],
    queryFn: () => chatService.getMessageReads(messageId!),
    enabled: !!messageId && enabled,
  });

export const useSearchMessages = (q: string, chatId?: string) =>
  useQuery({
    queryKey: ["chat-search", q, chatId],
    queryFn: () => chatService.searchMessages(q, chatId),
    enabled: q.length >= 2,
    keepPreviousData: true,
  });

export const useLeaveChat = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (chatId: string) => chatService.leave(chatId),
    onSuccess: () => qc.invalidateQueries(CHAT_LIST_KEY),
    onError: showError,
  });
};

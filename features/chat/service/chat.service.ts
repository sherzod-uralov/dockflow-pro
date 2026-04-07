import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  ChatListResponse,
  ChatDetail,
  ChatListItem,
  ChatMessagesResponse,
  ChatMessage,
  CreateDirectChatPayload,
  CreateGroupChatPayload,
  SendTextMessagePayload,
  UpdateChatPayload,
  ChatSettings,
  ChatMemberRole,
} from "../type/chat.type";

export const chatService = {
  // ─── Chats ──────────────────────────────────────────────
  list: async (params?: { search?: string; limit?: number }): Promise<ChatListResponse> => {
    const { data } = await axiosInstance.get<ChatListResponse>(endpoints.chat.list, { params });
    return data;
  },

  detail: async (id: string): Promise<ChatDetail> => {
    const { data } = await axiosInstance.get<ChatDetail>(endpoints.chat.detail(id));
    return data;
  },

  createDirect: async (payload: CreateDirectChatPayload): Promise<ChatListItem & { created: boolean }> => {
    const { data } = await axiosInstance.post(endpoints.chat.direct, payload);
    return data;
  },

  createGroup: async (payload: CreateGroupChatPayload): Promise<ChatDetail> => {
    const { data } = await axiosInstance.post<ChatDetail>(endpoints.chat.group, payload);
    return data;
  },

  update: async (id: string, payload: UpdateChatPayload): Promise<ChatDetail> => {
    const { data } = await axiosInstance.patch<ChatDetail>(endpoints.chat.update(id), payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(endpoints.chat.delete(id));
  },

  // ─── Members ────────────────────────────────────────────
  addMembers: async (id: string, userIds: string[]) => {
    const { data } = await axiosInstance.post(endpoints.chat.members(id), { userIds });
    return data;
  },

  removeMember: async (id: string, userId: string) => {
    await axiosInstance.delete(endpoints.chat.member(id, userId));
  },

  leave: async (id: string) => {
    await axiosInstance.post(endpoints.chat.leave(id));
  },

  changeMemberRole: async (id: string, userId: string, role: ChatMemberRole) => {
    const { data } = await axiosInstance.patch(endpoints.chat.memberRole(id, userId), { role });
    return data;
  },

  // ─── Messages ───────────────────────────────────────────
  getMessages: async (
    id: string,
    params?: { before?: string; limit?: number }
  ): Promise<ChatMessagesResponse> => {
    const { data } = await axiosInstance.get<ChatMessagesResponse>(endpoints.chat.messages(id), {
      params,
    });
    return data;
  },

  sendText: async (id: string, payload: SendTextMessagePayload): Promise<ChatMessage> => {
    const { data } = await axiosInstance.post<ChatMessage>(endpoints.chat.messages(id), {
      type: "TEXT",
      ...payload,
    });
    return data;
  },

  sendMedia: async (
    id: string,
    file: File,
    extras?: { content?: string; replyToId?: string; duration?: number; thumbnailUrl?: string }
  ): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append("file", file);
    if (extras?.content) formData.append("content", extras.content);
    if (extras?.replyToId) formData.append("replyToId", extras.replyToId);
    if (extras?.duration != null) formData.append("duration", String(extras.duration));
    if (extras?.thumbnailUrl) formData.append("thumbnailUrl", extras.thumbnailUrl);

    const { data } = await axiosInstance.post<ChatMessage>(endpoints.chat.messages(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  editMessage: async (messageId: string, content: string): Promise<ChatMessage> => {
    const { data } = await axiosInstance.patch<ChatMessage>(endpoints.chat.message(messageId), {
      content,
    });
    return data;
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await axiosInstance.delete(endpoints.chat.message(messageId));
  },

  // ─── Reactions ──────────────────────────────────────────
  addReaction: async (messageId: string, emoji: string) => {
    const { data } = await axiosInstance.post(endpoints.chat.reactions(messageId), { emoji });
    return data;
  },

  removeReaction: async (messageId: string, emoji: string) => {
    await axiosInstance.delete(endpoints.chat.reaction(messageId, emoji));
  },

  // ─── Forward ────────────────────────────────────────────
  forwardMessage: async (messageId: string, toChatIds: string[]) => {
    const { data } = await axiosInstance.post(endpoints.chat.forwardMessage(messageId), {
      toChatIds,
    });
    return data;
  },

  forwardWorkflow: async (workflowId: string, toChatId: string, caption?: string) => {
    const { data } = await axiosInstance.post(endpoints.chat.forwardWorkflow(workflowId), {
      toChatId,
      caption,
    });
    return data;
  },

  forwardDocument: async (documentId: string, toChatId: string, caption?: string) => {
    const { data } = await axiosInstance.post(endpoints.chat.forwardDocument(documentId), {
      toChatId,
      caption,
    });
    return data;
  },

  forwardTask: async (taskId: string, toChatId: string, caption?: string) => {
    const { data } = await axiosInstance.post(endpoints.chat.forwardTask(taskId), {
      toChatId,
      caption,
    });
    return data;
  },

  // ─── Read receipts ──────────────────────────────────────
  markRead: async (id: string, upToMessageId?: string) => {
    await axiosInstance.post(endpoints.chat.read(id), { upToMessageId });
  },

  // ─── Settings ───────────────────────────────────────────
  getSettings: async (): Promise<ChatSettings> => {
    const { data } = await axiosInstance.get<ChatSettings>(endpoints.chat.settings);
    return data;
  },

  updateSettings: async (payload: Partial<ChatSettings>): Promise<ChatSettings> => {
    const { data } = await axiosInstance.patch<ChatSettings>(endpoints.chat.settings, payload);
    return data;
  },
};

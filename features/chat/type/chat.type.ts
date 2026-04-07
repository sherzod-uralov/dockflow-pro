export type ChatType = "DIRECT" | "GROUP";
export type ChatMemberRole = "OWNER" | "ADMIN" | "MEMBER";
export type ChatMessageType =
  | "TEXT"
  | "IMAGE"
  | "VIDEO"
  | "VOICE"
  | "FILE"
  | "SYSTEM"
  | "FORWARD"
  | "WORKFLOW"
  | "DOCUMENT"
  | "TASK"
  | "CALL";

export interface ChatUser {
  id: string;
  fullname: string;
  username: string;
  avatarUrl?: string | null;
}

export interface ChatLastMessage {
  id: string;
  type: ChatMessageType;
  content: string;
  sender: { id: string; fullname: string };
  createdAt: string;
}

export interface ChatListItem {
  id: string;
  type: ChatType;
  title: string;
  avatarUrl?: string | null;
  peer?: ChatUser | null;
  lastMessageAt?: string | null;
  membersCount: number;
  isPinned: boolean;
  isArchived: boolean;
  mutedUntil?: string | null;
  myRole: ChatMemberRole;
  lastMessage?: ChatLastMessage | null;
  unreadCount?: number;
}

export interface ChatListResponse {
  count: number;
  chats: ChatListItem[];
}

export interface ChatMember {
  userId: string;
  role: ChatMemberRole;
  user: ChatUser;
  joinedAt?: string;
  lastReadAt?: string | null;
}

export interface ChatDetail extends ChatListItem {
  description?: string;
  members: ChatMember[];
}

export interface ChatReaction {
  emoji: string;
  userId: string;
  user?: ChatUser;
}

export interface ChatReadReceipt {
  userId: string;
  readAt: string;
}

export interface ChatRefSnapshot {
  id: string;
  url?: string;
  // Workflow
  type?: string;
  status?: string;
  document?: { id: string; title: string; documentNumber: string; status: string };
  // Document
  title?: string;
  documentNumber?: string;
  documentType?: string;
  pdfUrl?: string;
  // Task
  ref?: string;
  priority?: string;
  score?: number;
  dueDate?: string;
  project?: { id: string; name: string; key: string };
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  sender: ChatUser;
  type: ChatMessageType;
  content: string;
  replyToId?: string | null;
  replyTo?: {
    id: string;
    content: string;
    type: ChatMessageType;
    senderId: string;
    sender: { id: string; fullname: string };
  } | null;
  forwardedFromId?: string | null;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  refType?: "workflow" | "document" | "task" | null;
  refId?: string | null;
  refSnapshot?: ChatRefSnapshot | null;
  reactions?: ChatReaction[];
  reads?: ChatReadReceipt[];
  editedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  // Optimistic
  pending?: boolean;
  tempId?: string;
  failed?: boolean;
}

export interface ChatMessagesResponse {
  count: number;
  messages: ChatMessage[];
}

export interface CreateDirectChatPayload {
  userId: string;
}

export interface CreateGroupChatPayload {
  title: string;
  description?: string;
  avatarUrl?: string;
  memberIds: string[];
}

export interface SendTextMessagePayload {
  type?: "TEXT";
  content: string;
  replyToId?: string;
}

export interface UpdateChatPayload {
  title?: string;
  description?: string;
  avatarUrl?: string;
}

export interface ChatSettings {
  id: string;
  userId: string;
  allowCalls: boolean;
  allowVideoCalls: boolean;
  allowGroupInvites: boolean;
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showReadReceipts: boolean;
  notifySound: boolean;
  notifyPreview: boolean;
}

import { GlobalGetAllPaginationProps } from "@/types/global.types";

export interface TaskCommentUser {
  id: string;
  fullname: string;
  username?: string;
  avatarUrl?: string | null;
  avatar?: string;
}

export interface CommentAttachmentFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

export interface CommentAttachment {
  id: string;
  attachment: CommentAttachmentFile;
  uploadedBy?: { id: string; fullname: string };
  createdAt: string;
}

export interface CommentReaction {
  id: string;
  emoji: string;
  userId: string;
  user: { id: string; fullname: string };
}

export interface CommentMention {
  id: string;
  userId: string;
  user: { id: string; fullname: string; username: string };
}

export interface CommentReplyTo {
  id: string;
  content: string;
  user: TaskCommentUser;
  attachmentType?: string;
  attachmentName?: string;
}

export interface TaskCommentGetResponse {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  replyTo?: CommentReplyTo;
  isEdited: boolean;
  editedAt?: Date;
  user: TaskCommentUser;
  attachments: CommentAttachment[];
  reactions: CommentReaction[];
  mentions: CommentMention[];
  replies: TaskCommentGetResponse[];
  repliesCount: number;
  reactionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCommentCreatePayload {
  taskId: string;
  content: string;
  attachmentIds?: string[];
  parentCommentId?: string;
}

export interface TaskCommentUpdatePayload {
  content: string;
}

export interface TaskCommentQueryParams extends GlobalGetAllPaginationProps {
  taskId: string;
}

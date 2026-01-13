import { GlobalGetAllPaginationProps } from "@/types/global.types";

export interface TaskCommentUser {
  id: string;
  fullname: string;
  avatar?: string;
}

export interface TaskCommentGetResponse {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  isEdited: boolean;
  editedAt?: Date;
  user: TaskCommentUser;
  repliesCount: number;
  reactionsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskCommentCreatePayload {
  taskId: string;
  content: string;
  parentCommentId?: string;
}

export interface TaskCommentUpdatePayload {
  content: string;
}

export interface TaskCommentQueryParams extends GlobalGetAllPaginationProps {
  taskId: string;
}

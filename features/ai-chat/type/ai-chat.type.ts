export type AiMessageRole = "user" | "assistant";

export type AiCardType =
  | "task"
  | "task_created"
  | "action_result"
  | "workflow"
  | "document"
  | "pdf"
  | "kpi"
  | "notification"
  | "project"
  | "stats"
  | "user";

export type AiErrorType = "RATE_LIMIT" | "AI_ERROR";

export interface AiCardAction {
  label: string;
  url: string;
  external?: boolean;
}

export interface AiCard {
  type: AiCardType;
  id: string;
  title: string;
  subtitle?: string;
  meta?: Record<string, unknown>;
  actions?: AiCardAction[];
}

export interface AiHistoryMessage {
  id: string;
  role: AiMessageRole;
  content: string;
  cards?: AiCard[];
  attachments?: unknown[] | null;
  timestamp: string;
  pending?: boolean;
  error?: AiErrorType;
}

export interface AiChatResponse {
  id: string;
  message: string;
  cards?: AiCard[];
  timestamp: string;
  error?: AiErrorType;
}

export interface AiClearHistoryResponse {
  deleted: number;
}

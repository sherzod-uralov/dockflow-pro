export type AiMessageRole = "user" | "assistant";

export type AiCardType =
  | "task"
  | "workflow"
  | "document"
  | "pdf"
  | "kpi"
  | "notification"
  | "project"
  | "stats";

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
}

export interface AiChatResponse {
  id: string;
  message: string;
  cards?: AiCard[];
  timestamp: string;
}

export interface AiClearHistoryResponse {
  deleted: number;
}

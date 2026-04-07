export interface HistoryActor {
  id: string;
  fullname: string;
  username?: string;
  avatarUrl?: string | null;
}

export interface HistoryFileVersion {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  uploadedBy?: HistoryActor;
}

export interface HistoryDocumentSummary {
  totalVersions: number;
  totalSteps: number;
  totalActions: number;
  currentStatus: string;
  workflowsCount: number;
}

export interface HistoryWorkflowStep {
  id: string;
  order: number;
  actionType: string;
  status: string;
  assignedToUser?: HistoryActor;
  actions?: unknown[];
  attachments?: unknown[];
}

export interface HistoryWorkflow {
  id: string;
  type: string;
  status: string;
  workflowSteps: HistoryWorkflowStep[];
}

export interface HistoryAuditLog {
  id: string;
  action: string;
  performedAt: string;
  performedBy?: HistoryActor;
  changes?: Record<string, unknown>;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}

export type TimelineEventType =
  | "DOCUMENT_CREATED"
  | "DOCUMENT_UPDATED"
  | "FILE_UPLOADED"
  | "WORKFLOW_STARTED"
  | "WORKFLOW_COMPLETED"
  | "STEP_STARTED"
  | "STEP_APPROVED"
  | "STEP_REJECTED"
  | "STEP_REASSIGNED"
  | "AUDIT_UPDATE"
  | string;

export interface TimelineEvent {
  type: TimelineEventType;
  timestamp: string;
  actor?: HistoryActor;
  title: string;
  description?: string;
  meta?: Record<string, any>;
}

export interface DocumentHistoryResponse {
  document: {
    id: string;
    title: string;
    documentNumber?: string;
    status: string;
    documentType?: { id: string; name: string };
    journal?: { id: string; name: string };
    createdBy?: HistoryActor;
    updatedBy?: HistoryActor;
    createdAt: string;
    updatedAt: string;
  };
  summary: HistoryDocumentSummary;
  fileVersions: Record<string, HistoryFileVersion[]>;
  workflows: HistoryWorkflow[];
  auditLogs: HistoryAuditLog[];
  timeline: TimelineEvent[];
}

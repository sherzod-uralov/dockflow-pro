// Notification Types
export enum NotificationType {
    WORKFLOW_STEP_ASSIGNED = 'workflow_step_assigned',
    WORKFLOW_STEP_COMPLETED = 'workflow_step_completed',
    WORKFLOW_STEP_REJECTED = 'workflow_step_rejected',
    WORKFLOW_STEP_REASSIGNED = 'workflow_step_reassigned',
    WORKFLOW_COMPLETED = 'workflow_completed',
    WORKFLOW_STEP_COMMENT = 'workflow_step_comment',
    WORKFLOW_STEP_STARTED = 'workflow_step_started',
    DOCUMENT_APPROVED = 'document_approved',
    DOCUMENT_REJECTED = 'document_rejected',
}

// Metadata types for different notification types
export interface WorkflowStepAssignedMetadata {
    workflowStepId: string;
    workflowId: string;
    documentId: string;
    actionType: string;
    order: number;
}

export interface WorkflowStepCompletedMetadata {
    workflowStepId: string;
    workflowId: string;
    documentId: string;
    completedBy: string;
    actionType: string;
}

export interface WorkflowStepRejectedMetadata {
    workflowStepId: string;
    workflowId: string;
    documentId: string;
    rejectedBy: string;
    rejectionReason: string;
    actionType: string;
}

export interface WorkflowStepReassignedMetadata {
    workflowStepId: string;
    workflowId: string;
    documentId: string;
    reassignedBy: string;
    previousAssignedUserId: string;
    actionType: string;
}

export interface WorkflowCompletedMetadata {
    workflowId: string;
    documentId: string;
}

export interface WorkflowStepCommentMetadata {
    workflowStepId: string;
    workflowId: string;
    documentId: string;
    commentedBy: string;
    comment: string;
}

export interface DocumentApprovedMetadata {
    documentId: string;
    approvedBy: string;
}

export interface DocumentRejectedMetadata {
    documentId: string;
    rejectedBy: string;
    rejectionReason: string;
}

// Union type for all metadata
export type NotificationMetadata =
    | WorkflowStepAssignedMetadata
    | WorkflowStepCompletedMetadata
    | WorkflowStepRejectedMetadata
    | WorkflowStepReassignedMetadata
    | WorkflowCompletedMetadata
    | WorkflowStepCommentMetadata
    | DocumentApprovedMetadata
    | DocumentRejectedMetadata;

// Main Notification interface
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    metadata?: NotificationMetadata;
    isRead: boolean;
    readAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Response types
export interface PendingNotificationsResponse {
    count: number;
    notifications: Notification[];
}

export interface MarkAsReadResponse {
    success: boolean;
    message: string;
}

// Socket event types
export interface SocketErrorResponse {
    message: string;
}

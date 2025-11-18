export function createDocumentEditUrl(
  fileUrl: string,
  templateId: string,
  token: string,
): string {
  const params = new URLSearchParams({
    url: fileUrl,
    id: templateId,
    api: `https://docflow-back.nordicuniversity.org/api/v1/document-template/${templateId}`,
    field: "templateFileId",
    token: token,
    mode: "edit",
    qr: "true",
  });

  return `http://localhost:5173/document-editor?${params.toString()}`;
}

/**
 * Determine editor type based on workflow action type
 * @param actionType - Workflow action type
 * @returns Editor type: 'pdf' or 'collabora'
 */
export function getEditorTypeByActionType(
  actionType?: string,
): "pdf" | "collabora" {
  return actionType === "QR_CODE" ? "pdf" : "collabora";
}

/**
 * Create URL for editing document attachment in workflow
 * @param attachmentId - ID of the document attachment to edit
 * @param documentId - ID of the document (required for WOPI permissions)
 * @param actionType - Action type from workflow step (determines editor type)
 * @returns URL to appropriate editor (PDF editor for QR_CODE, Collabora for others)
 */
export function createWorkflowDocumentEditUrl(
  attachmentId: string,
  documentId: string,
  actionType?: string,
): string {
  const editorType = getEditorTypeByActionType(actionType);

  // If actionType is QR_CODE, use PDF editor
  if (editorType === "pdf") {
    return `/pdf/${documentId}`;
  }

  // For all other action types (SIGN, etc.), use Collabora document editor
  return `/document-edit?id=${attachmentId}&documentId=${documentId}`;
}

/**
 * Create URL for viewing document in read-only mode (for completed workflows)
 * @param attachmentId - ID of the document attachment to view
 * @param documentId - ID of the document
 * @param actionType - Action type from workflow step (determines viewer type)
 * @returns URL to appropriate viewer in read-only mode
 */
export function createWorkflowDocumentViewUrl(
  attachmentId: string,
  documentId: string,
  actionType?: string,
): string {
  const editorType = getEditorTypeByActionType(actionType);

  // If actionType is QR_CODE, use PDF viewer
  if (editorType === "pdf") {
    return `/pdf/${documentId}?readonly=true`;
  }

  // For all other action types, use Collabora in read-only mode
  return `/document-edit?id=${attachmentId}&documentId=${documentId}&readonly=true`;
}

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

export function getEditorTypeByActionType(
  actionType?: string,
): "pdf" | "collabora" {
  return actionType === "QR_CODE" ? "pdf" : "collabora";
}

export function createWorkflowDocumentEditUrl(
  attachmentId: string,
  documentId: string,
  actionType?: string,
): string {
  const editorType = getEditorTypeByActionType(actionType);

  if (editorType === "pdf") {
    return `/pdf/${documentId}`;
  }

  return `/document-edit?id=${attachmentId}&documentId=${documentId}`;
}

export function createWorkflowDocumentViewUrl(
  attachmentId: string,
  documentId: string,
  actionType?: string,
): string {
  const editorType = getEditorTypeByActionType(actionType);

  if (editorType === "pdf") {
    return `/pdf/${documentId}?readonly=true`;
  }

  return `/document-edit?id=${attachmentId}&documentId=${documentId}&readonly=true`;
}

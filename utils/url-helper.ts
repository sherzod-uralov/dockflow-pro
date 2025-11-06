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
 * Create URL for editing document attachment in workflow
 * @param attachmentId - ID of the document attachment to edit
 * @returns URL to document-edit page with Collabora Online
 */
export function createWorkflowDocumentEditUrl(attachmentId: string): string {
  return `/document-edit?id=${attachmentId}`;
}

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

  return ` http://192.168.31.213:5173/document-editor?${params.toString()}`;
}

export interface WopiTokenResponse {
  token: string;
  accessToken: string;
  expiresAt: string;
  wopiSrc: string;
  actionType: "APPROVAL" | "SIGN" | "QR_CODE" | "REVIEW" | "ACKNOWLEDGE";
  permissions: {
    UserCanWrite: boolean;
    UserCanRead: boolean;
    ReadOnly: boolean;
    WebEditingDisabled: boolean;
  };
}

export interface WopiTokenRequest {
  fileId: string;
  documentId: string;
}

export interface SaveAnnotationsRequest {
  xfdfContent: string;
}

export interface CompleteStepRequest {
  comment?: string;
}

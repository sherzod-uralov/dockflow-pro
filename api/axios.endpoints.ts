// endpoints.ts
export const endpoints = {
  auditLog: {
    list: "audit-log",
    create: "audit-log",
    detail: (id: string | number) => `/audit-log/${id}`,
  },
  workflow: {
    list: "workflow",
    create: "workflow",
    detail: (id: string | number) => `/workflow/${id}`,
    update: (id: string | number) => `/workflow/${id}`,
    delete: (id: string | number) => `/workflow/${id}`,
  },
  workflowTemplate: {
    list: "/workflow-template",
    create: "/workflow-template",
    detail: (id: string | number) => `/workflow-template/${id}`,
    update: (id: string | number) => `/workflow-template/${id}`,
    delete: (id: string | number) => `/workflow-template/${id}`,
  },
  workflowStep: {
    list: "/workflow-step",
    update: (id: string | number) => `/workflow-step/${id}`,
    detail: (id: string | number) => `/workflow-step/${id}`,
    complete: (id: string | number) => `/workflow-step/${id}/complete`,
    reject: (id: string | number) => `/workflow-step/${id}/reject`,
    verify: (id: string | number) => `/workflow-step/${id}/verify`,
    calendarView: "/workflow-step/calendar/view",
  },

  documentTemplate: {
    list: "/document-template",
    create: "/document-template",
    detail: (id: string | number) => `/document-template/${id}`,
    update: (id: string | number) => `/document-template/${id}`,
    delete: (id: string | number) => `/document-template/${id}`,
  },
  document: {
    list: "/document",
    create: "/document",
    detail: (id: string | number) => `/document/${id}`,
    update: (id: string | number) => `/document/${id}`,
    delete: (id: string | number) => `/document/${id}`,
    savePdfAnnotations: (id: string | number) => `/document/${id}/pdf-url`,
    download: (id: string | number) => `/document/${id}/download`,
  },
  deportament: {
    list: "/department",
    create: "/department",
    detail: (id: string | number) => `/department/${id}`,
    update: (id: string | number) => `/department/${id}`,
    delete: (id: string | number) => `/department/${id}`,
  },
  documentType: {
    list: "/document-type",
    create: "/document-type",
    detail: (id: string | number) => `/document-type/${id}`,
    update: (id: string | number) => `/document-type/${id}`,
    delete: (id: string | number) => `/document-type/${id}`,
  },
  auth: {
    login: "/auth/login",
    refreshToken: "/auth/refresh-token",
    logout: "/auth/logout",
    profile: {
      list: "/auth/profile",
      update: "/auth/profile",
    },
  },
  user: {
    list: "/user",
    create: "/user",
    detail: (id: string | number) => `/user/${id}`,
    update: (id: string | number) => `/user/${id}`,
    delete: (id: string | number) => `/user/${id}`,
    telegram: {
      linkInfo: (id: string | number) => `/user/${id}/telegram/link-info`,
      link: (id: string | number) => `/user/${id}/telegram/link`,
      status: (id: string | number) => `/user/${id}/telegram/status`,
    },
  },
  role: {
    list: "/role",
    create: "/role",
    detail: (id: string | number) => `/role/${id}`,
    update: (id: string | number) => `/role/${id}`,
    delete: (id: string | number) => `/role/${id}`,
  },
  permission: {
    list: "/permission",
    create: "/permission",
    detail: (id: string | number) => `/permission/${id}`,
    update: (id: string | number) => `/permission/${id}`,
    delete: (id: string | number) => `/permission/${id}`,
  },
  journal: {
    list: "/journal",
    create: "/journal",
    detail: (id: string | number) => `/journal/${id}`,
    update: (id: string | number) => `/journal/${id}`,
    delete: (id: string | number) => `/journal/${id}`,
  },
  attachment: {
    list: "/attachment",
    create: "/attachment",
    update: (id: string) => `/attachment/${id}`,
    delete: (id: string) => `/attachment/${id}`,
    detail: (id: string) => `/attachment/${id}`,
  },
  wopi: {
    token: "/wopi/token",
  },
  pdf: {
    list: (id: string | number) => `/document/${id}/pdf-url`,
    create: (id: string | number) => `/document/${id}/pdf-url`,
  },
  notification: {
    list: "/notifications",
    unreadCount: "/notifications/unread-count",
    markAsRead: (id: string) => `/notifications/${id}/read`,
    markAllAsRead: "/notifications/read-all",
    delete: (id: string) => `/notifications/${id}`,
  },
} as const;

export type Endpoints = typeof endpoints;

// endpoints.tss
export const endpoints = {
  auth: {
    login: "/auth/login",
    refreshToken: "/auth/refresh-token",
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
} as const;

export type Endpoints = typeof endpoints;

import { z } from "zod";

export const projectMemberCreateSchema = z.object({
  projectId: z.string().uuid("Loyiha tanlanishi shart"),
  userId: z.string().uuid("Foydalanuvchi tanlanishi shart"),
  role: z.enum(["OWNER", "MANAGER", "MEMBER", "VIEWER"]).optional().default("MEMBER"),
});

export const projectMemberUpdateSchema = z.object({
  role: z.enum(["OWNER", "MANAGER", "MEMBER", "VIEWER"]).optional(),
});

export type ProjectMemberCreateInput = z.infer<typeof projectMemberCreateSchema>;
export type ProjectMemberUpdateInput = z.infer<typeof projectMemberUpdateSchema>;

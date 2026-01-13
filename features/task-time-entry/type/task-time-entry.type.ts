import { GlobalGetAllPaginationProps } from "@/types/global.types";

export interface TaskTimeEntryGetResponse {
  id: string;
  taskId: string;
  userId: string;
  description?: string;
  hours: number;
  date: Date;
  isBillable: boolean;
  user: {
    id: string;
    fullname: string;
  };
  task: {
    id: string;
    title: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskTimeEntryCreatePayload {
  taskId: string;
  description?: string;
  hours: number;
  date: string;
  isBillable?: boolean;
}

export interface TaskTimeEntryUpdatePayload {
  description?: string;
  hours?: number;
  date?: string;
  isBillable?: boolean;
}

export interface TaskTimeEntryQueryParams extends GlobalGetAllPaginationProps {
  taskId?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
  isBillable?: boolean;
}

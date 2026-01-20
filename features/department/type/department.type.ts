import { DataPagination } from "@/types/global.types";

// 2. Определяем точный тип данных для одного департамента
export interface DepartmentViewPropsData {
  id: string;
  name: string;
  description: string | null;
  parent: {
    id: string;
    name: string;
  } | null; // Родительский отдел может отсутствовать
  director: {
    id: string;
    fullname: string;
    username: string;
    avatarUrl: string | null;
  } | null; // Директор может быть не назначен
  code: string | null;
  location: string | null;
}

// 3. Обновляем интерфейс пропсов
export interface DepartmentViewProps {
  departament: DepartmentViewPropsData;
  onClose?: () => void;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  code: string;
  parentId: null | Department;
  directorId: string;
}

interface DepartmentParent {
  id: string;
  name: string;
}

interface DepartmentDirector {
  id: string;
  fullname: string;
  username: string;
  avatarUrl: string;
}

export interface DepartmentResponse {
  id: string;
  name: string;
  description: string;
  location: string;
  code: string;
  parent: DepartmentParent | null;
  director: DepartmentDirector | null;
}

export interface GetAllDepartments extends DataPagination {
  data: DepartmentResponse[];
}

export interface DepartmentQueryParams {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}

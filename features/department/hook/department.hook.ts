import { useMutation, useQueryClient } from "react-query";
import { createCRUDHooks } from "@/lib/crud-hooks";
import { departmentService } from "../service/department.service";
import {
  GetAllDepartments,
  DepartmentQueryParams,
  DepartmentResponse,
} from "../type/department.type";
import { DepartmentInferType } from "../schema/department.schema";
import { showError, showSuccess } from "@/utils/show-error";

const departmentHooks = createCRUDHooks<
  DepartmentResponse,
  DepartmentInferType,
  Partial<DepartmentInferType>,
  DepartmentQueryParams,
  GetAllDepartments
>({
  service: departmentService,
  queryKey: "departments",
  singleQueryKey: "department",
  messages: {
    created: "Bo'lim muvaffaqiyatli qo'shildi",
    updated: "Bo'lim muvaffaqiyatli yangilandi",
    deleted: "Bo'lim muvaffaqiyatli o'chirildi",
  },
});

export const useGetAllDepartments = (params?: DepartmentQueryParams) =>
  departmentHooks.useGetAll(params);

export const useGetDepartmentById = (id: string) =>
  departmentHooks.useGetById(id);

export const useCreateDepartment = departmentHooks.useCreate;

export const useUpdateDepartment = departmentHooks.useUpdate;

export const useDeleteDepartment = departmentHooks.useDelete;

export const useUpdateDepartmentParent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, parentId }: { id: string; parentId: string | null }) =>
      departmentService.update(id, { parentId } as Partial<DepartmentInferType>),
    onSuccess: () => {
      queryClient.invalidateQueries(["departments"]);
      showSuccess("Bo'lim muvaffaqiyatli ko'chirildi");
    },
    onError: showError,
  });
};

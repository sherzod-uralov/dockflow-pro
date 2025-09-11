import { useMutation, useQuery, useQueryClient } from "react-query";
import { permissionService } from "../service/permission.service";
import {
  getAllPermissions,
  Permission,
  PermissionQueryParams,
} from "../type/permission.type";
import { toast } from "sonner";

export const useCreatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Permission) =>
      permissionService.createPermission(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["permissions"]);
      toast.success("Ruxsat muvaffaqiyatli yaratildi");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });
};

export const useGetAllPermissions = (params?: PermissionQueryParams) => {
  return useQuery<getAllPermissions>({
    queryKey: ["permissions", params],
    queryFn: () => permissionService.getAllPermissions(params),
    keepPreviousData: true,
  });
};

        
          
          ,
      
        
          
          ,
      
        
          
          ,
      
        
          
          ,
      
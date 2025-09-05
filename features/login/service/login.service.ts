import {LoginBody} from "@/features/login/type/login.type";
import {endpoints} from "@/api/axios.endpoints";
import axiosInstance from "@/api/axios.instance";

export const authService = {
    login: async (data:LoginBody) => {
        try {
            const response = await axiosInstance.post(endpoints.auth.login,data);
            return response.data;
        }catch (error:any) {
            if(error.response.status === 401){
                throw new Error("login yoki parol noto'g'ri kiritilgan");
            }
        }
    },
    getProfile: async () => {
        try {
            const response = await axiosInstance.get(endpoints.auth.profile.list);
            return response.data;
        }catch (error) {
            throw error;
        }
    }
}
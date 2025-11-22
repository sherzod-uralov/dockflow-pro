import axios from "axios";
import { DocumentVerifyResponse } from "../type/view.type";
import AxiosInstance from "@/api/axios.instance";



export const viewService = {
  verifyDocument: async (id: string): Promise<DocumentVerifyResponse> => {
    const response = await AxiosInstance.get<DocumentVerifyResponse>(
      `/public/document/verify/${id}`
    );
    return response.data;
  },
};

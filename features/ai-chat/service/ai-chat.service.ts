import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";
import {
  AiChatResponse,
  AiHistoryMessage,
  AiClearHistoryResponse,
} from "../type/ai-chat.type";

export const aiChatService = {
  sendMessage: async (message: string): Promise<AiChatResponse> => {
    const { data } = await axiosInstance.post<AiChatResponse>(endpoints.ai.chat, {
      message,
    });
    return data;
  },

  getHistory: async (): Promise<AiHistoryMessage[]> => {
    const { data } = await axiosInstance.get<AiHistoryMessage[]>(endpoints.ai.history);
    return data;
  },

  clearHistory: async (): Promise<AiClearHistoryResponse> => {
    const { data } = await axiosInstance.delete<AiClearHistoryResponse>(
      endpoints.ai.history
    );
    return data;
  },
};

import axiosInstance from "@/api/axios.instance";
import { endpoints } from "@/api/axios.endpoints";

export interface TelegramLinkInfo {
    deepLink: string;
    userId: string;
    instructions: string;
}

export interface TelegramStatus {
    isLinked: boolean;
    telegramId?: string;
}

export const telegramService = {
    getLinkInfo: async (userId: string) => {
        const { data } = await axiosInstance.get<TelegramLinkInfo>(endpoints.user.telegram.linkInfo(userId));
        return data;
    },

    checkStatus: async (userId: string) => {
        const { data } = await axiosInstance.get<TelegramStatus>(endpoints.user.telegram.status(userId));
        return data;
    },
};

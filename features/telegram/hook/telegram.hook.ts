import { useQuery } from "react-query";
import { telegramService } from "../service/telegram.service";

export const useTelegramLinkInfo = (userId: string | undefined, options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ["telegram-link-info", userId],
        queryFn: () => telegramService.getLinkInfo(userId!),
        enabled: !!userId && (options?.enabled ?? true),
    });
};

export const useTelegramStatus = (userId: string | undefined, refetchInterval: number | false = false) => {
    return useQuery({
        queryKey: ["telegram-status", userId],
        queryFn: () => telegramService.checkStatus(userId!),
        enabled: !!userId,
        refetchInterval,
    });
};

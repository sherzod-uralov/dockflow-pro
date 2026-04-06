import { useQuery, useMutation, useQueryClient } from "react-query";
import { showError, showSuccess } from "@/utils/show-error";
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

export const useTelegramUnlink = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (userId: string) => telegramService.unlink(userId),
        onSuccess: (data, userId) => {
            queryClient.invalidateQueries(["telegram-status", userId]);
            queryClient.invalidateQueries(["telegram-link-info", userId]);
            showSuccess(data);
        },
        onError: showError,
    });
};

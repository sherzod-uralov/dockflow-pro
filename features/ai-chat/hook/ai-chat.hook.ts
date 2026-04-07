import { useMutation, useQuery, useQueryClient } from "react-query";
import { showError } from "@/utils/show-error";
import { aiChatService } from "../service/ai-chat.service";
import { AiHistoryMessage } from "../type/ai-chat.type";

const HISTORY_KEY = ["ai-chat-history"];

export const useGetChatHistory = (enabled = true) => {
  return useQuery<AiHistoryMessage[]>({
    queryKey: HISTORY_KEY,
    queryFn: () => aiChatService.getHistory(),
    enabled,
    staleTime: 30_000,
  });
};

export const useSendChatMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => aiChatService.sendMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries(HISTORY_KEY);
    },
    onError: showError,
  });
};

export const useClearChatHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => aiChatService.clearHistory(),
    onSuccess: () => {
      queryClient.setQueryData(HISTORY_KEY, []);
      queryClient.invalidateQueries(HISTORY_KEY);
    },
    onError: showError,
  });
};

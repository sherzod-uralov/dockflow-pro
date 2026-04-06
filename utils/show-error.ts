import { notifications } from "@mantine/notifications";

export function showError(error: any) {
  const raw =
    typeof error === "string"
      ? error
      : error?.response?.data?.message || error?.message;

  const message = Array.isArray(raw) ? raw[0] : raw || "Xatolik yuz berdi";

  notifications.show({
    message,
    color: "red",
  });
}

export function showSuccess(message: string) {
  notifications.show({
    message,
    color: "green",
  });
}
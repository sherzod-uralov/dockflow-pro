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

export function showSuccess(msgOrResponse: string | unknown) {
  let message: string;

  if (typeof msgOrResponse === "string") {
    message = msgOrResponse;
  } else if (
    msgOrResponse &&
    typeof msgOrResponse === "object" &&
    "message" in msgOrResponse
  ) {
    message = (msgOrResponse as { message: string }).message;
  } else {
    return;
  }

  notifications.show({
    message,
    color: "green",
  });
}
import { showError, showSuccess } from "./show-error";

export const handleCopyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showSuccess(`${label} nusxalandi!`);
  } catch (error) {
    showError(`${label} nusxalanmadi`);
  }
};

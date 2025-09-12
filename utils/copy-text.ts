import { toast } from "sonner";

export const handleCopyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} nusxalandi!`);
  } catch (error) {
    toast.error(`${label} nusxalanmadi`);
  }
};

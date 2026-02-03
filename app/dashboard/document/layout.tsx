import type { ReactNode } from "react";
import DocumentPage from "@/features/document/page/document.page";

export default function Layout({ children }: { children: ReactNode }) {
  return <DocumentPage>{children}</DocumentPage>;
}

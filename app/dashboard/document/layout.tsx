"use client";

import React, { FC, ReactNode } from "react";
import { DocumentPage } from "@/features/document";

const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <>
      <DocumentPage children={children} />
    </>
  );
};

export default Layout;

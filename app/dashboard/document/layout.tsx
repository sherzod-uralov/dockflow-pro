"use client";

import React, { FC, ReactElement } from "react";
import { DocumentPage } from "@/features/document";

const Layout: FC<{ children: ReactElement }> = ({ children }) => {
  return (
    <>
      <DocumentPage children={children} />
    </>
  );
};

export default Layout;

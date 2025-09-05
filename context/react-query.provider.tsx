"use client";

import React, { ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "react-query";

const ReactQueryProvider = ({ children }: { children: ReactElement }) => {
  const [queryClient] = React.useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

export default ReactQueryProvider;

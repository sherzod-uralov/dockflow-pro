import { useState, useEffect } from "react";

export const usePagination = (initialPage = 1) => {
  const getInitialSize = () => {
    if (typeof window === "undefined") return 9;

    const width = window.innerWidth;

    if (width < 640) return 5;
    if (width < 1024) return 7;
    if (width < 1536) return 12;
    return 12;
  };

  const [pageNumber, setPageNumber] = useState(initialPage);
  const [pageSize, setPageSize] = useState(getInitialSize);

  useEffect(() => {
    const handleResize = () => {
      const newSize = getInitialSize();
      if (newSize !== pageSize) {
        setPageSize(newSize);
        setPageNumber(1);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [pageSize]);

  const handlePageChange = (newPage: number) => setPageNumber(newPage);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1);
  };

  return { pageNumber, pageSize, handlePageChange, handlePageSizeChange };
};

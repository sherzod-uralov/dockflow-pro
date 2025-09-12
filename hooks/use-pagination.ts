import { useState } from "react";

export const usePagination = (initialPage = 1, initialSize = 7) => {
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);

  const handlePageChange = (newPage: number) => setPageNumber(newPage);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPageNumber(1);
  };

  return { pageNumber, pageSize, handlePageChange, handlePageSizeChange };
};

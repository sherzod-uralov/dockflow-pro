export interface DataPagination {
  count: number;
  pageNumber: number;
  pageSize: number;
  pageCount: number;
}

export interface GlobalGetAllPaginationProps {
  search?: string;
  pageSize?: number;
  pageNumber?: number;
}

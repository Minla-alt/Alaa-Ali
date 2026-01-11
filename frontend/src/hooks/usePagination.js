import { useState, useCallback, useMemo } from 'react';

export const usePagination = (initialPage = 1, initialLimit = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const nextPage = useCallback(() => {
    setCurrentPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToPage = useCallback((page) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1); // Reset to first page when limit changes
  }, []);

  const paginationInfo = useMemo(() => {
    return {
      currentPage,
      limit,
      hasNextPage: true, // This would be determined by actual API response
      hasPrevPage: currentPage > 1,
      startIndex: (currentPage - 1) * limit + 1,
      endIndex: currentPage * limit
    };
  }, [currentPage, limit]);

  return {
    currentPage,
    limit,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    paginationInfo
  };
};
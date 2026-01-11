import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  maxVisiblePages = 5 
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push('ellipsis');
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <nav className="flex items-center justify-between border-t border-secondary-200 px-4 sm:px-0 mt-8">
      <div className="-mt-px flex w-0 flex-1">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium ${
            currentPage === 1
              ? 'text-secondary-300 cursor-not-allowed'
              : 'text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
          }`}
        >
          <ChevronLeft className="mr-3 h-5 w-5" aria-hidden="true" />
          {t('common.previous')}
        </button>
      </div>
      <div className="hidden md:-mt-px md:flex">
        {getPageNumbers().map((page, index) => (
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-secondary-500"
            >
              <MoreHorizontal className="h-5 w-5" />
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium ${
                currentPage === page
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
              }`}
            >
              {page}
            </button>
          )
        ))}
      </div>
      <div className="-mt-px flex w-0 flex-1 justify-end">
        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium ${
            currentPage === totalPages
              ? 'text-secondary-300 cursor-not-allowed'
              : 'text-secondary-500 hover:border-secondary-300 hover:text-secondary-700'
          }`}
        >
          {t('common.next')}
          <ChevronRight className="ml-3 h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;

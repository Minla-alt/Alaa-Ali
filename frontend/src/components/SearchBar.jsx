import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SearchBar = ({ onSearch, initialValue = '', placeholder }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState(initialValue);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 h-5 text-secondary-400" />
      </div>
      <input
        type="text"
        className="block w-full pl-10 pr-10 py-2 border border-secondary-300 rounded-lg leading-5 bg-white placeholder-secondary-500 focus:outline-none focus:placeholder-secondary-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition duration-150 ease-in-out"
        placeholder={placeholder || t('common.search')}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-4 h-4 text-secondary-400 hover:text-secondary-600" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

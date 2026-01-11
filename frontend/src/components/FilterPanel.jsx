import React from 'react';
import { useTranslation } from 'react-i18next';
import { Filter, X, RotateCcw } from 'lucide-react';

const FilterPanel = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  subjects, 
  levels, 
  languages,
  isOpen,
  onClose
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const filterSection = (
    <div className="space-y-6">
      {/* Subject Filter */}
      <div>
        <label className="block text-sm font-semibold text-secondary-900 mb-3">
          {t('filters.subject')}
        </label>
        <div className="grid grid-cols-1 gap-2">
          {subjects.map((subject) => (
            <button
              key={subject.value}
              onClick={() => onFilterChange('subject', subject.value)}
              className={`text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                filters.subject === subject.value
                  ? 'bg-primary-50 text-primary-700 font-medium border border-primary-200'
                  : 'text-secondary-600 hover:bg-secondary-50 border border-transparent'
              }`}
            >
              {subject.label}
            </button>
          ))}
        </div>
      </div>

      {/* Level Filter */}
      {levels && (
        <div>
          <label className="block text-sm font-semibold text-secondary-900 mb-3">
            {t('filters.level')}
          </label>
          <div className="grid grid-cols-1 gap-2">
            {levels.map((level) => (
              <button
                key={level.value}
                onClick={() => onFilterChange('educationLevel', level.value)}
                className={`text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  filters.educationLevel === level.value
                    ? 'bg-primary-50 text-primary-700 font-medium border border-primary-200'
                    : 'text-secondary-600 hover:bg-secondary-50 border border-transparent'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Language Filter */}
      <div>
        <label className="block text-sm font-semibold text-secondary-900 mb-3">
          {t('filters.language')}
        </label>
        <div className="grid grid-cols-1 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => onFilterChange('language', lang.value)}
              className={`text-right px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                filters.language === lang.value
                  ? 'bg-primary-50 text-primary-700 font-medium border border-primary-200'
                  : 'text-secondary-600 hover:bg-secondary-50 border border-transparent'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Clear Button */}
      <button
        onClick={onClearFilters}
        className="w-full flex items-center justify-center space-x-2 space-x-reverse py-2.5 text-sm font-medium text-secondary-600 hover:text-primary-600 border border-secondary-200 rounded-lg hover:border-primary-200 hover:bg-primary-50 transition-all duration-200"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{t('common.clearFilters')}</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-xl border border-secondary-200 p-6">
          <div className="flex items-center space-x-2 space-x-reverse mb-6">
            <Filter className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-bold text-secondary-900">{t('common.filters')}</h2>
          </div>
          {filterSection}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        <div
          className={`absolute top-0 ${
            isRtl ? 'left-0' : 'right-0'
          } h-full w-80 bg-white shadow-xl transition-transform duration-300 transform ${
            isOpen ? 'translate-x-0' : isRtl ? '-translate-x-full' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-secondary-100">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Filter className="w-5 h-5 text-primary-600" />
                <h2 className="text-lg font-bold text-secondary-900">{t('common.filters')}</h2>
              </div>
              <button onClick={onClose} className="p-2 text-secondary-400 hover:text-secondary-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {filterSection}
            </div>
            <div className="p-4 border-t border-secondary-100">
              <button
                onClick={onClose}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors"
              >
                {t('common.showResults')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;

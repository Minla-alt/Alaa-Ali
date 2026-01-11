import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Calendar, Flag, BookOpen, GraduationCap } from 'lucide-react';

const TodoForm = ({ 
  todo = null, 
  onSubmit, 
  onCancel,
  savedContent = [] 
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    relatedContentId: '',
    relatedContentType: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (todo) {
      setFormData({
        title: todo.title || '',
        description: todo.description || '',
        priority: todo.priority || 'medium',
        dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : '',
        relatedContentId: todo.relatedContent?._id || '',
        relatedContentType: todo.relatedContent?.type || ''
      });
    }
  }, [todo]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = t('dashboard.todoTitleRequired');
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const todoData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      priority: formData.priority,
      dueDate: formData.dueDate || null,
      relatedContentId: formData.relatedContentId || null,
      relatedContentType: formData.relatedContentType || null
    };

    onSubmit(todoData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleContentSelect = (e) => {
    const value = e.target.value;
    if (!value) {
      setFormData(prev => ({ 
        ...prev, 
        relatedContentId: '', 
        relatedContentType: '' 
      }));
      return;
    }

    const [type, id] = value.split('_');
    setFormData(prev => ({ 
      ...prev, 
      relatedContentId: id, 
      relatedContentType: type 
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-secondary-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-secondary-900">
            {todo ? t('dashboard.editTodo') : t('dashboard.addNewTodo')}
          </h3>
          <button
            onClick={onCancel}
            className="text-secondary-400 hover:text-secondary-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              {t('dashboard.todoTitle')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t('dashboard.todoTitlePlaceholder')}
              className={`input w-full ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              {t('dashboard.todoDescription')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('dashboard.todoDescriptionPlaceholder')}
              rows="3"
              className="input w-full resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center space-x-2 space-x-reverse">
                <Flag className="w-4 h-4" />
                <span>{t('dashboard.todoPriority')}</span>
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="low">{t('dashboard.priority.low')}</option>
                <option value="medium">{t('dashboard.priority.medium')}</option>
                <option value="high">{t('dashboard.priority.high')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center space-x-2 space-x-reverse">
                <Calendar className="w-4 h-4" />
                <span>{t('dashboard.todoDueDate')}</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="input w-full"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {savedContent && savedContent.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2 flex items-center space-x-2 space-x-reverse">
                <BookOpen className="w-4 h-4" />
                <span>{t('dashboard.relatedContent')}</span>
              </label>
              <select
                value={formData.relatedContentId ? `${formData.relatedContentType}_${formData.relatedContentId}` : ''}
                onChange={handleContentSelect}
                className="input w-full"
              >
                <option value="">{t('dashboard.noRelatedContent')}</option>
                {savedContent.courses && savedContent.courses.length > 0 && (
                  <optgroup label={t('courses.title')}>
                    {savedContent.courses.map(course => (
                      <option key={course._id} value={`course_${course._id}`}>
                        {course.title}
                      </option>
                    ))}
                  </optgroup>
                )}
                {savedContent.books && savedContent.books.length > 0 && (
                  <optgroup label={t('books.title')}>
                    {savedContent.books.map(book => (
                      <option key={book._id} value={`book_${book._id}`}>
                        {book.title}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 space-x-reverse pt-4 border-t border-secondary-200">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              {todo ? t('common.save') : t('common.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoForm;

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle, Circle, Edit2, Trash2, Calendar, BookOpen, GraduationCap } from 'lucide-react';

const TodoItem = ({ 
  todo, 
  onComplete, 
  onEdit, 
  onDelete 
}) => {
  const { t, i18n } = useTranslation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-secondary-100 text-secondary-700 border-secondary-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !todo.completed;
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(todo._id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border transition-all duration-200 ${
        todo.completed 
          ? 'bg-green-50 border-green-200' 
          : isOverdue(todo.dueDate)
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-secondary-200 hover:border-secondary-300'
      }`}
    >
      <div className="flex items-start space-x-3 space-x-reverse">
        <button
          onClick={() => onComplete(todo._id)}
          className="flex-shrink-0 mt-1 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        >
          {todo.completed ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Circle className="w-5 h-5 text-secondary-400 hover:text-secondary-600 transition-colors" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h4
              className={`font-medium ${
                todo.completed 
                  ? 'line-through text-secondary-500' 
                  : 'text-secondary-900'
              }`}
            >
              {todo.title}
            </h4>
            <div className="flex items-center space-x-2 space-x-reverse ml-2 flex-shrink-0">
              <button
                onClick={() => onEdit(todo)}
                className="text-primary-600 hover:text-primary-700 p-1 rounded hover:bg-primary-50 transition-colors"
                title={t('common.edit')}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className={`p-1 rounded transition-colors ${
                  showDeleteConfirm
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                }`}
                title={showDeleteConfirm ? t('common.confirm') : t('common.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {todo.description && (
            <p className={`text-sm mb-2 ${
              todo.completed ? 'text-secondary-400' : 'text-secondary-600'
            }`}>
              {todo.description}
            </p>
          )}

          <div className="flex items-center flex-wrap gap-2">
            {todo.priority && (
              <span className={`text-xs px-2 py-1 rounded border font-medium ${getPriorityColor(todo.priority)}`}>
                {t(`dashboard.priority.${todo.priority}`)}
              </span>
            )}

            {todo.dueDate && (
              <span className={`text-xs px-2 py-1 rounded flex items-center space-x-1 space-x-reverse ${
                isOverdue(todo.dueDate)
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
              }`}>
                <Calendar className="w-3 h-3" />
                <span>{formatDate(todo.dueDate)}</span>
              </span>
            )}

            {todo.relatedContent && (
              <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700 border border-purple-200 flex items-center space-x-1 space-x-reverse">
                {todo.relatedContent.type === 'course' ? (
                  <GraduationCap className="w-3 h-3" />
                ) : (
                  <BookOpen className="w-3 h-3" />
                )}
                <span>{todo.relatedContent.title}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoItem;

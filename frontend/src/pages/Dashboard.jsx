import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { dashboardAPI } from '../api/dashboard';
import { 
  BookOpen, 
  GraduationCap, 
  Target, 
  Calendar, 
  Clock, 
  Star,
  CheckCircle,
  Circle,
  Plus,
  TrendingUp,
  Award,
  BookMarked
} from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [newTodo, setNewTodo] = useState('');

  const { data: stats, loading: statsLoading } = useApi(dashboardAPI.getStats);
  const { data: progress, loading: progressLoading } = useApi(dashboardAPI.getProgress);
  const { data: savedContent, loading: savedLoading } = useApi(dashboardAPI.getSavedContent);
  const { data: todos, loading: todosLoading, fetchData: refreshTodos } = useApi(dashboardAPI.getTodos);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    try {
      await dashboardAPI.createTodo({ title: newTodo, completed: false });
      setNewTodo('');
      refreshTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleToggleTodo = async (todoId) => {
    try {
      await dashboardAPI.toggleTodo(todoId);
      refreshTodos();
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId) => {
    try {
      await dashboardAPI.deleteTodo(todoId);
      refreshTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          {t('dashboard.welcome', 'Welcome back', { name: user?.name || user?.email })}
        </h1>
        <p className="text-primary-100">
          {t('dashboard.welcomeMessage', 'Continue your learning journey')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">
                {t('dashboard.totalCourses')}
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {stats?.totalCourses || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">
                {t('dashboard.totalBooks')}
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {stats?.totalBooks || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Target className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">
                {t('dashboard.studyStreak')}
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {stats?.studyStreak || 0} {t('common.days', 'days')}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 mr-4">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-secondary-600">
                {t('dashboard.completedItems')}
              </p>
              <p className="text-2xl font-bold text-secondary-900">
                {stats?.completedItems || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            {t('dashboard.recentActivity')}
          </h3>
          {statsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-secondary-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recentActivity?.length > 0 ? (
                stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3 space-x-reverse">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <BookMarked className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-secondary-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {activity.item}
                      </p>
                    </div>
                    <span className="text-xs text-secondary-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-secondary-500 text-sm">
                  {t('dashboard.noActivity')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            {t('dashboard.quickActions')}
          </h3>
          <div className="space-y-3">
            <a
              href="/courses"
              className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-secondary-900">
                {t('courses.title')}
              </span>
            </a>
            <a
              href="/books"
              className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-secondary-900">
                {t('books.title')}
              </span>
            </a>
            <a
              href="/ai-assistant"
              className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-secondary-900">
                {t('recommendations.title')}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTodos = () => (
    <div className="space-y-6">
      {/* Add Todo Form */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          {t('dashboard.addTodo')}
        </h3>
        <form onSubmit={handleAddTodo} className="flex space-x-4 space-x-reverse">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder={t('dashboard.todoPlaceholder')}
            className="flex-1 input"
          />
          <button
            type="submit"
            className="btn-primary flex items-center space-x-2 space-x-reverse"
          >
            <Plus className="w-4 h-4" />
            <span>{t('common.add')}</span>
          </button>
        </form>
      </div>

      {/* Todo List */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          {t('dashboard.todos')}
        </h3>
        {todosLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-secondary-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {todos?.length > 0 ? (
              todos.map((todo) => (
                <div
                  key={todo._id}
                  className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg border ${
                    todo.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-secondary-200'
                  }`}
                >
                  <button
                    onClick={() => handleToggleTodo(todo._id)}
                    className="flex-shrink-0"
                  >
                    {todo.completed ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-secondary-400 hover:text-secondary-600" />
                    )}
                  </button>
                  <span
                    className={`flex-1 ${
                      todo.completed 
                        ? 'line-through text-secondary-500' 
                        : 'text-secondary-900'
                    }`}
                  >
                    {todo.title}
                  </span>
                  <button
                    onClick={() => handleDeleteTodo(todo._id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              ))
            ) : (
              <p className="text-secondary-500 text-center py-8">
                {t('dashboard.noTodos')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderSavedContent = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          {t('dashboard.savedItems')}
        </h3>
        {savedLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-secondary-200 rounded animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedContent?.courses?.map((course) => (
              <div key={course._id} className="border border-secondary-200 rounded-lg p-4">
                <h4 className="font-medium text-secondary-900 mb-2">{course.title}</h4>
                <p className="text-sm text-secondary-600 mb-3">{course.description}</p>
                <a
                  href={`/courses/${course._id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {t('courses.viewDetails')}
                </a>
              </div>
            ))}
            {savedContent?.books?.map((book) => (
              <div key={book._id} className="border border-secondary-200 rounded-lg p-4">
                <h4 className="font-medium text-secondary-900 mb-2">{book.title}</h4>
                <p className="text-sm text-secondary-600 mb-3">{book.author}</p>
                <a
                  href={`/books/${book._id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  {t('books.viewDetails')}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { key: 'overview', label: t('dashboard.stats'), icon: TrendingUp },
    { key: 'todos', label: t('dashboard.todos'), icon: CheckCircle },
    { key: 'saved', label: t('dashboard.savedItems'), icon: Star }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-secondary-900 mb-2">
          {t('dashboard.title')}
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-secondary-200 mb-6">
        <nav className="-mb-px flex space-x-8 space-x-reverse">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center space-x-2 space-x-reverse py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'todos' && renderTodos()}
        {activeTab === 'saved' && renderSavedContent()}
      </div>
    </div>
  );
};

export default Dashboard;
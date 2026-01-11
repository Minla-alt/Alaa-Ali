import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import { dashboardAPI } from '../api/dashboard';
import { 
  BookOpen, 
  GraduationCap, 
  Target, 
  Clock, 
  CheckCircle,
  Plus,
  TrendingUp,
  Award,
  BookMarked,
  BarChart3,
  Filter,
  Grid3x3,
  List,
  Flame
} from 'lucide-react';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import StatCard from '../components/StatCard';
import ProgressItem from '../components/ProgressItem';
import TodoItem from '../components/TodoItem';
import TodoForm from '../components/TodoForm';
import SavedContentCard from '../components/SavedContentCard';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [todoFilter, setTodoFilter] = useState('all');
  const [progressFilter, setProgressFilter] = useState('all');
  const [savedFilter, setSavedFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [progressSort, setProgressSort] = useState('recent');

  const { data: stats, loading: statsLoading, error: statsError, fetchData: refreshStats } = useApi(dashboardAPI.getStats);
  const { data: progress, loading: progressLoading, error: progressError, fetchData: refreshProgress } = useApi(dashboardAPI.getProgress);
  const { data: savedContent, loading: savedLoading, error: savedError, fetchData: refreshSaved } = useApi(dashboardAPI.getSavedContent);
  const { data: todos, loading: todosLoading, error: todosError, fetchData: refreshTodos } = useApi(dashboardAPI.getTodos);

  const handleAddTodo = () => {
    setEditingTodo(null);
    setShowTodoForm(true);
  };

  const handleEditTodo = (todo) => {
    setEditingTodo(todo);
    setShowTodoForm(true);
  };

  const handleSubmitTodo = async (todoData) => {
    try {
      if (editingTodo) {
        await dashboardAPI.updateTodo(editingTodo._id, todoData);
      } else {
        await dashboardAPI.createTodo(todoData);
      }
      setShowTodoForm(false);
      setEditingTodo(null);
      refreshTodos();
    } catch (error) {
      console.error('Error saving todo:', error);
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

  const handleRemoveSaved = async (itemId, type) => {
    try {
      refreshSaved();
    } catch (error) {
      console.error('Error removing saved item:', error);
    }
  };

  const getFilteredTodos = () => {
    if (!todos) return [];
    switch (todoFilter) {
      case 'pending':
        return todos.filter(todo => !todo.completed);
      case 'completed':
        return todos.filter(todo => todo.completed);
      default:
        return todos;
    }
  };

  const getFilteredProgress = () => {
    if (!progress) return [];
    let filtered = [...progress];
    
    if (progressFilter !== 'all') {
      filtered = filtered.filter(item => item.type === progressFilter);
    }

    switch (progressSort) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));
        break;
      case 'progress-asc':
        filtered.sort((a, b) => a.percentage - b.percentage);
        break;
      case 'progress-desc':
        filtered.sort((a, b) => b.percentage - a.percentage);
        break;
      default:
        break;
    }

    return filtered;
  };

  const getFilteredSaved = () => {
    if (!savedContent) return { courses: [], books: [] };
    
    switch (savedFilter) {
      case 'courses':
        return { courses: savedContent.courses || [], books: [] };
      case 'books':
        return { courses: [], books: savedContent.books || [] };
      default:
        return savedContent;
    }
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-lg p-6 md:p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              {t('dashboard.welcome', { name: user?.name || user?.email?.split('@')[0] })}
            </h1>
            <p className="text-primary-100 text-lg">
              {t('dashboard.welcomeMessage')}
            </p>
          </div>
          <Flame className="w-16 h-16 text-yellow-300 hidden md:block" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard
          icon={BookMarked}
          title={t('dashboard.totalSavedItems')}
          value={(stats?.totalCourses || 0) + (stats?.totalBooks || 0)}
          color="blue"
          subtitle={t('dashboard.savedSubtitle')}
          onClick={() => setActiveTab('saved')}
        />
        <StatCard
          icon={TrendingUp}
          title={t('dashboard.learningProgress')}
          value={`${stats?.averageProgress || 0}%`}
          color="green"
          subtitle={t('dashboard.progressSubtitle')}
          onClick={() => setActiveTab('progress')}
        />
        <StatCard
          icon={Award}
          title={t('dashboard.completedItems')}
          value={stats?.completedItems || 0}
          color="purple"
          subtitle={t('dashboard.completedSubtitle')}
        />
        <StatCard
          icon={Flame}
          title={t('dashboard.studyStreak')}
          value={`${stats?.studyStreak || 0} ${t('common.days')}`}
          color="orange"
          subtitle={t('dashboard.streakSubtitle')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2 space-x-reverse">
              <BarChart3 className="w-5 h-5" />
              <span>{t('dashboard.learningOverview')}</span>
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-blue-100 rounded">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <span className="font-medium text-secondary-900">{t('dashboard.totalCourses')}</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">{stats?.totalCourses || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-green-100 rounded">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <span className="font-medium text-secondary-900">{t('dashboard.totalBooks')}</span>
              </div>
              <span className="text-2xl font-bold text-green-600">{stats?.totalBooks || 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="p-2 bg-purple-100 rounded">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <span className="font-medium text-secondary-900">{t('dashboard.learningHours')}</span>
              </div>
              <span className="text-2xl font-bold text-purple-600">{stats?.learningHours || 0}{t('common.h')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            {t('dashboard.recentActivity')}
          </h3>
          {statsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-secondary-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : stats?.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.slice(0, 4).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 space-x-reverse p-2 rounded hover:bg-secondary-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookMarked className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-secondary-500 truncate">
                      {activity.item}
                    </p>
                  </div>
                  <span className="text-xs text-secondary-400 flex-shrink-0">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookMarked className="w-12 h-12 text-secondary-300 mx-auto mb-2" />
              <p className="text-secondary-500 text-sm">{t('dashboard.noActivity')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">
          {t('dashboard.quickActions')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <a
            href="/courses"
            className="flex items-center space-x-3 space-x-reverse p-4 rounded-lg border border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <GraduationCap className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-secondary-900 group-hover:text-primary-600">
              {t('courses.title')}
            </span>
          </a>
          <a
            href="/books"
            className="flex items-center space-x-3 space-x-reverse p-4 rounded-lg border border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <BookOpen className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-secondary-900 group-hover:text-primary-600">
              {t('books.title')}
            </span>
          </a>
          <a
            href="/ai-assistant"
            className="flex items-center space-x-3 space-x-reverse p-4 rounded-lg border border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-secondary-900 group-hover:text-primary-600">
              {t('recommendations.title')}
            </span>
          </a>
          <button
            onClick={() => setActiveTab('todos')}
            className="flex items-center space-x-3 space-x-reverse p-4 rounded-lg border border-secondary-200 hover:border-primary-500 hover:bg-primary-50 transition-all group"
          >
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-secondary-900 group-hover:text-primary-600">
              {t('dashboard.todos')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => {
    const filteredProgress = getFilteredProgress();

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2 space-x-reverse">
              <TrendingUp className="w-5 h-5" />
              <span>{t('dashboard.progressTracking')}</span>
            </h3>
            <div className="flex items-center space-x-3 space-x-reverse w-full sm:w-auto">
              <select
                value={progressFilter}
                onChange={(e) => setProgressFilter(e.target.value)}
                className="input text-sm flex-1 sm:flex-initial"
              >
                <option value="all">{t('dashboard.allContent')}</option>
                <option value="course">{t('courses.title')}</option>
                <option value="book">{t('books.title')}</option>
              </select>
              <select
                value={progressSort}
                onChange={(e) => setProgressSort(e.target.value)}
                className="input text-sm flex-1 sm:flex-initial"
              >
                <option value="recent">{t('dashboard.sortRecent')}</option>
                <option value="progress-asc">{t('dashboard.sortProgressAsc')}</option>
                <option value="progress-desc">{t('dashboard.sortProgressDesc')}</option>
              </select>
            </div>
          </div>
        </div>

        {progressLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 bg-secondary-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : progressError ? (
          <ErrorMessage message={progressError.message} onRetry={refreshProgress} />
        ) : filteredProgress.length > 0 ? (
          <div className="space-y-4">
            {filteredProgress.map((item) => (
              <ProgressItem
                key={item._id}
                id={item.contentId}
                title={item.title}
                type={item.type}
                percentage={item.percentage || 0}
                lastAccessed={item.lastAccessed}
                subject={item.subject}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-12 text-center">
            <TrendingUp className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {t('dashboard.noProgress')}
            </h3>
            <p className="text-secondary-600 mb-6">
              {t('dashboard.noProgressText')}
            </p>
            <a href="/courses" className="btn-primary inline-flex items-center space-x-2 space-x-reverse">
              <GraduationCap className="w-4 h-4" />
              <span>{t('dashboard.exploreCourses')}</span>
            </a>
          </div>
        )}
      </div>
    );
  };

  const renderSavedContent = () => {
    const filteredSaved = getFilteredSaved();
    const allItems = [...(filteredSaved.courses || []), ...(filteredSaved.books || [])];

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2 space-x-reverse">
              <BookMarked className="w-5 h-5" />
              <span>{t('dashboard.savedItems')}</span>
            </h3>
            <div className="flex items-center space-x-3 space-x-reverse w-full sm:w-auto">
              <div className="flex items-center space-x-2 space-x-reverse bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setSavedFilter('all')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    savedFilter === 'all' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  {t('dashboard.all')}
                </button>
                <button
                  onClick={() => setSavedFilter('courses')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    savedFilter === 'courses' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  {t('courses.title')}
                </button>
                <button
                  onClick={() => setSavedFilter('books')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    savedFilter === 'books' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  {t('books.title')}
                </button>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                  title={t('dashboard.gridView')}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                  title={t('dashboard.listView')}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {savedLoading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-secondary-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : savedError ? (
          <ErrorMessage message={savedError.message} onRetry={refreshSaved} />
        ) : allItems.length > 0 ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-4`}>
            {filteredSaved.courses?.map((course) => (
              <SavedContentCard
                key={course._id}
                item={course}
                type="course"
                onRemove={handleRemoveSaved}
              />
            ))}
            {filteredSaved.books?.map((book) => (
              <SavedContentCard
                key={book._id}
                item={book}
                type="book"
                onRemove={handleRemoveSaved}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-12 text-center">
            <BookMarked className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {t('dashboard.noSavedItems')}
            </h3>
            <p className="text-secondary-600 mb-6">
              {t('dashboard.noSavedItemsText')}
            </p>
            <div className="flex items-center justify-center space-x-4 space-x-reverse">
              <a href="/courses" className="btn-primary inline-flex items-center space-x-2 space-x-reverse">
                <GraduationCap className="w-4 h-4" />
                <span>{t('courses.title')}</span>
              </a>
              <a href="/books" className="btn-secondary inline-flex items-center space-x-2 space-x-reverse">
                <BookOpen className="w-4 h-4" />
                <span>{t('books.title')}</span>
              </a>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTodos = () => {
    const filteredTodos = getFilteredTodos();

    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2 space-x-reverse">
              <CheckCircle className="w-5 h-5" />
              <span>{t('dashboard.todos')}</span>
            </h3>
            <div className="flex items-center space-x-3 space-x-reverse w-full sm:w-auto">
              <div className="flex items-center space-x-2 space-x-reverse bg-secondary-100 rounded-lg p-1 flex-1 sm:flex-initial">
                <button
                  onClick={() => setTodoFilter('all')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    todoFilter === 'all' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  {t('dashboard.all')}
                </button>
                <button
                  onClick={() => setTodoFilter('pending')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    todoFilter === 'pending' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  {t('dashboard.pending')}
                </button>
                <button
                  onClick={() => setTodoFilter('completed')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    todoFilter === 'completed' ? 'bg-white text-primary-600 shadow-sm' : 'text-secondary-600 hover:text-secondary-900'
                  }`}
                >
                  {t('dashboard.completed')}
                </button>
              </div>
              <button
                onClick={handleAddTodo}
                className="btn-primary flex items-center space-x-2 space-x-reverse px-4 py-2"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('dashboard.addNewTodo')}</span>
                <span className="sm:hidden">{t('common.add')}</span>
              </button>
            </div>
          </div>
        </div>

        {todosLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-secondary-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : todosError ? (
          <ErrorMessage message={todosError.message} onRetry={refreshTodos} />
        ) : filteredTodos.length > 0 ? (
          <div className="space-y-3">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onComplete={handleToggleTodo}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">
              {todoFilter === 'completed' ? t('dashboard.noCompletedTodos') : t('dashboard.noTodos')}
            </h3>
            <p className="text-secondary-600 mb-6">
              {todoFilter === 'completed' ? t('dashboard.noCompletedTodosText') : t('dashboard.noTodosText')}
            </p>
            {todoFilter !== 'completed' && (
              <button onClick={handleAddTodo} className="btn-primary inline-flex items-center space-x-2 space-x-reverse">
                <Plus className="w-4 h-4" />
                <span>{t('dashboard.addFirstTodo')}</span>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  const tabs = [
    { key: 'overview', label: t('dashboard.overview'), icon: BarChart3 },
    { key: 'progress', label: t('dashboard.progress'), icon: TrendingUp },
    { key: 'saved', label: t('dashboard.savedItems'), icon: BookMarked },
    { key: 'todos', label: t('dashboard.todos'), icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <div className="mb-6">
          <div className="border-b border-secondary-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 space-x-reverse overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center space-x-2 space-x-reverse py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
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
        </div>

        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'progress' && renderProgress()}
          {activeTab === 'saved' && renderSavedContent()}
          {activeTab === 'todos' && renderTodos()}
        </div>
      </div>

      {showTodoForm && (
        <TodoForm
          todo={editingTodo}
          onSubmit={handleSubmitTodo}
          onCancel={() => {
            setShowTodoForm(false);
            setEditingTodo(null);
          }}
          savedContent={savedContent}
        />
      )}
    </div>
  );
};

export default DashboardPage;

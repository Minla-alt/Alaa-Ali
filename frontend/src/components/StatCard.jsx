import React from 'react';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  color = 'blue', 
  onClick, 
  subtitle,
  href 
}) => {
  const navigate = useNavigate();

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600'
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (href) {
      navigate(href);
    }
  };

  const isClickable = onClick || href;

  return (
    <div
      onClick={isClickable ? handleClick : undefined}
      className={`bg-white rounded-lg shadow-sm border border-secondary-200 p-6 transition-all duration-200 ${
        isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colorClasses[color]} mr-4`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-secondary-600 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-secondary-900">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-secondary-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

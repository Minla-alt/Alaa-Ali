import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ size = 'medium', message = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} text-primary-600 animate-spin mb-2`} />
      <p className="text-secondary-600 text-sm">{message}</p>
    </div>
  );
};

export default Loading;
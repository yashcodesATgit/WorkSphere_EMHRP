import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Something went wrong', 
  message = 'An error occurred while loading the data. Please try again.',
  onRetry 
}) => {
  return (
    <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-red-400 dark:text-red-500" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-300">{title}</h3>
          <div className="mt-2 text-sm text-red-700 dark:text-red-400">
            <p>{message}</p>
          </div>
          {onRetry && (
            <div className="mt-4">
              <Button 
                variant="danger" 
                size="sm" 
                onClick={onRetry}
                className="flex items-center gap-2 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-800/50 dark:text-red-200 dark:hover:bg-red-800"
              >
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorState;

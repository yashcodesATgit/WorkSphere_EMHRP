
const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center h-full w-full min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 dark:border-brand-400"></div>
    </div>
  );
};

export default LoadingSpinner;

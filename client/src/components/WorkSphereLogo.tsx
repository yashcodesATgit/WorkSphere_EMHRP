interface WorkSphereLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const WorkSphereLogo = ({ size = 'md', showText = true, className = '' }: WorkSphereLogoProps) => {
  const sizeClasses = {
    sm: { icon: 'w-7 h-7', text: 'text-lg', box: 'w-7 h-7' },
    md: { icon: 'w-9 h-9', text: 'text-xl sm:text-2xl', box: 'w-9 h-9' },
    lg: { icon: 'w-11 h-11', text: 'text-2xl sm:text-3xl', box: 'w-11 h-11' },
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Industrial Brand SVG Symbol */}
      <div className={`${sizeClasses.box} rounded-xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 flex items-center justify-center shadow-md border border-brand-500/30 flex-shrink-0 relative overflow-hidden group`}>
        {/* Decorative inner gradient shine */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className={`${sizeClasses.icon} p-1 text-white`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Interlocking geometric workplace nodes / 'W' motif */}
          <path 
            d="M4 6L8 18L12 9L16 18L20 6" 
            stroke="currentColor" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <circle cx="4" cy="6" r="1.5" fill="#38BDF8" />
          <circle cx="12" cy="9" r="1.5" fill="#38BDF8" />
          <circle cx="20" cy="6" r="1.5" fill="#38BDF8" />
          <circle cx="8" cy="18" r="1.5" fill="#818CF8" />
          <circle cx="16" cy="18" r="1.5" fill="#818CF8" />
        </svg>
      </div>

      {showText && (
        <span className={`font-extrabold text-gray-900 dark:text-white tracking-tight ${sizeClasses.text}`}>
          Work<span className="text-brand-600 dark:text-brand-400">Sphere</span>
        </span>
      )}
    </div>
  );
};

export default WorkSphereLogo;

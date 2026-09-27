import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, Sun, Moon, Bell, UserCircle, LogOut, ChevronDown, X } from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import Button from './Button';
import WorkSphereLogo from './WorkSphereLogo';
import LoginModal from './LoginModal';

const Navbar = () => {
  const { toggleSidebar, isDarkMode, toggleDarkMode } = useUIStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const displayName = user?.name ?? 'Guest';
  const displayRole = user?.role ?? '';
  const canManage = displayRole === 'ADMIN' || displayRole === 'HR';
  
  const isPublicRoute = location.pathname === '/' || location.pathname === '/login';

  return (
    <>
      <header className="h-16 lg:h-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b-2 border-brand-500 dark:border-brand-500 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-50 sticky top-0 shadow-sm transition-all duration-300 flex-shrink-0">
        
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle (Only in dashboard) */}
          {isAuthenticated && !isPublicRoute && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 lg:hidden focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <span className="sr-only">Toggle sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
          )}
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center cursor-pointer hover:opacity-90 transition-opacity" onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' })}}>
            <WorkSphereLogo size="md" />
          </div>
        </div>

        {/* Nav Links - Desktop */}
        <div className="hidden lg:flex items-center space-x-1 xl:space-x-4">
          {isPublicRoute && !isAuthenticated ? (
            <>
              <a 
                href="/#features" 
                className="px-3 xl:px-4 py-2 text-sm xl:text-lg font-semibold text-gray-700 dark:text-gray-200 rounded-md hover:underline underline-offset-4 decoration-2 decoration-brand-600 dark:decoration-brand-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all"
              >
                Features
              </a>
              <a 
                href="/#modules" 
                className="px-3 xl:px-4 py-2 text-sm xl:text-lg font-semibold text-gray-700 dark:text-gray-200 rounded-md hover:underline underline-offset-4 decoration-2 decoration-brand-600 dark:decoration-brand-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all"
              >
                Modules
              </a>
              <a 
                href="/#workflow" 
                className="px-3 xl:px-4 py-2 text-sm xl:text-lg font-semibold text-gray-700 dark:text-gray-200 rounded-md hover:underline underline-offset-4 decoration-2 decoration-brand-600 dark:decoration-brand-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all"
              >
                Workflow
              </a>
            </>
          ) : (
            isAuthenticated && (
              <>
                <button 
                  onClick={() => navigate('/dashboard')} 
                  className={`px-2.5 xl:px-3.5 py-2 text-sm xl:text-base font-semibold rounded-md hover:underline underline-offset-4 decoration-2 decoration-brand-600 dark:decoration-brand-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all ${
                    location.pathname === '/dashboard' 
                      ? 'text-brand-600 dark:text-brand-400 font-bold underline bg-brand-50/50 dark:bg-brand-900/30' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Dashboard
                </button>
                {canManage && (
                  <>
                    <button 
                      onClick={() => navigate('/employees')} 
                      className={`px-2.5 xl:px-3.5 py-2 text-sm xl:text-base font-semibold rounded-md hover:underline underline-offset-4 decoration-2 decoration-brand-600 dark:decoration-brand-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all ${
                        location.pathname.startsWith('/employees') 
                          ? 'text-brand-600 dark:text-brand-400 font-bold underline bg-brand-50/50 dark:bg-brand-900/30' 
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      Employees
                    </button>
                    <button 
                      onClick={() => navigate('/departments')} 
                      className={`px-2.5 xl:px-3.5 py-2 text-sm xl:text-base font-semibold rounded-md hover:underline underline-offset-4 decoration-2 decoration-brand-600 dark:decoration-brand-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all ${
                        location.pathname === '/departments' 
                          ? 'text-brand-600 dark:text-brand-400 font-bold underline bg-brand-50/50 dark:bg-brand-900/30' 
                          : 'text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      Departments
                    </button>
                  </>
                )}
                <button 
                  onClick={() => navigate('/attendance')} 
                  className={`px-2.5 xl:px-3.5 py-2 text-sm xl:text-base font-semibold rounded-md hover:underline underline-offset-4 decoration-2 decoration-brand-600 dark:decoration-brand-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all ${
                    location.pathname === '/attendance' 
                      ? 'text-brand-600 dark:text-brand-400 font-bold underline bg-brand-50/50 dark:bg-brand-900/30' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Attendance
                </button>
                <button 
                  onClick={() => navigate('/leave')} 
                  className={`px-2.5 xl:px-3.5 py-2 text-sm xl:text-base font-semibold rounded-md hover:underline underline-offset-4 decoration-2 decoration-brand-600 dark:decoration-brand-400 hover:bg-gray-100/60 dark:hover:bg-gray-800/60 transition-all ${
                    location.pathname === '/leave' 
                      ? 'text-brand-600 dark:text-brand-400 font-bold underline bg-brand-50/50 dark:bg-brand-900/30' 
                      : 'text-gray-700 dark:text-gray-200'
                  }`}
                >
                  Leave
                </button>
              </>
            )
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Theme toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 transition-all focus:outline-none shrink-0"
          >
            <span className="sr-only">Toggle theme</span>
            {isDarkMode ? <Sun className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" /> : <Moon className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* If on public route, show Dashboard button */}
              {isPublicRoute && (
                <Button onClick={() => navigate('/dashboard')} variant="primary" size="sm" className="hidden sm:flex font-semibold px-4 py-2 hover:underline">
                  Dashboard
                </Button>
              )}
              
              {/* Notifications */}
              {!isPublicRoute && (
                <button className="p-2.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 relative transition-all focus:outline-none shrink-0">
                  <span className="sr-only">Notifications</span>
                  <Bell className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
                  <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-800" />
                </button>
              )}

              {/* Profile dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-1 sm:gap-2 rounded-md px-1 sm:px-2.5 py-1.5 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:underline underline-offset-4 decoration-2 transition-all focus:outline-none"
                >
                  <UserCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0" />
                  <span className="hidden sm:block font-medium truncate max-w-[90px] md:max-w-[140px]">{displayName}</span>
                  <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400 flex-shrink-0" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-1 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{displayName}</p>
                      {displayRole && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{displayRole}</p>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:underline transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setIsLoginOpen(true)} 
                variant="primary" 
                size="sm"
                className="text-sm sm:text-base font-semibold px-4 py-1.5 hover:underline shrink-0"
              >
                Login
              </Button>
              {isPublicRoute && (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 lg:hidden rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-700 focus:outline-none shrink-0"
                >
                  <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Mobile Public Menu Overlay */}
      {isPublicRoute && !isAuthenticated && mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-gray-900 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <WorkSphereLogo size="sm" />
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-col p-6 space-y-6 text-lg font-medium text-gray-900 dark:text-white">
            <a href="/#features" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="/#modules" onClick={() => setMobileMenuOpen(false)}>Modules</a>
            <a href="/#workflow" onClick={() => setMobileMenuOpen(false)}>Workflow</a>
            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button onClick={() => { setMobileMenuOpen(false); setIsLoginOpen(true); }} variant="primary" className="w-full justify-center">
                Login to WorkSphere
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Role Selection Login Modal */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
      />
    </>
  );
};

export default Navbar;

import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard, Users, Building2, CalendarCheck,
  CalendarOff, Banknote, LineChart, X,
} from 'lucide-react';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';

const allNavItems = [
  { name: 'Dashboard',   to: '/dashboard',   icon: LayoutDashboard, roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { name: 'Employees',   to: '/employees',   icon: Users,           roles: ['ADMIN', 'HR'] },
  { name: 'Departments', to: '/departments', icon: Building2,       roles: ['ADMIN', 'HR'] },
  { name: 'Attendance',  to: '/attendance',  icon: CalendarCheck,   roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { name: 'Leave',       to: '/leave',       icon: CalendarOff,     roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { name: 'Payroll',     to: '/payroll',     icon: Banknote,        roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
  { name: 'Performance', to: '/performance', icon: LineChart,       roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
];

const Sidebar = () => {
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const navigation = allNavItems.filter(
    (item) => !user?.role || item.roles.includes(user.role)
  );

  // Auto-open on desktop, auto-close on mobile
  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarOpen]);

  // Close on mobile when navigating
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname, setSidebarOpen]);

  return (
    <>
      {/* Backdrop — mobile only */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col w-64
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          transition-transform duration-200 ease-in-out
          lg:relative lg:translate-x-0 lg:flex
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Mobile close button */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Menu</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/50 dark:text-brand-400'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50'
                  }`
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

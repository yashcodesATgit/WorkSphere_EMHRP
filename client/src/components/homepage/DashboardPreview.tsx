import { Users, CalendarCheck, Clock, Banknote, ShieldCheck } from 'lucide-react';
import WorkSphereLogo from '../WorkSphereLogo';

const DashboardPreview = () => {
  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-2xl transform transition-transform hover:-translate-y-1 hover:shadow-3xl">
      {/* Mock Browser Header */}
      <div className="h-8 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
      </div>

      <div className="flex h-[400px]">
        {/* Mock Sidebar */}
        <div className="hidden sm:block w-48 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <WorkSphereLogo size="sm" />
          </div>
          
          <div className="space-y-2">
            {[
              { icon: Users, label: 'Dashboard', active: true },
              { icon: Users, label: 'Employees' },
              { icon: CalendarCheck, label: 'Attendance' },
              { icon: Clock, label: 'Leaves' },
              { icon: Banknote, label: 'Payroll' },
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium ${item.active ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'text-gray-600 dark:text-gray-400'}`}>
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Mock Content Area */}
        <div className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-none">Dashboard</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Overview of your organization</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="w-6 h-6 rounded bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center mb-2">
                <Users className="w-3 h-3 text-brand-600 dark:text-brand-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Employees</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">142</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="w-6 h-6 rounded bg-green-50 dark:bg-green-900/40 flex items-center justify-center mb-2">
                <CalendarCheck className="w-3 h-3 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Present Today</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">138</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-3">Recent Leave Applications</h3>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div>
                      <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                      <div className="h-1.5 w-12 bg-gray-100 dark:bg-gray-800 rounded"></div>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded text-[10px] font-medium bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                    PENDING
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;

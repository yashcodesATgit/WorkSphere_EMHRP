import { useState } from 'react';
import { ArrowRight, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import LoginForm from '../components/LoginForm';
import WorkSphereLogo from '../components/WorkSphereLogo';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<'ADMIN_HR' | 'EMPLOYEE' | null>(null);

  return (
    <div className="h-full w-full overflow-y-auto bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand */}
        <div className="flex items-center justify-center mb-8">
          <WorkSphereLogo size="lg" />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-2xl p-6 sm:p-8">
          {selectedRole === null ? (
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Choose your workspace
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Select your role to proceed to sign in
                </p>
              </div>

              <div className="space-y-3">
                {/* Admin / HR */}
                <button
                  onClick={() => setSelectedRole('ADMIN_HR')}
                  className="group w-full flex items-center justify-between p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-900/20 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Admin / HR</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manage workforce operations</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Employee */}
                <button
                  onClick={() => setSelectedRole('EMPLOYEE')}
                  className="group w-full flex items-center justify-between p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-900/20 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">Employee</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Access your personal HR workspace</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <button 
                onClick={() => setSelectedRole(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to workspace selection
              </button>

              <LoginForm 
                title={selectedRole === 'ADMIN_HR' ? 'Admin / HR Login' : 'Employee Login'}
                description={selectedRole === 'ADMIN_HR' ? 'Sign in to manage your workforce.' : 'Sign in to access your HR workspace.'}
              />
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-gray-400 dark:text-gray-600">
          WorkSphere HR Management System
        </p>
      </div>
    </div>
  );
};

export default Login;

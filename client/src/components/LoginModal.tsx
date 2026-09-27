import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, ShieldCheck, UserCheck } from 'lucide-react';
import LoginForm from './LoginForm';
import WorkSphereLogo from './WorkSphereLogo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: 'ADMIN_HR' | 'EMPLOYEE' | null;
}

const LoginModal = ({ isOpen, onClose, initialRole = null }: LoginModalProps) => {
  const [selectedRole, setSelectedRole] = useState<'ADMIN_HR' | 'EMPLOYEE' | null>(initialRole);

  useEffect(() => {
    setSelectedRole(initialRole);
  }, [initialRole, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click listener */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-10 transition-all">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/80 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2">
            {selectedRole ? (
              <button 
                onClick={() => setSelectedRole(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to workspace selection
              </button>
            ) : (
              <WorkSphereLogo size="sm" />
            )}
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {selectedRole === null ? (
            /* STEP 1: CHOOSE WORKSPACE */
            <div className="space-y-6">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Welcome to WorkSphere
                </h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose your workspace to sign in
                </p>
              </div>

              {/* Workspace Role Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Admin / HR Card */}
                <button
                  onClick={() => setSelectedRole('ADMIN_HR')}
                  className="group flex flex-col justify-between p-5 text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-900/20 transition-all shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-brand-100 dark:bg-brand-900/60 text-brand-700 dark:text-brand-300 mb-2">
                      Admin / HR
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Admin / HR</h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Manage workforce operations
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* Employee Card */}
                <button
                  onClick={() => setSelectedRole('EMPLOYEE')}
                  className="group flex flex-col justify-between p-5 text-left rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 hover:border-brand-500 dark:hover:border-brand-400 hover:bg-brand-50/40 dark:hover:bg-brand-900/20 transition-all shadow-sm hover:shadow-md"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 mb-2">
                      Employee
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">Employee</h3>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Access your personal HR workspace
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 2: LOGIN FORM */
            <LoginForm 
              title={selectedRole === 'ADMIN_HR' ? 'Admin / HR Login' : 'Employee Login'}
              description={selectedRole === 'ADMIN_HR' ? 'Sign in to manage your workforce.' : 'Sign in to access your HR workspace.'}
              onSuccess={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

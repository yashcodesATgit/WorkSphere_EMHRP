import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowRight, Users, Building2, CalendarCheck, Clock, 
  Banknote, LineChart, ShieldCheck
} from 'lucide-react';
import Button from '../components/Button';
import Hero from '../components/homepage/Hero';
import DashboardPreview from '../components/homepage/DashboardPreview';
import WorkSphereLogo from '../components/WorkSphereLogo';
import { useAuthStore } from '../store/authStore';

const MODULES = [
  {
    title: 'Employee Management',
    description: 'Manage employee profiles, employment information and status.',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/30'
  },
  {
    title: 'Departments',
    description: 'Organize employees across departments and track department activity.',
    icon: Building2,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-900/30'
  },
  {
    title: 'Attendance',
    description: 'Track attendance, check-in, check-out and working hours.',
    icon: CalendarCheck,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/30'
  },
  {
    title: 'Leave Management',
    description: 'Apply, review and manage employee leave requests.',
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/30'
  },
  {
    title: 'Payroll',
    description: 'Maintain monthly salary records and payroll status.',
    icon: Banknote,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30'
  },
  {
    title: 'Performance',
    description: 'Create and manage structured employee performance reviews.',
    icon: LineChart,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/30'
  }
];

const Home = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="h-full w-full overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-900 font-sans selection:bg-brand-500/30">
      {/* 1. HERO SECTION (Professional Office Visual + Floating UI Overlay) */}
      <Hero />

      {/* 2. CAPABILITY STRIP */}
      <section className="border-y border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 sm:gap-x-12 md:gap-x-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {[
              { icon: Users, label: 'EMPLOYEES' },
              { icon: CalendarCheck, label: 'ATTENDANCE' },
              { icon: Clock, label: 'LEAVE MANAGEMENT' },
              { icon: Banknote, label: 'PAYROLL' },
              { icon: LineChart, label: 'PERFORMANCE' }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-800 dark:text-gray-300">
                <item.icon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                <span className="text-xs sm:text-sm font-bold tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ACTUAL DASHBOARD PREVIEW SHOWCASE */}
      <section className="py-16 sm:py-24 bg-gray-50/60 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Everything your workforce, in one workspace
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Manage core HR operations from a centralized WorkSphere dashboard.
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* 4. MODULES SECTION */}
      <section id="modules" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Core Modules & Capabilities
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              Complete tools designed for seamless organizational HR workflows.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {MODULES.map((mod) => (
              <div key={mod.title} className="group p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-300">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${mod.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <mod.icon className={`h-7 w-7 ${mod.color}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{mod.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                  {mod.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. PRODUCT WORKFLOW SECTION */}
      <section id="workflow" className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">A connected HR lifecycle</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Data flows naturally between modules.</p>
          </div>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-gray-200 dark:bg-gray-700"></div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              {[
                { step: '01', title: 'Employees' },
                { step: '02', title: 'Attendance & Leave' },
                { step: '03', title: 'Payroll' },
                { step: '04', title: 'Performance' },
                { step: '05', title: 'Dashboard' }
              ].map((item, index) => (
                <div key={index} className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 border-4 border-gray-50 dark:border-gray-900 shadow-md flex flex-col items-center justify-center mb-4 group-hover:border-brand-500 transition-colors">
                    <span className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-widest uppercase mb-1">Step</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{item.step}</span>
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-white">{item.title}</h4>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. ROLE-BASED ACCESS SECTION */}
      <section className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-900 rounded-[2rem] overflow-hidden shadow-2xl relative">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-brand-800/50 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-indigo-900/50 blur-3xl"></div>

            <div className="relative px-6 py-16 sm:px-12 lg:px-16 text-center">
              <ShieldCheck className="h-12 w-12 text-brand-300 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">One system. Different responsibilities.</h2>
              <p className="mt-4 text-lg text-brand-200 max-w-2xl mx-auto">
                WorkSphere securely scopes data and capabilities strictly by the user's role.
              </p>
              
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Admin */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-left hover:bg-white/15 transition-colors">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded bg-white/20 text-white text-xs font-bold tracking-widest mb-4">
                    ADMIN
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Manage workforce operations</h4>
                  <p className="text-brand-100 text-sm leading-relaxed">
                    Unrestricted access to all modules. Manage departments, oversee HR workflows, and control the entire organization.
                  </p>
                </div>
                {/* HR */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-left hover:bg-white/15 transition-colors">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded bg-white/20 text-white text-xs font-bold tracking-widest mb-4">
                    HR
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Manage workforce operations</h4>
                  <p className="text-brand-100 text-sm leading-relaxed">
                    Process payroll, approve or reject leave applications, create performance reviews, and onboard new employees.
                  </p>
                </div>
                {/* Employee */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-left hover:bg-white/15 transition-colors">
                  <div className="inline-flex items-center justify-center px-3 py-1 rounded bg-white/20 text-white text-xs font-bold tracking-widest mb-4">
                    EMPLOYEE
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">Access your personal HR workspace</h4>
                  <p className="text-brand-100 text-sm leading-relaxed">
                    Secure read-only access to own history. Mark daily attendance, apply for leaves, and view personal payroll/reviews.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECURITY / TECHNOLOGY SECTION */}
      <section className="py-12 sm:py-16 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase mb-10">Powered by Modern Technologies</p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14 md:gap-16">
            {/* MongoDB */}
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg" 
              alt="MongoDB" 
              className="h-16 sm:h-20 object-contain hover:scale-105 transition-transform duration-300" 
            />
            {/* Express */}
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original-wordmark.svg" 
              alt="Express" 
              className="h-12 sm:h-16 object-contain dark:invert hover:scale-105 transition-transform duration-300" 
            />
            {/* React */}
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original-wordmark.svg" 
              alt="React" 
              className="h-16 sm:h-20 object-contain hover:scale-105 transition-transform duration-300" 
            />
            {/* Node.js */}
            <img 
              src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg" 
              alt="Node.js" 
              className="h-16 sm:h-20 object-contain hover:scale-105 transition-transform duration-300" 
            />
            {/* TypeScript */}
            <div className="flex items-center gap-3 hover:scale-105 transition-transform duration-300">
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" 
                alt="TypeScript" 
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-md object-contain" 
              />
              <span className="font-bold text-2xl sm:text-3xl tracking-tight text-gray-800 dark:text-gray-100">TypeScript</span>
            </div>
            {/* Tailwind CSS */}
            <div className="flex flex-col items-center justify-center gap-1 hover:scale-105 transition-transform duration-300">
              <img 
                src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" 
                alt="Tailwind CSS" 
                className="h-12 sm:h-14 w-auto object-contain" 
              />
              <span className="font-bold text-sm sm:text-base tracking-tight text-gray-800 dark:text-gray-100">Tailwind CSS</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-800/30 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight mb-4">Ready to explore WorkSphere?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">Sign in to access the HR management dashboard.</p>
          
          {isAuthenticated ? (
            <Button onClick={() => navigate('/dashboard')} variant="primary" size="lg" className="inline-flex items-center justify-center gap-2">
              Go to Dashboard <ArrowRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button onClick={() => navigate('/login')} variant="primary" size="lg" className="inline-flex items-center justify-center gap-2">
              Login to WorkSphere <ArrowRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-white dark:bg-gray-900 pt-16 pb-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div>
              <div className="mb-4">
                <WorkSphereLogo size="md" />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Employee & HR Management System</p>
            </div>
            
            <div className="flex gap-12">
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase mb-1">Navigation</span>
                <a href="#features" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Features</a>
                <a href="#modules" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Modules</a>
                <a href="#workflow" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Workflow</a>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-xs font-bold text-gray-900 dark:text-white tracking-wider uppercase mb-1">Account</span>
                <Link to="/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400">Login</Link>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 dark:border-gray-800 flex justify-center items-center text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              &copy; {new Date().getFullYear()} WorkSphere. Built with React, Node.js & MongoDB.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;

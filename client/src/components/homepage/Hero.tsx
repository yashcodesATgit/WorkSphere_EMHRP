import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, CalendarCheck, Clock, CreditCard } from 'lucide-react';
import Button from '../Button';
import LoginModal from '../LoginModal';
import { useAuthStore } from '../../store/authStore';
import officeHeroImg from '../../assets/office-hero.webp';

const Hero = () => {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <>
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 overflow-hidden bg-white dark:bg-gray-900">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-brand-50/60 dark:bg-brand-900/10 rounded-full blur-3xl -z-10 pointer-events-none opacity-70"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Copy & CTAs */}
            <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
              {/* Small Eyebrow Badge — Clean Professional Tint */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 dark:bg-gray-800/90 text-brand-700 dark:text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6 border border-brand-200/60 dark:border-gray-700 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-brand-500"></span>
                Employee Management • Attendance • Payroll • Performance
              </div>
              
              {/* Main Heading */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6.5xl font-black text-gray-900 dark:text-white tracking-tight leading-[1.1] sm:leading-[1.1]">
                Everything your workforce needs, <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-brand-500 via-sky-400 to-blue-600 dark:from-brand-400 dark:via-sky-300 dark:to-blue-500 bg-clip-text text-transparent drop-shadow-sm font-black">
                  in one place.
                </span>
              </h1>
              
              {/* Supporting Text — Unboxed Clean Bullet Points (2 per line, 25% smaller) */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400 shrink-0"></span>
                  <span>Employee Management</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400 shrink-0"></span>
                  <span>Attendance Tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400 shrink-0"></span>
                  <span>Leave & Payroll System</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 dark:bg-brand-400 shrink-0"></span>
                  <span>Role-Based Performance</span>
                </div>
              </div>
              
              {/* CTAs */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                {isAuthenticated ? (
                  <Button onClick={() => navigate('/dashboard')} variant="primary" size="lg" className="flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-lg py-3.5">
                    Go to Dashboard <ArrowRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <>
                    <Button onClick={() => setIsLoginModalOpen(true)} variant="primary" size="lg" className="flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-lg py-3.5">
                      Login to Dashboard <ArrowRight className="h-5 w-5" />
                    </Button>
                    <a href="#modules" className="inline-flex items-center justify-center px-6 py-3.5 border border-gray-300 dark:border-gray-700 rounded-lg text-lg font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Explore Modules
                    </a>
                  </>
                )}
              </div>
            </div>

          {/* RIGHT COLUMN: Professional Office Image + WorkSphere Floating UI Overlay */}
          <div className="relative mx-auto w-full max-w-lg lg:max-w-none lg:w-full mt-8 lg:mt-0">
            {/* Main Image Container */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200/80 dark:border-gray-700/80 bg-gray-100 dark:bg-gray-800">
              <img 
                src={officeHeroImg} 
                alt="Modern professional office environment with employees collaborating" 
                className="w-full h-[400px] sm:h-[500px] object-cover object-center"
              />
              {/* Subtle Gradient Overlay for visual polish */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/30 via-transparent to-transparent pointer-events-none"></div>
            </div>

            {/* Floating UI Card 1: Total Employees (Top Left) — 25% Larger */}
            <div className="absolute -top-4 -left-2 sm:-top-6 sm:-left-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-2.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 flex items-center gap-2 sm:gap-4 transition-transform hover:scale-105 duration-300 z-10">
              <div className="w-8 h-8 sm:w-13 sm:h-13 rounded-lg sm:rounded-xl bg-brand-50 dark:bg-brand-900/40 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0">
                <Users className="w-4 h-4 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Total Employees</p>
                <p className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">142</p>
              </div>
            </div>

            {/* Floating UI Card 2: Payroll Status (Top Right) — 25% Larger */}
            <div className="absolute -top-6 -right-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 hidden sm:flex items-center gap-4 transition-transform hover:scale-105 duration-300 z-10">
              <div className="w-13 h-13 rounded-xl bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                <CreditCard className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Monthly Payroll</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">$128.4k</p>
              </div>
            </div>

            {/* Floating UI Card 3: Leave Requests (Bottom Left) — 25% Larger */}
            <div className="absolute -bottom-6 -left-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 hidden sm:flex items-center gap-4 transition-transform hover:scale-105 duration-300 z-10">
              <div className="w-13 h-13 rounded-xl bg-amber-50 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Clock className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Leave Requests</p>
                <p className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">8 Pending</p>
              </div>
            </div>

            {/* Floating UI Card 4: Attendance (Bottom Right) — 25% Larger */}
            <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-8 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-2.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200/80 dark:border-gray-700 flex items-center gap-2 sm:gap-4 transition-transform hover:scale-105 duration-300 z-10">
              <div className="w-8 h-8 sm:w-13 sm:h-13 rounded-lg sm:rounded-xl bg-green-50 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                <CalendarCheck className="w-4 h-4 sm:w-7 sm:h-7" />
              </div>
              <div>
                <p className="text-[10px] sm:text-sm text-gray-500 dark:text-gray-400 font-medium">Present Today</p>
                <p className="text-sm sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">138</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>

    <LoginModal 
      isOpen={isLoginModalOpen} 
      onClose={() => setIsLoginModalOpen(false)} 
    />
  </>
);
};

export default Hero;

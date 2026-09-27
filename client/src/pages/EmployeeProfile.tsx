import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase,
  Building2, User, DollarSign, KeyRound, Eye, EyeOff, CheckCircle2,
} from 'lucide-react';
import { useEmployee } from '../hooks/useEmployeeQueries';
import { useAuthStore } from '../store/authStore';
import api from '../lib/axios';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 min-w-0">
      <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white break-words">{value}</p>
      </div>
    </div>
  );
};

// ── Set Login Account Panel ────────────────────────────────────────────────
const SetLoginPanel = ({ employeeId, email, onSuccess }: { employeeId: string; email: string; onSuccess: () => void }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await api.post(`/employees/${employeeId}/account`, { password });
      setDone(true);
      setTimeout(onSuccess, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
      <CheckCircle2 className="h-4 w-4 shrink-0" />
      <span>Account created! Can log in with <strong className="font-semibold break-all">{email}</strong></span>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Login email: <span className="font-medium text-gray-900 dark:text-white break-all">{email}</span>
      </p>
      <div className="relative">
        <input
          type={showPw ? 'text' : 'password'}
          placeholder="Set password (min 6 chars)"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white pr-10 focus:outline-none focus:ring-2 focus:ring-brand-500"
          required
        />
        <button type="button" onClick={() => setShowPw(v => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <input
        type={showPw ? 'text' : 'password'}
        placeholder="Confirm password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        required
      />
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-brand-600 hover:bg-brand-700 disabled:opacity-60 px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        {loading ? 'Creating…' : 'Create Login Account'}
      </button>
    </form>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const EmployeeProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: employee, isLoading, isError, refetch } = useEmployee(id!);
  const [showLoginPanel, setShowLoginPanel] = useState(false);

  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';
  const canViewSalary = canManage;

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState title="Failed to load employee" onRetry={() => refetch()} />;
  if (!employee) return null;

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const hasLoginAccount = !!employee.user;

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-start gap-2.5 sm:gap-4">
        <button onClick={() => navigate('/employees')} className="mt-1 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <PageHeader
            title={fullName}
            description={`${employee.employeeId} · ${employee.designation}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left: Overview card */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-brand-600 dark:text-brand-400">
                  {employee.firstName[0]}{employee.lastName[0]}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white break-words">{fullName}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 break-words">{employee.designation}</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                <Badge variant={employee.isActive ? 'success' : 'gray'}>
                  {employee.isActive ? 'Active' : 'Inactive'}
                </Badge>
                {hasLoginAccount && (
                  <Badge variant="info">Has Login</Badge>
                )}
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-1">
              <InfoRow icon={Mail} label="Email" value={employee.email} />
              {employee.phone && <InfoRow icon={Phone} label="Phone" value={employee.phone} />}
              {employee.address && <InfoRow icon={MapPin} label="Address" value={employee.address} />}
            </div>
          </Card>

          {/* Login Account Card — Admin/HR only */}
          {canManage && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <KeyRound className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Login Account</h3>
              </div>

              {hasLoginAccount ? (
                <div className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>Account active · logs in with employee email</span>
                </div>
              ) : showLoginPanel ? (
                <SetLoginPanel
                  employeeId={id!}
                  email={employee.email}
                  onSuccess={() => { setShowLoginPanel(false); refetch(); }}
                />
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No login account yet. Create one so this employee can sign in.
                  </p>
                  <button
                    onClick={() => setShowLoginPanel(true)}
                    className="w-full rounded-md border border-brand-500 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 px-4 py-2 text-sm font-medium transition-colors"
                  >
                    + Set Login Account
                  </button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Right: Details */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Employment Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
              <InfoRow icon={Building2} label="Department" value={employee.department?.name} />
              <InfoRow icon={Briefcase} label="Employment Type" value={employee.employmentStatus} />
              <InfoRow icon={Calendar} label="Joining Date" value={new Date(employee.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} />
              {employee.dateOfBirth && <InfoRow icon={Calendar} label="Date of Birth" value={new Date(employee.dateOfBirth).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} />}
              {employee.gender && <InfoRow icon={User} label="Gender" value={employee.gender} />}
              {canViewSalary && employee.salary > 0 && (
                <InfoRow icon={DollarSign} label="Monthly Salary" value={`₹ ${employee.salary.toLocaleString('en-IN')}`} />
              )}
            </div>
          </Card>

          {/* Quick links to employee's module records */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {[
              { label: 'Attendance', path: '/attendance' },
              { label: 'Leave', path: '/leave' },
              { label: 'Payroll', path: '/payroll' },
              { label: 'Performance', path: '/performance' },
            ].map(({ label, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">View {label.toLowerCase()} records →</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;

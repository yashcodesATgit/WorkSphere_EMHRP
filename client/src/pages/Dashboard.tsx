import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import {
  Users, Building2, CalendarCheck, Clock, Wifi, WifiOff,
  Banknote, LineChart, CheckCircle2, UserPlus, AlertCircle, FileText,
} from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import Badge from '../components/Badge';
import { useAuthStore } from '../store/authStore';

// ── API health ─────────────────────────────────────────────────────────────
interface HealthResponse { success: boolean; message: string; database: 'connected' | 'disconnected'; }

const ApiStatusBanner = () => {
  const { data, isLoading, isError } = useQuery<HealthResponse>({
    queryKey: ['health'],
    queryFn: () => api.get('/health').then(r => r.data),
    retry: 1,
    staleTime: 30_000,
  });
  if (isLoading) return (
    <div className="flex items-center gap-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
      <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" /> Checking backend…
    </div>
  );
  if (isError || !data?.success) return (
    <div className="flex items-center gap-2 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-4 py-2 text-sm text-red-700 dark:text-red-400">
      <WifiOff className="h-4 w-4" /> Backend unreachable
    </div>
  );
  const ok = data.database === 'connected';
  return (
    <div className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm ${ok ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400'}`}>
      {ok ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
      API {data.message} · Database {data.database}
    </div>
  );
};

// ── Stat card ──────────────────────────────────────────────────────────────
interface StatProps { name: string; value: string | number; icon: React.ElementType; sub: string; subType?: 'positive' | 'warning' | 'neutral'; }
const StatCard = ({ name, value, icon: Icon, sub, subType = 'neutral' }: StatProps) => (
  <Card className="relative transition-all hover:shadow-md">
    <dt>
      <div className="absolute rounded-md bg-brand-50 dark:bg-brand-900/50 p-3">
        <Icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
      </div>
      <p className="ml-16 truncate text-sm font-medium text-gray-500 dark:text-gray-400">{name}</p>
    </dt>
    <dd className="ml-16 flex flex-col pb-1 sm:pb-2 mt-1">
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className={`text-xs mt-1 font-medium ${subType === 'positive' ? 'text-green-600 dark:text-green-400' : subType === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-500 dark:text-gray-400'}`}>{sub}</p>
    </dd>
  </Card>
);

// ── Admin/HR Dashboard ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const today = new Date().toISOString().slice(0, 10);

  const empTotal      = useQuery({ queryKey: ['dash-emp'],          queryFn: () => api.get('/employees?limit=1').then(r => r.data.pagination?.total ?? 0), staleTime: 60_000 });
  const deptTotal     = useQuery({ queryKey: ['dash-dept'],         queryFn: () => api.get('/departments').then(r => (r.data.departments ?? []).length), staleTime: 60_000 });
  const presentToday  = useQuery({ queryKey: ['dash-present', today], queryFn: () => api.get(`/attendance?from=${today}&to=${today}&status=PRESENT&limit=1`).then(r => r.data.pagination?.total ?? 0), staleTime: 30_000 });
  const pendingLeaves = useQuery({ queryKey: ['dash-leaves'],       queryFn: () => api.get('/leaves?status=PENDING&limit=1').then(r => r.data.pagination?.total ?? 0), staleTime: 30_000 });
  const pendingPayroll= useQuery({ queryKey: ['dash-payroll'],      queryFn: () => api.get('/payroll?status=PENDING&limit=1').then(r => r.data.pagination?.total ?? 0), staleTime: 30_000 });
  const doneReviews   = useQuery({ queryKey: ['dash-perf'],         queryFn: () => api.get('/performance?status=COMPLETED&limit=1').then(r => r.data.pagination?.total ?? 0), staleTime: 30_000 });
  const recentLeaves  = useQuery({ queryKey: ['dash-recent-leaves'], queryFn: () => api.get('/leaves?limit=5&sort=appliedOn&order=desc').then(r => r.data.data ?? []), staleTime: 30_000 });

  const val = (q: ReturnType<typeof useQuery>) => (q.isLoading ? '…' : String(q.data ?? 0));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard name="Total Employees" value={val(empTotal)} icon={Users} sub="Active employees" subType="positive" />
        <StatCard name="Present Today" value={val(presentToday)} icon={CalendarCheck} sub="Checked in today" subType="positive" />
        <StatCard name="Pending Leaves" value={val(pendingLeaves)} icon={Clock} sub="Awaiting approval" subType="warning" />
        <StatCard name="Departments" value={val(deptTotal)} icon={Building2} sub="Active departments" />
        <StatCard name="Pending Payroll" value={val(pendingPayroll)} icon={Banknote} sub="Not yet processed" subType="warning" />
        <StatCard name="Completed Reviews" value={val(doneReviews)} icon={LineChart} sub="Performance reviews done" subType="positive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent leave applications */}
        <Card noPadding>
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Leave Applications</h2>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {recentLeaves.isLoading ? (
              <div className="px-6 py-4 text-sm text-gray-500">Loading…</div>
            ) : (recentLeaves.data as { _id: string; employee: { firstName: string; lastName: string }; leaveType: string; status: string }[] ?? []).length === 0 ? (
              <div className="px-6 py-4 text-sm text-gray-500">No leave applications.</div>
            ) : (recentLeaves.data as { _id: string; employee: { firstName: string; lastName: string }; leaveType: string; status: string }[]).map((l) => (
              <div key={l._id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{l.employee.firstName} {l.employee.lastName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{l.leaveType}</p>
                </div>
                <Badge variant={l.status === 'APPROVED' ? 'success' : l.status === 'REJECTED' ? 'danger' : l.status === 'PENDING' ? 'warning' : 'gray'}>{l.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Activity feed (static, no backend needed) */}
        <Card noPadding>
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quick Overview</h2>
          </div>
          <div className="px-6 py-4 space-y-4">
            {[
              { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40', label: 'Approve / Reject leaves from the Leave section.' },
              { icon: Banknote, color: 'text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/40', label: 'Process pending payrolls in the Payroll section.' },
              { icon: LineChart, color: 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/40', label: 'Create or complete performance reviews in Performance.' },
              { icon: UserPlus, color: 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40', label: 'Onboard new employees in the Employees section.' },
              { icon: AlertCircle, color: 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40', label: 'Review absent employees from Attendance.' },
              { icon: FileText, color: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700', label: 'Reports & Analytics — coming in Phase 9.' },
            ].map(({ icon: Ic, color, label }, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}><Ic className="h-4 w-4" /></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── Employee Dashboard ─────────────────────────────────────────────────────
const EmployeeDashboard = () => {
  const today = new Date().toISOString().slice(0, 10);
  const curMonth = new Date().getMonth() + 1;
  const curYear = new Date().getFullYear();

  const todayAtt      = useQuery({ queryKey: ['emp-dash-att', today],          queryFn: () => api.get(`/attendance?from=${today}&to=${today}&limit=1`).then(r => r.data.data?.[0] ?? null), staleTime: 30_000 });
  const leaveStats    = useQuery({ queryKey: ['emp-dash-leaves'],               queryFn: () => api.get('/leaves?limit=1').then(r => r.data.pagination?.total ?? 0), staleTime: 30_000 });
  const pendingLeaves = useQuery({ queryKey: ['emp-dash-pending-leaves'],       queryFn: () => api.get('/leaves?status=PENDING&limit=1').then(r => r.data.pagination?.total ?? 0), staleTime: 30_000 });
  const latestPayroll = useQuery({ queryKey: ['emp-dash-payroll'],              queryFn: () => api.get(`/payroll?month=${curMonth}&year=${curYear}&limit=1`).then(r => r.data.data?.[0] ?? null), staleTime: 60_000 });
  const latestReview  = useQuery({ queryKey: ['emp-dash-perf'],                queryFn: () => api.get('/performance?limit=1&sort=reviewDate&order=desc').then(r => r.data.data?.[0] ?? null), staleTime: 60_000 });

  const att = todayAtt.data as { status: string; checkIn: string; checkOut: string; workingHours: number } | null;
  const pay = latestPayroll.data as { month: number; year: number; netSalary: number; status: string } | null;
  const perf = latestReview.data as { reviewPeriod: string; rating: number; status: string } | null;
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div className="space-y-6">
      {/* Today's snapshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="relative hover:shadow-md transition-all">
          <dt>
            <div className="absolute rounded-md bg-green-50 dark:bg-green-900/40 p-3">
              <CalendarCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400">Today</p>
          </dt>
          <dd className="ml-16 mt-1">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {todayAtt.isLoading ? '…' : att ? att.status : 'Not marked'}
            </p>
            {att && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{att.checkIn || '—'} → {att.checkOut || '—'}</p>}
          </dd>
        </Card>
        <Card className="relative hover:shadow-md transition-all">
          <dt>
            <div className="absolute rounded-md bg-yellow-50 dark:bg-yellow-900/40 p-3">
              <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400">Total Leaves</p>
          </dt>
          <dd className="ml-16 mt-1">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{leaveStats.isLoading ? '…' : String(leaveStats.data ?? 0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pendingLeaves.data ?? 0} pending</p>
          </dd>
        </Card>
        <Card className="relative hover:shadow-md transition-all">
          <dt>
            <div className="absolute rounded-md bg-brand-50 dark:bg-brand-900/40 p-3">
              <Banknote className="h-6 w-6 text-brand-600 dark:text-brand-400" />
            </div>
            <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400">Latest Payroll</p>
          </dt>
          <dd className="ml-16 mt-1">
            {latestPayroll.isLoading ? <p className="text-lg font-semibold text-gray-900 dark:text-white">…</p> : pay ? (
              <>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">₹ {pay.netSalary.toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{MONTHS[pay.month - 1]} {pay.year} · <Badge variant={pay.status === 'PAID' ? 'success' : 'warning'}>{pay.status}</Badge></p>
              </>
            ) : <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No record</p>}
          </dd>
        </Card>
        <Card className="relative hover:shadow-md transition-all">
          <dt>
            <div className="absolute rounded-md bg-purple-50 dark:bg-purple-900/40 p-3">
              <LineChart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400">Latest Review</p>
          </dt>
          <dd className="ml-16 mt-1">
            {latestReview.isLoading ? <p className="text-lg font-semibold text-gray-900 dark:text-white">…</p> : perf ? (
              <>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{'★'.repeat(perf.rating)}{'☆'.repeat(5 - perf.rating)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{perf.reviewPeriod}</p>
              </>
            ) : <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No review yet</p>}
          </dd>
        </Card>
      </div>

      <Card noPadding>
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: CalendarCheck, label: "Mark today's attendance", link: '/attendance', color: 'text-green-600' },
            { icon: Clock, label: 'Apply for leave', link: '/leave', color: 'text-yellow-600' },
            { icon: Banknote, label: 'View salary history', link: '/payroll', color: 'text-brand-600' },
            { icon: LineChart, label: 'View performance reviews', link: '/performance', color: 'text-purple-600' },
          ].map(({ icon: Ic, label, link, color }) => (
            <Link key={link} to={link}
              className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors group">
              <Ic className={`h-5 w-5 ${color} group-hover:scale-110 transition-transform`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ── Root Dashboard ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your organization's human resources." />
      <ApiStatusBanner />
      {canManage ? <AdminDashboard /> : <EmployeeDashboard />}
    </div>
  );
};

export default Dashboard;

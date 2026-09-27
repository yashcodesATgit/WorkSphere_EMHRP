import { useState } from 'react';
import { Plus, CalendarCheck, LogIn, LogOut } from 'lucide-react';
import {
  useAttendance, useCreateAttendance, useUpdateAttendance,
  useDeleteAttendance, useCheckIn, useCheckOut,
} from '../hooks/useAttendanceQueries';
import { useEmployees } from '../hooks/useEmployeeQueries';
import { useAuthStore } from '../store/authStore';
import { AttendanceInput, AttendanceRecord, AttendanceStatus } from '../services/attendanceService';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_BADGE: Record<AttendanceStatus, 'success' | 'danger' | 'warning' | 'info' | 'gray'> = {
  PRESENT: 'success', ABSENT: 'danger', LATE: 'warning', HALF_DAY: 'info', LEAVE: 'gray',
};

// ── Attendance Form Modal ──────────────────────────────────────────────────
interface FormModalProps {
  isOpen: boolean; onClose: () => void;
  onSubmit: (d: AttendanceInput) => void;
  isLoading: boolean; apiError?: string | null;
  initial?: AttendanceRecord | null;
  employees: { _id: string; firstName: string; lastName: string; employeeId: string }[];
}

const AttendanceFormModal = ({ isOpen, onClose, onSubmit, isLoading, apiError, initial, employees }: FormModalProps) => {
  const [form, setForm] = useState<AttendanceInput>({
    employee: initial?.employee._id ?? '',
    date: initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: initial?.status ?? 'PRESENT',
    checkIn: initial?.checkIn ?? '', checkOut: initial?.checkOut ?? '', remarks: initial?.remarks ?? '',
  });
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value })); setErr('');
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.date) { setErr('Employee and date are required.'); return; }
    onSubmit(form);
  };

  const inputCls = 'block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:pt-10 px-0 sm:px-4">
      <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-lg border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{initial ? 'Edit Attendance' : 'Add Attendance'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
        </div>
        {(apiError || err) && (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">{apiError || err}</div>
        )}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {!initial && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
              <select name="employee" value={form.employee} onChange={handleChange} className={inputCls}>
                <option value="">Select employee</option>
                {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className={inputCls} disabled={!!initial} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                {['PRESENT','ABSENT','LATE','HALF_DAY','LEAVE'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check In</label>
              <input type="time" name="checkIn" value={form.checkIn} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check Out</label>
              <input type="time" name="checkOut" value={form.checkOut} onChange={handleChange} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
            <textarea name="remarks" value={form.remarks} onChange={handleChange} rows={2} className={`${inputCls} resize-none`} />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>{initial ? 'Update' : 'Save'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Today Summary ──────────────────────────────────────────────────────────
const TodaySummary = () => {
  const today = new Date().toISOString().slice(0, 10);
  const { data, isLoading } = useAttendance({ from: today, to: today, limit: 1 });
  const todayRecord = data?.data?.[0];
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();
  const hasCheckedIn = !!todayRecord?.checkIn;
  const hasCheckedOut = !!todayRecord?.checkOut;
  const checkInError = (checkInMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  const checkOutError = (checkOutMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message;

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Today's Attendance</h3>
      {isLoading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {todayRecord ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: 'Status', val: <Badge variant={STATUS_BADGE[todayRecord.status]} className="mt-1">{todayRecord.status}</Badge> },
                { label: 'Check In', val: todayRecord.checkIn || '—' },
                { label: 'Check Out', val: todayRecord.checkOut || '—' },
                { label: 'Hours', val: todayRecord.workingHours > 0 ? `${todayRecord.workingHours.toFixed(1)}h` : '—' },
              ].map(({ label, val }) => (
                <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  {typeof val === 'string'
                    ? <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">{val}</p>
                    : val}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No attendance recorded yet today.</p>
          )}
          {(checkInError || checkOutError) && (
            <p className="text-xs text-red-600 dark:text-red-400">{checkInError || checkOutError}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" size="sm" className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
              disabled={hasCheckedIn} isLoading={checkInMutation.isPending} onClick={() => checkInMutation.mutate()}>
              <LogIn className="h-4 w-4" />{hasCheckedIn ? 'Checked In' : 'Check In'}
            </Button>
            <Button variant="secondary" size="sm" className="flex items-center gap-2 flex-1 sm:flex-none justify-center"
              disabled={!hasCheckedIn || hasCheckedOut} isLoading={checkOutMutation.isPending} onClick={() => checkOutMutation.mutate()}>
              <LogOut className="h-4 w-4" />{hasCheckedOut ? 'Checked Out' : 'Check Out'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ── Mobile Card View ───────────────────────────────────────────────────────
const AttendanceMobileCard = ({ r, canManage, onEdit, onDelete }: {
  r: AttendanceRecord; canManage: boolean;
  onEdit: () => void; onDelete: () => void;
}) => (
  <div className="p-4 space-y-2">
    {canManage && (
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">{r.employee.firstName} {r.employee.lastName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{r.employee.employeeId}</p>
        </div>
        <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
      </div>
    )}
    {!canManage && <div className="flex items-center justify-between"><span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(r.date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}</span><Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge></div>}
    <div className="grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
      {canManage && <span className="col-span-3 text-gray-500">{new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>}
      <span><span className="text-gray-400">In:</span> {r.checkIn || '—'}</span>
      <span><span className="text-gray-400">Out:</span> {r.checkOut || '—'}</span>
      <span><span className="text-gray-400">Hrs:</span> {r.workingHours > 0 ? `${r.workingHours.toFixed(1)}h` : '—'}</span>
    </div>
    {r.remarks && <p className="text-xs text-gray-400 truncate">{r.remarks}</p>}
    {canManage && (
      <div className="flex gap-3 pt-1">
        <button onClick={onEdit} className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline">Edit</button>
        <button onClick={onDelete} className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button>
      </div>
    )}
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const Attendance = () => {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  const [page, setPage] = useState(1);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AttendanceRecord | null>(null);

  const params = { page, limit: 10, ...(employeeFilter && { employee: employeeFilter }), ...(statusFilter && { status: statusFilter }), ...(from && { from }), ...(to && { to }) };
  const { data, isLoading, isError, refetch } = useAttendance(params);
  const { data: empData } = useEmployees({ limit: 200 }, canManage);
  const employees = empData?.employees ?? [];

  const createMutation = useCreateAttendance();
  const updateMutation = useUpdateAttendance(editTarget?._id ?? '');
  const deleteMutation = useDeleteAttendance();

  const records = data?.data ?? [];
  const pagination = data?.pagination;

  const handleFormSubmit = (d: AttendanceInput) => {
    if (editTarget) {
      updateMutation.mutate(d, { onSuccess: () => { setFormOpen(false); setEditTarget(null); } });
    } else {
      createMutation.mutate(d, { onSuccess: () => setFormOpen(false) });
    }
  };

  const formError = (editTarget ? updateMutation.error : createMutation.error) as { response?: { data?: { message?: string } } } | null;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance"
        description={canManage ? 'Manage employee attendance records.' : 'Your attendance records.'}
        action={canManage ? (
          <Button variant="primary" className="flex items-center gap-2 w-full sm:w-auto justify-center" onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Record
          </Button>
        ) : undefined}
      />

      {!canManage && <TodaySummary />}

      {/* Filters */}
      <Card noPadding>
        <div className="px-4 py-3 flex flex-wrap gap-2 items-center">
          {canManage && (
            <select value={employeeFilter} onChange={e => { setEmployeeFilter(e.target.value); setPage(1); }}
              className="flex-1 min-w-[140px] text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">All Employees</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
          )}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="flex-1 min-w-[120px] text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="">All Status</option>
            {['PRESENT','ABSENT','LATE','HALF_DAY','LEAVE'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }}
            className="flex-1 min-w-[130px] text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500" />
          <input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }}
            className="flex-1 min-w-[130px] text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500" />
          {(employeeFilter || statusFilter || from || to) && (
            <button onClick={() => { setEmployeeFilter(''); setStatusFilter(''); setFrom(''); setTo(''); setPage(1); }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline whitespace-nowrap">Clear</button>
          )}
        </div>
      </Card>

      {/* Records */}
      {isLoading ? <LoadingSpinner /> : isError ? <ErrorState onRetry={() => refetch()} /> :
        records.length === 0 ? (
          <EmptyState icon={CalendarCheck} title="No attendance records" description="No records match the selected filters." />
        ) : (
          <Card noPadding>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {[canManage && 'Employee', 'Date', 'Check In', 'Check Out', 'Hours', 'Status', 'Remarks', canManage && 'Actions']
                      .filter(Boolean).map(h => (
                      <th key={h as string} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {records.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      {canManage && (
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{r.employee.firstName} {r.employee.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{r.employee.employeeId}</p>
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.checkIn || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.checkOut || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{r.workingHours > 0 ? `${r.workingHours.toFixed(1)}h` : '—'}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge></td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[140px] truncate">{r.remarks || '—'}</td>
                      {canManage && (
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => { setEditTarget(r); setFormOpen(true); }} className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline">Edit</button>
                            <button onClick={() => { if (window.confirm('Delete this record?')) deleteMutation.mutate(r._id); }} className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline">Delete</button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {records.map(r => (
                <AttendanceMobileCard key={r._id} r={r} canManage={canManage}
                  onEdit={() => { setEditTarget(r); setFormOpen(true); }}
                  onDelete={() => { if (window.confirm('Delete this record?')) deleteMutation.mutate(r._id); }}
                />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={pagination.page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                  <Button size="sm" variant="secondary" disabled={pagination.page === pagination.pages} onClick={() => setPage(p => p + 1)}>Next</Button>
                </div>
              </div>
            )}
          </Card>
        )
      }

      <AttendanceFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); setEditTarget(null); createMutation.reset(); updateMutation.reset(); }}
        onSubmit={handleFormSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
        apiError={formError?.response?.data?.message ?? null}
        initial={editTarget}
        employees={employees}
      />
    </div>
  );
};

export default Attendance;

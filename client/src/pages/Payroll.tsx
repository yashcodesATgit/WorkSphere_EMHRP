import { useState, useEffect } from 'react';
import { Plus, Banknote, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import {
  usePayrolls, useCreatePayroll, useUpdatePayroll,
  useDeletePayroll, useUpdatePayrollStatus,
} from '../hooks/usePayrollQueries';
import { useEmployees } from '../hooks/useEmployeeQueries';
import { useAuthStore } from '../store/authStore';
import { PayrollRecord, PayrollInput, PayrollStatus } from '../services/payrollService';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_BADGE: Record<PayrollStatus, 'warning' | 'info' | 'success'> = {
  PENDING: 'warning',
  PROCESSED: 'info',
  PAID: 'success',
};

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const INR = (n: number) => `₹ ${n.toLocaleString('en-IN')}`;
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => CURRENT_YEAR - i);

// ─── Payroll Form Modal ────────────────────────────────────────────────────
interface PayrollFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (d: PayrollInput) => void;
  isLoading: boolean;
  apiError?: string | null;
  initial?: PayrollRecord | null;
  employees: { _id: string; firstName: string; lastName: string; employeeId: string; salary?: number }[];
}

const EMPTY: PayrollInput = {
  employee: '', month: new Date().getMonth() + 1, year: CURRENT_YEAR,
  basicSalary: 0, allowances: 0, deductions: 0,
  workingDays: 26, presentDays: 0, leaveDays: 0, remarks: '',
};

const PayrollFormModal = ({ isOpen, onClose, onSubmit, isLoading, apiError, initial, employees }: PayrollFormProps) => {
  const [form, setForm] = useState<PayrollInput>(EMPTY);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErr('');
      if (initial) {
        setForm({
          employee: initial.employee._id,
          month: initial.month, year: initial.year,
          basicSalary: initial.basicSalary, allowances: initial.allowances,
          deductions: initial.deductions, workingDays: initial.workingDays,
          presentDays: initial.presentDays, leaveDays: initial.leaveDays,
          remarks: initial.remarks,
        });
      } else {
        setForm(EMPTY);
      }
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const gross = Math.max(0, (form.basicSalary ?? 0) + (form.allowances ?? 0));
  const net = Math.max(0, gross - (form.deductions ?? 0));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: ['month','year','basicSalary','allowances','deductions','workingDays','presentDays','leaveDays'].includes(name) ? Number(value) : value }));
    setErr('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.month || !form.year) { setErr('Employee, month, and year are required.'); return; }
    onSubmit(form);
  };

  const inputCls = 'block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:text-white';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-0 sm:p-4 sm:pt-6 pb-12">
        <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-none sm:rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 min-h-screen sm:min-h-0 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{initial ? 'Edit Payroll' : 'Create Payroll'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 sm:hidden">✕</button>
          </div>
          {(apiError || err) && (
            <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 shrink-0">{apiError || err}</div>
          )}
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5 flex-1">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Period & Employee</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                  <select name="employee" value={form.employee} onChange={handleChange} className={inputCls} disabled={!!initial}>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName} ({e.employeeId})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 sm:col-span-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month *</label>
                    <select name="month" value={form.month} onChange={handleChange} className={inputCls} disabled={!!initial}>
                      {MONTHS.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year *</label>
                    <select name="year" value={form.year} onChange={handleChange} className={inputCls} disabled={!!initial}>
                      {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Salary Components (₹)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[['basicSalary','Basic Salary'],['allowances','Allowances'],['deductions','Deductions']].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                    <input type="number" name={field} min={0} value={(form as unknown as Record<string, number>)[field]} onChange={handleChange} className={inputCls} />
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="flex justify-between sm:block">
                  <p className="text-xs text-gray-500 dark:text-gray-400 sm:mb-1">Gross Salary</p>
                  <p className="text-sm sm:text-base font-semibold text-brand-700 dark:text-brand-400">{INR(gross)}</p>
                </div>
                <div className="flex justify-between sm:block border-t sm:border-t-0 border-brand-100 dark:border-brand-800 pt-2 sm:pt-0 mt-1 sm:mt-0">
                  <p className="text-xs text-gray-500 dark:text-gray-400 sm:mb-1">Net Salary</p>
                  <p className="text-sm sm:text-base font-semibold text-green-700 dark:text-green-400">{INR(net)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Attendance Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[['workingDays','Working Days'],['presentDays','Present Days'],['leaveDays','Leave Days']].map(([field, label]) => (
                  <div key={field} className="flex sm:block items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-0 sm:mb-1">{label}</label>
                    <input type="number" name={field} min={0} value={(form as unknown as Record<string, number>)[field]} onChange={handleChange} className={`${inputCls} w-24 sm:w-full`} />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Remarks</label>
              <textarea name="remarks" value={form.remarks} onChange={handleChange} rows={2} className={`${inputCls} resize-none`} />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 sm:pt-2 mt-auto border-t border-gray-100 dark:border-gray-700 shrink-0">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>{initial ? 'Update Payroll' : 'Create Payroll'}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ── Mobile Card View ───────────────────────────────────────────────────────
const PayrollMobileCard = ({ r, canManage, onEdit, onDelete, onStatusChange, statusOpen, setStatusOpen }: {
  r: PayrollRecord; canManage: boolean;
  onEdit: () => void; onDelete: () => void;
  onStatusChange: (s: PayrollStatus) => void;
  statusOpen: string | null; setStatusOpen: (id: string | null) => void;
}) => (
  <div className="p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div>
        {canManage ? (
          <>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.employee.firstName} {r.employee.lastName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{r.employee.employeeId}</p>
          </>
        ) : (
          <p className="text-base font-semibold text-gray-900 dark:text-white">{MONTHS[r.month - 1]} {r.year}</p>
        )}
      </div>
      <Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge>
    </div>

    {canManage && (
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded flex gap-2">
        <Clock className="w-4 h-4 shrink-0" />
        Period: {MONTHS[r.month - 1]} {r.year}
      </div>
    )}

    <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Gross</p>
        <p className="font-medium text-gray-900 dark:text-white">{INR(r.grossSalary)}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Net</p>
        <p className="font-semibold text-brand-600 dark:text-brand-400">{INR(r.netSalary)}</p>
      </div>
      <div className="col-span-2 flex justify-between text-xs pt-1 mt-1 border-t border-gray-200 dark:border-gray-700">
        <span className="text-gray-500">Basic: {INR(r.basicSalary)}</span>
        <span className="text-green-600 dark:text-green-400">+{INR(r.allowances)}</span>
        <span className="text-red-600 dark:text-red-400">-{INR(r.deductions)}</span>
      </div>
    </div>

    {canManage ? (
      <div className="flex gap-2 pt-1 border-t border-gray-100 dark:border-gray-800 mt-2 flex-wrap">
        <Button variant="secondary" size="sm" className="flex-1 justify-center py-1.5" onClick={onEdit}>
          Edit
        </Button>
        {r.status !== 'PAID' && (
          <div className="flex-1 relative">
            <Button variant="secondary" size="sm" className="w-full justify-center py-1.5" onClick={() => setStatusOpen(statusOpen === r._id ? null : r._id)}>
              Status <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
            {statusOpen === r._id && (
              <div className="absolute right-0 bottom-full mb-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 min-w-[130px]">
                {(['PENDING','PROCESSED','PAID'] as PayrollStatus[]).filter(s => s !== r.status).map(s => (
                  <button key={s} onClick={() => { onStatusChange(s); setStatusOpen(null); }}
                    className="block w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    Mark as {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <Button variant="danger" size="sm" className="w-full justify-center py-1.5" onClick={onDelete}>
          Delete
        </Button>
      </div>
    ) : (
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
        {r.paidOn ? `Paid on ${new Date(r.paidOn).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}` : 'Awaiting payment'}
      </div>
    )}
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────
const Payroll = () => {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  const [page, setPage] = useState(1);
  const [empFilter, setEmpFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(String(CURRENT_YEAR));
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PayrollRecord | null>(null);
  const [statusOpen, setStatusOpen] = useState<string | null>(null);

  const params = {
    page, limit: 10,
    ...(empFilter && { employee: empFilter }),
    ...(monthFilter && { month: Number(monthFilter) }),
    ...(yearFilter && { year: Number(yearFilter) }),
    ...(statusFilter && { status: statusFilter }),
  };

  const { data, isLoading, isError, refetch } = usePayrolls(params);
  const { data: empData } = useEmployees({ limit: 200 }, canManage);
  const employees = empData?.employees ?? [];

  const createMutation = useCreatePayroll();
  const updateMutation = useUpdatePayroll(editTarget?._id ?? '');
  const deleteMutation = useDeletePayroll();
  const statusMutation = useUpdatePayrollStatus();

  const records = data?.data ?? [];
  const pagination = data?.pagination;

  const handleFormSubmit = (d: PayrollInput) => {
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
        title="Payroll"
        description={canManage ? "Manage employee payroll records." : "Your salary records."}
        action={canManage ? (
          <Button variant="primary" className="flex items-center justify-center gap-2 w-full sm:w-auto" onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Create Payroll
          </Button>
        ) : undefined}
      />

      {/* Filters */}
      <Card noPadding>
        <div className="px-4 py-3 flex flex-wrap gap-2 items-center">
          {canManage && (
            <select value={empFilter} onChange={e => { setEmpFilter(e.target.value); setPage(1); }}
              className="w-full lg:w-auto lg:flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">All Employees</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
          )}
          <div className="flex gap-2 flex-1 min-w-[200px]">
            <select value={monthFilter} onChange={e => { setMonthFilter(e.target.value); setPage(1); }}
              className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">All Months</option>
              {MONTHS.map((m, i) => <option key={i+1} value={String(i+1)}>{m}</option>)}
            </select>
            <select value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1); }}
              className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y} value={String(y)}>{y}</option>)}
            </select>
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="flex-1 sm:w-auto sm:flex-none text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="">All Status</option>
            {['PENDING','PROCESSED','PAID'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {(empFilter || monthFilter || statusFilter) && (
            <button onClick={() => { setEmpFilter(''); setMonthFilter(''); setStatusFilter(''); setPage(1); }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 underline whitespace-nowrap">Clear</button>
          )}
        </div>
      </Card>

      {/* Table */}
      {isLoading ? <LoadingSpinner /> : isError ? <ErrorState onRetry={() => refetch()} /> :
        records.length === 0 ? (
          <EmptyState icon={Banknote} title="No payroll records"
            description={canManage ? "Create the first payroll record." : "No payroll records found."}
            action={canManage ? <Button variant="primary" onClick={() => setFormOpen(true)}>Create Payroll</Button> : undefined}
          />
        ) : (
          <Card noPadding>
            <div className="hidden lg:block overflow-x-auto pb-24">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {[canManage && 'Employee', 'Month', 'Year', 'Basic', 'Allowances', 'Deductions', 'Gross', 'Net', 'Status', 'Actions']
                      .filter(Boolean).map(h => (
                      <th key={h as string} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {records.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      {canManage && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{r.employee.firstName} {r.employee.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{r.employee.employeeId}</p>
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{MONTHS[r.month - 1]}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{INR(r.basicSalary)}</td>
                      <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400 whitespace-nowrap">+{INR(r.allowances)}</td>
                      <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 whitespace-nowrap">-{INR(r.deductions)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-brand-700 dark:text-brand-400 whitespace-nowrap">{INR(r.grossSalary)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white whitespace-nowrap">{INR(r.netSalary)}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><Badge variant={STATUS_BADGE[r.status]}>{r.status}</Badge></td>
                      <td className="px-4 py-3 whitespace-nowrap relative">
                        <div className="flex items-center gap-2">
                          {canManage && r.status !== 'PAID' && (
                            <>
                              <button onClick={() => { setEditTarget(r); setFormOpen(true); }}
                                className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline px-1.5 py-1">Edit</button>
                              <div className="relative">
                                <button
                                  onClick={() => setStatusOpen(statusOpen === r._id ? null : r._id)}
                                  className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-0.5 px-1.5 py-1"
                                >
                                  Status <ChevronDown className="h-3 w-3" />
                                </button>
                                {statusOpen === r._id && (
                                  <div className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 min-w-[130px]">
                                    {(['PENDING','PROCESSED','PAID'] as PayrollStatus[]).filter(s => s !== r.status).map(s => (
                                      <button key={s} onClick={() => { statusMutation.mutate({ id: r._id, status: s }); setStatusOpen(null); }}
                                        className="block w-full text-left px-4 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                                        Mark as {s}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button onClick={() => { if (window.confirm('Delete this payroll record?')) deleteMutation.mutate(r._id); }}
                                className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline px-1.5 py-1">Delete</button>
                            </>
                          )}
                          {!canManage && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {r.paidOn ? `Paid ${new Date(r.paidOn).toLocaleDateString('en-IN', { day:'2-digit', month:'short' })}` : '—'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List (up to lg) */}
            <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {records.map((r: PayrollRecord) => (
                <PayrollMobileCard 
                  key={r._id} 
                  r={r} 
                  canManage={canManage}
                  onEdit={() => { setEditTarget(r); setFormOpen(true); }}
                  onDelete={() => { if (window.confirm('Delete this payroll record?')) deleteMutation.mutate(r._id); }}
                  onStatusChange={(s) => statusMutation.mutate({ id: r._id, status: s })}
                  statusOpen={statusOpen}
                  setStatusOpen={setStatusOpen}
                />
              ))}
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="secondary" disabled={pagination.page === 1} onClick={() => setPage(p => p - 1)} className="flex-1 sm:flex-none justify-center">Prev</Button>
                  <Button size="sm" variant="secondary" disabled={pagination.page === pagination.pages} onClick={() => setPage(p => p + 1)} className="flex-1 sm:flex-none justify-center">Next</Button>
                </div>
              </div>
            )}
          </Card>
        )
      }

      <PayrollFormModal
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

export default Payroll;

import { useState } from 'react';
import { Plus, CalendarOff, CheckCircle, XCircle } from 'lucide-react';
import { useLeaves, useApplyLeave, useCancelLeave, useUpdateLeaveStatus } from '../hooks/useLeaveQueries';
import { useEmployees } from '../hooks/useEmployeeQueries';
import { useAuthStore } from '../store/authStore';
import { LeaveRecord, LeaveStatus, LeaveType } from '../services/leaveService';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_BADGE: Record<LeaveStatus, 'success' | 'danger' | 'warning' | 'info' | 'gray'> = {
  APPROVED: 'success',
  REJECTED: 'danger',
  PENDING: 'warning',
  CANCELLED: 'gray',
};

// ── Apply Leave Modal ──────────────────────────────────────────────────────
interface ApplyLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (d: { leaveType: LeaveType; startDate: string; endDate: string; reason: string }) => void;
  isLoading: boolean;
  apiError?: string | null;
}

const ApplyLeaveModal = ({ isOpen, onClose, onSubmit, isLoading, apiError }: ApplyLeaveModalProps) => {
  const [form, setForm] = useState({ leaveType: 'CASUAL' as LeaveType, startDate: '', endDate: '', reason: '' });
  const [err, setErr] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErr('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.startDate || !form.endDate) { setErr('Start and end dates are required.'); return; }
    if (new Date(form.endDate) < new Date(form.startDate)) { setErr('End date cannot be before start date.'); return; }
    if (!form.reason.trim()) { setErr('Reason is required.'); return; }
    onSubmit(form);
  };

  const inputCls = 'block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-start justify-center sm:pt-10 px-0 sm:px-4">
      <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 max-h-[92vh] overflow-y-auto flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Apply for Leave</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
        </div>
        {(apiError || err) && (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {apiError || err}
          </div>
        )}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Leave Type</label>
            <select name="leaveType" value={form.leaveType} onChange={handleChange} className={inputCls}>
              {['CASUAL','SICK','EARNED','UNPAID','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date *</label>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange} className={inputCls} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason *</label>
            <textarea name="reason" value={form.reason} onChange={handleChange} rows={3}
              className={`${inputCls} resize-none`} placeholder="Briefly describe the reason for leave…" />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-2 mt-auto border-t border-gray-100 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>Submit Application</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── Reject Remark Modal ─────────────────────────────────────────────────────
interface RejectModalProps {
  isOpen: boolean;
  leaveId: string | null;
  onClose: () => void;
  onConfirm: (id: string, remarks: string) => void;
  isLoading: boolean;
}

const RejectModal = ({ isOpen, leaveId, onClose, onConfirm, isLoading }: RejectModalProps) => {
  const [remarks, setRemarks] = useState('');
  const [err, setErr] = useState('');

  if (!isOpen || !leaveId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-sm border border-gray-200 dark:border-gray-700 p-6 my-auto max-h-[90vh] flex flex-col">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Reject Leave</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Please provide a reason for rejection.</p>
        <textarea
          value={remarks}
          onChange={e => { setRemarks(e.target.value); setErr(''); }}
          rows={3}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:text-white resize-none shrink-0"
          placeholder="Reason for rejection…"
        />
        {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 mt-4 shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="danger" isLoading={isLoading} onClick={() => {
            if (!remarks.trim()) { setErr('Remark is required.'); return; }
            onConfirm(leaveId, remarks);
          }}>Reject</Button>
        </div>
      </div>
    </div>
  );
};

// ── Mobile Card View ───────────────────────────────────────────────────────
const LeaveMobileCard = ({ leave, canManage, onApprove, onReject, onCancel, isLoading }: {
  leave: LeaveRecord; canManage: boolean;
  onApprove: (id: string) => void; onReject: (id: string) => void; onCancel: (id: string) => void;
  isLoading: boolean;
}) => {
  const diff = (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          {canManage && (
            <>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{leave.employee.firstName} {leave.employee.lastName}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{leave.employee.employeeId}</p>
            </>
          )}
          {!canManage && <Badge variant="info">{leave.leaveType}</Badge>}
        </div>
        <div className="flex flex-col items-end gap-1">
          {canManage && <Badge variant="info">{leave.leaveType}</Badge>}
          <Badge variant={STATUS_BADGE[leave.status]}>{leave.status}</Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500 dark:text-gray-400 block">Duration</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            {' to '}
            {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>
          <span className="text-gray-500 dark:text-gray-400 ml-1">({diff}d)</span>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400 block">Applied On</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {new Date(leave.appliedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      <div>
        <span className="text-xs text-gray-500 dark:text-gray-400 block mb-0.5">Reason</span>
        <p className="text-sm text-gray-700 dark:text-gray-300">{leave.reason}</p>
      </div>

      {leave.remarks && leave.status === 'REJECTED' && (
        <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800">
          <span className="text-xs text-red-600 dark:text-red-400 block font-medium mb-0.5">Rejection Reason</span>
          <p className="text-xs text-red-700 dark:text-red-300">{leave.remarks}</p>
        </div>
      )}

      {leave.status === 'PENDING' && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
          {canManage ? (
            <>
              <Button size="sm" variant="secondary" className="flex-1 text-green-600 border-green-200 hover:bg-green-50 justify-center" onClick={() => onApprove(leave._id)} disabled={isLoading}>
                <CheckCircle className="h-4 w-4 mr-1" /> Approve
              </Button>
              <Button size="sm" variant="secondary" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 justify-center" onClick={() => onReject(leave._id)} disabled={isLoading}>
                <XCircle className="h-4 w-4 mr-1" /> Reject
              </Button>
            </>
          ) : (
            <Button size="sm" variant="danger" className="w-full justify-center" onClick={() => { if (window.confirm('Cancel this leave application?')) onCancel(leave._id); }} disabled={isLoading}>
              Cancel Application
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const Leaves = () => {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  const [applyOpen, setApplyOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const params = {
    page, limit: 10,
    ...(statusFilter && { status: statusFilter }),
    ...(typeFilter && { leaveType: typeFilter }),
    ...(canManage && employeeFilter && { employee: employeeFilter }),
  };

  const { data, isLoading, isError, refetch } = useLeaves(params);
  const { data: empData } = useEmployees({ limit: 200 }, canManage);
  const employees = empData?.employees ?? [];

  const applyMutation = useApplyLeave();
  const cancelMutation = useCancelLeave();
  const statusMutation = useUpdateLeaveStatus();

  const leaves = data?.data ?? [];
  const pagination = data?.pagination;

  const applyError = (applyMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? null;

  const handleApply = (d: { leaveType: LeaveType; startDate: string; endDate: string; reason: string }) => {
    applyMutation.mutate(d, { onSuccess: () => { setApplyOpen(false); applyMutation.reset(); } });
  };

  const handleApprove = (id: string) => {
    statusMutation.mutate({ id, status: 'APPROVED' });
  };

  const handleReject = (id: string, remarks: string) => {
    statusMutation.mutate({ id, status: 'REJECTED', remarks }, {
      onSuccess: () => setRejectTarget(null),
    });
  };

  const days = (start: string, end: string) => {
    const diff = (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24) + 1;
    return `${diff}d`;
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leave Management"
        description={canManage ? "Manage employee leave applications." : "Your leave applications."}
        action={!canManage ? (
          <Button variant="primary" className="flex items-center justify-center gap-2 w-full sm:w-auto" onClick={() => setApplyOpen(true)}>
            <Plus className="h-4 w-4" /> Apply for Leave
          </Button>
        ) : undefined}
      />

      {/* Filters */}
      <Card noPadding>
        <div className="px-4 py-3 flex flex-wrap gap-2 items-center">
          {canManage && (
            <select value={employeeFilter} onChange={e => { setEmployeeFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-auto sm:flex-1 min-w-[140px] text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">All Employees</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
          )}
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="flex-1 sm:w-auto min-w-[120px] text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="">All Status</option>
            {['PENDING','APPROVED','REJECTED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
            className="flex-1 sm:w-auto min-w-[120px] text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
            <option value="">All Types</option>
            {['CASUAL','SICK','EARNED','UNPAID','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          {(statusFilter || typeFilter || employeeFilter) && (
            <button onClick={() => { setStatusFilter(''); setTypeFilter(''); setEmployeeFilter(''); setPage(1); }}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 underline whitespace-nowrap">Clear</button>
          )}
        </div>
      </Card>

      {/* Table */}
      {isLoading ? <LoadingSpinner /> : isError ? <ErrorState onRetry={() => refetch()} /> :
        leaves.length === 0 ? (
          <EmptyState
            icon={CalendarOff}
            title="No leave records"
            description={canManage ? "No applications match the selected filters." : "You haven't applied for any leave yet."}
            action={!canManage ? <Button variant="primary" onClick={() => setApplyOpen(true)}>Apply for Leave</Button> : undefined}
          />
        ) : (
          <Card noPadding>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {[canManage && 'Employee', 'Type', 'Dates', 'Days', 'Reason', 'Status', 'Applied On', 'Actions']
                      .filter(Boolean).map(h => (
                      <th key={h as string} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {leaves.map((leave: LeaveRecord) => (
                    <tr key={leave._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      {canManage && (
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{leave.employee.firstName} {leave.employee.lastName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{leave.employee.employeeId}</p>
                        </td>
                      )}
                      <td className="px-4 py-3 whitespace-nowrap"><Badge variant="info">{leave.leaveType}</Badge></td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        <p>{new Date(leave.startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        <p className="text-xs text-gray-400">to {new Date(leave.endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{days(leave.startDate, leave.endDate)}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[150px] truncate" title={leave.reason}>{leave.reason}</td>
                      <td className="px-4 py-3">
                        <div className="whitespace-nowrap">
                          <Badge variant={STATUS_BADGE[leave.status]}>{leave.status}</Badge>
                          {leave.remarks && leave.status === 'REJECTED' && (
                            <p className="text-xs text-gray-400 mt-1 truncate max-w-[120px]" title={leave.remarks}>{leave.remarks}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        {new Date(leave.appliedOn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-wrap min-w-[140px]">
                          {canManage && leave.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(leave._id)}
                                disabled={statusMutation.isPending}
                                className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 hover:underline disabled:opacity-50 py-1 px-1.5"
                              >
                                <CheckCircle className="h-4 w-4" /> Approve
                              </button>
                              <button
                                onClick={() => setRejectTarget(leave._id)}
                                className="flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400 hover:underline py-1 px-1.5"
                              >
                                <XCircle className="h-4 w-4" /> Reject
                              </button>
                            </>
                          )}
                          {!canManage && leave.status === 'PENDING' && (
                            <button
                              onClick={() => { if (window.confirm('Cancel this leave application?')) cancelMutation.mutate(leave._id); }}
                              disabled={cancelMutation.isPending}
                              className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 py-1 px-1.5"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {leaves.map((leave: LeaveRecord) => (
                <LeaveMobileCard 
                  key={leave._id} 
                  leave={leave} 
                  canManage={canManage}
                  onApprove={handleApprove}
                  onReject={setRejectTarget}
                  onCancel={(id) => cancelMutation.mutate(id)}
                  isLoading={statusMutation.isPending || cancelMutation.isPending}
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

      <ApplyLeaveModal
        isOpen={applyOpen}
        onClose={() => { setApplyOpen(false); applyMutation.reset(); }}
        onSubmit={handleApply}
        isLoading={applyMutation.isPending}
        apiError={applyError}
      />

      <RejectModal
        isOpen={!!rejectTarget}
        leaveId={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        isLoading={statusMutation.isPending}
      />
    </div>
  );
};

export default Leaves;

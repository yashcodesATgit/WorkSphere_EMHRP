import { useState, useEffect } from 'react';
import { Plus, Star, LineChart, Check } from 'lucide-react';
import {
  usePerformanceReviews, useCreatePerformanceReview, useUpdatePerformanceReview,
  useDeletePerformanceReview, useCompletePerformanceReview,
} from '../hooks/usePerformanceQueries';
import { useEmployees } from '../hooks/useEmployeeQueries';
import { useAuthStore } from '../store/authStore';
import { PerformanceRecord, PerformanceInput } from '../services/performanceService';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';

// ─── Star Rating Display ───────────────────────────────────────────────────
const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(s => (
      <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
    ))}
  </div>
);

// ─── Performance Form Modal ────────────────────────────────────────────────
interface FormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (d: PerformanceInput) => void;
  isLoading: boolean;
  apiError?: string | null;
  initial?: PerformanceRecord | null;
  employees: { _id: string; firstName: string; lastName: string; employeeId: string }[];
}

const EMPTY_FORM: PerformanceInput = {
  employee: '', reviewPeriod: '', reviewDate: '',
  rating: 3, goals: '', strengths: '', improvements: '', comments: '',
};

const PerformanceFormModal = ({ isOpen, onClose, onSubmit, isLoading, apiError, initial, employees }: FormProps) => {
  const [form, setForm] = useState<PerformanceInput>(EMPTY_FORM);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (isOpen) {
      setErr('');
      setForm(initial ? {
        employee: initial.employee._id,
        reviewPeriod: initial.reviewPeriod,
        reviewDate: initial.reviewDate.slice(0, 10),
        rating: initial.rating,
        goals: initial.goals,
        strengths: initial.strengths,
        improvements: initial.improvements,
        comments: initial.comments,
      } : EMPTY_FORM);
    }
  }, [isOpen, initial]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: name === 'rating' ? Number(value) : value }));
    setErr('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.employee || !form.reviewPeriod || !form.reviewDate) { setErr('Employee, review period, and review date are required.'); return; }
    if (form.rating < 1 || form.rating > 5) { setErr('Rating must be between 1 and 5.'); return; }
    onSubmit(form);
  };

  const inputCls = 'block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:text-white';
  const textareaCls = `${inputCls} resize-none`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-0 sm:p-4 sm:pt-6 pb-12">
        <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-none sm:rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 min-h-screen sm:min-h-0 flex flex-col">
          <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{initial ? 'Edit Review' : 'Create Performance Review'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 sm:hidden">✕</button>
          </div>
          {(apiError || err) && (
            <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 shrink-0">{apiError || err}</div>
          )}
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-5 flex-1">
            {/* Identity */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Review Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employee *</label>
                  <select name="employee" value={form.employee} onChange={handleChange} className={inputCls} disabled={!!initial}>
                    <option value="">Select employee</option>
                    {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Period *</label>
                  <input name="reviewPeriod" value={form.reviewPeriod} onChange={handleChange} className={inputCls} placeholder="Q3 2026 / Jan–Jun 2026" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Review Date *</label>
                  <input type="date" name="reviewDate" value={form.reviewDate} onChange={handleChange} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Rating */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Rating</h3>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} type="button"
                      onClick={() => setForm(p => ({ ...p, rating: s }))}
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${s <= form.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'}`}
                    >
                      <Star className={`h-6 w-6 ${s <= form.rating ? 'fill-yellow-400' : ''}`} />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{form.rating} / 5</span>
              </div>
            </div>

            {/* Narrative fields */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Feedback</h3>
              <div className="space-y-3">
                {[['goals','Goals'], ['strengths','Strengths'], ['improvements','Areas for Improvement'], ['comments','Additional Comments']].map(([field, label]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
                    <textarea name={field} value={(form as unknown as Record<string, string>)[field]} onChange={handleChange} rows={2} className={textareaCls} placeholder={`Enter ${label.toLowerCase()}…`} />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 sm:pt-2 mt-auto border-t border-gray-100 dark:border-gray-700 shrink-0">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>{initial ? 'Update Review' : 'Create Review'}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── Detail Card (Employee view) ────────────────────────────────────────────
const ReviewCard = ({ review }: { review: PerformanceRecord }) => (
  <Card>
    <div className="flex items-start justify-between mb-4">
      <div>
        <p className="text-base font-semibold text-gray-900 dark:text-white">{review.reviewPeriod}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {new Date(review.reviewDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
          {review.reviewer && ` · Reviewed by ${review.reviewer.name}`}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
        <StarRating rating={review.rating} />
        <Badge variant={review.status === 'COMPLETED' ? 'success' : 'warning'}>{review.status}</Badge>
      </div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
      {[['Goals', review.goals], ['Strengths', review.strengths], ['Areas for Improvement', review.improvements], ['Comments', review.comments]].map(([label, val]) => val ? (
        <div key={label as string}>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{val}</p>
        </div>
      ) : null)}
    </div>
  </Card>
);

// ─── Mobile List Item (Admin view) ──────────────────────────────────────────
const AdminReviewMobileCard = ({ r, onEdit, onComplete, onDelete, isLoading }: {
  r: PerformanceRecord;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
  isLoading: boolean;
}) => (
  <div className="p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{r.employee.firstName} {r.employee.lastName}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{r.employee.employeeId}</p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'}>{r.status}</Badge>
        <StarRating rating={r.rating} />
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/50 p-2 rounded">
      <div>
        <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Period</span>
        <span className="font-medium text-gray-900 dark:text-white">{r.reviewPeriod}</span>
      </div>
      <div>
        <span className="text-gray-500 dark:text-gray-400 block mb-0.5">Date</span>
        <span className="font-medium text-gray-900 dark:text-white">
          {new Date(r.reviewDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
        </span>
      </div>
    </div>

    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
      {r.status === 'DRAFT' && (
        <>
          <Button variant="secondary" size="sm" className="flex-1 justify-center py-1.5" onClick={onEdit}>
            Edit
          </Button>
          <Button variant="secondary" size="sm" className="flex-1 justify-center py-1.5 text-green-600 border-green-200" onClick={onComplete} disabled={isLoading}>
            <Check className="h-4 w-4 mr-1" /> Complete
          </Button>
        </>
      )}
      <Button variant="danger" size="sm" className="flex-1 justify-center py-1.5" onClick={onDelete}>
        Delete
      </Button>
    </div>
  </div>
);

// ─── Main Page ──────────────────────────────────────────────────────────────
const Performance = () => {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  const [page, setPage] = useState(1);
  const [empFilter, setEmpFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PerformanceRecord | null>(null);

  const params = {
    page, limit: 10,
    ...(empFilter && { employee: empFilter }),
    ...(statusFilter && { status: statusFilter }),
    ...(ratingFilter && { rating: Number(ratingFilter) }),
  };

  const { data, isLoading, isError, refetch } = usePerformanceReviews(params);
  const { data: empData } = useEmployees({ limit: 200 }, canManage);
  const employees = empData?.employees ?? [];

  const createMutation = useCreatePerformanceReview();
  const updateMutation = useUpdatePerformanceReview(editTarget?._id ?? '');
  const deleteMutation = useDeletePerformanceReview();
  const completeMutation = useCompletePerformanceReview();

  const reviews = data?.data ?? [];
  const pagination = data?.pagination;

  const handleFormSubmit = (d: PerformanceInput) => {
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
        title="Performance"
        description={canManage ? "Manage performance reviews." : "Your performance reviews."}
        action={canManage ? (
          <Button variant="primary" className="flex items-center justify-center gap-2 w-full sm:w-auto" onClick={() => { setEditTarget(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Create Review
          </Button>
        ) : undefined}
      />

      {/* Filters — ADMIN/HR only */}
      {canManage && (
        <Card noPadding>
          <div className="px-4 py-3 flex flex-wrap gap-2 items-center">
            <select value={empFilter} onChange={e => { setEmpFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-auto sm:flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="">All Employees</option>
              {employees.map(e => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
            <div className="flex gap-2 flex-1 sm:flex-none">
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="flex-1 sm:w-auto min-w-[110px] text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <select value={ratingFilter} onChange={e => { setRatingFilter(e.target.value); setPage(1); }}
                className="flex-1 sm:w-auto min-w-[110px] text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500">
                <option value="">All Ratings</option>
                {[5,4,3,2,1].map(r => <option key={r} value={String(r)}>{r} Star{r !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            {(empFilter || statusFilter || ratingFilter) && (
              <button onClick={() => { setEmpFilter(''); setStatusFilter(''); setRatingFilter(''); setPage(1); }}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 underline whitespace-nowrap">Clear</button>
            )}
          </div>
        </Card>
      )}

      {/* Content */}
      {isLoading ? <LoadingSpinner /> : isError ? <ErrorState onRetry={() => refetch()} /> :
        reviews.length === 0 ? (
          <EmptyState icon={LineChart} title="No performance reviews"
            description={canManage ? "Create the first performance review." : "No reviews have been created for you yet."}
            action={canManage ? <Button variant="primary" onClick={() => setFormOpen(true)}>Create Review</Button> : undefined}
          />
        ) : canManage ? (
          /* Admin/HR view */
          <Card noPadding>
            {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    {['Employee', 'Review Period', 'Date', 'Rating', 'Reviewer', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {reviews.map(r => (
                    <tr key={r._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{r.employee.firstName} {r.employee.lastName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{r.employee.employeeId}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.reviewPeriod}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {new Date(r.reviewDate).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap"><StarRating rating={r.rating} /></td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{r.reviewer?.name ?? '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'}>{r.status}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          {r.status === 'DRAFT' && (
                            <>
                              <button onClick={() => { setEditTarget(r); setFormOpen(true); }}
                                className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline py-1">Edit</button>
                              <button
                                onClick={() => { if (window.confirm('Mark this review as completed?')) completeMutation.mutate(r._id); }}
                                disabled={completeMutation.isPending}
                                className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400 hover:underline disabled:opacity-50 py-1"
                              >
                                <Check className="h-3 w-3" /> Complete
                              </button>
                            </>
                          )}
                          <button onClick={() => { if (window.confirm('Delete this review?')) deleteMutation.mutate(r._id); }}
                            className="text-xs font-medium text-red-600 dark:text-red-400 hover:underline py-1">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile List */}
            <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
              {reviews.map(r => (
                <AdminReviewMobileCard
                  key={r._id}
                  r={r}
                  onEdit={() => { setEditTarget(r); setFormOpen(true); }}
                  onComplete={() => { if (window.confirm('Mark this review as completed?')) completeMutation.mutate(r._id); }}
                  onDelete={() => { if (window.confirm('Delete this review?')) deleteMutation.mutate(r._id); }}
                  isLoading={completeMutation.isPending}
                />
              ))}
            </div>

            {/* Pagination */}
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
        ) : (
          /* Employee view — read only */
          <div className="space-y-4">
            {reviews.map(r => <ReviewCard key={r._id} review={r} />)}
            {pagination && pagination.pages > 1 && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                  {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                </p>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button size="sm" variant="secondary" disabled={pagination.page === 1} onClick={() => setPage(p => p - 1)} className="flex-1 sm:flex-none justify-center">Prev</Button>
                  <Button size="sm" variant="secondary" disabled={pagination.page === pagination.pages} onClick={() => setPage(p => p + 1)} className="flex-1 sm:flex-none justify-center">Next</Button>
                </div>
              </div>
            )}
          </div>
        )
      }

      <PerformanceFormModal
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

export default Performance;

import { useState } from 'react';
import { Plus, Users, PenLine, X } from 'lucide-react';
import { useDepartments, useCreateDepartment, useUpdateDepartment, useToggleDepartmentStatus } from '../hooks/useDepartmentQueries';
import { useAuthStore } from '../store/authStore';
import { Department, DepartmentInput } from '../services/departmentService';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';

interface DeptFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentInput) => void;
  isLoading: boolean;
  error?: string | null;
  initialData?: Department | null;
}

const DepartmentFormModal: React.FC<DeptFormProps> = ({ isOpen, onClose, onSubmit, isLoading, error, initialData }) => {
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [nameError, setNameError] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setNameError('Department name is required.'); return; }
    onSubmit({ name: name.trim(), description: description.trim() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-b-xl sm:rounded-xl shadow-xl w-full max-w-md border border-gray-200 dark:border-gray-700 sm:my-auto max-h-[95vh] flex flex-col">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Edit Department' : 'Add Department'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 sm:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 shrink-0">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4 flex-1">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(''); }}
              className={`block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white ${nameError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-brand-500 dark:border-gray-600'}`}
              placeholder="Engineering"
            />
            {nameError && <p className="mt-1 text-xs text-red-600">{nameError}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Brief description…"
            />
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 sm:pt-2 mt-auto border-t border-gray-100 dark:border-gray-700 shrink-0">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              {initialData ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Departments = () => {
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Department | null>(null);

  const { data: departments = [], isLoading, isError, refetch } = useDepartments();
  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment(editTarget?._id ?? '');
  const toggleStatusMutation = useToggleDepartmentStatus();

  function openCreate() { setEditTarget(null); setFormOpen(true); }
  function openEdit(dept: Department) { setEditTarget(dept); setFormOpen(true); }

  function handleSubmit(data: DepartmentInput) {
    if (editTarget) {
      updateMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
    } else {
      createMutation.mutate(data, { onSuccess: () => setFormOpen(false) });
    }
  }

  const formError = editTarget
    ? (updateMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? null
    : (createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? null;

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Departments"
        description="Manage your organization's departments."
        action={
          canManage ? (
            <Button variant="primary" onClick={openCreate} className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Add Department
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No departments yet"
          description="Create your first department to get started."
          action={canManage ? <Button variant="primary" onClick={openCreate}>Add Department</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {departments.map((dept) => (
            <Card key={dept._id} noPadding>
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{dept.name}</h3>
                    {dept.description && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{dept.description}</p>
                    )}
                  </div>
                  <Badge variant={dept.isActive ? 'success' : 'gray'} className="flex-shrink-0">
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{(dept as Department & { employeeCount?: number }).employeeCount ?? 0} employees</span>
                </div>

                {canManage && (
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                    <button onClick={() => openEdit(dept)} className="flex items-center gap-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-1">
                      <PenLine className="h-3 w-3" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`${dept.isActive ? 'Deactivate' : 'Activate'} "${dept.name}"?`)) {
                          toggleStatusMutation.mutate(dept._id);
                        }
                      }}
                      className={`text-xs font-medium hover:underline py-1 ${dept.isActive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                    >
                      {dept.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <DepartmentFormModal
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); createMutation.reset(); updateMutation.reset(); }}
        onSubmit={handleSubmit}
        isLoading={isFormLoading}
        error={formError}
        initialData={editTarget}
      />
    </div>
  );
};

export default Departments;

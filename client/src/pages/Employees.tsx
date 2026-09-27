import { useState } from 'react';
import { Search, Plus, Users, Mail, Building2, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmployees, useCreateEmployee, useUpdateEmployee, useToggleEmployeeStatus } from '../hooks/useEmployeeQueries';
import { useDepartments } from '../hooks/useDepartmentQueries';
import { useAuthStore } from '../store/authStore';
import { Employee, EmployeeInput } from '../services/employeeService';
import api from '../lib/axios';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import LoadingSpinner from '../components/LoadingSpinner';
import EmployeeForm, { EmployeeFormData } from '../components/EmployeeForm';

// ── Mobile Card View ───────────────────────────────────────────────────────
const EmployeeMobileCard = ({ emp, navigate, canManage, onEdit, onToggleStatus }: {
  emp: Employee; navigate: any; canManage: boolean;
  onEdit: () => void; onToggleStatus: () => void;
}) => (
  <div className="p-4 space-y-3">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">{emp.firstName} {emp.lastName}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{emp.employeeId}</p>
      </div>
      <Badge variant={emp.isActive ? 'success' : 'gray'}>{emp.isActive ? 'Active' : 'Inactive'}</Badge>
    </div>

    <div className="space-y-1.5 text-sm">
      <div className="flex items-center text-gray-600 dark:text-gray-300 gap-2">
        <Mail className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="truncate">{emp.email}</span>
      </div>
      <div className="flex items-center text-gray-600 dark:text-gray-300 gap-2">
        <Building2 className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="truncate">{emp.department?.name ?? '—'}</span>
      </div>
      <div className="flex items-center text-gray-600 dark:text-gray-300 gap-2">
        <FileText className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="truncate">{emp.designation}</span>
      </div>
      <div className="flex items-center text-gray-600 dark:text-gray-300 gap-2">
        <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
        <span>Joined: {new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
      </div>
    </div>

    <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
      <Button variant="secondary" size="sm" className="flex-1 justify-center py-1" onClick={() => navigate(`/employees/${emp._id}`)}>
        View Profile
      </Button>
      {canManage && (
        <>
          <Button variant="secondary" size="sm" className="flex-1 justify-center py-1" onClick={onEdit}>
            Edit
          </Button>
          <Button variant={emp.isActive ? 'danger' : 'primary'} size="sm" className="flex-1 justify-center py-1" onClick={() => {
            if (window.confirm(`${emp.isActive ? 'Deactivate' : 'Activate'} ${emp.firstName} ${emp.lastName}?`)) onToggleStatus();
          }}>
            {emp.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </>
      )}
    </div>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const Employees = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const canManage = user?.role === 'ADMIN' || user?.role === 'HR';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive' | ''>('');
  const [sort, setSort] = useState('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Employee | null>(null);

  const { data, isLoading, isError, refetch } = useEmployees({ page, limit: 10, search, department, status, sort, order });
  const { data: departments = [] } = useDepartments();

  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee(editTarget?._id || '');
  const toggleStatusMutation = useToggleEmployeeStatus();

  const employees = data?.employees ?? [];
  const pagination = data?.pagination;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function openCreate() {
    setEditTarget(null);
    setFormOpen(true);
  }

  function openEdit(emp: Employee) {
    setEditTarget(emp);
    setFormOpen(true);
  }

  async function handleFormSubmit(formData: EmployeeFormData) {
    const { password, ...employeeData } = formData;
    if (editTarget) {
      updateMutation.mutate(employeeData as EmployeeInput, { onSuccess: () => setFormOpen(false) });
    } else {
      createMutation.mutate(employeeData as EmployeeInput, {
        onSuccess: async (newEmployee) => {
          if (password && password.length >= 6) {
            try {
              await api.post(`/employees/${newEmployee._id}/account`, { password });
            } catch {
              // Account creation failed silently — admin can set it from the profile later
            }
          }
          setFormOpen(false);
        },
      });
    }
  }

  const formError = editTarget
    ? (updateMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? null
    : (createMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? null;

  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employees"
        description="Manage your organization's workforce."
        action={
          canManage ? (
            <Button variant="primary" onClick={openCreate} className="flex items-center justify-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          ) : undefined
        }
      />

      {/* Filters */}
      <Card noPadding>
        <div className="px-4 py-3 flex flex-wrap gap-3 items-center">
          <form onSubmit={handleSearch} className="flex gap-2 w-full lg:flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, email, ID…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <Button type="submit" variant="secondary" size="sm">Search</Button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto flex-shrink-0">
            <select
              value={department}
              onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>

            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as 'active' | 'inactive' | ''); setPage(1); }}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={`${sort}:${order}`}
              onChange={(e) => {
                const [s, o] = e.target.value.split(':');
                setSort(s); setOrder(o as 'asc' | 'desc'); setPage(1);
              }}
              className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="createdAt:desc">Newest first</option>
              <option value="createdAt:asc">Oldest first</option>
              <option value="joiningDate:desc">Joining (newest)</option>
              <option value="joiningDate:asc">Joining (oldest)</option>
              <option value="firstName:asc">Name (A-Z)</option>
              <option value="firstName:desc">Name (Z-A)</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner />
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : employees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No employees found"
          description={search || department || status ? 'Try adjusting your filters.' : 'Add your first employee to get started.'}
          action={canManage ? <Button variant="primary" onClick={openCreate}>Add Employee</Button> : undefined}
        />
      ) : (
        <Card noPadding>
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  {['Emp ID', 'Name', 'Department', 'Designation', 'Status', 'Joining Date', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-gray-600 dark:text-gray-300 whitespace-nowrap">{emp.employeeId}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{emp.firstName} {emp.lastName}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{emp.email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{emp.department?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{emp.designation}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={emp.isActive ? 'success' : 'gray'}>{emp.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {new Date(emp.joiningDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <button onClick={() => navigate(`/employees/${emp._id}`)}
                          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline py-1 px-1.5">View</button>
                        {canManage && (
                          <>
                            <button onClick={() => openEdit(emp)}
                              className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:underline py-1 px-1.5">Edit</button>
                            <button
                              onClick={() => {
                                if (window.confirm(`${emp.isActive ? 'Deactivate' : 'Activate'} ${emp.firstName} ${emp.lastName}?`)) {
                                  toggleStatusMutation.mutate(emp._id);
                                }
                              }}
                              className={`text-xs font-medium hover:underline py-1 px-1.5 ${emp.isActive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}
                            >
                              {emp.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
            {employees.map(emp => (
              <EmployeeMobileCard 
                key={emp._id} 
                emp={emp} 
                navigate={navigate} 
                canManage={canManage}
                onEdit={() => openEdit(emp)}
                onToggleStatus={() => toggleStatusMutation.mutate(emp._id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button size="sm" variant="secondary" disabled={pagination.page === 1} onClick={() => setPage(p => p - 1)} className="flex-1 sm:flex-none justify-center">Prev</Button>
                <Button size="sm" variant="secondary" disabled={pagination.page === pagination.pages} onClick={() => setPage(p => p + 1)} className="flex-1 sm:flex-none justify-center">Next</Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <EmployeeForm
        isOpen={formOpen}
        onClose={() => { setFormOpen(false); createMutation.reset(); updateMutation.reset(); }}
        onSubmit={handleFormSubmit}
        isLoading={isFormLoading}
        error={formError}
        initialData={editTarget}
        title={editTarget ? 'Edit Employee' : 'Add Employee'}
      />
    </div>
  );
};

export default Employees;

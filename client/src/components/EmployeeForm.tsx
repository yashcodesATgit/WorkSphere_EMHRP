import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, KeyRound } from 'lucide-react';
import Button from './Button';
import { useDepartments } from '../hooks/useDepartmentQueries';
import { EmployeeInput, Employee } from '../services/employeeService';

export interface EmployeeFormData extends EmployeeInput {
  password?: string; // optional — only sent when creating, not editing
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EmployeeFormData) => void;
  isLoading: boolean;
  error?: string | null;
  initialData?: Employee | null;
  title: string;
}

const EMPTY_FORM: EmployeeFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  department: '',
  designation: '',
  joiningDate: '',
  employmentStatus: 'Full-time',
  salary: 0,
  password: '',
};

const EmployeeForm: React.FC<Props> = ({ isOpen, onClose, onSubmit, isLoading, error, initialData, title }) => {
  const { data: departments = [] } = useDepartments();
  const [form, setForm] = useState<EmployeeFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});
  const [showPw, setShowPw] = useState(false);

  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          firstName: initialData.firstName,
          lastName: initialData.lastName,
          email: initialData.email,
          phone: initialData.phone || '',
          dateOfBirth: initialData.dateOfBirth ? initialData.dateOfBirth.slice(0, 10) : '',
          gender: initialData.gender || '',
          address: initialData.address || '',
          department: initialData.department?._id || '',
          designation: initialData.designation,
          joiningDate: initialData.joiningDate ? initialData.joiningDate.slice(0, 10) : '',
          employmentStatus: initialData.employmentStatus,
          salary: initialData.salary,
          password: '',
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({});
      setShowPw(false);
    }
  }, [isOpen, initialData]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof EmployeeFormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof EmployeeFormData, string>> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.department) errs.department = 'Required';
    if (!form.designation.trim()) errs.designation = 'Required';
    if (!form.joiningDate) errs.joiningDate = 'Required';
    if (!isEditing && form.password && form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, salary: Number(form.salary) || 0 });
  }

  if (!isOpen) return null;

  const inputClass = (field: keyof EmployeeFormData) =>
    `block w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 transition-colors ${
      errors[field]
        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
        : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600'
    }`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-start justify-center p-0 sm:p-4 sm:pt-6 pb-12">
        <div className="fixed inset-0 bg-gray-900/60" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-none sm:rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-gray-700 min-h-screen sm:min-h-0 flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 shrink-0">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 sm:hidden">
              <X className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="hidden sm:block text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mx-4 sm:mx-6 mt-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 shrink-0">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 space-y-5 flex-1 overflow-y-auto">
            {/* Personal Information */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Personal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} className={inputClass('firstName')} placeholder="John" />
                  {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} className={inputClass('lastName')} placeholder="Doe" />
                  {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} className={inputClass('dateOfBirth')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className={inputClass('gender')}>
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass('email')} placeholder="john@company.com" />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} className={inputClass('phone')} placeholder="+91 9876543210" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <textarea name="address" value={form.address} onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
                    rows={2} className={`${inputClass('address')} resize-none`} placeholder="123 Main St, City" />
                </div>
              </div>
            </div>

            {/* Employment */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Employment Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department *</label>
                  <select name="department" value={form.department} onChange={handleChange} className={inputClass('department')}>
                    <option value="">Select department</option>
                    {departments.filter(d => d.isActive).map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.department && <p className="mt-1 text-xs text-red-600">{errors.department}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Designation *</label>
                  <input name="designation" value={form.designation} onChange={handleChange} className={inputClass('designation')} placeholder="Software Engineer" />
                  {errors.designation && <p className="mt-1 text-xs text-red-600">{errors.designation}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Joining Date *</label>
                  <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} className={inputClass('joiningDate')} />
                  {errors.joiningDate && <p className="mt-1 text-xs text-red-600">{errors.joiningDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Employment Type</label>
                  <select name="employmentStatus" value={form.employmentStatus} onChange={handleChange} className={inputClass('employmentStatus')}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Compensation */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">Compensation</h3>
              <div className="w-full sm:w-2/3 lg:w-1/2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salary (₹ / month)</label>
                <input type="number" name="salary" value={form.salary} onChange={handleChange} min={0} className={inputClass('salary')} placeholder="50000" />
              </div>
            </div>

            {/* Login Account — only shown when CREATING, not editing */}
            {!isEditing && (
              <div className="rounded-lg border border-dashed border-brand-300 dark:border-brand-700 bg-brand-50/40 dark:bg-brand-900/10 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <KeyRound className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-400">
                    Login Account <span className="normal-case font-normal text-gray-400">(optional)</span>
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Set a password now so the employee can log in immediately. You can also do this later from their profile.
                </p>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Set login password (min 6 chars)"
                    className={`${inputClass('password')} pr-10`}
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                {form.password && form.password.length >= 6 && (
                  <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                    ✓ Login will be: <strong>{form.email || 'employee email'}</strong>
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 sm:gap-3 pt-4 sm:pt-2 mt-auto border-t border-gray-200 dark:border-gray-700 shrink-0">
              <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
              <Button type="submit" variant="primary" isLoading={isLoading}>
                {isEditing ? 'Update Employee' : 'Add Employee'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;

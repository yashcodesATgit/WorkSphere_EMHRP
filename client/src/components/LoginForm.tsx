import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { loginUser } from '../services/authService';
import Button from './Button';

interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!values.password) {
    errors.password = 'Password is required.';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  return errors;
}

interface LoginFormProps {
  onSuccess?: () => void;
  title?: string;
  description?: string;
}

const LoginForm = ({ onSuccess, title, description }: LoginFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  const [values, setValues] = useState<FormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      setUser(data.user, data.token);
      if (onSuccess) {
        onSuccess();
      }
      navigate(from, { replace: true });
    },
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (loginMutation.isError) loginMutation.reset();
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    loginMutation.mutate(values);
  }

  const loginError = loginMutation.isError
    ? (loginMutation.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Login failed. Please try again.'
    : null;

  const isLoading = loginMutation.isPending;

  return (
    <div>
      {(title || description) && (
        <div className="mb-5">
          {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>}
          {description && <p className="mt-0.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
      )}

      {loginError && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500 dark:text-red-400" />
          <p className="text-xs text-red-700 dark:text-red-400">{loginError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="you@example.com"
            className={`block w-full rounded-md border px-3 py-2 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 disabled:opacity-50 transition-colors ${
              errors.email
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
                : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600'
            }`}
          />
          {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={values.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="••••••••"
              className={`block w-full rounded-md border px-3 py-2 pr-10 text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 disabled:opacity-50 transition-colors ${
                errors.password
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500 dark:border-red-700'
                  : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500 dark:border-gray-600'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
        </div>

        <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full justify-center mt-2">
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>

        {/* Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mb-3">Quick Login (Demo)</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setValues({ email: 'admin@company.com', password: 'admin123' })}
              className="flex-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => setValues({ email: 'hr@company.com', password: 'hr123' })}
              className="flex-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              HR
            </button>
            <button
              type="button"
              onClick={() => setValues({ email: 'emp1@company.com', password: 'emp123' })}
              className="flex-1 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-2 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Employee
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;

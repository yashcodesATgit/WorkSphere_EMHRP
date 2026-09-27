import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve the attempted URL so we can redirect back after login (Phase 5)
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

/** Restricts a route to specific roles; redirects others to /dashboard */
export const RoleRoute = ({ roles }: { roles: string[] }) => {
  const user = useAuthStore((state) => state.user);
  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;

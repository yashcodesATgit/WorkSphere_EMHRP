import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute, { RoleRoute } from './ProtectedRoute';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import EmployeeProfile from '../pages/EmployeeProfile';
import Departments from '../pages/Departments';
import Attendance from '../pages/Attendance';
import Leaves from '../pages/Leaves';
import Payroll from '../pages/Payroll';
import Performance from '../pages/Performance';

const AppRoutes = () => (
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leave" element={<Leaves />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="performance" element={<Performance />} />

          {/* Admin / HR only */}
          <Route element={<RoleRoute roles={['ADMIN', 'HR']} />}>
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeProfile />} />
            <Route path="departments" element={<Departments />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);

export default AppRoutes;

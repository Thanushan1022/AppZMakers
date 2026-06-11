import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router';
import { useAuthController } from './controllers/useAuthController';
import { useEmployeeController } from './controllers/useEmployeeController';
import { useHRController } from './controllers/useHRController';
import { useCompanyController } from './controllers/useCompanyController';
import { useAdminController } from './controllers/useAdminController';

// Import Layout & Login
import { Layout } from './views/components/Layout';
import { Login } from './views/components/Login';

// Import Views
// Employee
import { EmployeeDashboardView } from './views/pages/employee/EmployeeDashboardView';
import { EmployeeAttendanceView } from './views/pages/employee/EmployeeAttendanceView';
import { EmployeeLeaveView } from './views/pages/employee/EmployeeLeaveView';
import { EmployeeProfileView } from './views/pages/employee/EmployeeProfileView';

// HR
import { HRDashboardView } from './views/pages/hr/HRDashboardView';
import { HRLeaveApprovalsView } from './views/pages/hr/HRLeaveApprovalsView';
import { HREmployeesView } from './views/pages/hr/HREmployeesView';
import { HRReportsView } from './views/pages/hr/HRReportsView';
import { HRProfileView } from './views/pages/hr/HRProfileView';

// Company
import { CompanyDashboardView } from './views/pages/company/CompanyDashboardView';
import { CompanyEmployeesView } from './views/pages/company/CompanyEmployeesView';
import { CompanyProfileView } from './views/pages/company/CompanyProfileView';
import { CompanyAttendanceView } from './views/pages/company/CompanyAttendanceView';
import { CompanyCalendarView } from './views/pages/company/CompanyCalendarView';

// Admin
import { AdminDashboardView } from './views/pages/admin/AdminDashboardView';
import { AdminUsersView } from './views/pages/admin/AdminUsersView';
import { AdminReportsView } from './views/pages/admin/AdminReportsView';
import { AdminCompaniesView } from './views/pages/admin/AdminCompaniesView';
import { AdminSettingsView } from './views/pages/admin/AdminSettingsView';

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const authController = useAuthController();
  const { auth, handleLogout } = authController;
  const navigate = useNavigate();

  if (!auth) {
    return (
      <Routes>
        <Route path="/login" element={<Login {...authController} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const rolePrefixes = {
    employee: 'employee',
    hr: 'hr',
    company: 'company',
    superadmin: 'admin',
  };
  const pathPrefix = rolePrefixes[auth.role] || auth.role;

  return (
    <Layout
      auth={auth}
      role={auth.role}
      onLogout={() => {
        handleLogout();
        navigate('/login');
      }}
    >
      <Routes>
        <Route path="/" element={<Navigate to={`/${pathPrefix}/dashboard`} replace />} />
        {auth.role === 'employee' && (
          <Route path="/employee/*" element={<EmployeeRoutes userId={auth.userId} />} />
        )}
        {auth.role === 'hr' && (
          <Route path="/hr/*" element={<HRRoutes hrId={auth.userId} />} />
        )}
        {auth.role === 'company' && (
          <Route path="/company/*" element={<CompanyRoutes companyId={auth.userId} />} />
        )}
        {auth.role === 'superadmin' && (
          <Route path="/admin/*" element={<AdminRoutes />} />
        )}
        <Route path="*" element={<Navigate to={`/${pathPrefix}/dashboard`} replace />} />
      </Routes>
    </Layout>
  );
}

function EmployeeRoutes({ userId }) {
  const controller = useEmployeeController(userId);
  return (
    <Routes>
      <Route path="dashboard" element={<EmployeeDashboardView {...controller} />} />
      <Route path="attendance" element={<EmployeeAttendanceView {...controller} />} />
      <Route path="leave" element={<EmployeeLeaveView {...controller} />} />
      <Route path="profile" element={<EmployeeProfileView {...controller} />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

function HRRoutes({ hrId }) {
  const controller = useHRController(hrId);
  return (
    <Routes>
      <Route path="dashboard" element={<HRDashboardView {...controller} />} />
      <Route path="leave-approvals" element={<HRLeaveApprovalsView {...controller} />} />
      <Route path="employees" element={<HREmployeesView {...controller} />} />
      <Route path="reports" element={<HRReportsView {...controller} />} />
      <Route path="calendar" element={<CompanyCalendarView role="hr" />} />
      <Route path="profile" element={<HRProfileView {...controller} />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

function CompanyRoutes({ companyId }) {
  const controller = useCompanyController(companyId);
  return (
    <Routes>
      <Route path="dashboard" element={<CompanyDashboardView {...controller} />} />
      <Route path="employees" element={<CompanyEmployeesView {...controller} />} />
      <Route path="attendance" element={<CompanyAttendanceView {...controller} />} />
      <Route path="calendar" element={<CompanyCalendarView role="company" companyId={companyId} />} />
      <Route path="profile" element={<CompanyProfileView {...controller} />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

function AdminRoutes() {
  const controller = useAdminController();
  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboardView {...controller} />} />
      <Route path="users" element={<AdminUsersView {...controller} />} />
      <Route path="calendar" element={<CompanyCalendarView role="superadmin" />} />
      <Route path="reports" element={<AdminReportsView {...controller} />} />
      <Route path="companies" element={<AdminCompaniesView {...controller} />} />
      <Route path="settings" element={<AdminSettingsView {...controller} />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

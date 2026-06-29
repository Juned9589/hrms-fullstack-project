import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import PublicRoute from "./components/shared/PublicRoute";
import AuthBootstrap from "./components/shared/AuthBootstrap";
import RoleGuard from "./components/shared/RoleGuard";
import MainLayout from "./components/layout/MainLayout";
import Spinner from "./components/ui/Spinner";
import useAuthStore from "./store/auth.store";

// Lazy-loaded page components
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));
const SetPassword = lazy(() => import("./pages/auth/SetPassword"));

const EmployeeDashboard = lazy(() => import("./pages/dashboard/EmployeeDashboard"));
const ManagerDashboard = lazy(() => import("./pages/dashboard/ManagerDashboard"));
const HRDashboard = lazy(() => import("./pages/dashboard/HRDashboard"));
const LeadershipDashboard = lazy(() => import("./pages/dashboard/LeadershipDashboard"));

const EmployeeList = lazy(() => import("./pages/employee/EmployeeList"));
const AddEmployee = lazy(() => import("./pages/employee/AddEmployee"));
const EmployeeDetail = lazy(() => import("./pages/employee/EmployeeDetail"));
const EditEmployee = lazy(() => import("./pages/employee/EditEmployee"));
const Directory = lazy(() => import("./pages/employee/Directory"));

const Departments = lazy(() => import("./pages/org/Departments"));
const Designations = lazy(() => import("./pages/org/Designations"));
const Locations = lazy(() => import("./pages/org/Locations"));
const Shifts = lazy(() => import("./pages/org/Shifts"));
const Holidays = lazy(() => import("./pages/org/Holidays"));

const MyAttendance = lazy(() => import("./pages/attendance/MyAttendance"));
const TeamAttendance = lazy(() => import("./pages/attendance/TeamAttendance"));
const Regularization = lazy(() => import("./pages/attendance/Regularization"));

const MyLeave = lazy(() => import("./pages/leave/MyLeave"));
const ApplyLeave = lazy(() => import("./pages/leave/ApplyLeave"));
const LeaveApprovals = lazy(() => import("./pages/leave/LeaveApprovals"));
const TeamCalendar = lazy(() => import("./pages/leave/TeamCalendar"));

const HeadcountReport = lazy(() => import("./pages/reports/HeadcountReport"));
const AttendanceReport = lazy(() => import("./pages/reports/AttendanceReport"));
const LeaveReport = lazy(() => import("./pages/reports/LeaveReport"));
const AuditLogs = lazy(() => import("./pages/reports/AuditLogs"));

const Notifications = lazy(() => import("./pages/notifications/Notifications"));
const CompanyProfile = lazy(() => import("./pages/settings/CompanyProfile"));
const ChangePassword = lazy(() => import("./pages/settings/ChangePassword"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: "12px",
              background: "rgba(255,255,255,0.08)",
              color: "#F5F5F7",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px)",
              fontSize: "14px",
              padding: "12px 16px",
            },
          }}
        />
        <Suspense fallback={<Spinner fullPage />}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />
            <Route path="/set-password" element={<PublicRoute><SetPassword /></PublicRoute>} />

            {/* Protected dashboard elements */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<NavigateToDashboard />} />
              <Route path="/dashboard" element={<NavigateToDashboard />} />
              <Route path="/dashboard/employee" element={<EmployeeDashboard />} />
              <Route
                path="/dashboard/manager"
                element={<RoleGuard allowedRoles={["manager", "hr_admin"]}><ManagerDashboard /></RoleGuard>}
              />
              <Route
                path="/dashboard/hr"
                element={<RoleGuard allowedRoles={["hr_admin"]}><HRDashboard /></RoleGuard>}
              />
              <Route
                path="/dashboard/leadership"
                element={<RoleGuard allowedRoles={["leadership", "hr_admin"]}><LeadershipDashboard /></RoleGuard>}
              />

              {/* Employee modules */}
              <Route
                path="/employees"
                element={<RoleGuard allowedRoles={["hr_admin", "manager"]}><EmployeeList /></RoleGuard>}
              />
              <Route
                path="/employees/add"
                element={<RoleGuard allowedRoles={["hr_admin"]}><AddEmployee /></RoleGuard>}
              />
              <Route path="/employees/directory" element={<Directory />} />
              <Route path="/employees/:id" element={<EmployeeDetail />} />
              <Route
                path="/employees/:id/edit"
                element={<RoleGuard allowedRoles={["hr_admin"]}><EditEmployee /></RoleGuard>}
              />

              {/* Org module settings */}
              <Route
                path="/org/departments"
                element={<RoleGuard allowedRoles={["hr_admin"]}><Departments /></RoleGuard>}
              />
              <Route
                path="/org/designations"
                element={<RoleGuard allowedRoles={["hr_admin"]}><Designations /></RoleGuard>}
              />
              <Route
                path="/org/locations"
                element={<RoleGuard allowedRoles={["hr_admin"]}><Locations /></RoleGuard>}
              />
              <Route
                path="/org/shifts"
                element={<RoleGuard allowedRoles={["hr_admin"]}><Shifts /></RoleGuard>}
              />
              <Route
                path="/org/holidays"
                element={<RoleGuard allowedRoles={["hr_admin"]}><Holidays /></RoleGuard>}
              />

              {/* Attendance logs */}
              <Route path="/attendance" element={<MyAttendance />} />
              <Route
                path="/attendance/team"
                element={<RoleGuard allowedRoles={["manager", "hr_admin"]}><TeamAttendance /></RoleGuard>}
              />
              <Route path="/attendance/regularization" element={<RoleGuard allowedRoles={["manager", "hr_admin"]}><Regularization /></RoleGuard>} />

              {/* Leave modules */}
              <Route path="/leave" element={<MyLeave />} />
              <Route path="/leave/apply" element={<ApplyLeave />} />
              <Route
                path="/leave/approvals"
                element={<RoleGuard allowedRoles={["manager", "hr_admin"]}><LeaveApprovals /></RoleGuard>}
              />
              <Route
                path="/leave/calendar"
                element={<RoleGuard allowedRoles={["manager", "hr_admin"]}><TeamCalendar /></RoleGuard>}
              />

              {/* Reports */}
              <Route
                path="/reports"
                element={<RoleGuard allowedRoles={["hr_admin", "leadership"]}><HeadcountReport /></RoleGuard>}
              />
              <Route
                path="/reports/attendance"
                element={<RoleGuard allowedRoles={["hr_admin", "manager"]}><AttendanceReport /></RoleGuard>}
              />
              <Route
                path="/reports/leave"
                element={<RoleGuard allowedRoles={["hr_admin"]}><LeaveReport /></RoleGuard>}
              />
              <Route
                path="/reports/audit-logs"
                element={<RoleGuard allowedRoles={["hr_admin"]}><AuditLogs /></RoleGuard>}
              />

              {/* Notifications & Company settings */}
              <Route path="/notifications" element={<Notifications />} />
              <Route
                path="/settings"
                element={<RoleGuard allowedRoles={["hr_admin"]}><CompanyProfile /></RoleGuard>}
              />
              <Route path="/settings/password" element={<ChangePassword />} />

              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
        </AuthBootstrap>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

const NavigateToDashboard = () => {
  const { user } = useAuthStore();
  if (!user?.role) return <Navigate to="/login" replace />;
  switch (user.role) {
    case "employee":
      return <Navigate to="/dashboard/employee" replace />;
    case "manager":
      return <Navigate to="/dashboard/manager" replace />;
    case "hr_admin":
      return <Navigate to="/dashboard/hr" replace />;
    case "leadership":
      return <Navigate to="/dashboard/leadership" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default App;

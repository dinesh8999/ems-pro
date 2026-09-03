import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import Loading from './components/Loading';
import ProtectedRoute from './components/ProtectedRoute';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const Login = lazy(() => import('./pages/Login'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const EmployeeLogin = lazy(() => import('./pages/EmployeeLogin'));
const Signup = lazy(() => import('./pages/Signup'));
const EmployeeRegister = lazy(() => import('./pages/EmployeeRegister'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const Reports = lazy(() => import('./pages/Reports'));
const Leaves = lazy(() => import('./pages/Leaves'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Profile = lazy(() => import('./pages/Profile'));

const NotFound = () => (
  <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center px-4">
    <div className="text-9xl font-black text-[#0F172A] mb-4">404</div>
    <h1 className="text-3xl font-bold text-[#0F172A] mb-3">Page Not Found</h1>
    <p className="text-slate-500 mb-8 max-w-md">The page you are looking for doesn't exist or has been moved.</p>
    <Link to="/" className="px-6 py-3 rounded-xl bg-[#0F172A] text-white text-sm font-bold shadow-md hover:bg-[#1E293B] transition-all">
      Return to Home
    </Link>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-login" element={<AdminLogin />} />
              <Route path="/employee-login" element={<EmployeeLogin />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/employee-register" element={<EmployeeRegister />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employees"
                element={
                  <ProtectedRoute>
                    <Employees />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/leaves"
                element={
                  <ProtectedRoute>
                    <Leaves />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute>
                    <Attendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
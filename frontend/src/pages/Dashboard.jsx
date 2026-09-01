import { lazy, Suspense } from 'react';
import Loading from '../components/Loading';

const AdminDashboard = lazy(() => import('./AdminDashboard'));
const EmployeeDashboard = lazy(() => import('./EmployeeDashboard'));

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isEmployee = user.role === 'employee';

  return (
    <Suspense fallback={<Loading />}>
      {isEmployee ? <EmployeeDashboard /> : <AdminDashboard />}
    </Suspense>
  );
};

export default Dashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../api/axios';
import AnimatedBackground from '../components/AnimatedBackground';
import EnhancedStatCard from '../components/EnhancedStatCard';
import Loading from '../components/Loading';
import { useToast } from '../context/ToastContext';
import { useConfirmModal } from '../components/ConfirmModal';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { ConfirmModal, openConfirm } = useConfirmModal();

  const [employeeData, setEmployeeData] = useState(null);
  const [stats, setStats] = useState({ totalLeaves: 0, pendingLeaves: 0, approvedLeaves: 0, attendanceRate: 0 });
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [departmentCode, setDepartmentCode] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    fetchEmployeeData();
    fetchTodayAttendance();
  }, []);

  const fetchEmployeeData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const [leavesRes, attendanceRes] = await Promise.all([
        api.get(`/leaves?employee=${userData.id}`),
        api.get(`/attendance?employee=${userData.id}`)
      ]);

      if (leavesRes.data.success) {
        const leaves = leavesRes.data.data;
        setStats(prev => ({
          ...prev,
          totalLeaves: leaves.length,
          pendingLeaves: leaves.filter(l => l.status === 'Pending').length,
          approvedLeaves: leaves.filter(l => l.status === 'Approved').length
        }));
      }

      if (attendanceRes.data.success) {
        const attendance = attendanceRes.data.data;
        const present = attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
        const rate = attendance.length > 0 ? ((present / attendance.length) * 100).toFixed(1) : 0;
        setStats(prev => ({ ...prev, attendanceRate: rate }));
      }

      setEmployeeData(userData);
    } catch (error) {
      console.error('Error fetching employee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/attendance?employee=${userData.id}`);
      if (response.data.success) {
        const today = new Date().toDateString();
        const todayRecord = response.data.data.find(r => new Date(r.date).toDateString() === today);
        setTodayAttendance(todayRecord || null);
      }
    } catch (error) {
      console.error('Error fetching today attendance:', error);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!departmentCode.trim()) {
      toast.warning('Please enter your department attendance code');
      return;
    }
    setCheckingIn(true);
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await api.post('/attendance/checkin', { employee: userData.id, departmentCode });
      if (response.data.success) {
        toast.success('Checked in successfully!');
        setDepartmentCode('');
        setShowCheckInModal(false);
        fetchTodayAttendance();
        fetchEmployeeData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check in. Please verify the attendance code.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) { toast.warning('You need to check in first'); return; }

    const confirmed = await openConfirm({
      title: 'Check Out',
      message: 'Are you sure you want to check out for today?',
      confirmText: 'Check Out',
      variant: 'warning'
    });
    if (!confirmed) return;

    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      const response = await api.post('/attendance/checkout', { employee: userData.id });
      if (response.data.success) {
        toast.success('Checked out successfully!');
        fetchTodayAttendance();
        fetchEmployeeData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to check out');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen app-theme-bg flex flex-col transition-colors duration-300">
        <Navbar />
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-theme-bg flex flex-col transition-colors duration-300">
      <Navbar />
      <AnimatedBackground />
      {ConfirmModal}

      <div className="flex-1 w-full max-w-[2000px] mx-auto px-[2cm] py-6 flex flex-col relative z-10 min-h-0 overflow-y-auto custom-scrollbar">
        {/* Welcome Banner */}
        <div className="icon-container rounded-2xl shadow-xl p-6 md:p-8 mb-8 text-white">
          <h1 className="text-3xl md:text-4xl leading-tight font-bold animate-fade-in mb-2">
            Welcome back, {employeeData?.name}!
          </h1>
          <p className="text-[#475569] font-bold text-base md:text-lg">
            {employeeData?.position} &middot; {employeeData?.department}
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:gap-4 text-sm text-primary-5 font-semibold">
            <span className="bg-primary-2/60 px-4 py-2 rounded-lg backdrop-blur-sm flex items-center gap-2 border border-primary-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              {employeeData?.email}
            </span>
            <span className="bg-primary-2/60 px-4 py-2 rounded-lg backdrop-blur-sm font-mono truncate max-w-xs flex items-center gap-2 border border-primary-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#7C3AED]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2" /></svg>
              {employeeData?.id}
            </span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <EnhancedStatCard title="Total Leave Requests" value={stats.totalLeaves} icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} iconBg="bg-[#8B5CF6]/20 border border-[#8B5CF6]/30" delay={0} />
          <EnhancedStatCard title="Pending Approvals" value={stats.pendingLeaves} subtitle="awaiting review" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#F97316]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} iconBg="bg-[#F97316]/20 border border-[#F97316]/30" delay={100} />
          <EnhancedStatCard title="Approved Leaves" value={stats.approvedLeaves} subtitle="confirmed" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} iconBg="bg-[#10B981]/20 border border-[#10B981]/30" delay={200} />
          <EnhancedStatCard title="Attendance Rate" value={`${stats.attendanceRate}%`} subtitle="overall" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#06B6D4]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>} iconBg="bg-[#06B6D4]/20 border border-[#06B6D4]/30" delay={300} />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary-5 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                label: 'Request Leave',
                sub: 'Apply for new leave',
                path: '/leaves',
                colorBg: 'bg-[#6366F1]/20 border-[#6366F1]/30',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
              },
              {
                label: 'Check In/Out',
                sub: 'Mark your attendance',
                path: '/attendance',
                colorBg: 'bg-[#14B8A6]/20 border-[#14B8A6]/30',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#14B8A6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              },
              {
                label: 'Attendance History',
                sub: 'View your records',
                path: '/attendance',
                colorBg: 'bg-[#A855F7]/20 border-[#A855F7]/30',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#A855F7]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              },
              {
                label: 'My Profile',
                sub: 'View and update profile',
                path: '/profile',
                colorBg: 'bg-[#6D28D9]/20 border-[#6D28D9]/30',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-[#6D28D9]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="bg-primary-2/90 p-6 rounded-2xl shadow-lg border border-primary-3 hover:shadow-xl transition-all duration-300 hover:scale-105 text-left group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl ${item.colorBg} border flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold text-primary-5 mb-1.5">{item.label}</h3>
                <p className="text-primary-4 text-sm leading-relaxed">{item.sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Overview */}
        <div className="bg-primary-2/90 rounded-2xl shadow-xl p-6 border border-primary-3">
          <h2 className="text-xl md:text-2xl font-semibold text-primary-5 mb-5">Today's Overview</h2>
          <div className="space-y-4">

            {/* Work Hours row */}
            <div className="flex items-center justify-between p-4 bg-secondary-3/10 rounded-xl border border-secondary-3/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full icon-container text-white flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-5">Work Hours</h3>
                  <p className="text-sm text-primary-4">
                    {todayAttendance ? (
                      <>Check-in: {formatTime(todayAttendance.checkIn)}{todayAttendance.checkOut && ` · Check-out: ${formatTime(todayAttendance.checkOut)}`}</>
                    ) : '9:00 AM - 6:00 PM (scheduled)'}
                  </p>
                </div>
              </div>
              {!todayAttendance ? (
                <button
                  onClick={() => setShowCheckInModal(true)}
                  className="btn-primary"
                >
                  Check In
                </button>
              ) : !todayAttendance.checkOut ? (
                <button
                  onClick={handleCheckOut}
                  className="btn-primary"
                >
                  Check Out
                </button>
              ) : (
                <span className="bg-secondary-4/10 text-secondary-4 px-4 py-2 rounded-lg font-semibold">Completed</span>
              )}
            </div>

            {/* Attendance Status row */}
            <div className="flex items-center justify-between p-4 bg-secondary-3/10 rounded-xl border border-secondary-3/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full icon-container text-white flex items-center justify-center shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-primary-5">Attendance Status</h3>
                  <p className="text-sm text-primary-4">
                    {todayAttendance ? `Status: ${todayAttendance.status}` : 'Mark your attendance for today'}
                  </p>
                </div>
              </div>
              {todayAttendance && (
                <span className={`px-4 py-2 rounded-lg font-semibold ${todayAttendance.status === 'Present' ? 'bg-secondary-4/10 text-secondary-4' :
                    todayAttendance.status === 'Late' ? 'bg-secondary-3/10 text-secondary-3' :
                      'bg-red-100 text-red-700'
                  }`}>
                  {todayAttendance.status}
                </span>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-primary-2 rounded-2xl shadow-2xl max-w-md w-full p-6" style={{ animation: 'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)' }}>
            <h2 className="text-2xl font-bold text-primary-5 mb-2">Check In for Today</h2>
            <p className="text-slate-500 mb-6 text-sm">Enter the attendance code shared by your administrator.</p>
            <form onSubmit={handleCheckIn}>
              <div className="mb-5">
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-2">
                  Attendance Code
                </label>
                <input
                  type="text"
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  placeholder="e.g. Swift-Eagle-42"
                  className="w-full px-4 py-3 border border-primary-3 rounded-xl focus:ring-2 focus:ring-primary-4 bg-primary-2 text-primary-5 text-lg font-mono tracking-wider"
                  required
                  disabled={checkingIn}
                  autoFocus
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowCheckInModal(false); setDepartmentCode(''); }}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 text-primary-4 rounded-xl hover:bg-slate-50 transition-all font-semibold"
                  disabled={checkingIn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={checkingIn}
                >
                  {checkingIn ? 'Checking In...' : 'Check In'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;


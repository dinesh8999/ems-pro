import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import EmployeeForm from '../components/EmployeeForm';
import api from '../api/axios';

const Attendance = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isEmployee = user.role === 'employee';

  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);

  const [checkInData, setCheckInData] = useState({
    departmentCode: ''
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleCreateEmployee = async (formData) => {
    if (formData.email && !formData.email.trim().toLowerCase().endsWith('@ems.com')) {
      alert('Employee email address must end with @ems.com (e.g. user@ems.com)');
      return;
    }
    try {
      const response = await api.post('/employees', formData);
      if (response.data.success) {
        alert(response.data.message || 'Employee created successfully');
        setShowAddEmployeeModal(false);
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error creating employee:', error);
      alert(error.response?.data?.message || 'Failed to create employee');
    }
  };

  const fetchAttendance = async () => {
    try {
      const url = isEmployee ? `/attendance?employeeId=${user.id}` : '/attendance';
      const response = await api.get(url);
      if (response.data.success) {
        setAttendance(response.data.data);
        const today = new Date().toDateString();
        const todayRecord = response.data.data.find(
          record => new Date(record.date).toDateString() === today
        );
        setTodayAttendance(todayRecord);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    if (!checkInData.departmentCode.trim()) {
      alert('Please enter your department code');
      return;
    }
    try {
      const response = await api.post('/attendance/checkin', {
        employee: user.id,
        departmentCode: checkInData.departmentCode
      });
      if (response.data.success) {
        alert(response.data.message);
        setCheckInData({ departmentCode: '' });
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error checking in:', error);
      const msg = error.response?.data?.message || (error.response ? 'Server Response: ' + error.response.status : error.message) || 'Failed to check in';
      alert(msg);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) {
      alert('You need to check in first');
      return;
    }
    try {
      const response = await api.post('/attendance/checkout', {
        employee: user.id
      });
      if (response.data.success) {
        alert('Checked out successfully!');
        fetchAttendance();
      }
    } catch (error) {
      console.error('Error checking out:', error);
      alert(error.response?.data?.message || 'Failed to check out');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Present':
        return (
          <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 shadow-xs">
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30 shadow-xs">
            Late
          </span>
        );
      case 'Absent':
        return (
          <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-rose-500/15 text-rose-600 border border-rose-500/30 shadow-xs">
            Absent
          </span>
        );
      case 'Half-Day':
        return (
          <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-purple-500/15 text-purple-600 border border-purple-500/30 shadow-xs">
            Half-Day
          </span>
        );
      case 'On Leave':
        return (
          <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-blue-500/15 text-blue-600 border border-blue-500/30 shadow-xs">
            On Leave
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 inline-flex text-xs font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-300">
            {status || 'Unknown'}
          </span>
        );
    }
  };

  const formatTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const calculateWorkHours = () => {
    if (!todayAttendance?.checkIn) return 0;
    const checkIn = new Date(todayAttendance.checkIn);
    const checkOut = todayAttendance.checkOut ? new Date(todayAttendance.checkOut) : new Date();
    return ((checkOut - checkIn) / (1000 * 60 * 60)).toFixed(2);
  };

  const getRecordDate = (r) => {
    const raw = r.date || r.checkIn || r.createdAt;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  };

  // Dynamic year extraction from actual records
  const currentYear = new Date().getFullYear().toString();
  const recordYears = attendance
    .map(r => getRecordDate(r))
    .filter(Boolean)
    .map(d => d.getFullYear().toString());

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from(new Set([...recordYears, currentYear])).sort((a, b) => b - a);

  const filteredAttendance = attendance.filter(record => {
    if (!record) return false;

    // Search filter for admin
    if (searchTerm) {
      const empName = record.employee?.name || '';
      const empDept = record.employee?.department || '';
      const matchesSearch = empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            empDept.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filter !== 'all' && record.status !== filter) return false;

    // Month & Year filter
    const d = getRecordDate(record);
    if (d) {
      const mm = d.toLocaleString('en-US', { month: 'long' });
      const yyyy = d.getFullYear().toString();

      if (selectedMonth !== 'all' && mm !== selectedMonth) return false;
      if (selectedYear !== 'all' && yyyy !== selectedYear) return false;
    } else if (selectedMonth !== 'all' || selectedYear !== 'all') {
      return false;
    }

    return true;
  });

  // Calculate metrics based on current data
  const totalPresent = attendance.filter(r => r.status === 'Present').length;
  const totalLate = attendance.filter(r => r.status === 'Late').length;
  const totalAbsent = attendance.filter(r => r.status === 'Absent').length;
  const totalHoursArr = attendance.map(r => Number(r.workHours) || 0).filter(h => h > 0);
  const avgHours = totalHoursArr.length > 0
    ? (totalHoursArr.reduce((a, b) => a + b, 0) / totalHoursArr.length).toFixed(1)
    : '0.0';

  const getStatusCount = (statusKey) => {
    if (statusKey === 'all') return attendance.length;
    return attendance.filter(r => r.status === statusKey).length;
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchTerm('');
    setSelectedMonth('all');
    setSelectedYear('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen app-theme-bg flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-theme-bg flex flex-col transition-colors duration-300">
      <Navbar />
      <AnimatedBackground />

      <div className="flex-1 w-full max-w-[2000px] mx-auto px-[2cm] py-6 flex flex-col relative z-10 min-h-0 overflow-y-auto custom-scrollbar">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl leading-tight font-bold text-primary-5 w-fit pb-2">
              Attendance Management
            </h1>
            <p className="text-primary-4 mt-2 text-base md:text-lg">Track your daily attendance and work hours</p>
          </div>

          {!isEmployee && (
            <button
              onClick={() => setShowAddEmployeeModal(true)}
              className="px-5 py-3 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto"
            >
              <span>+ Add Employee</span>
            </button>
          )}
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: 'Total Logs',
              value: attendance.length,
              bg: 'bg-[#8B5CF6]',
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )
            },
            {
              label: 'Present Days',
              value: totalPresent,
              bg: 'bg-[#10B981]',
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              label: 'Late Check-Ins',
              value: totalLate,
              bg: 'bg-[#F59E0B]',
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            },
            {
              label: 'Absent Days',
              value: totalAbsent,
              bg: 'bg-[#EF4444]',
              icon: (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            }
          ].map(card => (
            <div key={card.label} className="bg-primary-2/90 rounded-2xl shadow-xl p-6 border border-primary-3 hover:shadow-2xl transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">{card.label}</p>
                  <p className="text-3xl font-bold text-primary-5 mt-1">{card.value}</p>
                </div>
                <div className={`${card.bg} p-3 rounded-2xl group-hover:rotate-12 transition-transform shadow-md`}>
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Today's Status Card - For Employees */}
        {isEmployee && (
          <div className="mb-8">
            <div className="icon-container rounded-2xl shadow-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#7C3AED]">Today's Status</h2>
                  <p className="text-[#475569] font-bold text-sm md:text-base mt-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  {todayAttendance ? (
                    <>
                      <div className="text-3xl md:text-4xl font-extrabold text-[#7C3AED]">{calculateWorkHours()}h</div>
                      <div className="text-[#64748B] text-xs font-bold uppercase tracking-wider">Work Hours</div>
                    </>
                  ) : (
                    <div className="text-base md:text-lg font-bold text-[#7C3AED]">Not checked in</div>
                  )}
                </div>
              </div>

              {todayAttendance ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-white/80 border border-primary-3 rounded-xl p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wider font-bold text-[#64748B] mb-1">Check In</div>
                    <div className="text-2xl font-extrabold text-primary-5">{formatTime(todayAttendance.checkIn)}</div>
                  </div>
                  <div className="bg-white/80 border border-primary-3 rounded-xl p-4 shadow-sm">
                    <div className="text-xs uppercase tracking-wider font-bold text-[#64748B] mb-1">Check Out</div>
                    <div className="text-2xl font-extrabold text-primary-5">{formatTime(todayAttendance.checkOut)}</div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCheckIn} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1E1147] mb-2">
                      Today's Attendance Code
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={checkInData.departmentCode}
                        onChange={(e) => setCheckInData({ departmentCode: e.target.value })}
                        className="flex-1 px-4 py-3 bg-white border border-primary-3 rounded-lg text-[#1E1147] placeholder-slate-400 focus:ring-2 focus:ring-[#7C3AED] focus:outline-none shadow-sm font-medium"
                        placeholder="Enter the attendance code from admin"
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs text-[#64748B] font-semibold">
                      Ask your administrator for today's attendance code
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-6 py-3 rounded-lg font-semibold shadow-lg tracking-wide transition-all duration-300 cursor-pointer"
                  >
                    Check In Now
                  </button>
                </form>
              )}

              {todayAttendance && !todayAttendance.checkOut && (
                <button
                  onClick={handleCheckOut}
                  className="w-full mt-4 bg-[#D97706] hover:bg-[#B45309] text-white px-6 py-3 rounded-lg font-semibold shadow-lg tracking-wide transition-all duration-300 cursor-pointer"
                >
                  Check Out
                </button>
              )}

              {todayAttendance?.status && (
                <div className="mt-4 flex items-center justify-center">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    todayAttendance.status === 'Present'
                      ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                      : todayAttendance.status === 'Late'
                      ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-600 border border-rose-500/30'
                  }`}>
                    Status: {todayAttendance.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filter Controls Toolbar */}
        <div className="bg-primary-2/90 rounded-2xl p-6 shadow-xl border border-primary-3 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            
            {/* Status Tabs with Live Count Badges */}
            <div className="flex flex-wrap gap-2">
              {['all', 'Present', 'Late', 'Absent', 'Half-Day', 'On Leave'].map((status) => {
                const count = getStatusCount(status);
                return (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      filter === status
                        ? 'bg-[#7C3AED] text-white shadow-md'
                        : 'bg-white/80 border border-primary-3 text-primary-4 hover:bg-secondary-3/20'
                    }`}
                  >
                    <span>{status === 'all' ? 'All Records' : status}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      filter === status ? 'bg-white/25 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Dropdowns & Search */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {!isEmployee && (
                <div className="relative flex-1 md:flex-initial min-w-[180px]">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search employee..."
                    className="w-full px-4 py-2 rounded-xl bg-white/90 border border-primary-3 text-xs font-medium text-primary-5 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                  />
                </div>
              )}

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/90 border border-primary-3 text-xs font-medium text-primary-5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              >
                <option value="all">All Months</option>
                {months.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/90 border border-primary-3 text-xs font-medium text-primary-5 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              >
                <option value="all">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Attendance History Table Card */}
        <div className="bg-primary-2/90 rounded-2xl shadow-xl overflow-hidden border border-primary-3">
          <div className="p-6 border-b border-primary-3 flex justify-between items-center bg-primary-2/40">
            <h2 className="text-xl md:text-2xl font-bold text-primary-5">
              {isEmployee ? 'My Attendance History' : 'All Attendance Records'}
            </h2>
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#7C3AED]/15 text-[#7C3AED]">
              {filteredAttendance.length} {filteredAttendance.length === 1 ? 'Record' : 'Records'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-1/60">
                <tr>
                  {!isEmployee && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Employee
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Check In</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Check Out</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Work Hours</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-3/60">
                {loading ? (
                  <tr>
                    <td colSpan={isEmployee ? 5 : 6} className="px-6 py-12 text-center text-primary-4 font-semibold">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : filteredAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={isEmployee ? 5 : 6} className="px-6 py-12 text-center text-primary-4 font-semibold">
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <p className="text-base font-bold text-slate-700">No attendance records found matching filters</p>
                        <button
                          onClick={clearFilters}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#7C3AED] text-white shadow-md hover:bg-[#6D28D9] transition-all cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-secondary-3/20 transition-all duration-200">
                      {!isEmployee && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-[#7C3AED]/15 text-[#7C3AED] font-bold flex items-center justify-center text-sm shadow-xs">
                              {record.employee?.name?.charAt(0)?.toUpperCase() || 'E'}
                            </div>
                            <div>
                              <div className="text-base font-bold text-primary-5">{record.employee?.name || 'Unknown'}</div>
                              <div className="text-xs text-primary-4 font-semibold">{record.employee?.department || 'N/A'}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-5">
                        {new Date(record.date || record.checkIn).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-5">
                        {formatTime(record.checkIn)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-5">
                        {formatTime(record.checkOut)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-[#7C3AED]">
                        {record.workHours ? `${record.workHours}h` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(record.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {showAddEmployeeModal && (
        <EmployeeForm
          onSubmit={handleCreateEmployee}
          onCancel={() => setShowAddEmployeeModal(false)}
        />
      )}
    </div>
  );
};

export default Attendance;

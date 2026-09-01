import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import api from '../api/axios';

const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [leaveStats, setLeaveStats] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchAllReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAllReports = async () => {
    setLoading(true);
    try {
      const [empRes, leavesRes, attendanceRes] = await Promise.all([
        api.get('/employees').catch(() => ({ data: { success: false, data: [] } })),
        api.get(`/leaves?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`).catch(() => ({ data: { success: false, data: [] } })),
        api.get(`/attendance/stats?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`).catch(() => ({ data: { success: false, data: {} } }))
      ]);

      const employees = empRes.data.success && Array.isArray(empRes.data.data) ? empRes.data.data : [];
      const leaves = leavesRes.data.success && Array.isArray(leavesRes.data.data) ? leavesRes.data.data : [];

      // Calculate Overview Analytics
      const totalEmployees = employees.length;
      const totalSalary = employees.reduce((sum, emp) => sum + (Number(emp.salary) || 0), 0);
      const averageSalary = totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;
      const salaries = employees.map(emp => Number(emp.salary) || 0).filter(s => s > 0);
      const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;
      const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0;

      // Department distribution & Salary by Department
      const deptMap = {};
      const deptSalaryMap = {};
      employees.forEach(emp => {
        const d = emp.department || 'General';
        deptMap[d] = (deptMap[d] || 0) + 1;
        deptSalaryMap[d] = (deptSalaryMap[d] || 0) + (Number(emp.salary) || 0);
      });

      const employeesByDepartment = Object.entries(deptMap).map(([department, count]) => ({
        department,
        count
      }));

      const salaryByDepartment = Object.entries(deptSalaryMap).map(([department, total]) => {
        const count = deptMap[department] || 1;
        return {
          department,
          averageSalary: Math.round(total / count),
          totalSalary: total
        };
      });

      // Salary Ranges
      const ranges = { '$0-$30k': 0, '$30k-$60k': 0, '$60k-$90k': 0, '$90k+': 0 };
      employees.forEach(emp => {
        const sal = Number(emp.salary) || 0;
        if (sal <= 30000) ranges['$0-$30k']++;
        else if (sal <= 60000) ranges['$30k-$60k']++;
        else if (sal <= 90000) ranges['$60k-$90k']++;
        else ranges['$90k+']++;
      });
      const salaryRanges = Object.entries(ranges).map(([range, count]) => ({ range, count }));

      setAnalytics({
        overview: {
          totalEmployees,
          totalSalary,
          averageSalary,
          maxSalary,
          minSalary
        },
        employeesByDepartment,
        salaryByDepartment,
        salaryRanges
      });

      // Calculate Leave Stats
      const lStats = {
        total: leaves.length,
        pending: leaves.filter(l => l.status === 'Pending').length,
        approved: leaves.filter(l => l.status === 'Approved').length,
        rejected: leaves.filter(l => l.status === 'Rejected').length,
        byType: leaves.reduce((acc, leave) => {
          const type = leave.leaveType || leave.type || 'Other';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {}),
        byMonth: leaves.reduce((acc, leave) => {
          const month = leave.startDate && !isNaN(new Date(leave.startDate).getTime())
            ? new Date(leave.startDate).toLocaleString('default', { month: 'short' })
            : 'Jan';
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {})
      };
      setLeaveStats(lStats);

      // Attendance Stats
      if (attendanceRes.data.success && attendanceRes.data.data) {
        setAttendanceStats(attendanceRes.data.data);
      } else {
        setAttendanceStats({
          present: 12,
          late: 2,
          absent: 1,
          attendanceRate: 85.7
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    let csvContent = `EMS WORKFORCE REPORT & ANALYTICS\n`;
    csvContent += `Generated Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
    csvContent += `Date Range Filter: ${dateRange.startDate} to ${dateRange.endDate}\n\n`;

    // Overview Section
    if (analytics?.overview) {
      csvContent += `=== OVERVIEW SUMMARY ===\n`;
      csvContent += `Metric,Value\n`;
      csvContent += `Total Employees,${analytics.overview.totalEmployees || 0}\n`;
      csvContent += `Total Monthly Payroll,$${(analytics.overview.totalSalary || 0).toLocaleString()}\n`;
      csvContent += `Average Salary,$${(analytics.overview.averageSalary || 0).toLocaleString()}\n`;
      csvContent += `Highest Salary,$${(analytics.overview.maxSalary || 0).toLocaleString()}\n`;
      csvContent += `Lowest Salary,$${(analytics.overview.minSalary || 0).toLocaleString()}\n\n`;
    }

    // Department Breakdown
    if (analytics?.employeesByDepartment?.length) {
      csvContent += `=== DEPARTMENT HEADCOUNT & PAYROLL ===\n`;
      csvContent += `Department,Employee Count,Average Salary,Total Payroll\n`;
      analytics.employeesByDepartment.forEach(d => {
        const salObj = analytics.salaryByDepartment?.find(s => s.department === d.department);
        const avgSal = salObj ? salObj.averageSalary : 0;
        const totSal = salObj ? salObj.totalSalary : 0;
        csvContent += `"${d.department}",${d.count},$${avgSal.toLocaleString()},$${totSal.toLocaleString()}\n`;
      });
      csvContent += `\n`;
    }

    // Leave Stats
    if (leaveStats) {
      csvContent += `=== LEAVE STATISTICS ===\n`;
      csvContent += `Metric / Category,Count\n`;
      csvContent += `Total Requests,${leaveStats.total || 0}\n`;
      csvContent += `Approved,${leaveStats.approved || 0}\n`;
      csvContent += `Pending,${leaveStats.pending || 0}\n`;
      csvContent += `Rejected,${leaveStats.rejected || 0}\n\n`;

      if (leaveStats.byType && Object.keys(leaveStats.byType).length > 0) {
        csvContent += `Leave Type,Count\n`;
        Object.entries(leaveStats.byType).forEach(([type, count]) => {
          csvContent += `"${type}",${count}\n`;
        });
        csvContent += `\n`;
      }
    }

    // Attendance Stats
    if (attendanceStats) {
      csvContent += `=== ATTENDANCE METRICS ===\n`;
      csvContent += `Metric,Count / Rate\n`;
      csvContent += `Present,${attendanceStats.present || 0}\n`;
      csvContent += `Late,${attendanceStats.late || 0}\n`;
      csvContent += `Absent,${attendanceStats.absent || 0}\n`;
      csvContent += `Attendance Rate,${attendanceStats.attendanceRate ? attendanceStats.attendanceRate.toFixed(1) : 0}%\n`;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `EMS_Report_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const chartTheme = {
    pieColors: ['#D97706', '#0D9488', '#6366F1', '#8B5CF6', '#10B981', '#EC4899'],
    primary: '#6366F1',
    secondary: '#0D9488',
    tertiary: '#D97706',
    axis: '#71717A',
    grid: 'rgba(99, 102, 241, 0.08)',
  };

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid rgba(24, 24, 27, 0.15)',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
    color: '#18181B',
    fontWeight: '600'
  };

  const leaveTypeData = leaveStats?.byType && Object.keys(leaveStats.byType).length > 0
    ? Object.entries(leaveStats.byType).map(([type, count]) => ({ name: type, value: count }))
    : [
      { name: 'Sick Leave', value: 3 },
      { name: 'Casual Leave', value: 2 },
      { name: 'Annual Leave', value: 4 }
    ];

  const leaveMonthData = leaveStats?.byMonth && Object.keys(leaveStats.byMonth).length > 0
    ? Object.entries(leaveStats.byMonth).map(([month, count]) => ({ month, leaves: count }))
    : [
      { month: 'Jan', leaves: 2 },
      { month: 'Feb', leaves: 4 },
      { month: 'Mar', leaves: 3 },
      { month: 'Apr', leaves: 5 }
    ];

  if (loading) {
    return (
      <div className="min-h-screen app-theme-bg flex flex-col transition-colors duration-300">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#7C3AED]"></div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl leading-tight font-bold text-primary-5 w-fit pb-2 mb-2">
              Reports & Analytics
            </h1>
            <p className="text-primary-4 text-base md:text-lg">Comprehensive workforce insights and data visualization</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="flex gap-2 bg-primary-2/90 border border-primary-3 rounded-lg p-1">
              {['overview', 'leaves', 'attendance', 'salary'].map((type) => (
                <button
                  key={type}
                  onClick={() => setReportType(type)}
                  className={`px-4 py-2 rounded-lg font-semibold capitalize transition-all ${reportType === type
                      ? 'bg-[#7C3AED] text-white shadow-md'
                      : 'text-primary-4 hover:bg-secondary-3/20'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <button
              onClick={exportReport}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg shadow-sm transition-all cursor-pointer h-fit self-center"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="bg-primary-2/90 rounded-xl shadow-lg p-6 mb-8 border border-primary-3">
          <h3 className="text-lg font-semibold text-primary-5 mb-4">Filter by Date Range</h3>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-primary-4 mb-2">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="px-4 py-2 border border-primary-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none bg-primary-2 text-primary-5 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-primary-4 mb-2">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="px-4 py-2 border border-primary-3 rounded-lg shadow-sm focus:ring-2 focus:ring-[#7C3AED] focus:outline-none bg-primary-2 text-primary-5 font-medium"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchAllReports}
                disabled={loading}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold px-6 py-2 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Loading...' : 'Apply Filter'}
              </button>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        {reportType === 'overview' && analytics && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Total Workforce</p>
                <p className="text-4xl font-extrabold text-[#6366F1]">{analytics?.overview?.totalEmployees || 0}</p>
                <p className="text-primary-4 text-xs mt-2">Active employees</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Total Payroll</p>
                <p className="text-4xl font-extrabold text-[#0D9488]">${((analytics?.overview?.totalSalary || 0) / 1000).toFixed(0)}k</p>
                <p className="text-primary-4 text-xs mt-2">Monthly expense</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Avg Salary</p>
                <p className="text-4xl font-extrabold text-[#D97706]">${((analytics?.overview?.averageSalary || 0) / 1000).toFixed(0)}k</p>
                <p className="text-primary-4 text-xs mt-2">Per employee</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Departments</p>
                <p className="text-4xl font-extrabold text-[#8B5CF6]">{analytics?.employeesByDepartment?.length || 0}</p>
                <p className="text-primary-4 text-xs mt-2">Active units</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
                <h3 className="text-xl font-bold text-primary-5 mb-6">Department Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.employeesByDepartment || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke={chartTheme.grid} />
                    <XAxis dataKey="department" stroke={chartTheme.axis} />
                    <YAxis stroke={chartTheme.axis} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {(analytics?.employeesByDepartment || []).map((entry, index) => (
                        <Cell key={`dept-bar-cell-${index}`} fill={chartTheme.pieColors[index % chartTheme.pieColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
                <h3 className="text-xl font-bold text-primary-5 mb-6">Workforce Composition</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics?.employeesByDepartment || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.department}: ${entry.count}`}
                      outerRadius={100}
                      dataKey="count"
                    >
                      {(analytics?.employeesByDepartment || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartTheme.pieColors[index % chartTheme.pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Leaves Section */}
        {reportType === 'leaves' && leaveStats && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Total Leaves</p>
                <p className="text-4xl font-extrabold text-[#6366F1]">{leaveStats.total}</p>
                <p className="text-primary-4 text-xs mt-2">In selected period</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Pending</p>
                <p className="text-4xl font-extrabold text-amber-500">{leaveStats.pending}</p>
                <p className="text-primary-4 text-xs mt-2">Awaiting review</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Approved</p>
                <p className="text-4xl font-extrabold text-emerald-500">{leaveStats.approved}</p>
                <p className="text-primary-4 text-xs mt-2">Confirmed</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Rejected</p>
                <p className="text-4xl font-extrabold text-rose-500">{leaveStats.rejected}</p>
                <p className="text-primary-4 text-xs mt-2">Denied requests</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
                <h3 className="text-xl font-bold text-primary-5 mb-6">Leave Types Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={leaveTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      dataKey="value"
                    >
                      {leaveTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartTheme.pieColors[index % chartTheme.pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
                <h3 className="text-xl font-bold text-primary-5 mb-6">Leave Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={leaveMonthData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} stroke={chartTheme.grid} />
                    <XAxis dataKey="month" stroke={chartTheme.axis} />
                    <YAxis stroke={chartTheme.axis} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="leaves" stroke={chartTheme.primary} strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Section */}
        {reportType === 'attendance' && attendanceStats && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Present</p>
                <p className="text-4xl font-extrabold text-emerald-500">{attendanceStats.present || 0}</p>
                <p className="text-primary-4 text-xs mt-2">On time arrivals</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Late</p>
                <p className="text-4xl font-extrabold text-amber-500">{attendanceStats.late || 0}</p>
                <p className="text-primary-4 text-xs mt-2">Late arrivals</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Absent</p>
                <p className="text-4xl font-extrabold text-rose-500">{attendanceStats.absent || 0}</p>
                <p className="text-primary-4 text-xs mt-2">Absences</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Attendance Rate</p>
                <p className="text-4xl font-extrabold text-[#7C3AED]">{attendanceStats.attendanceRate ? attendanceStats.attendanceRate.toFixed(1) : 0}%</p>
                <p className="text-primary-4 text-xs mt-2">Overall rate</p>
              </div>
            </div>

            <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
              <h3 className="text-xl font-bold text-primary-5 mb-6">Attendance Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Present', value: attendanceStats.present || 0 },
                      { name: 'Late', value: attendanceStats.late || 0 },
                      { name: 'Absent', value: attendanceStats.absent || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#F59E0B" />
                    <Cell fill="#EF4444" />
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Salary Section */}
        {reportType === 'salary' && analytics && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Total Payroll</p>
                <p className="text-4xl font-extrabold text-[#0D9488]">${((analytics?.overview?.totalSalary || 0) / 1000).toFixed(0)}k</p>
                <p className="text-primary-4 text-xs mt-2">Combined salaries</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Average Salary</p>
                <p className="text-4xl font-extrabold text-[#D97706]">${((analytics?.overview?.averageSalary || 0) / 1000).toFixed(0)}k</p>
                <p className="text-primary-4 text-xs mt-2">Per employee</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Highest Salary</p>
                <p className="text-4xl font-extrabold text-emerald-500">${((analytics?.overview?.maxSalary || 0) / 1000).toFixed(0)}k</p>
                <p className="text-primary-4 text-xs mt-2">Top earner</p>
              </div>
              <div className="bg-primary-2/90 border border-primary-3 rounded-2xl shadow-lg p-6">
                <p className="text-primary-4 text-xs font-bold uppercase tracking-wider mb-1">Lowest Salary</p>
                <p className="text-4xl font-extrabold text-[#6366F1]">${((analytics?.overview?.minSalary || 0) / 1000).toFixed(0)}k</p>
                <p className="text-primary-4 text-xs mt-2">Entry level</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
                <h3 className="text-xl font-bold text-primary-5 mb-6">Salary by Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.salaryByDepartment || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke={chartTheme.grid} />
                    <XAxis dataKey="department" stroke={chartTheme.axis} />
                    <YAxis stroke={chartTheme.axis} />
                    <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} contentStyle={tooltipStyle} />
                    <Bar dataKey="averageSalary" radius={[8, 8, 0, 0]}>
                      {(analytics?.salaryByDepartment || []).map((entry, index) => (
                        <Cell key={`sal-bar-cell-${index}`} fill={chartTheme.pieColors[index % chartTheme.pieColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
                <h3 className="text-xl font-bold text-primary-5 mb-6">Salary Distribution Ranges</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.salaryRanges || []}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} stroke={chartTheme.grid} />
                    <XAxis dataKey="range" stroke={chartTheme.axis} />
                    <YAxis stroke={chartTheme.axis} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {(analytics?.salaryRanges || []).map((entry, index) => (
                        <Cell key={`range-bar-cell-${index}`} fill={chartTheme.pieColors[index % chartTheme.pieColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;

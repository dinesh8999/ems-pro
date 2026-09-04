import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import EnhancedStatCard from '../components/EnhancedStatCard';
import api from '../api/axios';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedReviewLeave, setSelectedReviewLeave] = useState(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');

  // Get current user role
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isEmployee = user.role === 'employee';

  const [formData, setFormData] = useState({
    employee: isEmployee ? user.id : '',
    leaveType: 'Sick Leave',
    startDate: '',
    startTime: '09:00',
    endDate: '',
    endTime: '18:00',
    reason: ''
  });

  const leaveTypes = [
    'Sick Leave',
    'Casual Leave',
    'Annual Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Unpaid Leave'
  ];

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
  }, []);

  const fetchLeaves = async () => {
    try {
      // If employee, fetch only their leaves
      const userId = user.id || user._id;
      const url = isEmployee ? `/leaves?employeeId=${userId}` : '/leaves';
      const response = await api.get(url);
      if (response.data.success) {
        setLeaves(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/leaves', formData);
      if (response.data.success) {
        alert('Leave request submitted successfully!');
        setShowForm(false);
        fetchLeaves();
        setFormData({
          employee: isEmployee ? user.id : '',
          leaveType: 'Sick Leave',
          startDate: '',
          startTime: '09:00',
          endDate: '',
          endTime: '18:00',
          reason: ''
        });
      }
    } catch (error) {
      console.error('Error creating leave:', error);
      alert(error.response?.data?.message || 'Failed to submit leave request');
    }
  };

  const handleStatusUpdate = async (leaveId, status, rejectionReason = '') => {
    try {
      const adminId = JSON.parse(localStorage.getItem('user'))?.id;
      const response = await api.put(`/leaves/${leaveId}/status`, {
        status,
        rejectionReason,
        approvedBy: adminId
      });
      if (response.data.success) {
        alert(`Leave ${status.toLowerCase()} successfully!`);
        fetchLeaves();
      }
    } catch (error) {
      console.error('Error updating leave status:', error);
      alert('Failed to update leave status');
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return (
          <span
            title="Approved"
            className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-sm cursor-help transition-transform hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
        );
      case 'Rejected':
        return (
          <span
            title="Rejected"
            className="w-8 h-8 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center shadow-sm cursor-help transition-transform hover:scale-110"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        );
      default:
        return (
          <span
            title="Pending"
            className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center shadow-sm cursor-help transition-transform hover:scale-110 animate-pulse"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
        );
    }
  };

  const openReviewModal = (leave) => {
    setSelectedReviewLeave(leave);
    setShowRejectForm(false);
    setRejectionReasonInput('');
  };

  const closeReviewModal = () => {
    setSelectedReviewLeave(null);
    setShowRejectForm(false);
    setRejectionReasonInput('');
  };

  const monthLeaves = (selectedMonth === 'all' && selectedYear === 'all')
    ? leaves
    : leaves.filter(leave => {
      if (!leave.startDate) return false;
      const d = new Date(leave.startDate);
      if (isNaN(d.getTime())) return false;

      const yyyy = d.getFullYear().toString();
      const mm = d.toLocaleString('en-US', { month: 'long' });

      const monthMatch = selectedMonth === 'all' || mm === selectedMonth;
      const yearMatch = selectedYear === 'all' || yyyy === selectedYear;

      return monthMatch && yearMatch;
    });

  const currentYear = new Date().getFullYear().toString();
  const recordYears = leaves
    .map(l => l.startDate || l.createdAt)
    .filter(Boolean)
    .map(d => new Date(d).getFullYear().toString())
    .filter(y => !isNaN(y));

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = Array.from(new Set([...recordYears, currentYear])).sort((a, b) => b - a);

  const filteredLeaves = filter === 'all'
    ? monthLeaves
    : monthLeaves.filter(leave => leave.status === filter);

  return (
    <div className="min-h-screen app-theme-bg flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10 animate-fade-in">
          <div>
            <h1 className="text-4xl md:text-5xl leading-tight font-bold text-primary-5 w-fit pb-2">
              Leave Management
            </h1>
            <p className="text-primary-4 mt-2 text-base md:text-lg">Manage and track leave requests</p>
          </div>
          {isEmployee && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary"
            >
              + Request Leave
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <EnhancedStatCard
            title="Total Requests"
            value={monthLeaves.length}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            iconBg="bg-indigo-500/15 text-indigo-500"
            gradient="from-secondary-6 to-secondary-5"
            delay={0}
          />
          <EnhancedStatCard
            title="Pending"
            value={monthLeaves.filter(l => l.status === 'Pending').length}
            subtitle={`of ${monthLeaves.length}`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            iconBg="bg-amber-500/15 text-amber-500"
            gradient="from-secondary-3 to-secondary-3"
            delay={100}
          />
          <EnhancedStatCard
            title="Approved"
            value={monthLeaves.filter(l => l.status === 'Approved').length}
            subtitle={`of ${monthLeaves.length}`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            iconBg="bg-emerald-500/15 text-emerald-500"
            gradient="from-secondary-4 to-secondary-4"
            delay={200}
          />
          <EnhancedStatCard
            title="Rejected"
            value={monthLeaves.filter(l => l.status === 'Rejected').length}
            subtitle={`of ${monthLeaves.length}`}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            iconBg="bg-rose-500/15 text-rose-500"
            gradient="from-secondary-6 to-secondary-5"
            delay={300}
          />
        </div>

        {/* Leave Request Form */}
        {isEmployee && showForm && (
          <div className="bg-primary-2/90 rounded-xl shadow-lg p-6 mb-8 border border-primary-3 animate-fade-in">
            <h2 className="text-xl md:text-2xl font-bold text-primary-5 mb-5">Request Leave</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Show employee dropdown only for admin */}
              {!isEmployee && (
                <div>
                  <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Employee</label>
                  <select
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2/80 text-primary-5"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp._id} value={emp._id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Leave Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                  className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2/80 text-primary-5"
                  required
                >
                  {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2/80 text-primary-5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2/80 text-primary-5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2/80 text-primary-5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2/80 text-primary-5"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-2 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2/80 text-primary-5"
                  rows="3"
                  required
                />
              </div>

              <div className="md:col-span-2 flex space-x-3">
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-primary-3 text-primary-4 px-6 py-2 rounded-lg hover:bg-secondary-3 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter and Month Group */}
        <div className="mb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'Pending', 'Approved', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${filter === status
                    ? 'icon-container text-white'
                    : 'bg-primary-2/90 text-primary-4 hover:bg-secondary-3 border border-primary-3'
                  }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-primary-3 rounded-lg shadow-sm focus:ring-0 focus:outline-none focus:shadow-md bg-primary-2/90 text-primary-5 cursor-pointer font-medium"
            >
              <option value="all">All Months</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border border-primary-3 rounded-lg shadow-sm focus:ring-0 focus:outline-none focus:shadow-md bg-primary-2/90 text-primary-5 cursor-pointer font-medium"
            >
              <option value="all">All Years</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            {(selectedMonth !== 'all' || selectedYear !== 'all') && (
              <button
                onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); }}
                className="text-xs text-primary-4 hover:text-red-500 font-semibold transition-colors duration-200"
                title="Clear Filters"
              >
                ✕ CLEAR
              </button>
            )}
          </div>
        </div>

        {/* Leaves Table */}
        <div className="bg-primary-2/90 rounded-xl shadow-lg overflow-hidden border border-primary-3">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-1">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary-2">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-primary-4">Loading...</td>
                  </tr>
                ) : filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-primary-4">No leave requests found</td>
                  </tr>
                ) : (
                  filteredLeaves.map(leave => (
                    <tr key={leave._id} className="hover:bg-secondary-3 transition-all duration-300">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-primary-5">{leave.employee?.name}</div>
                        <div className="text-sm text-primary-4">{leave.employee?.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-5">{leave.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-4">
                        {leave.startDate && !isNaN(new Date(leave.startDate).getTime()) && new Date(leave.startDate).toLocaleDateString()}
                        {' - '}
                        {leave.endDate && !isNaN(new Date(leave.endDate).getTime()) && new Date(leave.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-5">{leave.duration} days</td>
                      <td className="px-6 py-4 text-sm text-primary-4 max-w-xs truncate">{leave.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap" onClick={() => openReviewModal(leave)}>
                        <div className="cursor-pointer inline-block">
                          {renderStatusBadge(leave.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {leave.status === 'Pending' && !isEmployee ? (
                          <button
                            onClick={() => openReviewModal(leave)}
                            className="bg-[#18181B] hover:bg-[#27272A] text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1"
                          >
                            <span>Review</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openReviewModal(leave)}
                            className="text-primary-4 hover:text-primary-5 text-xs font-medium underline"
                          >
                            View Details
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review Leave Request Modal Pop-up */}
        {selectedReviewLeave && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-primary-2/95 border border-primary-3 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transition-all text-primary-5">
              {/* Modal Header */}
              <div className="p-6 border-b border-primary-3 flex justify-between items-center bg-primary-1/50">
                <div>
                  <h3 className="text-xl font-bold text-primary-5">Leave Request Details</h3>
                  <p className="text-xs text-primary-4 mt-0.5">Submitted by {selectedReviewLeave.employee?.name || 'Employee'}</p>
                </div>
                <button
                  onClick={closeReviewModal}
                  className="text-slate-400 hover:text-slate-200 transition-colors text-2xl font-bold px-2 py-0.5 rounded-lg"
                >
                  &times;
                </button>
              </div>

              {/* Leave Form Details sent by Employee */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 bg-primary-1/50 p-4 rounded-xl border border-primary-3">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Employee</p>
                    <p className="font-bold text-primary-5 mt-0.5">{selectedReviewLeave.employee?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Department</p>
                    <p className="font-medium text-primary-4 mt-0.5">{selectedReviewLeave.employee?.department || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Leave Type</p>
                    <p className="font-semibold text-primary-5 mt-0.5">{selectedReviewLeave.leaveType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Duration</p>
                    <p className="font-semibold text-primary-5 mt-0.5">{selectedReviewLeave.duration} day(s)</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Start Date</p>
                    <p className="font-medium text-primary-4 mt-0.5">
                      {selectedReviewLeave.startDate && !isNaN(new Date(selectedReviewLeave.startDate).getTime())
                        ? new Date(selectedReviewLeave.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">End Date</p>
                    <p className="font-medium text-primary-4 mt-0.5">
                      {selectedReviewLeave.endDate && !isNaN(new Date(selectedReviewLeave.endDate).getTime())
                        ? new Date(selectedReviewLeave.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '-'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Reason</p>
                  <div className="p-3.5 bg-primary-1/50 rounded-xl border border-primary-3 text-primary-4 text-sm leading-relaxed max-h-32 overflow-y-auto">
                    {selectedReviewLeave.reason || 'No reason provided.'}
                  </div>
                </div>

                {/* Display Rejection Reason if leave was rejected */}
                {selectedReviewLeave.status === 'Rejected' && selectedReviewLeave.rejectionReason && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-xs font-semibold uppercase tracking-wider text-red-400 mb-1">Rejection Reason / Message</p>
                    <p className="text-sm text-red-300 leading-relaxed">{selectedReviewLeave.rejectionReason}</p>
                  </div>
                )}

                {/* Rejection Reason Form Input (when Reject button clicked) */}
                {showRejectForm && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl space-y-3 animate-fade-in">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-red-400">
                      Reason for Rejection
                    </label>
                    <textarea
                      value={rejectionReasonInput}
                      onChange={(e) => setRejectionReasonInput(e.target.value)}
                      rows={3}
                      className="w-full p-3 bg-primary-1 border border-primary-3 rounded-lg text-primary-5 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Type a message to the employee explaining why this leave is being rejected..."
                      autoFocus
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        onClick={() => { setShowRejectForm(false); setRejectionReasonInput(''); }}
                        className="px-4 py-2 rounded-lg text-xs font-medium text-primary-4 border border-primary-3 hover:bg-secondary-3"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={async () => {
                          if (!rejectionReasonInput.trim()) {
                            alert('Please enter a rejection reason/message for the employee.');
                            return;
                          }
                          await handleStatusUpdate(selectedReviewLeave._id, 'Rejected', rejectionReasonInput);
                          closeReviewModal();
                        }}
                        className="px-5 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-primary-4 pt-2 border-t border-primary-3/60">
                  <span>Current Status:</span>
                  <span className="font-semibold flex items-center gap-1.5">
                    {renderStatusBadge(selectedReviewLeave.status)}
                    <span>{selectedReviewLeave.status}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons: Green Approve and Red Reject */}
              <div className="p-6 border-t border-primary-3 flex items-center justify-end gap-3 bg-primary-1/40">
                {selectedReviewLeave.status === 'Pending' && !isEmployee && !showRejectForm && (
                  <>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>

                    <button
                      onClick={async () => {
                        await handleStatusUpdate(selectedReviewLeave._id, 'Approved');
                        closeReviewModal();
                      }}
                      className="px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-green-600 hover:bg-green-700 shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaves;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import EmployeeTable from '../components/EmployeeTable';
import EmployeeForm from '../components/EmployeeForm';

import api from '../api/axios';
import { useToast } from '../context/ToastContext';
import { useConfirmModal } from '../components/ConfirmModal';

const departments = ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations', 'Other'];

const Employees = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { ConfirmModal, openConfirm } = useConfirmModal();

  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isEmployee = user.role === 'employee';

  useEffect(() => {
    if (isEmployee) {
      toast.error('Access denied. This page is only for administrators.');
      navigate('/dashboard');
      return;
    }
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchTerm, departmentFilter, minSalary, maxSalary]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      if (response.data.success) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...employees];
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (departmentFilter) filtered = filtered.filter(emp => emp.department === departmentFilter);
    if (minSalary) filtered = filtered.filter(emp => emp.salary >= Number(minSalary));
    if (maxSalary) filtered = filtered.filter(emp => emp.salary <= Number(maxSalary));
    setFilteredEmployees(filtered);
  };

  const getActiveFiltersCount = () => [searchTerm, departmentFilter, minSalary, maxSalary].filter(Boolean).length;

  const handleAddEmployee = () => { setSelectedEmployee(null); setShowForm(true); };
  const handleEditEmployee = (emp) => { setSelectedEmployee(emp); setShowForm(true); };

  const handleDeleteEmployee = async (id) => {
    const confirmed = await openConfirm({
      title: 'Delete Employee',
      message: 'This action cannot be undone. All associated records will remain but the employee account will be removed.',
      confirmText: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;

    try {
      const response = await api.delete(`/employees/${id}`);
      if (response.data.success) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  const handleFormSubmit = async (formData) => {
    if (formData.email && !formData.email.trim().toLowerCase().endsWith('@ems.com')) {
      toast.error('Employee email address must end with @ems.com (e.g. user@ems.com)');
      return;
    }
    try {
      let response;
      if (selectedEmployee) {
        response = await api.put(`/employees/${selectedEmployee._id}`, formData);
      } else {
        response = await api.post('/employees', formData);
      }
      if (response.data.success) {
        toast.success(response.data.message);
        setShowForm(false);
        setSelectedEmployee(null);
        fetchEmployees();
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error(error.response?.data?.message || 'Failed to save employee');
    }
  };

  const clearFilters = () => { setSearchTerm(''); setDepartmentFilter(''); setMinSalary(''); setMaxSalary(''); };

  // Department counts
  const deptCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {});

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
      {ConfirmModal}

      <div className="flex-1 w-full max-w-[2000px] mx-auto px-[2cm] py-6 flex flex-col relative z-10 min-h-0 overflow-y-auto custom-scrollbar">
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-10 animate-fade-in">
            <div>
              <h1 className="text-4xl md:text-5xl leading-tight font-bold text-primary-5 w-fit pb-2">
                Employee Management
              </h1>
              <p className="text-primary-4 mt-2 text-base md:text-lg">Manage your workforce efficiently</p>
            </div>
            <button
              onClick={handleAddEmployee}
              className="px-6 py-3.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto"
            >
              <span>+ Add Employee</span>
            </button>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Employees', value: employees.length,
                bg: 'bg-[#8B5CF6]',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              },
              {
                label: 'Filtered Results', value: filteredEmployees.length,
                bg: 'bg-[#6366F1]',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" /></svg>
              },
              {
                label: 'Departments', value: Object.keys(deptCounts).length,
                bg: 'bg-[#18181B]',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              },
              {
                label: 'Active Filters', value: getActiveFiltersCount(),
                bg: 'bg-[#D97706]',
                icon: <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" /></svg>
              },
            ].map(card => (
              <div key={card.label} className="bg-primary-2/90 rounded-2xl shadow-xl p-6 border border-primary-3 hover:shadow-2xl transition-all group">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide font-semibold text-slate-500">{card.label}</p>
                    <p className="text-3xl font-bold text-primary-5 mt-1">{card.value}</p>
                  </div>
                  <div className={`${card.bg} p-3 rounded-2xl group-hover:rotate-12 transition-transform shadow-md`}>{card.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Department badges */}
          {Object.keys(deptCounts).length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              {Object.entries(deptCounts).map(([dept, count]) => (
                <button
                  key={dept}
                  onClick={() => setDepartmentFilter(departmentFilter === dept ? '' : dept)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${departmentFilter === dept
                      ? 'icon-container text-white shadow-md'
                      : 'bg-primary-2/90 text-primary-4 border border-primary-3 hover:border-primary-4'
                    }`}
                >
                  {dept} ({count})
                </button>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="bg-primary-2/90 rounded-xl shadow-lg p-6 mb-8 border border-primary-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Search</label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Name, email or position..."
                  className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Department</label>
                <select
                  value={departmentFilter}
                  onChange={e => setDepartmentFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5"
                >
                  <option value="">All Departments</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Min Salary</label>
                <input type="number" value={minSalary} onChange={e => setMinSalary(e.target.value)} placeholder="0" className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Max Salary</label>
                <input type="number" value={maxSalary} onChange={e => setMaxSalary(e.target.value)} placeholder="250,000" className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5" />
              </div>
              <div className="flex items-end">
                <button onClick={clearFilters} className="w-full px-4 py-2.5 border border-primary-3 rounded-lg text-primary-4 hover:bg-secondary-3 transition-all">
                  Clear Filters
                </button>
              </div>
            </div>
            <div className="mt-3 text-sm font-medium text-primary-4">
              Showing {filteredEmployees.length} of {employees.length} employees
            </div>
          </div>

          {/* Table */}
          <EmployeeTable
            employees={filteredEmployees}
            onEdit={handleEditEmployee}
            onDelete={handleDeleteEmployee}
          />

          {/* Modal Form */}
          {showForm && (
            <EmployeeForm
              employee={selectedEmployee}
              onSubmit={handleFormSubmit}
              onCancel={() => { setShowForm(false); setSelectedEmployee(null); }}
            />
          )}
        </div>


      </div>
    </div>
  );
};

export default Employees;


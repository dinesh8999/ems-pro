import { useState, useEffect } from 'react';

const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    salary: '',
    joinDate: ''
  });

  const departments = ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Operations', 'Other'];

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        department: employee.department || '',
        position: employee.position || '',
        salary: employee.salary || '',
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : ''
      });
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">
              {employee ? 'Edit Employee' : 'Add New Employee'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Fill in workforce details to provision employee record</p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Close modal"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10 transition-all font-medium text-sm outline-none"
              placeholder="e.g. John Doe"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">
              Work Email (@ems.com) <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10 transition-all font-medium text-sm outline-none"
              placeholder="e.g. john.doe@ems.com"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0F172A] focus:bg-white focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10 transition-all font-medium text-sm outline-none"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                Position <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10 transition-all font-medium text-sm outline-none"
                placeholder="Software Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                Salary ($) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10 transition-all font-medium text-sm outline-none"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1.5">
                Join Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[#0F172A] focus:bg-white focus:border-[#0D9488] focus:ring-4 focus:ring-[#0D9488]/10 transition-all font-medium text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs sm:text-sm hover:bg-slate-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#0F172A] hover:bg-[#1E293B] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {employee ? 'Update Employee' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-2/95 border border-primary-3 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-primary-5 w-fit pb-1">
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5"
                placeholder="john.doe@company.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
                Department *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
                Position *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5"
                placeholder="Software Engineer"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
                Salary *
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">
                Join Date *
              </label>
              <input
                type="date"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-primary-3 rounded-lg text-primary-4 hover:bg-secondary-3 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                {employee ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmployeeForm;
